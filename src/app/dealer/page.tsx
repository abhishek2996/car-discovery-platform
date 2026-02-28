import { requireDealer } from "@/lib/auth";
import { getDealerOverview } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Users, Car, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import Link from "next/link";

export default async function DealerDashboardPage() {
  const user = await requireDealer();
  const overview = await getDealerOverview(user.dealerId!);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your dealership performance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory"
          value={overview.totalInventory}
          subtitle={`${overview.visibleInventory} visible`}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          href="/dealer/inventory"
        />
        <StatCard
          title="Total Leads"
          value={overview.totalLeads}
          subtitle={`${overview.newLeads} new`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          href="/dealer/leads"
        />
        <StatCard
          title="Leads (30 days)"
          value={overview.leadsLast30}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          href="/dealer/analytics"
        />
        <StatCard
          title="Upcoming Test Drives"
          value={overview.upcomingTestDrives}
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
          href="/dealer/test-drives"
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Leads</h2>
          <Link
            href="/dealer/leads"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {overview.recentLeads.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No leads yet. They will appear here when buyers submit enquiries.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {overview.recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/dealer/leads/${lead.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {lead.buyer.name || lead.buyer.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lead.carModel
                      ? `${lead.carModel.brand.name} ${lead.carModel.name}`
                      : "General enquiry"}
                    {lead.carVariant ? ` – ${lead.carVariant.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={lead.type === "TEST_DRIVE" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {lead.type === "TEST_DRIVE" ? "Test Drive" : "Enquiry"}
                  </Badge>
                  <LeadStatusBadge status={lead.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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
