"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrders } from "@/lib/orders-context";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusSelect from "@/components/admin/StatusSelect";

const timelineSteps = ["confirmed", "processing", "dispatched", "delivered"] as const;

function StatusTimeline({ current }: { current: string }) {
  const currentIdx = timelineSteps.indexOf(current as typeof timelineSteps[number]);
  return (
    <div className="flex items-center gap-0 w-full">
      {timelineSteps.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  done
                    ? isCurrent
                      ? "bg-primary text-white"
                      : "bg-success text-white"
                    : "bg-gray-200 text-text-secondary"
                }`}
              >
                {done && !isCurrent ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] mt-1 capitalize ${done ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                {step}
              </span>
            </div>
            {i < timelineSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-success" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const { orders, updateOrderStatus } = useOrders();
  const order = orders.find((o) => o.orderNumber === params.orderNumber);
  const [toast, setToast] = useState<string | null>(null);

  if (!order) {
    return (
      <div>
        <Link href="/admin/orders" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to orders
        </Link>
        <div className="card p-8 text-center">
          <p className="text-sm text-text-secondary">Order not found.</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: typeof order.status) => {
    updateOrderStatus(order.orderNumber, newStatus);
    setToast(`Status updated to ${newStatus}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      <Link href="/admin/orders" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Order {order.orderNumber}</h1>
          <p className="text-sm text-text-secondary">
            Placed on{" "}
            {new Date(order.date).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <StatusSelect currentStatus={order.status} onStatusChange={handleStatusChange} />
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-bold text-text-primary mb-4">Order Progress</h3>
        <StatusTimeline current={order.status} />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        <div className="card p-5">
          <h3 className="text-sm font-bold text-text-primary mb-3">Delivery Address</h3>
          <div className="text-sm text-text-secondary space-y-0.5">
            <p>{order.delivery.address1}</p>
            {order.delivery.address2 && <p>{order.delivery.address2}</p>}
            <p>
              {order.delivery.city}
              {order.delivery.county ? `, ${order.delivery.county}` : ""}, {order.delivery.postcode}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-bold text-text-primary mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-16 h-16 bg-white border border-border rounded flex items-center justify-center flex-shrink-0">
                <Image src={item.image} alt={item.title} width={56} height={56} className="object-contain" unoptimized />
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

      {/* Payment */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-text-primary mb-3">Payment</h3>
        <p className="text-sm text-text-secondary">{order.paymentMethod}</p>
        <p className="text-sm text-text-secondary mt-1">Estimated delivery: {order.estimatedDelivery}</p>
      </div>
    </div>
  );
}
