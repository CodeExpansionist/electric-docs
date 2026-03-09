"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

const features = [
  {
    title: "Breakdown support when you need it",
    description:
      "Our Instant Replacement plan means you'll be supported if your product breaks down due to an electrical or mechanical fault.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007D8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Instant means instant",
    description:
      "If your product breaks down, we'll give you a new one. Simply contact us and if we've got your product in stock we'll arrange a replacement straight away or find you an alternative.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007D8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Three years of replacements",
    description:
      "Our Instant Replacement plan gives you 3 years of unlimited replacements.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007D8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "No limits",
    description:
      "You're entitled to as many new replacement products as necessary during the three years of your plan.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007D8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Exclusions",
    description:
      "Instant Replacement excludes accidental and cosmetic damage.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#007D8A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

const pricingRows = [
  {
    range: "\u00A320 - \u00A340",
    col1: "\u00A310",
    col2: "\u00A313",
    col3: "\u00A311",
  },
  {
    range: "\u00A341 - \u00A360",
    col1: "\u00A313",
    col2: "\u00A317",
    col3: "\u00A315",
  },
  {
    range: "\u00A361 - \u00A380",
    col1: "\u00A317",
    col2: "\u00A324",
    col3: "\u00A321",
  },
  {
    range: "\u00A381 - \u00A3100",
    col1: "\u00A322",
    col2: "\u00A330",
    col3: "\u00A326",
  },
  {
    range: "\u00A3101 - \u00A3120",
    col1: "\u00A327",
    col2: "\u00A335",
    col3: "\u00A331",
  },
  {
    range: "\u00A3121 - \u00A3150",
    col1: "\u00A331",
    col2: "\u00A340",
    col3: "\u00A336",
  },
];

const faqItems = [
  {
    title: "How long does it take for my product to be replaced?",
    content: (
      <div>
        <p>
          If your product breaks down, once your fault is confirmed we&apos;ll
          arrange a replacement straight away.
        </p>
      </div>
    ),
  },
  {
    title: "Are there any excess charges?",
    content: (
      <div>
        <p>Of course not. There are no additional charges.</p>
      </div>
    ),
  },
  {
    title: "Can I renew when my Instant Replacement ends?",
    content: (
      <div>
        <p>
          No, we don&apos;t offer renewals. Your plan expires after three years.
        </p>
      </div>
    ),
  },
  {
    title: "Will Instant Replacement protect me against accidental damage?",
    content: (
      <div>
        <p>No, it&apos;s an extended warranty plan only.</p>
      </div>
    ),
  },
];

export default function InstantReplacementPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-text-secondary">Services</span>
          <span>&gt;</span>
          <span className="text-text-primary">Instant replacement</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#007D8A] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Instant replacement
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            From broken to brand new!
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* How to buy */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-3">
            How to buy
          </h2>
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center gap-3">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#007D8A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Online
                </h3>
                <p className="text-sm text-text-secondary">
                  Add Instant Replacement with your purchase
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature sections */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">Pricing</h2>
          <div className="bg-surface rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EBEBEB]">
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Product price
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      TVs, SKA, Printers, Other
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Floorcare, Gaming, Headphones, Scooters
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Imaging, Audio, Drones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row, i) => (
                    <tr
                      key={row.range}
                      className={
                        i < pricingRows.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 text-text-primary font-medium">
                        {row.range}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {row.col1}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {row.col2}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {row.col3}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </section>

        {/* Contact section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Contact us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By phone */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#007D8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <h3 className="text-base font-bold text-text-primary">
                  By phone
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Call us on{" "}
                <span className="font-bold text-text-primary">
                  0344 800 6080
                </span>
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Mon-Fri: 8am to 8pm
                <br />
                Sat: 9am to 6pm
                <br />
                Sun: 9am to 5pm
              </p>
            </div>

            {/* By post */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#007D8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <h3 className="text-base font-bold text-text-primary">
                  By post
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Electriz Care Services
                <br />
                PO Box 194
                <br />
                Cramlington
                <br />
                NE23 0DA
              </p>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="border-t border-border pt-6 mb-8">
          <Link
            href="/"
            className="text-sm text-primary no-underline hover:underline"
          >
            &larr; Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
