"use client";

import Link from "next/link";

export type TickerItem = { label: string; href: string };

const DEFAULT_ITEMS: TickerItem[] = [
  { label: "New electric models arriving 2026", href: "/upcoming" },
  { label: "Compare cars side by side", href: "/compare" },
  { label: "Expert reviews & news", href: "/reviews" },
  { label: "Find dealers near you", href: "/dealers" },
];

interface TickerStripProps {
  /** Optional server-fed items (e.g. popular car names, upcoming models). When provided, used instead of defaults. */
  items?: TickerItem[];
}

export function TickerStrip({ items }: TickerStripProps) {
  const list = items?.length ? items : DEFAULT_ITEMS;
  // Duplicate for seamless infinite scroll
  const duplicated = [...list, ...list];

  return (
    <div className="border-y border-zinc-700/50 bg-zinc-800 text-white">
      <div className="relative mx-auto flex max-w-7xl items-center overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
        <span className="z-10 mr-4 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Latest
        </span>
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          <div className="flex animate-ticker items-center gap-8 whitespace-nowrap">
            {duplicated.map((item, i) => (
              <Link
                key={`${item.href}-${i}`}
                href={item.href}
                className="shrink-0 text-sm text-white/90 underline decoration-white/30 underline-offset-2 transition hover:text-white hover:decoration-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
