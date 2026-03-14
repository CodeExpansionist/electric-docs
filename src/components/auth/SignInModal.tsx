"use client";

import { useState, useEffect } from "react";
import { useSignInModal } from "@/lib/signin-modal-context";

export default function SignInModal() {
  const { isOpen, closeSignInModal } = useSignInModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRememberInfo, setShowRememberInfo] = useState(false);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSignInModal();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeSignInModal]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    closeSignInModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Tinted backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeSignInModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[820px] rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={closeSignInModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close sign in"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Sign-in form */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <h2 className="text-xl md:text-[20px] font-bold text-[#181818] mb-6">
            Sign in
          </h2>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input-border px-4 py-3 text-sm text-input-text focus:border-primary focus:ring-0 transition-colors"
                placeholder="Email address"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-input-border px-4 py-3 pr-16 text-sm text-input-text focus:border-primary focus:ring-0 transition-colors"
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors no-underline"
                tabIndex={0}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Remember me + What is this? */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="text-sm text-text-primary">
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setShowRememberInfo(!showRememberInfo)}
                  className="text-sm text-text-primary hover:text-primary transition-colors flex items-center gap-1"
                >
                  What is this?
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${showRememberInfo ? "rotate-180" : ""}`}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {showRememberInfo && (
                <p className="text-xs text-text-secondary mt-2 pl-6">
                  We&apos;ll save your email so you can sign in faster and shop easier. Ticking this box will also allow us to personalise your experience online in the future.
                </p>
              )}
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="btn-primary w-full text-sm font-bold py-3"
            >
              Sign in
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary-dark transition-colors no-underline"
            >
              Forgot your password?
            </button>
          </div>

          {/* Not a member */}
          <div className="mt-8">
            <h2 className="text-[20px] font-bold text-[#181818] mb-4">
              Not a member?
            </h2>
            <button
              type="button"
              className="btn-outline w-full text-sm font-bold py-3"
              onClick={closeSignInModal}
            >
              Create an account
            </button>
          </div>
        </div>

        {/* Right: Member benefits — desktop only */}
        <div className="hidden md:flex flex-col bg-light-purple p-8 w-[50%] flex-shrink-0">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Member benefits
          </h3>
          <div className="space-y-5">
            <p className="text-sm text-text-primary leading-relaxed">
              <span className="font-bold">Get what you want &ndash;</span> save items for later, so they&apos;re to hand when you&apos;re ready to buy
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              <span className="font-bold">Get it at the best price &ndash;</span> we&apos;ll email you if the stuff you love drops in price
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              <span className="font-bold">Get it easier &ndash;</span> check out faster, and track the status of your orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
