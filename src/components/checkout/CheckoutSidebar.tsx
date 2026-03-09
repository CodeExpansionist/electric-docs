"use client";

import Link from "next/link";
import { useBasket } from "@/lib/basket-context";

export default function CheckoutSidebar() {
  const { basket } = useBasket();

  return (
    <div className="card p-5 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">In your basket</h3>
        <Link href="/basket" className="text-xs text-primary hover:underline">
          Edit basket
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-4 mb-4">
        {basket.items.map((item) => (
          <div key={item.product.id} className="border-b border-border pb-3">
            <p className="text-xs text-text-primary font-medium leading-snug mb-1">
              {item.product.title}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Quantity: {item.quantity}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                £{(item.product.price.current * item.quantity).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Subtotal</span>
          <span className="text-xs text-text-primary">
            £{basket.subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Delivery</span>
          <span className="text-xs text-text-muted">
            {basket.deliveryCost > 0
              ? `£${basket.deliveryCost.toFixed(2)}`
              : "—"}
          </span>
        </div>
        {basket.promoDiscount && basket.promoDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600">Promo ({basket.promoCode})</span>
            <span className="text-xs text-green-600">-£{basket.promoDiscount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-base font-bold text-text-primary">Total</span>
        <span className="text-xl font-bold text-text-primary">
          £{basket.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
