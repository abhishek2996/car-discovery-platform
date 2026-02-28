"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Car,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/dealer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dealer/inventory", label: "Inventory", icon: Package },
  { href: "/dealer/leads", label: "Leads", icon: Users },
  { href: "/dealer/test-drives", label: "Test Drives", icon: Car },
  { href: "/dealer/offers", label: "Offers", icon: Tag },
  { href: "/dealer/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dealer/settings", label: "Settings", icon: Settings },
];

interface DealerSidebarProps {
  dealerName: string;
  className?: string;
}

export function DealerSidebar({ dealerName, className }: DealerSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{dealerName}</p>
          <p className="text-xs text-muted-foreground">Dealer Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href, exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}
