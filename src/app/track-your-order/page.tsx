"use client";

import Link from "next/link";
import { useState } from "react";

export default function TrackYourOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="max-w-lg mx-auto">
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
        <div className="max-w-md mx-auto mb-6">
          <Link href="#" className="btn-primary w-full no-underline text-center">
            Sign in
          </Link>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-4 mb-6 max-w-md mx-auto">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
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
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-text-secondary mt-1">
              This is a 13-digit number, found in your confirmation email or on
              your receipt. It starts with CUR.
            </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-text-secondary mt-1">
              The email address used to place your order
            </p>
          </div>

          {/* Submit button */}
          <button type="submit" className="btn-primary w-full">
            Track my order
          </button>
        </form>

        {/* Info box */}
        <div className="bg-surface rounded-lg p-4 border border-border mt-8 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs text-text-secondary leading-relaxed">
            If you bought your item in-store, and your receipt shows only an
            order number starting with 74, please go{" "}
            <Link
              href="#"
              className="text-primary underline hover:text-primary-dark"
            >
              here
            </Link>{" "}
            to track your order.
          </p>
        </div>
      </div>
    </div>
  );
}
