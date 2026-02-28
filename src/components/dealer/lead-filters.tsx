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

export function LeadFiltersBar() {
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
        router.push(`/dealer/leads?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search buyer or car..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => {
          const timeout = setTimeout(() => updateParam("search", e.target.value), 300);
          return () => clearTimeout(timeout);
        }}
        className="max-w-xs"
      />

      <Select
        defaultValue={searchParams.get("type") ?? "all"}
        onValueChange={(v) => updateParam("type", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="ENQUIRY">Enquiry</SelectItem>
          <SelectItem value="TEST_DRIVE">Test Drive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onValueChange={(v) => updateParam("sort", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>

      {isPending && (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  );
}
