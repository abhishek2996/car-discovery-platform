import { requireDealer } from "@/lib/auth";
import { getDealerAnalytics } from "@/lib/data/dealer-dashboard";
import { PageHeader } from "@/ui/app-shell";
import { AnalyticsCharts } from "@/components/dealer/analytics-charts";

export default async function AnalyticsPage() {
  const user = await requireDealer();
  const data = await getDealerAnalytics(user.dealerId!);

  const dailyLeads = aggregateByDay(data.leadsOverTime);

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Leads, conversions, and performance over the last 90 days"
      />
      <AnalyticsCharts
        dailyLeads={dailyLeads}
        leadsBySource={data.leadsBySource}
        leadsByStatus={data.leadsByStatus}
        testDrivesByStatus={data.testDrivesByStatus}
        inventoryItems={data.inventoryItems.map((item) => ({
          id: item.id,
          car: `${item.variant.model.brand.name} ${item.variant.model.name}`,
          variant: item.variant.name,
          leads: item.variant._count.leads,
          visibility: item.visibility,
          stockStatus: item.stockStatus ?? "—",
        }))}
      />
    </>
  );
}

function aggregateByDay(
  leads: { createdAt: Date; type: string; status: string }[],
) {
  const map = new Map<string, { date: string; enquiries: number; testDrives: number }>();

  for (const lead of leads) {
    const day = lead.createdAt.toISOString().slice(0, 10);
    const entry = map.get(day) ?? { date: day, enquiries: 0, testDrives: 0 };
    if (lead.type === "TEST_DRIVE") entry.testDrives++;
    else entry.enquiries++;
    map.set(day, entry);
  }

  const result = Array.from(map.values());
  result.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}
