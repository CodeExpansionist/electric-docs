"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders, type Order } from "@/lib/orders-context";

const statusColors: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "bg-blue-100", text: "text-blue-800" },
  processing: { bg: "bg-yellow-100", text: "text-yellow-800" },
  dispatched: { bg: "bg-purple-100", text: "text-purple-800" },
  delivered: { bg: "bg-green-100", text: "text-green-800" },
};

function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  return (
    <span className={`${colors.bg} ${colors.text} text-xs font-semibold px-2.5 py-1 rounded-full capitalize`}>
      {status}
    </span>
  );
}

function OrderRow({ order, onSelect }: { order: Order; onSelect: () => void }) {
  return (
    <tr className="border-b border-border hover:bg-gray-50 cursor-pointer" onClick={onSelect}>
      <td className="py-3 px-4">
        <span className="text-sm font-semibold text-primary">{order.orderNumber}</span>
      </td>
      <td className="py-3 px-4 text-sm text-text-secondary">
        {new Date(order.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="py-3 px-4 text-sm text-text-primary">
        {order.delivery.firstName} {order.delivery.lastName}
      </td>
      <td className="py-3 px-4 text-sm text-text-secondary">{order.customer.email}</td>
      <td className="py-3 px-4 text-sm font-bold text-text-primary">
        £{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
      </td>
      <td className="py-3 px-4 text-sm text-text-secondary">{order.items.length}</td>
      <td className="py-3 px-4">
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Order {order.orderNumber}</h2>
          <p className="text-sm text-text-secondary">
            Placed on{" "}
            {new Date(order.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer details */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-text-primary mb-3">Customer Details</h3>
          <div className="text-sm text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">
              {order.delivery.title} {order.delivery.firstName} {order.delivery.lastName}
            </p>
            <p>{order.customer.email}</p>
            <p>{order.delivery.phone}</p>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-text-primary mb-3">Delivery Address</h3>
          <div className="text-sm text-text-secondary space-y-0.5">
            <p>{order.delivery.address1}</p>
            {order.delivery.address2 && <p>{order.delivery.address2}</p>}
            <p>
              {order.delivery.city}
              {order.delivery.county ? `, ${order.delivery.county}` : ""},{" "}
              {order.delivery.postcode}
            </p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-bold text-text-primary mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-16 h-16 bg-white border border-border rounded flex items-center justify-center flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={56}
                  height={56}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-secondary mt-1">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-text-primary">
                £{(item.price * item.quantity).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span>£{order.subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Delivery</span>
            <span>{order.deliveryCost === 0 ? "FREE" : `£${order.deliveryCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-border pt-2">
            <span>Total</span>
            <span>£{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-text-primary mb-3">Payment</h3>
        <p className="text-sm text-text-secondary">{order.paymentMethod}</p>
        <p className="text-sm text-text-secondary mt-1">
          Estimated delivery: {order.estimatedDelivery}
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { orders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "confirmed" || o.status === "processing").length;

  return (
    <div className="container-main py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
        <span>&gt;</span>
        <span className="text-text-primary">Admin Dashboard</span>
      </nav>

      <h1 className="text-2xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs text-text-secondary mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-text-primary">{totalOrders}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-text-secondary mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-text-primary">
            £{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-text-secondary mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-primary">{pendingOrders}</p>
        </div>
      </div>

      {selectedOrder ? (
        <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Orders</h2>
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-input-border rounded-md px-3 py-1.5 text-xs bg-white"
              >
                <option value="all">All orders</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders table */}
          {filteredOrders.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Order #</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Date</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Customer</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Email</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Total</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Items</th>
                      <th className="text-left text-xs font-semibold text-text-secondary py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onSelect={() => setSelectedOrder(order)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-text-secondary">No orders found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
