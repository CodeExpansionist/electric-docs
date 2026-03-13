"use client";

import { useState } from "react";

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

function getCardType(num: string) {
  const clean = num.replace(/\D/g, "");
  if (clean.startsWith("4")) return "Visa";
  if (clean.startsWith("5") || clean.startsWith("2")) return "Mastercard";
  if (clean.startsWith("3")) return "Amex";
  return null;
}

function formatCardNumber(value: string) {
  const v = value.replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.slice(i, i + 4));
  }
  return parts.join(" ");
}

function formatExpiry(value: string) {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + "/" + v.slice(2);
  return v;
}

export default function PaymentStep({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (cardData: { cardType: string; lastFour: string; cardNumber: string; cardholderName: string; expiry: string; cvv: string }) => void;
  isSubmitting: boolean;
}) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
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

      {/* Card details form */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-text-primary">Card details</span>
          <div className="flex items-center gap-1 ml-auto">
            {/* Visa */}
            <span className="inline-flex items-center justify-center bg-[#1A1F71] rounded" style={{ width: 34, height: 22 }}>
              <svg width="26" height="9" viewBox="0 0 60 20" fill="white"><path d="M23.4 1.2L15.7 18.8h-5L7.1 4.8c-.2-.8-.4-1.1-1-1.5C4.7 2.5 2.7 1.8.5 1.4l.1-.5h8.1c1 0 2 .7 2.2 2l2 10.6L18.5 1.2h4.9zm19.3 11.8c0-4.6-6.4-4.9-6.4-7 0-.6.6-1.3 1.9-1.5 2-.2 3.6.5 4.7 1.1l.8-3.8C42.5 1.3 41 .9 39.2.9c-4.6 0-7.8 2.4-7.8 5.9 0 2.6 2.3 4 4 4.8 1.8.9 2.4 1.4 2.4 2.2 0 1.2-1.4 1.7-2.8 1.7-2.3 0-3.7-.6-4.8-1.1l-.8 3.9c1.1.5 3.1.9 5.2.9 4.8 0 8-2.4 8-6.1zm12 5.8h4.4L55.2 1.2h-4.1c-.9 0-1.7.5-2 1.3L42.4 18.8h4.9l1-2.7h6l.5 2.7zm-5.2-6.4l2.5-6.8 1.4 6.8h-3.9zM30.3 1.2l-3.9 17.6h4.7l3.8-17.6h-4.6z"/></svg>
            </span>
            {/* Mastercard */}
            <span className="inline-flex items-center justify-center bg-white rounded" style={{ width: 34, height: 22 }}>
              <svg width="26" height="18" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#EB001B"/><circle cx="30" cy="16" r="10" fill="#F79E1B"/><path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#FF5F00"/></svg>
            </span>
            {/* Maestro */}
            <span className="inline-flex items-center justify-center bg-white border border-gray-300 rounded" style={{ width: 34, height: 22 }}>
              <svg width="26" height="18" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#0099DF"/><circle cx="30" cy="16" r="10" fill="#000"/><path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#00648A"/></svg>
            </span>
          </div>
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
              className={`input-field pr-16 ${errors.cardNumber ? "border-red-500" : ""}`}
              maxLength={19}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {cardType === "Visa" && (
                <span className="inline-flex items-center justify-center bg-[#1A1F71] rounded" style={{ width: 34, height: 22 }}>
                  <svg width="26" height="9" viewBox="0 0 60 20" fill="white"><path d="M23.4 1.2L15.7 18.8h-5L7.1 4.8c-.2-.8-.4-1.1-1-1.5C4.7 2.5 2.7 1.8.5 1.4l.1-.5h8.1c1 0 2 .7 2.2 2l2 10.6L18.5 1.2h4.9zm19.3 11.8c0-4.6-6.4-4.9-6.4-7 0-.6.6-1.3 1.9-1.5 2-.2 3.6.5 4.7 1.1l.8-3.8C42.5 1.3 41 .9 39.2.9c-4.6 0-7.8 2.4-7.8 5.9 0 2.6 2.3 4 4 4.8 1.8.9 2.4 1.4 2.4 2.2 0 1.2-1.4 1.7-2.8 1.7-2.3 0-3.7-.6-4.8-1.1l-.8 3.9c1.1.5 3.1.9 5.2.9 4.8 0 8-2.4 8-6.1zm12 5.8h4.4L55.2 1.2h-4.1c-.9 0-1.7.5-2 1.3L42.4 18.8h4.9l1-2.7h6l.5 2.7zm-5.2-6.4l2.5-6.8 1.4 6.8h-3.9zM30.3 1.2l-3.9 17.6h4.7l3.8-17.6h-4.6z"/></svg>
                </span>
              )}
              {cardType === "Mastercard" && (
                <span className="inline-flex items-center justify-center bg-white rounded" style={{ width: 34, height: 22 }}>
                  <svg width="26" height="18" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#EB001B"/><circle cx="30" cy="16" r="10" fill="#F79E1B"/><path d="M24 8.4a10 10 0 010 15.2 10 10 0 010-15.2z" fill="#FF5F00"/></svg>
                </span>
              )}
              {cardType === "Amex" && (
                <span className="inline-flex items-center justify-center bg-[#006FCF] rounded" style={{ width: 34, height: 22 }}>
                  <svg width="26" height="10" viewBox="0 0 60 24" fill="white"><path d="M0 0h8.3L12 10.2 15.5 0h8.3v18.3L17.6 0h-7l-3.8 10.3L3 0H0v18.8L6.5 0zM25 0v18.8h6.2V0H25zm9.4 0l6.5 12.5V0h6.2v18.8H41L34.4 6.3v12.5h-6.2V0h6.2z"/><path d="M48 0h12v4h-7.5v3H60v4h-7.5v3.8H60v4H48V0z"/></svg>
                </span>
              )}
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
