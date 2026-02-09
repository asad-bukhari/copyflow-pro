import { format, subDays } from "date-fns";
import type {
  User, Service, Customer, Order, OrderItem,
  DashboardMetrics, DailyReport, ServiceReport,
  CreateOrderPayload, OrderStatus,
} from "@/types";

// ─── Seed data ───────────────────────────────────────────────

let services: Service[] = [
  { id: "svc_001", name: "B&W Copy (A4)", description: "Black and white photocopy, A4 size", price: 0.10, unit_type: "page", is_active: true, created_at: "2024-01-15T10:00:00Z" },
  { id: "svc_002", name: "Color Copy (A4)", description: "Full color photocopy, A4 size", price: 0.50, unit_type: "page", is_active: true, created_at: "2024-01-15T10:00:00Z" },
  { id: "svc_003", name: "B&W Copy (A3)", description: "Black and white photocopy, A3 size", price: 0.20, unit_type: "page", is_active: true, created_at: "2024-01-16T10:00:00Z" },
  { id: "svc_004", name: "Color Copy (A3)", description: "Full color photocopy, A3 size", price: 1.00, unit_type: "page", is_active: true, created_at: "2024-01-16T10:00:00Z" },
  { id: "svc_005", name: "Lamination (A4)", description: "Document lamination, A4 size", price: 2.00, unit_type: "sheet", is_active: true, created_at: "2024-01-17T10:00:00Z" },
  { id: "svc_006", name: "Spiral Binding", description: "Spiral binding for documents", price: 3.50, unit_type: "piece", is_active: true, created_at: "2024-01-17T10:00:00Z" },
  { id: "svc_007", name: "Document Scanning", description: "High-quality document scanning", price: 0.15, unit_type: "page", is_active: true, created_at: "2024-01-18T10:00:00Z" },
  { id: "svc_008", name: "ID Photo Print", description: "Passport/ID photo printing", price: 5.00, unit_type: "set", is_active: true, created_at: "2024-01-18T10:00:00Z" },
  { id: "svc_009", name: "Banner Printing", description: "Large format banner printing", price: 15.00, unit_type: "sq ft", is_active: false, created_at: "2024-01-19T10:00:00Z" },
  { id: "svc_010", name: "Business Cards", description: "Professional business card printing", price: 25.00, unit_type: "100 pcs", is_active: true, created_at: "2024-01-19T10:00:00Z" },
];

let customers: Customer[] = [
  { id: "cst_001", name: "John Smith", phone: "555-0101", email: "john@email.com", total_orders: 12, total_spent: 156.50, created_at: "2024-02-01T10:00:00Z" },
  { id: "cst_002", name: "Sarah Johnson", phone: "555-0102", email: "sarah@email.com", total_orders: 8, total_spent: 95.20, created_at: "2024-02-05T10:00:00Z" },
  { id: "cst_003", name: "Michael Chen", phone: "555-0103", email: "mchen@email.com", total_orders: 15, total_spent: 312.00, created_at: "2024-02-10T10:00:00Z" },
  { id: "cst_004", name: "Emily Davis", phone: "555-0104", email: "emily.d@email.com", total_orders: 5, total_spent: 42.80, created_at: "2024-02-15T10:00:00Z" },
  { id: "cst_005", name: "David Wilson", phone: "555-0105", email: "dwilson@email.com", total_orders: 20, total_spent: 478.60, created_at: "2024-03-01T10:00:00Z" },
  { id: "cst_006", name: "Lisa Anderson", phone: "555-0106", email: "lisa.a@email.com", total_orders: 3, total_spent: 28.50, created_at: "2024-03-10T10:00:00Z" },
  { id: "cst_007", name: "Robert Taylor", phone: "555-0107", email: "rtaylor@email.com", total_orders: 9, total_spent: 167.90, created_at: "2024-03-15T10:00:00Z" },
  { id: "cst_008", name: "Jennifer Brown", phone: "555-0108", email: "jbrown@email.com", total_orders: 6, total_spent: 89.30, created_at: "2024-04-01T10:00:00Z" },
  { id: "cst_009", name: "James Martinez", phone: "555-0109", email: "jmartinez@email.com", total_orders: 11, total_spent: 234.10, created_at: "2024-04-05T10:00:00Z" },
  { id: "cst_010", name: "Amanda Garcia", phone: "555-0110", email: "agarcia@email.com", total_orders: 7, total_spent: 128.70, created_at: "2024-04-10T10:00:00Z" },
];

const makeItems = (pairs: [string, number][]): OrderItem[] =>
  pairs.map(([svcId, qty], i) => {
    const svc = services.find((s) => s.id === svcId)!;
    return {
      id: `itm_${i}`,
      service_id: svcId,
      service_name: svc.name,
      quantity: qty,
      unit_price: svc.price,
      total: +(svc.price * qty).toFixed(2),
    };
  });

const orderSeed: Omit<Order, "items" | "total">[] = [
  { id: "ord_001", invoice_no: "INV-20260208-001", customer_id: "cst_001", customer_name: "John Smith", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 0).toISOString() },
  { id: "ord_002", invoice_no: "INV-20260208-002", customer_id: "cst_003", customer_name: "Michael Chen", status: "completed", payment_method: "card", notes: "Rush order", created_at: subDays(new Date(), 0).toISOString() },
  { id: "ord_003", invoice_no: "INV-20260207-001", customer_id: "cst_005", customer_name: "David Wilson", status: "completed", payment_method: "transfer", notes: "", created_at: subDays(new Date(), 1).toISOString() },
  { id: "ord_004", invoice_no: "INV-20260207-002", customer_id: "cst_002", customer_name: "Sarah Johnson", status: "pending", payment_method: "cash", notes: "Pickup tomorrow", created_at: subDays(new Date(), 1).toISOString() },
  { id: "ord_005", invoice_no: "INV-20260206-001", customer_id: "cst_007", customer_name: "Robert Taylor", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 2).toISOString() },
  { id: "ord_006", invoice_no: "INV-20260206-002", customer_id: "cst_004", customer_name: "Emily Davis", status: "cancelled", payment_method: "card", notes: "Customer changed mind", created_at: subDays(new Date(), 2).toISOString() },
  { id: "ord_007", invoice_no: "INV-20260205-001", customer_id: "cst_009", customer_name: "James Martinez", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 3).toISOString() },
  { id: "ord_008", invoice_no: "INV-20260205-002", customer_id: "cst_010", customer_name: "Amanda Garcia", status: "completed", payment_method: "transfer", notes: "", created_at: subDays(new Date(), 3).toISOString() },
  { id: "ord_009", invoice_no: "INV-20260204-001", customer_id: "cst_001", customer_name: "John Smith", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 4).toISOString() },
  { id: "ord_010", invoice_no: "INV-20260204-002", customer_id: "cst_006", customer_name: "Lisa Anderson", status: "pending", payment_method: "cash", notes: "", created_at: subDays(new Date(), 4).toISOString() },
  { id: "ord_011", invoice_no: "INV-20260203-001", customer_id: "cst_008", customer_name: "Jennifer Brown", status: "completed", payment_method: "card", notes: "", created_at: subDays(new Date(), 5).toISOString() },
  { id: "ord_012", invoice_no: "INV-20260202-001", customer_id: "cst_003", customer_name: "Michael Chen", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 6).toISOString() },
  { id: "ord_013", invoice_no: "INV-20260201-001", customer_id: "cst_005", customer_name: "David Wilson", status: "completed", payment_method: "transfer", notes: "Monthly printing", created_at: subDays(new Date(), 7).toISOString() },
  { id: "ord_014", invoice_no: "INV-20260131-001", customer_id: "cst_002", customer_name: "Sarah Johnson", status: "completed", payment_method: "cash", notes: "", created_at: subDays(new Date(), 8).toISOString() },
  { id: "ord_015", invoice_no: "INV-20260130-001", customer_id: "cst_009", customer_name: "James Martinez", status: "completed", payment_method: "card", notes: "", created_at: subDays(new Date(), 9).toISOString() },
];

const orderItemSets: [string, number][][] = [
  [["svc_001", 50], ["svc_005", 3]],
  [["svc_002", 20], ["svc_006", 2]],
  [["svc_001", 100], ["svc_002", 30], ["svc_006", 1]],
  [["svc_008", 2], ["svc_001", 10]],
  [["svc_004", 15], ["svc_005", 5]],
  [["svc_002", 10]],
  [["svc_001", 200], ["svc_007", 50]],
  [["svc_010", 1], ["svc_001", 30]],
  [["svc_003", 40], ["svc_005", 2]],
  [["svc_001", 25], ["svc_002", 10]],
  [["svc_008", 3], ["svc_006", 1]],
  [["svc_002", 40], ["svc_001", 60]],
  [["svc_001", 150], ["svc_007", 80], ["svc_006", 3]],
  [["svc_004", 8], ["svc_005", 4]],
  [["svc_002", 25], ["svc_003", 15]],
];

let orders: Order[] = orderSeed.map((o, i) => {
  const items = makeItems(orderItemSets[i]);
  return { ...o, items, total: +items.reduce((s, it) => s + it.total, 0).toFixed(2) };
});

let nextId = { svc: 11, cst: 11, ord: 16 };

// ─── Simulated delay ────────────────────────────────────────
const delay = <T,>(val: T, ms = 200): Promise<T> =>
  new Promise((r) => setTimeout(() => r(val), ms));

// ─── Mock API ────────────────────────────────────────────────

export const mockApi = {
  // Auth
  login: (email: string, _password: string): Promise<{ token: string; user: User }> =>
    delay({
      token: "mock_jwt_token_" + Date.now(),
      user: { id: "usr_001", email, name: "Admin User", role: "admin" as const },
    }),

  getMe: (): Promise<User> =>
    delay({ id: "usr_001", email: "admin@copyshop.com", name: "Admin User", role: "admin" as const }),

  // Services
  getServices: (): Promise<Service[]> => delay([...services]),

  createService: (data: Omit<Service, "id" | "created_at">): Promise<Service> => {
    const svc: Service = { ...data, id: `svc_${String(nextId.svc++).padStart(3, "0")}`, created_at: new Date().toISOString() };
    services = [svc, ...services];
    return delay(svc);
  },

  updateService: (id: string, data: Partial<Service>): Promise<Service> => {
    services = services.map((s) => (s.id === id ? { ...s, ...data } : s));
    return delay(services.find((s) => s.id === id)!);
  },

  deleteService: (id: string): Promise<void> => {
    services = services.filter((s) => s.id !== id);
    return delay(undefined);
  },

  // Customers
  getCustomers: (): Promise<Customer[]> => delay([...customers]),

  createCustomer: (data: Omit<Customer, "id" | "total_orders" | "total_spent" | "created_at">): Promise<Customer> => {
    const c: Customer = { ...data, id: `cst_${String(nextId.cst++).padStart(3, "0")}`, total_orders: 0, total_spent: 0, created_at: new Date().toISOString() };
    customers = [c, ...customers];
    return delay(c);
  },

  updateCustomer: (id: string, data: Partial<Customer>): Promise<Customer> => {
    customers = customers.map((c) => (c.id === id ? { ...c, ...data } : c));
    return delay(customers.find((c) => c.id === id)!);
  },

  deleteCustomer: (id: string): Promise<void> => {
    customers = customers.filter((c) => c.id !== id);
    return delay(undefined);
  },

  // Orders
  getOrders: (): Promise<Order[]> => delay([...orders]),

  getOrder: (id: string): Promise<Order | undefined> => delay(orders.find((o) => o.id === id)),

  createOrder: (data: CreateOrderPayload): Promise<Order> => {
    const cust = customers.find((c) => c.id === data.customer_id);
    const items: OrderItem[] = data.items.map((it, i) => {
      const svc = services.find((s) => s.id === it.service_id)!;
      return {
        id: `itm_${Date.now()}_${i}`,
        service_id: it.service_id,
        service_name: svc.name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total: +(it.unit_price * it.quantity).toFixed(2),
      };
    });
    const total = +items.reduce((s, it) => s + it.total, 0).toFixed(2);
    const now = new Date();
    const ord: Order = {
      id: `ord_${String(nextId.ord++).padStart(3, "0")}`,
      invoice_no: `INV-${format(now, "yyyyMMdd")}-${String(nextId.ord).padStart(3, "0")}`,
      customer_id: data.customer_id,
      customer_name: cust?.name ?? "Unknown",
      items,
      total,
      status: "pending",
      payment_method: data.payment_method,
      notes: data.notes,
      created_at: now.toISOString(),
    };
    orders = [ord, ...orders];
    // update customer stats
    if (cust) {
      cust.total_orders += 1;
      cust.total_spent = +(cust.total_spent + total).toFixed(2);
    }
    return delay(ord);
  },

  updateOrderStatus: (id: string, status: OrderStatus): Promise<Order> => {
    orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    return delay(orders.find((o) => o.id === id)!);
  },

  deleteOrder: (id: string): Promise<void> => {
    orders = orders.filter((o) => o.id !== id);
    return delay(undefined);
  },

  // Reports
  getDashboardMetrics: (): Promise<DashboardMetrics> => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayOrders = orders.filter((o) => o.created_at.startsWith(today) && o.status !== "cancelled");
    const revenue = todayOrders.reduce((s, o) => s + o.total, 0);
    return delay({
      revenue_today: +revenue.toFixed(2),
      orders_today: todayOrders.length,
      active_customers: customers.length,
      avg_order_value: todayOrders.length ? +(revenue / todayOrders.length).toFixed(2) : 0,
    });
  },

  getDailyRevenue: (days: number): Promise<DailyReport[]> => {
    const result: DailyReport[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayOrders = orders.filter((o) => o.created_at.substring(0, 10) === d && o.status !== "cancelled");
      result.push({
        date: format(subDays(new Date(), i), "MMM dd"),
        revenue: +dayOrders.reduce((s, o) => s + o.total, 0).toFixed(2),
        orders: dayOrders.length,
      });
    }
    return delay(result);
  },

  getServiceDistribution: (): Promise<ServiceReport[]> => {
    const map: Record<string, { quantity: number; revenue: number }> = {};
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) =>
        o.items.forEach((it) => {
          if (!map[it.service_name]) map[it.service_name] = { quantity: 0, revenue: 0 };
          map[it.service_name].quantity += it.quantity;
          map[it.service_name].revenue += it.total;
        })
      );
    return delay(
      Object.entries(map)
        .map(([service_name, v]) => ({
          service_name,
          quantity: v.quantity,
          revenue: +v.revenue.toFixed(2),
        }))
        .sort((a, b) => b.revenue - a.revenue)
    );
  },
};
