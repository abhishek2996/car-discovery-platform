"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UK_CITIES } from "@/lib/constants";

interface DealerFiltersProps {
  brands: { id: string; name: string; slug: string }[];
}

export function DealerFilters({ brands }: DealerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get("city") ?? "";
  const currentBrand = searchParams.get("brand") ?? "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/dealers?${params.toString()}`);
  };

  const clearAll = () => router.push("/dealers");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currentCity} onValueChange={(v) => updateParam("city", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {UK_CITIES.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentBrand} onValueChange={(v) => updateParam("brand", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.slug}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(currentCity || currentBrand) && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
