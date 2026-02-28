import Link from "next/link";
import { MapPin, Phone, Store, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchDealers } from "@/lib/data/dealers";
import { getAllBrands } from "@/lib/data/brands";
import { PaginationControls } from "@/components/public/pagination-controls";
import { DealerFilters } from "@/components/public/dealer-filters";

export const metadata = {
  title: "Find Car Dealers Near You | CarDiscovery",
  description: "Find verified car dealers across the UK. Search by city and brand to find your nearest showroom.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DealersPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const city = typeof raw.city === "string" ? raw.city : undefined;
  const brand = typeof raw.brand === "string" ? raw.brand : undefined;
  const page = typeof raw.page === "string" ? Math.max(1, parseInt(raw.page, 10) || 1) : 1;

  const [result, brands] = await Promise.all([
    searchDealers({ city, brand, page }),
    getAllBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Find Dealers</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total} verified {result.total === 1 ? "dealer" : "dealers"} across the UK
        </p>
      </div>

      <DealerFilters brands={brands} />

      {result.dealers.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.dealers.map((dealer) => (
              <Link key={dealer.id} href={`/dealers/${dealer.slug}`}>
                <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      {dealer.logoUrl ? (
                        <img
                          src={dealer.logoUrl}
                          alt={dealer.name}
                          className="size-12 shrink-0 rounded-lg object-contain border"
                        />
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Store className="size-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-tight group-hover:text-primary">
                          {dealer.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {dealer.city}
                        </div>
                      </div>
                    </div>

                    {dealer.dealerBrands.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {dealer.dealerBrands.slice(0, 4).map((db) => (
                          <Badge key={db.id} variant="secondary" className="text-[10px]">
                            {db.brand.name}
                          </Badge>
                        ))}
                        {dealer.dealerBrands.length > 4 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{dealer.dealerBrands.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{dealer._count.inventoryItems} cars in stock</span>
                      {dealer._count.reviews > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {dealer._count.reviews} reviews
                        </span>
                      )}
                    </div>
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
            <Store className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No dealers found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try changing your city or brand filter.
          </p>
        </div>
      )}
    </div>
  );
}
