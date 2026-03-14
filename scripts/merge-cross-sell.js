#!/usr/bin/env node
/**
 * merge-cross-sell.js — Stage 3: Write to Product JSONs
 *
 * Input:  data/intermediate/cross-sell-normalized.json
 * Output: Updated data/scrape/products/{id}.json files
 *
 * Responsibilities:
 *   1. Read normalized cross-sell data for each product
 *   2. Replace crossSellProducts array wholesale (never append)
 *   3. Replace bundleDeals only when incoming data is schema-valid
 *   4. Preserve all other product fields untouched
 *
 * Idempotent: rerunning from the same input produces identical output.
 *
 * Usage:
 *   node scripts/merge-cross-sell.js
 *   node scripts/merge-cross-sell.js --dry-run
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NORMALIZED_FILE = path.join(
  ROOT,
  "data",
  "intermediate",
  "cross-sell-normalized.json"
);
const PRODUCTS_DIR = path.join(ROOT, "data", "scrape", "products");

function merge(dryRun) {
  if (!fs.existsSync(NORMALIZED_FILE)) {
    console.error(`Normalized file not found: ${NORMALIZED_FILE}`);
    process.exit(1);
  }

  const normalized = JSON.parse(fs.readFileSync(NORMALIZED_FILE, "utf8"));
  const productIds = Object.keys(normalized.products);

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const productId of productIds) {
    const productFile = path.join(PRODUCTS_DIR, `${productId}.json`);
    if (!fs.existsSync(productFile)) {
      missing++;
      continue;
    }

    const product = JSON.parse(fs.readFileSync(productFile, "utf8"));
    const enriched = normalized.products[productId];

    // Strip internal enrichment fields before writing to product JSON
    const crossSellProducts = (enriched.crossSellProducts || []).map((item) => ({
      category: item.category,
      title: item.title,
      price: item.price,
      wasPrice: item.wasPrice || undefined,
      savings: item.savings || undefined,
      rating: item.rating ?? undefined,
      reviewCount: item.reviewCount ?? undefined,
      image: item.image,
      badge: item.badge || undefined,
    }));

    // Replace crossSellProducts wholesale
    product.crossSellProducts = crossSellProducts;

    // Replace bundleDeals only when incoming data is valid
    if (enriched.bundleDeal) {
      product.bundleDeals = [enriched.bundleDeal];
    }
    // If incoming bundle is null, preserve existing valid bundle data
    // (don't overwrite with nothing)

    if (!dryRun) {
      fs.writeFileSync(productFile, JSON.stringify(product, null, 2));
    }
    updated++;
  }

  console.log("=== Merge Results ===");
  console.log(`Products in normalized data: ${productIds.length}`);
  console.log(`Updated:  ${updated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Missing:  ${missing} (no product file found)`);

  if (dryRun) {
    console.log("\n[DRY RUN] No files written.");
  }
}

// ─── CLI ───
const dryRun = process.argv.includes("--dry-run");
merge(dryRun);
