import { formatPrice } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PriceSummaryProps {
  minPrice: number | null;
  maxPrice: number | null;
  variantCount: number;
}

export function PriceSummary({ minPrice, maxPrice, variantCount }: PriceSummaryProps) {
  const priceRange =
    minPrice && maxPrice
      ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
      : minPrice
        ? `From ${formatPrice(minPrice)}`
        : "Price TBA";

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Ex-showroom Price
      </p>
      <p className="mt-1 text-2xl font-bold">{priceRange}</p>
      {variantCount > 1 && (
        <Badge variant="secondary" className="mt-2">
          {variantCount} variants available
        </Badge>
      )}
      <div className="mt-4 flex gap-2">
        <a
          href="#variants"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View All Variants
        </a>
        <a
          href="#reviews"
          className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Read Reviews
        </a>
      </div>
    </div>
  );
}
