"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

const termsItems = [
  {
    title: "Terms & conditions",
    content: (
      <div>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            We&apos;ll match the prices of in-stock products before you buy or
            up to 7 days after.
          </li>
          <li>
            We do not match ink products, Sky Glass, delivery charges,
            installation charges, product protection plans, mobile airtime plans
            or other services.
          </li>
          <li>
            The lower price item must be offered on identical terms (including
            the same make, size, colour, specification and model number) and we
            must be able to check the price, stock position and, where relevant,
            your eligibility to purchase from the competitor.
          </li>
          <li>
            We&apos;ll match against any other UK retailer store or website
            price including offer-code discounts. This does not include any
            exclusive prices/codes (e.g. staff, student, NHS staff blue light)
            or trade prices, prices only available as part of paid for
            membership/subscription, any loyalty scheme or reward scheme, 3rd
            party marketplace seller prices or obvious pricing errors.
          </li>
          <li>
            Both us and the competitor must have the product in stock and ready
            for delivery.
          </li>
          <li>
            We reserve the right to refuse a price match where we suspect fraud
            or unauthorised reseller activity.
          </li>
        </ul>
      </div>
    ),
  },
];

export default function PricePromisePage() {
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
          <span className="text-text-primary">Price promise</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#007D8A] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Price promise
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Found it cheaper? We&apos;ll match it.
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Intro */}
        <section className="mb-10">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            We&apos;ll price match against any other UK retailer, online or
            in-store. Exclusions and conditions apply. Claim within 7 days.
          </p>
        </section>

        {/* Price match info */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-3">
            Price match before or after you buy
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            We&apos;ll even price match 7 days after your purchase! If you see
            the same item cheaper elsewhere, we&apos;ll refund you the
            difference.
          </p>
        </section>

        {/* How to claim */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            How to claim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Online card */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="text-base font-bold text-text-primary">
                  Online
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                Chat now to a member of our support team using our Webchat
                service.
              </p>
              <Link
                href="/contact-us"
                className="text-sm text-primary font-bold no-underline hover:underline"
              >
                Contact us &rarr;
              </Link>
            </div>

            {/* Call us card */}
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <h3 className="text-base font-bold text-text-primary">
                  Call us
                </h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Speak to our telesales team before you buy, on{" "}
                <span className="font-bold text-text-primary">
                  02071391386
                </span>
                .
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Monday to Friday: 8am - 8pm
                <br />
                Saturday &amp; Sunday: 9am - 5:30pm
              </p>
            </div>
          </div>
        </section>

        {/* Terms & conditions accordion */}
        <section className="mb-10">
          <Accordion items={termsItems} />
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
