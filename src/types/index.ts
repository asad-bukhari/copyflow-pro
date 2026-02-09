export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit_type: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export type OrderStatus = "pending" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "card" | "transfer" | "other";

export interface Order {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string;
  created_at: string;
}

export interface DailyReport {
  date: string;
  revenue: number;
  orders: number;
}

export interface ServiceReport {
  service_name: string;
  quantity: number;
  revenue: number;
}

export interface DashboardMetrics {
  revenue_today: number;
  orders_today: number;
  active_customers: number;
  avg_order_value: number;
}

export interface CreateOrderPayload {
  customer_id: string;
  items: { service_id: string; quantity: number; unit_price: number }[];
  payment_method: PaymentMethod;
  notes: string;
}
