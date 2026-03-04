"use client";

import { useState, useMemo } from "react";
import { Car, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Normalise YouTube URL to embed URL for iframe. */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1`;
    }
    if (u.hostname === "youtu.be" && u.pathname.length > 1) {
      const id = u.pathname.slice(1).split("/")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
  } catch {
    // ignore
  }
  return null;
}

interface ImageGalleryProps {
  mainImage: string | null;
  brandName: string;
  modelName: string;
  variantImages: string[];
  /** Optional video URL (YouTube or direct MP4). When set, a video tile appears in the strip and plays in the main area. */
  videoUrl?: string | null;
}

type MediaItem = { type: "image"; url: string; index: number } | { type: "video"; url: string };

export function ImageGallery({
  mainImage,
  brandName,
  modelName,
  variantImages,
  videoUrl,
}: ImageGalleryProps) {
  const images = [mainImage, ...variantImages].filter(Boolean) as string[];
  const hasVideo = Boolean(videoUrl?.trim());

  const mediaItems: MediaItem[] = useMemo(() => {
    const list: MediaItem[] = images.map((url, index) => ({ type: "image" as const, url, index }));
    if (hasVideo && videoUrl) {
      list.push({ type: "video", url: videoUrl });
    }
    return list;
  }, [images, hasVideo, videoUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = mediaItems[activeIndex];

  if (mediaItems.length === 0) {
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

  const isVideoActive = active?.type === "video";
  const youtubeEmbed = active?.type === "video" ? getYouTubeEmbedUrl(active.url) : null;

  return (
    <div className="space-y-3">
      {/* Main display: image or video */}
      <div className="group relative overflow-hidden rounded-xl border bg-muted">
        {isVideoActive && active.type === "video" ? (
          <div className="aspect-[16/10] w-full bg-black">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                title={`${brandName} ${modelName} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            ) : (
              <video
                src={active.url}
                controls
                autoPlay
                playsInline
                className="aspect-[16/10] w-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : (
          active?.type === "image" && (
            <img
              src={active.url}
              alt={`${brandName} ${modelName}`}
              className="aspect-[16/10] w-full object-cover"
            />
          )
        )}

        {mediaItems.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() =>
                setActiveIndex((i) => (i === 0 ? mediaItems.length - 1 : i - 1))
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() =>
                setActiveIndex((i) => (i === mediaItems.length - 1 ? 0 : i + 1))
              }
            >
              <ChevronRight className="size-4" />
            </Button>
            <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              {isVideoActive ? "Video" : `${activeIndex + 1}`} / {mediaItems.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip: multiple images + video tile */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => {
          const itemIndex = mediaItems.findIndex(
            (m) => m.type === "image" && m.index === i
          );
          const isActive = itemIndex === activeIndex;
          return (
            <button
              key={`img-${i}`}
              onClick={() => setActiveIndex(itemIndex)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center overflow-hidden rounded-lg border-2 transition-colors",
                isActive
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={img}
                alt={`${brandName} ${modelName} - ${i + 1}`}
                className="size-16 object-cover sm:size-20"
              />
              <span className="w-full bg-muted/80 py-0.5 text-center text-[10px] font-medium text-muted-foreground">
                {i + 1}
              </span>
            </button>
          );
        })}
        {hasVideo && videoUrl && (
          <button
            onClick={() => setActiveIndex(mediaItems.length - 1)}
            className={cn(
              "flex flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border-2 transition-colors bg-muted",
              isVideoActive
                ? "border-primary"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <span className="flex size-16 items-center justify-center sm:size-20">
              <Play className="size-8 fill-current text-muted-foreground" />
            </span>
            <span className="w-full bg-muted/80 py-0.5 text-center text-[10px] font-medium text-muted-foreground">
              Video
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
