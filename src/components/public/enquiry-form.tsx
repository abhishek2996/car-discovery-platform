"use client";

import { useActionState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitEnquiry, type ActionResult } from "@/lib/actions/leads";

interface EnquiryFormWrapperProps {
  dealerId: string;
  carModelId?: string;
  carVariantId?: string;
  source?: string;
}

export function EnquiryFormWrapper({
  dealerId,
  carModelId,
  carVariantId,
  source = "car_detail",
}: EnquiryFormWrapperProps) {
  const [state, action, pending] = useActionState(submitEnquiry, null);

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto size-12 text-green-500" />
        <h3 className="mt-3 text-lg font-semibold">Enquiry Submitted!</h3>
        <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="dealerId" value={dealerId} />
      {carModelId && <input type="hidden" name="carModelId" value={carModelId} />}
      {carVariantId && <input type="hidden" name="carVariantId" value={carVariantId} />}
      <input type="hidden" name="source" value={source} />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="enquiry-name">Full Name</Label>
          <Input id="enquiry-name" name="name" placeholder="John Smith" required className="mt-1" />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <Label htmlFor="enquiry-email">Email</Label>
          <Input id="enquiry-email" name="email" type="email" placeholder="john@example.com" required className="mt-1" />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="enquiry-phone">Phone (optional)</Label>
        <Input id="enquiry-phone" name="phone" type="tel" placeholder="07700 900000" className="mt-1" />
        {state?.errors?.phone && (
          <p className="mt-1 text-xs text-destructive">{state.errors.phone[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="enquiry-message">Message</Label>
        <Textarea
          id="enquiry-message"
          name="message"
          placeholder="I'd like to know more about..."
          rows={4}
          required
          className="mt-1"
        />
        {state?.errors?.message && (
          <p className="mt-1 text-xs text-destructive">{state.errors.message[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending..." : "Send Enquiry"}
      </Button>
    </form>
  );
}
