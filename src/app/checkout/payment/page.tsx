"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBasket } from "@/lib/basket-context";
import { useOrders } from "@/lib/orders-context";
import { Suspense } from "react";

function CardIcon({ type: _type, label, bg }: { type: string; label: string; bg: string }) {
  void _type;
  return (
    <span className={`inline-flex items-center justify-center text-[10px] font-bold text-white px-2 py-1 rounded ${bg}`}>
      {label}
    </span>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { basket, clearBasket } = useBasket();
  const { addOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");
  const [showPaypalLogin, setShowPaypalLogin] = useState(false);

  // Get delivery data from search params
  const deliveryName = searchParams.get("name") || "Mr John Smith";
  const deliveryAddress = searchParams.get("address") || "Flat 8, Brehon House, 17-19 Pratt Street";
  const deliveryPostcode = searchParams.get("postcode") || "NW1 0AE";
  const deliveryCity = searchParams.get("city") || "London";
  const customerEmail = searchParams.get("email") || "john.smith@email.com";

  const subtotal = basket.items.reduce((sum, item) => sum + item.product.price.current * item.quantity, 0) || 1698;
  const deliveryCost = subtotal > 40 ? 0 : 3.99;
  const total = subtotal + deliveryCost;

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
    if (clean.startsWith("4")) return "visa";
    if (clean.startsWith("5") || clean.startsWith("2")) return "mastercard";
    if (clean.startsWith("3")) return "amex";
    return null;
  };

  const cardType = getCardType(cardNumber);

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    const cleanNum = cardNumber.replace(/\D/g, "");
    if (cleanNum.length < 16) newErrors.cardNumber = "Please enter a valid 16-digit card number";
    if (!cardName.trim()) newErrors.cardName = "Please enter the name on your card";
    if (cardExpiry.length < 5) newErrors.cardExpiry = "Please enter a valid expiry date (MM/YY)";
    else {
      const [mm] = cardExpiry.split("/");
      const month = parseInt(mm);
      if (month < 1 || month > 12) newErrors.cardExpiry = "Invalid month";
    }
    if (cardCvv.length < 3) newErrors.cardCvv = "Please enter a valid CVV";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "card" && !validateCard()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const orderNum = `CUR-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 4);

      const lastFour = cardNumber.replace(/\D/g, "").slice(-4) || "6411";
      const payMethod = paymentMethod === "card"
        ? `${cardType === "visa" ? "Visa" : cardType === "mastercard" ? "Mastercard" : cardType === "amex" ? "Amex" : "Card"} ending ${lastFour}`
        : "PayPal";

      addOrder({
        id: Date.now().toString(),
        orderNumber: orderNum,
        date: new Date().toISOString(),
        status: "confirmed",
        items: basket.items.length > 0
          ? basket.items.map((item) => ({
              id: item.product.id,
              title: item.product.title,
              image: item.product.images.main,
              price: item.product.price.current,
              quantity: item.quantity,
            }))
          : [{ id: "demo-1", title: "SAMSUNG UB00F 50\" Crystal UHD 4K HDR Smart TV 2025", image: "/images/products/10282094/large.webp", price: 299, quantity: 1 }],
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary mb-1">Payment</h1>
            <p className="text-sm text-text-secondary mb-6">Choose how you&apos;d like to pay</p>

            {/* Payment method tabs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-purple-50"
                    : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-primary" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Card / Apple Pay</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 pl-8">
                  <CardIcon type="apple" label="Pay" bg="bg-black" />
                  <CardIcon type="amex" label="Amex" bg="bg-[#006FCF]" />
                  <CardIcon type="visa" label="Visa" bg="bg-[#1A1F71]" />
                  <CardIcon type="mc" label="MC" bg="bg-[#EB001B]" />
                  <CardIcon type="mae" label="Mae" bg="bg-[#0099DF]" />
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`w-[160px] p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === "paypal"
                    ? "border-primary bg-purple-50"
                    : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "paypal" ? "border-primary" : "border-gray-300"
                  }`}>
                    {paymentMethod === "paypal" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm font-bold">
                    <span className="text-[#003087]">Pay</span>
                    <span className="text-[#009cde]">Pal</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Card payment form */}
            {paymentMethod === "card" && (
              <div className="bg-white border border-border rounded-lg p-6 space-y-5">
                <h2 className="text-lg font-bold text-text-primary">Card details</h2>

                {/* Card Number */}
                <div>
                  <label className="text-sm font-semibold text-text-primary mb-1.5 block">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="0000 0000 0000 0000"
                      className={`input-field pr-20 ${errors.cardNumber ? "border-red-500" : ""}`}
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {cardType === "visa" && <CardIcon type="visa" label="Visa" bg="bg-[#1A1F71]" />}
                      {cardType === "mastercard" && <CardIcon type="mc" label="MC" bg="bg-[#EB001B]" />}
                      {cardType === "amex" && <CardIcon type="amex" label="Amex" bg="bg-[#006FCF]" />}
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
                    onChange={(e) => setCardName(e.target.value)}
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
                      onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
                  className="btn-primary w-full text-base py-3.5 disabled:opacity-60"
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
            )}

            {/* PayPal payment */}
            {paymentMethod === "paypal" && (
              <div className="bg-white border border-border rounded-lg p-6">
                {!showPaypalLogin ? (
                  <div className="text-center space-y-5">
                    {/* PayPal Logo */}
                    <div className="flex justify-center">
                      <div className="bg-[#FFC439] rounded-full px-8 py-3">
                        <span className="text-2xl font-bold">
                          <span className="text-[#003087]">Pay</span>
                          <span className="text-[#009cde]">Pal</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary">You&apos;ll be redirected to PayPal to complete your purchase securely.</p>

                    <div className="bg-surface rounded-lg p-4 border border-border text-left">
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Why use PayPal?</h3>
                      <ul className="space-y-2 text-xs text-text-secondary">
                        {["Pay securely without sharing your card details", "Buyer protection on eligible purchases", "One-tap checkout for faster payment"].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2.5" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setShowPaypalLogin(true)}
                      className="w-full py-3.5 rounded-full font-bold text-base text-[#003087] bg-[#FFC439] hover:bg-[#f0b830] transition-colors"
                    >
                      <span className="text-[#003087]">Pay</span>
                      <span className="text-[#009cde]">Pal</span>
                      {" "}Checkout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Mock PayPal Login */}
                    <div className="text-center">
                      <div className="inline-flex bg-[#003087] rounded-full px-6 py-2 mb-4">
                        <span className="text-lg font-bold">
                          <span className="text-white">Pay</span>
                          <span className="text-[#009cde]">Pal</span>
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-text-primary">Log in to your PayPal account</h2>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-text-primary mb-1.5 block">Email or mobile number</label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="Email or mobile number"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-text-primary mb-1.5 block">Password</label>
                      <input
                        type="password"
                        value={paypalPassword}
                        onChange={(e) => setPaypalPassword(e.target.value)}
                        placeholder="Password"
                        className="input-field"
                      />
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full font-bold text-base text-white bg-[#003087] hover:bg-[#002266] transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Pay £${total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
                      )}
                    </button>

                    <button
                      onClick={() => setShowPaypalLogin(false)}
                      className="w-full text-sm text-primary hover:underline"
                    >
                      Cancel and return to payment options
                    </button>
                  </div>
                )}
              </div>
            )}
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
                      <div className="flex-1">
                        <p className="text-xs text-text-primary font-medium">SAMSUNG UB00F 50&quot; Crystal UHD 4K HDR Smart TV 2025</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">Qty: 1</p>
                      </div>
                      <p className="text-sm font-bold text-text-primary flex-shrink-0">£299.00</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-surface rounded border border-border flex items-center justify-center flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 7V5a4 4 0 10-8 0v2" /></svg>
                      </div>
                      <div className="flex-1">
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
