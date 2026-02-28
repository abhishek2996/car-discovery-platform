"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateTestDriveStatus } from "@/lib/actions/dealer";
import { toast } from "sonner";
import { Check, X, Clock, AlertTriangle } from "lucide-react";

const ACTIONS: Record<
  string,
  { label: string; to: string; icon: React.ReactNode; variant: "default" | "outline" | "destructive" }[]
> = {
  REQUESTED: [
    { label: "Confirm", to: "CONFIRMED", icon: <Check className="mr-1 h-3.5 w-3.5" />, variant: "default" },
    { label: "Cancel", to: "CANCELLED", icon: <X className="mr-1 h-3.5 w-3.5" />, variant: "destructive" },
  ],
  CONFIRMED: [
    { label: "Completed", to: "COMPLETED", icon: <Check className="mr-1 h-3.5 w-3.5" />, variant: "default" },
    { label: "No Show", to: "NO_SHOW", icon: <AlertTriangle className="mr-1 h-3.5 w-3.5" />, variant: "outline" },
    { label: "Cancel", to: "CANCELLED", icon: <X className="mr-1 h-3.5 w-3.5" />, variant: "destructive" },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

interface TestDriveActionsProps {
  slotId: string;
  currentStatus: string;
}

export function TestDriveActions({
  slotId,
  currentStatus,
}: TestDriveActionsProps) {
  const [isPending, startTransition] = useTransition();
  const actions = ACTIONS[currentStatus] ?? [];

  if (actions.length === 0) return null;

  function handleAction(toStatus: string) {
    const fd = new FormData();
    fd.set("slotId", slotId);
    fd.set("status", toStatus);

    startTransition(async () => {
      const result = await updateTestDriveStatus(fd);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {actions.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant={a.variant}
          disabled={isPending}
          onClick={() => handleAction(a.to)}
        >
          {a.icon}
          {a.label}
        </Button>
      ))}
    </div>
  );
}
