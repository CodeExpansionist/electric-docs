"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBasket } from "@/lib/basket-context";
import { useSaved } from "@/lib/saved-context";
import type { BasketItem as BasketItemType } from "@/lib/types";
import EnergyRatingBadge from "@/components/ui/EnergyRatingBadge";

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
    <div data-testid="basket-item" className="pb-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product image — clickable, no border */}
        <Link href={`/products/${item.product.slug}`} className="w-[200px] flex-shrink-0 mx-auto sm:mx-0 block">
          <div className="aspect-square bg-white flex items-center justify-center">
            <Image
              src={item.product.images.main}
              alt={item.product.title}
              width={200}
              height={200}
              className="object-contain p-2"
              unoptimized
            />
          </div>
        </Link>

        {/* Info area — full width right of image, contains everything */}
        <div className="flex-1 min-w-0">
          {/* Title — full width */}
          <Link
            href={`/products/${item.product.slug}`}
            className="text-base font-normal text-text-primary no-underline hover:text-primary"
          >
            {item.product.title}
          </Link>

          {/* Qty + Price row */}
          <div className="flex items-center mt-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Quantity</label>
              <select
                value={item.quantity}
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                className="border border-input-border rounded-md px-3 py-1.5 text-sm bg-white min-w-[60px]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            {/* Price + Was/Savings — right-aligned */}
            <div className="ml-auto text-right">
              <span className="text-xl font-bold text-text-primary">
                £{item.product.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
              {item.product.price.was && (
                <p className="text-xs text-text-muted line-through mt-0.5">
                  Was £{item.product.price.was.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              )}
              {item.product.price.savings && item.product.price.savings > 0 && (
                <p className="text-xs text-badge font-semibold mt-0.5">
                  Save £{item.product.price.savings.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Remove + Save stacked */}
          <div className="flex flex-col gap-1 mt-2">
            <button
              onClick={onRemove}
              className="text-xs text-primary underline text-left w-fit"
            >
              Remove item
            </button>
            <button
              onClick={onSaveForLater}
              className="text-xs text-primary underline text-left w-fit"
            >
              Save for later
            </button>
          </div>

          {/* Energy rating badge — right-aligned within info area */}
          {item.product.energyRating && (
            <div className="flex items-center gap-2 mt-3 justify-end">
              <EnergyRatingBadge rating={item.product.energyRating} labelUrl={item.product.energyLabelUrl} />
              <Link
                href={item.product.energyLabelUrl || "#"}
                target={item.product.energyLabelUrl ? "_blank" : undefined}
                rel={item.product.energyLabelUrl ? "noopener noreferrer" : undefined}
                className="text-[10px] text-primary underline"
              >
                Product fiche
              </Link>
            </div>
          )}

          {/* Delivery info — constrained to info area, not full width */}
          <div className="mt-4 border border-border rounded-md p-3">
            <p className="text-xs font-semibold text-text-primary mb-2">
              You can choose your delivery preferences at checkout
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="1.8" className="flex-shrink-0">
                  <rect x="1" y="6" width="15" height="10" rx="1" />
                  <path d="M16 9h3l3 3v4h-6V9z" />
                  <circle cx="6" cy="17.5" r="1.5" fill="#008A00" stroke="#008A00" />
                  <circle cx="19" cy="17.5" r="1.5" fill="#008A00" stroke="#008A00" />
                </svg>
                <span className="text-xs text-text-secondary">FREE delivery on orders over £40</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="1.8" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="text-xs text-text-secondary">Next day delivery available, order by 9pm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-primary text-xs font-bold leading-none cursor-pointer"
        aria-label="More info"
      >
        i
      </span>
      {open && (
        <div className="absolute left-6 top-0 z-10 w-56 bg-white border border-border rounded-lg shadow-lg p-3 text-xs font-normal text-text-secondary">
          {text}
          <span className="block mt-2 text-primary text-[11px] text-right cursor-pointer">OK</span>
        </div>
      )}
    </span>
  );
}

function Installation({
  selected,
  onToggle,
  wallSelected,
  onWallToggle,
}: {
  selected: boolean;
  onToggle: () => void;
  wallSelected: boolean;
  onWallToggle: () => void;
}) {
  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  return (
    <div className="pb-6 mb-6 sm:pl-[216px]">
      <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
        Installation
        <InfoTooltip text="Our professional installers will set up your TV so it's ready to watch. Installation is available for most TVs." />
      </h3>

      {/* Installation to stand */}
      <div className="text-xs text-text-secondary mb-4">
        <p className="font-semibold text-text-primary mb-2">Installation to stand:</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">{checkIcon}<span>Disconnect your old TV and unbox your new one</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Attach the TV to the table-top stand or legs</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Connect and tune your TV</span></div>
        </div>
      </div>

      <label className="flex items-center justify-between p-3 bg-light-purple border border-[#E8E8E8] rounded-xl cursor-pointer hover:border-primary transition-colors mb-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="w-5 h-5 accent-primary rounded"
          />
          <span className="text-xs font-normal text-text-primary">
            Add Installation to stand
          </span>
        </div>
        <span className="text-sm font-semibold text-text-primary">£45.00</span>
      </label>

      {/* Installation to wall */}
      <div className="text-xs text-text-secondary mb-4">
        <p className="font-semibold text-text-primary mb-2">Installation to wall:</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">{checkIcon}<span>Disconnect your old TV and unbox your new one</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Attach the wall bracket and mount your TV</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Connect and tune your TV and any equipment</span></div>
        </div>
      </div>

      <label className="flex items-center justify-between p-3 bg-light-purple border border-[#E8E8E8] rounded-xl cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={wallSelected}
            onChange={onWallToggle}
            className="w-5 h-5 accent-primary rounded"
          />
          <span className="text-xs font-normal text-text-primary">
            Add Installation to wall (bracket not included)
          </span>
        </div>
        <span className="text-sm font-semibold text-text-primary">£135.00</span>
      </label>
    </div>
  );
}

function Recycling({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  const checkIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  return (
    <div className="sm:pl-[216px]">
      <h3 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
        Recycling
        <InfoTooltip text="We'll take away your old TV and packaging when we deliver your new one. All items are recycled responsibly." />
      </h3>
      <div className="text-xs text-text-secondary mb-4">
        <p className="font-semibold text-text-primary mb-2">On delivery we&apos;ll:</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">{checkIcon}<span>Remove an old, disconnected TV</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Remove your new TV&apos;s packaging</span></div>
          <div className="flex items-start gap-2">{checkIcon}<span>Take the lot to be recycled</span></div>
        </div>
      </div>

      <label className="flex items-center justify-between p-3 bg-light-purple border border-[#E8E8E8] rounded-xl cursor-pointer hover:border-primary transition-colors">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="w-5 h-5 accent-primary rounded"
          />
          <span className="text-xs font-normal text-text-primary">
            Let&apos;s recycle it
          </span>
        </div>
        <span className="text-sm font-semibold text-text-primary">£20.00</span>
      </label>
    </div>
  );
}

const PROMO_CODES: Record<string, number> = {
  "1STTV50": 50,
  "SAVE10": 10,
};

function OrderSummary({
  subtotal,
  itemCount,
  serviceCount,
  serviceCost,
  totalSavings,
  appliedPromo,
  promoDiscount,
  onApplyPromo,
  onRemovePromo,
}: {
  subtotal: number;
  itemCount: number;
  serviceCount: number;
  serviceCost: number;
  totalSavings: number;
  appliedPromo?: string;
  promoDiscount?: number;
  onApplyPromo: (code: string, discount: number) => void;
  onRemovePromo: () => void;
}) {
  const [promoOpen, setPromoOpen] = useState(!appliedPromo);
  const [promoCode, setPromoCode] = useState("1STTV50");
  const [promoError, setPromoError] = useState("");

  const handleApply = () => {
    const code = promoCode.trim().toUpperCase();
    const discount = PROMO_CODES[code];
    if (discount) {
      onApplyPromo(code, discount);
      setPromoError("");
      setPromoOpen(false);
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const total = Math.max(0, subtotal + serviceCost - (promoDiscount || 0));

  return (
    <div className="card p-5 sticky top-4">
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Order summary
      </h2>

      {/* Items subtotal */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <span className="text-sm text-text-primary">
          £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Services subtotal */}
      {serviceCount > 0 && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">
            {serviceCount} {serviceCount === 1 ? "service" : "services"}
          </span>
          <span className="text-sm text-text-primary">
            £{serviceCost.toFixed(2)}
          </span>
        </div>
      )}

      {/* Promo code */}
      <div className="mb-4">
        {appliedPromo ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <div>
              <span className="text-xs font-semibold text-green-700">
                {appliedPromo}
              </span>
              <span className="text-xs text-green-600 ml-2">
                -£{(promoDiscount || 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={onRemovePromo}
              className="text-xs text-primary hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setPromoOpen(!promoOpen)}
              className="flex items-center gap-2 w-full text-left"
            >
              <span className="text-xs text-text-primary underline">Add a promo code</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`ml-auto transition-transform ${promoOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {promoOpen && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                    placeholder="Enter code"
                    className="flex-1 border border-input-border rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  />
                  <button
                    onClick={handleApply}
                    className="border border-primary text-primary rounded-md text-xs font-semibold whitespace-nowrap px-4 py-2 hover:bg-purple-50 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-sale mt-1.5">{promoError}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-3 border-t border-border mb-1">
        <span className="text-base font-bold text-text-primary">Total</span>
        <span className="text-xl font-bold text-text-primary">
          £{total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Total savings */}
      {(totalSavings > 0 || (promoDiscount && promoDiscount > 0)) && (
        <p className="text-xs font-bold text-badge text-right mb-4">
          Total savings: £{(totalSavings + (promoDiscount || 0)).toFixed(2)}
        </p>
      )}

      {totalSavings <= 0 && !promoDiscount && <div className="mb-4" />}

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="btn-primary w-full text-base font-bold text-center block"
      >
        Continue to checkout
      </Link>

      {/* Pay securely with */}
      <div className="mt-5 text-center">
        <p className="text-xs text-text-secondary mb-3">Pay securely with</p>
        <div className="flex items-center justify-center gap-2">
          <Image src="/images/icons/amex.svg" alt="American Express" width={34} height={24} className="h-6 w-auto" unoptimized />
          <Image src="/images/icons/visa.svg" alt="Visa" width={34} height={24} className="h-6 w-auto" unoptimized />
          <Image src="/images/icons/maestro.svg" alt="Maestro" width={34} height={24} className="h-6 w-auto" unoptimized />
          <Image src="/images/icons/mastercard.svg" alt="Mastercard" width={34} height={24} className="h-6 w-auto" unoptimized />
        </div>
        <Link href="/tv-and-audio" className="text-xs text-primary underline mt-4 inline-block">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function BasketPage() {
  const { basket, updateQuantity, removeItem, itemCount, applyPromo, removePromo } = useBasket();
  const { addSaved } = useSaved();

  // Lifted service state
  const [installType, setInstallType] = useState<"none" | "stand" | "wall">("none");
  const [recycleSelected, setRecycleSelected] = useState(false);

  // Computed values for OrderSummary
  const serviceCount =
    (installType !== "none" ? 1 : 0) + (recycleSelected ? 1 : 0);
  const serviceCost =
    (installType === "stand" ? 45 : installType === "wall" ? 135 : 0) + (recycleSelected ? 20 : 0);
  const totalSavings = basket.items.reduce(
    (sum, item) => sum + ((item.product.price.savings || 0) * item.quantity),
    0
  );
  const handleSaveForLater = (item: BasketItemType) => {
    addSaved(item.product);
    removeItem(item.product.id);
  };

  if (basket.items.length === 0) {
    return (
      <div className="bg-surface min-h-screen">
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
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
    {/* Promo banner */}
    <div className="bg-[#E31837] text-white text-center py-2 px-4">
      <p className="text-sm font-semibold">
        Use code <span className="font-bold">1STTV50</span> at checkout for £50 off your first order!
      </p>
    </div>

    <div className="container-main py-6">
      <h1 className="text-xl text-text-primary mb-6">
        <span className="font-bold">Your basket</span>{" "}
        <span className="font-normal text-text-secondary">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left: Basket items + services */}
        <div className="flex-1 min-w-0 bg-white rounded-lg p-5">
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

          {/* Installation */}
          <Installation
            selected={installType === "stand"}
            onToggle={() => setInstallType(installType === "stand" ? "none" : "stand")}
            wallSelected={installType === "wall"}
            onWallToggle={() => setInstallType(installType === "wall" ? "none" : "wall")}
          />

          {/* Recycling */}
          <Recycling
            selected={recycleSelected}
            onToggle={() => setRecycleSelected(!recycleSelected)}
          />
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <OrderSummary
            subtotal={basket.subtotal}
            itemCount={itemCount}
            serviceCount={serviceCount}
            serviceCost={serviceCost}
            totalSavings={totalSavings}
            appliedPromo={basket.promoCode}
            promoDiscount={basket.promoDiscount}
            onApplyPromo={applyPromo}
            onRemovePromo={removePromo}
          />
        </div>
      </div>
    </div>
    </div>
  );
}
