"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Link as LinkIcon, Upload, X } from "lucide-react";
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

export interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  folder: string;
  maxFiles?: number;
  label?: string;
  value?: string;
  /** Allow video in addition to images (upload + URL) */
  allowVideo?: boolean;
}

export function ImageUploader({
  onUploadComplete,
  onUploadError,
  folder,
  label = "Upload image",
  value: existingUrl,
  allowVideo = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl ?? existingUrl ?? null;
  const showVideo = displayUrl && isVideoUrl(displayUrl);

  const validateAndUpload = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = allowVideo
          ? "Invalid type. Use JPEG, PNG, WebP, or MP4/WebM for video."
          : "Invalid type. Use JPEG, PNG or WebP.";
        setError(msg);
        onUploadError?.(msg);
        return;
      }
      const maxSize = ALLOWED_VIDEO_TYPES.includes(file.type) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const msg = ALLOWED_VIDEO_TYPES.includes(file.type)
          ? "Video too large. Max 50MB."
          : "File too large. Max 5MB.";
        setError(msg);
        onUploadError?.(msg);
        return;
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
          setPreviewUrl(result.url);
          onUploadComplete(result.url);
        } else {
          const msg = result.error ?? "Upload failed";
          setError(msg);
          onUploadError?.(msg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        onUploadError?.(msg);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, onUploadComplete, onUploadError, allowVideo]
  );

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
    setUrlError(null);
    setUrlInput("");
    setPreviewUrl(raw);
    onUploadComplete(raw);
  }, [urlInput, onUploadComplete]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const accept = allowVideo
    ? ".jpg,.jpeg,.png,.webp,.mp4,.webm,image/jpeg,image/png,image/webp,video/mp4,video/webm"
    : ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label}</p>}
      {displayUrl ? (
        <div className="group relative h-32 w-full max-w-xs overflow-hidden rounded-lg border">
          {showVideo ? (
            <video
              src={displayUrl}
              controls
              className="h-full w-full object-cover"
              preload="metadata"
            />
          ) : (
            <Image src={displayUrl} alt="" fill className="object-cover" sizes="320px" unoptimized />
          )}
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onUploadComplete("");
            }}
            className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => inputRef.current?.click()}
            className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-primary/50 ${
              uploading ? "pointer-events-none opacity-70" : ""
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drop file here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  {allowVideo ? "Images: JPEG, PNG, WebP (5MB). Video: MP4, WebM (50MB)" : "JPEG, PNG or WebP, max 5MB"}
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
