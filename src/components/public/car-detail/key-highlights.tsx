import { Fuel, Gauge, Users, Zap, Car, Ruler } from "lucide-react";
import { BODY_TYPE_LABELS, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";

interface KeyHighlightsProps {
  variants: {
    fuelType: string | null;
    transmission: string | null;
    seating: number | null;
    engine: string | null;
    power: string | null;
    mileage: string | null;
  }[];
  bodyType: string | null;
  segment: string | null;
}

export function KeyHighlights({ variants, bodyType, segment }: KeyHighlightsProps) {
  const fuelTypes = [...new Set(variants.map((v) => v.fuelType).filter(Boolean))];
  const transmissions = [...new Set(variants.map((v) => v.transmission).filter(Boolean))];
  const seatingOptions = [...new Set(variants.map((v) => v.seating).filter(Boolean))];
  const baseVariant = variants[0];

  const highlights: { icon: React.ElementType; label: string; value: string }[] = [];

  if (bodyType) {
    highlights.push({
      icon: Car,
      label: "Body Type",
      value: BODY_TYPE_LABELS[bodyType] ?? bodyType,
    });
  }

  if (fuelTypes.length > 0) {
    highlights.push({
      icon: Fuel,
      label: "Fuel",
      value: fuelTypes.map((f) => FUEL_TYPE_LABELS[f!] ?? f).join(", "),
    });
  }

  if (transmissions.length > 0) {
    highlights.push({
      icon: Gauge,
      label: "Transmission",
      value: transmissions.map((t) => TRANSMISSION_LABELS[t!] ?? t).join(", "),
    });
  }

  if (seatingOptions.length > 0) {
    highlights.push({
      icon: Users,
      label: "Seating",
      value: seatingOptions.sort((a, b) => a! - b!).join(", ") + " seats",
    });
  }

  if (baseVariant?.power) {
    highlights.push({ icon: Zap, label: "Power", value: baseVariant.power });
  }

  if (baseVariant?.mileage) {
    highlights.push({ icon: Ruler, label: "Mileage", value: baseVariant.mileage });
  }

  if (highlights.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Key Highlights
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {highlights.map((h) => {
          const Icon = h.icon;
          return (
            <div key={h.label} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{h.label}</p>
                <p className="text-sm font-medium leading-tight">{h.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      {segment && (
        <p className="mt-3 text-xs text-muted-foreground">
          Segment: <span className="capitalize font-medium">{segment}</span>
        </p>
      )}
    </div>
  );
}
