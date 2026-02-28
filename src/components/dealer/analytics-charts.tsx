"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(215, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(40, 85%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(190, 70%, 45%)",
];

interface AnalyticsChartsProps {
  dailyLeads: { date: string; enquiries: number; testDrives: number }[];
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  testDrivesByStatus: { status: string; count: number }[];
  inventoryItems: {
    id: string;
    car: string;
    variant: string;
    leads: number;
    visibility: string;
    stockStatus: string;
  }[];
}

export function AnalyticsCharts({
  dailyLeads,
  leadsBySource,
  leadsByStatus,
  testDrivesByStatus,
  inventoryItems,
}: AnalyticsChartsProps) {
  const totalLeads = leadsByStatus.reduce((s, l) => s + l.count, 0);
  const completedLeads =
    leadsByStatus.find((l) => l.status === "COMPLETED")?.count ?? 0;
  const conversionRate =
    totalLeads > 0 ? ((completedLeads / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Leads over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads Over Time (90 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No lead data in this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyLeads}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) =>
                    new Date(String(v)).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="enquiries"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                  name="Enquiries"
                />
                <Line
                  type="monotone"
                  dataKey="testDrives"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  dot={false}
                  name="Test Drives"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead source breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsBySource.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={leadsBySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props) => {
                      const { name, percent } = props as { name: string; percent: number };
                      return `${name} (${(percent * 100).toFixed(0)}%)`;
                    }}
                  >
                    {leadsBySource.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversion funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center">
              <p className="text-3xl font-bold">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">
                Overall conversion rate ({completedLeads}/{totalLeads})
              </p>
            </div>
            {leadsByStatus.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadsByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    dataKey="status"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={90}
                    tickFormatter={(v: string) => v.replace("_", " ")}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Leads"]}
                    labelFormatter={(v) => String(v).replace("_", " ")}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {leadsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test drive status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Drive Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {testDrivesByStatus.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No test drive data.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={testDrivesByStatus}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.replace("_", " ")}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [value, "Test Drives"]}
                  labelFormatter={(v) => String(v).replace("_", " ")}
                />
                <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Inventory performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No inventory data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Car</th>
                    <th className="px-4 py-2 font-medium">Variant</th>
                    <th className="px-4 py-2 font-medium">Leads</th>
                    <th className="px-4 py-2 font-medium">Stock</th>
                    <th className="px-4 py-2 font-medium">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inventoryItems
                    .sort((a, b) => b.leads - a.leads)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-accent/30">
                        <td className="px-4 py-2">{item.car}</td>
                        <td className="px-4 py-2">{item.variant}</td>
                        <td className="px-4 py-2 font-semibold">
                          {item.leads}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              item.stockStatus === "IN_STOCK"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.stockStatus.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {item.visibility}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
