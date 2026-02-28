"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

interface AdminHeaderProps {
  userName: string;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
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
            <AdminSidebar userName={userName} />
          </SheetContent>
        </Sheet>
        <span className="hidden text-sm font-medium md:block">
          Admin Panel
        </span>
      </div>
      <span className="text-sm text-muted-foreground">{userName}</span>
    </header>
  );
}
