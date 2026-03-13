import { describe, it, expect } from "vitest";
import { doesProductMatchFilter, filterProducts } from "@/lib/filter-utils";
import type { CategoryProduct } from "@/lib/category-data";

// --- Test fixtures ---

function makeProduct(overrides: Partial<CategoryProduct> = {}): CategoryProduct {
  return {
    name: 'SAMSUNG QE55Q80DATXXU 55" Smart 4K Ultra HD HDR QLED TV with Bixby & Alexa 2024',
    brand: "SAMSUNG",
    price: { current: 799, was: 999, savings: 200 },
    rating: { average: 4.7, count: 247 },
    url: "/products/samsung-qe55q80datxxu",
    imageUrl: "/images/products/10267890/main.webp",
    productId: "10267890",
    specs: [
      "55 inch screen",
      "4K Ultra HD",
      "120Hz refresh rate",
      "HDMI 2.1 x 4",
      "2 year guarantee",
    ],
    badges: ["Loved by Electriz", "Epic Deal"],
    offers: ["Free soundbar worth £199"],
    deliveryFree: true,
    energyRating: "G",
    energyLabelUrl: null,
    ...overrides,
  } as CategoryProduct;
}

const samsungTV = makeProduct();
const lgTV = makeProduct({
  name: 'LG OLED55C46LA 55" Smart 4K Ultra HD HDR OLED TV 2024',
  brand: "LG",
  price: { current: 1099, was: 1299, savings: 200 },
  rating: { average: 4.9, count: 89 },
  specs: ["55 inch screen", "4K Ultra HD", "120Hz refresh rate", "HDMI 2.1 x 4"],
  badges: [],
  energyRating: "E",
});
const cheapTV = makeProduct({
  name: 'HISENSE 40A4KTUK 40" Smart Full HD LED TV',
  brand: "HISENSE",
  price: { current: 199, was: null, savings: null },
  rating: { average: 4.2, count: 312 },
  specs: ["40 inch screen", "Full HD", "60Hz refresh rate", "HDMI x 2"],
  badges: [],
  energyRating: "F",
});
const miniLedTV = makeProduct({
  name: 'SAMSUNG QE65QN85DBTXXU 65" Smart 4K Ultra HD HDR Neo QLED Mini LED TV',
  brand: "SAMSUNG",
  price: { current: 1299, was: null, savings: null },
  specs: ["65 inch screen", "4K Ultra HD", "120Hz refresh rate"],
  badges: ["Loved by Electriz"],
  energyRating: "E",
});

const allProducts = [samsungTV, lgTV, cheapTV, miniLedTV];

// ===========================
// doesProductMatchFilter tests
// ===========================

describe("doesProductMatchFilter", () => {
  describe("Brand filter", () => {
    it("matches exact brand (case-insensitive)", () => {
      expect(doesProductMatchFilter(samsungTV, "Brand", "Samsung")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Brand", "SAMSUNG")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Brand", "samsung")).toBe(true);
    });

    it("rejects non-matching brand", () => {
      expect(doesProductMatchFilter(samsungTV, "Brand", "LG")).toBe(false);
    });
  });

  describe("Price filter", () => {
    it("matches 'Up to' range", () => {
      expect(doesProductMatchFilter(cheapTV, "Price", "Up to £299")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Price", "Up to £299")).toBe(false);
    });

    it("matches 'and above' range", () => {
      expect(doesProductMatchFilter(lgTV, "Price", "£1,000 and above")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Price", "£1,000 and above")).toBe(false);
    });

    it("matches min-max range with £ signs", () => {
      expect(doesProductMatchFilter(samsungTV, "Price", "£500 to £999")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Price", "£500 to £999")).toBe(false);
    });

    it("includes boundaries (inclusive range)", () => {
      expect(doesProductMatchFilter(samsungTV, "Price", "£799 to £799")).toBe(true);
    });

    it("handles comma-separated thousands", () => {
      expect(doesProductMatchFilter(lgTV, "Price", "£1,000 to £1,500")).toBe(true);
    });
  });

  describe("Customer Rating filter", () => {
    it("matches products at or above threshold", () => {
      expect(doesProductMatchFilter(lgTV, "Customer Rating", "4")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Customer Rating", "4")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Customer Rating", "5")).toBe(false);
    });
  });

  describe("Screen Size filter", () => {
    it("matches size range", () => {
      expect(doesProductMatchFilter(samsungTV, "Screen Size", '50" - 59"')).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Screen Size", '50" - 59"')).toBe(false);
    });

    it("matches 'or more' range", () => {
      expect(doesProductMatchFilter(miniLedTV, "Screen Size", '65" or more')).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Screen Size", '65" or more')).toBe(false);
    });

    it("extracts size from product name correctly", () => {
      expect(doesProductMatchFilter(cheapTV, "Screen Size", '32" - 43"')).toBe(true);
    });
  });

  describe("Screen technology filter", () => {
    it("matches QLED without matching OLED or Mini LED", () => {
      expect(doesProductMatchFilter(samsungTV, "Screen technology", "QLED")).toBe(true);
      expect(doesProductMatchFilter(lgTV, "Screen technology", "QLED")).toBe(false);
    });

    it("matches OLED", () => {
      expect(doesProductMatchFilter(lgTV, "Screen technology", "OLED")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Screen technology", "OLED")).toBe(false);
    });

    it("matches LED without matching OLED/QLED/Mini LED", () => {
      expect(doesProductMatchFilter(cheapTV, "Screen technology", "LED")).toBe(true);
      expect(doesProductMatchFilter(lgTV, "Screen technology", "LED")).toBe(false);
      expect(doesProductMatchFilter(samsungTV, "Screen technology", "LED")).toBe(false);
    });

    it("matches Mini LED", () => {
      expect(doesProductMatchFilter(miniLedTV, "Screen technology", "Mini LED")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Screen technology", "Mini LED")).toBe(false);
    });
  });

  describe("Resolution filter", () => {
    it("matches 4K", () => {
      expect(doesProductMatchFilter(samsungTV, "Resolution", "4K Ultra HD")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Resolution", "4K Ultra HD")).toBe(false);
    });

    it("matches Full HD", () => {
      expect(doesProductMatchFilter(cheapTV, "Resolution", "Full HD")).toBe(true);
    });
  });

  describe("Refresh rate filter", () => {
    it("matches Hz value in specs", () => {
      expect(doesProductMatchFilter(samsungTV, "Refresh rate", "120 Hz")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Refresh rate", "120 Hz")).toBe(false);
      expect(doesProductMatchFilter(cheapTV, "Refresh rate", "60 Hz")).toBe(true);
    });
  });

  describe("Number of HDMI Ports filter", () => {
    it("matches HDMI port count from specs", () => {
      expect(doesProductMatchFilter(samsungTV, "Number of HDMI Ports", "4")).toBe(true);
      expect(doesProductMatchFilter(cheapTV, "Number of HDMI Ports", "4")).toBe(false);
      expect(doesProductMatchFilter(cheapTV, "Number of HDMI Ports", "2")).toBe(true);
    });
  });

  describe("Year filter", () => {
    it("matches year in product name", () => {
      expect(doesProductMatchFilter(samsungTV, "Year", "2024")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Year", "2023")).toBe(false);
    });
  });

  describe("Energy rating filter", () => {
    it("matches exact rating letter (case-insensitive)", () => {
      expect(doesProductMatchFilter(samsungTV, "Energy rating", "G")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Energy rating", "g")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Energy rating", "E")).toBe(false);
    });

    it("returns false for products without energy rating", () => {
      const noRating = makeProduct({ energyRating: null });
      expect(doesProductMatchFilter(noRating, "Energy rating", "G")).toBe(false);
    });
  });

  describe("Loved by brand filter", () => {
    it("matches products with 'loved by' badge", () => {
      expect(doesProductMatchFilter(samsungTV, "Loved by Electriz", "Yes")).toBe(true);
      expect(doesProductMatchFilter(lgTV, "Loved by Electriz", "Yes")).toBe(false);
    });
  });

  describe("Guarantee filter", () => {
    it("matches guarantee text in specs", () => {
      expect(doesProductMatchFilter(samsungTV, "Guarantee", "2 year guarantee")).toBe(true);
      expect(doesProductMatchFilter(lgTV, "Guarantee", "2 year guarantee")).toBe(false);
    });
  });

  describe("Generic text filter", () => {
    it("matches text in name + specs + badges", () => {
      expect(doesProductMatchFilter(samsungTV, "Type", "QLED")).toBe(true);
      expect(doesProductMatchFilter(samsungTV, "Colour", "Black")).toBe(false);
    });
  });
});

// ===========================
// filterProducts tests
// ===========================

describe("filterProducts", () => {
  it("returns all products with no active filters", () => {
    expect(filterProducts(allProducts, {})).toHaveLength(4);
  });

  it("filters by single brand", () => {
    const result = filterProducts(allProducts, { Brand: ["Samsung"] });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.brand === "SAMSUNG")).toBe(true);
  });

  it("filters by multiple brands (OR logic within group)", () => {
    const result = filterProducts(allProducts, { Brand: ["Samsung", "LG"] });
    expect(result).toHaveLength(3);
  });

  it("applies AND logic across groups", () => {
    const result = filterProducts(allProducts, {
      Brand: ["Samsung"],
      "Screen Size": ['55" - 59"'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(samsungTV.name);
  });

  it("skips _hideOutOfStock filter", () => {
    expect(filterProducts(allProducts, { _hideOutOfStock: ["true"] })).toHaveLength(4);
  });

  it("skips Availability filter", () => {
    expect(filterProducts(allProducts, { Availability: ["In stock"] })).toHaveLength(4);
  });

  it("handles empty values array gracefully", () => {
    expect(filterProducts(allProducts, { Brand: [] })).toHaveLength(4);
  });

  it("returns empty array when no products match", () => {
    expect(filterProducts(allProducts, { Brand: ["Sony"] })).toHaveLength(0);
  });

  it("handles complex multi-filter scenario", () => {
    const result = filterProducts(allProducts, {
      "Customer Rating": ["4"],
      Price: ["£500 to £1,500"],
      "Screen technology": ["QLED"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe("SAMSUNG");
    expect(result[0].price.current).toBe(799);
  });
});
