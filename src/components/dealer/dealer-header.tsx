"use client";

import { Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DealerSidebar } from "./dealer-sidebar";

interface DealerHeaderProps {
  dealerName: string;
  dealerStatus: string;
  userName?: string | null;
}

export function DealerHeader({
  dealerName,
  dealerStatus,
  userName,
}: DealerHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card text-card-foreground shadow-sm md:hidden"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <DealerSidebar dealerName={dealerName} />
          </SheetContent>
        </Sheet>

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-sm font-medium">{dealerName}</span>
          <StatusBadge status={dealerStatus} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm text-muted-foreground">
            {userName}
          </span>
        )}
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "ACTIVE"
      ? "default"
      : status === "PENDING"
        ? "secondary"
        : "destructive";
  return (
    <Badge variant={variant} className="text-xs">
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
