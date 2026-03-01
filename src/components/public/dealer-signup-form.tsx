"use client";

import { useActionState, useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dealerSignup } from "@/lib/actions/dealer";
import type { ActionResult } from "@/lib/types";
import { UK_CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

interface DealerSignupFormProps {
  brands: { id: string; name: string }[];
}

export function DealerSignupForm({ brands }: DealerSignupFormProps) {
  const [state, formAction, isPending] = useActionState(dealerSignup, null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  if (state?.success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold">Application Submitted</h2>
          <p className="mt-2 text-muted-foreground">{state.message}</p>
        </CardContent>
      </Card>
    );
  }

  function toggleBrand(brandId: string) {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId],
    );
  }

  return (
    <form action={formAction}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dealership Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dealership Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Premier Motors London" />
              {state?.errors?.name && (
                <p className="text-xs text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select name="city">
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
                  <p className="text-xs text-destructive">{state.errors.city[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" placeholder="020 1234 5678" />
                {state?.errors?.phone && (
                  <p className="text-xs text-destructive">{state.errors.phone[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 High Street, London, SW1A 1AA"
              />
              {state?.errors?.address && (
                <p className="text-xs text-destructive">{state.errors.address[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Dealership Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="info@premiermotors.co.uk"
              />
              {state?.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Dealership</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Brief description of your dealership..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brands You Sell *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-colors hover:bg-accent/50"
                >
                  <Checkbox
                    name="brandIds"
                    value={brand.id}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
            {state?.errors?.brandIds && (
              <p className="mt-2 text-xs text-destructive">
                {state.errors.brandIds[0]}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                name="contactName"
                placeholder="John Smith"
              />
              {state?.errors?.contactName && (
                <p className="text-xs text-destructive">
                  {state.errors.contactName[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Login Email *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="john@premiermotors.co.uk"
              />
              {state?.errors?.contactEmail && (
                <p className="text-xs text-destructive">
                  {state.errors.contactEmail[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPassword">Password *</Label>
              <Input
                id="contactPassword"
                name="contactPassword"
                type="password"
                placeholder="At least 8 characters"
              />
              {state?.errors?.contactPassword && (
                <p className="text-xs text-destructive">
                  {state.errors.contactPassword[0]}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Submitting Application..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}
