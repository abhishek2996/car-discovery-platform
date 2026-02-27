import { Suspense } from "react";
import { Car } from "lucide-react";
import { CarCard } from "@/components/public/car-card";
import { DesktopFilters, MobileFilters } from "@/components/public/car-filters";
import { CarSort } from "@/components/public/car-sort";
import { PaginationControls } from "@/components/public/pagination-controls";
import { getAllBrands } from "@/lib/data/brands";
import { searchCars } from "@/lib/data/cars";
import { parseSearchParams } from "@/lib/validations/car-search";
import { BODY_TYPE_LABELS } from "@/lib/constants";

export const metadata = {
  title: "New Cars – Browse & Compare | CarDiscovery",
  description:
    "Search and filter new cars by brand, budget, body type, fuel, and more. Compare prices and specs across hundreds of models.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <Car className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No cars found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try adjusting your filters or search terms to find what you&apos;re
        looking for.
      </p>
    </div>
  );
}

function ActiveFilterChips({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const chips: { label: string; key: string }[] = [];
  if (typeof params.brand === "string")
    chips.push({ label: `Brand: ${params.brand}`, key: "brand" });
  if (typeof params.bodyType === "string")
    chips.push({
      label: BODY_TYPE_LABELS[params.bodyType] ?? params.bodyType,
      key: "bodyType",
    });
  if (typeof params.q === "string")
    chips.push({ label: `"${params.q}"`, key: "q" });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c.key}
          className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

export default async function NewCarsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseSearchParams(
    rawParams as Record<string, string | string[] | undefined>,
  );
  const [brands, result] = await Promise.all([
    getAllBrands(),
    searchCars(filters),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Cars</h1>
        <p className="mt-1 text-muted-foreground">
          Showing {result.total.toLocaleString()}{" "}
          {result.total === 1 ? "car" : "cars"}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <Suspense fallback={null}>
          <DesktopFilters brands={brands} />
        </Suspense>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <MobileFilters brands={brands} />
              </Suspense>
              <ActiveFilterChips params={rawParams} />
            </div>
            <Suspense fallback={null}>
              <CarSort />
            </Suspense>
          </div>

          {/* Results grid */}
          {result.cars.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={{
                      ...car,
                      minPrice: car.minPrice ? String(car.minPrice) : null,
                      maxPrice: car.maxPrice ? String(car.maxPrice) : null,
                    }}
                  />
                ))}
              </div>
              <Suspense fallback={null}>
                <PaginationControls
                  page={result.page}
                  totalPages={result.totalPages}
                  total={result.total}
                />
              </Suspense>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
