import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { doesProductMatchFilter, filterProducts } = await import("../.test-build/lib/filter-utils.js");

// --- Test fixtures ---

function makeProduct(overrides = {}) {
  return {
    name: 'SAMSUNG QE55Q80DATXXU 55" Smart 4K Ultra HD HDR QLED TV with Bixby & Alexa 2024',
    brand: "SAMSUNG",
    price: { current: 799, was: 999, savings: 200 },
    rating: { average: 4.7, count: 247 },
    url: "/products/samsung-qe55q80datxxu",
    imageUrl: "/images/products/10267890/main.webp",
    productId: "10267890",
    specs: ["55 inch screen", "4K Ultra HD", "120Hz refresh rate", "HDMI 2.1 x 4", "2 year guarantee"],
    badges: ["Loved by Electriz", "Epic Deal"],
    offers: ["Free soundbar worth £199"],
    deliveryFree: true,
    energyRating: "G",
    energyLabelUrl: null,
    ...overrides,
  };
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
      assert.equal(doesProductMatchFilter(samsungTV, "Brand", "Samsung"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Brand", "SAMSUNG"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Brand", "samsung"), true);
    });
    it("rejects non-matching brand", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Brand", "LG"), false);
    });
  });

  describe("Price filter", () => {
    it("matches 'Up to' range", () => {
      assert.equal(doesProductMatchFilter(cheapTV, "Price", "Up to £299"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Price", "Up to £299"), false);
    });
    it("matches 'and above' range", () => {
      assert.equal(doesProductMatchFilter(lgTV, "Price", "£1,000 and above"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Price", "£1,000 and above"), false);
    });
    it("matches min-max range with £ signs", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Price", "£500 to £999"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Price", "£500 to £999"), false);
    });
    it("includes boundaries (inclusive range)", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Price", "£799 to £799"), true);
    });
    it("handles comma-separated thousands", () => {
      assert.equal(doesProductMatchFilter(lgTV, "Price", "£1,000 to £1,500"), true);
    });
  });

  describe("Customer Rating filter", () => {
    it("matches products at or above threshold", () => {
      assert.equal(doesProductMatchFilter(lgTV, "Customer Rating", "4"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Customer Rating", "4"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Customer Rating", "5"), false);
    });
  });

  describe("Screen Size filter", () => {
    it("matches size range", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Screen Size", '50" - 59"'), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Screen Size", '50" - 59"'), false);
    });
    it("matches 'or more' range", () => {
      assert.equal(doesProductMatchFilter(miniLedTV, "Screen Size", '65" or more'), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Screen Size", '65" or more'), false);
    });
    it("extracts size from product name correctly", () => {
      assert.equal(doesProductMatchFilter(cheapTV, "Screen Size", '32" - 43"'), true);
    });
  });

  describe("Screen technology filter", () => {
    it("matches QLED without matching OLED or Mini LED", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Screen technology", "QLED"), true);
      assert.equal(doesProductMatchFilter(lgTV, "Screen technology", "QLED"), false);
    });
    it("matches OLED", () => {
      assert.equal(doesProductMatchFilter(lgTV, "Screen technology", "OLED"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Screen technology", "OLED"), false);
    });
    it("matches LED without matching OLED/QLED/Mini LED", () => {
      assert.equal(doesProductMatchFilter(cheapTV, "Screen technology", "LED"), true);
      assert.equal(doesProductMatchFilter(lgTV, "Screen technology", "LED"), false);
      assert.equal(doesProductMatchFilter(samsungTV, "Screen technology", "LED"), false);
    });
    it("matches Mini LED", () => {
      assert.equal(doesProductMatchFilter(miniLedTV, "Screen technology", "Mini LED"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Screen technology", "Mini LED"), false);
    });
  });

  describe("Resolution filter", () => {
    it("matches 4K", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Resolution", "4K Ultra HD"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Resolution", "4K Ultra HD"), false);
    });
    it("matches Full HD", () => {
      assert.equal(doesProductMatchFilter(cheapTV, "Resolution", "Full HD"), true);
    });
  });

  describe("Refresh rate filter", () => {
    it("matches Hz value in specs", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Refresh rate", "120 Hz"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Refresh rate", "120 Hz"), false);
      assert.equal(doesProductMatchFilter(cheapTV, "Refresh rate", "60 Hz"), true);
    });
  });

  describe("Number of HDMI Ports filter", () => {
    it("matches HDMI port count from specs", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Number of HDMI Ports", "4"), true);
      assert.equal(doesProductMatchFilter(cheapTV, "Number of HDMI Ports", "4"), false);
      assert.equal(doesProductMatchFilter(cheapTV, "Number of HDMI Ports", "2"), true);
    });
  });

  describe("Year filter", () => {
    it("matches year in product name", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Year", "2024"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Year", "2023"), false);
    });
  });

  describe("Energy rating filter", () => {
    it("matches exact rating letter (case-insensitive)", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Energy rating", "G"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Energy rating", "g"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Energy rating", "E"), false);
    });
    it("returns false for products without energy rating", () => {
      const noRating = makeProduct({ energyRating: null });
      assert.equal(doesProductMatchFilter(noRating, "Energy rating", "G"), false);
    });
  });

  describe("Loved by brand filter", () => {
    it("matches products with 'loved by' badge", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Loved by Electriz", "Yes"), true);
      assert.equal(doesProductMatchFilter(lgTV, "Loved by Electriz", "Yes"), false);
    });
  });

  describe("Guarantee filter", () => {
    it("matches guarantee text in specs", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Guarantee", "2 year guarantee"), true);
      assert.equal(doesProductMatchFilter(lgTV, "Guarantee", "2 year guarantee"), false);
    });
  });

  describe("Generic text filter", () => {
    it("matches text in name + specs + badges", () => {
      assert.equal(doesProductMatchFilter(samsungTV, "Type", "QLED"), true);
      assert.equal(doesProductMatchFilter(samsungTV, "Colour", "Black"), false);
    });
  });
});

// ===========================
// filterProducts tests
// ===========================

describe("filterProducts", () => {
  it("returns all products with no active filters", () => {
    assert.equal(filterProducts(allProducts, {}).length, 4);
  });

  it("filters by single brand", () => {
    const result = filterProducts(allProducts, { Brand: ["Samsung"] });
    assert.equal(result.length, 2);
    assert.ok(result.every(p => p.brand === "SAMSUNG"));
  });

  it("filters by multiple brands (OR logic within group)", () => {
    const result = filterProducts(allProducts, { Brand: ["Samsung", "LG"] });
    assert.equal(result.length, 3);
  });

  it("applies AND logic across groups", () => {
    const result = filterProducts(allProducts, {
      Brand: ["Samsung"],
      "Screen Size": ['55" - 59"'],
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].name, samsungTV.name);
  });

  it("skips _hideOutOfStock filter", () => {
    assert.equal(filterProducts(allProducts, { _hideOutOfStock: ["true"] }).length, 4);
  });

  it("skips Availability filter", () => {
    assert.equal(filterProducts(allProducts, { Availability: ["In stock"] }).length, 4);
  });

  it("handles empty values array gracefully", () => {
    assert.equal(filterProducts(allProducts, { Brand: [] }).length, 4);
  });

  it("returns empty array when no products match", () => {
    assert.equal(filterProducts(allProducts, { Brand: ["Sony"] }).length, 0);
  });

  it("handles complex multi-filter scenario", () => {
    const result = filterProducts(allProducts, {
      "Customer Rating": ["4"],
      Price: ["£500 to £1,500"],
      "Screen technology": ["QLED"],
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].brand, "SAMSUNG");
    assert.equal(result[0].price.current, 799);
  });
});
