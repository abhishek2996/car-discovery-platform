"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarCard } from "@/components/public/car-card";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 280;
const GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export type MostSearchedCar = {
  id: string;
  name: string;
  slug: string;
  bodyType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string | null;
  brand: { name: string; slug: string };
  variants: {
    id: string;
    name: string;
    fuelType: string | null;
    transmission: string | null;
    seating: number | null;
  }[];
  _count: { variants: number };
};

export type TabKey = string;

export type MostSearchedTab = { key: TabKey; label: string };

interface MostSearchedCarouselProps {
  tabs: MostSearchedTab[];
  carsByTab: Record<string, MostSearchedCar[]>;
}

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

export function MostSearchedCarousel({ tabs, carsByTab }: MostSearchedCarouselProps) {
  const firstKey = tabs[0]?.key ?? "SUV";
  const [activeTab, setActiveTab] = useState<TabKey>(firstKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, update } = useScrollState(scrollRef);

  const cars = carsByTab[activeTab] ?? [];
  const viewAllHref = "/new-cars";
  const viewAllLabel = "View All Most Searched Cars";

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

  useEffect(() => {
    update();
  }, [activeTab, update]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight">
        The most searched cars
      </h2>

      {/* Category tabs: horizontal scroll slider - scroll to see all categories */}
      <div className="mt-3 border-b border-border">
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto pb-0 scroll-smooth scrollbar-thin [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors -mb-px whitespace-nowrap",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Fade on right to show more tabs */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>

      {/* Car cards + left/right arrows */}
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
        <div
          ref={scrollRef}
          className="flex flex-1 gap-4 overflow-x-auto scroll-smooth pb-2 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex shrink-0 flex-col"
              style={{ width: CARD_WIDTH, minHeight: 360 }}
            >
              <CarCard
                car={{
                  ...car,
                  minPrice: car.minPrice != null ? String(car.minPrice) : null,
                  maxPrice: car.maxPrice != null ? String(car.maxPrice) : null,
                }}
                showGetOffersButton
              />
            </div>
          ))}
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

      {/* View All */}
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
