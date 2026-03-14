import type { TemplateManifest } from "./types";

export const checkoutManifest: TemplateManifest = {
  templateId: "checkout",
  description:
    "Checkout: TwoColumnLayout, StepIndicator, WelcomeStep, CheckoutSidebar, OrderSummaryMini, TermsCheckbox, PlaceOrderButton (CHECKOUT layout — no MainNav/Footer)",
  testUrl: "/checkout",
  setupFn: "addProductToBasket",
  sections: [
    {
      id: "two-column-layout",
      selector: 'div[class*="lg:flex-row"][class*="gap-6"]',
      fallbackSelectors: [
        'div[class*="lg:flex-row"]',
        "main > div > div.flex.flex-col",
      ],
      required: true,
      order: 1,
      viewport: "desktop",
      currysEvidence: "13-checkout-welcome.png",
    },
    {
      id: "step-indicator",
      selector: 'div:has(> div.rounded-full)',
      fallbackSelectors: [
        'div.flex.items-center.gap-3:has(div.rounded-full)',
        'div:has(span:has-text("Delivery"))',
      ],
      required: true,
      order: 2,
      viewport: "both",
      currysEvidence: "13-checkout-welcome.png",
    },
    {
      id: "welcome-step",
      selector: 'button:has-text("guest")',
      fallbackSelectors: [
        'button:has-text("Guest")',
        'div:has(> button:has-text("Sign in"))',
      ],
      required: true,
      order: 3,
      viewport: "both",
      currysEvidence: "13-checkout-welcome.png",
    },
    {
      id: "checkout-sidebar",
      selector: 'div.card.p-6',
      fallbackSelectors: [
        'div[class*="lg:w-"][class*="flex-shrink-0"]',
        'div:has(> h3:has-text("basket"))',
      ],
      required: true,
      order: 4,
      viewport: "both",
      currysEvidence: "13-checkout-welcome.png",
    },
    {
      id: "order-summary-mini",
      selector: 'h3:has-text("basket")',
      fallbackSelectors: [
        'div.card.p-6',
        'div:has(> h3:has-text("In your basket"))',
      ],
      required: true,
      order: 5,
      viewport: "both",
      currysEvidence: "13-checkout-welcome.png",
    },
    {
      id: "terms-checkbox",
      selector: 'input[type="checkbox"]',
      fallbackSelectors: [
        'label:has(input[type="checkbox"])',
        '[data-testid="terms-checkbox"]',
      ],
      required: false,
      order: 6,
      viewport: "both",
      currysEvidence: "18-checkout-payment.png",
    },
    {
      id: "place-order-button",
      selector: 'button:has-text("Place order")',
      fallbackSelectors: [
        '[data-testid="place-order-button"]',
        'button:has-text("place order")',
      ],
      required: false,
      order: 7,
      viewport: "both",
      currysEvidence: "18-checkout-payment.png",
    },
  ],
};
