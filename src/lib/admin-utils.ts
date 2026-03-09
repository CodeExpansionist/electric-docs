import type { Order } from "./orders-context";
import type { ProductDetail } from "./product-data";

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgOrderValue: number;
  statusCounts: Record<string, number>;
}

export interface AdminCustomer {
  email: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export function computeAdminStats(orders: Order[]): AdminStats {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "processing"
  ).length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  return { totalOrders, totalRevenue, pendingOrders, avgOrderValue, statusCounts };
}

export function deriveCustomers(orders: Order[]): AdminCustomer[] {
  const map = new Map<string, AdminCustomer>();
  for (const order of orders) {
    const email = order.customer.email;
    const existing = map.get(email);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.total;
      existing.orders.push(order);
      if (order.date > existing.lastOrderDate) {
        existing.lastOrderDate = order.date;
        existing.name = `${order.delivery.firstName} ${order.delivery.lastName}`;
      }
    } else {
      map.set(email, {
        email,
        name: `${order.delivery.firstName} ${order.delivery.lastName}`,
        phone: order.delivery.phone,
        address: `${order.delivery.address1}, ${order.delivery.city}, ${order.delivery.postcode}`,
        totalOrders: 1,
        totalSpent: order.total,
        lastOrderDate: order.date,
        orders: [order],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export function searchOrders(orders: Order[], query: string): Order[] {
  if (!query.trim()) return orders;
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      `${o.delivery.firstName} ${o.delivery.lastName}`.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
  );
}

export function searchProducts(products: ProductDetail[], query: string): ProductDetail[] {
  if (!query.trim()) return products;
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  );
}

export function searchCustomers(customers: AdminCustomer[], query: string): AdminCustomer[] {
  if (!query.trim()) return customers;
  const q = query.toLowerCase();
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
  );
}

export function filterByDateRange(orders: Order[], range: "7d" | "30d" | "all"): Order[] {
  if (range === "all") return orders;
  const now = Date.now();
  const ms = range === "7d" ? 7 * 86400000 : 30 * 86400000;
  return orders.filter((o) => now - new Date(o.date).getTime() <= ms);
}

function escapeCSVField(value: string | number): string {
  const str = String(value);
  const needsQuoting = str.includes(",") || str.includes('"') || str.includes("\n") || /^[=+\-@\t\r]/.test(str);
  if (!needsQuoting) return str;
  return `"${str.replace(/"/g, '""')}"`;
}

export function ordersToCSV(orders: Order[]): string {
  const header = "Order Number,Date,Customer,Email,Items,Total,Status";
  const rows = orders.map((o) =>
    [
      escapeCSVField(o.orderNumber),
      escapeCSVField(new Date(o.date).toLocaleDateString("en-GB")),
      escapeCSVField(`${o.delivery.firstName} ${o.delivery.lastName}`),
      escapeCSVField(o.customer.email),
      escapeCSVField(o.items.length),
      escapeCSVField(o.total.toFixed(2)),
      escapeCSVField(o.status),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
