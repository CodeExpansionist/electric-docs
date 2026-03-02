"use client";

import { useState } from "react";
import type { DeliveryData } from "@/app/checkout/page";
import { isValidUKPostcode, isValidUKPhone } from "@/lib/validation";

export default function DeliveryStep({
  initialData,
  onSubmit,
}: {
  initialData: DeliveryData;
  onSubmit: (data: DeliveryData) => void;
}) {
  const [form, setForm] = useState<DeliveryData>(initialData);
  const [showManual, setShowManual] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryData, string>>>({});

  const update = (field: keyof DeliveryData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Required";
    else if (form.firstName.trim().length < 2) newErrors.firstName = "Min 2 characters";
    if (!form.lastName.trim()) newErrors.lastName = "Required";
    else if (form.lastName.trim().length < 2) newErrors.lastName = "Min 2 characters";
    if (!form.phone.trim()) newErrors.phone = "Required";
    else if (!isValidUKPhone(form.phone)) newErrors.phone = "Enter a valid UK phone number";
    if (!form.postcode.trim()) newErrors.postcode = "Required";
    else if (!isValidUKPostcode(form.postcode)) newErrors.postcode = "Enter a valid UK postcode";
    if (showManual && !form.address1.trim()) newErrors.address1 = "Required";
    if (showManual && !form.city.trim()) newErrors.city = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFindAddress = () => {
    if (!form.postcode.trim()) {
      setErrors({ postcode: "Please enter a postcode" });
      return;
    }
    setShowManual(true);
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <div className="card p-6 mt-3">
      <h3 className="text-base font-bold text-text-primary mb-4">
        Delivering to
      </h3>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs text-text-secondary mb-1">
          Title*
        </label>
        <select
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="border border-input-border rounded-md px-3 py-2.5 text-sm bg-white w-28"
        >
          <option value="">Select</option>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
          <option value="Miss">Miss</option>
          <option value="Dr">Dr</option>
        </select>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">
            First name*
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            className={`input-field ${errors.firstName ? "border-sale" : ""}`}
            placeholder="First name*"
          />
          {errors.firstName && (
            <p className="text-xs text-sale mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">
            Last name*
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            className={`input-field ${errors.lastName ? "border-sale" : ""}`}
            placeholder="Last name*"
          />
          {errors.lastName && (
            <p className="text-xs text-sale mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label className="block text-xs text-text-secondary mb-1">
          Phone number*{" "}
          <span className="text-text-muted">
            Add your MOBILE for SMS delivery updates
          </span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={`input-field ${errors.phone ? "border-sale" : ""}`}
          placeholder="Phone number*"
        />
        {errors.phone && (
          <p className="text-xs text-sale mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Postcode + Find Address */}
      <div className="flex items-end gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-text-secondary mb-1">
            Postcode*
          </label>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => update("postcode", e.target.value.toUpperCase())}
            className={`input-field ${errors.postcode ? "border-sale" : ""}`}
            placeholder="Postcode*"
          />
          {errors.postcode && (
            <p className="text-xs text-sale mt-1">{errors.postcode}</p>
          )}
        </div>
        <button onClick={handleFindAddress} className="btn-outline text-sm whitespace-nowrap">
          Find address
        </button>
      </div>

      {!showManual && (
        <button
          onClick={() => setShowManual(true)}
          className="text-xs text-primary hover:underline mb-4 inline-block"
        >
          Enter address manually
        </button>
      )}

      {/* Manual address fields */}
      {showManual && (
        <div className="space-y-4 mt-4 mb-4">
          <button
            onClick={() => setShowManual(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Add company name (optional)
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Address 1*
              </label>
              <input
                type="text"
                value={form.address1}
                onChange={(e) => update("address1", e.target.value)}
                className={`input-field ${errors.address1 ? "border-sale" : ""}`}
              />
              {errors.address1 && (
                <p className="text-xs text-sale mt-1">{errors.address1}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Address 2 (optional)
              </label>
              <input
                type="text"
                value={form.address2}
                onChange={(e) => update("address2", e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Town / City*
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={`input-field ${errors.city ? "border-sale" : ""}`}
              />
              {errors.city && (
                <p className="text-xs text-sale mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                County (optional)
              </label>
              <input
                type="text"
                value={form.county}
                onChange={(e) => update("county", e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} className="btn-primary w-full text-sm mt-4">
        Use this address
      </button>
    </div>
  );
}
