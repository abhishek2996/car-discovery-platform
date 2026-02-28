"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useTransition } from "react";

export function InventoryFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/dealer/inventory?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search inventory..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => {
          const timeout = setTimeout(() => updateParam("search", e.target.value), 300);
          return () => clearTimeout(timeout);
        }}
        className="max-w-xs"
      />

      <Select
        defaultValue={searchParams.get("stockStatus") ?? "all"}
        onValueChange={(v) => updateParam("stockStatus", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Stock status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stock</SelectItem>
          <SelectItem value="IN_STOCK">In stock</SelectItem>
          <SelectItem value="OUT_OF_STOCK">Out of stock</SelectItem>
          <SelectItem value="EXPECTED">Expected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("visibility") ?? "all"}
        onValueChange={(v) => updateParam("visibility", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="VISIBLE">Visible</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="HIDDEN">Hidden</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("sort") ?? "updated"}
        onValueChange={(v) => updateParam("sort", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Last updated</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>

      {isPending && (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  );
}
