"use client";

import { useState } from "react";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  mainImage: string | null;
  brandName: string;
  modelName: string;
  variantImages: string[];
}

export function ImageGallery({ mainImage, brandName, modelName, variantImages }: ImageGalleryProps) {
  const images = [mainImage, ...variantImages].filter(Boolean) as string[];
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border bg-muted">
        <div className="text-center">
          <Car className="mx-auto size-16 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            {brandName} {modelName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-xl border bg-muted">
        <img
          src={images[activeIndex]}
          alt={`${brandName} ${modelName}`}
          className="aspect-[16/10] w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === activeIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={img}
                alt={`${brandName} ${modelName} - ${i + 1}`}
                className="size-16 object-cover sm:size-20"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
