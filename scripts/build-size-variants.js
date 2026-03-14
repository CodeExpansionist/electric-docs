#!/usr/bin/env node
/**
 * Build size variant mapping for TV products.
 * Uses scraped sizeOptions as primary data source, with category data for ID/slug resolution.
 *
 * Generates:
 *   data/scrape/size-variants.json       — variant groups + product-to-variants mapping
 *   data/scrape/size-variant-audit.json   — structured family audit + gap mapping
 */

const fs = require("fs");
const path = require("path");

// ── Utility functions ──────────────────────────────────────────────

/** Strip backslash-escaped quotes from product names (add-missing-variants data artefact). */
function normalizeName(name) {
  return (name || "").replace(/\\"/g, '"');
}

function extractScreenSize(name) {
  const match = name.match(/(\d{2,3})["″"]\s/);
  return match ? match[1] + '"' : null;
}

function extractProductId(url) {
  const match = (url || "").match(/(\d{6,})\.html/);
  return match ? match[1] : null;
}

function extractSlug(url) {
  return (url || "")
    .replace("https://www.electriz.co.uk", "")
    .replace(/^\/products\//, "");
}

/**
 * Create a model family key by stripping screen size and model suffix.
 * e.g. "SAMSUNG S90F 55\" OLED 4K Vision AI Smart TV 2025 - QE55S90F"
 *    → "SAMSUNG S90F OLED 4K Vision AI Smart TV 2025"
 */
function getModelFamily(name) {
  let family = name.split(" - ")[0];
  family = family.replace(/\d{2,3}["″"]\s?/g, "").trim();
  family = family.replace(/\s+/g, " ");
  return family;
}

// ── Load data ──────────────────────────────────────────────────────

// Category data → product ID lookup
const tvs = require("../data/scrape/category-tvs.json");
const categoryProducts = tvs.products || [];
const categoryLookup = {};
categoryProducts.forEach(p => {
  const id = p.productId || extractProductId(p.url || p.productUrl || "");
  if (id) {
    categoryLookup[id] = {
      name: p.name || "",     // raw name preserved for display
      slug: extractSlug(p.url || p.productUrl || ""),
      price: p.price?.current ?? (typeof p.price === "number" ? p.price : 0),
    };
  }
});

// Model-family + size → product lookup (for recovery of broken URLs)
// Normalize names before extracting family/size to handle backslash-escaped quotes
const familySizeLookup = {};
categoryProducts.forEach(p => {
  const name = normalizeName(p.name || "");
  const family = getModelFamily(name);
  const size = extractScreenSize(name);
  const id = p.productId || extractProductId(p.url || p.productUrl || "");
  if (family && size && id) {
    const key = `${family}::${size}`;
    if (!familySizeLookup[key]) {
      familySizeLookup[key] = { productId: id, name };
    }
  }
});

// Scraped product JSONs
const productsDir = path.join(__dirname, "../data/scrape/products");
const scrapedProducts = {};
if (fs.existsSync(productsDir)) {
  fs.readdirSync(productsDir)
    .filter(f => f.endsWith(".json"))
    .forEach(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf8"));
        scrapedProducts[f.replace(".json", "")] = data;
      } catch (e) { /* skip corrupt files */ }
    });
}

console.log(`Loaded ${Object.keys(categoryLookup).length} products from category data`);
console.log(`Loaded ${Object.keys(scrapedProducts).length} scraped product JSONs`);
console.log(`Built ${Object.keys(familySizeLookup).length} family+size recovery entries`);

// ── Step 1: Build variant families from scraped sizeOptions ────────

// rawFamilies: familyKey → Map<size, variantRecord>
const rawFamilies = {};

let sourcesProcessed = 0;
Object.entries(scrapedProducts).forEach(([sourceId, scraped]) => {
  if (!scraped.sizeOptions || scraped.sizeOptions.length <= 1) return;

  const sourceNameRaw = scraped.title || scraped.name || (categoryLookup[sourceId]?.name) || "";
  const sourceName = normalizeName(sourceNameRaw);
  const sourceFamily = getModelFamily(sourceName);
  if (!sourceFamily) return;

  const sourceSize = extractScreenSize(sourceName);
  sourcesProcessed++;

  scraped.sizeOptions.forEach(opt => {
    const size = opt.size;
    const url = opt.url || "";
    const extractedId = extractProductId(url);

    let available = false;
    let resolvedId = null;
    let resolvedSlug = null;
    let anomaly = null;
    let gapAction = null;

    if (url === "#" || url === "") {
      // Hash or empty URL
      anomaly = url === "" ? "empty-url" : "hash-url";
    } else if (extractedId) {
      if (extractedId === sourceId && size !== sourceSize) {
        // Self-referencing URL: ID matches source but size differs
        anomaly = "self-reference";
      } else if (categoryLookup[extractedId]) {
        // Normal case: product exists in category data
        resolvedId = extractedId;
        resolvedSlug = categoryLookup[extractedId].slug;
        available = true;
      } else {
        // Product ID not in category data
        anomaly = "missing-product";
      }
    } else {
      anomaly = "unparseable-url";
    }

    // ── Recovery pass: attempt family+size lookup for any unavailable variant ──
    if (!available) {
      const recoveryKey = `${sourceFamily}::${size}`;
      const recovered = familySizeLookup[recoveryKey];
      if (recovered) {
        resolvedId = recovered.productId;
        resolvedSlug = categoryLookup[resolvedId]?.slug || "";
        available = true;
        anomaly = anomaly ? `${anomaly}-recovered` : null;
        gapAction = null;
      } else {
        // No recovery possible
        gapAction = anomaly === "hash-url" || anomaly === "empty-url"
          ? "leave-unavailable"
          : anomaly === "self-reference"
            ? "recover-by-family-size-match"
            : anomaly === "missing-product"
              ? "scrape-missing-product"
              : "flag-for-manual-review";
      }
    }

    // Price from resolved product, or fallback to source product
    const price = resolvedId
      ? (categoryLookup[resolvedId]?.price || 0)
      : (categoryLookup[sourceId]?.price || scraped.price?.current || 0);

    // Store in family map — deterministic dedup favouring canonical category-backed entries:
    // 1. available beats unavailable
    // 2. among available, prefer resolvedId that exists in categoryLookup
    // 3. among equal, keep first encountered (stable)
    if (!rawFamilies[sourceFamily]) rawFamilies[sourceFamily] = new Map();

    const existing = rawFamilies[sourceFamily].get(size);
    const dominated =
      !existing ||
      (available && !existing.available) ||
      (available && existing.available && resolvedId && categoryLookup[resolvedId] && !categoryLookup[existing.productId]);
    if (dominated) {
      rawFamilies[sourceFamily].set(size, {
        size,
        productId: resolvedId || "",
        slug: resolvedSlug || "",
        price,
        available,
        scrapedUrl: url,
        extractedId: extractedId || "",
        resolvedId,
        resolvedSlug,
        inCategoryData: !!resolvedId,
        anomaly,
        gapAction,
        sourceProductId: sourceId,
      });
    }
  });
});

console.log(`\nProcessed ${sourcesProcessed} products with sizeOptions > 1`);

// ── Step 2: Build output ───────────────────────────────────────────

const productToVariants = {};
const variantGroups = [];
const auditFamilies = [];

Object.entries(rawFamilies).forEach(([family, sizeMap]) => {
  const variants = Array.from(sizeMap.values());
  variants.sort((a, b) => parseInt(a.size) - parseInt(b.size));

  // Classify family status
  const availableCount = variants.filter(v => v.available).length;
  const hasUnrecoveredAnomalies = variants.some(
    v => v.anomaly && !v.anomaly.includes("recovered")
  );
  const allGapsAreHash = variants
    .filter(v => !v.available)
    .every(v => v.anomaly === "hash-url");

  let status;
  if (availableCount === variants.length) {
    status = "Complete";
  } else if (availableCount === 0) {
    status = "Needs Enrichment";
  } else if (hasUnrecoveredAnomalies && !allGapsAreHash) {
    status = "Data Mismatch";
  } else {
    status = "Partially Complete";
  }

  // Source products and reciprocal links
  const sourceProducts = [...new Set(variants.map(v => v.sourceProductId))];
  const reciprocalLinks = [];
  const availableIds = variants.filter(v => v.available).map(v => v.productId);

  for (let i = 0; i < availableIds.length; i++) {
    for (let j = i + 1; j < availableIds.length; j++) {
      const a = scrapedProducts[availableIds[i]];
      const b = scrapedProducts[availableIds[j]];
      if (a?.sizeOptions && b?.sizeOptions) {
        const aRefsB = a.sizeOptions.some(o => extractProductId(o.url) === availableIds[j]);
        const bRefsA = b.sizeOptions.some(o => extractProductId(o.url) === availableIds[i]);
        if (aRefsB || bRefsA) {
          reciprocalLinks.push(`${availableIds[i]} <-> ${availableIds[j]}`);
        }
      }
    }
  }

  // Gaps
  const gaps = variants
    .filter(v => v.gapAction)
    .map(v => ({
      size: v.size,
      cause: v.anomaly === "hash-url" ? "hash URL placeholder — no matching product in category data"
        : v.anomaly === "empty-url" ? "empty URL string — no matching product in category data"
        : v.anomaly === "self-reference" ? `self-referencing URL — ID ${v.extractedId} is a different size, no family+size match found`
        : v.anomaly === "missing-product" ? `product ${v.extractedId} not in category data, no family+size match found`
        : v.anomaly === "unparseable-url" ? "could not parse product ID from URL"
        : "unknown",
      action: v.gapAction,
    }));

  // Brand from first source product name
  const brandSource = categoryLookup[sourceProducts[0]]?.name || "";
  const brand = brandSource.split(" ")[0] || "Unknown";

  // Audit entry
  auditFamilies.push({
    family,
    brand,
    status,
    sourceProducts,
    reciprocalLinks,
    sizes: variants.map(v => ({
      size: v.size,
      scrapedUrl: v.scrapedUrl,
      extractedId: v.extractedId,
      resolvedId: v.resolvedId,
      resolvedSlug: v.resolvedSlug,
      inCategoryData: v.inCategoryData,
      available: v.available,
      anomaly: v.anomaly,
      gapAction: v.gapAction,
    })),
    gaps,
  });

  // Clean variants for size-variants.json (no audit metadata)
  const cleanVariants = variants.map(v => ({
    size: v.size,
    productId: v.productId,
    slug: v.slug,
    price: v.price,
    available: v.available,
  }));

  variantGroups.push({ family, variants: cleanVariants });

  // Map every product with a valid ID to the full variant list
  variants.forEach(v => {
    if (v.productId) {
      productToVariants[v.productId] = cleanVariants;
    }
  });
  // Also map source products in category data
  sourceProducts.forEach(id => {
    if (categoryLookup[id] && !productToVariants[id]) {
      productToVariants[id] = cleanVariants;
    }
  });

  // Console output per family
  console.log(`\nFamily: ${family} [${status}]`);
  variants.forEach(v => {
    const icon = v.available ? "✓" : "✗";
    const note = v.anomaly ? ` (${v.anomaly})` : "";
    console.log(`  ${icon} ${v.size} → ${v.productId || "—"} £${v.price || "?"}${note}`);
  });
});

// ── Step 3: Write outputs ──────────────────────────────────────────

// size-variants.json
const output = { variantGroups, productToVariants };
const outputPath = path.join(__dirname, "../data/scrape/size-variants.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

// size-variant-audit.json
const auditSummary = {
  totalFamilies: auditFamilies.length,
  byStatus: {
    Complete: auditFamilies.filter(f => f.status === "Complete").length,
    "Partially Complete": auditFamilies.filter(f => f.status === "Partially Complete").length,
    "Data Mismatch": auditFamilies.filter(f => f.status === "Data Mismatch").length,
    "Needs Enrichment": auditFamilies.filter(f => f.status === "Needs Enrichment").length,
  },
  totalGaps: auditFamilies.reduce((sum, f) => sum + f.gaps.length, 0),
  gapsByAction: {},
};
auditFamilies.forEach(f => {
  f.gaps.forEach(g => {
    auditSummary.gapsByAction[g.action] = (auditSummary.gapsByAction[g.action] || 0) + 1;
  });
});

const auditOutput = { summary: auditSummary, families: auditFamilies };
const auditPath = path.join(__dirname, "../data/scrape/size-variant-audit.json");
fs.writeFileSync(auditPath, JSON.stringify(auditOutput, null, 2));

// ── Print audit summary ────────────────────────────────────────────

console.log("\n=== SIZE VARIANT AUDIT ===");
console.log(`Families: ${auditSummary.totalFamilies} total`);
Object.entries(auditSummary.byStatus).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});
console.log(`\nGaps: ${auditSummary.totalGaps} total`);
Object.entries(auditSummary.gapsByAction).forEach(([action, count]) => {
  console.log(`  ${action}: ${count}`);
});
console.log(`\nWritten ${variantGroups.length} variant groups to size-variants.json`);
console.log(`Total products with variants: ${Object.keys(productToVariants).length}`);
console.log(`Audit written to size-variant-audit.json`);
