"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Car,
  Menu,
  Search,
  X,
  GitCompareArrows,
  Clock,
  Star,
  Store,
  LogIn,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CitySelector } from "@/components/public/city-selector";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/new-cars", label: "New Cars", icon: Car },
  { href: "/brands", label: "Brands", icon: Car },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/upcoming", label: "Upcoming", icon: Clock },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/dealers", label: "Dealers", icon: Store },
] as const;

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2 border-transparent hover:border-primary/50",
        active ? "text-primary border-primary" : "text-muted-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top row: logo, search, actions */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Car className="size-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="block text-lg font-bold tracking-tight">CarDiscovery</span>
            <span className="block text-[10px] text-muted-foreground leading-tight">New cars in the UK</span>
          </div>
          <span className="text-lg font-bold tracking-tight sm:hidden">CarDiscovery</span>
        </Link>

        {/* Center search: All dropdown + input */}
        <form action="/new-cars" method="get" className="hidden flex-1 md:flex md:max-w-xl md:items-center md:justify-center">
          <div className="flex w-full overflow-hidden rounded-lg border bg-muted/30">
            <Select name="scope" defaultValue="all">
              <SelectTrigger className="h-9 w-20 shrink-0 border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new-cars">New Cars</SelectItem>
                <SelectItem value="brands">Brands</SelectItem>
                <SelectItem value="reviews">Reviews</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search or ask a question"
                className="h-9 border-0 bg-transparent pl-9 pr-4 focus-visible:ring-0"
              />
            </div>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
            <Link href="/my-activity" aria-label="Saved">
              <Heart className="size-4" />
            </Link>
          </Button>
          <AuthButtons />
          <div className="hidden sm:block">
            <CitySelector />
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                <div className="mb-4 border-b pb-4">
                  <form action="/new-cars" method="get">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input name="q" placeholder="Search cars..." className="pl-8" />
                    </div>
                  </form>
                </div>
                <div className="mb-4 px-2">
                  <CitySelector />
                </div>
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <MobileAuthLinks onClose={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Second row: main nav */}
      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href || pathname.startsWith(link.href + "/")}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="border-t px-4 py-2 md:hidden">
          <form action="/new-cars" method="get">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search or ask a question" className="pl-8 text-sm" autoFocus />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}

function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="hidden h-8 w-8 animate-pulse rounded-full bg-muted md:block" />;
  }

  if (!session?.user) {
    return (
      <div className="hidden items-center gap-3 md:flex">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground font-normal">
          <Link href="/login">Login / Register</Link>
        </Button>
        <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
          <Link href="/dealer-signup">Become a Dealer</Link>
        </Button>
      </div>
    );
  }

  const user = session.user as { name?: string; email?: string; role?: string };
  const dashboardHref =
    user.role === "ADMIN" ? "/admin" : user.role === "DEALER" ? "/dealer" : "/my-activity";

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <User className="h-3.5 w-3.5" />
            <span className="max-w-[100px] truncate">{user.name || user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={dashboardHref} className="flex items-center gap-2">
              <LayoutDashboard className="h-3.5 w-3.5" />
              {user.role === "ADMIN" ? "Admin Panel" : user.role === "DEALER" ? "Dealer Dashboard" : "My Activity"}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileAuthLinks({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <>
        <div className="my-2 border-t" />
        <Link
          href="/login"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogIn className="size-4" />
          Sign in
        </Link>
        <Link
          href="/dealer-signup"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
        >
          <Store className="size-4" />
          Become a Dealer
        </Link>
      </>
    );
  }

  const user = session.user as { name?: string; email?: string; role?: string };
  const dashboardHref =
    user.role === "ADMIN" ? "/admin" : user.role === "DEALER" ? "/dealer" : "/my-activity";

  return (
    <>
      <div className="my-2 border-t" />
      <Link
        href={dashboardHref}
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <LayoutDashboard className="size-4" />
        {user.role === "ADMIN" ? "Admin Panel" : user.role === "DEALER" ? "Dealer Dashboard" : "My Activity"}
      </Link>
      <button
        onClick={() => { signOut({ callbackUrl: "/" }); onClose(); }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </>
  );
}
