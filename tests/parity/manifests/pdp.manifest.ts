import type { TemplateManifest } from "./types";

export const pdpManifest: TemplateManifest = {
  templateId: "pdp",
  description:
    "PDP (Product Detail Page): Breadcrumbs, ProductTitle, StarRating, BadgesRow, TwoColumnLayout, ProductGallery, PricePanel, CollapsibleSections, CrossSell, StickyHeader",
  testUrl:
    "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html",
  sections: [
    {
      id: "breadcrumbs",
      selector: "nav.flex.items-center",
      fallbackSelectors: [
        'nav[aria-label="Breadcrumb"]',
        "nav:has(a[href='/'])",
      ],
      required: true,
      order: 1,
      viewport: "both",
      currysEvidence: "09-product-page-top.png",
    },
    {
      id: "product-title",
      selector: "h1",
      fallbackSelectors: [
        "main h1",
        '[data-testid="product-title"]',
      ],
      required: true,
      order: 2,
      viewport: "both",
      currysEvidence: "09-product-page-top.png",
    },
    {
      id: "star-rating",
      selector: "div:has(> svg)",
      fallbackSelectors: [
        '[data-testid="star-rating"]',
        ".flex.items-center:has(svg)",
      ],
      required: true,
      order: 3,
      viewport: "both",
      currysEvidence: "09-product-page-top.png",
    },
    {
      id: "badges-row",
      selector: '[data-testid="badges-row"]',
      fallbackSelectors: [
        ".flex.gap-2:has(span.bg-)",
        ".flex.flex-wrap.gap-1",
      ],
      required: false,
      order: 4,
      viewport: "both",
    },
    {
      id: "two-column-layout",
      selector: 'div[class*="lg:flex-row"][class*="items-start"]',
      fallbackSelectors: [
        'div[class*="lg:flex-row"][class*="gap-5"]',
        "main > div > div.flex.flex-col",
      ],
      required: true,
      order: 5,
      viewport: "desktop",
      currysEvidence: "09-product-page-top.png",
    },
    {
      id: "product-gallery",
      selector: 'div[class*="aspect-"][class*="bg-white"][class*="border-border"]',
      fallbackSelectors: [
        'div[class*="lg:flex-row"] > div:first-child img[alt]',
        "img[alt]:not([data-testid])",
      ],
      required: true,
      order: 6,
      viewport: "both",
      currysEvidence: "09-product-page-top.png",
      children: [
        {
          role: "thumbnail-image",
          selector: "img, button:has(img)",
          required: true,
          expectedCount: { min: 1 },
        },
      ],
    },
    {
      id: "price-panel",
      selector: 'div:has(> [data-testid="add-to-basket"])',
      fallbackSelectors: [
        'div[class*="bg-surface"][class*="rounded-lg"]',
        'div:has([data-testid="product-price"])',
      ],
      required: true,
      order: 7,
      viewport: "both",
      currysEvidence: "09-product-page-top.png",
      children: [
        {
          role: "add-to-basket-button",
          selector: '[data-testid="add-to-basket"]',
          required: true,
        },
      ],
    },
    {
      id: "collapsible-sections",
      selector: "div:has(> div.border-b > button.py-4)",
      fallbackSelectors: [
        "div:has(> div.border-b > button)",
        "div.mb-10:has(button.py-4)",
      ],
      required: true,
      order: 8,
      viewport: "both",
      currysEvidence: "10-product-page-mid.png",
      children: [
        {
          role: "section-header",
          selector: "button.flex.items-center.justify-between.w-full.py-4",
          required: true,
          expectedCount: { min: 2 },
        },
      ],
    },
    {
      id: "cross-sell",
      selector: '[data-testid="cross-sell"]',
      fallbackSelectors: [
        'section:has(h2:has-text("also like"))',
        'section:has(h2:has-text("recommended"))',
      ],
      required: false,
      order: 9,
      viewport: "both",
      currysEvidence: "11-product-page-bottom.png",
    },
    {
      id: "sticky-header",
      selector: '[data-testid="sticky-header"]',
      fallbackSelectors: [
        ".fixed.top-0.w-full",
        ".sticky.top-0",
      ],
      required: false,
      order: 10,
      viewport: "desktop",
    },
  ],
};
