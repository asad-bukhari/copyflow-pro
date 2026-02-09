import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { DollarSign, ShoppingCart, Download } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { mockApi } from "@/services/mock-data";

const RANGES = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
] as const;

export default function Reports() {
  const [rangeDays, setRangeDays] = useState(7);

  const { data: dailyRevenue = [] } = useQuery({
    queryKey: ["daily-revenue", rangeDays],
    queryFn: () => mockApi.getDailyRevenue(rangeDays),
  });

  const { data: serviceDistro = [] } = useQuery({
    queryKey: ["service-distribution"],
    queryFn: () => mockApi.getServiceDistribution(),
  });

  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dailyRevenue.reduce((s, d) => s + d.orders, 0);

  const exportCSV = () => {
    const header = "Date,Revenue,Orders\n";
    const rows = dailyRevenue.map((d) => `${d.date},${d.revenue},${d.orders}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Revenue analytics and insights</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              variant={rangeDays === r.days ? "default" : "outline"}
              size="sm"
              onClick={() => setRangeDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1 h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title={`Revenue (${rangeDays}d)`}
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
        />
        <MetricCard
          title={`Orders (${rangeDays}d)`}
          value={String(totalOrders)}
          icon={ShoppingCart}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220,13%,91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(224, 76%, 48%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(224,76%,48%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Service Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDistro.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="service_name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220,13%,91%)" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(224, 76%, 48%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceDistro.slice(0, 8).map((s) => (
                  <TableRow key={s.service_name}>
                    <TableCell className="font-medium">{s.service_name}</TableCell>
                    <TableCell className="text-right">{s.quantity}</TableCell>
                    <TableCell className="text-right">${s.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
