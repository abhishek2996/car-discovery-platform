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

const ARTICLE_TYPES = [
  { value: "NEWS", label: "News" },
  { value: "EXPERT_REVIEW", label: "Expert Reviews" },
  { value: "FEATURE", label: "Features" },
  { value: "COMPARISON", label: "Comparisons" },
];

export function ReviewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") ?? "";

  const updateType = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    params.delete("page");
    router.push(`/reviews?${params.toString()}`);
  };

  const clearAll = () => router.push("/reviews");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currentType} onValueChange={updateType}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {ARTICLE_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentType && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
