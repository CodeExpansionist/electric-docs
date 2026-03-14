"use client";

import { useState } from "react";
import { useBasket } from "@/lib/basket-context";
import { luhnCheck, getCardType, formatCardNumber, formatExpiry } from "@/lib/payment-utils";

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-sm border px-4 py-3 text-sm text-input-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors ${
    hasError
      ? "border-red-600 hover:border-2 hover:border-red-600 focus:border-2 focus:border-red-600"
      : "border-input-border"
  }`;

export default function PaymentStep({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (cardData: { cardType: string; lastFour: string; cardNumber: string; cardholderName: string; expiry: string; cvv: string }) => void;
  isSubmitting: boolean;
}) {
  const { basket, applyPromo, removePromo } = useBasket();
  const [promoOpen, setPromoOpen] = useState(true);
  const [promoCode, setPromoCode] = useState("1STTV50");
  const [promoError, setPromoError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardType = getCardType(cardNumber);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanNum = cardNumber.replace(/\D/g, "");

    if (cleanNum.length < 13) {
      newErrors.cardNumber = "Please enter a valid card number";
    } else if (!luhnCheck(cleanNum)) {
      newErrors.cardNumber = "Invalid card number";
    }

    if (!cardName.trim()) {
      newErrors.cardName = "Please enter the name on your card";
    }

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

    if (cardCvv.length < 3) {
      newErrors.cardCvv = "Please enter a valid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const cleanNum = cardNumber.replace(/\D/g, "");
    onSubmit({
      cardType: cardType || "Card",
      lastFour: cleanNum.slice(-4),
      cardNumber: cleanNum,
      cardholderName: cardName.trim(),
      expiry: cardExpiry.slice(0, 2) + "/" + cardExpiry.slice(2),
      cvv: cardCvv,
    });
  };

  return (
    <div className="card p-6 mt-3">
      {/* Promo code section */}
      {basket.promoCode ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
          <div>
            <span className="text-xs font-semibold text-green-700">{basket.promoCode}</span>
            <span className="text-xs text-green-600 ml-2">-£{(basket.promoDiscount || 0).toFixed(2)}</span>
          </div>
          <button onClick={removePromo} className="text-xs text-primary hover:underline">Remove</button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setPromoOpen(!promoOpen)}
            className="flex items-center gap-2 text-sm text-text-primary mb-4 w-full"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Add a discount/promo code or gift card</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`ml-auto transition-transform ${promoOpen ? "rotate-180" : ""}`}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {promoOpen && (
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                  placeholder="Enter code"
                  className={`${fieldClass()} flex-1`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const code = promoCode.trim().toUpperCase();
                      const codes: Record<string, number> = { "1STTV50": 50, "SAVE10": 10 };
                      if (codes[code]) { applyPromo(code, codes[code]); setPromoCode(""); setPromoOpen(false); setPromoError(""); }
                      else setPromoError("Invalid promo code");
                    }
                  }}
                />
                <button
                  className="btn-outline text-sm whitespace-nowrap"
                  onClick={() => {
                    const code = promoCode.trim().toUpperCase();
                    const codes: Record<string, number> = { "1STTV50": 50, "SAVE10": 10 };
                    if (codes[code]) { applyPromo(code, codes[code]); setPromoCode(""); setPromoOpen(false); setPromoError(""); }
                    else setPromoError("Invalid promo code");
                  }}
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-xs text-sale mt-1.5">{promoError}</p>}
            </div>
          )}
        </>
      )}

      {/* Card form */}
      <div className="space-y-4">
        <div className="flex justify-end gap-2 mb-1">
          <img src="/images/icons/visa-logo.png" alt="Visa" className="h-[24px] w-auto" />
          <img src="/images/icons/mastercard-logo.png" alt="Mastercard" className="h-[24px] w-auto" />
          <img src="/images/icons/amex-logo.png" alt="American Express" className="h-[24px] w-auto" />
        </div>

        {/* Card Number */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">Card number</label>
          <div className="relative">
            <input
              type="text"
              value={formatCardNumber(cardNumber)}
              onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16)); clearError("cardNumber"); }}
              placeholder="0000 0000 0000 0000"
              className={`${fieldClass(!!errors.cardNumber)} pr-16`}
              maxLength={19}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {cardType === "Visa" && <img src="/images/icons/visa-logo.png" alt="Visa" className="h-[22px] w-auto" />}
              {cardType === "Mastercard" && <img src="/images/icons/mastercard-logo.png" alt="Mastercard" className="h-[22px] w-auto" />}
              {cardType === "Amex" && <img src="/images/icons/amex-logo.png" alt="American Express" className="h-[22px] w-auto" />}
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
            className={fieldClass(!!errors.cardName)}
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
              className={fieldClass(!!errors.cardExpiry)}
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
              className={fieldClass(!!errors.cardCvv)}
              maxLength={4}
            />
            {errors.cardCvv && <p className="text-xs text-red-600 mt-1">{errors.cardCvv}</p>}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-2 bg-surface rounded-md p-3 border border-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-xs text-text-secondary">Your payment is secured with 256-bit SSL encryption. We never store your full card details.</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn-primary w-full text-sm disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing payment...
            </span>
          ) : (
            "Place order"
          )}
        </button>
      </div>
    </div>
  );
}
