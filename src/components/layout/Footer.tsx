"use client";

import { useState } from "react";
import Link from "next/link";

const columns = [
  {
    heading: "Help & support",
    links: [
      { text: "Contact us", url: "/help-and-support/contact-us" },
      { text: "Stores", url: "/stores" },
      { text: "TechTalk", url: "/techtalk" },
      { text: "Price Promise", url: "/services/price-promise" },
      { text: "Product reviews", url: "/product-reviews" },
    ],
  },
  {
    heading: "Services",
    links: [
      { text: "Track my order", url: "/track-your-order" },
      { text: "Delivery options", url: "/services/delivery" },
      { text: "Order & collect", url: "/services/order-and-collect" },
      { text: "Returns & cancellations", url: "/services/returns" },
      { text: "ShopLive", url: "/services/shoplive" },
    ],
  },
  {
    heading: "Care Services",
    links: [
      { text: "Care & Repair", url: "/services/care-and-repair" },
      { text: "Instant Replacement", url: "/services/instant-replacement" },
      { text: "Mobile Insurance", url: "/services/mobile-insurance" },
      { text: "Tablet Insurance", url: "/services/tablet-insurance" },
    ],
  },
  {
    heading: "Our websites",
    links: [
      { text: "Electriz Business", url: "/business" },
      { text: "Electriz Ireland", url: "/ireland" },
      { text: "Partmaster", url: "/partmaster" },
      { text: "Carphone Warehouse", url: "/carphone-warehouse" },
    ],
  },
  {
    heading: "About us",
    links: [
      { text: "Leave review on Trustpilot", url: "/trustpilot" },
      { text: "Corporate site", url: "/corporate" },
      { text: "Careers", url: "/careers" },
      { text: "PR & media", url: "/pr-media" },
      { text: "Modern slavery statement", url: "/modern-slavery-statement" },
      { text: "Corporate social responsibility", url: "/csr" },
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-8">
          {columns.map((col) => (
            <div key={col.heading} className="border-b border-white md:border-0">
              {/* Mobile: clickable accordion header */}
              <button
                className="flex w-full justify-between items-center my-6 md:hidden text-left"
                onClick={() => toggle(col.heading)}
                aria-expanded={openSections[col.heading]}
                aria-controls={`footer-${col.heading.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <h3 className="text-sm font-normal">{col.heading}</h3>
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
              <h3 className="hidden md:block text-sm font-normal mb-4">{col.heading}</h3>

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
