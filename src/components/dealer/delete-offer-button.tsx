"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteOffer } from "@/lib/actions/dealer";
import { toast } from "sonner";

interface DeleteOfferButtonProps {
  inventoryItemId: string;
  offerId: string;
}

export function DeleteOfferButton({
  inventoryItemId,
  offerId,
}: DeleteOfferButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteOffer(inventoryItemId, offerId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setConfirming(false);
    });
  }

  return (
    <Button
      size="sm"
      variant={confirming ? "destructive" : "ghost"}
      onClick={handleDelete}
      onBlur={() => setConfirming(false)}
      disabled={isPending}
    >
      <Trash2 className="h-3 w-3" />
      <span className="ml-1 text-xs">
        {confirming ? "Confirm" : "Remove"}
      </span>
    </Button>
  );
}
