"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionResult } from "@/lib/types";
import { toast } from "sonner";

interface HeroSlideFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    title: string;
    subtitle: string | null;
    benefitText: string | null;
    dealerName: string | null;
    locationsJson: string | null;
    imageUrl: string | null;
    sortOrder: number;
    active: boolean;
  };
}

function locationsToText(json: string | null): string {
  if (!json) return "";
  try {
    const arr = JSON.parse(json) as Array<{ name: string; phone: string }>;
    return Array.isArray(arr) ? arr.map((l) => `${l.name}, ${l.phone}`).join("\n") : "";
  } catch {
    return "";
  }
}

export function HeroSlideForm({ action, defaultValues }: HeroSlideFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/admin/content?tab=hero");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Get Your Dream Car"
          defaultValue={defaultValues?.title ?? ""}
        />
        {state?.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          name="subtitle"
          placeholder="e.g. from our trusted dealer partners"
          defaultValue={defaultValues?.subtitle ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefitText">Benefit text</Label>
        <Input
          id="benefitText"
          name="benefitText"
          placeholder="e.g. Get Benefits Up to £5,000*"
          defaultValue={defaultValues?.benefitText ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dealerName">Dealer / partner name</Label>
        <Input
          id="dealerName"
          name="dealerName"
          placeholder="e.g. CarDiscovery Partners"
          defaultValue={defaultValues?.dealerName ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationsJson">Locations (one per line: Name, Phone)</Label>
        <Textarea
          id="locationsJson"
          name="locationsJson"
          rows={4}
          placeholder={"London, 020 7123 4567\nBirmingham, 0121 456 7890"}
          defaultValue={locationsToText(defaultValues?.locationsJson ?? null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Background image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.imageUrl ?? ""}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={defaultValues?.sortOrder ?? 0}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="hidden" name="active" value="false" />
          <Checkbox
            id="active"
            name="active"
            value="true"
            defaultChecked={defaultValues?.active ?? true}
          />
          <Label htmlFor="active" className="font-normal">Active (show on home)</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (defaultValues ? "Updating..." : "Creating...") : defaultValues ? "Update slide" : "Create slide"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/content?tab=hero")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
