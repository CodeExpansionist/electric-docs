"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

export default function ReturnsPage() {
  const policyItems = [
    {
      title: "Faulty items",
      content: (
        <div>
          <p>
            If your item is faulty, we&apos;re happy to offer you an exchange or
            a refund. You can do this within 30 days from when you bought it or
            had it delivered. If more than 30 days have passed, we might be able
            to repair it as long as it&apos;s still within its guarantee period
            (usually 12 months). We can&apos;t exchange, refund, or repair items
            that are faulty due to accidental damage, neglect, misuse, or normal
            wear and tear.
          </p>
        </div>
      ),
    },
    {
      title: "Changed your mind?",
      content: (
        <div className="space-y-4">
          <p>
            If you bought your item online, you can return it within 30 days -
            even if you&apos;ve opened it for inspection. To get a full refund,
            the item must be returned like new and in a resaleable condition.
            This means you must not use it. You must also keep it in its original
            box and return it with all its accessories.
          </p>
          <p>
            If you bought your item in store, you can return it within 30 days.
            It must be in its unopened and sealed packaging. You also need your
            proof of purchase.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="container-main py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
        <Link
          href="/"
          className="hover:text-primary no-underline text-text-secondary"
        >
          Home
        </Link>
        <span>&gt;</span>
        <Link
          href="#"
          className="hover:text-primary no-underline text-text-secondary"
        >
          Services
        </Link>
        <span>&gt;</span>
        <Link
          href="#"
          className="hover:text-primary no-underline text-text-secondary"
        >
          Shopping with us
        </Link>
        <span>&gt;</span>
        <span className="text-text-primary">Returns &amp; Refunds</span>
      </nav>

      <div className="space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Returns, refunds &amp; exchanges
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Want to return an item? No problem! We&apos;re happy to offer you an
            exchange, a refund, or something else - just let us know why
            you&apos;re returning your item and which solution you&apos;d prefer,
            and we&apos;ll go from there.
          </p>
        </div>

        {/* How can we help? */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">
            How can we help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="#"
              className="bg-white rounded-lg border-2 border-primary p-6 text-center text-primary font-bold hover:bg-primary hover:text-white transition-colors no-underline"
            >
              I want a refund
            </Link>
            <Link
              href="#"
              className="bg-white rounded-lg border-2 border-primary p-6 text-center text-primary font-bold hover:bg-primary hover:text-white transition-colors no-underline"
            >
              I want an exchange
            </Link>
            <Link
              href="#"
              className="bg-white rounded-lg border-2 border-primary p-6 text-center text-primary font-bold hover:bg-primary hover:text-white transition-colors no-underline"
            >
              I want the status of my return
            </Link>
          </div>
        </div>

        {/* Our Policy */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-6 h-6 text-text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <h2 className="text-lg font-bold text-text-primary">Our policy</h2>
          </div>
          <Accordion items={policyItems} />
        </div>

        {/* Need help with a tech problem? */}
        <div className="border-2 border-primary rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-text-primary mb-2">
            Need help with a tech problem?
          </h2>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Our RepairLive experts will help diagnose and fix your problem over a
            call or arrange a repair or return if needed
          </p>
          <Link href="#" className="btn-primary no-underline">
            Call a RepairLive expert
          </Link>
        </div>

        {/* FAQ Link */}
        <div>
          <p className="text-sm text-text-secondary">
            Need help or got a question? Go to our{" "}
            <Link
              href="#"
              className="text-primary underline hover:text-primary-dark"
            >
              Returns FAQs
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
