#!/usr/bin/env node
/**
 * scrape-cross-sell.js — Stage 1: Cross-Sell Data Scraper
 *
 * Manages the cross-sell scraping pipeline state.
 * Actual Firecrawl calls are made externally (via MCP tools);
 * this script handles:
 *   - Listing products to scrape with their URLs
 *   - Ingesting raw Firecrawl results
 *   - Tracking progress (success/failure/skip)
 *   - Writing to data/intermediate/cross-sell-raw.json
 *
 * Usage:
 *   node scripts/scrape-cross-sell.js --list [--category TVs] [--limit 20]
 *   node scripts/scrape-cross-sell.js --ingest <productId> <jsonFile>
 *   node scripts/scrape-cross-sell.js --ingest-batch <jsonFile>
 *   node scripts/scrape-cross-sell.js --status
 *   node scripts/scrape-cross-sell.js --build-urls [--limit 20] [--offset 0]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCRAPE_DIR = path.join(ROOT, "data", "scrape");
const INTERMEDIATE_DIR = path.join(ROOT, "data", "intermediate");
const RAW_FILE = path.join(INTERMEDIATE_DIR, "cross-sell-raw.json");
const FAILURES_FILE = path.join(INTERMEDIATE_DIR, "cross-sell-failures.json");
const CATEGORY_DIR = SCRAPE_DIR;
const PRODUCTS_DIR = path.join(SCRAPE_DIR, "products");
const REFERENCE_DOMAIN = "https://www.currys.co.uk";

// ─── Helpers ───

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadRaw() {
  if (fs.existsSync(RAW_FILE)) {
    return JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));
  }
  return {
    meta: {
      scrapeVersion: 1,
      startedAt: null,
      completedAt: null,
      totalProducts: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    },
    products: {},
    failures: [],
  };
}

function saveRaw(data) {
  ensureDir(INTERMEDIATE_DIR);
  fs.writeFileSync(RAW_FILE, JSON.stringify(data, null, 2));
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/["]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Product URL builder ───

function getAllProducts() {
  const products = new Map();

  // 1. Category files have the best URLs (already slugified)
  const catFiles = fs
    .readdirSync(CATEGORY_DIR)
    .filter((f) => f.startsWith("category-") && f.endsWith(".json"));
  for (const cf of catFiles) {
    const cat = JSON.parse(
      fs.readFileSync(path.join(CATEGORY_DIR, cf), "utf8")
    );
    for (const p of cat.products) {
      if (p.productId && p.url) {
        products.set(p.productId, {
          id: p.productId,
          name: p.name,
          category: cat.categoryName,
          url: REFERENCE_DOMAIN + p.url,
          urlSource: "category",
        });
      }
    }
  }

  // 2. Individual product files — build URL from name + ID if missing
  const productFiles = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith(".json"));
  for (const pf of productFiles) {
    const id = pf.replace(".json", "");
    if (products.has(id)) continue;

    const p = JSON.parse(
      fs.readFileSync(path.join(PRODUCTS_DIR, pf), "utf8")
    );
    const name = p.title || p.name || "";
    if (!name) continue;

    // If the product file has a URL, use it
    if (p.url) {
      products.set(id, {
        id,
        name,
        category: p.category || "unknown",
        url: REFERENCE_DOMAIN + p.url,
        urlSource: "product-file",
      });
    } else {
      // Build URL from name: /products/{slug}-{id}.html
      const slug = slugify(name);
      products.set(id, {
        id,
        name,
        category: p.category || "unknown",
        url: `${REFERENCE_DOMAIN}/products/${slug}-${id}.html`,
        urlSource: "constructed",
      });
    }
  }

  return products;
}

// ─── Commands ───

function cmdList(opts) {
  const products = getAllProducts();
  const raw = loadRaw();

  let entries = [...products.values()];

  if (opts.category) {
    entries = entries.filter(
      (p) => p.category.toLowerCase() === opts.category.toLowerCase()
    );
  }

  // Skip already-scraped in resume mode
  if (opts.resume) {
    entries = entries.filter((p) => !raw.products[p.id]);
  }

  if (opts.offset) entries = entries.slice(opts.offset);
  if (opts.limit) entries = entries.slice(0, opts.limit);

  console.log(`Products to scrape: ${entries.length}`);
  for (const p of entries) {
    console.log(`${p.id} | ${p.category} | ${p.urlSource} | ${p.url}`);
  }
  return entries;
}

function cmdBuildUrls(opts) {
  const products = getAllProducts();
  let entries = [...products.values()];

  if (opts.category) {
    entries = entries.filter(
      (p) => p.category.toLowerCase() === opts.category.toLowerCase()
    );
  }

  if (opts.offset) entries = entries.slice(opts.offset);
  if (opts.limit) entries = entries.slice(0, opts.limit);

  // Output JSON array of {id, url} for batch processing
  const urls = entries.map((p) => ({ id: p.id, url: p.url, category: p.category }));
  console.log(JSON.stringify(urls, null, 2));
}

function cmdIngest(productId, resultJson) {
  const raw = loadRaw();
  if (!raw.meta.startedAt) raw.meta.startedAt = new Date().toISOString();

  const result =
    typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;

  raw.products[productId] = {
    crossSellItems: result.crossSellProducts || [],
    bundleDeal: result.bundleDeal || null,
    scrapedAt: new Date().toISOString(),
    sourceUrl: result._sourceUrl || "",
  };

  raw.meta.success = Object.keys(raw.products).length;
  saveRaw(raw);
  console.log(
    `Ingested ${productId}: ${(result.crossSellProducts || []).length} cross-sell items`
  );
}

function cmdIngestBatch(batchFile) {
  const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
  const raw = loadRaw();
  if (!raw.meta.startedAt) raw.meta.startedAt = new Date().toISOString();

  let count = 0;
  for (const [productId, result] of Object.entries(batch)) {
    raw.products[productId] = {
      crossSellItems: result.crossSellProducts || [],
      bundleDeal: result.bundleDeal || null,
      scrapedAt: new Date().toISOString(),
      sourceUrl: result._sourceUrl || "",
    };
    count++;
  }

  raw.meta.success = Object.keys(raw.products).length;
  saveRaw(raw);
  console.log(`Ingested ${count} products. Total: ${raw.meta.success}`);
}

function cmdFailure(productId, error, url) {
  const raw = loadRaw();
  raw.failures.push({ productId, error, url, failedAt: new Date().toISOString() });
  raw.meta.failed = raw.failures.length;
  saveRaw(raw);

  // Also write failures file
  fs.writeFileSync(FAILURES_FILE, JSON.stringify(raw.failures, null, 2));
  console.log(`Recorded failure for ${productId}: ${error}`);
}

function cmdStatus() {
  const raw = loadRaw();
  const products = getAllProducts();
  const totalProducts = products.size;
  const scraped = Object.keys(raw.products).length;
  const failed = raw.failures.length;
  const remaining = totalProducts - scraped;

  // Count cross-sell items
  let totalItems = 0;
  let withItems = 0;
  let withBundle = 0;
  for (const [, p] of Object.entries(raw.products)) {
    const items = p.crossSellItems || [];
    totalItems += items.length;
    if (items.length > 0) withItems++;
    if (p.bundleDeal) withBundle++;
  }

  console.log("=== Cross-Sell Scrape Status ===");
  console.log(`Total products:     ${totalProducts}`);
  console.log(`Scraped:            ${scraped} (${((scraped / totalProducts) * 100).toFixed(1)}%)`);
  console.log(`Failed:             ${failed}`);
  console.log(`Remaining:          ${remaining}`);
  console.log(`With cross-sell:    ${withItems} (${scraped > 0 ? ((withItems / scraped) * 100).toFixed(1) : 0}%)`);
  console.log(`With bundle:        ${withBundle} (${scraped > 0 ? ((withBundle / scraped) * 100).toFixed(1) : 0}%)`);
  console.log(`Total items:        ${totalItems}`);
  if (raw.meta.startedAt) console.log(`Started at:         ${raw.meta.startedAt}`);
}

// ─── CLI ───

const args = process.argv.slice(2);
const getFlag = (flag) => args.includes(flag);
const getFlagValue = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
};

if (getFlag("--list")) {
  cmdList({
    category: getFlagValue("--category"),
    limit: getFlagValue("--limit") ? parseInt(getFlagValue("--limit")) : null,
    offset: getFlagValue("--offset") ? parseInt(getFlagValue("--offset")) : null,
    resume: getFlag("--resume"),
  });
} else if (getFlag("--build-urls")) {
  cmdBuildUrls({
    category: getFlagValue("--category"),
    limit: getFlagValue("--limit") ? parseInt(getFlagValue("--limit")) : null,
    offset: getFlagValue("--offset") ? parseInt(getFlagValue("--offset")) : null,
  });
} else if (getFlag("--ingest")) {
  const productId = args[args.indexOf("--ingest") + 1];
  const jsonFile = args[args.indexOf("--ingest") + 2];
  if (!productId || !jsonFile) {
    console.error("Usage: --ingest <productId> <jsonFile>");
    process.exit(1);
  }
  const result = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  cmdIngest(productId, result);
} else if (getFlag("--ingest-batch")) {
  const batchFile = args[args.indexOf("--ingest-batch") + 1];
  if (!batchFile) {
    console.error("Usage: --ingest-batch <jsonFile>");
    process.exit(1);
  }
  cmdIngestBatch(batchFile);
} else if (getFlag("--failure")) {
  const productId = args[args.indexOf("--failure") + 1];
  const error = args[args.indexOf("--failure") + 2] || "unknown";
  const url = args[args.indexOf("--failure") + 3] || "";
  cmdFailure(productId, error, url);
} else if (getFlag("--status")) {
  cmdStatus();
} else {
  console.log("Usage:");
  console.log("  --list [--category X] [--limit N] [--offset N] [--resume]");
  console.log("  --build-urls [--category X] [--limit N] [--offset N]");
  console.log("  --ingest <productId> <jsonFile>");
  console.log("  --ingest-batch <jsonFile>");
  console.log("  --failure <productId> <error> [url]");
  console.log("  --status");
}
