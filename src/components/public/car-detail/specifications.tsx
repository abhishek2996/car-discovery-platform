"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, formatPrice } from "@/lib/constants";

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
  length: number | null;
  width: number | null;
  height: number | null;
  wheelbase: number | null;
  bootCapacity: number | null;
  fuelTank: number | null;
  exShowroomPrice: { toString(): string } | null;
}

interface SpecificationsSectionProps {
  variants: Variant[];
}

type SpecRow = { label: string; accessor: (v: Variant) => string };

const ENGINE_SPECS: SpecRow[] = [
  { label: "Engine", accessor: (v) => v.engine ?? "–" },
  { label: "Fuel Type", accessor: (v) => (v.fuelType ? FUEL_TYPE_LABELS[v.fuelType] ?? v.fuelType : "–") },
  { label: "Transmission", accessor: (v) => (v.transmission ? TRANSMISSION_LABELS[v.transmission] ?? v.transmission : "–") },
  { label: "Power", accessor: (v) => v.power ?? "–" },
  { label: "Torque", accessor: (v) => v.torque ?? "–" },
  { label: "Mileage", accessor: (v) => v.mileage ?? "–" },
];

const DIMENSIONS_SPECS: SpecRow[] = [
  { label: "Length (mm)", accessor: (v) => (v.length ? v.length.toLocaleString() : "–") },
  { label: "Width (mm)", accessor: (v) => (v.width ? v.width.toLocaleString() : "–") },
  { label: "Height (mm)", accessor: (v) => (v.height ? v.height.toLocaleString() : "–") },
  { label: "Wheelbase (mm)", accessor: (v) => (v.wheelbase ? v.wheelbase.toLocaleString() : "–") },
  { label: "Boot Capacity (L)", accessor: (v) => (v.bootCapacity ? v.bootCapacity.toLocaleString() : "–") },
  { label: "Fuel Tank (L)", accessor: (v) => (v.fuelTank ? v.fuelTank.toLocaleString() : "–") },
  { label: "Seating", accessor: (v) => (v.seating ? `${v.seating} seats` : "–") },
];

const PRICE_SPECS: SpecRow[] = [
  {
    label: "Ex-showroom Price",
    accessor: (v) => (v.exShowroomPrice ? formatPrice(Number(v.exShowroomPrice)) : "TBA"),
  },
];

function SpecTable({ specs, variants }: { specs: SpecRow[]; variants: Variant[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] bg-muted/50">Variants</TableHead>
            {variants.map((v) => (
              <TableHead key={v.id} className="min-w-[150px] bg-muted/50 !text-center">
                {v.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {specs.map((spec) => (
            <TableRow key={spec.label}>
              <TableCell className="font-medium">{spec.label}</TableCell>
              {variants.map((v) => (
                <TableCell key={v.id} className="text-center">
                  {spec.accessor(v)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SpecificationsSection({ variants }: SpecificationsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayVariants = showAll ? variants : variants.slice(0, 3);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Full Specifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Detailed specs across all variants.
        {variants.length > 3 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="ml-1 text-primary hover:underline"
          >
            Show all {variants.length} variants
          </button>
        )}
      </p>

      <Tabs defaultValue="engine" className="mt-6">
        <TabsList>
          <TabsTrigger value="engine">Engine & Performance</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions & Capacity</TabsTrigger>
          <TabsTrigger value="price">Price</TabsTrigger>
        </TabsList>
        <TabsContent value="engine" className="mt-4">
          <SpecTable specs={ENGINE_SPECS} variants={displayVariants} />
        </TabsContent>
        <TabsContent value="dimensions" className="mt-4">
          <SpecTable specs={DIMENSIONS_SPECS} variants={displayVariants} />
        </TabsContent>
        <TabsContent value="price" className="mt-4">
          <SpecTable specs={PRICE_SPECS} variants={displayVariants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
