"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignInModal } from "@/lib/signin-modal-context";
import { useUser } from "@/lib/user-context";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function SignInModal() {
  const { isOpen, closeSignInModal } = useSignInModal();
  const { signIn } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRememberInfo, setShowRememberInfo] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

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

  /* Reset state when modal closes */
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      setShowForgotPassword(false);
      setResetEmail("");
      setResetSent(false);
      setShowPassword(false);
      setShowRememberInfo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Please enter an email address");
      valid = false;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please check your email address & try again");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Please enter your password");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    signIn(trimmedEmail);
    closeSignInModal();
  };

  const handleCreateAccount = () => {
    closeSignInModal();
    router.push("/account#register");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  const inputClass = (hasError: boolean) =>
    `peer w-full rounded px-4 pt-5 pb-2 text-sm text-input-text focus:ring-0 transition-colors placeholder-transparent ${
      hasError ? "border-2 border-error focus:border-error" : "border border-input-border focus:border-primary"
    }`;

  /* ── Forgot password view ── */
  if (showForgotPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        <div className="absolute inset-0 bg-black/50" onClick={closeSignInModal} aria-hidden="true" />
        <div className="relative bg-white w-full max-w-[480px] rounded-lg shadow-xl overflow-hidden max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-border">
            <h2 className="text-[22px] font-bold text-[#181818]">Forgot your password?</h2>
            <button onClick={closeSignInModal} className="w-8 h-8 flex items-center justify-center text-text-primary hover:text-text-secondary transition-colors" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-8 py-8">
            {!resetSent ? (
              <>
                <p className="text-sm text-text-secondary mb-6">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <form onSubmit={handleResetPassword}>
                  <div className="relative mb-6">
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="peer w-full rounded border border-input-border px-4 pt-5 pb-2 text-sm text-input-text focus:border-primary focus:ring-0 transition-colors placeholder-transparent"
                      placeholder="Email address"
                      autoComplete="email"
                    />
                    <label htmlFor="reset-email" className="absolute left-4 top-1.5 text-[11px] text-text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-text-muted peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-text-muted pointer-events-none">
                      Email address
                    </label>
                  </div>
                  <button type="submit" className="btn-primary w-full text-sm font-bold py-3">
                    Send reset link
                  </button>
                </form>
                <div className="mt-4">
                  <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-primary hover:text-primary-dark underline transition-colors">
                    Back to sign in
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 text-success" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-text-primary font-semibold mb-2">Check your email</p>
                  <p className="text-sm text-text-secondary">
                    If an account exists for {resetEmail}, we&apos;ve sent a password reset link.
                  </p>
                </div>
                <button type="button" onClick={() => { setShowForgotPassword(false); setResetSent(false); }} className="btn-primary w-full text-sm font-bold py-3 mt-4">
                  Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Main sign-in view ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Tinted backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeSignInModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[820px] rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header row: "Sign in" left, X right, with bottom border */}
        <div className="flex items-center justify-between px-8 md:px-10 py-5 border-b border-border flex-shrink-0">
          <h2 className="text-[22px] font-bold text-[#181818]">Sign in</h2>
          <button
            onClick={closeSignInModal}
            className="w-8 h-8 flex items-center justify-center text-text-primary hover:text-text-secondary transition-colors"
            aria-label="Close sign in"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: two columns on desktop, single on mobile */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
          {/* Left: Form */}
          <div className="flex-1 px-8 md:px-10 py-8">
            <form onSubmit={handleSignIn} noValidate>
              {/* Email — floating label */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className={`${inputClass(!!emailError)} pr-4`}
                    placeholder="Email address"
                    autoComplete="email"
                  />
                  <label
                    htmlFor="signin-email"
                    className="absolute left-4 top-1.5 text-[11px] text-text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-text-muted peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-text-muted pointer-events-none"
                  >
                    Email address
                  </label>
                </div>
                {emailError && (
                  <p className="text-xs text-error mt-1.5">{emailError}</p>
                )}
              </div>

              {/* Password — floating label + show/hide */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={`${inputClass(!!passwordError)} pr-16`}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <label
                    htmlFor="signin-password"
                    className="absolute left-4 top-1.5 text-[11px] text-text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-text-muted peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-text-muted pointer-events-none"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    tabIndex={0}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-error mt-1.5">{passwordError}</p>
                )}
              </div>

              {/* Remember me + What is this? */}
              <div className="mb-6">
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
                    className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
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
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:text-primary-dark underline transition-colors"
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
                onClick={handleCreateAccount}
              >
                Create an account
              </button>
            </div>
          </div>

          {/* Right: Member benefits — desktop only */}
          <div className="hidden md:flex flex-col px-10 py-8 w-[42%] flex-shrink-0">
            <h3 className="text-lg font-bold text-text-primary mb-6">
              Member benefits
            </h3>
            <div className="space-y-5">
              <p className="text-sm text-text-primary leading-relaxed">
                <span className="text-primary font-bold">Get what you want</span> &ndash; save items for later, so they&apos;re to hand when you&apos;re ready to buy
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                <span className="text-primary font-bold">Get it at the best price</span> &ndash; we&apos;ll email you if the stuff you love drops in price
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                <span className="text-primary font-bold">Get it easier</span> &ndash; check out faster, and track the status of your orders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
