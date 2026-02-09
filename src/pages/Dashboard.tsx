import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import { mockApi } from "@/services/mock-data";

const CHART_COLORS = [
  "hsl(224, 76%, 48%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 52%, 47%)",
  "hsl(190, 90%, 40%)",
  "hsl(340, 65%, 47%)",
  "hsl(30, 80%, 55%)",
];

export default function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => mockApi.getDashboardMetrics(),
  });

  const { data: revenue } = useQuery({
    queryKey: ["daily-revenue", 7],
    queryFn: () => mockApi.getDailyRevenue(7),
  });

  const { data: serviceDistro } = useQuery({
    queryKey: ["service-distribution"],
    queryFn: () => mockApi.getServiceDistribution(),
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => mockApi.getOrders(),
  });

  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business today</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue Today"
          value={`$${(metrics?.revenue_today ?? 0).toFixed(2)}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Orders Today"
          value={String(metrics?.orders_today ?? 0)}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Active Customers"
          value={String(metrics?.active_customers ?? 0)}
          icon={Users}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${(metrics?.avg_order_value ?? 0).toFixed(2)}`}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(220, 13%, 91%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(224, 76%, 48%)"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(224, 76%, 48%)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistro?.slice(0, 6) ?? []}
                    dataKey="revenue"
                    nameKey="service_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {serviceDistro?.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value: string) =>
                      value.length > 14 ? value.slice(0, 14) + "…" : value
                    }
                  />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.invoice_no}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {format(new Date(order.created_at), "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
