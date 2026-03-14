import type { TemplateManifest } from "./types";

export const basketManifest: TemplateManifest = {
  templateId: "basket",
  description:
    "Basket: BasketTitle, TwoColumnLayout, BasketItems, DeliveryInfo, ServicesSection, OrderSummary, PromoCode, CheckoutButton",
  testUrl: "/basket",
  setupFn: "addProductToBasket",
  sections: [
    {
      id: "basket-title",
      selector: "h1",
      fallbackSelectors: [
        "main h1",
        '[data-testid="basket-title"]',
      ],
      required: true,
      order: 1,
      viewport: "both",
      currysEvidence: "12-basket.png",
    },
    {
      id: "two-column-layout",
      selector: 'div[class*="lg:flex-row"][class*="gap-6"]',
      fallbackSelectors: [
        'div[class*="lg:flex-row"]',
        "main > div > div.flex.flex-col",
      ],
      required: true,
      order: 2,
      viewport: "desktop",
      currysEvidence: "12-basket.png",
    },
    {
      id: "basket-items",
      selector: "div.flex-1.min-w-0:has([data-testid='basket-item'])",
      fallbackSelectors: [
        'div.bg-white.rounded-lg:has([data-testid="basket-item"])',
        'div:has(> [data-testid="basket-item"])',
      ],
      required: true,
      order: 3,
      viewport: "both",
      currysEvidence: "12-basket.png",
      children: [
        {
          role: "basket-item",
          selector: '[data-testid="basket-item"]',
          required: true,
          expectedCount: { min: 1 },
        },
      ],
    },
    {
      id: "delivery-info",
      selector: 'div[class*="border-border"][class*="rounded-md"]',
      fallbackSelectors: [
        '[data-testid="basket-item"] div[class*="rounded-md"]',
        'div:has-text("delivery")',
      ],
      required: true,
      order: 4,
      viewport: "both",
      currysEvidence: "12-basket.png",
    },
    {
      id: "services-section",
      selector: '[data-testid="services-section"]',
      fallbackSelectors: [
        'div:has-text("installation")',
        'div:has-text("recycling")',
      ],
      required: false,
      order: 5,
      viewport: "both",
    },
    {
      id: "order-summary",
      selector: ".card.sticky, .card.p-5",
      fallbackSelectors: [
        '[data-testid="order-summary"]',
        ".flex.flex-col.lg\\:flex-row > div:last-child",
      ],
      required: true,
      order: 6,
      viewport: "both",
      currysEvidence: "12-basket.png",
    },
    {
      id: "promo-code",
      selector: 'button:has-text("promo")',
      fallbackSelectors: [
        'button:has-text("Promo")',
        'div:has(input[placeholder*="code"])',
      ],
      required: true,
      order: 7,
      viewport: "both",
      currysEvidence: "12-basket.png",
    },
    {
      id: "checkout-button",
      selector: 'a[href="/checkout"], button:has-text("checkout")',
      fallbackSelectors: [
        '[data-testid="checkout-button"]',
        'a:has-text("Checkout")',
      ],
      required: true,
      order: 8,
      viewport: "both",
      currysEvidence: "12-basket.png",
    },
  ],
};
