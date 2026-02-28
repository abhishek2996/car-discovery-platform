import { getAdminOverview, getAdminAnalytics } from "@/lib/data/admin-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, Inbox, Package, Car, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { AdminAnalyticsCharts } from "@/components/admin/admin-analytics-charts";

export default async function AdminDashboardPage() {
  const [overview, analytics] = await Promise.all([
    getAdminOverview(),
    getAdminAnalytics(),
  ]);

  const dailyLeads = aggregateByDay(analytics.leadsOverTime);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and key metrics"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={overview.totalLeads} subtitle={`${overview.leadsLast30} last 30 days`} icon={<Inbox className="h-4 w-4 text-muted-foreground" />} href="/admin/leads" />
        <StatCard title="Active Dealers" value={overview.activeDealers} subtitle={overview.pendingDealers > 0 ? `${overview.pendingDealers} pending` : undefined} icon={<Store className="h-4 w-4 text-muted-foreground" />} href="/admin/dealers" />
        <StatCard title="Registered Buyers" value={overview.totalBuyers} icon={<Users className="h-4 w-4 text-muted-foreground" />} href="/admin/users" />
        <StatCard title="Active Listings" value={overview.activeListings} icon={<Package className="h-4 w-4 text-muted-foreground" />} href="/admin/catalog" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard title="Brands" value={overview.totalBrands} icon={<Car className="h-4 w-4 text-muted-foreground" />} href="/admin/catalog" />
        <StatCard title="Models" value={overview.totalModels} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} href="/admin/catalog/models" />
      </div>

      {overview.pendingDealers > 0 && (
        <Link href="/admin/dealers?status=PENDING" className="mt-6 block">
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30">
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {overview.pendingDealers} dealer registration{overview.pendingDealers !== 1 ? "s" : ""} awaiting approval
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Click to review</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Analytics (Last 90 Days)</h2>
        <AdminAnalyticsCharts
          dailyLeads={dailyLeads}
          leadsBySource={analytics.leadsBySource.map((s) => ({
            source: s.source ?? "Unknown",
            count: s._count,
          }))}
          leadsByCity={analytics.leadsByCity.map((c) => ({
            city: c.city,
            count: c._count,
          }))}
          popularBrands={analytics.popularBrands.map((m) => ({
            name: `${m.brand.name} ${m.name}`,
            leads: m._count.leads,
            variants: m._count.variants,
          }))}
        />
      </div>
    </>
  );
}

function StatCard({ title, value, subtitle, icon, href }: { title: string; value: number; subtitle?: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function aggregateByDay(leads: { createdAt: Date; type: string }[]) {
  const map = new Map<string, { date: string; enquiries: number; testDrives: number }>();
  for (const lead of leads) {
    const day = lead.createdAt.toISOString().slice(0, 10);
    const entry = map.get(day) ?? { date: day, enquiries: 0, testDrives: 0 };
    if (lead.type === "TEST_DRIVE") entry.testDrives++;
    else entry.enquiries++;
    map.set(day, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
