import { getAdminDealers } from "@/lib/data/admin-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { UK_CITIES } from "@/lib/constants";
import type { DealerStatus } from "@/generated/prisma";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: tSearchParams;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default async function AdminDealersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusParam = typeof sp.status === "string" ? sp.status : undefined;
  const cityParam = typeof sp.city === "string" ? sp.city : undefined;
  const searchParam = typeof sp.search === "string" ? sp.search : undefined;
  const pageParam = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const { dealers, total, page, totalPages, statusCounts } =
    await getAdminDealers({
      status:
        statusParam && statusParam !== "all"
          ? (statusParam as DealerStatus)
          : undefined,
      city: cityParam,
      search: searchParam,
      page: pageParam,
    });

  const totalAll = Object.values(statusCounts).reduce((s, c) => s + c, 0);

  return (
    <>
      <PageHeader
        title="Dealer Management"
        description={`${total} dealer${total !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "all" ? totalAll : (statusCounts[tab.value] ?? 0);
          const isActive =
            (tab.value === "all" && !statusParam) ||
            statusParam === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildFilterUrl(sp, "status", tab.value === "all" ? undefined : tab.value)}
            >
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
              >
                {tab.label} ({count})
              </Badge>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form className="flex items-center gap-2">
          {statusParam && (
            <input type="hidden" name="status" value={statusParam} />
          )}
          {cityParam && <input type="hidden" name="city" value={cityParam} />}
          <Input
            name="search"
            placeholder="Search dealers…"
            defaultValue={searchParam ?? ""}
            className="w-64"
          />
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <form>
          {statusParam && (
            <input type="hidden" name="status" value={statusParam} />
          )}
          {searchParam && (
            <input type="hidden" name="search" value={searchParam} />
          )}
          <Select name="city" defaultValue={cityParam ?? ""}>
            <SelectTrigger className="w-44" size="sm">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All cities</SelectItem>
              {UK_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <noscript>
            <Button type="submit" size="sm" variant="secondary">
              Filter
            </Button>
          </noscript>
        </form>
      </div>

      {dealers.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No dealers found.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Brands</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Inventory</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{dealer.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dealer.city}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground">
                        {dealer.email || dealer.user?.email || "—"}
                      </p>
                    </td>
                    <td className="max-w-48 truncate px-4 py-3 text-xs text-muted-foreground">
                      {dealer.dealerBrands
                        .map((db) => db.brand.name)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <DealerStatusBadge status={dealer.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dealer._count.leads}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dealer._count.inventoryItems}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(dealer.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/dealers/${dealer.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageUrl(sp, page - 1)}>Previous</Link>
                  </Button>
                )}
                {page < totalPages && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageUrl(sp, page + 1)}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function buildFilterUrl(
  sp: Record<string, string | string[] | undefined>,
  key: string,
  value: string | undefined,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page" && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/admin/dealers${qs ? `?${qs}` : ""}`;
}

function buildPageUrl(
  sp: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/admin/dealers?${params.toString()}`;
}

function DealerStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive"> = {
    ACTIVE: "default",
    PENDING: "secondary",
    SUSPENDED: "destructive",
  };
  return (
    <Badge variant={map[status] ?? "secondary"} className="text-xs">
      {status}
    </Badge>
  );
}
