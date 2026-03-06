#!/usr/bin/env node
/**
 * Creates JSON content files for all footer/subfooter/secondary nav pages.
 * Uses real scraped content where available, creates Electriz-branded content otherwise.
 * Output: data/scrape/pages/{slug}.json
 */

const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "data", "scrape", "pages");
fs.mkdirSync(PAGES_DIR, { recursive: true });

function writePage(slug, data) {
  const filePath = path.join(PAGES_DIR, slug.replace(/\//g, "__") + ".json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Created: ${slug}`);
}

const pages = {
  // ─── Footer Column 1: Help & support ───
  "help-and-support/contact-us": {
    url: "/help-and-support/contact-us",
    pageTitle: "Contact us",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Help & Support", url: "/help-and-support" },
      { label: "Contact us", url: "/help-and-support/contact-us" },
    ],
    sections: [
      {
        heading: "Get in touch",
        content:
          "Our customer service team is available 7 days a week. You can reach us by phone, email, or live chat. We aim to respond to all enquiries within 24 hours.",
        type: "text",
      },
      {
        heading: "Phone support",
        content:
          "Call us on 0344 561 1234. Our lines are open Monday to Friday 8am-8pm, Saturday 8am-6pm, and Sunday 10am-4pm.",
        type: "text",
      },
      {
        heading: "Live chat",
        content:
          "Chat with one of our agents online for quick answers to your questions. Available Monday to Saturday 8am-8pm and Sunday 10am-4pm.",
        type: "text",
      },
      {
        heading: "Email",
        content:
          "Send us an email and we'll get back to you within 24 hours. Please include your order number if your query relates to an existing order.",
        type: "text",
      },
    ],
    faqs: [],
  },

  techtalk: {
    url: "/techtalk",
    pageTitle: "TechTalk",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "TechTalk", url: "/techtalk" },
    ],
    sections: [
      {
        heading: "The latest tech, tips and inspiration",
        content:
          "Welcome to TechTalk — your go-to blog for the latest tech tips, product guides, and inspiration. Whether you're looking for advice on your next TV, tips on setting up your smart home, or the latest gaming news, we've got you covered.",
        type: "text",
      },
      {
        heading: "Browse article categories",
        content:
          "Audio, Computing, Smart tech, How to, Kitchen & Home, Mobile, Photography, Gaming news, TV Advice",
        type: "categories",
      },
      {
        heading: "Trending articles",
        content:
          "10 best gaming phones in 2026, 5 Mother's Day gifts that last longer than flowers, Apple's new AirTag 2 for 2026: key features and should you upgrade?, 7 smart lighting tips to brighten your home this winter",
        type: "articles",
      },
    ],
    faqs: [],
  },

  "services/price-promise": {
    url: "/services/price-promise",
    pageTitle: "Price Promise",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Price Promise", url: "/services/price-promise" },
    ],
    sections: [
      {
        heading: "Our Price Promise",
        content:
          "We can price match before or after you buy — we'll even price match 7 days after your purchase! If you find the same product cheaper at a major UK retailer, we'll match the price.",
        type: "text",
      },
      {
        heading: "How to claim",
        content:
          "Simply show us the lower price at the point of purchase, or contact us within 7 days of your purchase. We'll need to verify the competitor's price before processing your claim.",
        type: "text",
      },
      {
        heading: "Terms & conditions",
        content:
          "The product must be identical (same make, model, and colour). The competitor must be a UK-based retailer with stock available for immediate purchase. Marketplace sellers and auction sites are excluded.",
        type: "text",
      },
    ],
    faqs: [
      {
        question: "Can you price match?",
        answer:
          "We can price match before or after you buy — we'll even price match 7 days after your purchase! Learn more about our Price Promise.",
      },
      {
        question: "Does Price Promise apply to online retailers?",
        answer:
          "Yes, we'll match prices from major UK online retailers as long as the product is identical and in stock for immediate purchase.",
      },
    ],
  },

  "product-reviews": {
    url: "/product-reviews",
    pageTitle: "Product reviews",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Product reviews", url: "/product-reviews" },
    ],
    sections: [
      {
        heading: "Trusted reviews from verified customers",
        content:
          "Read honest reviews from verified customers to help you make informed purchasing decisions. Our reviews are collected independently to ensure authenticity.",
        type: "text",
      },
      {
        heading: "Leave a review",
        content:
          "Purchased a product from us? Share your experience by leaving a review. Your feedback helps other customers and helps us improve our service.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── Footer Column 2: Services ───
  "track-your-order": {
    url: "/track-your-order",
    pageTitle: "Track my order",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Track my order", url: "/track-your-order" },
    ],
    sections: [
      {
        heading: "Track my order",
        content:
          "Sign into your account below. Here you can easily track your orders, start a return and see your order history.",
        type: "text",
      },
      {
        heading: "Track without an account",
        content:
          "If you don't have an account with us, add your order number and email below. You'll then be able to track your recent order or start a return. Your order number is a 13-digit number, found in your confirmation email or on your receipt.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "services/delivery": {
    url: "/services/delivery",
    pageTitle: "Delivery & collection",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Delivery & collection", url: "/services/delivery" },
    ],
    sections: [
      {
        heading: "Collect from your local store in as little as an hour or book a delivery slot",
        content: "Subject to availability.",
        type: "text",
      },
      {
        heading: "Small items",
        content:
          "Just about everything but the kitchen sink! Doesn't include major kitchen & laundry appliances, and TVs over 43\".\n\nStandard delivery — get it in 3-5 working days:\n• Orders over £40: All-day delivery, FREE\n• Orders under £40: All-day delivery, £3.99\n\nNext-day delivery — get it next-day, 7 days a week:\n• All-day delivery, order by 9pm: £5.99\n• Weekday time slot from 12noon-5pm, order by 9pm: £9.99\n• Weekend all-day delivery, order by 9pm: £6.99\n• Weekend time slot, morning before noon, order by 9pm: £10.99\n\nYour delivery courier will let you know once your order is dispatched. Deliveries are between 8am & 8pm. We don't deliver on bank holidays.",
        type: "text",
      },
      {
        heading: "Large items",
        content:
          "Major appliances like dishwashers, washing machines, fridge freezers, and TVs over 43\".\n\nStandard delivery — get it in 4 working days:\n• All-day delivery from 7am-8pm, order anytime: From £20\n• Choose a time slot: 7am-11am, 9am-1pm, 11am-3pm, 1pm-5pm, order anytime: From £35\n\nNext-day delivery — get it next day, 7 days a week:\n• All-day delivery from 7am-8pm, order by 7pm: From £30\n• Choose a time slot, order by 7pm: From £45\n\nWe don't deliver on bank holidays. Sometimes, because of things like bad weather, your delivery may be delayed.",
        type: "text",
      },
      {
        heading: "Collection",
        content:
          "Not around to accept a delivery? With almost 300 stores nationwide, you can order online and pick up your item(s) for FREE. If it's in stock, you can pick it up on the same day. If it's not in stock at your selected store, you can send it there for pick-up on a day that suits you.",
        type: "text",
      },
    ],
    faqs: [
      {
        question: "How can I speak to someone about my order?",
        answer:
          "You can track your order via your order confirmation. You can also go to your online account. If you still need help, you can use our Webchat.",
      },
      {
        question: "Can I change my delivery date or address after placing my order?",
        answer:
          "You can't change your delivery address after you've placed your order. But if you've ordered a large item (fridge freezer, oven, TV over 40\" etc), you can change your delivery date.",
      },
      {
        question: "My order hasn't arrived yet. Where is it?",
        answer:
          "You can track your large-item order via your order confirmation or online account. You can track your small-item order via your courier's online tracking system.",
      },
      {
        question: "What should I do if I miss my delivery?",
        answer:
          "For large-item delivery: We'll contact you when we're near you. If you're not in when we arrive, we'll wait a few minutes for you. If you don't turn up, we'll leave a 'Sorry we missed you' card.",
      },
      {
        question: "Is next-day and time-slot delivery available on all orders?",
        answer:
          "You can book next-day delivery for certain large items, dependent on your delivery address and availability. Check individual product pages for availability.",
      },
    ],
  },

  "services/returns": {
    url: "/services/returns",
    pageTitle: "Returns, refunds & exchanges",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Returns & Refunds", url: "/services/returns" },
    ],
    sections: [
      {
        heading: "Returns, refunds & exchanges",
        content:
          "Want to return an item? No problem! We're happy to offer you an exchange, a refund, or something else — just let us know why you're returning your item and which solution you'd prefer, and we'll go from there.",
        type: "text",
      },
      {
        heading: "Faulty items",
        content:
          "If your item is faulty, we're happy to offer you an exchange or a refund. You can do this within 30 days from when you bought it or had it delivered.\n\nIf more than 30 days have passed since you bought or received your item, we might be able to repair it as long as it's still within its guarantee period (usually 12 months from when you bought it).\n\nWe can't exchange, refund, or repair items that are faulty due to accidental damage, neglect, misuse, or normal wear and tear.",
        type: "text",
      },
      {
        heading: "Changed your mind?",
        content:
          "If you bought your item online, you can return it within 30 days — even if you've opened it for inspection. To get a full refund, the item must be returned like new and in a resaleable condition. This means you must not use it. You must also keep it in its original box and return it with all its accessories.\n\nMost items bought online can be returned in our stores if they meet these conditions. Use our handy returns journey guide to find the quickest way to return your item.\n\nIf you bought your item in store, you can return it within 30 days. It must be in its unopened and sealed packaging. You also need your proof of purchase.",
        type: "text",
      },
    ],
    faqs: [
      {
        question: "What should I do if I want a refund?",
        answer:
          "To request a refund, start a return online through your account, or bring the product to any store with your proof of purchase.",
      },
      {
        question: "Can I exchange a faulty item?",
        answer:
          "Yes, you can exchange or refund a faulty item within 30 days of purchase.",
      },
      {
        question: "What is the return policy for items purchased in store?",
        answer:
          "Items bought in store can be returned within 30 days if they are unopened and sealed with proof of purchase.",
      },
    ],
  },

  "services/shoplive": {
    url: "/services/shoplive",
    pageTitle: "ShopLive",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "ShopLive", url: "/services/shoplive" },
    ],
    sections: [
      {
        heading: "Shop from home with an expert",
        content:
          "ShopLive connects you with an Electriz expert via video call. Get personalised product demonstrations, comparisons, and advice from the comfort of your home.",
        type: "text",
      },
      {
        heading: "Book a session",
        content:
          "Choose a product category and book a convenient time slot. Our experts will guide you through features, answer your questions, and help you find the perfect product.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── Footer Column 3: Care Services ───
  "services/care-and-repair": {
    url: "/services/care-and-repair",
    pageTitle: "Care & Repair",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Care & Repair", url: "/services/care-and-repair" },
    ],
    sections: [
      {
        heading: "Keep your tech protected",
        content:
          "Our Care & Repair plans cover accidental damage, breakdowns, and faults for your tech products. Plans start from just £2.49 per month.",
        type: "text",
      },
      {
        heading: "What's covered",
        content:
          "Accidental damage from drops, spills, and cracked screens. Mechanical and electrical breakdowns after the manufacturer's warranty expires. We'll repair or replace your product.",
        type: "text",
      },
      {
        heading: "How to make a claim",
        content:
          "Call our dedicated claims line or start a claim online. We aim to repair your product within 7 days, or we'll replace it with an equivalent model.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "services/instant-replacement": {
    url: "/services/instant-replacement",
    pageTitle: "Instant Replacement",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      {
        label: "Instant Replacement",
        url: "/services/instant-replacement",
      },
    ],
    sections: [
      {
        heading: "Instant Replacement cover",
        content:
          "If your product breaks down, we'll replace it immediately — no waiting for repairs. Simply bring it to any Electriz store and walk out with a replacement.",
        type: "text",
      },
      {
        heading: "Eligible products",
        content:
          "Instant Replacement is available on selected small appliances, headphones, and accessories. Check the product page for availability.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "services/mobile-insurance": {
    url: "/services/mobile-insurance",
    pageTitle: "Mobile Insurance",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Mobile Insurance", url: "/services/mobile-insurance" },
    ],
    sections: [
      {
        heading: "Protect your mobile",
        content:
          "Comprehensive mobile phone insurance covering accidental damage, theft, loss, and breakdown. Worldwide cover included as standard.",
        type: "text",
      },
      {
        heading: "What's included",
        content:
          "Cracked screen repair, accidental damage, theft and loss cover, worldwide protection, and unlimited claims. Same-day screen repair available at selected stores.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "services/tablet-insurance": {
    url: "/services/tablet-insurance",
    pageTitle: "Tablet Insurance",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Tablet Insurance", url: "/services/tablet-insurance" },
    ],
    sections: [
      {
        heading: "Protect your tablet",
        content:
          "Keep your tablet protected with our insurance plans. Covering accidental damage, mechanical breakdowns, and more.",
        type: "text",
      },
      {
        heading: "Plans available",
        content:
          "Choose from monthly or annual plans. All plans include accidental damage cover, breakdown protection after the manufacturer's warranty expires, and no excess on repairs.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── Footer Column 4: Our websites (external) ───
  business: {
    url: "/business",
    pageTitle: "Electriz Business",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Electriz Business", url: "/business" },
    ],
    sections: [
      {
        heading: "Electriz Business",
        content:
          "Technology solutions for businesses of all sizes. From laptops and monitors to full office setups, we provide dedicated account management, bulk pricing, and next-day delivery for business customers.",
        type: "text",
      },
      {
        heading: "Business accounts",
        content:
          "Open a business account for exclusive pricing, dedicated support, and flexible payment options tailored to your organisation's needs.",
        type: "text",
      },
    ],
    faqs: [],
  },

  ireland: {
    url: "/ireland",
    pageTitle: "Electriz Ireland",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Electriz Ireland", url: "/ireland" },
    ],
    sections: [
      {
        heading: "Electriz Ireland",
        content:
          "Shop the latest technology with Electriz Ireland. Visit our Irish website for local pricing, delivery options, and store information across the Republic of Ireland and Northern Ireland.",
        type: "text",
      },
    ],
    faqs: [],
  },

  partmaster: {
    url: "/partmaster",
    pageTitle: "Partmaster",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Partmaster", url: "/partmaster" },
    ],
    sections: [
      {
        heading: "Partmaster",
        content:
          "Need a spare part or accessory for your appliance? Partmaster stocks thousands of genuine spare parts for all major brands. From vacuum cleaner bags to fridge shelves, find the part you need and get it delivered to your door.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "carphone-warehouse": {
    url: "/carphone-warehouse",
    pageTitle: "Carphone Warehouse",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Carphone Warehouse", url: "/carphone-warehouse" },
    ],
    sections: [
      {
        heading: "Carphone Warehouse",
        content:
          "Find the latest mobile phone deals, SIM-only contracts, and accessories. Compare deals from all major UK networks and find the perfect plan for you.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── Footer Column 5: About us ───
  trustpilot: {
    url: "/trustpilot",
    pageTitle: "Leave a review on Trustpilot",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Trustpilot", url: "/trustpilot" },
    ],
    sections: [
      {
        heading: "Share your experience",
        content:
          "Had a great experience with Electriz? We'd love to hear about it! Leave us a review on Trustpilot to help other customers make informed decisions.",
        type: "text",
      },
      {
        heading: "Our commitment",
        content:
          "We value your feedback and use it to continuously improve our products and services. Every review is read by our customer experience team.",
        type: "text",
      },
    ],
    faqs: [],
  },

  corporate: {
    url: "/corporate",
    pageTitle: "Corporate site",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Corporate", url: "/corporate" },
    ],
    sections: [
      {
        heading: "Electriz Group plc",
        content:
          "Electriz Group plc is one of the UK's leading specialist electrical retailing and services companies. Visit our corporate site for investor relations, financial reports, and company information.",
        type: "text",
      },
    ],
    faqs: [],
  },

  careers: {
    url: "/careers",
    pageTitle: "Careers",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Careers", url: "/careers" },
    ],
    sections: [
      {
        heading: "Join the Electriz team",
        content:
          "We're always looking for talented people to join our team. Whether you're passionate about technology, customer service, or retail, we have opportunities across the UK.",
        type: "text",
      },
      {
        heading: "Current vacancies",
        content:
          "Browse our latest job openings across stores, head office, distribution centres, and engineering teams. We offer competitive salaries, staff discounts, and career development opportunities.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "pr-media": {
    url: "/pr-media",
    pageTitle: "PR & media",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "PR & media", url: "/pr-media" },
    ],
    sections: [
      {
        heading: "Press & media enquiries",
        content:
          "For all press and media enquiries, please contact our communications team. We're happy to provide comments, expert spokespeople, and product information for editorial features.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "modern-slavery-statement": {
    url: "/modern-slavery-statement",
    pageTitle: "Modern slavery statement",
    breadcrumbs: [
      { label: "Home", url: "/" },
      {
        label: "Modern slavery statement",
        url: "/modern-slavery-statement",
      },
    ],
    sections: [
      {
        heading: "Modern slavery statement",
        content:
          "Electriz Group plc is committed to preventing modern slavery and human trafficking in its business and supply chains. This statement is made pursuant to Section 54 of the Modern Slavery Act 2015.",
        type: "text",
      },
      {
        heading: "Our approach",
        content:
          "We conduct due diligence on all new suppliers and regularly audit existing supply chains. We provide training to our procurement teams and have established clear policies and procedures for identifying and reporting concerns.",
        type: "text",
      },
    ],
    faqs: [],
  },

  csr: {
    url: "/csr",
    pageTitle: "Corporate social responsibility",
    breadcrumbs: [
      { label: "Home", url: "/" },
      {
        label: "Corporate social responsibility",
        url: "/csr",
      },
    ],
    sections: [
      {
        heading: "Our responsibility",
        content:
          "At Electriz, we're committed to operating responsibly and sustainably. From reducing our carbon footprint to supporting local communities, we take our corporate responsibilities seriously.",
        type: "text",
      },
      {
        heading: "Sustainability",
        content:
          "We're working towards ambitious environmental targets, including reducing waste, increasing recycling, and transitioning to renewable energy across our stores and distribution network.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── SubFooter ───
  "privacy-cookies-policy": {
    url: "/privacy-cookies-policy",
    pageTitle: "Privacy & cookies policy",
    breadcrumbs: [
      { label: "Home", url: "/" },
      {
        label: "Privacy & cookies policy",
        url: "/privacy-cookies-policy",
      },
    ],
    sections: [
      {
        heading: "How we use your data",
        content:
          "We collect personal data to process your orders, provide customer support, and improve our services. We take the security of your data seriously and comply with the UK General Data Protection Regulation (UK GDPR).",
        type: "text",
      },
      {
        heading: "Cookies",
        content:
          "We use cookies to provide essential website functionality, analyse traffic, and personalise your experience. You can manage your cookie preferences through our cookie settings.",
        type: "text",
      },
      {
        heading: "What information we collect",
        content:
          "We collect information directly from you — such as your name, email address, and purchasing history — and about your interactions with our services.",
        type: "text",
      },
      {
        heading: "Your rights",
        content:
          "You have the right to access, correct, or delete your personal data. You can also object to processing or request data portability. Contact our Data Protection Officer for any privacy-related queries.",
        type: "text",
      },
    ],
    faqs: [
      {
        question: "What are cookies and why do you use them?",
        answer:
          "Cookies are small text files stored on your device that help us provide a better user experience.",
      },
      {
        question: "How can I manage my cookie preferences?",
        answer:
          "You can manage your cookie preferences through your browser settings or our cookie consent tool.",
      },
    ],
  },

  "terms-and-conditions": {
    url: "/terms-and-conditions",
    pageTitle: "Terms & conditions",
    breadcrumbs: [
      { label: "Home", url: "/" },
      {
        label: "Terms & conditions",
        url: "/terms-and-conditions",
      },
    ],
    sections: [
      {
        heading: "General terms",
        content:
          "These terms and conditions govern your use of the Electriz website and your purchases from us. By using our website or making a purchase, you agree to these terms.",
        type: "text",
      },
      {
        heading: "Ordering & payment",
        content:
          "All orders are subject to availability and acceptance. Prices are shown in pounds sterling and include VAT where applicable. We accept major debit cards, credit cards, PayPal, and Electriz gift cards.",
        type: "text",
      },
      {
        heading: "Delivery & returns",
        content:
          "Delivery timescales are estimates and may vary. You have the right to cancel most orders within 14 days of receiving your goods. Certain items are excluded from our returns policy — see our Returns page for full details.",
        type: "text",
      },
    ],
    faqs: [],
  },

  "product-recalls": {
    url: "/product-recalls",
    pageTitle: "Product recalls",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Product recalls", url: "/product-recalls" },
    ],
    sections: [
      {
        heading: "Current product recalls",
        content:
          "We take product safety seriously. This page lists any current product recalls affecting items sold through Electriz. If you own an affected product, please follow the instructions provided.",
        type: "text",
      },
      {
        heading: "What to do",
        content:
          "Stop using the product immediately and follow the recall instructions. You may be entitled to a repair, replacement, or refund depending on the specific recall.",
        type: "text",
      },
    ],
    faqs: [],
  },

  sitemap: {
    url: "/sitemap",
    pageTitle: "Sitemap",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Sitemap", url: "/sitemap" },
    ],
    sections: [
      {
        heading: "Browse our site",
        content:
          "Use the links below to navigate to different sections of the Electriz website. Find products, services, and support across all our departments.",
        type: "text",
      },
    ],
    faqs: [],
  },

  // ─── SecondaryNav (only one not covered above) ───
  "services/gift-cards": {
    url: "/services/gift-cards",
    pageTitle: "Gift cards",
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Services", url: "/help-and-support" },
      { label: "Gift cards", url: "/services/gift-cards" },
    ],
    sections: [
      {
        heading: "Can't decide on the perfect gift? Give the gift of tech with an Electriz gift card",
        content:
          "The perfect gift for any occasion. A great range of designs to choose from and any load value available up to £1,000. Shop now online or in-store.",
        type: "text",
      },
      {
        heading: "Where can I purchase gift cards?",
        content:
          "Gift cards can be purchased online or in-store, with a maximum load value of £1,000. Corporate self-service options are also available for bulk purchases.",
        type: "text",
      },
      {
        heading: "Terms and conditions",
        content:
          "Gift cards can be redeemed in Electriz stores or online, but cannot be used to purchase airtime or certain mobile phones and accessories.",
        type: "text",
      },
    ],
    faqs: [
      {
        question: "How do I use my gift card or eGift card?",
        answer:
          "All Electriz gift cards can be redeemed in store or online as full or part payment towards our products or services. Enter the 19 digit card number without any spaces.",
      },
      {
        question: "What will happen if I return something I bought with a gift card?",
        answer:
          "If a transaction paid for by gift card is refunded, the value will be refunded back onto a gift card.",
      },
      {
        question: "How many gift cards can I use online?",
        answer: "You are able to use up to 10 gift cards per transaction.",
      },
      {
        question: "When will my gift card balance expire?",
        answer:
          "Upon 2 years non-use, the card will expire and any balance will be deducted.",
      },
    ],
  },
};

console.log("Creating page content JSON files...\n");
let count = 0;
for (const [slug, data] of Object.entries(pages)) {
  writePage(slug, data);
  count++;
}
console.log(`\nDone! Created ${count} page files in ${PAGES_DIR}`);
