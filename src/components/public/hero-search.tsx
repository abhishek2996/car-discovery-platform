"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BODY_TYPE_LABELS,
  BUDGET_RANGES,
} from "@/lib/constants";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export function HeroSearch({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [budget, setBudget] = useState("");
  const [bodyType, setBodyType] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (budget) {
      const range = BUDGET_RANGES[Number(budget)];
      if (range) {
        params.set("minPrice", String(range.min));
        if (range.max !== undefined) params.set("maxPrice", String(range.max));
      }
    }
    if (bodyType) params.set("bodyType", bodyType);
    router.push(`/new-cars?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02)_0%,transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your perfect{" "}
            <span className="text-primary">new car</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Compare prices, specs, and reviews across hundreds of models from
            top brands in the UK.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-card p-4 shadow-lg sm:p-6"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Brand
              </label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Budget
              </label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
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

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Body Type
              </label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger>
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
          </div>

          <Button type="submit" size="lg" className="mt-4 w-full">
            <Search className="size-4" />
            Search Cars
          </Button>
        </form>

        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Popular:</span>
          {["SUV", "Electric", "Under £30k", "Automatic"].map((tag) => {
            const params = new URLSearchParams();
            if (tag === "SUV") params.set("bodyType", "SUV");
            if (tag === "Electric") params.set("fuel", "ELECTRIC");
            if (tag === "Under £30k") params.set("maxPrice", "30000");
            if (tag === "Automatic") params.set("transmission", "AUTOMATIC");
            return (
              <a
                key={tag}
                href={`/new-cars?${params.toString()}`}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {tag}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
