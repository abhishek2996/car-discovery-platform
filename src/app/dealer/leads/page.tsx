import { requireDealer } from "@/lib/auth";
import { getDealerLeads } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LeadFiltersBar } from "@/components/dealer/lead-filters";
import type { LeadStatus } from "@/generated/prisma";

type tSearchParams = Promise<Record<string, string | string[] | undefined>>;

interface PageProps {
  params: Promise<Record<string, never>>;
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

export default async function LeadsPage({ searchParams }: PageProps) {
  const user = await requireDealer();
  const sp = await searchParams;
  const statusParam = typeof sp.status === "string" ? sp.status : undefined;

  const filters = {
    status: statusParam && statusParam !== "all" ? (statusParam as LeadStatus) : undefined,
    type: typeof sp.type === "string" && sp.type !== "all"
      ? (sp.type as "ENQUIRY" | "TEST_DRIVE")
      : undefined,
    search: typeof sp.search === "string" ? sp.search : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : undefined,
    page: typeof sp.page === "string" ? parseInt(sp.page, 10) : 1,
  };

  const { leads, total, page, totalPages, statusCounts } =
    await getDealerLeads(user.dealerId!, filters);

  const totalAll = Object.values(statusCounts).reduce((s, c) => s + c, 0);

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${total} lead${total !== 1 ? "s" : ""}`}
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
              href={`/dealer/leads${tab.value === "all" ? "" : `?status=${tab.value}`}`}
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

      <LeadFiltersBar />

      {leads.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No leads found with the current filters.
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Buyer</th>
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
                          {lead.buyer.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.buyer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.carModel
                        ? `${lead.carModel.brand.name} ${lead.carModel.name}`
                        : "General"}
                      {lead.carVariant ? (
                        <span className="text-muted-foreground">
                          {" "}– {lead.carVariant.name}
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
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dealer/leads/${lead.id}`}>View</Link>
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

function buildPageUrl(
  sp: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/dealer/leads?${params.toString()}`;
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> =
    {
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
