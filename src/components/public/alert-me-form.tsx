"use client";

import { useActionState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribeToAlert, type ActionResult } from "@/lib/actions/alerts";

interface AlertMeFormProps {
  upcomingCarId: string;
}

export function AlertMeForm({ upcomingCarId }: AlertMeFormProps) {
  const [state, action, pending] = useActionState(subscribeToAlert, null);

  if (state?.success) {
    return (
      <div className="text-center py-4">
        <Bell className="mx-auto size-8 text-primary" />
        <p className="mt-2 text-sm font-semibold">You&apos;re subscribed!</p>
        <p className="text-xs text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="upcomingCarId" value={upcomingCarId} />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div>
        <Label htmlFor="alert-email">Email</Label>
        <Input
          id="alert-email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          className="mt-1"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="alert-name">Name (optional)</Label>
        <Input
          id="alert-name"
          name="name"
          placeholder="Your name"
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full" size="sm">
        <Bell className="mr-2 size-3.5" />
        {pending ? "Subscribing..." : "Alert Me on Launch"}
      </Button>
    </form>
  );
}
