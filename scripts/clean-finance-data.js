#!/usr/bin/env node
/**
 * One-time cleanup: remove finance/collection residue from data/scrape/ JSON files.
 * Run: node scripts/clean-finance-data.js
 */

const fs = require("fs");
const path = require("path");

const scrapeDir = "data/scrape";
let totalChanges = 0;

function isFinanceOffer(text) {
  const lower = (typeof text === "string" ? text : text.text || "").toLowerCase();
  return (
    lower.includes("spread the cost") ||
    lower.includes("pay monthly") ||
    lower.includes("interest free") ||
    lower.includes("in-store collection") ||
    lower.includes("collect from store") ||
    lower.includes("apr representative") ||
    lower.includes("flexpay") ||
    lower.includes("buy now pay later") ||
    lower.includes("bnpl")
  );
}

function isFinanceSpec(text) {
  const lower = (typeof text === "string" ? text : text.text || "").toLowerCase();
  return lower.includes("apr representative") || /\d+(\.\d+)?% apr/i.test(lower);
}

function cleanProducts(products) {
  let changes = 0;
  for (const p of products) {
    // Remove monthlyPayment / monthlyAmount from price
    if (p.price && p.price.monthlyPayment !== undefined) {
      delete p.price.monthlyPayment;
      changes++;
    }
    if (p.price && p.price.monthlyAmount !== undefined) {
      delete p.price.monthlyAmount;
      changes++;
    }
    // Remove flexpay block
    if (p.flexpay !== undefined) {
      delete p.flexpay;
      changes++;
    }
    // Filter finance offers
    if (p.offers && Array.isArray(p.offers)) {
      const before = p.offers.length;
      p.offers = p.offers.filter((o) => !isFinanceOffer(o));
      changes += before - p.offers.length;
    }
    // Filter APR from keySpecs
    if (p.keySpecs && Array.isArray(p.keySpecs)) {
      const before = p.keySpecs.length;
      p.keySpecs = p.keySpecs.filter((s) => !isFinanceSpec(s));
      changes += before - p.keySpecs.length;
    }
    // Clean delivery text
    if (p.deliveryText && typeof p.deliveryText === "string") {
      const cleaned = p.deliveryText.replace(/FREE in-store collection\s*/gi, "").trim();
      if (cleaned !== p.deliveryText) {
        p.deliveryText = cleaned;
        changes++;
      }
    }
    // Filter finance badges
    if (p.badges && Array.isArray(p.badges)) {
      const before = p.badges.length;
      p.badges = p.badges.filter((b) => {
        const lower = (typeof b === "string" ? b : b.text || b.label || "").toLowerCase();
        return !lower.includes("finance") && !lower.includes("bnpl") && !lower.includes("buy now pay later");
      });
      changes += before - p.badges.length;
    }
    if (p.badgeImages && Array.isArray(p.badgeImages)) {
      const before = p.badgeImages.length;
      p.badgeImages = p.badgeImages.filter((b) => {
        const lower = (b.alt || b.label || b.text || "").toLowerCase();
        return !lower.includes("finance") && !lower.includes("bnpl");
      });
      changes += before - p.badgeImages.length;
    }
  }
  return changes;
}

// 1. All top-level JSONs in scrape dir (category listings + hub files + others)
const skipFiles = new Set(["products-index.json"]); // Rebuilt from sources
const categoryFiles = fs.readdirSync(scrapeDir).filter((f) => f.endsWith(".json") && !skipFiles.has(f));
for (const file of categoryFiles) {
  const fp = path.join(scrapeDir, file);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  let changes = 0;
  if (data.products) changes += cleanProducts(data.products);
  if (changes > 0) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
    console.log(`${file}: ${changes} changes`);
    totalChanges += changes;
  }
}

// 2. Non-category data files
const specialFiles = [
  "homepage.json",
  "basket.json",
  "product-example.json",
  "tv-audio-hub.json",
  "hub-tv-accessories.json",
  "hub-dvd-blu-ray.json",
  "hub-speakers-hifi.json",
];

for (const file of specialFiles) {
  const fp = path.join(scrapeDir, file);
  if (!fs.existsSync(fp)) continue;
  let raw = fs.readFileSync(fp, "utf8");
  const data = JSON.parse(raw);
  let changes = 0;

  // Clean products arrays if present
  if (data.products) changes += cleanProducts(data.products);

  // Remove flexpay top-level
  if (data.flexpay !== undefined) { delete data.flexpay; changes++; }

  // Remove creditRepresentativeText
  if (data.creditRepresentativeText !== undefined) { delete data.creditRepresentativeText; changes++; }

  // Remove monthlyPayment from any nested price
  if (data.price && data.price.monthlyPayment !== undefined) { delete data.price.monthlyPayment; changes++; }

  // Filter navigation/USP items referencing finance
  for (const key of ["navigation", "uspBar", "serviceBlocks", "carouselBanners", "banners"]) {
    if (data[key] && Array.isArray(data[key])) {
      const before = data[key].length;
      data[key] = data[key].filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return !text.includes("flexpay") && !text.includes("spread the cost") &&
               !text.includes("buy now pay later") && !text.includes("bnpl") &&
               !text.includes("pay monthly") && !text.includes("credit representative");
      });
      changes += before - data[key].length;
    }
  }

  // Filter deals/offers arrays
  for (const key of ["deals", "topDeals", "featuredDeals"]) {
    if (data[key] && Array.isArray(data[key])) {
      const before = data[key].length;
      data[key] = data[key].filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        return !text.includes("interest free") && !text.includes("flexpay") &&
               !text.includes("pay monthly") && !text.includes("spread the cost");
      });
      changes += before - data[key].length;
    }
  }

  if (changes > 0) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
    console.log(`${file}: ${changes} changes`);
    totalChanges += changes;
  }
}

// 3. Page JSONs
const pagesDir = path.join(scrapeDir, "pages");
if (fs.existsSync(pagesDir)) {
  for (const file of fs.readdirSync(pagesDir).filter((f) => f.endsWith(".json"))) {
    const fp = path.join(pagesDir, file);
    let raw = fs.readFileSync(fp, "utf8");
    let changed = false;

    // Remove collection sections from delivery page
    if (file.includes("delivery")) {
      raw = raw.replace(/"Collection"[^}]*}/g, (match) => { changed = true; return ""; });
    }

    // For now, just flag — page content is static HTML-like text, harder to surgically edit
    // We'll handle these manually if needed
    if (changed) {
      // Don't write broken JSON — skip auto-edit on page files
      console.log(`${file}: contains collection/finance content (manual review needed)`);
    }
  }
}

// 4. ALL individual product JSONs
const productsDir = path.join(scrapeDir, "products");
if (fs.existsSync(productsDir)) {
  const productFiles = fs.readdirSync(productsDir).filter((f) => f.endsWith(".json"));
  for (const file of productFiles) {
    const fp = path.join(productsDir, file);
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    let changes = 0;
    changes += cleanProducts([data]);
    if (changes > 0) {
      fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n");
      console.log(`products/${file}: ${changes} changes`);
      totalChanges += changes;
    }
  }
}

console.log(`\nTotal changes: ${totalChanges}`);
