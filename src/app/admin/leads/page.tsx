import {
  getAdminLeads,
  getAllDealersForSelect,
} from "@/lib/data/admin-dashboard";
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
import {
  LeadStatusSelect,
  ReassignLeadDialog,
} from "@/components/admin/lead-actions";
import Link from "next/link";
import type { LeadStatus } from "@/generated/prisma";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  searchParams: tSearchParams;
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusParam = typeof sp.status === "string" ? sp.status : undefined;
  const dealerParam = typeof sp.dealer === "string" ? sp.dealer : undefined;
  const searchParam = typeof sp.search === "string" ? sp.search : undefined;
  const pageParam = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const [{ leads, total, page, totalPages }, allDealers] = await Promise.all([
    getAdminLeads({
      status:
        statusParam && statusParam !== "all"
          ? (statusParam as LeadStatus)
          : undefined,
      dealerId: dealerParam,
      search: searchParam,
      page: pageParam,
    }),
    getAllDealersForSelect(),
  ]);

  return (
    <>
      <PageHeader
        title="Lead Oversight"
        description={`${total} lead${total !== 1 ? "s" : ""}`}
      />

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive =
            (tab.value === "all" && !statusParam) ||
            statusParam === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildFilterUrl(
                sp,
                "status",
                tab.value === "all" ? undefined : tab.value,
              )}
            >
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
              >
                {tab.label}
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
          {dealerParam && (
            <input type="hidden" name="dealer" value={dealerParam} />
          )}
          <Input
            name="search"
            placeholder="Search leads…"
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
          <Select name="dealer" defaultValue={dealerParam ?? ""}>
            <SelectTrigger className="w-52" size="sm">
              <SelectValue placeholder="All dealers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All dealers</SelectItem>
              {allDealers.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                  {d.city ? ` (${d.city})` : ""}
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

      {leads.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No leads found.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Dealer</th>
                  <th className="px-4 py-3 font-medium">Car</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {lead.buyer?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.buyer?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {lead.dealer ? (
                        <Link
                          href={`/admin/dealers/${lead.dealer.id}`}
                          className="text-primary hover:underline"
                        >
                          {lead.dealer.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.carModel
                        ? `${lead.carModel.brand.name} ${lead.carModel.name}`
                        : "General"}
                      {lead.carVariant ? (
                        <span className="text-muted-foreground">
                          {" "}
                          – {lead.carVariant.name}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          lead.type === "TEST_DRIVE" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {lead.type === "TEST_DRIVE" ? "Test Drive" : "Enquiry"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lead.source?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LeadStatusSelect
                          leadId={lead.id}
                          currentStatus={lead.status}
                        />
                        <ReassignLeadDialog
                          leadId={lead.id}
                          dealers={allDealers}
                        />
                      </div>
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
  return `/admin/leads${qs ? `?${qs}` : ""}`;
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
  return `/admin/leads?${params.toString()}`;
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    NEW: "default",
    CONTACTED: "secondary",
    IN_PROGRESS: "secondary",
    COMPLETED: "outline",
    DROPPED: "destructive",
  };
  return (
    <Badge variant={map[status] ?? "secondary"} className="text-xs">
      {status.replace("_", " ")}
    </Badge>
  );
}
