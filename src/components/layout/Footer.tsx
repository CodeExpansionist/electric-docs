"use client";

import { useState } from "react";
import Link from "next/link";

const columns = [
  {
    heading: "Customer support",
    links: [
      { text: "Help & Support", url: "/help-and-support" },
      { text: "Contact us", url: "/help-and-support#contact" },
      { text: "Track my order", url: "/track-your-order" },
      { text: "Returns & cancellations", url: "/services/returns" },
      { text: "Delivery options", url: "/services/delivery" },
    ],
  },
  {
    heading: "Shopping with us",
    links: [
      { text: "Brands", url: "/brands" },
      { text: "Promotions", url: "/promotions" },
      { text: "Price Promise", url: "/services/price-promise" },
      { text: "Product reviews", url: "/product-reviews" },
      { text: "Basket", url: "/basket" },
    ],
  },
  {
    heading: "Your account",
    links: [
      { text: "Account", url: "/account" },
      { text: "Your orders", url: "/account" },
      { text: "Saved items", url: "/saved" },
      { text: "TechTalk", url: "/techtalk" },
    ],
  },
  {
    heading: "About Electriz",
    links: [
      { text: "About us", url: "/about-us" },
      { text: "Careers", url: "/careers" },
      { text: "Recycling & WEEE", url: "/recycling" },
      { text: "Modern Slavery Statement", url: "/modern-slavery-statement" },
      { text: "Security & Privacy", url: "/security-and-privacy" },
      { text: "Accessibility", url: "/accessibility" },
    ],
  },
];

export default function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((c) => [c.heading, false]))
  );

  const toggle = (heading: string) => {
    setOpenSections((prev) => ({ ...prev, [heading]: !prev[heading] }));
  };

  return (
    <footer className="bg-footer-bg text-white">
      <div className="container-main py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8">
          {columns.map((col) => (
            <div key={col.heading} className="border-b border-white md:border-0">
              {/* Mobile: clickable accordion header */}
              <button
                className="flex w-full justify-between items-center my-6 md:hidden text-left"
                onClick={() => toggle(col.heading)}
                aria-expanded={openSections[col.heading]}
                aria-controls={`footer-${col.heading.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <h3 className="text-base font-bold">{col.heading}</h3>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${openSections[col.heading] ? "rotate-180" : ""}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Desktop: static heading */}
              <h3 className="hidden md:block text-base font-bold mb-4">{col.heading}</h3>

              {/* Link list — collapses on mobile, always visible on desktop */}
              <ul
                id={`footer-${col.heading.replace(/\s+/g, "-").toLowerCase()}`}
                className={`space-y-2.5 overflow-hidden transition-all duration-200 md:!max-h-none md:pb-0 ${
                  openSections[col.heading] ? "max-h-96 mb-6" : "max-h-0"
                }`}
              >
                {col.links.map((link) => (
                  <li key={link.text}>
                    <Link
                      href={link.url}
                      className="text-sm text-footer-text hover:text-white no-underline transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
