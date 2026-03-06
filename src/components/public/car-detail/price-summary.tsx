import type { ReactNode } from "react";
import { formatPrice } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PriceSummaryProps {
  minPrice: number | null;
  maxPrice: number | null;
  variantCount: number;
  children?: ReactNode;
}

export function PriceSummary({ minPrice, maxPrice, variantCount, children }: PriceSummaryProps) {
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
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
