"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

/* ---------- Purchase option cards data ---------- */

const purchaseOptions = [
  {
    title: "Online",
    description:
      "The perfect gift for any occasion. A great range of designs to choose from and any load value available up to \u00A31,000.",
    linkText: "Shop now",
    linkHref: "#",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4C12A1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>
    ),
  },
  {
    title: "In store",
    description:
      "Purchase a gift card in-store and load it with up to \u00A31,000.",
    linkText: "Find your nearest store",
    linkHref: "#",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4C12A1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
  },
  {
    title: "Corporate self-service",
    description:
      "Reward your staff, clients or customers with an eGift Card! Order now through our corporate self-service portal. Simple.",
    linkText: "Order now",
    linkHref: "#",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4C12A1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

/* ---------- FAQ items ---------- */

const faqItems = [
  {
    title: "How do I use my gift card or eGift card?",
    content: (
      <div className="space-y-2">
        <p>
          You can redeem your gift card in any Currys store or online at
          currys.co.uk. When shopping online, enter the 19-digit card number and
          4-digit PIN at checkout. In store, simply hand your gift card to the
          cashier at the point of payment.
        </p>
      </div>
    ),
  },
  {
    title:
      "What will happen if I return something I bought with a gift card?",
    content: (
      <p>
        If you return an item that was purchased using a gift card, the refund
        will be credited back onto a gift card. This gift card will be posted to
        you or handed to you in store.
      </p>
    ),
  },
  {
    title: "How many gift cards can I use online?",
    content: (
      <p>
        You can use up to 10 gift cards per online transaction. If you need to
        use more, please visit your nearest Currys store where there is no limit
        on the number of gift cards you can use.
      </p>
    ),
  },
  {
    title: "When will my gift card balance expire?",
    content: (
      <p>
        Your gift card balance will expire if the card has not been used for a
        continuous period of 2 years. We recommend using your gift card as soon
        as possible to avoid losing your balance.
      </p>
    ),
  },
  {
    title: "Can I check the balance on my gift card?",
    content: (
      <p>
        Yes, you can check your gift card balance online using our{" "}
        <Link
          href="#"
          className="text-primary no-underline hover:underline"
        >
          balance checker
        </Link>
        , or by visiting any Currys store. You will need your 19-digit card
        number and 4-digit PIN.
      </p>
    ),
  },
  {
    title: "Why can't I use my gift card?",
    content: (
      <p>
        There may be several reasons you are unable to use your gift card. You
        may not have enough funds on the card to cover the purchase &mdash;
        please check your balance. The card may have expired due to 2 years of
        non-use. If you continue to experience issues, please contact our
        customer service team for assistance.
      </p>
    ),
  },
];

/* ---------- Terms and conditions items ---------- */

const termsItems = [
  {
    title: "Currys gift cards and eGift cards",
    content: (
      <div className="space-y-3">
        <p>
          Currys gift cards and eGift cards can be redeemed in any Currys store
          across the UK &amp; Republic of Ireland, or online at currys.co.uk.
        </p>
        <p>
          Gift cards cannot be used to purchase airtime, SIM-only deals, or
          certain mobile phone contracts. Gift cards and eGift cards are not
          redeemable for cash and cannot be exchanged for cash, except where
          required by law.
        </p>
        <p>
          Cards expire after a continuous period of 2 years of non-use. Please
          treat your gift card as cash &mdash; lost or stolen cards cannot be
          replaced.
        </p>
        <p className="text-xs text-text-secondary mt-2">
          Issuer: Currys Group Limited, 1 Portal Way, London, W3 6RS.
        </p>
      </div>
    ),
  },
];

/* ---------- Component ---------- */

export default function GiftCardsPage() {
  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="container-main py-3">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Home
          </Link>
          <span>&gt;</span>
          <Link
            href="/help-and-support"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Services
          </Link>
          <span>&gt;</span>
          <Link
            href="#"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Ways to pay
          </Link>
          <span>&gt;</span>
          <span className="text-text-primary">Gift cards</span>
        </nav>
      </div>

      {/* Teal header banner */}
      <div
        className="relative w-full py-10 md:py-14"
        style={{ backgroundColor: "#007D8A" }}
      >
        <div className="container-main relative z-10 text-center">
          <h1 className="text-3xl md:text-[36px] font-bold text-white mb-3">
            Gift cards
          </h1>
          <p className="text-base md:text-lg text-white max-w-2xl mx-auto">
            Can&apos;t decide on the perfect gift? Give the gift of tech with a
            Currys gift card
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container-main py-8 space-y-8">
        {/* Purchase options heading */}
        <h2 className="text-xl font-bold text-text-primary">
          Where can I purchase Currys gift cards?
        </h2>

        {/* Purchase option cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {purchaseOptions.map((option) => (
            <div
              key={option.title}
              className="bg-white rounded-lg border border-border p-6 text-center flex flex-col items-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-text-primary mb-2">
                {option.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
                {option.description}
              </p>

              {/* Link */}
              <Link
                href={option.linkHref}
                className="text-sm font-semibold text-primary no-underline hover:underline inline-flex items-center gap-1"
              >
                {option.linkText}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs section */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">FAQs</h2>
          <Accordion items={faqItems} />
        </div>

        {/* Terms and conditions section */}
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Terms and conditions
          </h2>
          <Accordion items={termsItems} />
        </div>
      </div>
    </div>
  );
}
