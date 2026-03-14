"use client";

import Link from "next/link";
import Image from "next/image";
import Accordion from "@/components/ui/Accordion";
import { useSignInModal } from "@/lib/signin-modal-context";

/* ---------- Help Topics (I need help with...) ---------- */

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
          <Link href="/services/delivery" className="text-primary no-underline hover:underline block py-1">
            Delivery &amp; collection
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Home installation
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Recycle my old tech
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Get a copy of my order confirmation
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Redeem and activate my download key
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            See all services
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
            Product and service manuals
          </Link>
        </li>
        <li>
          <Link href="/product-recalls" className="text-primary no-underline hover:underline block py-1">
            Product safety information
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Product security reporting
          </Link>
        </li>
        <li>
          <Link href="/techtalk" className="text-primary no-underline hover:underline block py-1">
            TechTalk blog
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "Where is my order confirmation?",
    content: (
      <div className="space-y-4">
        <h4 className="font-bold text-text-primary">Did you buy your item online?</h4>
        <p>
          If you provided your email when you bought your item, your confirmation will be in your inbox.
          Just search for &quot;Electriz&quot; in your email. Please note, it may be in your junk/spam folder.
          If you can&apos;t find it in your email, please{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">contact us</Link>.
        </p>
        <h4 className="font-bold text-text-primary">Checked out as a guest?</h4>
        <p>
          If you checked out as a guest when you bought your item, you can find your order confirmation
          in your email. Please note, it may be in your junk/spam folder. If you can&apos;t find it in
          your email, please speak to one of our{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">friendly team members</Link>.
        </p>
        <p>
          If you created an Electriz account (or logged into your existing account) when you bought your
          item, you can check your order&apos;s status in the My Account area. Just go to the Your Orders
          section, then Order History. Here you&apos;ll be able to track your order.
        </p>
      </div>
    ),
  },
  {
    title: "Ways you can pay",
    content: (
      <ul className="space-y-1">
        <li>
          <Link href="/services/gift-cards" className="text-primary no-underline hover:underline block py-1">
            Gift cards
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Trade-in
          </Link>
        </li>
        <li>
          <Link href="/services/price-promise" className="text-primary no-underline hover:underline block py-1">
            Price Promise
          </Link>
        </li>
        <li>
          <Link href="#" className="text-primary no-underline hover:underline block py-1">
            Payment options
          </Link>
        </li>
      </ul>
    ),
  },
  {
    title: "What should I do if I\u2019m having problems placing an order online?",
    content: (
      <div className="space-y-4">
        <p>We&apos;re sorry to hear you&apos;re having issues placing your online order.</p>
        <h4 className="font-bold text-text-primary">Issues with adding an item to your basket</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>We do our very best to keep our website up to date as much as possible, but sometimes high-demand items sell out before we can update our system.</li>
          <li>If an item isn&apos;t showing in your basket when you try to add it, it may have sold out.</li>
          <li>If you see an error message, saying your order can&apos;t be processed due to high demand, the item may have sold out.</li>
        </ul>
        <h4 className="font-bold text-text-primary">Issues with paying using your debit/credit card</h4>
        <p>
          If you&apos;re experiencing issues paying with your debit or credit card at the checkout, this may
          be due to an issue with our provider during busy periods. Please give it a few minutes and try
          again. If after a few attempts, you still have issues, please contact your bank or card provider.
        </p>
        <h4 className="font-bold text-text-primary">Issues with paying using a gift card</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>All gift cards can be used online and on the Electriz app.</li>
          <li>You can use up to 10 gift cards to pay for a single order.</li>
          <li>It&apos;s quick and easy to check your gift card balance.</li>
          <li>
            Here&apos;s our{" "}
            <Link href="/services/gift-cards" className="text-primary no-underline hover:underline">
              gift card Terms &amp; Conditions and gift card FAQs
            </Link>.
          </li>
        </ul>
      </div>
    ),
  },
];

/* ---------- Popular FAQs ---------- */

const popularFAQs = [
  {
    title: "What happens if my item is faulty?",
    content: (
      <div className="space-y-3">
        <p>We&apos;re sorry to hear you&apos;re having trouble with an item.</p>
        <p>
          We&apos;re happy to offer you an exchange, a refund or something else. Just answer a few{" "}
          <Link href="/services/returns" className="text-primary no-underline hover:underline">
            quick questions
          </Link>{" "}
          to get started.
        </p>
      </div>
    ),
  },
  {
    title: "Where is my order?",
    content: (
      <p>
        You can track your delivery using our{" "}
        <Link href="/track-your-order" className="text-primary no-underline hover:underline">
          online trackers
        </Link>.
      </p>
    ),
  },
  {
    title: "Can you price match?",
    content: (
      <p>
        We can price match before or after you buy &mdash; we&apos;ll even price match 7 days after your
        purchase! Learn more about our{" "}
        <Link href="/services/price-promise" className="text-primary no-underline hover:underline">
          Price Promise
        </Link>.
      </p>
    ),
  },
  {
    title: "How can I return, cancel or exchange an item?",
    content: (
      <div className="space-y-4">
        <h4 className="font-bold text-text-primary">Want to return an item? No problem!</h4>
        <p>
          We&apos;re happy to offer you an exchange, a refund or something else. Just answer a few{" "}
          <Link href="/services/returns" className="text-primary no-underline hover:underline">
            quick questions
          </Link>{" "}
          to get started.
        </p>
        <h4 className="font-bold text-text-primary">Changed your mind about an order?</h4>
        <p>
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            Contact us
          </Link>{" "}
          to discuss cancelling your order and we&apos;ll get back to you as soon as possible.
        </p>
      </div>
    ),
  },
  {
    title: "How can I get help buying an item or service?",
    content: (
      <div className="space-y-3">
        <p>We&apos;re always happy to help with whatever you need.</p>
        <p>
          If you need help buying an item, you can discuss what you want with one of our{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            friendly team
          </Link>.
        </p>
        <p>There&apos;s also lots of help on hand if you want to extend a warranty or buy one of our additional services.</p>
      </div>
    ),
  },
  {
    title: "Does my item have a warranty?",
    content: (
      <div className="space-y-4">
        <p>
          All our items come with a standard 12-month warranty, effective from the day of purchase.
          Some manufacturers offer warranties longer than 12 months &mdash; please check your item
          for specific warranty details.
        </p>
        <p>Please check your receipt to find out when you bought your item.</p>
        <h4 className="font-bold text-text-primary">For mobile phones</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>If you bought your mobile online, you can request a copy of your receipt.</li>
          <li>
            If you can&apos;t remember if you bought your mobile online, call us on{" "}
            <span className="font-bold">0344 561 0000</span>. We&apos;ll be happy to help.
          </li>
        </ul>
        <h4 className="font-bold text-text-primary">For all other items</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Log into your account to find out when you bought your item.</li>
          <li>If you bought your item online, you can request a copy of your receipt. If you don&apos;t have an account with us, you can sign up now.</li>
          <li>
            If you don&apos;t have a receipt and can&apos;t remember if you bought your item online,{" "}
            <Link href="/contact-us" className="text-primary no-underline hover:underline">contact us</Link>.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Want to buy Instant Replacement?",
    content: (
      <div className="space-y-3">
        <ul className="list-disc pl-5 space-y-2">
          <li>With Instant Replacement you get 3 years of unlimited replacements if your tech breaks down.</li>
          <li>We offer Instant Replacement for most of our products between £20&ndash;£150.</li>
          <li>You must be over 16 years old to take out an Instant Replacement plan.</li>
        </ul>
        <p>
          Find out more about our fantastic{" "}
          <Link href="/services/instant-replacement" className="text-primary no-underline hover:underline">
            Instant Replacement
          </Link>{" "}
          service.
        </p>
      </div>
    ),
  },
  {
    title: "Want to arrange installation?",
    content: (
      <p>
        If you&apos;re buying an item online, and you want it to be installed, just add our Installation
        service to your basket. Here&apos;s our{" "}
        <Link href="#" className="text-primary no-underline hover:underline">
          Installation prices
        </Link>.
      </p>
    ),
  },
  {
    title: "Can you tell me if a product is in stock?",
    content: (
      <div className="space-y-3">
        <p>
          The best place to check if a product is in stock is on the product page where you can check
          availability for home delivery.
        </p>
        <p>
          If the product you&apos;re interested in is out of stock, one of our{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            friendly team members
          </Link>{" "}
          can help to advise you on an alternate product.
        </p>
      </div>
    ),
  },
  {
    title: "Can you send me a copy of my receipt?",
    content: (
      <div className="space-y-3">
        <p>
          If you bought your item online, or if you provided your email address when you bought your item,
          your receipt will be in your inbox. Just search for &quot;Electriz&quot; in your email. Please note,
          it may be in your junk/spam folder.
        </p>
        <p>
          If you can&apos;t find your receipt in your email, and you bought your item online, you can request
          a copy of your receipt through your account.
        </p>
        <p>
          If you can&apos;t find your receipt, please speak to one of our{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            friendly team
          </Link>{" "}
          who can support.
        </p>
      </div>
    ),
  },
  {
    title: "Do you do Recycling?",
    content: (
      <div className="space-y-3">
        <p><strong>Yes, we do!</strong></p>
        <p>
          Do you want us to recycle a large appliance, such as a washing machine, dishwasher or a
          large-screen TV? No problem! You can add our recycling service to your basket when you buy
          your new appliance.
        </p>
        <p>
          Please note, we recycle items on a like-for-like basis. The item we remove should be roughly
          the same size as the new one we deliver. Sometimes, we can remove a larger appliance, if we
          have room in our delivery van. You should disconnect your old appliance before we arrive.
          You don&apos;t need to do this if you&apos;ve ordered installation for your new appliance.
        </p>
        <p>
          For fridge freezer recycling, please defrost your old appliance before we arrive. If you don&apos;t
          get a chance to do this, don&apos;t worry too much. We&apos;ll secure its doors, so it doesn&apos;t
          leak water in our van.
        </p>
        <p>
          <strong>Already placed an order for a large appliance, and want to add recycling? No problem!
          Call us on 0344 561 1234.</strong>
        </p>
        <p>
          Got any small, old tech lying around? If we have room in our van, we can recycle this free of
          charge, along with your old, large appliance.
        </p>
        <p>
          Here&apos;s our{" "}
          <Link href="#" className="text-primary no-underline hover:underline">
            Recycling info and FAQs
          </Link>.
        </p>
      </div>
    ),
  },
  {
    title: "What should I do if I\u2019ve bought the wrong item?",
    content: (
      <div className="space-y-3">
        <p>If you&apos;ve accidentally bought the wrong item, don&apos;t worry! We&apos;ll get it sorted.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Do you want a refund? Go to our{" "}
            <Link href="/services/returns" className="text-primary no-underline hover:underline">Returns page</Link>{" "}
            to find out what to do.
          </li>
          <li>
            Do you want to exchange your item? You can discuss this with one of our{" "}
            <Link href="/contact-us" className="text-primary no-underline hover:underline">friendly team members</Link>.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "What should I do if I\u2019ve received the wrong item?",
    content: (
      <div className="space-y-3">
        <p>We&apos;re sorry to hear you&apos;ve received the wrong item, but don&apos;t worry, we&apos;ll get it sorted!</p>
        <p>
          If you ordered your item online, use our{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            contact page
          </Link>{" "}
          to arrange an exchange or refund.
        </p>
      </div>
    ),
  },
  {
    title: "Can I add to an existing order?",
    content: (
      <div className="space-y-3">
        <p>You can add a service to an existing order, but you can&apos;t add additional products.</p>
        <p>
          You can add TV installation to models over 43&quot;, and you can arrange for us to install a large
          domestic appliance or recycle your old item. Just call us on{" "}
          <span className="font-bold">0344 561 1234</span> to discuss.
        </p>
        <p>
          Our team can also offer{" "}
          <Link href="/contact-us" className="text-primary no-underline hover:underline">
            help with placing a new order
          </Link>.
        </p>
      </div>
    ),
  },
  {
    title: "Why has my order been cancelled?",
    content: (
      <div className="space-y-3">
        <p>
          Sometimes we cancel an order if it contains an item that has been misrepresented on our website.
          We do everything we can to ensure all information, product descriptions, and prices are accurate
          when an item goes live on our site. However, sometimes mistakes happen, and we must rectify the
          wrongly published information before we can continue selling the item.
        </p>
        <p>
          Sometimes certain items are in high demand, and you&apos;re restricted to buying a limited number.
          If your order exceeds this restriction, we&apos;ll cancel it (even if you&apos;ve received an order
          confirmation), and you won&apos;t be able to order the same item again for 90 days. You will receive
          a full refund for any amount you paid.
        </p>
      </div>
    ),
  },
  {
    title: "How can I contact Electriz?",
    content: (
      <div className="space-y-3">
        <p>You can reach our friendly team in several ways:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Call us</strong> &mdash; to place an order, call{" "}
            <span className="font-bold">0330 678 1696</span>. For anything else,
            call <span className="font-bold">0344 561 0000</span>.
          </li>
          <li>
            <strong>Write to us</strong> &mdash; Electriz, PO Box 1687, Sheffield S2 5YA.
          </li>
          <li>
            <strong>Online</strong> &mdash; visit our{" "}
            <Link href="/contact-us" className="text-primary no-underline hover:underline">
              Contact page
            </Link>.
          </li>
        </ul>
      </div>
    ),
  },
];

/* ---------- 24/7 Tech Support ---------- */

const techSupportTopics = [
  {
    title: "24/7 Tech Support",
    content: (
      <div className="space-y-3">
        <p>
          <Link href="#" className="text-primary no-underline hover:underline">
            Complete this form
          </Link>{" "}
          to change your personal or payment details, cancel your subscription, or ask about an existing query.
        </p>
        <p>
          <Link href="#" className="text-primary no-underline hover:underline">
            Find out more about our 24/7 Tech Support service.
          </Link>
        </p>
      </div>
    ),
  },
  {
    title: "Electriz Cloud Backup",
    content: (
      <div className="space-y-3">
        <p>
          <Link href="#" className="text-primary no-underline hover:underline">
            Complete this form
          </Link>{" "}
          with your query and we&apos;ll respond as soon as possible.
        </p>
        <p>
          <Link href="#" className="text-primary no-underline hover:underline">
            Find out more about Electriz Cloud Backup.
          </Link>
        </p>
      </div>
    ),
  },
];

/* ---------- Component ---------- */

export default function HelpAndSupportPage() {
  const { openSignInModal } = useSignInModal();

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

      {/* Header banner — title only, contained width */}
      <div className="container-main">
        <div
          className="w-full rounded-lg py-8 md:py-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/banners/help-support-hero.webp')" }}
        >
          <h1 className="text-3xl md:text-[36px] font-bold text-primary text-center">
            Help &amp; Support
          </h1>
        </div>
      </div>

      {/* Subheading — outside the banner */}
      <div className="container-main text-center pt-8 pb-20">
        <p className="text-base md:text-lg font-bold text-text-primary mb-1">
          Do you need help with a recent order?
        </p>
        <p className="text-sm text-text-secondary">
          Select an option below or log in for help with a specific order
        </p>
      </div>

      {/* Action cards — icons straddle the top border */}
      <div className="container-main relative">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Link
            href="/services/returns"
            className="bg-white rounded-lg border border-border shadow-card flex flex-col items-center text-center pt-10 pb-5 px-4 no-underline hover:shadow-md transition-shadow relative"
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14">
              <Image src="/images/icons/returns-purple-circle-svg.svg" alt="Return or cancel my order" width={56} height={56} className="object-contain" unoptimized />
            </div>
            <span className="text-sm font-bold text-text-primary leading-tight">Return or cancel my order</span>
          </Link>
          <Link
            href="/track-your-order"
            className="bg-white rounded-lg border border-border shadow-card flex flex-col items-center text-center pt-10 pb-5 px-4 no-underline hover:shadow-md transition-shadow relative"
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14">
              <Image src="/images/icons/delivery-purple-circle-svg.svg" alt="Track my order" width={56} height={56} className="object-contain" unoptimized />
            </div>
            <span className="text-sm font-bold text-text-primary leading-tight">Track my order</span>
          </Link>
        </div>
      </div>

      {/* Login prompt */}
      <div className="container-main py-10 text-center border-b border-border">
        <p className="text-sm text-text-secondary mb-4">
          Log in or sign up to track &amp; get help with recent orders
        </p>
        <button onClick={openSignInModal} className="btn-primary text-sm">
          Login or sign up
        </button>
      </div>

      {/* I need help with... section */}
      <div className="border-b border-border py-10">
        <div className="container-main">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            I need help with&hellip;
          </h2>
          <Accordion items={helpTopics} defaultOpen={0} />
        </div>
      </div>

      {/* Popular FAQs section */}
      <div className="container-main py-10 border-b border-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Popular FAQs
        </h2>
        <Accordion items={popularFAQs} />
      </div>

      {/* Complaints and questions */}
      <div className="border-b border-border py-10">
        <div className="container-main">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Complaints and questions
          </h2>
          <Link
            href="/contact-us"
            className="bg-white rounded-lg border border-border shadow-card p-5 flex items-center justify-between no-underline hover:shadow-md transition-shadow group"
          >
            <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
              How can I make a complaint?
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary flex-shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 24/7 Tech Support */}
      <div className="container-main py-10 border-b border-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          I have a question about 24/7 Tech Support or Electriz Cloud Backup
        </h2>
        <Accordion items={techSupportTopics} />
      </div>

      {/* How can I contact Electriz? */}
      <div id="contact" className="container-main py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          How can I contact Electriz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {/* Call us */}
          <div className="bg-white rounded-lg border border-border shadow-card p-6">
            <div className="w-10 h-10 mb-4 relative">
              <Image src="/images/icons/call-center-svg.svg" alt="Call us" width={40} height={40} className="object-contain" unoptimized />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-3">Call us</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div>
                <p className="font-bold text-text-primary">To place an order</p>
                <p className="text-lg font-bold text-text-primary">
                  <Link href="tel:03306781696" className="no-underline text-text-primary hover:text-primary">0330 678 1696</Link>
                </p>
                <div className="text-xs text-text-secondary leading-relaxed mt-1">
                  <p>Monday - Friday: 8am to 8pm</p>
                  <p>Saturday - Sunday: 9am to 5:30pm</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-text-primary">For anything else</p>
                <p className="text-lg font-bold text-text-primary">
                  <Link href="tel:03445610000" className="no-underline text-text-primary hover:text-primary">0344 561 0000</Link>
                </p>
                <div className="text-xs text-text-secondary leading-relaxed mt-1">
                  <p>Mon - Fri: 8am to 8pm</p>
                  <p>Sat: 8am to 6pm</p>
                  <p>Sun: 9am to 6pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Write to us */}
          <div className="bg-white rounded-lg border border-border shadow-card p-6">
            <div className="w-10 h-10 mb-4 relative">
              <Image src="/images/icons/email-svg.svg" alt="Write to us" width={40} height={40} className="object-contain" unoptimized />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-3">Write to us</h3>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p>Got a way with words? Write to us at:</p>
              <p className="mt-2">Electriz</p>
              <p>PO Box 1687</p>
              <p>Sheffield S2 5YA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
