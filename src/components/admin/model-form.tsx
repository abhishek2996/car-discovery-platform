"use client";

import { useActionState, useEffect, useState } from "react";
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
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { BODY_TYPE_LABELS } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

interface Brand {
  id: string;
  name: string;
}

interface ModelFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  brands: Brand[];
  defaultValues?: {
    brandId: string;
    name: string;
    slug: string;
    bodyType: string | null;
    segment: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    imageUrl: string | null;
    imageUrls?: string | null; // JSON array string
  };
}

export function ModelForm({ action, brands, defaultValues }: ModelFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (defaultValues?.imageUrls) {
      try {
        const arr = JSON.parse(defaultValues.imageUrls) as unknown;
        return Array.isArray(arr) ? arr.filter((u): u is string => typeof u === "string") : [];
      } catch {
        return [];
      }
    }
    if (defaultValues?.imageUrl) return [defaultValues.imageUrl];
    return [];
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/admin/catalog/models");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brandId">Brand *</Label>
        <Select name="brandId" defaultValue={defaultValues?.brandId ?? ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.brandId && (
          <p className="text-xs text-destructive">{state.errors.brandId[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Model Name *</Label>
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
            placeholder="e.g. a4"
            defaultValue={defaultValues?.slug ?? ""}
          />
          {state?.errors?.slug && (
            <p className="text-xs text-destructive">{state.errors.slug[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bodyType">Body Type</Label>
          <Select name="bodyType" defaultValue={defaultValues?.bodyType || "__none__"}>
            <SelectTrigger>
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {Object.entries(BODY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="segment">Segment</Label>
          <Input
            id="segment"
            name="segment"
            placeholder="e.g. Luxury, Compact"
            defaultValue={defaultValues?.segment ?? ""}
          />
          {state?.errors?.segment && (
            <p className="text-xs text-destructive">{state.errors.segment[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price (£)</Label>
          <Input
            id="minPrice"
            name="minPrice"
            type="number"
            step="1"
            placeholder="e.g. 25000"
            defaultValue={defaultValues?.minPrice ?? ""}
          />
          {state?.errors?.minPrice && (
            <p className="text-xs text-destructive">{state.errors.minPrice[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price (£)</Label>
          <Input
            id="maxPrice"
            name="maxPrice"
            type="number"
            step="1"
            placeholder="e.g. 45000"
            defaultValue={defaultValues?.maxPrice ?? ""}
          />
          {state?.errors?.maxPrice && (
            <p className="text-xs text-destructive">{state.errors.maxPrice[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <ImageUpload
          endpoint="carModelGallery"
          value={imageUrls}
          onChange={setImageUrls}
          maxFiles={100}
          label="Model images (upload as many as you need)"
        />
        <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : defaultValues ? "Update Model" : "Create Model"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/catalog/models")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
