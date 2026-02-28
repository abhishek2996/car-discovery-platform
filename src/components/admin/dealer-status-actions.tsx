"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateDealerStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

interface DealerStatusActionsProps {
  dealerId: string;
  status: string;
}

export function DealerStatusActions({
  dealerId,
  status,
}: DealerStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAction(action: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("dealerId", dealerId);
      fd.set("action", action);
      const result = await updateDealerStatus(fd);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <>
          <Button
            size="sm"
            onClick={() => handleAction("APPROVE")}
            disabled={isPending}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction("REJECT")}
            disabled={isPending}
          >
            Reject
          </Button>
        </>
      )}
      {status === "ACTIVE" && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction("SUSPEND")}
          disabled={isPending}
        >
          Suspend
        </Button>
      )}
      {status === "SUSPENDED" && (
        <Button
          size="sm"
          onClick={() => handleAction("RESTORE")}
          disabled={isPending}
        >
          Restore
        </Button>
      )}
    </div>
  );
}
