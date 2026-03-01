"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { X, ImagePlus } from "lucide-react";
import Image from "next/image";
import type { AppFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploadProps {
  endpoint: keyof AppFileRouter;
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export function ImageUpload({
  endpoint,
  value,
  onChange,
  maxFiles = 10,
  label = "Upload images",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const removeImage = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium">{label}</p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url) => (
            <div
              key={url}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border"
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxFiles && (
        <UploadDropzone
          endpoint={endpoint}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res) {
              const newUrls = res.map((file) => (file as unknown as { url: string }).url);
              onChange([...value, ...newUrls].slice(0, maxFiles));
            }
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            console.error("[upload]", error);
          }}
          config={{ mode: "auto" }}
          appearance={{
            container:
              "border-dashed border-2 border-muted-foreground/25 rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors",
            label: "text-muted-foreground text-sm",
            allowedContent: "text-xs text-muted-foreground",
            button: "ut-uploading:cursor-not-allowed bg-primary text-primary-foreground text-sm rounded-md px-4 py-2",
          }}
          content={{
            label: isUploading ? "Uploading..." : "Drop images here or click to browse",
            allowedContent: `Images up to 4MB. ${maxFiles - value.length} remaining.`,
          }}
        />
      )}
    </div>
  );
}

interface SingleImageUploadProps {
  endpoint: keyof AppFileRouter;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function SingleImageUpload({
  endpoint,
  value,
  onChange,
  label = "Upload image",
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium">{label}</p>
      )}

      {value ? (
        <div className="group relative h-32 w-32 overflow-hidden rounded-lg border">
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <UploadDropzone
          endpoint={endpoint}
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res?.[0]) {
              onChange((res[0] as unknown as { url: string }).url);
            }
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            console.error("[upload]", error);
          }}
          config={{ mode: "auto" }}
          appearance={{
            container:
              "border-dashed border-2 border-muted-foreground/25 rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors max-w-xs",
            label: "text-muted-foreground text-sm",
            allowedContent: "text-xs text-muted-foreground",
            button: "ut-uploading:cursor-not-allowed bg-primary text-primary-foreground text-sm rounded-md px-4 py-2",
          }}
          content={{
            label: isUploading ? "Uploading..." : "Drop image here or click to browse",
            allowedContent: "Image up to 4MB",
          }}
        />
      )}
    </div>
  );
}
