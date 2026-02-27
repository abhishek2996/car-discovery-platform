"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BODY_TYPE_LABELS,
  BUDGET_RANGES,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  SEATING_OPTIONS,
} from "@/lib/constants";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface CarFiltersProps {
  brands: Brand[];
}

function useFilterUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "__all__" && value !== "__any__") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams, startTransition],
  );

  const clear = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname, startTransition]);

  return { searchParams, update, clear };
}

function FilterControls({ brands }: CarFiltersProps) {
  const { searchParams, update, clear } = useFilterUpdater();

  const currentBrand = searchParams.get("brand") ?? "";
  const currentBodyType = searchParams.get("bodyType") ?? "";
  const currentFuel = searchParams.get("fuel") ?? "";
  const currentTransmission = searchParams.get("transmission") ?? "";
  const currentSeating = searchParams.get("seating") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const currentBudgetIdx = BUDGET_RANGES.findIndex(
    (r) =>
      String(r.min) === minPrice &&
      (r.max === undefined ? !maxPrice : String(r.max) === maxPrice),
  );

  const hasFilters = [
    currentBrand,
    currentBodyType,
    currentFuel,
    currentTransmission,
    currentSeating,
    minPrice,
    maxPrice,
  ].some(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="xs" onClick={clear}>
            <X className="size-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Brand</Label>
          <Select
            value={currentBrand || "__all__"}
            onValueChange={(v) => update("brand", v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.slug} value={b.slug}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Budget</Label>
          <Select
            value={currentBudgetIdx >= 0 ? String(currentBudgetIdx) : "__any__"}
            onValueChange={(v) => {
              if (v === "__any__") {
                update("minPrice", null);
                update("maxPrice", null);
              } else {
                const range = BUDGET_RANGES[Number(v)];
                if (range) {
                  const params = new URLSearchParams(
                    window.location.search,
                  );
                  params.set("minPrice", String(range.min));
                  if (range.max !== undefined) {
                    params.set("maxPrice", String(range.max));
                  } else {
                    params.delete("maxPrice");
                  }
                  params.delete("page");
                  window.history.pushState(null, "", `?${params.toString()}`);
                  window.location.reload();
                }
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any Budget</SelectItem>
              {BUDGET_RANGES.map((r, i) => (
                <SelectItem key={i} value={String(i)}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Body Type</Label>
          <Select
            value={currentBodyType || "__all__"}
            onValueChange={(v) => update("bodyType", v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {Object.entries(BODY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <Label className="text-xs">Fuel Type</Label>
          <Select
            value={currentFuel || "__all__"}
            onValueChange={(v) => update("fuel", v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Fuels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Fuels</SelectItem>
              {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Transmission</Label>
          <Select
            value={currentTransmission || "__all__"}
            onValueChange={(v) => update("transmission", v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {Object.entries(TRANSMISSION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Seating</Label>
          <Select
            value={currentSeating || "__all__"}
            onValueChange={(v) => update("seating", v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any</SelectItem>
              {SEATING_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} seats
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function DesktopFilters({ brands }: CarFiltersProps) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 rounded-xl border bg-card p-4">
        <FilterControls brands={brands} />
      </div>
    </aside>
  );
}

export function MobileFilters({ brands }: CarFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="size-3.5" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterControls brands={brands} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
