"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BODY_TYPE_LABELS, BUDGET_RANGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string | null;
  benefitText: string | null;
  dealerName: string | null;
  locationsJson: string | null;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
}

const DEFAULT_SLIDE: HeroSlideData = {
  id: "default",
  title: "Get Your Dream Car",
  subtitle: "from our trusted dealer partners",
  benefitText: "Get Benefits Up to £5,000*",
  dealerName: "CarDiscovery Partners",
  locationsJson: JSON.stringify([
    { name: "London", phone: "020 7123 4567" },
    { name: "Birmingham", phone: "0121 456 7890" },
    { name: "Manchester", phone: "0161 234 5678" },
  ]),
  imageUrl: null,
  sortOrder: 0,
  active: true,
};

function parseLocations(json: string | null): { name: string; phone: string }[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json) as unknown;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const AUTOPLAY_MS = 20 * 1000; // 20 seconds per slide

export function HomeHero({ brands, slides }: { brands: Brand[]; slides: HeroSlideData[] }) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"budget" | "brand">("budget");
  const [budget, setBudget] = useState("");
  const [brand, setBrand] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const list = slides.length > 0 ? slides : [DEFAULT_SLIDE];

  const goTo = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      const next = index < 0 ? list.length - 1 : index >= list.length ? 0 : index;
      return next;
    });
  }, [list.length]);

  useEffect(() => {
    const t = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [currentIndex, goTo]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchType === "budget" && budget) {
      const range = BUDGET_RANGES[Number(budget)];
      if (range) {
        params.set("minPrice", String(range.min));
        if (range.max !== undefined) params.set("maxPrice", String(range.max));
      }
    }
    if (searchType === "brand" && brand) params.set("brand", brand);
    if (bodyType) params.set("bodyType", bodyType);
    router.push(`/new-cars?${params.toString()}`);
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-900"
      aria-label="Hero slider"
    >
      {/* Full-bleed background layer so image extends behind search box */}
      <div className="absolute inset-0">
        {list.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              i === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
            )}
          >
            {s.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.imageUrl})` }}
              />
            ) : null}
            <div
              className={cn(
                "absolute inset-0",
                !s.imageUrl && "bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900"
              )}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_20%,rgba(120,119,198,0.2),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[420px] w-full flex-col lg:flex-row">
        {/* ── Left: Search box (semi-transparent so image shows through) ─ */}
        <div className="relative flex shrink-0 items-start justify-center px-4 py-6 lg:min-h-[420px] lg:w-[380px] lg:max-w-[380px] lg:justify-end lg:pl-8 lg:pr-0 lg:pt-8">
          <div className="w-full max-w-[380px]">
            <div className="rounded-2xl border border-white/30 bg-slate-500/45 p-5 shadow-xl backdrop-blur-md sm:p-6">
              <h2 className="text-xl font-bold tracking-tight text-white">Find your right car</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Search by</Label>
                  <div className="flex gap-0 rounded-lg border border-white/30 p-0.5 bg-white/10">
                    <button
                      type="button"
                      onClick={() => setSearchType("budget")}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        searchType === "budget"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/20 text-white/90 hover:bg-white/30"
                      )}
                    >
                      By Budget
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType("brand")}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        searchType === "brand"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/20 text-white/90 hover:bg-white/30"
                      )}
                    >
                      By Brand
                    </button>
                  </div>
                </div>

                {searchType === "budget" ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-white">Select Budget</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="w-full bg-slate-400/50 text-white border-white/30 [&_svg]:text-white/90 data-[placeholder]:text-white/90 placeholder:text-white/90">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any__">Any budget</SelectItem>
                        {BUDGET_RANGES.map((r, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs text-white">Select Brand</Label>
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger className="w-full bg-slate-400/50 text-white border-white/30 [&_svg]:text-white/90 data-[placeholder]:text-white/90 placeholder:text-white/90">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All brands</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b.slug} value={b.slug}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-white">Vehicle type</Label>
                  <Select value={bodyType} onValueChange={setBodyType}>
                    <SelectTrigger className="w-full bg-slate-400/50 text-white border-white/30 [&_svg]:text-white/90 data-[placeholder]:text-white/90 placeholder:text-white/90">
                      <SelectValue placeholder="All vehicle types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All vehicle types</SelectItem>
                      {Object.entries(BODY_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" size="lg">
                  <Search className="size-4" />
                  Search
                </Button>
                <Link
                  href="/new-cars"
                  className="block text-center text-sm text-muted-foreground hover:text-primary"
                >
                  Advanced Search →
                </Link>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right: Slider (photo + “Get your dream car” / benefits) ─ */}
        <div className="relative min-h-[380px] flex-1 lg:min-h-[420px]">
          {list.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <div className="relative flex h-full min-h-[380px] flex-col justify-between p-6 sm:p-8 lg:min-h-[420px]">
                <div className="absolute right-4 top-4 text-right">
                  <span className="text-lg font-semibold tracking-wider text-white/90">CarDiscovery</span>
                </div>
                <div className="max-w-lg pt-8">
                  <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p className="mt-1 text-white/90">{s.subtitle}</p>
                  )}
                </div>
                <div className="mt-4">
                  {s.benefitText && (
                    <p className="text-lg font-bold text-white sm:text-xl">{s.benefitText}</p>
                  )}
                  {s.dealerName && (
                    <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/90">
                      {s.dealerName}
                    </p>
                  )}
                  {parseLocations(s.locationsJson).length > 0 && (
                    <div className="mt-2 grid gap-1 text-sm text-white/80 sm:grid-cols-2">
                      {parseLocations(s.locationsJson).map((loc) => (
                        <span key={loc.name}>
                          {loc.name} {loc.phone}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Slider controls (in right panel only) */}
          {list.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 sm:left-4"
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 sm:right-4"
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Next slide"
              >
                <ChevronRight className="size-5" />
              </Button>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {list.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      idx === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                    )}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
