"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";
import type { ActionResult } from "@/lib/types";

interface ProfileFormProps {
  profile: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    image: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-4 max-w-md">
      {state?.message && (
        <p className={`text-sm ${state.success ? "text-green-600" : "text-destructive"}`}>
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" value={profile.email} disabled className="mt-1 bg-muted" />
        <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <div>
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={profile.name ?? ""}
          placeholder="Your name"
          className="mt-1"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="profile-phone">Phone</Label>
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          placeholder="07700 900000"
          className="mt-1"
        />
        {state?.errors?.phone && (
          <p className="mt-1 text-xs text-destructive">{state.errors.phone[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
