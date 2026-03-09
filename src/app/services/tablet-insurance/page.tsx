"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

const coverageRows = [
  { feature: "Replacement Period \u2013 Next working day", complete: true, lite: true },
  { feature: "Accidental damage", complete: true, lite: true },
  { feature: "Theft", complete: true, lite: false },
  { feature: "Loss", complete: true, lite: false },
  { feature: "Breakdowns (after warranty expires)", complete: true, lite: true },
  { feature: "Accessories damage (up to \u00A3300)", complete: true, lite: true },
  { feature: "Worldwide cover", complete: true, lite: true },
  { feature: "24/7 phone support", complete: true, lite: true },
  { feature: "24/7 remote support", complete: true, lite: true },
];

const includedCards = [
  {
    title: "A simple and easy claims process",
    description: "Online or over the phone.",
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
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: "Replacement tablet delivered the next working day",
    description: "Get back up and running fast.",
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
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Expert Support 24/7, 365 days a year",
    description: "Help whenever you need it.",
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
];

const notCoveredItems = [
  "Any pre-existing faults or damage before the policy start date",
  "Damage caused intentionally",
  "Wear and tear or gradual deterioration",
  "Software issues, viruses or data loss",
  "Cosmetic damage that does not affect functionality",
  "Loss or theft if not reported to the police within 48 hours",
];

const faqItems = [
  {
    title: "Does stopping sales affect my current policy?",
    content: (
      <div>
        <p>No. There are no changes to your existing policy.</p>
      </div>
    ),
  },
  {
    title: "How to cancel your insurance policy",
    content: (
      <div>
        <p>
          <Link
            href="/contact-us"
            className="text-primary no-underline hover:underline"
          >
            Contact us
          </Link>{" "}
          or call{" "}
          <span className="font-bold text-text-primary">0800 049 0221</span>.
        </p>
      </div>
    ),
  },
  {
    title: "How to make a complaint",
    content: (
      <div>
        <p>
          <Link
            href="/contact-us"
            className="text-primary no-underline hover:underline"
          >
            Contact us
          </Link>
          , write to Electriz Insurance PO Box 194 Cramlington NE23 0DA, or call{" "}
          <span className="font-bold text-text-primary">0800 049 0221</span>.
        </p>
      </div>
    ),
  },
];

export default function TabletInsurancePage() {
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
          <span className="text-text-primary">Tablet Insurance</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#007D8A] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Tablet Insurance
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Tech Insurance from the tech experts!
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Intro */}
        <section className="mb-10">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Protect your tablet with comprehensive insurance from Electriz.
            Choose from our Complete or Lite plans to get the level of cover that
            suits you best.
          </p>
        </section>

        {/* Coverage comparison table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Coverage comparison
          </h2>
          <div className="bg-surface rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EBEBEB]">
                    <th className="text-left px-4 py-3 font-bold text-text-primary">
                      Feature
                    </th>
                    <th className="text-center px-4 py-3 font-bold text-text-primary">
                      Complete
                    </th>
                    <th className="text-center px-4 py-3 font-bold text-text-primary">
                      Lite
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coverageRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={
                        i < coverageRows.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 text-text-primary">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.complete ? (
                          <span className="text-[#008A00] font-bold">
                            &#10003;
                          </span>
                        ) : (
                          <span className="text-[#CC0000] font-bold">
                            &#10007;
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.lite ? (
                          <span className="text-[#008A00] font-bold">
                            &#10003;
                          </span>
                        ) : (
                          <span className="text-[#CC0000] font-bold">
                            &#10007;
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What's included cards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            What&apos;s included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {includedCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-lg border border-border p-6"
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-base font-bold text-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What's NOT covered */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            What&apos;s not covered
          </h2>
          <div className="bg-white rounded-lg border border-border p-6">
            <ul className="space-y-2">
              {notCoveredItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="text-[#CC0000] font-bold flex-shrink-0 mt-0.5">
                    &#10007;
                  </span>
                  <span className="text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
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
