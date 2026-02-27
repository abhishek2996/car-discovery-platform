import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  _count: { models: number };
}

function BrandInitial({ name }: { name: string }) {
  const initials = name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
      {initials}
    </div>
  );
}

export function BrandGrid({
  brands,
  title = "Popular Brands",
  showViewAll = false,
}: {
  brands: Brand[];
  title?: string;
  showViewAll?: boolean;
}) {
  if (brands.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showViewAll && (
          <Link
            href="/brands"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all brands
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/new-cars?brand=${brand.slug}`}>
            <Card className="group h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="size-14 object-contain"
                  />
                ) : (
                  <BrandInitial name={brand.name} />
                )}
                <div>
                  <p className="text-sm font-semibold group-hover:text-primary">
                    {brand.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {brand._count.models}{" "}
                    {brand._count.models === 1 ? "model" : "models"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
