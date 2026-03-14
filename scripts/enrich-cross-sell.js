#!/usr/bin/env node
/**
 * enrich-cross-sell.js — Stage 2: Normalize & Validate
 *
 * Input:  data/intermediate/cross-sell-raw.json
 * Output: data/intermediate/cross-sell-normalized.json
 *
 * Responsibilities:
 *   1. Parse price/rating text → numbers
 *   2. Deduplicate cross-sell items per product
 *   3. Convert CDN image URLs to local paths
 *   4. Match cross-sell products to local catalog (URL → ID → title)
 *   5. Validate schema (title + price required)
 *   6. Normalize bundle data
 *
 * Usage:
 *   node scripts/enrich-cross-sell.js
 *   node scripts/enrich-cross-sell.js --dry-run
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INTERMEDIATE_DIR = path.join(ROOT, "data", "intermediate");
const RAW_FILE = path.join(INTERMEDIATE_DIR, "cross-sell-raw.json");
const OUTPUT_FILE = path.join(INTERMEDIATE_DIR, "cross-sell-normalized.json");
const PRODUCTS_DIR = path.join(ROOT, "data", "scrape", "products");
const CATEGORY_DIR = path.join(ROOT, "data", "scrape");
const IMAGES_DIR = path.join(ROOT, "public", "images", "products");

// ─── Price/Rating Parsers ───

function parsePrice(text) {
  if (!text || typeof text !== "string") return null;
  // Strip £, commas, parenthetical dates, "Was", "Total:", "from"
  const cleaned = text
    .replace(/Was\s*/i, "")
    .replace(/Total:\s*/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[£,]/g, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseSavings(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/£?([\d,]+\.?\d*)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

function parseRating(text) {
  if (!text || typeof text !== "string") return null;
  // Handles: "4.5 out of 5 stars", "4.5/5", "4.50", "4.5"
  const match = text.match(/([\d.]+)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) || num < 0 || num > 5 ? null : num;
}

function parseReviewCount(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/([\d,]+)/);
  if (!match) return null;
  const num = parseInt(match[1].replace(/,/g, ""), 10);
  return isNaN(num) ? null : num;
}

// ─── Image Conversion ───

function toLocalImage(cdnUrl) {
  if (!cdnUrl) return "";
  // Extract product ID from CDN URL
  const match = cdnUrl.match(
    /(?:currysprod|electrizprod)\/M?(\d{7,8})(?:_[a-zA-Z]+)?(?:_(\d{3}))?\?/
  );
  if (!match) return "";
  const productId = match[1];
  return `/images/products/${productId}/main.webp`;
}

function imageExistsLocally(localPath) {
  if (!localPath || !localPath.startsWith("/images/products/")) return false;
  const fullPath = path.join(ROOT, "public", localPath);
  return fs.existsSync(fullPath);
}

// ─── Catalog Building ───

function buildCatalog() {
  const catalog = {
    byId: new Map(),     // productId → { title, price, category, url }
    byTitle: new Map(),  // normalized title → productId
  };

  // Load category files for URL/ID data
  const catFiles = fs
    .readdirSync(CATEGORY_DIR)
    .filter((f) => f.startsWith("category-") && f.endsWith(".json"));
  for (const cf of catFiles) {
    const cat = JSON.parse(fs.readFileSync(path.join(CATEGORY_DIR, cf), "utf8"));
    for (const p of cat.products || []) {
      if (p.productId) {
        catalog.byId.set(p.productId, {
          title: p.name,
          price: p.price?.current || p.price,
          category: cat.categoryName,
          url: p.url || "",
        });
        if (p.name) {
          catalog.byTitle.set(normalizeTitle(p.name), p.productId);
        }
      }
    }
  }

  // Load individual product files for richer data
  const productFiles = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith(".json"));
  for (const pf of productFiles) {
    const id = pf.replace(".json", "");
    if (catalog.byId.has(id)) continue;
    try {
      const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, pf), "utf8"));
      const name = p.title || p.name || "";
      if (name) {
        catalog.byId.set(id, {
          title: name,
          price: p.price?.current || p.price,
          category: p.category || "unknown",
          url: p.url || "",
        });
        catalog.byTitle.set(normalizeTitle(name), id);
      }
    } catch { /* skip malformed */ }
  }

  return catalog;
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[''""]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Catalog Matching ───

function extractProductIdFromUrl(url) {
  if (!url || url === "#" || url.endsWith("#")) return null;
  // Pattern: /products/{slug}-{8-digit-id}.html
  const match = url.match(/(\d{8})\.html/);
  return match ? match[1] : null;
}

function extractProductIdFromImage(imageUrl) {
  if (!imageUrl) return null;
  const match = imageUrl.match(/(?:currysprod|electrizprod)\/M?(\d{7,8})/);
  return match ? match[1] : null;
}

function matchToCatalog(item, catalog) {
  // Priority 1: Extract product ID from URL
  const urlId = extractProductIdFromUrl(item.productUrl);
  if (urlId && catalog.byId.has(urlId)) {
    return { matched: true, productId: urlId, method: "url" };
  }

  // Priority 2: Extract product ID from image URL
  const imageId = extractProductIdFromImage(item.imageUrl);
  if (imageId && catalog.byId.has(imageId)) {
    return { matched: true, productId: imageId, method: "image" };
  }

  // Priority 3: Normalized title match
  const normTitle = normalizeTitle(item.productName || "");
  if (normTitle && catalog.byTitle.has(normTitle)) {
    return {
      matched: true,
      productId: catalog.byTitle.get(normTitle),
      method: "title",
    };
  }

  return { matched: false, productId: null, method: "none" };
}

// ─── Deduplication ───

function dedupeKey(item) {
  // Use matched product ID if available, otherwise normalized title
  const imageId = extractProductIdFromImage(item.imageUrl);
  if (imageId) return imageId;
  return normalizeTitle(item.productName || "");
}

function deduplicateItems(items) {
  const seen = new Map();
  const result = [];
  for (const item of items) {
    const key = dedupeKey(item);
    if (!key || seen.has(key)) continue;
    seen.set(key, true);
    result.push(item);
  }
  return result;
}

// ─── Bundle Validation ───

function validateBundle(raw, mainProductId) {
  if (!raw) return null;

  // Handle both field naming conventions (totalPrice vs totalPriceText)
  const totalPrice = parsePrice(raw.totalPrice || raw.totalPriceText);
  const savings = parseSavings(raw.savings || raw.savingsText);
  const items = raw.items || [];

  // Reject: unparsable total price
  if (totalPrice === null || totalPrice <= 0) {
    return { valid: false, reason: "unparsable_total_price", data: null };
  }

  // Reject: fewer than 2 items
  if (items.length < 2) {
    return { valid: false, reason: "fewer_than_2_items", data: null };
  }

  // Reject: any empty item title
  if (items.some((t) => !t || !t.trim())) {
    return { valid: false, reason: "empty_item_title", data: null };
  }

  return {
    valid: true,
    reason: null,
    data: {
      title: raw.title || "Buy together and save",
      items: items,
      totalPrice: totalPrice,
      savings: savings || 0,
    },
  };
}

// ─── Main Enrichment ───

function enrichAll(dryRun) {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Raw file not found: ${RAW_FILE}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));
  const catalog = buildCatalog();

  console.log(`Catalog loaded: ${catalog.byId.size} products, ${catalog.byTitle.size} titles`);
  console.log(`Raw data: ${Object.keys(raw.products).length} products to enrich`);

  const output = {
    meta: {
      enrichVersion: 1,
      enrichedAt: new Date().toISOString(),
      sourceFile: "cross-sell-raw.json",
      totalProducts: 0,
      totalRawItems: 0,
      totalNormalized: 0,
      totalRejected: 0,
      withCatalogMatch: 0,
      withLocalImage: 0,
      withRating: 0,
      withBundle: 0,
      rejectedBundles: 0,
      matchMethods: { url: 0, image: 0, title: 0, none: 0 },
      rejectionReasons: {},
    },
    products: {},
    rejected: [],
  };

  for (const [productId, productData] of Object.entries(raw.products)) {
    const rawItems = productData.crossSellItems || [];
    output.meta.totalProducts++;
    output.meta.totalRawItems += rawItems.length;

    // Deduplicate
    const deduped = deduplicateItems(rawItems);

    const normalized = [];
    for (const item of deduped) {
      const price = parsePrice(item.priceText);
      const title = (item.productName || "").trim();

      // Hard fail: missing title or price
      if (!title) {
        output.meta.totalRejected++;
        const reason = "missing_title";
        output.meta.rejectionReasons[reason] =
          (output.meta.rejectionReasons[reason] || 0) + 1;
        output.rejected.push({ productId, item, reason });
        continue;
      }
      if (price === null || price <= 0) {
        output.meta.totalRejected++;
        const reason = "missing_or_invalid_price";
        output.meta.rejectionReasons[reason] =
          (output.meta.rejectionReasons[reason] || 0) + 1;
        output.rejected.push({ productId, item, reason });
        continue;
      }

      // Parse remaining fields
      const wasPrice = parsePrice(item.wasPriceText);
      const savings = parseSavings(item.savingsText);
      const rating = parseRating(item.ratingText);
      const reviewCount = parseReviewCount(item.reviewCountText);
      const localImage = toLocalImage(item.imageUrl);
      const badge = item.badgeText && item.badgeText.trim() ? item.badgeText.trim() : null;

      // Catalog matching
      const match = matchToCatalog(item, catalog);
      output.meta.matchMethods[match.method]++;

      if (match.matched) output.meta.withCatalogMatch++;
      if (localImage && imageExistsLocally(localImage)) output.meta.withLocalImage++;
      if (rating !== null) output.meta.withRating++;

      normalized.push({
        category: (item.categoryLabel || "").trim() || "Accessories",
        title,
        price,
        wasPrice: wasPrice || null,
        savings: savings || null,
        rating,
        reviewCount,
        image: localImage || "",
        badge,
        catalogMatch: match.matched,
        catalogProductId: match.productId,
        matchMethod: match.method,
      });
    }

    output.meta.totalNormalized += normalized.length;

    // Bundle validation
    const bundleResult = validateBundle(productData.bundleDeal, productId);
    let bundle = null;
    if (bundleResult && bundleResult.valid) {
      bundle = bundleResult.data;
      output.meta.withBundle++;
    } else if (bundleResult && !bundleResult.valid) {
      output.meta.rejectedBundles++;
    }

    output.products[productId] = {
      crossSellProducts: normalized,
      bundleDeal: bundle,
      sourceUrl: productData.sourceUrl || "",
    };
  }

  // Print quality report
  console.log("\n=== Enrichment Quality Report ===");
  console.log(`Products processed:   ${output.meta.totalProducts}`);
  console.log(`Raw items:            ${output.meta.totalRawItems}`);
  console.log(`Normalized items:     ${output.meta.totalNormalized}`);
  console.log(`Rejected items:       ${output.meta.totalRejected}`);
  console.log(`With catalog match:   ${output.meta.withCatalogMatch} (${pct(output.meta.withCatalogMatch, output.meta.totalNormalized)})`);
  console.log(`With local image:     ${output.meta.withLocalImage} (${pct(output.meta.withLocalImage, output.meta.totalNormalized)})`);
  console.log(`With rating:          ${output.meta.withRating} (${pct(output.meta.withRating, output.meta.totalNormalized)})`);
  console.log(`With valid bundle:    ${output.meta.withBundle} (${pct(output.meta.withBundle, output.meta.totalProducts)})`);
  console.log(`Rejected bundles:     ${output.meta.rejectedBundles}`);
  console.log(`\nMatch methods:`);
  for (const [method, count] of Object.entries(output.meta.matchMethods)) {
    if (count > 0) console.log(`  ${method}: ${count}`);
  }
  if (Object.keys(output.meta.rejectionReasons).length > 0) {
    console.log(`\nRejection reasons:`);
    for (const [reason, count] of Object.entries(output.meta.rejectionReasons)) {
      console.log(`  ${reason}: ${count}`);
    }
  }

  if (!dryRun) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`\nWritten to: ${OUTPUT_FILE}`);
  } else {
    console.log("\n[DRY RUN] No file written.");
  }
}

function pct(a, b) {
  if (b === 0) return "0%";
  return ((a / b) * 100).toFixed(1) + "%";
}

// ─── CLI ───
const dryRun = process.argv.includes("--dry-run");
enrichAll(dryRun);
