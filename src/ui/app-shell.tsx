"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {sidebar ? (
        <aside className="hidden border-r bg-sidebar text-sidebar-foreground md:flex md:w-64 lg:w-72">
          {sidebar}
        </aside>
      ) : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <AppShellHeader>{header}</AppShellHeader>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

interface AppShellHeaderProps {
  children?: React.ReactNode;
}

export function AppShellHeader({ children }: AppShellHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border bg-card",
            "text-card-foreground shadow-sm md:hidden",
          )}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </button>
        {children}
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 py-2 md:flex-row md:items-center md:justify-between md:py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface DataTableShellProps {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function DataTableShell({ toolbar, children }: DataTableShellProps) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      {toolbar ? <div className="flex flex-wrap items-center justify-between gap-3">{toolbar}</div> : null}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

