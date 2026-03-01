"use client";

import { useActionState, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { createOffer } from "@/lib/actions/dealer";
import type { ActionResult } from "@/lib/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface AddOfferDialogProps {
  inventoryOptions: { id: string; label: string }[];
}

export function AddOfferDialog({ inventoryOptions }: AddOfferDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createOffer, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Offer</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>Inventory Item *</Label>
            <Select name="inventoryItemId">
              <SelectTrigger>
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {inventoryOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.inventoryItemId && (
              <p className="text-xs text-destructive">
                {state.errors.inventoryItemId[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Offer Title *</Label>
            <Input name="title" placeholder="e.g. Spring Sale" />
            {state?.errors?.title && (
              <p className="text-xs text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select name="discountType" defaultValue="FLAT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat Amount (£)</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                name="discountAmount"
                type="number"
                step="1"
                placeholder="e.g. 500"
              />
              {state?.errors?.discountAmount && (
                <p className="text-xs text-destructive">
                  {state.errors.discountAmount[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Valid From *</Label>
              <Input name="validFrom" type="date" />
              {state?.errors?.validFrom && (
                <p className="text-xs text-destructive">
                  {state.errors.validFrom[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Valid To *</Label>
              <Input name="validTo" type="date" />
              {state?.errors?.validTo && (
                <p className="text-xs text-destructive">
                  {state.errors.validTo[0]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="isHighlighted" name="isHighlighted" value="true" />
            <Label htmlFor="isHighlighted" className="text-sm font-normal">
              Feature this offer on car detail pages
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
