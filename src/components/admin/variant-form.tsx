"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants";
import type { ActionResult } from "@/lib/actions/admin";

interface VariantFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  modelId: string;
  backHref: string;
  defaultValues?: {
    name: string;
    slug: string;
    fuelType: string | null;
    transmission: string | null;
    engine: string | null;
    power: string | null;
    torque: string | null;
    mileage: string | null;
    seating: number | null;
    exShowroomPrice: number | null;
  };
}

export function VariantForm({ action, modelId, backHref, defaultValues }: VariantFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push(backHref);
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router, backHref]);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <input type="hidden" name="modelId" value={modelId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Variant Name *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name ?? ""}
          />
          {state?.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            required
            placeholder="e.g. 2-0-tdi-sport"
            defaultValue={defaultValues?.slug ?? ""}
          />
          {state?.errors?.slug && (
            <p className="text-xs text-destructive">{state.errors.slug[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select name="fuelType" defaultValue={defaultValues?.fuelType ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select name="transmission" defaultValue={defaultValues?.transmission ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {Object.entries(TRANSMISSION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="engine">Engine</Label>
          <Input
            id="engine"
            name="engine"
            placeholder="e.g. 2.0L Turbo Diesel"
            defaultValue={defaultValues?.engine ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="power">Power</Label>
          <Input
            id="power"
            name="power"
            placeholder="e.g. 190 bhp"
            defaultValue={defaultValues?.power ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="torque">Torque</Label>
          <Input
            id="torque"
            name="torque"
            placeholder="e.g. 400 Nm"
            defaultValue={defaultValues?.torque ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            name="mileage"
            placeholder="e.g. 45 mpg"
            defaultValue={defaultValues?.mileage ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seating">Seating</Label>
          <Input
            id="seating"
            name="seating"
            type="number"
            min="1"
            max="12"
            placeholder="e.g. 5"
            defaultValue={defaultValues?.seating ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exShowroomPrice">Ex-Showroom Price (£)</Label>
          <Input
            id="exShowroomPrice"
            name="exShowroomPrice"
            type="number"
            step="1"
            placeholder="e.g. 35000"
            defaultValue={defaultValues?.exShowroomPrice ?? ""}
          />
          {state?.errors?.exShowroomPrice && (
            <p className="text-xs text-destructive">{state.errors.exShowroomPrice[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : defaultValues ? "Update Variant" : "Create Variant"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backHref)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
