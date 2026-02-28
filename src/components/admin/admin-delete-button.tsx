"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/actions/admin";

interface AdminDeleteButtonProps {
  deleteAction: (id: string) => Promise<ActionResult>;
  itemId: string;
}

export function AdminDeleteButton({ deleteAction, itemId }: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteAction(itemId);
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
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only md:not-sr-only md:ml-1">
        {confirming ? "Confirm?" : "Delete"}
      </span>
    </Button>
  );
}
