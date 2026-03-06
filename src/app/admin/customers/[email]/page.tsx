"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrders, type Order } from "@/lib/orders-context";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import DataTable, { type Column } from "@/components/admin/DataTable";

export default function CustomerDetailPage({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email);
  const { orders } = useOrders();
  const router = useRouter();

  const customerOrders = useMemo(() => orders.filter((o) => o.customer.email === email), [orders, email]);
  const customer = customerOrders[0];

  if (!customer) {
    return (
      <div>
        <Link href="/admin/customers" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to customers
        </Link>
        <div className="card p-8 text-center">
          <p className="text-sm text-text-secondary">Customer not found.</p>
        </div>
      </div>
    );
  }

  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrder = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

  const orderColumns: Column<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (o) => <span className="font-semibold text-primary">{o.orderNumber}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (o) => (
        <span className="text-text-secondary">
          {new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (o) => <span className="text-text-secondary">{o.items.length}</span>,
    },
    {
      key: "total",
      label: "Total",
      render: (o) => <span className="font-bold">£{o.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (o) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to customers
      </Link>

      <h1 className="text-xl font-bold text-text-primary mb-1">
        {customer.delivery.firstName} {customer.delivery.lastName}
      </h1>
      <p className="text-sm text-text-secondary mb-6">{email}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Total Orders"
          value={customerOrders.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
        />
        <StatsCard
          label="Total Spent"
          value={`£${totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
        />
        <StatsCard
          label="Avg. Order Value"
          value={`£${avgOrder.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
      </div>

      {/* Contact Info */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-bold text-text-primary mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Email</span>
            <p className="text-text-primary mt-0.5">{email}</p>
          </div>
          <div>
            <span className="text-text-secondary">Phone</span>
            <p className="text-text-primary mt-0.5">{customer.delivery.phone}</p>
          </div>
          <div>
            <span className="text-text-secondary">Last Known Address</span>
            <p className="text-text-primary mt-0.5">
              {customer.delivery.address1}, {customer.delivery.city}, {customer.delivery.postcode}
            </p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <h3 className="text-sm font-bold text-text-primary mb-3">Order History</h3>
      <DataTable
        columns={orderColumns}
        data={customerOrders}
        keyExtractor={(o) => o.id}
        onRowClick={(o) => router.push(`/admin/orders/${o.orderNumber}`)}
        emptyMessage="No orders found."
        pageSize={10}
      />
    </div>
  );
}
