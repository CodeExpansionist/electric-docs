"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ---------- Countdown helper ---------- */

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/* ---------- Data ---------- */

interface Promotion {
  code: string;
  title: string;
  description: string;
  discount: string;
  terms: string[];
  active: boolean;
  dates: string;
}

const activePromo: Promotion = {
  code: "1STTV50",
  title: "First-time buyers get \u00A350 off",
  description:
    "New to Electriz? Welcome! Use this exclusive code at checkout to get \u00A350 off your first order. Whether you\u2019re upgrading your living room TV or setting up a brand new sound system, this is the perfect time to shop.",
  discount: "\u00A350 off",
  terms: [
    "Valid for first-time customers only (one use per customer).",
    "Minimum order value of \u00A3700.",
    "Cannot be combined with other promotional codes.",
    "Applies to all TVs and audio products.",
  ],
  active: true,
  dates: "",
};

const pastPromos: Promotion[] = [
  {
    code: "NEWYEAR25",
    title: "New Year Sale \u2014 25% off all soundbars",
    description:
      "We kicked off 2026 with a bang! Customers saved 25% on our entire range of soundbars including Samsung, Sony, Sonos, and LG. This was one of our most popular promotions ever, with hundreds of customers upgrading their home audio setup.",
    discount: "25% off",
    terms: [
      "Valid on all soundbars only.",
      "Could not be combined with other offers.",
      "Maximum discount of \u00A3200 per order.",
    ],
    active: false,
    dates: "1 Jan 2026 \u2013 14 Jan 2026",
  },
  {
    code: "AUDIO100",
    title: "February Half-Term \u2014 \u00A3100 off orders over \u00A3500",
    description:
      "During the February half-term break, customers enjoyed \u00A3100 off when spending \u00A3500 or more on any TV or audio product. A great excuse to invest in that home cinema setup the whole family can enjoy.",
    discount: "\u00A3100 off",
    terms: [
      "Minimum spend of \u00A3500 required.",
      "One use per household.",
      "Excluded sale items and clearance products.",
    ],
    active: false,
    dates: "15 Feb 2026 \u2013 23 Feb 2026",
  },
];

/* ---------- Component ---------- */

export default function PromotionsPage() {
  const [time, setTime] = useState(() => getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen">
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
          <span className="text-text-primary">Promotions</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-primary w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Promotions &amp; Offers
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Save on the latest TVs and audio equipment with our exclusive promo
            codes. Check back regularly for new deals.
          </p>
        </div>
      </div>

      <div className="container-main py-10">
        {/* Active promotion */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Active promotion
          </h2>

          <div className="rounded-lg border-2 border-primary overflow-hidden">
            {/* Top banner with countdown */}
            <div className="bg-primary px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-white text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                  Live now
                </span>
                <span className="text-white font-bold text-lg">
                  {activePromo.discount}
                </span>
              </div>
              <div
                className="text-white font-semibold text-sm"
                role="timer"
                aria-live="polite"
                aria-atomic="true"
              >
                Ends in{" "}
                <span className="inline-block bg-white/20 rounded px-2 py-0.5 font-mono">
                  {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {activePromo.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {activePromo.description}
                  </p>

                  {/* Promo code display */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm text-text-secondary">
                      Use code:
                    </span>
                    <span className="bg-surface border-2 border-dashed border-primary rounded-md px-5 py-2.5 font-bold text-lg text-primary tracking-wider">
                      {activePromo.code}
                    </span>
                  </div>

                  {/* How it works */}
                  <div className="bg-surface rounded-lg p-5">
                    <h4 className="text-sm font-bold text-text-primary mb-3">
                      How it works
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary">
                      <li>Browse our range of TVs and audio products.</li>
                      <li>
                        Add items to your basket (minimum order \u00A3700).
                      </li>
                      <li>
                        Enter the code{" "}
                        <span className="font-bold text-primary">
                          {activePromo.code}
                        </span>{" "}
                        at checkout.
                      </li>
                      <li>
                        \u00A350 will be deducted from your order total
                        instantly.
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Terms */}
                <div className="md:w-72 flex-shrink-0">
                  <div className="bg-surface rounded-lg p-5">
                    <h4 className="text-sm font-bold text-text-primary mb-3">
                      Terms &amp; conditions
                    </h4>
                    <ul className="space-y-2">
                      {activePromo.terms.map((term, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-text-secondary"
                        >
                          <span className="text-primary mt-0.5 flex-shrink-0">
                            &bull;
                          </span>
                          {term}
                        </li>
                      ))}
                    </ul>
                    {activePromo.dates && (
                      <p className="text-xs text-text-secondary mt-4 pt-3 border-t border-border">
                        {activePromo.dates}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Past promotions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Past promotions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastPromos.map((promo) => (
              <div
                key={promo.code}
                className="rounded-lg border border-border overflow-hidden opacity-75"
              >
                {/* Header */}
                <div className="bg-[#EBEBEB] px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Ended
                  </span>
                  <span className="text-xs text-text-secondary">
                    {promo.dates}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-text-primary mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {promo.description}
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-text-secondary">Code:</span>
                    <span className="bg-surface rounded-md px-4 py-1.5 font-bold text-sm text-text-secondary line-through">
                      {promo.code}
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary space-y-1">
                    <p className="font-bold text-text-primary mb-1">
                      Terms applied:
                    </p>
                    {promo.terms.map((term, i) => (
                      <p key={i}>
                        <span className="text-text-secondary">&bull;</span>{" "}
                        {term}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="rounded-lg bg-primary p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">
            Don&apos;t miss out on future deals
          </h2>
          <p className="text-sm mb-4 opacity-90">
            Sign up for an Electriz account to be the first to hear about new
            promotions, exclusive offers, and seasonal sales.
          </p>
          <Link
            href="/account#register"
            className="inline-block bg-white text-primary font-bold text-sm px-6 py-2.5 rounded-md no-underline hover:bg-white/90 transition-colors"
          >
            Create an account
          </Link>
        </section>
      </div>
    </div>
  );
}
