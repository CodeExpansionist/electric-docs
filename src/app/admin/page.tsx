"use client";

import Link from "next/link";
import { useOrders } from "@/lib/orders-context";
import { computeAdminStats } from "@/lib/admin-utils";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";

const statusBarColors: Record<string, string> = {
  confirmed: "bg-blue-400",
  processing: "bg-yellow-400",
  dispatched: "bg-purple-400",
  delivered: "bg-green-400",
};

export default function AdminDashboard() {
  const { orders } = useOrders();
  const stats = computeAdminStats(orders);
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
        />
        <StatsCard
          label="Total Revenue"
          value={`£${stats.totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
        />
        <StatsCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard
          label="Avg. Order Value"
          value={`£${stats.avgOrderValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders by Status */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {(["confirmed", "processing", "dispatched", "delivered"] as const).map((status) => {
              const count = stats.statusCounts[status] || 0;
              const pct = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusBarColors[status]} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right text-text-primary">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Manage Orders", href: "/admin/orders", desc: `${stats.totalOrders} total orders` },
              { label: "Browse Products", href: "/admin/products", desc: "View product catalog" },
              { label: "View Customers", href: "/admin/customers", desc: "Customer directory" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors no-underline group"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary">{action.label}</p>
                  <p className="text-xs text-text-secondary">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-text-secondary group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline no-underline">
            View all
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Order #</th>
                  <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Date</th>
                  <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Customer</th>
                  <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Total</th>
                  <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.orderNumber}`} className="text-sm font-semibold text-primary no-underline hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary">
                      {new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-primary">
                      {order.delivery.firstName} {order.delivery.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-text-primary">
                      £{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-text-secondary">No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
