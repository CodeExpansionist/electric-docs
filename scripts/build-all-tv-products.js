#!/usr/bin/env node

/**
 * build-all-tv-products.js
 *
 * Merges TV product data from three sources:
 *   1. /tmp/all-extracted-products.json   (fully extracted product data)
 *   2. /tmp/tv-product-ids.json           (all discovered TV product IDs + URLs)
 *   3. data/scrape/category-tvs.json      (existing products already in the data file)
 *
 * Priority: extracted data > existing category-tvs data > basic stub from URL parsing.
 * Output: updated category-tvs.json with the merged, deduplicated, sorted product list.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const EXTRACTED_PATH = path.resolve(__dirname, "../data/tmp/all-extracted-products.json");
const TV_IDS_PATH = path.resolve(__dirname, "../data/tmp/tv-product-ids.json");
const CATEGORY_TVS_PATH = path.resolve(
  __dirname,
  "../data/scrape/category-tvs.json"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the numeric product ID from a Currys product URL or slug. */
function extractProductId(urlOrSlug) {
  const match = urlOrSlug.match(/(\d{7,8})(?:\.html)?$/);
  return match ? match[1] : null;
}

/** Known brand tokens that can appear at the start of a slug. */
const KNOWN_BRANDS = [
  "samsung",
  "lg",
  "hisense",
  "sony",
  "toshiba",
  "jvc",
  "panasonic",
  "philips",
  "sharp",
  "tcl",
  "logik",
];

/**
 * Parse a brand name from a product slug.
 * The slug typically starts with the brand, e.g. "samsung-ue55au7100-55-smart-4k-...".
 */
function parseBrandFromSlug(slug) {
  const lower = slug.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.startsWith(brand + "-")) {
      return brand.toUpperCase();
    }
  }
  // Fallback: use the first token before the first dash that looks like a model number
  const first = slug.split("-")[0];
  return first ? first.toUpperCase() : "UNKNOWN";
}

/**
 * Parse a human-readable product name from a slug.
 * Removes the trailing product-id.html and converts hyphens to spaces with
 * title-casing.
 */
function parseNameFromSlug(slug) {
  // Strip trailing "-10274389.html"
  let cleaned = slug.replace(/-\d{7,8}\.html$/, "");
  // Replace hyphens with spaces
  cleaned = cleaned.replace(/-/g, " ");
  // Title-case each word, but keep known uppercase tokens
  const upperTokens = new Set([
    "tv",
    "hd",
    "hdr",
    "led",
    "oled",
    "qled",
    "uhd",
    "ai",
    "lg",
    "jvc",
    "tcl",
    "4k",
    "8k",
    "usb",
    "dvb",
    "neo",
  ]);
  const words = cleaned.split(" ").map((w) => {
    if (upperTokens.has(w.toLowerCase())) {
      return w.toUpperCase();
    }
    // Keep model numbers (contain digits) as uppercase
    if (/\d/.test(w)) {
      return w.toUpperCase();
    }
    // Normal title case
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  return words.join(" ");
}

/**
 * Build a basic (stub) product entry from a product-id record.
 */
function buildBasicProduct(idRecord) {
  const { productId, productUrl, slug } = idRecord;
  const brand = parseBrandFromSlug(slug);
  const name = parseNameFromSlug(slug);
  const imageUrl = `https://media.electriz.biz/i/electrizprod/${productId}?$g-small$&fmt=auto`;

  return {
    name,
    brand,
    price: 0,
    wasPrice: null,
    savings: 0,
    rating: 0,
    reviewCount: 0,
    imageUrl,
    productUrl,
    badges: [],
    deliveryFree: true,
    specs: [],
    energyRating: null,
    offers: [],
  };
}

/**
 * Normalise a product object so it has a consistent shape matching the
 * category-tvs.json format.
 */
function normaliseProduct(p) {
  return {
    name: p.name || "",
    brand: (p.brand || "UNKNOWN").toUpperCase(),
    price: typeof p.price === "number" ? p.price : 0,
    wasPrice: p.wasPrice && p.wasPrice > 0 ? p.wasPrice : null,
    savings: typeof p.savings === "number" ? p.savings : 0,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : 0,
    imageUrl: p.imageUrl || "",
    productUrl: p.productUrl || "",
    badges: Array.isArray(p.badges) ? p.badges : [],
    deliveryFree: p.deliveryFree !== undefined ? p.deliveryFree : true,
    specs: Array.isArray(p.specs) ? p.specs : [],
    energyRating: p.energyRating || null,
    offers: Array.isArray(p.offers) ? p.offers : [],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("=== Build All TV Products ===\n");

  // 1. Load sources
  console.log("Loading data sources...");

  let extractedProducts = [];
  try {
    extractedProducts = JSON.parse(fs.readFileSync(EXTRACTED_PATH, "utf-8"));
    console.log(
      `  Extracted products (all-extracted-products.json): ${extractedProducts.length}`
    );
  } catch (err) {
    console.warn(`  WARNING: Could not load ${EXTRACTED_PATH}: ${err.message}`);
  }

  let tvProductIds = {};
  try {
    tvProductIds = JSON.parse(fs.readFileSync(TV_IDS_PATH, "utf-8"));
    console.log(
      `  TV product IDs (tv-product-ids.json): ${Object.keys(tvProductIds).length}`
    );
  } catch (err) {
    console.warn(`  WARNING: Could not load ${TV_IDS_PATH}: ${err.message}`);
  }

  let categoryData = {};
  let existingProducts = [];
  try {
    categoryData = JSON.parse(fs.readFileSync(CATEGORY_TVS_PATH, "utf-8"));
    existingProducts = categoryData.products || [];
    console.log(
      `  Existing category-tvs.json products: ${existingProducts.length}`
    );
  } catch (err) {
    console.warn(
      `  WARNING: Could not load ${CATEGORY_TVS_PATH}: ${err.message}`
    );
  }

  // 2. Index extracted products by product ID
  const extractedById = new Map();
  for (const p of extractedProducts) {
    const id = extractProductId(p.productUrl);
    if (id) {
      extractedById.set(id, p);
    }
  }
  console.log(
    `  Extracted products matched to IDs: ${extractedById.size}`
  );

  // 3. Index existing category-tvs products by product ID
  const existingById = new Map();
  for (const p of existingProducts) {
    const id = extractProductId(p.productUrl);
    if (id) {
      existingById.set(id, p);
    }
  }
  console.log(
    `  Existing category products matched to IDs: ${existingById.size}`
  );

  // 4. Collect all unique product IDs from all three sources
  const allIds = new Set();

  // From tv-product-ids.json
  for (const id of Object.keys(tvProductIds)) {
    allIds.add(id);
  }

  // From extracted products
  for (const id of extractedById.keys()) {
    allIds.add(id);
  }

  // From existing category products
  for (const id of existingById.keys()) {
    allIds.add(id);
  }

  console.log(`\n  Total unique product IDs across all sources: ${allIds.size}`);

  // 5. Merge: priority is extracted > existing > basic stub
  const mergedProducts = [];
  let countFull = 0;
  let countExisting = 0;
  let countBasic = 0;

  for (const id of allIds) {
    let product;

    if (extractedById.has(id)) {
      // Full extracted data -- highest priority
      product = normaliseProduct(extractedById.get(id));
      countFull++;
    } else if (existingById.has(id)) {
      // Already in category-tvs.json
      product = normaliseProduct(existingById.get(id));
      countExisting++;
    } else if (tvProductIds[id]) {
      // Only have the URL / slug -- build a stub
      product = buildBasicProduct(tvProductIds[id]);
      countBasic++;
    } else {
      // Should not happen, but just in case
      continue;
    }

    mergedProducts.push(product);
  }

  // 6. Sort by brand (alphabetical) then price (ascending)
  mergedProducts.sort((a, b) => {
    const brandCmp = a.brand.localeCompare(b.brand);
    if (brandCmp !== 0) return brandCmp;
    return a.price - b.price;
  });

  // 7. Update category-tvs.json -- preserve all metadata, replace products
  categoryData.products = mergedProducts;
  categoryData.totalProducts = mergedProducts.length;

  fs.writeFileSync(CATEGORY_TVS_PATH, JSON.stringify(categoryData, null, 2), "utf-8");

  // 8. Print summary
  console.log("\n=== Merge Summary ===\n");
  console.log(`Total products in updated category-tvs.json: ${mergedProducts.length}`);
  console.log(`  - From full extraction:    ${countFull}`);
  console.log(`  - From existing data:      ${countExisting}`);
  console.log(`  - Basic stubs (URL only):  ${countBasic}`);

  // Products by brand
  const brandCounts = {};
  for (const p of mergedProducts) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  }

  const sortedBrands = Object.entries(brandCounts).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  console.log("\nProducts by brand:");
  for (const [brand, count] of sortedBrands) {
    const bar = "#".repeat(Math.min(count, 40));
    console.log(`  ${brand.padEnd(12)} ${String(count).padStart(3)}  ${bar}`);
  }

  // Price range stats for products with prices
  const priced = mergedProducts.filter((p) => p.price > 0);
  if (priced.length > 0) {
    const prices = priced.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    console.log(`\nPrice range: £${minPrice} - £${maxPrice} (avg: £${avgPrice})`);
    console.log(`Products with price data: ${priced.length} / ${mergedProducts.length}`);
  }

  // Data completeness
  const withRating = mergedProducts.filter((p) => p.rating > 0).length;
  const withSpecs = mergedProducts.filter((p) => p.specs.length > 0).length;
  const withBadges = mergedProducts.filter((p) => p.badges.length > 0).length;
  const withEnergy = mergedProducts.filter((p) => p.energyRating !== null).length;
  const withSavings = mergedProducts.filter((p) => p.savings > 0).length;

  console.log("\nData completeness:");
  console.log(`  With ratings:      ${withRating} / ${mergedProducts.length}`);
  console.log(`  With specs:        ${withSpecs} / ${mergedProducts.length}`);
  console.log(`  With badges:       ${withBadges} / ${mergedProducts.length}`);
  console.log(`  With energy rating:${withEnergy} / ${mergedProducts.length}`);
  console.log(`  With savings:      ${withSavings} / ${mergedProducts.length}`);

  console.log("\nDone. Updated:", CATEGORY_TVS_PATH);
}

main();
