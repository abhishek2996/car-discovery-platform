"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateLeadStatusAdmin, reassignLead } from "@/lib/actions/admin";
import { toast } from "sonner";

const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "DROPPED",
] as const;

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: string;
}

export function LeadStatusSelect({
  leadId,
  currentStatus,
}: LeadStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(status: string) {
    if (status === currentStatus) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("leadId", leadId);
      fd.set("status", status);
      const result = await updateLeadStatusAdmin(fd);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ReassignLeadDialogProps {
  leadId: string;
  dealers: { id: string; name: string; city: string | null }[];
}

export function ReassignLeadDialog({
  leadId,
  dealers,
}: ReassignLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!selectedDealer) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("leadId", leadId);
      fd.set("dealerId", selectedDealer);
      const result = await reassignLead(fd);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Reassign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Lead</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedDealer} onValueChange={setSelectedDealer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a dealer" />
            </SelectTrigger>
            <SelectContent>
              {dealers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                  {d.city ? ` (${d.city})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDealer || isPending}
          >
            {isPending ? "Reassigning…" : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
