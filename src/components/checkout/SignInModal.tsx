"use client";

import { useState } from "react";

export default function SignInModal({
  onClose,
  onContinue,
  onGuest,
}: {
  onClose: () => void;
  onContinue: () => void;
  onGuest: () => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
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

        <h2 className="text-lg font-bold text-text-primary text-center mb-6">
          Welcome
        </h2>

        <p className="text-sm text-text-primary mb-4">
          Sign in or create an account
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mb-4"
          placeholder="Email address"
        />

        <button onClick={onContinue} className="btn-primary w-full text-sm mb-4">
          Continue
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-secondary">OR</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <button onClick={onGuest} className="btn-outline w-full text-sm">
          Continue as guest
        </button>
      </div>
    </div>
  );
}
