"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleImageUpload } from "@/components/ui/image-upload";
import type { ActionResult } from "@/lib/types";
import { toast } from "sonner";

interface ArticleFormProps {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    type: string;
    title: string;
    slug: string;
    body: string;
    heroMediaUrl: string | null;
    tags: string | null;
    publishedAt: Date | null;
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ action, defaultValues }: ArticleFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);
  const [heroUrl, setHeroUrl] = useState(defaultValues?.heroMediaUrl ?? "");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/admin/content");
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  function handleGenerateSlug() {
    const titleInput = document.getElementById("title") as HTMLInputElement | null;
    const slugInput = document.getElementById("slug") as HTMLInputElement | null;
    if (titleInput && slugInput) {
      slugInput.value = slugify(titleInput.value);
    }
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="type">Article Type *</Label>
        <Select name="type" defaultValue={defaultValues?.type ?? "NEWS"}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEWS">News</SelectItem>
            <SelectItem value="EXPERT_REVIEW">Expert Review</SelectItem>
            <SelectItem value="FEATURE">Feature</SelectItem>
            <SelectItem value="COMPARISON">Comparison</SelectItem>
          </SelectContent>
        </Select>
        {state?.errors?.type && (
          <p className="text-xs text-destructive">{state.errors.type[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Article title"
          defaultValue={defaultValues?.title ?? ""}
        />
        {state?.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <div className="flex gap-2">
          <Input
            id="slug"
            name="slug"
            placeholder="article-url-slug"
            defaultValue={defaultValues?.slug ?? ""}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateSlug}>
            Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Used for the article URL. Lowercase, hyphens only.
        </p>
        {state?.errors?.slug && (
          <p className="text-xs text-destructive">{state.errors.slug[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body *</Label>
        <Textarea
          id="body"
          name="body"
          rows={12}
          placeholder="Write article content..."
          defaultValue={defaultValues?.body ?? ""}
        />
        {state?.errors?.body && (
          <p className="text-xs text-destructive">{state.errors.body[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Hero Image</Label>
        <SingleImageUpload
          endpoint="articleHero"
          value={heroUrl}
          onChange={setHeroUrl}
          label=""
        />
        <input type="hidden" name="heroMediaUrl" value={heroUrl} />
        {state?.errors?.heroMediaUrl && (
          <p className="text-xs text-destructive">{state.errors.heroMediaUrl[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g. electric, suv, review (comma-separated)"
          defaultValue={defaultValues?.tags ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated tags for categorisation.
        </p>
        {state?.errors?.tags && (
          <p className="text-xs text-destructive">{state.errors.tags[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="publishNow"
          name="publishNow"
          value="true"
          defaultChecked={defaultValues?.publishedAt !== null && defaultValues?.publishedAt !== undefined}
        />
        <Label htmlFor="publishNow" className="cursor-pointer font-normal">
          Publish immediately
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? defaultValues
              ? "Updating..."
              : "Creating..."
            : defaultValues
              ? "Update Article"
              : "Create Article"}
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
