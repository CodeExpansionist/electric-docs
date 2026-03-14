#!/usr/bin/env node
/**
 * generate-cross-sell.js — Algorithmic Cross-Sell Assignment
 *
 * For products missing cross-sell data, borrows from same-category siblings.
 * Cross-sell items are category-level accessories (screen cleaners, cables, etc.)
 * so borrowing from a sibling produces realistic results.
 *
 * Usage:
 *   node scripts/generate-cross-sell.js --dry-run     # preview only
 *   node scripts/generate-cross-sell.js               # write to product files
 *   node scripts/generate-cross-sell.js --ids 10267061,10282100  # specific IDs only
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "data", "scrape", "products");
const FAILURES_FILE = path.join(ROOT, "data", "intermediate", "cross-sell-failures.json");

// ─── Category inference from title (for products with no category field) ───

const CATEGORY_PATTERNS = [
  { pattern: /\bOLED\b|\bQLED\b|\bLED TV\b|\bSmart TV\b|\bUHD.*TV\b|\bHDR.*TV\b|\bNanoCell\b|\bMini.?LED\b|\bCrystal UHD\b/i, category: "TVs" },
  { pattern: /\bSoundbar\b|\bSound Bar\b|\bAll-in-One Sound/i, category: "Soundbars" },
  { pattern: /\bHeadphones?\b|\bEarphones?\b|\bEarbuds?\b|\bIn-Ear\b|\bOver-Ear\b|\bNoise.Cancell|\bGalaxy Buds\b/i, category: "Headphones" },
  { pattern: /\bSpeaker\b|\bBoombox\b|\bDAB\b|\bFM Radio\b|\bClock Radio\b|\bPortable.*Radio\b|\bRetro.*Radio\b|\bBluetooth Radio\b|\bMicrophone\b/i, category: "Speakers" },
  { pattern: /\bTV Mount\b|\bTV Stand\b|\bTV Bracket\b|\bWall Mount\b|\bScreen Clean\b|\bRemote Control\b|\bCable Management\b|\bHDMI\b|\bHDMI Cable\b|\bPower Supply\b|\bCar Stereo\b/i, category: "TV Accessories" },
  { pattern: /\bDVD\b|\bBlu-ray\b|\bBlu.ray\b/i, category: "DVD Blu-ray" },
  { pattern: /\bFreesat\b|\bFreeview\b|\bDigital TV\b|\bTV Recorder\b|\bSet.Top Box\b/i, category: "Digital & Smart TV" },
  { pattern: /\bAV Receiver\b|\bHome Cinema\b|\bHome Theater\b/i, category: "Soundbars" },
  // Broad TV fallback — title contains "TV" but not caught above
  { pattern: /\b\d{2,3}["″]?\s.*TV\b|\bTV\b.*\b\d{2,3}["″]?/i, category: "TVs" },
];

function inferCategory(title) {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(title)) return category;
  }
  return null;
}

// ─── Main ───

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const idsArg = process.argv.find((a) => a.startsWith("--ids="));
  const targetIds = idsArg ? idsArg.split("=")[1].split(",") : null;

  // 1. Load all products and build category index
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith(".json"));
  const categoryDonors = {}; // category → [{ id, brand, crossSellProducts }]
  const productsNeedingCrossSell = []; // [{ id, filepath, product }]

  for (const file of files) {
    const filepath = path.join(PRODUCTS_DIR, file);
    const product = JSON.parse(fs.readFileSync(filepath, "utf8"));
    const id = file.replace(".json", "");
    const title = product.title || product.name || "";
    const brand = (product.brand || "").toLowerCase();
    const category = product.category || inferCategory(title);
    const crossSell = product.crossSellProducts || [];

    if (crossSell.length > 0 && category) {
      if (!categoryDonors[category]) categoryDonors[category] = [];
      categoryDonors[category].push({ id, brand, crossSellProducts: crossSell });
    }

    if (crossSell.length === 0) {
      if (targetIds && !targetIds.includes(id)) continue;
      productsNeedingCrossSell.push({ id, filepath, product, title, brand, category });
    }
  }

  console.log("=== Cross-Sell Generator ===");
  console.log(`Total products: ${files.length}`);
  console.log(`Products with cross-sell (donors): ${Object.values(categoryDonors).reduce((s, a) => s + a.length, 0)}`);
  console.log(`Products needing cross-sell: ${productsNeedingCrossSell.length}`);
  console.log(`\nDonor pool by category:`);
  for (const [cat, donors] of Object.entries(categoryDonors).sort()) {
    console.log(`  ${cat}: ${donors.length} donors`);
  }
  console.log("");

  // 2. Assign cross-sell from donors
  let assigned = 0;
  let noMatch = 0;

  for (const target of productsNeedingCrossSell) {
    const category = target.category || inferCategory(target.title);

    if (!category || !categoryDonors[category]) {
      console.log(`  SKIP ${target.id} — no category match (title: ${target.title.substring(0, 50)})`);
      noMatch++;
      continue;
    }

    const donors = categoryDonors[category];

    // Prefer same brand, fall back to any donor in category
    const sameBrand = donors.filter((d) => d.brand === target.brand);
    const donor = sameBrand.length > 0 ? sameBrand[0] : donors[0];

    // Copy cross-sell array (no bundleDeal — too product-specific)
    target.product.crossSellProducts = donor.crossSellProducts;

    if (!dryRun) {
      fs.writeFileSync(target.filepath, JSON.stringify(target.product, null, 2));
    }

    console.log(`  ${target.id} ← donor ${donor.id} (${category}${sameBrand.length > 0 ? ", same brand" : ""})`);
    assigned++;
  }

  console.log(`\n=== Results ===`);
  console.log(`Assigned: ${assigned}`);
  console.log(`No match: ${noMatch}`);
  if (dryRun) console.log("\n[DRY RUN] No files written.");
  else console.log(`\n${assigned} product files updated.`);
}

main();
