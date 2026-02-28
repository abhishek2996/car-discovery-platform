"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateLeadStatus } from "@/lib/actions/dealer";
import { toast } from "sonner";
import {
  PhoneCall,
  ArrowRight,
  CheckCircle,
  XCircle,
  Car,
} from "lucide-react";

const STATUS_TRANSITIONS: Record<
  string,
  { label: string; to: string; icon: React.ReactNode; variant: "default" | "outline" | "destructive" }[]
> = {
  NEW: [
    { label: "Mark Contacted", to: "CONTACTED", icon: <PhoneCall className="mr-1.5 h-3.5 w-3.5" />, variant: "default" },
    { label: "Drop", to: "DROPPED", icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />, variant: "destructive" },
  ],
  CONTACTED: [
    { label: "Move to In Progress", to: "IN_PROGRESS", icon: <ArrowRight className="mr-1.5 h-3.5 w-3.5" />, variant: "default" },
    { label: "Schedule Test Drive", to: "IN_PROGRESS", icon: <Car className="mr-1.5 h-3.5 w-3.5" />, variant: "outline" },
    { label: "Drop", to: "DROPPED", icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />, variant: "destructive" },
  ],
  IN_PROGRESS: [
    { label: "Mark Completed", to: "COMPLETED", icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" />, variant: "default" },
    { label: "Drop", to: "DROPPED", icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />, variant: "destructive" },
  ],
  COMPLETED: [],
  DROPPED: [
    { label: "Reopen", to: "NEW", icon: <ArrowRight className="mr-1.5 h-3.5 w-3.5" />, variant: "outline" },
  ],
};

interface LeadStatusActionsProps {
  leadId: string;
  currentStatus: string;
}

export function LeadStatusActions({
  leadId,
  currentStatus,
}: LeadStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No further actions available.
      </p>
    );
  }

  function handleAction(toStatus: string) {
    const fd = new FormData();
    fd.set("leadId", leadId);
    fd.set("status", toStatus);

    startTransition(async () => {
      const result = await updateLeadStatus(fd);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-2 pt-2">
      <p className="text-xs font-medium">Quick Actions</p>
      {transitions.map((t) => (
        <Button
          key={t.to + t.label}
          size="sm"
          variant={t.variant}
          className="w-full justify-start"
          disabled={isPending}
          onClick={() => handleAction(t.to)}
        >
          {t.icon}
          {t.label}
        </Button>
      ))}
    </div>
  );
}
