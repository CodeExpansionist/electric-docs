"use client";

import { useState } from "react";
import Link from "next/link";
import type { DeliveryData, CustomerData } from "@/app/checkout/page";

export default function CustomerStep({
  initialData,
  deliveryData,
  onSubmit,
}: {
  initialData: CustomerData;
  deliveryData: DeliveryData;
  onSubmit: (data: CustomerData) => void;
}) {
  const [form, setForm] = useState<CustomerData>(initialData);
  const [emailError, setEmailError] = useState("");

  const validate = (): boolean => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <div className="card p-6 mt-3">
      {/* Email */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-text-primary mb-1">Email</h4>
        <p className="text-xs text-text-secondary mb-3">
          Please enter your email to receive your order confirmation.
        </p>
        <input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            if (emailError) setEmailError("");
          }}
          className={`input-field ${emailError ? "border-sale" : ""}`}
          placeholder="Email address*"
        />
        {emailError && (
          <p className="text-xs text-sale mt-1">{emailError}</p>
        )}
      </div>

      {/* Billing details */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-text-primary mb-2">
          Billing details
        </h4>
        <div className="text-xs text-text-secondary space-y-0.5 mb-3">
          <p>
            {deliveryData.title} {deliveryData.firstName}{" "}
            {deliveryData.lastName}
          </p>
          <p>
            {deliveryData.address1}
            {deliveryData.address2 ? `, ${deliveryData.address2}` : ""}
          </p>
          <p>
            {deliveryData.city}, {deliveryData.postcode}
          </p>
          <p>{deliveryData.phone}</p>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useSameAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, useSameAddress: e.target.checked }))
            }
            className="w-4 h-4 accent-primary"
          />
          <span className="text-xs text-text-primary">
            Use my delivery details as my billing details.
          </span>
        </label>
      </div>

      <p className="text-xs text-text-secondary mb-6">
        We may contact you regarding your purchase and related services.
      </p>

      {/* Marketing preferences */}
      <div className="bg-surface rounded-md p-5 mb-6">
        <h4 className="text-sm font-bold text-text-primary mb-1">
          Let&apos;s stay in touch!
        </h4>
        <p className="text-xs text-text-secondary mb-4">
          Join Currys Perks and enjoy exclusive discounts, competitions, offers
          from our partners &amp; lots more!
        </p>
        <div className="flex items-center gap-6 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.marketingEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingEmail: e.target.checked }))
              }
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs text-text-primary">Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.marketingSms}
              onChange={(e) =>
                setForm((f) => ({ ...f, marketingSms: e.target.checked }))
              }
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs text-text-primary">SMS</span>
          </label>
        </div>
        <p className="text-xs text-text-secondary">
          See our{" "}
          <Link href="#" className="text-primary">
            Terms &amp; Conditions
          </Link>
        </p>
        <p className="text-[10px] text-text-muted mt-2">
          *Sorry. Customers in Northern Ireland can&apos;t join Perks.
        </p>
      </div>

      <p className="text-[10px] text-text-muted mb-6">
        We promise to keep your details safe &amp; secure. We&apos;ll never sell
        or misuse your information. You can unsubscribe at any time. Please see
        our{" "}
        <Link href="#" className="text-primary">
          Privacy policy
        </Link>{" "}
        for more information.
      </p>

      {/* Submit */}
      <button onClick={handleSubmit} className="btn-primary w-full text-sm">
        Continue to payment
      </button>
    </div>
  );
}
