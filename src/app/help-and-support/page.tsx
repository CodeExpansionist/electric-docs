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
        <li className="block py-1">Track my delivery</li>
        <li className="block py-1">Return, refund or cancel my order</li>
        <li className="block py-1">Delivery options</li>
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
          If you can&apos;t find it in your email, please contact us.
        </p>
        <h4 className="font-bold text-text-primary">Checked out as a guest?</h4>
        <p>
          If you checked out as a guest when you bought your item, you can find your order confirmation
          in your email. Please note, it may be in your junk/spam folder. If you can&apos;t find it in
          your email, please speak to one of our friendly team members.
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
      <div className="space-y-4">
        <h4 className="font-bold text-text-primary">Credit &amp; debit cards</h4>
        <p>Found your perfect tech? Sorted your delivery or pick up? Now all you need to do is pay. It&apos;s that easy!</p>

        <p className="font-semibold text-text-primary">We accept:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>American Express*</li>
          <li>Maestro*</li>
          <li>MasterCard</li>
          <li>Visa Credit</li>
          <li>Visa Debit</li>
        </ul>

        <p>We also offer a range of flexible credit and leasing options so you can spread the cost for any major purchases.</p>

        <h4 className="font-bold text-text-primary">When we take payment for your order</h4>
        <p>As soon as your order is placed we request authorisation for payment from your bank. This includes orders that are to be delivered on a specific date.</p>

        <h4 className="font-bold text-text-primary">Reducing the risk of authorisation being refused by your card issuer</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your personal details are correct and match those registered to your bank account.</li>
          <li>If you&apos;re pre-ordering an item, make sure your card won&apos;t expire before the expected release date.</li>
          <li>Make sure your card is registered to the correct billing address.</li>
          <li>Sign up to a card authentication scheme such as Visa Secure or Mastercard SecureCode.</li>
          <li>Let your bank know beforehand if you&apos;re placing a high-value order.</li>
          <li>If your bank asks you to confirm the purchase, let us know and we&apos;ll retry the order.</li>
        </ul>
      </div>
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
      </div>
    ),
  },
  {
    title: "Is shopping online with Electriz safe?",
    content: (
      <div className="space-y-4">
        <p>
          Every order you make on our website is safe. We use strict security precautions to make our website safe. This includes using a Secure Socket Layer (SSL) server. If you&apos;re using the secure server, any information you enter is encrypted. This makes it virtually impossible for anyone else to access your information.
        </p>
        <p>
          To make sure you&apos;re shopping on a secure page, look for a locked padlock icon or an image of a key in the bar. You&apos;ll find this at the bottom of your screen. You should also see &apos;https:&apos; at the start of the web address on any page where you enter personal information.
        </p>
        <p>
          Our website is verified by Norton Secure, which is powered by Verisign. This protects your personal data. Your payment methods are also covered through MasterCard SecureCode or Visa Secure.
        </p>
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
          We&apos;re happy to offer you an exchange, a refund or something else. Just answer a few quick questions to get started.
        </p>
      </div>
    ),
  },
  {
    title: "Where is my order?",
    content: (
      <p>
        You can track your delivery using our online trackers.
      </p>
    ),
  },
  {
    title: "How can I return, cancel or exchange an item?",
    content: (
      <div className="space-y-4">
        <h4 className="font-bold text-text-primary">Want to return an item? No problem!</h4>
        <p>
          We&apos;re happy to offer you an exchange, a refund or something else. Just answer a few quick questions to get started.
        </p>
        <h4 className="font-bold text-text-primary">Changed your mind about an order?</h4>
        <p>
          Contact us to discuss cancelling your order and we&apos;ll get back to you as soon as possible.
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
          If you need help buying an item, you can discuss what you want with one of our friendly team.
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
        <ul className="list-disc pl-5 space-y-2">
          <li>Log into your account to find out when you bought your item.</li>
          <li>If you bought your item online, you can request a copy of your receipt. If you don&apos;t have an account with us, you can sign up now.</li>
          <li>
            If you don&apos;t have a receipt and can&apos;t remember if you bought your item online, contact us.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Want to arrange installation?",
    content: (
      <p>
        If you&apos;re buying an item online, and you want it to be installed, just add our Installation
        service to your basket. Here&apos;s our Installation prices.
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
          If the product you&apos;re interested in is out of stock, one of our friendly team members can help to advise you on an alternate product.
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
          If you can&apos;t find your receipt, please speak to one of our friendly team who can support.
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
          Do you want us to recycle your old TV or audio equipment? No problem! You can add our
          recycling service to your basket when you buy your new product.
        </p>
        <p>
          Please note, we recycle items on a like-for-like basis. The item we remove should be roughly
          the same size as the new one we deliver. Sometimes, we can remove a larger item, if we
          have room in our delivery van. You should disconnect your old equipment before we arrive.
          You don&apos;t need to do this if you&apos;ve ordered installation for your new TV.
        </p>
        <p>
          <strong>Already placed an order and want to add recycling? No problem!
          Call us on 0344 561 1234.</strong>
        </p>
        <p>
          Got any small, old tech lying around? If we have room in our van, we can recycle this free of
          charge, along with your old TV or audio equipment.
        </p>
        <p>
          Here&apos;s our Recycling info and FAQs.
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
            Do you want a refund? Go to our Returns page to find out what to do.
          </li>
          <li>
            Do you want to exchange your item? You can discuss this with one of our friendly team members.
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
          If you ordered your item online, use our contact page to arrange an exchange or refund.
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
          You can add TV installation to models over 43&quot;, or arrange for us to recycle your old
          item. Just call us on{" "}
          <span className="font-bold">0344 561 1234</span> to discuss.
        </p>
        <p>
          Our team can also offer help with placing a new order.
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
            <strong>Online</strong> &mdash; visit our Contact page.
          </li>
        </ul>
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
      <div className="container-main py-10 text-center">
        <p className="text-sm text-text-secondary mb-4">
          Log in or sign up to track &amp; get help with recent orders
        </p>
        <button onClick={openSignInModal} className="btn-primary text-sm">
          Login or sign up
        </button>
      </div>

      {/* I need help with... section */}
      <div className="py-10">
        <div className="container-main">
          <h2 className="text-xl font-bold text-text-primary mb-6 pl-5">
            I need help with&hellip;
          </h2>
          <Accordion items={helpTopics} />
        </div>
      </div>

      {/* Popular FAQs section */}
      <div className="container-main py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6 pl-5">
          Popular FAQs
        </h2>
        <Accordion items={popularFAQs} />
      </div>

      {/* How can I contact Electriz? */}
      <div id="contact" className="container-main py-10">
        <h2 className="text-xl font-bold text-text-primary mb-6 pl-5">
          How can I contact Electriz?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Call us */}
          <div className="bg-white rounded-lg border border-border shadow-card pt-10 pb-6 px-6 text-center relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
              <Image src="/images/icons/call-center-svg.svg" alt="Call us" width={28} height={28} className="object-contain" unoptimized />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-3">Call us</h3>
            <div className="text-sm text-text-secondary space-y-1">
              <p className="font-bold text-text-primary">For anything else</p>
              <p className="text-lg font-bold text-text-primary">
                <Link href="tel:03445610000" className="no-underline text-text-primary hover:text-primary underline">0344 561 0000</Link>
              </p>
              <p>Mon - Fri: 8am to 8pm</p>
              <p>Sat: 8am to 6pm</p>
              <p>Sun: 9am to 6pm</p>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg border border-border shadow-card pt-10 pb-6 px-6 text-center relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
              <Image src="/images/icons/chat-svg.svg" alt="Support" width={28} height={28} className="object-contain" unoptimized />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-3">Support</h3>
            <p className="text-sm text-text-secondary">
              Need help? Message our customer support team via web live chat. Our friendly advisors are ready to assist you with any questions about your order, delivery, or products.
            </p>
          </div>

          {/* Write to us */}
          <div className="bg-white rounded-lg border border-border shadow-card pt-10 pb-6 px-6 text-center relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-border bg-white flex items-center justify-center">
              <Image src="/images/icons/email-svg.svg" alt="Write to us" width={28} height={28} className="object-contain" unoptimized />
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
