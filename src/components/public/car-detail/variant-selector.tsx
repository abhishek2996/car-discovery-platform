"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  fuelType: string | null;
  transmission: string | null;
  engine: string | null;
  power: string | null;
  torque: string | null;
  mileage: string | null;
  seating: number | null;
  exShowroomPrice: { toString(): string } | null;
}

interface VariantSelectorProps {
  variants: Variant[];
  brandName: string;
  modelName: string;
}

export function VariantSelector({ variants, brandName, modelName }: VariantSelectorProps) {
  const [selected, setSelected] = useState<string>(variants[0]?.id ?? "");
  const selectedVariant = variants.find((v) => v.id === selected);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">
        {brandName} {modelName} Variants
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {variants.length} {variants.length === 1 ? "variant" : "variants"} available. Select one to view details.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Variant list */}
        <div className="space-y-2 lg:col-span-1">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors",
                v.id === selected
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30 hover:bg-accent/50"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{v.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {v.fuelType && (FUEL_TYPE_LABELS[v.fuelType] ?? v.fuelType)}
                  {v.transmission && ` · ${TRANSMISSION_LABELS[v.transmission] ?? v.transmission}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  {v.exShowroomPrice ? formatPrice(Number(v.exShowroomPrice)) : "TBA"}
                </span>
                {v.id === selected && <Check className="size-4 text-primary" />}
              </div>
            </button>
          ))}
        </div>

        {/* Selected variant details */}
        {selectedVariant && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedVariant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {brandName} {modelName}
                  </p>
                </div>
                <span className="text-xl font-bold">
                  {selectedVariant.exShowroomPrice
                    ? formatPrice(Number(selectedVariant.exShowroomPrice))
                    : "TBA"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedVariant.fuelType && (
                  <Badge variant="secondary">
                    {FUEL_TYPE_LABELS[selectedVariant.fuelType] ?? selectedVariant.fuelType}
                  </Badge>
                )}
                {selectedVariant.transmission && (
                  <Badge variant="secondary">
                    {TRANSMISSION_LABELS[selectedVariant.transmission] ?? selectedVariant.transmission}
                  </Badge>
                )}
                {selectedVariant.seating && (
                  <Badge variant="secondary">{selectedVariant.seating} Seats</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {selectedVariant.engine && (
                  <SpecItem label="Engine" value={selectedVariant.engine} />
                )}
                {selectedVariant.power && (
                  <SpecItem label="Power" value={selectedVariant.power} />
                )}
                {selectedVariant.torque && (
                  <SpecItem label="Torque" value={selectedVariant.torque} />
                )}
                {selectedVariant.mileage && (
                  <SpecItem label="Mileage" value={selectedVariant.mileage} />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
