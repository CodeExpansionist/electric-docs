export interface ReferenceEntry {
  templateId: string;
  description: string;
  currysUrl: string;
  electrizUrl: string;
  viewport: { width: number; height: number; label: string };
  preActions?: string[];
  comparableRegions: string[];
  baselineSource: "live-capture" | "cropped-reference" | "manual-observation";
  confidence: "high" | "medium" | "low";
  notes: string;
}

export const DESKTOP = { width: 1280, height: 900, label: "desktop" } as const;
export const MOBILE = { width: 375, height: 812, label: "mobile" } as const;

export const REFERENCE_MAP: ReferenceEntry[] = [
  {
    templateId: "homepage",
    description: "homepage desktop",
    currysUrl: "https://www.currys.co.uk/",
    electrizUrl: "/",
    viewport: { ...DESKTOP },
    comparableRegions: [
      "header",
      "hero-carousel",
      "shop-deals",
      "usp-bar",
      "footer",
    ],
    baselineSource: "live-capture",
    confidence: "high",
    notes: "",
  },
  {
    templateId: "homepage-mobile",
    description: "homepage mobile",
    currysUrl: "https://www.currys.co.uk/",
    electrizUrl: "/",
    viewport: { ...MOBILE },
    comparableRegions: ["header", "hero-carousel", "footer"],
    baselineSource: "live-capture",
    confidence: "high",
    notes: "",
  },
  {
    templateId: "plp",
    description: "plp desktop",
    currysUrl: "https://www.currys.co.uk/tv-and-audio/televisions/tvs",
    electrizUrl: "/tv-and-audio/televisions/tvs",
    viewport: { ...DESKTOP },
    comparableRegions: ["filter-sidebar", "sort-bar", "product-card"],
    baselineSource: "live-capture",
    confidence: "high",
    notes: "",
  },
  {
    templateId: "pdp",
    description: "pdp desktop",
    currysUrl:
      "https://www.currys.co.uk/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html.html",
    electrizUrl:
      "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html",
    viewport: { ...DESKTOP },
    comparableRegions: ["buy-box", "product-gallery", "header"],
    baselineSource: "live-capture",
    confidence: "high",
    notes: "",
  },
  {
    templateId: "basket",
    description: "basket desktop",
    currysUrl: "https://www.currys.co.uk/basket",
    electrizUrl: "/basket",
    viewport: { ...DESKTOP },
    preActions: ["addProductToBasket"],
    comparableRegions: ["basket-item", "order-summary"],
    baselineSource: "cropped-reference",
    confidence: "medium",
    notes: "",
  },
  {
    templateId: "checkout",
    description: "checkout desktop",
    currysUrl: "https://www.currys.co.uk/checkout",
    electrizUrl: "/checkout",
    viewport: { ...DESKTOP },
    preActions: ["addProductToBasket", "proceedToCheckout"],
    comparableRegions: ["checkout-form", "checkout-sidebar"],
    baselineSource: "cropped-reference",
    confidence: "medium",
    notes: "",
  },
  {
    templateId: "search",
    description: "search desktop",
    currysUrl: "https://www.currys.co.uk/search/samsung",
    electrizUrl: "/search?q=samsung",
    viewport: { ...DESKTOP },
    comparableRegions: ["sort-bar", "product-card"],
    baselineSource: "live-capture",
    confidence: "high",
    notes: "",
  },
];
