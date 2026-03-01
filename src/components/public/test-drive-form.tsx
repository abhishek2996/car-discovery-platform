"use client";

import { useActionState } from "react";
import { CheckCircle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitTestDriveRequest } from "@/lib/actions/leads";
import type { ActionResult } from "@/lib/types";

interface TestDriveFormWrapperProps {
  dealerId: string;
  variants: { id: string; name: string }[];
  source?: string;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

export function TestDriveFormWrapper({
  dealerId,
  variants,
  source = "car_detail",
}: TestDriveFormWrapperProps) {
  const [state, action, pending] = useActionState(submitTestDriveRequest, null);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto size-12 text-green-500" />
        <h3 className="mt-3 text-lg font-semibold">Test Drive Requested!</h3>
        <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="dealerId" value={dealerId} />
      <input type="hidden" name="source" value={source} />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div>
        <Label>Select Car</Label>
        <Select name="variantId" required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a car to test drive" />
          </SelectTrigger>
          <SelectContent>
            {variants.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.variantId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.variantId[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="td-name">Full Name</Label>
          <Input id="td-name" name="name" placeholder="John Smith" required className="mt-1" />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="td-email">Email</Label>
          <Input id="td-email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="td-phone">Phone</Label>
        <Input id="td-phone" name="phone" type="tel" placeholder="07700 900000" required className="mt-1" />
        {state?.errors?.phone && (
          <p className="mt-1 text-xs text-destructive">{state.errors.phone[0]}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="td-date">Preferred Date</Label>
          <Input
            id="td-date"
            name="preferredDate"
            type="date"
            min={minDateStr}
            required
            className="mt-1"
          />
          {state?.errors?.preferredDate && (
            <p className="mt-1 text-xs text-destructive">{state.errors.preferredDate[0]}</p>
          )}
        </div>
        <div>
          <Label>Preferred Time</Label>
          <Select name="preferredTime" required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.preferredTime && (
            <p className="mt-1 text-xs text-destructive">{state.errors.preferredTime[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="td-message">Additional Notes (optional)</Label>
        <Textarea
          id="td-message"
          name="message"
          placeholder="Any preferences or questions..."
          rows={3}
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        <CalendarDays className="mr-2 size-4" />
        {pending ? "Booking..." : "Book Test Drive"}
      </Button>
    </form>
  );
}
