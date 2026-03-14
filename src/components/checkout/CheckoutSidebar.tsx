"use client";

import Link from "next/link";
import { useBasket } from "@/lib/basket-context";

export default function CheckoutSidebar() {
  const { basket } = useBasket();

  return (
    <div className="card p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-text-primary">In your basket</h3>
        <Link href="/basket" className="text-xs text-primary underline">
          Edit basket
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-5 mb-6">
        {basket.items.map((item) => (
          <div key={item.product.id} className="border-b border-border pb-4">
            <p className="text-xs text-text-primary font-medium leading-snug mb-2">
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
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Subtotal</span>
          <span className="text-sm text-text-primary">
            £{basket.subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Delivery</span>
          <span className={`text-sm ${basket.deliveryCost === 0 ? "text-green-600 font-semibold" : "text-text-primary"}`}>
            {basket.deliveryCost === 0 ? "FREE" : `£${basket.deliveryCost.toFixed(2)}`}
          </span>
        </div>
        {basket.promoDiscount && basket.promoDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">Promo ({basket.promoCode})</span>
            <span className="text-sm text-green-600">-£{basket.promoDiscount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-base font-bold text-text-primary">Total</span>
        <span className="text-xl font-bold text-text-primary">
          £{basket.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
