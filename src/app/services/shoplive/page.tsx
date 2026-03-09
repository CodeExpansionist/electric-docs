"use client";

import Link from "next/link";
import Accordion from "@/components/ui/Accordion";

const steps = [
  {
    number: 1,
    title: "Get connected",
    description:
      "Keep an eye out for our tech expert. Start a one-way video call for advice before you buy.",
  },
  {
    number: 2,
    title: "Get advice",
    description:
      "Give us permission to access your microphone so we can hear you. An expert will appear on screen, ready to answer your questions.",
  },
  {
    number: 3,
    title: "Get your tech",
    description:
      "Our expert will give you all the info you need to complete your purchase. They'll also help you check out once you're happy with everything.",
  },
];

const faqItems = [
  {
    title: "Am I seen on the call?",
    content: (
      <div>
        <p>
          When you join a call, you first choose your camera and audio options.
          You can turn on or turn off your camera at any time. Don&apos;t have
          video or audio? No problem! You can just message an expert.
        </p>
      </div>
    ),
  },
  {
    title: "What should I do if I have a customer service query?",
    content: (
      <div>
        <p>
          Please contact our{" "}
          <Link
            href="/contact-us"
            className="text-primary no-underline hover:underline"
          >
            customer service team
          </Link>
          .
        </p>
      </div>
    ),
  },
  {
    title: "What can I use ShopLive for?",
    content: (
      <div>
        <p>
          ShopLive gives you buying advice on a huge range of products.
          Struggling to choose a product? Not sure about a product&apos;s
          features? Our ShopLive experts have got you!
        </p>
      </div>
    ),
  },
  {
    title: "Do I have to share my details?",
    content: (
      <div>
        <p>
          You share only limited details. If you want to buy the tech
          you&apos;re inquiring about, we&apos;ll send you a secure payment link
          to use.
        </p>
      </div>
    ),
  },
];

export default function ShopLivePage() {
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
          <span className="text-text-primary">ShopLive</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-[#007D8A] w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ShopLive
          </h1>
          <p className="text-white text-sm md:text-base leading-relaxed max-w-2xl">
            Expert advice at the tap of a button
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Intro */}
        <section className="mb-10">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Whatever you&apos;re looking for, you can be sure our experts know
            our huge range of tech inside out. With ShopLive, you can video-call
            with them while you shop online. It&apos;s like going shopping with
            that friend of yours who really knows their tech. And you can do it
            all from the comfort of your sofa.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-lg border border-border p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#007D8A] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </section>

        {/* T&Cs note */}
        <section className="mb-10">
          <div className="bg-surface rounded-lg p-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              By using our ShopLive service, you agree to our terms and
              conditions. Any inappropriate or abusive behaviour won&apos;t be
              tolerated and may be reported.
            </p>
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
