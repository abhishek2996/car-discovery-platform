"use client";

import { ImageUploader } from "@/components/ui/image-uploader";
import { MultiImageUploader } from "@/components/ui/multi-image-uploader";

const ENDPOINT_TO_FOLDER: Record<string, string> = {
  brandLogo: "brands",
  articleHero: "articles",
  dealerMedia: "dealers",
  carModelGallery: "models",
  carImage: "inventory",
};

interface ImageUploadProps {
  endpoint: string;
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
  const folder = ENDPOINT_TO_FOLDER[endpoint] ?? endpoint;
  return (
    <MultiImageUploader
      folder={folder}
      value={value}
      onChange={onChange}
      maxFiles={maxFiles}
      label={label}
    />
  );
}

interface SingleImageUploadProps {
  endpoint: string;
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
  const folder = ENDPOINT_TO_FOLDER[endpoint] ?? endpoint;
  return (
    <ImageUploader
      folder={folder}
      value={value}
      onUploadComplete={onChange}
      label={label}
      maxFiles={1}
    />
  );
}
