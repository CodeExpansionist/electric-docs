"use client";

import { useState } from "react";
import type { DeliveryData } from "@/app/checkout/page";
import { isValidUKPostcode, isValidUKPhone } from "@/lib/validation";
import { getNextDeliveryDate, formatDeliveryDate } from "@/lib/delivery-date";

const fieldClass = (hasError?: boolean) =>
  `w-full rounded-sm border px-4 py-3 text-sm text-input-text placeholder:text-text-muted focus:ring-0 transition-colors ${
    hasError
      ? "border-red-600 hover:border-2 hover:border-red-600 focus:border-2 focus:border-red-600"
      : "border-input-border focus:border-primary"
  }`;

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
  const [showBanner, setShowBanner] = useState(false);

  const update = (field: keyof DeliveryData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
    if (showBanner) setShowBanner(false);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeliveryData, string>> = {};
    if (!form.title) newErrors.title = "Please enter a title to continue.";
    if (!form.firstName.trim()) newErrors.firstName = "Please enter a first name to continue.";
    else if (form.firstName.trim().length < 2) newErrors.firstName = "Please enter a first name to continue.";
    if (!form.lastName.trim()) newErrors.lastName = "Please enter a last name to continue.";
    else if (form.lastName.trim().length < 2) newErrors.lastName = "Please enter a last name to continue.";
    if (!form.phone.trim()) newErrors.phone = "Please enter a phone number to continue.";
    else if (!isValidUKPhone(form.phone)) newErrors.phone = "Please enter a phone number to continue.";
    if (!form.postcode.trim()) newErrors.postcode = "Please enter a postcode to continue.";
    else if (!isValidUKPostcode(form.postcode)) newErrors.postcode = "Please enter a postcode to continue.";
    if (showManual && !form.address1.trim()) newErrors.address1 = "Please enter an address to continue.";
    if (showManual && !form.city.trim()) newErrors.city = "Please enter a town or city to continue.";
    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    setShowBanner(hasErrors);
    return !hasErrors;
  };

  const handleFindAddress = () => {
    if (!form.postcode.trim()) {
      setErrors({ postcode: "Please enter a postcode to continue." });
      setShowBanner(true);
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
    <div className="mt-3">
      <div className="card p-6">
        {/* Error banner */}
        {showBanner && (
          <div className="flex items-start gap-3 bg-red-600 rounded-sm p-4 mb-5">
            <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <div>
              <p className="text-sm font-bold text-white">Let&apos;s try again</p>
              <p className="text-xs text-white/90 mt-0.5">
                There&apos;s one or more errors below. Please check and try again.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-text-primary">
            Delivering to
          </h3>
          <button
            onClick={() => {}}
            className="text-xs text-primary underline"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-green-600 font-medium mb-4">
          Arriving {formatDeliveryDate(getNextDeliveryDate())}, All day 7am-8pm
        </p>

        {/* Title */}
        <div className="mb-4">
          <select
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={`${fieldClass(!!errors.title)} appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23696969%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
          >
            <option value="">Title*</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Miss">Miss</option>
            <option value="Dr">Dr</option>
          </select>
          {errors.title && (
            <p className="text-xs text-red-600 mt-1">{errors.title}</p>
          )}
        </div>

        {/* First name + Last name */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={fieldClass(!!errors.firstName)}
              placeholder="First name*"
            />
            {errors.firstName && (
              <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={fieldClass(!!errors.lastName)}
              placeholder="Last name*"
            />
            {errors.lastName && (
              <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone number — 50% width */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={fieldClass(!!errors.phone)}
                placeholder="Phone number*"
              />
              {!form.phone && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-text-muted leading-tight text-right max-w-[45%]">
                  Add your MOBILE for SMS delivery updates
                </span>
              )}
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Postcode + Find address on same row */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-1/2">
            <input
              type="text"
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value.toUpperCase())}
              className={fieldClass(!!errors.postcode)}
              placeholder="Postcode*"
            />
            {errors.postcode && (
              <p className="text-xs text-red-600 mt-1">{errors.postcode}</p>
            )}
          </div>
          <button
            onClick={handleFindAddress}
            className="btn-outline text-sm whitespace-nowrap py-3"
          >
            Find address
          </button>
        </div>

        {!showManual && (
          <button
            onClick={() => setShowManual(true)}
            className="text-xs text-primary underline mb-2 inline-block"
          >
            Enter address manually
          </button>
        )}

        {/* Manual address fields */}
        {showManual && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.address1}
                  onChange={(e) => update("address1", e.target.value)}
                  className={fieldClass(!!errors.address1)}
                  placeholder="Address 1*"
                />
                {errors.address1 && (
                  <p className="text-xs text-red-600 mt-1">{errors.address1}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.address2}
                  onChange={(e) => update("address2", e.target.value)}
                  className={fieldClass()}
                  placeholder="Address 2 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={fieldClass(!!errors.city)}
                  placeholder="Town / City*"
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={form.county}
                  onChange={(e) => update("county", e.target.value)}
                  className={fieldClass()}
                  placeholder="County (optional)"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Use this address — right edge aligned with card right edge */}
      <div className="flex justify-end mt-4">
        <button onClick={handleSubmit} className="btn-primary text-sm px-24">
          Use this address
        </button>
      </div>
    </div>
  );
}
