"use client";

import { useState } from "react";
import type { DeliveryData, CustomerData } from "@/app/checkout/page";

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-sm border px-4 py-3 text-sm text-input-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors ${
    hasError
      ? "border-red-600 hover:border-2 hover:border-red-600 focus:border-2 focus:border-red-600"
      : "border-input-border"
  }`;

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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const update = (field: keyof CustomerData, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address to continue.";
    }
    if (!form.useSameAddress) {
      if (!form.billingFirstName.trim()) newErrors.billingFirstName = "Please enter a first name to continue.";
      if (!form.billingLastName.trim()) newErrors.billingLastName = "Please enter a last name to continue.";
      if (!form.billingAddress1.trim()) newErrors.billingAddress1 = "Please enter an address to continue.";
      if (!form.billingCity.trim()) newErrors.billingCity = "Please enter a town or city to continue.";
      if (!form.billingPostcode.trim()) newErrors.billingPostcode = "Please enter a postcode to continue.";
      if (!form.billingPhone.trim()) newErrors.billingPhone = "Please enter a phone number to continue.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          onChange={(e) => update("email", e.target.value)}
          className={fieldClass(!!errors.email)}
          placeholder="Email address*"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Billing details */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-text-primary mb-2">
          Billing details
        </h4>

        {form.useSameAddress && (
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
        )}

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useSameAddress}
            onChange={(e) => update("useSameAddress", e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-xs text-text-primary">
            Use my delivery details as my billing details.
          </span>
        </label>

        {/* Billing address fields — shown when checkbox unchecked */}
        {!form.useSameAddress && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.billingFirstName}
                  onChange={(e) => update("billingFirstName", e.target.value)}
                  className={fieldClass(!!errors.billingFirstName)}
                  placeholder="First name*"
                />
                {errors.billingFirstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingFirstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.billingLastName}
                  onChange={(e) => update("billingLastName", e.target.value)}
                  className={fieldClass(!!errors.billingLastName)}
                  placeholder="Last name*"
                />
                {errors.billingLastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingLastName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.billingAddress1}
                  onChange={(e) => update("billingAddress1", e.target.value)}
                  className={fieldClass(!!errors.billingAddress1)}
                  placeholder="Address 1*"
                />
                {errors.billingAddress1 && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingAddress1}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.billingAddress2}
                  onChange={(e) => update("billingAddress2", e.target.value)}
                  className={fieldClass()}
                  placeholder="Address 2 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.billingCity}
                  onChange={(e) => update("billingCity", e.target.value)}
                  className={fieldClass(!!errors.billingCity)}
                  placeholder="Town / City*"
                />
                {errors.billingCity && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingCity}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.billingPostcode}
                  onChange={(e) => update("billingPostcode", e.target.value.toUpperCase())}
                  className={fieldClass(!!errors.billingPostcode)}
                  placeholder="Postcode*"
                />
                {errors.billingPostcode && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingPostcode}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="tel"
                  value={form.billingPhone}
                  onChange={(e) => update("billingPhone", e.target.value)}
                  className={fieldClass(!!errors.billingPhone)}
                  placeholder="Phone number*"
                />
                {errors.billingPhone && (
                  <p className="text-xs text-red-600 mt-1">{errors.billingPhone}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-text-secondary mb-6">
        We may contact you regarding your purchase and related services.
      </p>

      {/* Submit */}
      <button onClick={handleSubmit} className="btn-primary w-full text-sm">
        Continue to payment
      </button>
    </div>
  );
}
