export interface VisualRegion {
  id: string;
  name: string;
  page: string;
  selector: string;
  fallbackSelector?: string;
  tolerance: number;
  viewports: Array<{ width: number; height: number; label: string }>;
  setupFn?: string; // e.g. "addProductToBasket"
  scrollIntoView?: boolean;
  waitForSelector?: string; // wait for this selector before capture
}

const DESKTOP = { width: 1280, height: 900, label: "desktop" };
const MOBILE = { width: 375, height: 812, label: "mobile" };

export const REGIONS: VisualRegion[] = [
  // ── Homepage ──────────────────────────────────────────────────────────
  {
    id: "header",
    name: "Site Header",
    page: "/",
    selector: "header",
    tolerance: 0.05,
    viewports: [DESKTOP, MOBILE],
  },
  {
    id: "usp-bar",
    name: "USP Trust Bar",
    page: "/",
    selector: "[aria-label='Unique selling points']",
    tolerance: 0.05,
    viewports: [DESKTOP],
  },
  {
    id: "hero-carousel",
    name: "Hero Carousel",
    page: "/",
    selector: "section[aria-roledescription='carousel']",
    tolerance: 0.15,
    viewports: [DESKTOP, MOBILE],
  },
  {
    id: "shop-deals",
    name: "Shop Deals Section",
    page: "/",
    selector: "section[aria-labelledby='shop-deals-heading']",
    tolerance: 0.1,
    viewports: [DESKTOP],
    scrollIntoView: true,
  },
  {
    id: "footer",
    name: "Site Footer",
    page: "/",
    selector: "footer",
    tolerance: 0.08,
    viewports: [DESKTOP, MOBILE],
    scrollIntoView: true,
  },

  // ── PLP (TVs listing) ────────────────────────────────────────────────
  {
    id: "filter-sidebar",
    name: "Filter Sidebar",
    page: "/tv-and-audio/televisions/tvs",
    selector: "aside",
    tolerance: 0.1,
    viewports: [DESKTOP],
    waitForSelector: "aside",
  },
  {
    id: "product-card-plp",
    name: "Product Card (PLP)",
    page: "/tv-and-audio/televisions/tvs",
    selector: "div[class*='card'][class*='p-4']",
    fallbackSelector: "a[href*='/products/']",
    tolerance: 0.1,
    viewports: [DESKTOP, MOBILE],
    waitForSelector: "a[href*='/products/']",
  },
  {
    id: "sort-bar",
    name: "Sort Bar",
    page: "/tv-and-audio/televisions/tvs",
    selector: "[data-testid='sort-select']",
    fallbackSelector: "[data-testid='sort-bar']",
    tolerance: 0.05,
    viewports: [DESKTOP],
    waitForSelector: "[data-testid='sort-select']",
  },

  // ── PDP (Product Detail) ─────────────────────────────────────────────
  {
    id: "buy-box",
    name: "Buy Box (Price Panel)",
    page: "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html",
    selector: "div:has(> [data-testid='add-to-basket'])",
    fallbackSelector: "div[class*='bg-surface'][class*='rounded-lg']",
    tolerance: 0.1,
    viewports: [DESKTOP, MOBILE],
    waitForSelector: "[data-testid='add-to-basket']",
  },
  {
    id: "product-gallery",
    name: "Product Gallery",
    page: "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html",
    selector: "div[class*='aspect-'][class*='bg-white'][class*='border-border']",
    fallbackSelector: "div[class*='lg:flex-row'] > div:first-child",
    tolerance: 0.15,
    viewports: [DESKTOP],
    waitForSelector: "h1",
  },

  // ── Basket (requires setup) ──────────────────────────────────────────
  {
    id: "basket-item",
    name: "Basket Item",
    page: "/basket",
    selector: "[data-testid='basket-item']:first-child",
    fallbackSelector: "[class*='basket-item']:first-child",
    tolerance: 0.1,
    viewports: [DESKTOP],
    setupFn: "addProductToBasket",
    waitForSelector: "[data-testid='basket-item']",
  },
  {
    id: "order-summary",
    name: "Order Summary Sidebar",
    page: "/basket",
    selector: ".card.sticky",
    fallbackSelector: ".card.p-5",
    tolerance: 0.08,
    viewports: [DESKTOP],
    setupFn: "addProductToBasket",
    waitForSelector: ".card.sticky, .card.p-5",
  },
];
