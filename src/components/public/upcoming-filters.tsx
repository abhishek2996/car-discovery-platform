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
import { BODY_TYPE_LABELS } from "@/lib/constants";

interface UpcomingFiltersProps {
  brands: { id: string; name: string; slug: string }[];
}

export function UpcomingFilters({ brands }: UpcomingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get("brand") ?? "";
  const currentBody = searchParams.get("bodyType") ?? "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/upcoming?${params.toString()}`);
  };

  const clearAll = () => router.push("/upcoming");

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      <Select value={currentBody} onValueChange={(v) => updateParam("bodyType", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Body Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Body Types</SelectItem>
          {Object.entries(BODY_TYPE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(currentBrand || currentBody) && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
