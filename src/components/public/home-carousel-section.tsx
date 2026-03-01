"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLL_AMOUNT = 296; // ~card width + gap, for consistent scroll

function useScrollState(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, scrollRef]);

  return { canScrollLeft, canScrollRight, update };
}

export interface CarouselTab {
  label: string;
  href: string;
  active?: boolean;
}

interface HomeCarouselSectionProps {
  title: string;
  viewAllHref: string;
  viewAllLabel: string;
  tabs?: CarouselTab[];
  children: React.ReactNode;
  className?: string;
}

export function HomeCarouselSection({
  title,
  viewAllHref,
  viewAllLabel,
  tabs,
  children,
  className,
}: HomeCarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight } = useScrollState(scrollRef);

  function scrollLeft() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  }

  function scrollRight() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  }

  return (
    <section
      className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", className)}
    >
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

      {tabs && tabs.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                tab.active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 hover:border-primary hover:bg-primary/10 hover:text-primary"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {/* Carousel row: left arrow + scrollable content + right arrow */}
      <div className="mt-4 flex items-stretch gap-4">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={scrollLeft}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted",
              !canScrollLeft && "invisible"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5 text-muted-foreground" />
          </button>
        </div>
        <div className="relative flex-1 min-w-0">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 pl-0 pr-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {children}
          </div>
          {/* Light gradient only at edge so last card stays fully visible; arrow is main affordance */}
          <div className="pointer-events-none absolute right-0 top-0 flex h-full w-8 items-center justify-end bg-gradient-to-l from-background/80 to-transparent" />
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={scrollRight}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted",
              !canScrollRight && "invisible"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* View All link only (no duplicate arrow) */}
      <div className="mt-3 flex items-center justify-between">
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {viewAllLabel}
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
