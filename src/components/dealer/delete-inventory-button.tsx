"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteInventoryItem } from "@/lib/actions/dealer";
import { toast } from "sonner";

export function DeleteInventoryButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteInventoryItem(itemId);
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
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only md:not-sr-only md:ml-1">
        {confirming ? "Confirm" : "Delete"}
      </span>
    </Button>
  );
}
