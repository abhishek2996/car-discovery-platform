"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SingleImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

interface BrandFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    name: string;
    slug: string;
    country: string | null;
    logoUrl: string | null;
  };
}

export function BrandForm({ action, defaultValues }: BrandFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);
  const [logoUrl, setLogoUrl] = useState(defaultValues?.logoUrl ?? "");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/admin/catalog");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Brand Name *</Label>
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
          placeholder="e.g. audi"
          defaultValue={defaultValues?.slug ?? ""}
        />
        {state?.errors?.slug && (
          <p className="text-xs text-destructive">{state.errors.slug[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          placeholder="e.g. Germany"
          defaultValue={defaultValues?.country ?? ""}
        />
        {state?.errors?.country && (
          <p className="text-xs text-destructive">{state.errors.country[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Brand Logo</Label>
        <SingleImageUpload
          endpoint="brandLogo"
          value={logoUrl}
          onChange={setLogoUrl}
          label=""
        />
        <input type="hidden" name="logoUrl" value={logoUrl} />
        {state?.errors?.logoUrl && (
          <p className="text-xs text-destructive">{state.errors.logoUrl[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : defaultValues ? "Update Brand" : "Create Brand"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/catalog")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
