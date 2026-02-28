import Link from "next/link";
import { Calendar, Car, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchUpcomingCars } from "@/lib/data/upcoming";
import { getAllBrands } from "@/lib/data/brands";
import { BODY_TYPE_LABELS } from "@/lib/constants";
import { PaginationControls } from "@/components/public/pagination-controls";
import { UpcomingFilters } from "@/components/public/upcoming-filters";

export const metadata = {
  title: "Upcoming Cars – New Launches in the UK | CarDiscovery",
  description: "Browse upcoming car launches in the UK. Get details on expected launch dates, estimated prices, and key highlights.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UpcomingCarsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const brand = typeof raw.brand === "string" ? raw.brand : undefined;
  const bodyType = typeof raw.bodyType === "string" ? raw.bodyType : undefined;
  const page = typeof raw.page === "string" ? Math.max(1, parseInt(raw.page, 10) || 1) : 1;

  const [result, brands] = await Promise.all([
    searchUpcomingCars({ brand, bodyType, page }),
    getAllBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Cars</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total} upcoming {result.total === 1 ? "car" : "cars"} expected in the UK
        </p>
      </div>

      <UpcomingFilters brands={brands} />

      {result.cars.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.cars.map((car) => (
              <Link key={car.id} href={`/upcoming/${car.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                  <div className="relative aspect-[16/10] bg-muted">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={car.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car className="size-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute right-2 top-2 text-[10px]">
                      Upcoming
                    </Badge>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <p className="text-xs font-medium text-muted-foreground">{car.brand.name}</p>
                    <h3 className="text-base font-semibold leading-tight group-hover:text-primary">
                      {car.name}
                    </h3>
                    {car.estimatedPrice && (
                      <p className="text-sm font-bold">Est. {car.estimatedPrice}</p>
                    )}
                    {car.expectedLaunch && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        Expected: {car.expectedLaunch}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <PaginationControls page={result.page} totalPages={result.totalPages} total={result.total} />
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Car className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No upcoming cars found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
}
