"use client";

import { Button } from "@/components/ui/button";
import { UK_CITIES } from "@/lib/constants";

interface CityFilterFormProps {
  statusParam?: string;
  searchParam?: string;
  cityParam?: string;
}

export function CityFilterForm({
  statusParam,
  searchParam,
  cityParam,
}: CityFilterFormProps) {
  return (
    <form action="/admin/dealers" method="get" className="flex items-center gap-2">
      {statusParam && (
        <input type="hidden" name="status" value={statusParam} />
      )}
      {searchParam && (
        <input type="hidden" name="search" value={searchParam} />
      )}
      <select
        name="city"
        defaultValue={cityParam ?? ""}
        className="h-8 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">All cities</option>
        {UK_CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="secondary">
        Filter
      </Button>
    </form>
  );
}
