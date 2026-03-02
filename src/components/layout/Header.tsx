"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import { useSaved } from "@/lib/saved-context";

export default function Header() {
  const { itemCount } = useBasket();
  const { savedCount } = useSaved();
  const router = useRouter();
  const [showAccount, setShowAccount] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
    }
    if (showAccount) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAccount]);

  return (
    <header className="bg-white py-2 md:py-3">
      <div className="container-main flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="https://www.currys.co.uk/on/demandware.static/-/Sites-curryspcworlduk-Library/default/dw12db0942/images/brand-currys-logo.svg"
            alt="Currys"
            width={80}
            height={80}
            className="w-10 h-10 md:w-[68px] md:h-[68px]"
            priority
          />
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-[620px]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our products, brands & services"
              className="w-full rounded-input border border-input-border py-2 md:py-2.5 pl-3 md:pl-4 pr-10 md:pr-12 text-sm text-input-text
                         focus:border-primary focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary rounded-full w-8 h-8 md:w-9 md:h-9
                         flex items-center justify-center hover:bg-primary-dark transition-colors"
              aria-label="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>

        {/* Utility Icons — Account, Saved, Basket only */}
        <nav className="flex items-center gap-3 md:gap-5 ml-auto flex-shrink-0">
          {/* Account (dropdown) */}
          <div ref={accountRef} className="relative hidden md:block">
            <button
              onClick={() => setShowAccount(!showAccount)}
              className="flex flex-col items-center gap-0.5 text-text-primary no-underline hover:text-primary transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 10-16 0" />
              </svg>
              <span className="text-[10px]">Account</span>
            </button>

            {/* Account dropdown */}
            {showAccount && (
              <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-lg border border-border shadow-lg z-50 p-5">
                <h3 className="text-base font-bold text-text-primary mb-1">My Account</h3>
                <p className="text-xs text-text-secondary mb-4">
                  Sign in to track orders, save items and more
                </p>

                <Link
                  href="/account"
                  className="btn-primary w-full text-sm text-center block mb-3 no-underline"
                  onClick={() => setShowAccount(false)}
                >
                  Sign in
                </Link>
                <p className="text-xs text-center text-text-secondary mb-4">
                  New customer?{" "}
                  <Link href="/account" className="text-primary no-underline hover:underline" onClick={() => setShowAccount(false)}>
                    Create an account
                  </Link>
                </p>

                <div className="border-t border-border pt-3 space-y-2">
                  <DropdownLink href="/account" label="My orders" icon="orders" onClick={() => setShowAccount(false)} />
                  <DropdownLink href="/account" label="My details" icon="details" onClick={() => setShowAccount(false)} />
                  <DropdownLink href="/saved" label="Saved items" icon="saved" onClick={() => setShowAccount(false)} />
                  <DropdownLink href="/track-your-order" label="Track my order" icon="track" onClick={() => setShowAccount(false)} />
                  <DropdownLink href="/services/returns" label="Returns" icon="returns" onClick={() => setShowAccount(false)} />
                </div>
              </div>
            )}
          </div>

          {/* Account link (mobile – no dropdown) */}
          <Link
            href="/account"
            className="flex md:hidden flex-col items-center gap-0.5 text-text-primary no-underline hover:text-primary transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
            <span className="text-[10px]">Account</span>
          </Link>

          {/* Saved */}
          <Link
            href="/saved"
            className="hidden sm:flex flex-col items-center gap-0.5 text-text-primary no-underline hover:text-primary transition-colors relative"
          >
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Saved</span>
          </Link>

          {/* Basket */}
          <Link
            href="/basket"
            className="flex flex-col items-center gap-0.5 text-text-primary no-underline hover:text-primary transition-colors relative"
          >
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Basket</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ── Small dropdown link row ── */
function DropdownLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  onClick: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
    orders: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    details: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 10-16 0" />
      </svg>
    ),
    saved: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    track: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    returns: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 py-2 text-sm text-text-primary no-underline hover:text-primary transition-colors"
    >
      <span className="text-text-secondary">{icons[icon]}</span>
      {label}
    </Link>
  );
}
