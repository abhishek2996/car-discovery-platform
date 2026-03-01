"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import type { ActionResult } from "@/lib/types";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
}

interface UpcomingCarFormProps {
  brands: Brand[];
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    brandId: string;
    name: string;
    expectedLaunch: string | null;
    estimatedPrice: string | null;
    keyHighlights: string | null;
    imageUrl: string | null;
  };
}

export function UpcomingCarForm({
  brands,
  action,
  defaultValues,
}: UpcomingCarFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/admin/content");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brandId">Brand *</Label>
        <Select name="brandId" defaultValue={defaultValues?.brandId ?? ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
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

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. 2026 BMW X3"
          defaultValue={defaultValues?.name ?? ""}
        />
        {state?.errors?.name && (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expectedLaunch">Expected Launch</Label>
          <Input
            id="expectedLaunch"
            name="expectedLaunch"
            placeholder="e.g. Q2 2026"
            defaultValue={defaultValues?.expectedLaunch ?? ""}
          />
          {state?.errors?.expectedLaunch && (
            <p className="text-xs text-destructive">
              {state.errors.expectedLaunch[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedPrice">Estimated Price</Label>
          <Input
            id="estimatedPrice"
            name="estimatedPrice"
            placeholder="e.g. £25,000 - £32,000"
            defaultValue={defaultValues?.estimatedPrice ?? ""}
          />
          {state?.errors?.estimatedPrice && (
            <p className="text-xs text-destructive">
              {state.errors.estimatedPrice[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyHighlights">Key Highlights</Label>
        <Textarea
          id="keyHighlights"
          name="keyHighlights"
          rows={5}
          placeholder="Key features and highlights, one per line..."
          defaultValue={defaultValues?.keyHighlights ?? ""}
        />
        {state?.errors?.keyHighlights && (
          <p className="text-xs text-destructive">
            {state.errors.keyHighlights[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          defaultValue={defaultValues?.imageUrl ?? ""}
        />
        {state?.errors?.imageUrl && (
          <p className="text-xs text-destructive">{state.errors.imageUrl[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? defaultValues
              ? "Updating..."
              : "Creating..."
            : defaultValues
              ? "Update Upcoming Car"
              : "Create Upcoming Car"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/content")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
