"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  folder: string;
  maxFiles?: number;
  label?: string;
}

export function MultiImageUploader({
  value,
  onChange,
  onUploadError,
  folder,
  maxFiles = 10,
  label = "Upload images",
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = "Invalid type. Use JPEG, PNG or WebP.";
        setError(msg);
        onUploadError?.(msg);
        return;
      }
      if (file.size > MAX_SIZE) {
        const msg = "File too large. Max 5MB.";
        setError(msg);
        onUploadError?.(msg);
        return;
      }
      if (value.length >= maxFiles) {
        const msg = `Maximum ${maxFiles} images allowed.`;
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
          onChange([...value, result.url]);
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
    [folder, value, maxFiles, onChange, onUploadError]
  );

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

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-medium">{label}</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={url}
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
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
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
          ))}
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
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
                  Drop images here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG or WebP, max 5MB. {maxFiles - value.length} remaining.
                </span>
              </>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
