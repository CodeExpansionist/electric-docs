"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrders } from "@/lib/orders-context";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const { getOrder } = useOrders();
  const order = getOrder(orderNumber);

  return (
    <div className="container-main py-12">
      <div className="max-w-2xl mx-auto">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Thank you for your order!</h1>
          <p className="text-sm text-text-secondary">
            Your order has been confirmed and is being processed.
          </p>
        </div>

        {/* Order number */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">Order number</p>
              <p data-testid="order-number" className="text-xl font-bold text-primary">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary mb-1">Order date</p>
              <p className="text-sm font-semibold text-text-primary">
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-secondary mb-1">Estimated delivery</p>
            <p className="text-sm font-semibold text-text-primary">
              {order?.estimatedDelivery || "3-5 working days"}
            </p>
          </div>
        </div>

        {/* Order items */}
        {order && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-bold text-text-primary mb-4">Order items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
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
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">
                    £{item.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">
                  £{order.subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Delivery</span>
                <span className="text-text-primary">
                  {order.deliveryCost === 0 ? "FREE" : `£${order.deliveryCost.toFixed(2)}`}
                </span>
              </div>
              {order.promoDiscount && order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo ({order.promoCode})</span>
                  <span className="text-green-600">-£{order.promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                <span className="text-text-primary">Total</span>
                <span className="text-text-primary">
                  £{order.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-bold text-text-primary mb-3">Delivery address</h2>
            <div className="text-sm text-text-secondary space-y-0.5">
              <p>
                {order.delivery.title} {order.delivery.firstName} {order.delivery.lastName}
              </p>
              <p>{order.delivery.address1}</p>
              {order.delivery.address2 && <p>{order.delivery.address2}</p>}
              <p>
                {order.delivery.city}
                {order.delivery.county ? `, ${order.delivery.county}` : ""},{" "}
                {order.delivery.postcode}
              </p>
              <p>{order.delivery.phone}</p>
            </div>
          </div>
        )}

        {/* Payment method */}
        {order && (
          <div className="card p-6 mb-6">
            <h2 className="text-base font-bold text-text-primary mb-3">Payment method</h2>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>{order.paymentMethod}</span>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="card p-6 mb-8">
          <h2 className="text-base font-bold text-text-primary mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C12A1" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Confirmation email</p>
                <p className="text-xs text-text-secondary">
                  We&apos;ll send you a confirmation email with your order details.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C12A1" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Delivery updates</p>
                <p className="text-xs text-text-secondary">
                  We&apos;ll keep you updated with delivery tracking information.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C12A1" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Enjoy your purchase</p>
                <p className="text-xs text-text-secondary">
                  Your item will be delivered to your door.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account" className="btn-outline flex-1 text-center no-underline">
            View my orders
          </Link>
          <Link href="/" className="btn-primary flex-1 text-center no-underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-12 text-center">
          <p className="text-sm text-text-secondary">Loading order details...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
