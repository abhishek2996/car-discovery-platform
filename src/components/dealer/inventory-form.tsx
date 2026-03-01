"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { addInventoryItem, updateInventoryItem } from "@/lib/actions/dealer";
import type { ActionResult } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Variant {
  id: string;
  name: string;
  model: { name: string; brand: { name: string } };
}

interface InventoryFormProps {
  variants: Variant[];
  defaultValues?: {
    id: string;
    variantId: string;
    onRoadPrice: string;
    stockStatus: string;
    visibility: string;
    colorOptions: string;
    offers: string;
    imageUrls: string;
  };
}

export function InventoryForm({ variants, defaultValues }: InventoryFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues;
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (!defaultValues?.imageUrls) return [];
    try {
      return JSON.parse(defaultValues.imageUrls);
    } catch {
      return [];
    }
  });

  const action = isEdit
    ? updateInventoryItem.bind(null, defaultValues.id)
    : addInventoryItem;

  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/dealer/inventory");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="variantId">Car Variant *</Label>
        <Select
          name="variantId"
          defaultValue={defaultValues?.variantId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a car variant" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.model.brand.name} {v.model.name} – {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.variantId && (
          <p className="text-xs text-destructive">{state.errors.variantId[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="onRoadPrice">On-road Price (£)</Label>
          <Input
            id="onRoadPrice"
            name="onRoadPrice"
            type="number"
            step="1"
            placeholder="e.g. 25000"
            defaultValue={defaultValues?.onRoadPrice ?? ""}
          />
          {state?.errors?.onRoadPrice && (
            <p className="text-xs text-destructive">
              {state.errors.onRoadPrice[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockStatus">Stock Status</Label>
          <Select
            name="stockStatus"
            defaultValue={defaultValues?.stockStatus ?? "IN_STOCK"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_STOCK">In Stock</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              <SelectItem value="EXPECTED">Expected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select
          name="visibility"
          defaultValue={defaultValues?.visibility ?? "VISIBLE"}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VISIBLE">Visible</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="HIDDEN">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorOptions">
          Available Colours (comma-separated)
        </Label>
        <Input
          id="colorOptions"
          name="colorOptions"
          placeholder="e.g. Pearl White, Magnetic Red, Midnight Black"
          defaultValue={defaultValues?.colorOptions ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="offers">Offers / Promotions</Label>
        <Textarea
          id="offers"
          name="offers"
          placeholder="Describe any current offers or promotions..."
          rows={3}
          defaultValue={defaultValues?.offers ?? ""}
        />
      </div>

      <div className="space-y-2">
        <ImageUpload
          endpoint="carImage"
          value={imageUrls}
          onChange={setImageUrls}
          maxFiles={10}
          label="Vehicle Photos"
        />
        <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEdit
              ? "Updating..."
              : "Adding..."
            : isEdit
              ? "Update Item"
              : "Add Item"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dealer/inventory")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
