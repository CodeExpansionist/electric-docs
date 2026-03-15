"use client";

import Link from "next/link";
import { useState } from "react";
import { useSignInModal } from "@/lib/signin-modal-context";

export default function TrackYourOrder() {
  const { openSignInModal } = useSignInModal();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(true);
  };

  return (
    <div className="container-main py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
        <Link
          href="/"
          className="hover:text-primary no-underline text-text-secondary"
        >
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-text-primary">Track my order</span>
      </nav>

      {/* Page content */}
      <div className="max-w-md mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Track my order
        </h1>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Sign into your account below. Here you can easily track your orders,
          start a return and see your order history.
        </p>

        {/* Sign in button */}
        <div className="mb-6">
          <button onClick={openSignInModal} className="btn-primary w-full">
            Sign in
          </button>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-4 mb-6">
          <hr className="flex-1 border-border" />
          <span className="text-text-secondary text-sm">OR</span>
          <hr className="flex-1 border-border" />
        </div>

        {/* Guest tracking description */}
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          If you don&apos;t have an account with us, add your order number and
          email below. You&apos;ll then be able to track your recent order or
          start a return.
        </p>

        {/* Error message */}
        {showError && (
          <div className="mb-6 border-2 border-error rounded-lg p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-error rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-text-primary">
              Sorry this order number or email address does not match our records.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order number */}
          <div>
            <label
              htmlFor="orderNumber"
              className="text-sm font-bold text-text-primary mb-1 block"
            >
              Order number*
            </label>
            <input
              id="orderNumber"
              type="text"
              placeholder="e.g. CUR1234567809"
              value={orderNumber}
              onChange={(e) => { setOrderNumber(e.target.value); setShowError(false); }}
              className="w-full rounded-md border border-input-border px-4 py-3 text-sm text-input-text focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          {/* Email address */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-text-primary mb-1 block"
            >
              Email address*
            </label>
            <input
              id="email"
              type="email"
              placeholder="The email address used to place your order"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setShowError(false); }}
              className="w-full rounded-md border border-input-border px-4 py-3 text-sm text-input-text focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="btn-primary w-full">
            Track my order
          </button>
        </form>

      </div>
    </div>
  );
}
