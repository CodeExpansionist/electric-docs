"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

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
      </div>
    ),
  },
];

const returnsFaqItems = [
  {
    title: "I\u2019ve changed my mind! Can I return my item for a refund?",
    content: (
      <div className="space-y-3">
        <p>If you purchased it online, you can return your item within 30 days even if you&apos;ve opened it. For a full refund, your item must be:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Unused</li>
          <li>In its original packaging</li>
          <li>Complete with all its accessories</li>
          <li>Without personal data</li>
          <li>Not registered with its manufacturer</li>
        </ul>
        <p>If you&apos;ve used your item, you can return it only if it&apos;s faulty or not as described. In all cases, we reserve the right to confirm and agree a fault.</p>
      </div>
    ),
  },
  {
    title: "What should I do if my item arrives damaged?",
    content: (
      <p>Please let us know as soon as possible if your item arrives damaged. You can return a damaged item within 30 days after delivery. You can use our Webchat if you want to discuss returning a damaged item.</p>
    ),
  },
  {
    title: "How quickly do I need to return the item to you?",
    content: (
      <p>If you&apos;ve changed your mind, you need to return your item to us within 30 days of purchase or delivery (whichever is later).</p>
    ),
  },
  {
    title: "How long does it take to get a refund?",
    content: (
      <p>Refunds can take up to 14 days from when we receive your item.</p>
    ),
  },
  {
    title: "How can I cancel an order I haven\u2019t received yet?",
    content: (
      <p>You can cancel your online order using our cancellation request form. If your order is out for delivery, you can contact us via Webchat.</p>
    ),
  },
  {
    title: "Can I return a product without proof of purchase?",
    content: (
      <p>Returns and exchanges can only be processed with proof of purchase.</p>
    ),
  },
  {
    title: "What should I do with the box?",
    content: (
      <p>It&apos;s always a good idea to keep the original packaging if you can, just in case your item develops a fault and needs to be returned or sent for repair.</p>
    ),
  },
  {
    title: "Do you refund delivery charges?",
    content: (
      <p>Yes, sometimes we refund delivery charges.</p>
    ),
  },
  {
    title: "My refund hasn\u2019t arrived yet. Where is it?",
    content: (
      <p>If you&apos;ve returned your item, you should receive your refund within 14 days.</p>
    ),
  },
  {
    title: "I can\u2019t drop off my item. What should I do?",
    content: (
      <p>If you feel a home collection is best for you, this isn&apos;t a problem. Simply complete our online home collection form.</p>
    ),
  },
];

export default function ReturnsPage() {
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

        {/* Returns FAQs */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4 pl-5">
            Returns FAQs
          </h2>
          <Accordion items={returnsFaqItems} />
        </div>
      </div>
    </div>
  );
}
