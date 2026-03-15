"use client";

import Link from "next/link";
import Image from "next/image";
import Accordion from "@/components/ui/Accordion";

interface DeliveryRow {
  label: string;
  sublabel?: string;
  price: string;
  highlight?: boolean;
}

interface DeliveryTable {
  title: string;
  rows: DeliveryRow[];
}

function PriceTable({ title, rows }: DeliveryTable) {
  return (
    <div className="bg-surface rounded-lg overflow-hidden mb-4">
      <div className="bg-[#EBEBEB] px-4 py-3">
        <h4 className="text-sm font-bold text-text-primary">{title}</h4>
      </div>
      <div>
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3 text-sm ${
              i < rows.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div>
              <span className="text-text-primary">{row.label}</span>
              {row.sublabel && (
                <span className="text-text-secondary block text-xs mt-0.5">
                  {row.sublabel}
                </span>
              )}
            </div>
            <span
              className={`font-bold whitespace-nowrap ml-4 ${
                row.highlight ? "text-[#008A00]" : "text-text-primary"
              }`}
            >
              {row.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const smallItemsStandard: DeliveryTable = {
  title: "Standard delivery - Get it in 3-5 working days*",
  rows: [
    {
      label: "Orders over \u00A340",
      price: "FREE",
      highlight: true,
    },
    {
      label: "Orders under \u00A340",
      price: "\u00A33.99",
    },
  ],
};

const smallItemsNextDay: DeliveryTable = {
  title: "Next-day delivery - Get it next-day, 7 days a week*",
  rows: [
    {
      label: "All day delivery",
      sublabel: "Order by 9pm",
      price: "\u00A35.99",
    },
    {
      label: "Weekday time slot 12noon-5pm",
      price: "\u00A39.99",
    },
    {
      label: "Weekend all-day",
      price: "\u00A36.99",
    },
    {
      label: "Weekend time slot, morning before noon",
      price: "\u00A310.99",
    },
  ],
};

const faqItems = [
  {
    title: "How can I speak to someone about my Electriz order?",
    content: (
      <div>
        <p>
          You can contact our customer service team by phone on 0344 561 1234,
          via live chat on our website, or through our social media channels. Our
          lines are open 7 days a week.
        </p>
      </div>
    ),
  },
  {
    title:
      "Can I change my delivery date or address after I placed my order?",
    content: (
      <div>
        <p>
          Yes, you may be able to change your delivery date or address depending
          on the status of your order. Log in to your account and visit your
          order details, or contact our customer service team as soon as
          possible.
        </p>
      </div>
    ),
  },
  {
    title: "My order hasn\u2019t arrived yet. Where is it?",
    content: (
      <div>
        <p>
          You can track your order using our{" "}
          <Link href="/track-your-order" className="text-primary underline hover:text-primary-dark">
            online tracker
          </Link>
          . If your order is late or you have concerns, please{" "}
          <Link href="/contact-us" className="text-primary underline hover:text-primary-dark">
            contact our customer service team
          </Link>
          {" "}with your order number and we\u2019ll investigate for you.
        </p>
      </div>
    ),
  },
  {
    title: "What if I miss a delivery?",
    content: (
      <div>
        <p>
          If you miss a delivery, our courier will leave a card with
          instructions on how to rearrange. You can also rearrange delivery
          through our online tracker or by contacting customer services.
        </p>
      </div>
    ),
  },
  {
    title: "Do you deliver on public holidays?",
    content: (
      <div>
        <p>
          Delivery services may be limited on public holidays. We recommend
          checking the available delivery dates at checkout for the most
          up-to-date information on holiday delivery schedules.
        </p>
      </div>
    ),
  },
];

export default function DeliveryPage() {
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
          <span className="text-text-primary">Delivery options</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-announcement w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Delivery options
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Get your order delivered to your door. Free standard delivery on
            orders over £40, or choose next day delivery 7 days a week.
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Action link */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <Link
            href="/track-your-order"
            className="flex items-center gap-3 bg-white rounded-lg border border-border p-4 flex-1 no-underline hover:border-primary transition-colors group"
          >
            <Image
              src="/images/icons/delivery-svg.svg"
              alt="Delivery truck"
              width={40}
              height={40}
              className="flex-shrink-0"
            />
            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
              Expecting a delivery from us?{" "}
              <span className="font-bold">
                Keep up to date with our online tracker
              </span>
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 text-primary ml-auto"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Delivery section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Delivery
          </h2>

          <div className="mb-8">
            <PriceTable
              title={smallItemsStandard.title}
              rows={smallItemsStandard.rows}
            />
            <PriceTable
              title={smallItemsNextDay.title}
              rows={smallItemsNextDay.rows}
            />
          </div>

          <div className="text-xs text-text-secondary space-y-2 mt-4 text-center">
            <p>Your delivery courier will let you know once your order is dispatched.</p>
            <p>Deliveries are between 8am &amp; 8pm.</p>
            <p>*We don&apos;t deliver on bank holidays.</p>
            <p>Sometimes, because of things like bad weather, your delivery may be delayed.</p>
          </div>
        </section>

        {/* FAQs section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </section>

      </div>
    </div>
  );
}
