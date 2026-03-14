"use client";

import { useState } from "react";

export default function SignInModal({
  onClose,
  onContinue,
  onGuest,
}: {
  onClose: () => void;
  onContinue: (email: string) => void;
  onGuest: () => void;
}) {
  const [step, setStep] = useState<"email" | "create">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleEmailContinue = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setStep("create");
  };

  const handleCreateAccount = () => {
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    onContinue(email.trim());
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border px-4 py-3 text-input-text focus:ring-0 transition-colors ${
      hasError ? "border-error focus:border-error" : "border-input-border focus:border-primary"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal — centered, floating */}
      <div className="relative bg-white w-full max-w-md rounded-lg flex flex-col shadow-xl">
        {/* Header — light purple bar */}
        <div className="bg-light-purple px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-lg">
          <h2 className="text-lg font-bold text-primary">
            Welcome
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex-1">
          {step === "email" ? (
            <>
              <p className="text-sm font-semibold text-text-primary mb-6">
                Sign in or create an account
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={`${inputClass(!!error)} mb-1`}
                placeholder="Email address"
              />
              {error ? (
                <p className="text-xs text-error mb-3">{error}</p>
              ) : (
                <div className="mb-4" />
              )}

              <button onClick={handleEmailContinue} className="btn-primary w-full text-sm mb-4">
                Continue
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-text-primary mb-2">
                Create an account
              </p>

              {/* Email — shown as read-only with the entered value */}
              <div className="relative mb-3">
                <label className="absolute left-4 top-1.5 text-[10px] text-text-muted">Email address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className={`${inputClass(false)} pt-5 pb-2 bg-surface text-text-secondary cursor-default`}
                />
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className={`${inputClass(!!error && !password)} mb-3`}
                placeholder="Password"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                className={`${inputClass(!!error && password !== confirmPassword)} mb-1`}
                placeholder="Confirm password"
              />
              {error ? (
                <p className="text-xs text-error mb-3">{error}</p>
              ) : (
                <div className="mb-4" />
              )}

              <button onClick={handleCreateAccount} className="btn-primary w-full text-sm mb-4">
                Create account
              </button>
            </>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-text-secondary">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button onClick={onGuest} className="btn-outline w-full text-sm font-normal">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
