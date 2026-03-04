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
  /** Allow video in addition to images (upload + URL) */
  allowVideo?: boolean;
}

export function ImageUpload({
  endpoint,
  value,
  onChange,
  maxFiles = 10,
  label = "Upload images",
  allowVideo = false,
}: ImageUploadProps) {
  const folder = ENDPOINT_TO_FOLDER[endpoint] ?? endpoint;
  return (
    <MultiImageUploader
      folder={folder}
      value={value}
      onChange={onChange}
      maxFiles={maxFiles}
      label={label}
      allowVideo={allowVideo}
    />
  );
}

interface SingleImageUploadProps {
  endpoint: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Allow video in addition to image (e.g. for hero) */
  allowVideo?: boolean;
}

export function SingleImageUpload({
  endpoint,
  value,
  onChange,
  label = "Upload image",
  allowVideo = false,
}: SingleImageUploadProps) {
  const folder = ENDPOINT_TO_FOLDER[endpoint] ?? endpoint;
  return (
    <ImageUploader
      folder={folder}
      value={value}
      onUploadComplete={onChange}
      label={label}
      allowVideo={allowVideo}
    />
  );
}
