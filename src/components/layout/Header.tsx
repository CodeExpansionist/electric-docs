"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBasket } from "@/lib/basket-context";
import { useSaved } from "@/lib/saved-context";
import { useSignInModal } from "@/lib/signin-modal-context";
import { navLinks } from "./MainNav";

interface Suggestion {
  type: "product" | "category" | "brand";
  text: string;
  url: string;
  image?: string | null;
  price?: number;
  category?: string;
}

export default function Header() {
  const { itemCount } = useBasket();
  const { savedCount } = useSaved();
  const { openSignInModal } = useSignInModal();
  const router = useRouter();
  const [showAccount, setShowAccount] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=suggest`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(data.suggestions?.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const s = suggestions[activeIndex];
      setShowSuggestions(false);
      router.push(s.url);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  /* Close dropdowns when clicking outside */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [menuOpen]);

  /* Focus trap + Escape for mobile drawer */
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="bg-white py-2 md:py-3">
      <div className="container-main flex flex-col gap-2 md:gap-0">
        {/* Row 1: Logo + Utility Icons */}
        <div className="flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/brand-electriz-logo.svg"
            alt="Electriz"
            width={100}
            height={100}
            className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11"
            priority
          />
        </Link>

        {/* Search Bar — inline on desktop, own row on mobile */}
        <div ref={searchRef} className="hidden md:block flex-1 min-w-0 max-w-[460px] relative">
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center">
              <label htmlFor="site-search" className="sr-only">Search products, brands and services</label>
              <input
                id="site-search"
                type="text"
                data-testid="search-input"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search our products, brands & services"
                className="w-full rounded-input border border-input-border h-11 pl-5 md:pl-6 pr-12 md:pr-14 text-sm text-input-text
                           focus:border-primary focus:ring-0 transition-colors search-input"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary rounded-full w-[38px] h-[38px]
                           flex items-center justify-center hover:bg-primary-dark transition-colors"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id="search-suggestions"
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-[480px] overflow-y-auto"
            >
              {/* Category / Brand suggestions */}
              {suggestions.filter((s) => s.type === "category" || s.type === "brand").length > 0 && (
                <div className="border-b border-border">
                  {suggestions
                    .filter((s) => s.type === "category" || s.type === "brand")
                    .map((suggestion, idx) => {
                      const globalIdx = suggestions.indexOf(suggestion);
                      return (
                        <Link
                          key={`${suggestion.type}-${idx}`}
                          href={suggestion.url}
                          role="option"
                          aria-selected={activeIndex === globalIdx}
                          onClick={() => setShowSuggestions(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 no-underline transition-colors ${
                            activeIndex === globalIdx ? "bg-surface" : "hover:bg-surface"
                          }`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-text-secondary" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                          </svg>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">{suggestion.text}</p>
                            <p className="text-xs text-text-secondary">
                              {suggestion.type === "category" ? "Category" : "Brand"} · {suggestion.category}
                            </p>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto flex-shrink-0 text-text-muted" aria-hidden="true">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      );
                    })}
                </div>
              )}

              {/* Product suggestions */}
              {suggestions.filter((s) => s.type === "product").length > 0 && (
                <div>
                  <p className="px-4 pt-2.5 pb-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Products
                  </p>
                  {suggestions
                    .filter((s) => s.type === "product")
                    .map((suggestion, idx) => {
                      const globalIdx = suggestions.indexOf(suggestion);
                      return (
                        <Link
                          key={`product-${idx}`}
                          href={suggestion.url}
                          role="option"
                          aria-selected={activeIndex === globalIdx}
                          onClick={() => setShowSuggestions(false)}
                          className={`flex items-center gap-3 px-4 py-2 no-underline transition-colors ${
                            activeIndex === globalIdx ? "bg-surface" : "hover:bg-surface"
                          }`}
                        >
                          {/* Product image */}
                          <div className="w-10 h-10 flex-shrink-0 bg-white border border-border rounded flex items-center justify-center overflow-hidden">
                            {suggestion.image ? (
                              <Image
                                src={suggestion.image}
                                alt={suggestion.text}
                                width={40}
                                height={40}
                                className="object-contain"
                                unoptimized
                              />
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-text-primary truncate">{suggestion.text}</p>
                            <p className="text-xs text-text-secondary">{suggestion.category}</p>
                          </div>
                          {suggestion.price != null && (
                            <span className="text-sm font-bold text-text-primary flex-shrink-0">
                              £{suggestion.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  {/* View all results link */}
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block px-4 py-3 text-sm text-primary font-semibold no-underline hover:bg-surface border-t border-border text-center"
                  >
                    View all results for &quot;{searchQuery.trim()}&quot;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Utility Icons — Account, Saved, Basket, Menu */}
        <nav aria-label="Account and shopping" className="flex items-center gap-3 md:gap-5 ml-auto flex-shrink-0">
          {/* Account (dropdown) */}
          <div
            ref={accountRef}
            className="relative hidden md:block"
            onKeyDown={(e) => {
              if (e.key === "Escape" && showAccount) {
                setShowAccount(false);
                (accountRef.current?.querySelector("button") as HTMLElement)?.focus();
              }
            }}
          >
            <button
              onClick={() => setShowAccount(!showAccount)}
              aria-expanded={showAccount}
              aria-haspopup="true"
              aria-controls="account-menu"
              className="group flex flex-col items-center gap-0.5 no-underline transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-icon group-hover:text-primary" aria-hidden="true">
                <path d="M8.936 12.517a.5.5 0 01.497.099c.59.525 1.55.827 2.582.822a.5.5 0 01.006 1c-1.142.007-2.232-.301-3.015-.881-2.575.985-4.278 3.025-4.485 5.442H19.48c-.214-2.496-2.024-4.59-4.742-5.536a.5.5 0 01.329-.945c3.279 1.141 5.434 3.814 5.434 6.982a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5c0-3.169 2.156-5.842 5.436-6.983zM11.982 4a4.088 4.088 0 014.086 4.09 4.087 4.087 0 11-8.172 0c0-2.259 1.83-4.09 4.086-4.09zm0 1a3.087 3.087 0 10.002 6.174A3.087 3.087 0 0011.982 5z" fill="currentColor" fillRule="nonzero" />
              </svg>
              <span className="text-sm font-normal text-text-primary group-hover:text-primary">Account</span>
            </button>

            {/* Account dropdown */}
            {showAccount && (
              <div id="account-menu" className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-lg border border-border shadow-lg z-50 p-5">
                <h3 className="text-base font-bold text-text-primary mb-1">My Account</h3>
                <p className="text-xs text-text-secondary mb-4">
                  Sign in to track orders, save items and more
                </p>

                <button
                  className="btn-primary w-full text-sm text-center block mb-3"
                  onClick={() => { setShowAccount(false); openSignInModal(); }}
                >
                  Sign in
                </button>
                <p className="text-xs text-center text-text-secondary mb-4">
                  New customer?{" "}
                  <button className="text-primary hover:underline" onClick={() => { setShowAccount(false); openSignInModal(); }}>
                    Create an account
                  </button>
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

          {/* Account link (mobile – opens sign-in modal) */}
          <button
            onClick={openSignInModal}
            className="group flex md:hidden flex-col items-center gap-0.5 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-icon group-hover:text-primary" aria-hidden="true">
              <path d="M8.936 12.517a.5.5 0 01.497.099c.59.525 1.55.827 2.582.822a.5.5 0 01.006 1c-1.142.007-2.232-.301-3.015-.881-2.575.985-4.278 3.025-4.485 5.442H19.48c-.214-2.496-2.024-4.59-4.742-5.536a.5.5 0 01.329-.945c3.279 1.141 5.434 3.814 5.434 6.982a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5c0-3.169 2.156-5.842 5.436-6.983zM11.982 4a4.088 4.088 0 014.086 4.09 4.087 4.087 0 11-8.172 0c0-2.259 1.83-4.09 4.086-4.09zm0 1a3.087 3.087 0 10.002 6.174A3.087 3.087 0 0011.982 5z" fill="currentColor" fillRule="nonzero" />
            </svg>
            <span className="text-sm font-normal text-text-primary group-hover:text-primary">Account</span>
          </button>

          {/* Saved */}
          <Link
            href="/saved"
            className="group flex flex-col items-center gap-0.5 no-underline transition-colors relative"
          >
            <div className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-icon group-hover:text-primary" aria-hidden="true">
                <path d="M11.995 5.07c6.028-5.805 17.977 5.727 0 15.43-17.978-9.703-5.993-21.255 0-15.43zm-.697.718c-2.345-2.28-6.071-1.361-7.378 1.58-1.519 3.42.841 7.87 7.8 11.836l.275.154.275-.154.362-.209.7-.42c6.024-3.733 8.107-7.811 6.827-11.02l-.076-.18c-1.274-2.874-4.871-3.818-7.238-1.728l-.156.144-.697.671-.694-.674z" fill="currentColor" fillRule="nonzero" />
              </svg>
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-badge text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-sm font-normal text-text-primary group-hover:text-primary">Saved</span>
          </Link>

          {/* Basket */}
          <Link
            href="/basket"
            className="group flex flex-col items-center gap-0.5 no-underline transition-colors relative"
          >
            <div className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-icon group-hover:text-primary" aria-hidden="true">
                <path d="M9.009 9.54c.283 0 .512.223.512.5s-.23.5-.512.5H3.792a.152.152 0 00-.057.013c-.152.061-.259.318-.187.563l2.385 8.128c.048.166.154.254.243.254h11.648c.09 0 .195-.088.243-.254l2.385-8.128a.572.572 0 00.023-.16c0-.248-.143-.415-.267-.415h-5.204a.507.507 0 01-.513-.501c0-.277.23-.5.513-.5h5.204c.737 0 1.292.652 1.292 1.416 0 .148-.021.295-.062.436l-2.385 8.128c-.168.573-.654.98-1.23.98H6.177c-.575 0-1.06-.407-1.229-.98l-2.384-8.128c-.209-.71.117-1.496.779-1.765.143-.058.296-.088.45-.088h5.217zm8.502-5.884a.505.505 0 01.715-.015c.206.195.22.516.031.718L13.208 9.75c.057.143.088.298.088.46 0 .7-.58 1.267-1.296 1.267-.716 0-1.297-.567-1.297-1.266 0-.7.58-1.267 1.297-1.267.168 0 .328.031.475.088l5.036-5.377zM12 9.946a.268.268 0 00-.271.266c0 .146.121.264.271.264.15 0 .271-.118.271-.264A.268.268 0 0012 9.947z" fill="currentColor" fillRule="nonzero" />
              </svg>
              {itemCount > 0 && (
                <span data-testid="basket-count" className="absolute -top-1.5 -right-2 bg-badge text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-normal text-text-primary group-hover:text-primary">Basket</span>
          </Link>

          {/* Hamburger menu — mobile/tablet only, positioned after Basket */}
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="lg:hidden group flex flex-col items-center gap-0.5 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-icon group-hover:text-primary" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <span className="text-sm font-normal text-text-primary group-hover:text-primary">Menu</span>
          </button>
        </nav>
        </div>{/* End Row 1 */}

        {/* Row 2: Mobile search bar — always visible on mobile, hidden on desktop (already shown inline) */}
        <div ref={mobileSearchRef} className="md:hidden relative">
          <form onSubmit={handleSearch}>
            <div className="relative flex items-center">
              <label htmlFor="mobile-search" className="sr-only">Search products, brands and services</label>
              <input
                id="mobile-search"
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search our products, brands & services"
                className="w-full rounded-input border-0 bg-[#F2F2F2] h-11 pl-5 pr-12 text-sm text-input-text
                           focus:border-primary focus:ring-0 transition-colors search-input"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-autocomplete="list"
                aria-controls="mobile-search-suggestions"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary rounded-full w-[38px] h-[38px]
                           flex items-center justify-center hover:bg-primary-dark transition-colors"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile nav drawer — slide-in from left */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-lg overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-text-primary">Menu</span>
              <button
                onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus(); }}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center text-text-primary hover:text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              <ul className="py-2">
                {navLinks.map((link) => (
                  <li key={link.text}>
                    <Link
                      href={link.url}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 pt-2.5 pb-2 text-sm font-normal text-text-primary no-underline hover:text-primary hover:bg-surface transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
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
      <span className="text-text-secondary" aria-hidden="true">{icons[icon]}</span>
      {label}
    </Link>
  );
}
