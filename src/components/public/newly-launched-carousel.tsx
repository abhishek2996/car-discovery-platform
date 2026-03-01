"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/public/car-card";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 10_000;

type Car = {
  id: string;
  name: string;
  slug: string;
  bodyType: string | null;
  minPrice: string | number | null;
  maxPrice: string | number | null;
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

export function NewlyLaunchedCarousel({ cars }: { cars: Car[] }) {
  const [index, setIndex] = useState(0);
  const count = cars.length;

  const goTo = useCallback(
    (next: number) => {
      if (count <= 0) return;
      setIndex((i) => {
        const n = next < 0 ? count - 1 : next >= count ? 0 : next;
        return n;
      });
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => goTo(index + 1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(t);
  }, [index, count, goTo]);

  if (count === 0) return null;

  return (
    <section className="w-full border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            Newly launched
          </h2>
          {count > 1 && (
            <div className="flex items-center gap-1 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(index - 1)}
                aria-label="Previous"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[3ch] text-center text-sm text-muted-foreground">
                {index + 1} / {count}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goTo(index + 1)}
                aria-label="Next"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Desktop: 4 cards in a row. Mobile: horizontal scroll, one visible, auto every 10s */}
        <div className="relative overflow-hidden">
          <div
            className={cn(
              "flex transition-transform duration-500 ease-out lg:!translate-x-0 lg:transition-none",
            )}
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >
            {cars.map((car) => (
              <div
                key={car.id}
                className="w-full shrink-0 px-1 sm:px-2 lg:w-1/4 lg:shrink lg:px-2"
              >
                <CarCard
                  car={{
                    ...car,
                    minPrice: car.minPrice ? String(car.minPrice) : null,
                    maxPrice: car.maxPrice ? String(car.maxPrice) : null,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="mt-4 flex justify-center gap-1.5 lg:hidden">
            {cars.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === index ? "bg-primary" : "bg-muted-foreground/40 hover:bg-muted-foreground/60",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
