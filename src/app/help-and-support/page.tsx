"use client";

import Link from "next/link";
import Image from "next/image";
import Accordion from "@/components/ui/Accordion";
/* ---------- Data ---------- */

const actionCards = [
  {
    icon: "/images/icons/returns-purple-circle-svg.svg",
    title: "Return or cancel my order",
    href: "/services/returns",
  },
  {
    icon: "/images/icons/delivery-purple-circle-svg.svg",
    title: "Track my order",
    href: "/track-your-order",
  },
  {
    icon: "/images/icons/repairs-purple-circle-svg.svg",
    title: "Track my repair",
    href: "#",
  },
  {
    icon: "/images/icons/installation-purple-circle-svg.svg",
    title: "Track my engineer",
    href: "#",
  },
];

const helpTopics = [
  {
    title: "Orders, delivery and tracking",
    content: (
      <ul className="space-y-1">
        <li>
          <Link href="/track-your-order" className="text-primary no-underline hover:underline block py-1">
            Track my delivery
          </Link>
        </li>
        <li>
          <Link href="/services/returns" className="text-primary no-underline hover:underline block py-1">
            Return, refund or cancel my order
          </Link>
        </li>
        <li>
          <Link href="/services/delivery" className="text-primary no-underline hover:underline block py-1">
            Delivery options
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Manage my order
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Order issues
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "Care Plans, Insurance, repairs and replacements",
    content: (
      <ul className="space-y-1">
        <li>
          <Link href="/services/care-and-repair" className="text-primary no-underline hover:underline block py-1">
            Care & Repair plans
          </Link>
        </li>
        <li>
          <Link href="/services/mobile-insurance" className="text-primary no-underline hover:underline block py-1">
            Mobile phone insurance
          </Link>
        </li>
        <li>
          <Link href="/services/tablet-insurance" className="text-primary no-underline hover:underline block py-1">
            Tablet insurance
          </Link>
        </li>
        <li>
          <Link href="/services/instant-replacement" className="text-primary no-underline hover:underline block py-1">
            Instant Replacement
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Book a repair
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "Buying guides, product manuals & product security reporting",
    content: (
      <ul className="space-y-1">
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Buying guides
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Product manuals
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Product security reporting
          </Link>
        </li>
        <li>
          <Link href="/product-recalls" className="text-primary no-underline hover:underline block py-1">
            Product recalls
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "Ways you can pay",
    content: (
      <ul className="space-y-1">
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Payment methods
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Gift cards & vouchers
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Promo codes
          </Link>
        </li>
      </ul>
    ),
  },
];

const popularFAQs = [
  {
    title: "What happens if my item is faulty?",
    content: (
      <p>
        If your item is faulty within 30 days of purchase, you can return it for a full refund or exchange.
        After 30 days, your product may be covered under the manufacturer&apos;s warranty or your Care &amp; Repair
        plan. Contact us and we&apos;ll help arrange a repair or replacement.
      </p>
    ),
  },
  {
    title: "Where is my order?",
    content: (
      <p>
        You can track your order using the tracking link in your confirmation email, or by visiting
        our{" "}
        <Link href="/track-your-order" className="text-primary no-underline hover:underline">
          Track my order
        </Link>{" "}
        page. Enter your order number and email address to see the latest delivery status.
      </p>
    ),
  },
  {
    title: "Can you price match?",
    content: (
      <p>
        Yes! Our Price Promise means we&apos;ll match the price if you find the same product cheaper at a major
        UK retailer. Simply show us the lower price at the point of purchase, or contact us within 7 days
        of your purchase. Visit our{" "}
        <Link href="/services/price-promise" className="text-primary no-underline hover:underline">
          Price Promise
        </Link>{" "}
        page for full details.
      </p>
    ),
  },
  {
    title: "How can I return, cancel or exchange an item?",
    content: (
      <p>
        You can return most products within 30 days of purchase. Start your return online through your account,
        or bring the product to any Electriz store with your proof of purchase. For full details, visit our{" "}
        <Link href="/services/returns" className="text-primary no-underline hover:underline">
          Returns &amp; cancellations
        </Link>{" "}
        page.
      </p>
    ),
  },
  {
    title: "Does my item have a warranty?",
    content: (
      <p>
        Most products come with a manufacturer&apos;s warranty, typically lasting 1-2 years. For additional
        protection, consider adding a Care &amp; Repair plan at the time of purchase. This covers accidental
        damage, breakdowns, and faults beyond the manufacturer&apos;s warranty period.
      </p>
    ),
  },
];

const resourceCards = [
  {
    title: "Buying guides",
    description:
      "Not sure what to buy? Our expert buying guides help you find the right product for your needs and budget.",
    href: "#",
    iconLabel: "Guides",
  },
  {
    title: "Product and service manuals",
    description:
      "Find manuals and setup guides for your Electriz products and services. Search by product name or model number.",
    href: "#",
    iconLabel: "Manuals",
  },
  {
    title: "TechTalk blog",
    description:
      "Get the latest tech news, tips and advice from our experts. Discover how to get the most from your gadgets.",
    href: "/techtalk",
    iconLabel: "Blog",
  },
];

const contactMethods = [
  {
    icon: "/images/icons/call-center-svg.svg",
    title: "Call us",
    content: (
      <div className="space-y-3 text-sm text-text-secondary">
        <div>
          <p className="font-bold text-text-primary">To place an order</p>
          <p className="text-lg font-bold text-text-primary">0330 678 1696</p>
        </div>
        <div>
          <p className="font-bold text-text-primary">For anything else</p>
          <p className="text-lg font-bold text-text-primary">0344 561 0000</p>
        </div>
        <div className="text-xs text-text-secondary leading-relaxed">
          <p>Mon - Fri: 8am - 8pm</p>
          <p>Sat: 8am - 6pm</p>
          <p>Sun: 10am - 4pm</p>
        </div>
      </div>
    ),
  },
  {
    icon: "/images/icons/chat-svg.svg",
    title: "ShopLive",
    content: (
      <div className="text-sm text-text-secondary leading-relaxed">
        <p>
          Connect with an Electriz expert via video call. Get personalised product demonstrations,
          comparisons, and advice from the comfort of your home.
        </p>
        <Link
          href="/services/shoplive"
          className="inline-block mt-3 text-primary font-semibold no-underline hover:underline"
        >
          Start a ShopLive session
        </Link>
      </div>
    ),
  },
  {
    icon: "/images/icons/email-svg.svg",
    title: "Write to us",
    content: (
      <div className="text-sm text-text-secondary leading-relaxed">
        <p className="font-bold text-text-primary mb-1">Postal address</p>
        <p>Electriz</p>
        <p>PO Box 1687</p>
        <p>Sheffield</p>
        <p>S2 5YA</p>
      </div>
    ),
  },
];

/* ---------- Component ---------- */

export default function HelpAndSupportPage() {
  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="container-main py-3">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary no-underline text-text-secondary">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-text-primary">Help &amp; Support</span>
        </nav>
      </div>

      {/* Green header banner */}
      <div
        className="relative w-full py-10 md:py-14"
        style={{ backgroundColor: "#007D8A" }}
      >
        <div className="container-main relative z-10 text-center">
          <h1 className="text-3xl md:text-[36px] font-bold text-white mb-3">
            Help &amp; Support
          </h1>
          <p className="text-base md:text-lg text-white mb-1">
            Do you need help with a recent order?
          </p>
          <p className="text-sm text-white/80">
            Select an option below or log in for help with a specific order
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="container-main -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actionCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-lg border border-border shadow-card flex flex-col items-center justify-center text-center p-6 no-underline hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 mb-3 relative">
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={56}
                  height={56}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-text-primary leading-tight">
                {card.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Login prompt */}
      <div className="container-main py-10 text-center">
        <p className="text-sm text-text-secondary mb-4">
          Log in or sign up to track &amp; get help with recent orders
        </p>
        <Link
          href="#"
          className="btn-primary text-sm no-underline"
        >
          Login or sign up
        </Link>
      </div>

      {/* I need help with... section */}
      <div className="bg-surface py-10">
        <div className="container-main">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            I need help with...
          </h2>
          <Accordion items={helpTopics} defaultOpen={0} />
        </div>
      </div>

      {/* Popular FAQs section */}
      <div className="container-main py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Popular FAQs
        </h2>
        <Accordion items={popularFAQs} />
      </div>

      {/* Still have questions? */}
      <div className="bg-surface py-10">
        <div className="container-main">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Still have questions?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-lg border border-border shadow-card p-6 no-underline hover:shadow-md transition-shadow block"
              >
                {/* Icon placeholder area */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-xs font-bold">
                    {card.iconLabel}
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How can I contact Electriz? */}
      <div className="container-main py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          How can I contact Electriz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method) => (
            <div
              key={method.title}
              className="bg-white rounded-lg border border-border shadow-card p-6"
            >
              <div className="w-10 h-10 mb-4 relative">
                <Image
                  src={method.icon}
                  alt={method.title}
                  width={40}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-3">
                {method.title}
              </h3>
              {method.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
