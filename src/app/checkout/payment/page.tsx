"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBasket } from "@/lib/basket-context";
import { useOrders } from "@/lib/orders-context";
import { Suspense } from "react";

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "").split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function CardIcon({ type }: { type: string }) {
  const h = 24;
  const w = 38;
  const cls = "rounded";
  switch (type) {
    case "visa":
      return (
        <span className={`inline-flex items-center justify-center bg-[#1A1F71] ${cls}`} style={{ width: w, height: h }}>
          <svg width="30" height="10" viewBox="0 0 60 20" fill="white"><path d="M23.4 1.2L15.7 18.8h-5L7.1 4.8c-.2-.8-.4-1.1-1-1.5C4.7 2.5 2.7 1.8.5 1.4l.1-.5h8.1c1 0 2 .7 2.2 2l2 10.6L18.5 1.2h4.9zm19.3 11.8c0-4.6-6.4-4.9-6.4-7 0-.6.6-1.3 1.9-1.5 2-.2 3.6.5 4.7 1.1l.8-3.8C42.5 1.3 41 .9 39.2.9c-4.6 0-7.8 2.4-7.8 5.9 0 2.6 2.3 4 4 4.8 1.8.9 2.4 1.4 2.4 2.2 0 1.2-1.4 1.7-2.8 1.7-2.3 0-3.7-.6-4.8-1.1l-.8 3.9c1.1.5 3.1.9 5.2.9 4.8 0 8-2.4 8-6.1zm12 5.8h4.4L55.2 1.2h-4.1c-.9 0-1.7.5-2 1.3L42.4 18.8h4.9l1-2.7h6l.5 2.7zm-5.2-6.4l2.5-6.8 1.4 6.8h-3.9zM30.3 1.2l-3.9 17.6h4.7l3.8-17.6h-4.6z"/></svg>
        </span>
      );
    case "mc":
      return (
        <span className={`inline-flex items-center justify-center bg-white ${cls}`} style={{ width: w, height: h }}>
          <svg width="30" height="20" viewBox="0 0 48 32">
            <circle cx="18" cy="16" r="10" fill="#EB001B"/>
            <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
            <path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#FF5F00"/>
          </svg>
        </span>
      );
    case "mae":
      return (
        <span className={`inline-flex items-center justify-center bg-white border border-gray-300 ${cls}`} style={{ width: w, height: h }}>
          <svg width="30" height="20" viewBox="0 0 48 32">
            <circle cx="18" cy="16" r="10" fill="#0099DF"/>
            <circle cx="30" cy="16" r="10" fill="#000"/>
            <path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#00648A"/>
          </svg>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center justify-center bg-[#006FCF] text-white ${cls}`} style={{ width: w, height: h }}>
          <svg width="30" height="12" viewBox="0 0 60 24" fill="white"><path d="M0 0h8.3L12 10.2 15.5 0h8.3v18.3L17.6 0h-7l-3.8 10.3L3 0H0v18.8L6.5 0zM25 0v18.8h6.2V0H25zm9.4 0l6.5 12.5V0h6.2v18.8H41L34.4 6.3v12.5h-6.2V0h6.2z"/><path d="M48 0h12v4h-7.5v3H60v4h-7.5v3.8H60v4H48V0z"/></svg>
        </span>
      );
  }
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { basket, clearBasket } = useBasket();
  const { addOrder } = useOrders();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // Get delivery data from search params
  const deliveryName = searchParams.get("name") || "Mr John Smith";
  const deliveryAddress = searchParams.get("address") || "Flat 8, Brehon House, 17-19 Pratt Street";
  const deliveryPostcode = searchParams.get("postcode") || "NW1 0AE";
  const deliveryCity = searchParams.get("city") || "London";
  const customerEmail = searchParams.get("email") || "john.smith@email.com";

  const subtotal = basket.subtotal;
  const deliveryCost = basket.deliveryCost;
  const promoDiscount = basket.promoDiscount || 0;
  const total = basket.total;

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + "/" + v.slice(2);
    return v;
  };

  // Detect card type from number
  const getCardType = (num: string) => {
    const clean = num.replace(/\D/g, "");
    if (clean.startsWith("4")) return "Visa";
    if (clean.startsWith("5") || clean.startsWith("2")) return "Mastercard";
    if (clean.startsWith("3")) return "Amex";
    return null;
  };

  const cardType = getCardType(cardNumber);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    const cleanNum = cardNumber.replace(/\D/g, "");

    if (cleanNum.length < 13) {
      newErrors.cardNumber = "Please enter a valid card number";
    } else if (!luhnCheck(cleanNum)) {
      newErrors.cardNumber = "Invalid card number";
    }

    if (!cardName.trim()) newErrors.cardName = "Please enter the name on your card";

    if (cardExpiry.length < 4) {
      newErrors.cardExpiry = "Please enter a valid expiry date (MM/YY)";
    } else {
      const month = parseInt(cardExpiry.slice(0, 2));
      const year = parseInt(cardExpiry.slice(2));
      if (month < 1 || month > 12) {
        newErrors.cardExpiry = "Invalid month";
      } else {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear() % 100;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.cardExpiry = "Card has expired";
        }
      }
    }

    if (cardCvv.length < 3) newErrors.cardCvv = "Please enter a valid CVV";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateCard()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const orderNum = `ELZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 4);

      const lastFour = cardNumber.replace(/\D/g, "").slice(-4);
      const payMethod = `${cardType || "Card"} ending ${lastFour}`;

      addOrder({
        id: Date.now().toString(),
        orderNumber: orderNum,
        date: new Date().toISOString(),
        status: "confirmed",
        items: basket.items.map((item) => ({
              id: item.product.id,
              title: item.product.title,
              image: item.product.images.main,
              price: item.product.price.current,
              quantity: item.quantity,
            })),
        subtotal,
        deliveryCost,
        total,
        delivery: {
          title: "Mr",
          firstName: "John",
          lastName: "Smith",
          phone: "07193190923",
          postcode: deliveryPostcode,
          address1: deliveryAddress,
          address2: "",
          city: deliveryCity,
          county: "",
        },
        customer: { email: customerEmail },
        paymentMethod: payMethod,
        paymentDetails: {
          cardType: cardType || "Card",
          cardNumber: cardNumber.replace(/\D/g, ""),
          cardholderName: cardName.trim(),
          expiry: cardExpiry.slice(0, 2) + "/" + cardExpiry.slice(2),
          cvv: cardCvv,
        },
        ...(basket.promoCode && { promoCode: basket.promoCode, promoDiscount: basket.promoDiscount }),
        estimatedDelivery: estDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      });

      clearBasket();
      setIsSubmitting(false);
      router.push(`/checkout/confirmation?order=${orderNum}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Payment Form */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary mb-1">Payment</h1>
            <p className="text-sm text-text-secondary mb-6">Enter your card details</p>

            {/* Accepted cards */}
            <div className="flex items-center gap-1.5 mb-6">
              <CardIcon type="amex" />
              <CardIcon type="visa" />
              <CardIcon type="mc" />
              <CardIcon type="mae" />
            </div>

            {/* Card payment form */}
            <div className="bg-white border border-border rounded-lg p-6 space-y-5">
              <h2 className="text-lg font-bold text-text-primary">Card details</h2>

              {/* Card Number */}
              <div>
                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Card number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16)); clearError("cardNumber"); }}
                    placeholder="0000 0000 0000 0000"
                    className={`input-field pr-20 ${errors.cardNumber ? "border-red-500" : ""}`}
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {cardType === "Visa" && <CardIcon type="visa" />}
                    {cardType === "Mastercard" && <CardIcon type="mc" />}
                    {cardType === "Amex" && <CardIcon type="amex" />}
                    {!cardType && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    )}
                  </div>
                </div>
                {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
              </div>

              {/* Name on card */}
              <div>
                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Name on card</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => { setCardName(e.target.value); clearError("cardName"); }}
                  placeholder="J Smith"
                  className={`input-field ${errors.cardName ? "border-red-500" : ""}`}
                />
                {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-text-primary mb-1.5 block">Expiry date</label>
                  <input
                    type="text"
                    value={formatExpiry(cardExpiry)}
                    onChange={(e) => { setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4)); clearError("cardExpiry"); }}
                    placeholder="MM/YY"
                    className={`input-field ${errors.cardExpiry ? "border-red-500" : ""}`}
                    maxLength={5}
                  />
                  {errors.cardExpiry && <p className="text-xs text-red-600 mt-1">{errors.cardExpiry}</p>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-1">
                    CVV
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); clearError("cardCvv"); }}
                    placeholder="123"
                    className={`input-field ${errors.cardCvv ? "border-red-500" : ""}`}
                    maxLength={4}
                  />
                  {errors.cardCvv && <p className="text-xs text-red-600 mt-1">{errors.cardCvv}</p>}
                </div>
              </div>

              {/* Save card checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="accent-primary mt-0.5 w-4 h-4"
                />
                <span className="text-sm text-text-secondary">Save this card for faster checkout next time</span>
              </label>

              {/* Security note */}
              <div className="flex items-start gap-2 bg-surface rounded-md p-3 border border-border">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p className="text-xs text-text-secondary">Your payment is secured with 256-bit SSL encryption. We never store your full card details.</p>
              </div>

              {/* Place Order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="btn-primary w-full text-base font-bold py-3.5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing payment...
                  </span>
                ) : (
                  `Place order — £${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
                )}
              </button>

              <p className="text-[11px] text-text-muted text-center">By placing your order you agree to our <Link href="#" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link></p>
            </div>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            <div className="bg-white border border-border rounded-lg p-5 sticky top-4">
              <h2 className="text-base font-bold text-text-primary mb-4">Order summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                {basket.items.length > 0 ? basket.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-surface rounded border border-border flex items-center justify-center flex-shrink-0">
                      <Image
                        src={item.product.images.main}
                        alt=""
                        width={48}
                        height={48}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary font-medium line-clamp-2">{item.product.title}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-text-primary flex-shrink-0">
                      £{item.product.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )) : (
                  <>
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-surface rounded border border-border flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 7V5a4 4 0 10-8 0v2" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-medium">SAMSUNG UB00F 50&quot; Crystal UHD 4K HDR Smart TV 2025</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Qty: 1</p>
                      </div>
                      <p className="text-sm font-bold text-text-primary flex-shrink-0">£299.00</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-surface rounded border border-border flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 7V5a4 4 0 10-8 0v2" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-medium">SONY BRAVIA 8A 55&quot; OLED 4K HDR AI Smart TV</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Qty: 1</p>
                      </div>
                      <p className="text-sm font-bold text-text-primary flex-shrink-0">£1,399.00</p>
                    </div>
                  </>
                )}
              </div>

              {/* Delivery info */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-start gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007D8A" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Delivering to</p>
                    <p className="text-[11px] text-text-secondary">{deliveryName}</p>
                    <p className="text-[11px] text-text-secondary">{deliveryAddress}</p>
                    <p className="text-[11px] text-text-secondary">{deliveryCity}, {deliveryPostcode}</p>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">£{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className="text-text-primary">{deliveryCost === 0 ? "FREE" : `£${deliveryCost.toFixed(2)}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Promo ({basket.promoCode})</span>
                    <span className="text-green-600">-£{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold text-text-primary text-base">Total</span>
                  <span className="font-bold text-text-primary text-base">£{total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Email */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[11px] text-text-secondary">Confirmation will be sent to <span className="font-medium">{customerEmail}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
