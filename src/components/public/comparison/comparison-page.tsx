"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Car, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CarVariantFull {
  id: string;
  name: string;
  slug: string;
  fuelType: string | null;
  transmission: string | null;
  engine: string | null;
  power: string | null;
  torque: string | null;
  mileage: string | null;
  seating: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  wheelbase: number | null;
  bootCapacity: number | null;
  fuelTank: number | null;
  exShowroomPrice: { toString(): string } | null;
  model: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    brand: { id: string; name: string; slug: string };
  };
}

interface ModelOption {
  id: string;
  name: string;
  brand: { id: string; name: string; slug: string };
  variants: { id: string; name: string; exShowroomPrice: { toString(): string } | null }[];
}

interface ComparisonPageProps {
  allModels: ModelOption[];
  initialVariants: CarVariantFull[];
}

type SpecRow = {
  label: string;
  group: string;
  getValue: (v: CarVariantFull) => string | number | null;
  format?: (v: string | number | null) => string;
  higherIsBetter?: boolean;
  lowerIsBetter?: boolean;
};

const SPEC_ROWS: SpecRow[] = [
  { label: "Ex-showroom Price", group: "Price", getValue: (v) => v.exShowroomPrice ? Number(v.exShowroomPrice) : null, format: (v) => (v ? formatPrice(v) : "TBA"), lowerIsBetter: true },
  { label: "Fuel Type", group: "Engine", getValue: (v) => v.fuelType, format: (v) => (v ? FUEL_TYPE_LABELS[v as string] ?? String(v) : "–") },
  { label: "Transmission", group: "Engine", getValue: (v) => v.transmission, format: (v) => (v ? TRANSMISSION_LABELS[v as string] ?? String(v) : "–") },
  { label: "Engine", group: "Engine", getValue: (v) => v.engine, format: (v) => String(v ?? "–") },
  { label: "Power", group: "Engine", getValue: (v) => v.power, format: (v) => String(v ?? "–") },
  { label: "Torque", group: "Engine", getValue: (v) => v.torque, format: (v) => String(v ?? "–") },
  { label: "Mileage", group: "Performance", getValue: (v) => v.mileage, format: (v) => String(v ?? "–") },
  { label: "Length (mm)", group: "Dimensions", getValue: (v) => v.length, format: (v) => (v ? Number(v).toLocaleString() : "–") },
  { label: "Width (mm)", group: "Dimensions", getValue: (v) => v.width, format: (v) => (v ? Number(v).toLocaleString() : "–") },
  { label: "Height (mm)", group: "Dimensions", getValue: (v) => v.height, format: (v) => (v ? Number(v).toLocaleString() : "–") },
  { label: "Wheelbase (mm)", group: "Dimensions", getValue: (v) => v.wheelbase, format: (v) => (v ? Number(v).toLocaleString() : "–"), higherIsBetter: true },
  { label: "Boot Capacity (L)", group: "Capacity", getValue: (v) => v.bootCapacity, format: (v) => (v ? Number(v).toLocaleString() : "–"), higherIsBetter: true },
  { label: "Fuel Tank (L)", group: "Capacity", getValue: (v) => v.fuelTank, format: (v) => (v ? Number(v).toLocaleString() : "–"), higherIsBetter: true },
  { label: "Seating", group: "Capacity", getValue: (v) => v.seating, format: (v) => (v ? `${v} seats` : "–") },
];

function findBest(row: SpecRow, variants: CarVariantFull[]): string | null {
  if (!row.higherIsBetter && !row.lowerIsBetter) return null;
  const values = variants.map((v) => {
    const raw = row.getValue(v);
    return { id: v.id, num: raw !== null && raw !== undefined ? Number(raw) : NaN };
  }).filter((v) => !isNaN(v.num));

  if (values.length < 2) return null;
  values.sort((a, b) => row.higherIsBetter ? b.num - a.num : a.num - b.num);
  if (values[0].num === values[1].num) return null;
  return values[0].id;
}

export function ComparisonPage({ allModels, initialVariants }: ComparisonPageProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<CarVariantFull[]>(initialVariants.slice(0, 3));

  const [pendingModel, setPendingModel] = useState<string>("");
  const [pendingVariant, setPendingVariant] = useState<string>("");

  const activeModel = allModels.find((m) => m.id === pendingModel);

  const updateUrl = useCallback(
    (variants: CarVariantFull[]) => {
      const ids = variants.map((v) => v.id).join(",");
      router.replace(`/compare?variants=${ids}`, { scroll: false });
    },
    [router]
  );

  const addVariant = () => {
    if (!pendingVariant) return;
    const existing = initialVariants.find((v) => v.id === pendingVariant) ??
      selected.find((v) => v.id === pendingVariant);
    if (existing || selected.length >= 3) return;

    fetch(`/api/variants/${pendingVariant}`)
      .catch(() => null);

    const model = allModels.find((m) => m.variants.some((v) => v.id === pendingVariant));
    if (!model) return;

    const variantMeta = model.variants.find((v) => v.id === pendingVariant);
    if (!variantMeta) return;

    const next: CarVariantFull[] = [
      ...selected,
      {
        id: pendingVariant,
        name: variantMeta.name,
        slug: "",
        fuelType: null,
        transmission: null,
        engine: null,
        power: null,
        torque: null,
        mileage: null,
        seating: null,
        length: null,
        width: null,
        height: null,
        wheelbase: null,
        bootCapacity: null,
        fuelTank: null,
        exShowroomPrice: variantMeta.exShowroomPrice,
        model: {
          id: model.id,
          name: model.name,
          slug: "",
          imageUrl: null,
          brand: model.brand,
        },
      },
    ];
    setSelected(next);
    updateUrl(next);
    setPendingModel("");
    setPendingVariant("");
  };

  const removeVariant = (id: string) => {
    const next = selected.filter((v) => v.id !== id);
    setSelected(next);
    updateUrl(next);
  };

  const handleShare = () => {
    const ids = selected.map((v) => v.id).join(",");
    const url = `${window.location.origin}/compare?variants=${ids}`;
    navigator.clipboard.writeText(url);
  };

  const groups = [...new Set(SPEC_ROWS.map((r) => r.group))];

  return (
    <div>
      {/* Selected cars header */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {selected.map((v) => (
          <Card key={v.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 size-7"
              onClick={() => removeVariant(v.id)}
            >
              <X className="size-4" />
            </Button>
            <CardContent className="p-4 pt-8 text-center">
              {v.model.imageUrl ? (
                <img src={v.model.imageUrl} alt={v.model.name} className="mx-auto mb-3 h-24 object-contain" />
              ) : (
                <Car className="mx-auto mb-3 size-12 text-muted-foreground/30" />
              )}
              <p className="text-xs text-muted-foreground">{v.model.brand.name}</p>
              <p className="text-sm font-semibold">{v.model.name}</p>
              <p className="text-xs text-muted-foreground">{v.name}</p>
              <p className="mt-1 text-sm font-bold">
                {v.exShowroomPrice ? formatPrice(Number(v.exShowroomPrice)) : "TBA"}
              </p>
            </CardContent>
          </Card>
        ))}

        {selected.length < 3 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-4 min-h-[200px]">
              <Plus className="size-8 text-muted-foreground/40" />
              <div className="w-full space-y-2">
                <Select value={pendingModel} onValueChange={(v) => { setPendingModel(v); setPendingVariant(""); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {allModels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.brand.name} {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeModel && (
                  <Select value={pendingVariant} onValueChange={setPendingVariant}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeModel.variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} {v.exShowroomPrice ? `(${formatPrice(Number(v.exShowroomPrice))})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!pendingVariant}
                  onClick={addVariant}
                >
                  Add to Compare
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      {selected.length >= 2 && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 size-3.5" />
            Copy Share Link
          </Button>
        </div>
      )}

      {/* Comparison table */}
      {selected.length >= 2 && (
        <div className="mt-8 space-y-8">
          {groups.map((group) => {
            const rows = SPEC_ROWS.filter((r) => r.group === group);
            return (
              <div key={group}>
                <h3 className="mb-3 text-lg font-semibold">{group}</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px] bg-muted/50 text-center">Spec</TableHead>
                        {selected.map((v) => (
                          <TableHead key={v.id} className="min-w-[150px] bg-muted/50">
                            <div className="flex flex-col items-center justify-center text-center">
                              <span className="font-medium">{v.model.brand.name} {v.model.name}</span>
                              <span className="text-xs text-muted-foreground">{v.name}</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => {
                        const bestId = findBest(row, selected);
                        return (
                          <TableRow key={row.label}>
                            <TableCell className="font-medium text-center">{row.label}</TableCell>
                            {selected.map((v) => {
                              const val = row.getValue(v);
                              const formatted = row.format ? row.format(val) : String(val ?? "–");
                              const isBest = bestId === v.id;
                              return (
                                <TableCell
                                  key={v.id}
                                  className={cn("text-center", isBest && "bg-green-50 font-semibold text-green-700")}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    {formatted}
                                    {isBest && <Trophy className="size-3.5" />}
                                  </span>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected.length < 2 && (
        <div className="mt-16 text-center py-12">
          <Car className="mx-auto size-16 text-muted-foreground/20" />
          <h3 className="mt-4 text-lg font-semibold">Select at least 2 cars to compare</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the selectors above to add car variants for comparison.
          </p>
        </div>
      )}
    </div>
  );
}
