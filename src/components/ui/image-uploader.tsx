"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: string) => void;
  folder: string;
  maxFiles?: number;
  label?: string;
  value?: string;
}

export function ImageUploader({
  onUploadComplete,
  onUploadError,
  folder,
  label = "Upload image",
  value: existingUrl,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl ?? existingUrl ?? null;

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
    [folder, onUploadComplete, onUploadError]
  );

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
      {displayUrl ? (
        <div className="group relative h-32 w-32 overflow-hidden rounded-lg border">
          <Image src={displayUrl} alt="" fill className="object-cover" sizes="128px" unoptimized />
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
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
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
                  Drop image here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">JPEG, PNG or WebP, max 5MB</span>
              </>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
