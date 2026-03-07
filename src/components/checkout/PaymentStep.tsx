"use client";

import { useState } from "react";

export default function PaymentStep({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">(
    "card"
  );
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  return (
    <div className="card p-6 mt-3">
      {/* Promo code section */}
      <button
        onClick={() => setPromoOpen(!promoOpen)}
        className="flex items-center gap-2 text-sm text-text-primary mb-4 w-full"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <span>Add a discount/promo code or gift card</span>
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
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="input-field flex-1"
          />
          <button className="btn-outline text-sm whitespace-nowrap">
            Apply
          </button>
        </div>
      )}

      {/* Payment method selection */}
      <div className="flex gap-3 mb-6">
        <label
          className={`flex-1 p-4 border rounded-md cursor-pointer transition-colors ${
            paymentMethod === "card"
              ? "border-primary bg-purple-50"
              : "border-border"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm font-semibold text-text-primary">
              Card / Apple Pay
            </span>
          </div>
          {paymentMethod === "card" && (
            <div className="pl-7">
              <p className="text-xs text-text-secondary mb-3">
                The button below takes you to a new, secure payment page.
              </p>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="btn-primary w-full text-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Continue to payment"
                )}
              </button>
              {/* Payment icons */}
              <div className="flex items-center gap-1.5 mt-3">
                <span className="inline-flex items-center justify-center bg-black rounded" style={{ width: 38, height: 24 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                </span>
                <span className="inline-flex items-center justify-center bg-[#006FCF] rounded" style={{ width: 38, height: 24 }}>
                  <svg width="30" height="12" viewBox="0 0 60 24" fill="white"><path d="M0 0h8.3L12 10.2 15.5 0h8.3v18.3L17.6 0h-7l-3.8 10.3L3 0H0v18.8L6.5 0zM25 0v18.8h6.2V0H25zm9.4 0l6.5 12.5V0h6.2v18.8H41L34.4 6.3v12.5h-6.2V0h6.2z"/><path d="M48 0h12v4h-7.5v3H60v4h-7.5v3.8H60v4H48V0z"/></svg>
                </span>
                <span className="inline-flex items-center justify-center bg-[#1A1F71] rounded" style={{ width: 38, height: 24 }}>
                  <svg width="30" height="10" viewBox="0 0 60 20" fill="white"><path d="M23.4 1.2L15.7 18.8h-5L7.1 4.8c-.2-.8-.4-1.1-1-1.5C4.7 2.5 2.7 1.8.5 1.4l.1-.5h8.1c1 0 2 .7 2.2 2l2 10.6L18.5 1.2h4.9zm19.3 11.8c0-4.6-6.4-4.9-6.4-7 0-.6.6-1.3 1.9-1.5 2-.2 3.6.5 4.7 1.1l.8-3.8C42.5 1.3 41 .9 39.2.9c-4.6 0-7.8 2.4-7.8 5.9 0 2.6 2.3 4 4 4.8 1.8.9 2.4 1.4 2.4 2.2 0 1.2-1.4 1.7-2.8 1.7-2.3 0-3.7-.6-4.8-1.1l-.8 3.9c1.1.5 3.1.9 5.2.9 4.8 0 8-2.4 8-6.1zm12 5.8h4.4L55.2 1.2h-4.1c-.9 0-1.7.5-2 1.3L42.4 18.8h4.9l1-2.7h6l.5 2.7zm-5.2-6.4l2.5-6.8 1.4 6.8h-3.9zM30.3 1.2l-3.9 17.6h4.7l3.8-17.6h-4.6z"/></svg>
                </span>
                <span className="inline-flex items-center justify-center bg-white rounded" style={{ width: 38, height: 24 }}>
                  <svg width="30" height="20" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#EB001B"/><circle cx="30" cy="16" r="10" fill="#F79E1B"/><path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#FF5F00"/></svg>
                </span>
                <span className="inline-flex items-center justify-center bg-white border border-gray-300 rounded" style={{ width: 38, height: 24 }}>
                  <svg width="30" height="20" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#0099DF"/><circle cx="30" cy="16" r="10" fill="#000"/><path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#00648A"/></svg>
                </span>
              </div>
            </div>
          )}
        </label>

        <label
          className={`w-[140px] p-4 border rounded-md cursor-pointer transition-colors flex items-start gap-3 ${
            paymentMethod === "paypal"
              ? "border-primary bg-purple-50"
              : "border-border"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === "paypal"}
            onChange={() => setPaymentMethod("paypal")}
            className="accent-primary w-4 h-4 mt-0.5"
          />
          <span className="text-sm font-bold text-[#003087]">
            <span className="text-[#003087]">Pay</span>
            <span className="text-[#009cde]">Pal</span>
          </span>
        </label>
      </div>

      {paymentMethod === "paypal" && (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-primary w-full text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Processing..." : "Continue to PayPal"}
        </button>
      )}
    </div>
  );
}
