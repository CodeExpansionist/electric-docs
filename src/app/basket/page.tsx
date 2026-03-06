"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBasket } from "@/lib/basket-context";
import { useSaved } from "@/lib/saved-context";
import type { BasketItem as BasketItemType } from "@/lib/types";

const careOptions = [
  {
    id: "monthly",
    label: "Monthly pay",
    price: 3.49,
    period: "a month",
    annual: "Annual equivalent £53.01",
  },
  {
    id: "2year",
    label: "2 Years cover",
    price: 99.0,
    period: "",
    saving: null,
  },
  {
    id: "3year",
    label: "3 Years cover",
    price: 159.0,
    period: "",
    savingText: "Save £53.01 vs Monthly Plan",
  },
];

function BasketItemCard({
  item,
  onQuantityChange,
  onRemove,
  onSaveForLater,
}: {
  item: BasketItemType;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}) {
  return (
    <div className="border-b border-border pb-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product image */}
        <div className="w-[140px] flex-shrink-0 mx-auto sm:mx-0">
          <div className="aspect-square bg-white border border-border rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={item.product.images.main}
              alt={item.product.title}
              width={140}
              height={140}
              className="object-contain p-2"
              unoptimized
            />
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/product/${item.product.slug}`}
            className="text-sm font-bold text-text-primary no-underline hover:text-primary"
          >
            {item.product.title}
          </Link>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Quantity</label>
              <select
                value={item.quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                className="border border-input-border rounded-md px-2 py-1 text-xs bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onRemove}
              className="text-xs text-primary hover:underline"
            >
              Remove item
            </button>
            <button
              onClick={onSaveForLater}
              className="text-xs text-primary hover:underline"
            >
              Save for later
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <span className="text-lg font-bold text-text-primary">
            £{item.product.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
          {item.product.price.was && (
            <span className="text-xs text-text-muted line-through ml-2">
              Was £{item.product.price.was.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          )}
          {item.product.price.savings && item.product.price.savings > 0 && (
            <p className="text-xs text-sale font-semibold mt-0.5">
              Save £{item.product.price.savings.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Delivery info */}
      <div className="mt-4 text-xs text-text-secondary">
        <p className="mb-2">
          Delivery options available at checkout
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Delivery available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>FREE delivery on orders over £40</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Next day delivery available, order by 8pm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CareAndRepair() {
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");

  return (
    <div className="border-b border-border pb-6 mb-6">
      <h3 className="text-base font-bold text-text-primary mb-1">
        Care &amp; Repair
      </h3>
      <div className="text-xs text-text-secondary space-y-2 mb-4">
        <p className="font-semibold text-text-primary">
          Full replacement cover
        </p>
        <p>
          Full replacement: if your product fails within 7 calendar days or we
          need to repair it more than 3 times, we&apos;ll replace it for free.
        </p>
        <p>All parts, labour and call-out charges included.</p>
        <p>
          Free delivery and recycling if your product needs replacing.
        </p>
      </div>

      {/* Care plan options */}
      <div className="space-y-2 mb-4">
        {careOptions.map((option) => (
          <label
            key={option.id}
            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
              selectedPlan === option.id
                ? "border-primary bg-purple-50"
                : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="carePlan"
                value={option.id}
                checked={selectedPlan === option.id}
                onChange={() => setSelectedPlan(option.id)}
                className="accent-primary w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-text-primary">
                  {option.label}
                </span>
                {option.id === "monthly" && (
                  <span className="text-[10px] text-text-secondary ml-2">
                    {option.annual}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-text-primary">
                £{option.price.toFixed(2)}
              </span>
              {option.period && (
                <span className="text-xs text-text-secondary ml-1">
                  {option.period}
                </span>
              )}
              {"savingText" in option && option.savingText && (
                <p className="text-[10px] text-primary">{option.savingText}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <p className="text-[10px] text-text-muted leading-relaxed">
        By selecting one of these plans you agree to purchase Care &amp; Repair.
        Please read the{" "}
        <Link href="#" className="text-primary">
          Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-primary">
          Insurance Product Information
        </Link>{" "}
        carefully. If you change your mind you can cancel within 30 days of
        purchase (and up to 21 days of your Electriz Perks Free Trial).
      </p>
      <p className="text-[10px] text-text-muted mt-2">
        Covered in partnership with domestic &amp; general warranties for
        electrical goods. or{" "}
        <Link href="#" className="text-primary">
          www.electriz.co.uk
        </Link>
      </p>
    </div>
  );
}

function Installation() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="border-b border-border pb-6 mb-6">
      <h3 className="text-base font-bold text-text-primary mb-3">
        Installation
      </h3>
      <div className="text-xs text-text-secondary space-y-2 mb-4">
        <p className="font-semibold text-text-primary">
          Installation to stand
        </p>
        <p>Installation is ideal if:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Attach the TV to the table top stand or legs</li>
          <li>Connect and tune your TV</li>
        </ul>
      </div>

      <label className="flex items-center justify-between p-3 border border-border rounded-md cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => setSelected(!selected)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-xs font-semibold text-text-primary">
            Let&apos;s install it
          </span>
        </div>
        <span className="text-sm font-bold text-text-primary">£85.00</span>
      </label>
    </div>
  );
}

function Recycling() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="pb-6 mb-6">
      <h3 className="text-base font-bold text-text-primary mb-3">Recycling</h3>
      <div className="text-xs text-text-secondary space-y-2 mb-4">
        <p>On delivery we&apos;ll:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Remove your old, disconnected TV</li>
          <li>Remove your new TV packaging</li>
        </ul>
      </div>

      <label className="flex items-center justify-between p-3 border border-border rounded-md cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => setSelected(!selected)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-xs font-semibold text-text-primary">
            Let&apos;s recycle it
          </span>
        </div>
        <span className="text-sm font-bold text-text-primary">£65.00</span>
      </label>
    </div>
  );
}

function OrderSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  const [paymentTab, setPaymentTab] = useState<"card" | "paypal">("card");

  return (
    <div className="card p-5 sticky top-4">
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Order summary
      </h2>

      {/* Items subtotal */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        <span className="text-sm text-text-primary">
          £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Payment method toggle */}
      <div className="flex rounded-md overflow-hidden border border-border mb-4">
        <button
          onClick={() => setPaymentTab("card")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            paymentTab === "card"
              ? "bg-primary text-white"
              : "bg-white text-text-secondary"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="inline mr-1"
          >
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
          Card
        </button>
        <button
          onClick={() => setPaymentTab("paypal")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            paymentTab === "paypal"
              ? "bg-primary text-white"
              : "bg-white text-text-secondary"
          }`}
        >
          <span className="text-[#003087] font-bold">
            {paymentTab === "paypal" ? (
              <span className="text-white">PayPal</span>
            ) : (
              "PayPal"
            )}
          </span>
        </button>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-3 border-t border-border mb-4">
        <span className="text-base font-bold text-text-primary">Total</span>
        <span className="text-xl font-bold text-text-primary">
          £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="btn-primary w-full text-sm text-center block"
      >
        Continue to checkout
      </Link>
    </div>
  );
}

export default function BasketPage() {
  const { basket, updateQuantity, removeItem, itemCount } = useBasket();
  const { addSaved } = useSaved();

  const handleSaveForLater = (item: BasketItemType) => {
    addSaved(item.product);
    removeItem(item.product.id);
  };

  if (basket.items.length === 0) {
    return (
      <div className="container-main py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-text-muted">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Your basket is empty
        </h1>
        <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
          Looks like you haven&apos;t added anything to your basket yet. Browse our products to find something you love.
        </p>
        <Link href="/tv-and-audio" className="btn-primary text-sm no-underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-6">
      <h1 className="text-xl font-bold text-text-primary mb-6">
        Your basket ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left: Basket items + services */}
        <div className="flex-1 min-w-0">
          {/* Basket items */}
          {basket.items.map((item) => (
            <BasketItemCard
              key={item.product.id}
              item={item}
              onQuantityChange={(qty) => updateQuantity(item.product.id, qty)}
              onRemove={() => removeItem(item.product.id)}
              onSaveForLater={() => handleSaveForLater(item)}
            />
          ))}

          {/* Care & Repair */}
          <CareAndRepair />

          {/* Installation */}
          <Installation />

          {/* Recycling */}
          <Recycling />
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <OrderSummary subtotal={basket.subtotal} itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
}
