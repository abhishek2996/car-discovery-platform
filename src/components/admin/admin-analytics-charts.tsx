"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(215,70%,55%)", "hsl(150,60%,45%)", "hsl(40,85%,55%)", "hsl(0,70%,55%)", "hsl(280,60%,55%)", "hsl(190,70%,45%)"];

interface Props {
  dailyLeads: { date: string; enquiries: number; testDrives: number }[];
  leadsBySource: { source: string; count: number }[];
  leadsByCity: { city: string; count: number }[];
  popularBrands: { name: string; leads: number; variants: number }[];
}

export function AdminAnalyticsCharts({ dailyLeads, leadsBySource, leadsByCity, popularBrands }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Leads Over Time</CardTitle></CardHeader>
        <CardContent>
          {dailyLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No lead data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyLeads}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(String(v)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                <Line type="monotone" dataKey="enquiries" stroke={COLORS[0]} strokeWidth={2} dot={false} name="Enquiries" />
                <Line type="monotone" dataKey="testDrives" stroke={COLORS[1]} strokeWidth={2} dot={false} name="Test Drives" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Lead Sources</CardTitle></CardHeader>
          <CardContent>
            {leadsBySource.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={leadsBySource} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80}
                    label={(props) => { const { name, percent } = props as { name: string; percent: number }; return `${name} (${(percent * 100).toFixed(0)}%)`; }}>
                    {leadsBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Demand by City</CardTitle></CardHeader>
          <CardContent>
            {leadsByCity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={leadsByCity.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip formatter={(value) => [value, "Dealers"]} />
                  <Bar dataKey="count" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Popular Models (by Leads)</CardTitle></CardHeader>
        <CardContent>
          {popularBrands.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={popularBrands}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Leads" />
                <Bar dataKey="variants" fill={COLORS[2]} radius={[4, 4, 0, 0]} name="Variants" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
