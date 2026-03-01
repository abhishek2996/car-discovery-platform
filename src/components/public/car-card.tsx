import Link from "next/link";
import { Fuel, Gauge, Users, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BODY_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  formatPrice,
} from "@/lib/constants";

interface CarCardProps {
  car: {
    id: string;
    name: string;
    slug: string;
    bodyType: string | null;
    minPrice: string | number | null;
    maxPrice: string | number | null;
    imageUrl: string | null;
    brand: {
      name: string;
      slug: string;
    };
    variants: {
      id: string;
      name: string;
      fuelType: string | null;
      transmission: string | null;
      seating: number | null;
    }[];
    _count: { variants: number };
  };
  /** When true, renders "Get offers" button inside the card and uses fixed height for carousel consistency */
  showGetOffersButton?: boolean;
}

export function CarCard({ car, showGetOffersButton = false }: CarCardProps) {
  const variant = car.variants[0];
  const priceDisplay =
    car.minPrice && car.maxPrice
      ? `${formatPrice(car.minPrice)} – ${formatPrice(car.maxPrice)}`
      : car.minPrice
        ? `From ${formatPrice(car.minPrice)}`
        : "Price TBA";

  const href = `/new-cars/${car.brand.slug}/${car.slug}`;

  const cardContent = (
    <>
      {/* Image area */}
      <div className="relative aspect-[16/10] bg-muted">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.brand.name} ${car.name}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="size-12 text-muted-foreground/30" />
          </div>
        )}
        {car.bodyType && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 text-[10px]"
          >
            {BODY_TYPE_LABELS[car.bodyType] ?? car.bodyType}
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col space-y-3 p-4">
        {/* Title */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {car.brand.name}
          </p>
          <h3 className="text-base font-semibold leading-tight group-hover:text-primary">
            {car.name}
          </h3>
        </div>

        {/* Price */}
        <p className="text-sm font-bold">{priceDisplay}</p>

        {/* Spec badges */}
        {variant && (
          <div className="flex flex-wrap gap-1.5">
            {variant.fuelType && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Fuel className="size-3" />
                {FUEL_TYPE_LABELS[variant.fuelType] ?? variant.fuelType}
              </span>
            )}
            {variant.transmission && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Gauge className="size-3" />
                {TRANSMISSION_LABELS[variant.transmission] ?? variant.transmission}
              </span>
            )}
            {variant.seating && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Users className="size-3" />
                {variant.seating} seats
              </span>
            )}
          </div>
        )}

        {/* Variants count */}
        {car._count.variants > 1 && (
          <p className="text-xs text-muted-foreground">
            {car._count.variants} variants available
          </p>
        )}

        {showGetOffersButton && (
          <Link
            href={href}
            className="mt-auto inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 pt-2"
          >
            Get offers
          </Link>
        )}
      </CardContent>
    </>
  );

  if (showGetOffersButton) {
    return (
      <Card className="group flex h-full min-h-[360px] flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        <Link href={href} className="flex flex-1 flex-col overflow-hidden">
          {cardContent}
        </Link>
      </Card>
    );
  }

  return (
    <Link href={href}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        {cardContent}
      </Card>
    </Link>
  );
}
