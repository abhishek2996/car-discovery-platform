"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Link as LinkIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

function isVideoUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return /\.(mp4|webm|mov)(\?|$)/i.test(path) || url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  } catch {
    return false;
  }
}

function isValidMediaUrl(url: string): boolean {
  try {
    new URL(url);
    const path = new URL(url).pathname.toLowerCase();
    const hasImageExt = /\.(jpe?g|png|webp|gif)(\?|$)/i.test(path);
    const hasVideoExt = /\.(mp4|webm|mov)(\?|$)/i.test(path);
    const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(url);
    return hasImageExt || hasVideoExt || isEmbed;
  } catch {
    return false;
  }
}

export interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  folder: string;
  maxFiles?: number;
  label?: string;
  /** Allow video in addition to images (upload + URL) */
  allowVideo?: boolean;
}

export function MultiImageUploader({
  value,
  onChange,
  onUploadError,
  folder,
  maxFiles = 10,
  label = "Upload images",
  allowVideo = false,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddByUrl = useCallback(() => {
    const raw = urlInput.trim();
    if (!raw) {
      setUrlError("Enter an image or video URL.");
      return;
    }
    if (!isValidMediaUrl(raw)) {
      setUrlError("Enter a valid image or video URL (e.g. .jpg, .png, .mp4, or YouTube/Vimeo link).");
      return;
    }
    if (value.length >= maxFiles) {
      setUrlError(`Maximum ${maxFiles} items allowed.`);
      return;
    }
    setUrlError(null);
    setUrlInput("");
    onChange([...value, raw]);
  }, [urlInput, value, maxFiles, onChange]);

  const removeImage = useCallback(
    async (url: string, index: number) => {
      try {
        await fetch(`/api/upload/delete?url=${encodeURIComponent(url)}`, { method: "DELETE" });
      } catch {
        // continue to remove from UI
      }
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fileList = Array.from(files);
    e.target.value = "";
    uploadFilesInOrder(fileList);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    const fileList = Array.from(files);
    uploadFilesInOrder(fileList);
  };

  /** Upload multiple files one after another and append each URL to value. */
  const uploadFilesInOrder = useCallback(
    async (fileList: File[]) => {
      let currentValue = value;
      for (const file of fileList) {
        if (currentValue.length >= maxFiles) break;
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(allowVideo ? "Invalid type. Use JPEG, PNG, WebP, or MP4/WebM." : "Invalid type. Use JPEG, PNG or WebP.");
          onUploadError?.(allowVideo ? "Invalid type. Use JPEG, PNG, WebP, or MP4/WebM." : "Invalid type. Use JPEG, PNG or WebP.");
          continue;
        }
        const maxSize = ALLOWED_VIDEO_TYPES.includes(file.type) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
          setError(ALLOWED_VIDEO_TYPES.includes(file.type) ? "Video too large. Max 50MB." : "File too large. Max 5MB.");
          onUploadError?.(ALLOWED_VIDEO_TYPES.includes(file.type) ? "Video too large. Max 50MB." : "File too large. Max 5MB.");
          continue;
        }
        setError(null);
        setUploading(true);
        setProgress(0);
        try {
          const formData = new FormData();
          formData.set("file", file);
          formData.set("folder", folder);
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload");
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          });
          const result = await new Promise<{ success: boolean; url?: string; error?: string }>(
            (resolve, reject) => {
              xhr.onload = () => {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch {
                  reject(new Error("Invalid response"));
                }
              };
              xhr.onerror = () => reject(new Error("Network error"));
              xhr.send(formData);
            }
          );
          if (result.success && result.url) {
            currentValue = [...currentValue, result.url];
            onChange(currentValue);
          } else {
            const msg = result.error ?? "Upload failed";
            setError(msg);
            onUploadError?.(msg);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setError(msg);
          onUploadError?.(msg);
        }
      }
      setUploading(false);
      setProgress(0);
    },
    [folder, value, maxFiles, onChange, onUploadError, allowVideo]
  );

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const accept = allowVideo
    ? ".jpg,.jpeg,.png,.webp,.mp4,.webm,image/jpeg,image/png,image/webp,video/mp4,video/webm"
    : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label}</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => {
            const isVideo = isVideoUrl(url);
            return (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    moveImage(draggedIndex, index);
                    setDraggedIndex(null);
                  }
                }}
                className={`group relative flex h-24 w-24 cursor-grab items-center justify-center overflow-hidden rounded-lg border bg-muted active:cursor-grabbing ${
                  draggedIndex === index ? "ring-2 ring-primary" : ""
                }`}
              >
                {isVideo ? (
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(url, index);
                    }}
                    className="rounded-full bg-destructive p-1.5 text-destructive-foreground"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="cursor-grab text-white" title="Drag to reorder">
                    <GripVertical className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {value.length < maxFiles && (
        <>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => inputRef.current?.click()}
            className={`flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-primary/50 ${
              uploading ? "pointer-events-none opacity-70" : ""
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drop files here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  {allowVideo
                    ? "Images (5MB) or video (50MB). "
                    : ""}
                  {maxFiles - value.length} remaining.
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Input
                type="url"
                placeholder="Or paste image/video URL..."
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddByUrl())}
                className="h-9"
              />
              {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddByUrl} className="shrink-0">
              <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
              Add URL
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
