"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const pageContent: Record<string, { title: string; sections: { heading: string; text: string }[] }> = {
  "help-and-support/contact-us": {
    title: "Contact us",
    sections: [
      {
        heading: "Get in touch",
        text: "Our customer service team is available 7 days a week. You can reach us by phone, email, or live chat. We aim to respond to all enquiries within 24 hours.",
      },
      {
        heading: "Phone support",
        text: "Call us on 0344 561 1234. Our lines are open Monday to Friday 8am-8pm, Saturday 8am-6pm, and Sunday 10am-4pm.",
      },
      {
        heading: "Live chat",
        text: "Chat with one of our agents online for quick answers to your questions. Available Monday to Saturday 8am-8pm and Sunday 10am-4pm.",
      },
      {
        heading: "Email",
        text: "Send us an email and we'll get back to you within 24 hours. Please include your order number if your query relates to an existing order.",
      },
    ],
  },
  techtalk: {
    title: "TechTalk",
    sections: [
      {
        heading: "Expert tech advice",
        text: "TechTalk is our dedicated tech support service. Whether you need help setting up a new device, troubleshooting an issue, or choosing the right product, our experts are here to help.",
      },
      {
        heading: "How it works",
        text: "Book an appointment online or in-store. Our tech experts can assist you remotely or in person, providing personalised advice and support tailored to your needs.",
      },
    ],
  },
  "services/price-promise": {
    title: "Price Promise",
    sections: [
      {
        heading: "Our Price Promise",
        text: "If you find the same product cheaper at a competitor, we'll match the price. Our Price Promise covers products sold by major UK retailers, both online and in-store.",
      },
      {
        heading: "How to claim",
        text: "Simply show us the lower price at the point of purchase, or contact us within 7 days of your purchase. We'll need to verify the competitor's price before processing your claim.",
      },
      {
        heading: "Terms & conditions",
        text: "The product must be identical (same make, model, and colour). The competitor must be a UK-based retailer with stock available for immediate purchase. Marketplace sellers and auction sites are excluded.",
      },
    ],
  },
  "product-reviews": {
    title: "Product reviews",
    sections: [
      {
        heading: "Trusted reviews",
        text: "Read honest reviews from verified customers to help you make informed purchasing decisions. Our reviews are collected independently to ensure authenticity.",
      },
      {
        heading: "Leave a review",
        text: "Purchased a product from us? Share your experience by leaving a review. Your feedback helps other customers and helps us improve our service.",
      },
    ],
  },
  "track-your-order": {
    title: "Track my order",
    sections: [
      {
        heading: "Track your delivery",
        text: "Enter your order number and email address to track the status of your delivery. You'll receive email updates at each stage of the delivery process.",
      },
      {
        heading: "Delivery statuses",
        text: "Your order will progress through the following stages: Order confirmed, Preparing for dispatch, Dispatched, Out for delivery, Delivered.",
      },
    ],
  },
  "services/delivery": {
    title: "Delivery options",
    sections: [
      {
        heading: "Standard delivery",
        text: "Free standard delivery on orders over £40. Orders are typically delivered within 3-5 working days. You'll receive a delivery window by email or SMS.",
      },
      {
        heading: "Next day delivery",
        text: "Need it tomorrow? Select next day delivery at checkout. Order by 8pm for delivery the next working day. Available on most products for £3.99.",
      },
      {
        heading: "Large item delivery",
        text: "For large items like TVs, washing machines, and fridges, we offer a premium delivery service with installation available. We'll deliver to the room of your choice.",
      },
    ],
  },
  "services/returns": {
    title: "Returns & cancellations",
    sections: [
      {
        heading: "Returns policy",
        text: "Changed your mind? You can return most products within 30 days of purchase for a full refund. The product must be in its original condition and packaging.",
      },
      {
        heading: "How to return",
        text: "Start your return online through your account, or bring the product to any Currys store with your proof of purchase. We'll process your refund within 14 days.",
      },
      {
        heading: "Faulty products",
        text: "If your product develops a fault, contact us as soon as possible. Within 30 days, we'll offer a replacement or refund. After 30 days, we may arrange a repair.",
      },
    ],
  },
  "services/shoplive": {
    title: "ShopLive",
    sections: [
      {
        heading: "Shop from home with an expert",
        text: "ShopLive connects you with a Currys expert via video call. Get personalised product demonstrations, comparisons, and advice from the comfort of your home.",
      },
      {
        heading: "Book a session",
        text: "Choose a product category and book a convenient time slot. Our experts will guide you through features, answer your questions, and help you find the perfect product.",
      },
    ],
  },
  "services/care-and-repair": {
    title: "Care & Repair",
    sections: [
      {
        heading: "Keep your tech protected",
        text: "Our Care & Repair plans cover accidental damage, breakdowns, and faults for your tech products. Plans start from just £2.49 per month.",
      },
      {
        heading: "What's covered",
        text: "Accidental damage from drops, spills, and cracked screens. Mechanical and electrical breakdowns after the manufacturer's warranty expires. We'll repair or replace your product.",
      },
      {
        heading: "How to make a claim",
        text: "Call our dedicated claims line or start a claim online. We aim to repair your product within 7 days, or we'll replace it with an equivalent model.",
      },
    ],
  },
  "services/instant-replacement": {
    title: "Instant Replacement",
    sections: [
      {
        heading: "Instant Replacement cover",
        text: "If your product breaks down, we'll replace it immediately — no waiting for repairs. Simply bring it to any Currys store and walk out with a replacement.",
      },
      {
        heading: "Eligible products",
        text: "Instant Replacement is available on selected small appliances, headphones, and accessories. Check the product page for availability.",
      },
    ],
  },
  "services/mobile-insurance": {
    title: "Mobile Insurance",
    sections: [
      {
        heading: "Protect your mobile",
        text: "Comprehensive mobile phone insurance covering accidental damage, theft, loss, and breakdown. Worldwide cover included as standard.",
      },
      {
        heading: "What's included",
        text: "Cracked screen repair, accidental damage, theft and loss cover, worldwide protection, and unlimited claims. Same-day screen repair available at selected stores.",
      },
    ],
  },
  "services/tablet-insurance": {
    title: "Tablet Insurance",
    sections: [
      {
        heading: "Protect your tablet",
        text: "Keep your tablet protected with our insurance plans. Covering accidental damage, mechanical breakdowns, and more.",
      },
      {
        heading: "Plans available",
        text: "Choose from monthly or annual plans. All plans include accidental damage cover, breakdown protection after the manufacturer's warranty expires, and no excess on repairs.",
      },
    ],
  },
  "privacy-cookies-policy": {
    title: "Privacy & cookies policy",
    sections: [
      {
        heading: "How we use your data",
        text: "We collect personal data to process your orders, provide customer support, and improve our services. We take the security of your data seriously and comply with the UK General Data Protection Regulation (UK GDPR).",
      },
      {
        heading: "Cookies",
        text: "We use cookies to provide essential website functionality, analyse traffic, and personalise your experience. You can manage your cookie preferences through our cookie settings.",
      },
      {
        heading: "Your rights",
        text: "You have the right to access, correct, or delete your personal data. You can also object to processing or request data portability. Contact our Data Protection Officer for any privacy-related queries.",
      },
    ],
  },
  "terms-and-conditions": {
    title: "Terms & conditions",
    sections: [
      {
        heading: "General terms",
        text: "These terms and conditions govern your use of the Currys website and your purchases from us. By using our website or making a purchase, you agree to these terms.",
      },
      {
        heading: "Ordering & payment",
        text: "All orders are subject to availability and acceptance. Prices are shown in pounds sterling and include VAT where applicable. We accept major debit cards, PayPal, and Currys gift cards.",
      },
      {
        heading: "Delivery & returns",
        text: "Delivery timescales are estimates and may vary. You have the right to cancel most orders within 14 days of receiving your goods. Certain items are excluded from our returns policy.",
      },
    ],
  },
  "product-recalls": {
    title: "Product recalls",
    sections: [
      {
        heading: "Current product recalls",
        text: "We take product safety seriously. This page lists any current product recalls affecting items sold through Currys. If you own an affected product, please follow the instructions provided.",
      },
      {
        heading: "What to do",
        text: "Stop using the product immediately and follow the recall instructions. You may be entitled to a repair, replacement, or refund depending on the specific recall.",
      },
    ],
  },
  sitemap: {
    title: "Sitemap",
    sections: [
      {
        heading: "Browse our site",
        text: "Use the links below to navigate to different sections of the Currys website. Find products, services, and support across all our departments.",
      },
    ],
  },
};

function getPageData(slug: string[]) {
  const path = slug.join("/");
  if (pageContent[path]) return pageContent[path];

  // Generate a title from the last slug segment
  const lastSegment = slug[slug.length - 1];
  const title = lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title,
    sections: [
      {
        heading: `About ${title}`,
        text: `Learn more about ${title.toLowerCase()} and what we offer. For more information, please contact our customer service team.`,
      },
    ],
  };
}

function buildBreadcrumbs(slug: string[]) {
  const crumbs: { label: string; href: string }[] = [{ label: "Home", href: "/" }];
  slug.forEach((segment, i) => {
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const href = "/" + slug.slice(0, i + 1).join("/");
    crumbs.push({ label, href });
  });
  return crumbs;
}

export default function FooterPage() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];
  const page = getPageData(slug);
  const crumbs = buildBreadcrumbs(slug);

  return (
    <div className="container-main py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>&gt;</span>}
            {i < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="hover:text-primary no-underline text-text-secondary"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-text-primary">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Page heading */}
      <h1 className="text-3xl font-bold text-text-primary mb-8">{page.title}</h1>

      {/* Content sections */}
      <div className="max-w-3xl space-y-8 mb-12">
        {page.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-lg font-bold text-text-primary mb-3">
              {section.heading}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {section.text}
            </p>
          </div>
        ))}
      </div>

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
  );
}
