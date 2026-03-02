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
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">
                  Pay
                </span>
                <span className="text-[10px] font-bold bg-[#006FCF] text-white px-1.5 py-0.5 rounded">
                  Amex
                </span>
                <span className="text-[10px] font-bold bg-[#1A1F71] text-white px-1.5 py-0.5 rounded">
                  Visa
                </span>
                <span className="text-[10px] font-bold bg-[#EB001B] text-white px-1.5 py-0.5 rounded">
                  MC
                </span>
                <span className="text-[10px] font-bold bg-[#0099DF] text-white px-1.5 py-0.5 rounded">
                  Mae
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
