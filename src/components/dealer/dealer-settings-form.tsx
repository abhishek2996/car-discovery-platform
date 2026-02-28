"use client";

import { useActionState, useEffect } from "react";
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
import { updateDealerSettings } from "@/lib/actions/dealer";
import type { ActionResult } from "@/lib/actions/dealer";
import { UK_CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealerSettingsFormProps {
  defaultValues: {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    description: string;
  };
}

export function DealerSettingsForm({ defaultValues }: DealerSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDealerSettings,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dealership Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Dealership Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaultValues.name}
            />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select name="city" defaultValue={defaultValues.city}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {UK_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.city && (
                <p className="text-xs text-destructive">
                  {state.errors.city[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultValues.phone}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              defaultValue={defaultValues.address}
            />
            {state?.errors?.address && (
              <p className="text-xs text-destructive">
                {state.errors.address[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultValues.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={defaultValues.description}
              placeholder="Tell buyers about your dealership..."
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
