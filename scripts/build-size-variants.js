#!/usr/bin/env node
/**
 * Build size variant mapping for TV products.
 * Groups products by model family and creates a mapping
 * so clicking a size button navigates to the correct product page.
 *
 * Output: data/scrape/size-variants.json
 */

const fs = require("fs");
const path = require("path");

// Load category data
const tvs = require("../data/scrape/category-tvs.json");
const products = tvs.products || [];

// Load scraped product data for additional size info
const productsDir = path.join(__dirname, "../data/scrape/products");
const scrapedProducts = {};
if (fs.existsSync(productsDir)) {
  fs.readdirSync(productsDir)
    .filter(f => f.endsWith(".json"))
    .forEach(f => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(productsDir, f), "utf8"));
        scrapedProducts[f.replace(".json", "")] = data;
      } catch (e) {}
    });
}

function extractScreenSize(name) {
  // Extract the screen size from product name like '55"' or '65"'
  const match = name.match(/(\d{2,3})["″"]\s/);
  return match ? match[1] + '"' : null;
}

function extractProductId(url) {
  const match = (url || "").match(/(\d{6,})\.html/);
  return match ? match[1] : null;
}

function extractSlug(url) {
  let slug = (url || "")
    .replace("https://www.electriz.co.uk", "")
    .replace(/^\/products\//, "");
  return slug;
}

/**
 * Create a model family key by removing the screen size from the name.
 * e.g., "LG C5 55" OLED evo AI 4K HDR Smart TV 2025 - OLED55C54LA"
 *     → "LG C5 OLED evo AI 4K HDR Smart TV 2025"
 *
 * We strip: the size (55"), model number after the dash, and normalize spacing.
 */
function getModelFamily(name) {
  // Remove the model number suffix (everything after " - ")
  let family = name.split(" - ")[0];
  // Remove screen size like 55" or 65"
  family = family.replace(/\d{2,3}["″"]\s?/g, "").trim();
  // Normalize multiple spaces
  family = family.replace(/\s+/g, " ");
  return family;
}

// Step 1: Group products from category data by model family
const familyGroups = {};
products.forEach(p => {
  const name = p.name || "";
  const family = getModelFamily(name);
  const size = extractScreenSize(name);
  const id = extractProductId(p.url || p.productUrl || "");
  const slug = extractSlug(p.url || p.productUrl || "");
  const price = p.price?.current ?? (typeof p.price === "number" ? p.price : 0);

  if (!id || !size) return;

  if (!familyGroups[family]) familyGroups[family] = [];

  // Avoid duplicate sizes in the same family
  const existing = familyGroups[family].find(v => v.size === size);
  if (!existing) {
    familyGroups[family].push({ size, productId: id, slug, price });
  }
});

// Step 2: For single-product families, check scraped data for additional sizes
// These won't have navigable URLs but will show what sizes exist
Object.entries(familyGroups).forEach(([family, members]) => {
  if (members.length === 1) {
    const productId = members[0].productId;
    const scraped = scrapedProducts[productId];
    if (scraped && scraped.sizeOptions && scraped.sizeOptions.length > 1) {
      // This product has multiple sizes on Electriz but we only have one in our data
      // Mark it so the UI can show the sizes (but only the one we have is clickable)
      console.log(`  Note: ${family} has ${scraped.sizeOptions.length} sizes on Electriz but only 1 in our data (${productId})`);
    }
  }
});

// Step 3: Build the output mapping
// productToVariants: { [productId]: [{ size, productId, slug, price }] }
const productToVariants = {};
const variantGroups = [];

Object.entries(familyGroups).forEach(([family, members]) => {
  // Only include groups with 2+ products OR single products with scraped multi-size data
  if (members.length >= 2) {
    // Sort by screen size numerically
    members.sort((a, b) => {
      const sizeA = parseInt(a.size);
      const sizeB = parseInt(b.size);
      return sizeA - sizeB;
    });

    // All missing size variant products have been added to category data.
    // No need to merge phantom sizes from scraped sizeOptions anymore.

    // Create a variant group
    const group = {
      family,
      variants: members.map(m => ({
        size: m.size,
        productId: m.productId,
        slug: m.slug,
        price: m.price,
      })),
    };
    variantGroups.push(group);

    // Map each product in the group to the full variant list
    members.forEach(m => {
      if (m.productId) {
        productToVariants[m.productId] = group.variants;
      }
    });

    console.log(`Group: ${family}`);
    members.forEach(m => {
      const available = m.productId ? "✓" : "✗";
      console.log(`  ${available} ${m.size} → ${m.productId || "not in data"} (£${m.price || "?"})`);
    });
  } else if (members.length === 1) {
    // Single-product families: skip them entirely.
    // All known size variants should now be in category data.
    // If a single-product family still exists, its scraped sizeOptions
    // link to different product lines (e.g., JVC LT-32CR250 vs LT-40CR350).
    console.log(`Skipping single-product family: ${family} (${members[0].productId})`);
  }
});

// Step 4: Write the output
const output = {
  variantGroups,
  productToVariants,
};

const outputPath = path.join(__dirname, "../data/scrape/size-variants.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`\nWritten ${variantGroups.length} variant groups to ${outputPath}`);
console.log(`Total products with variants: ${Object.keys(productToVariants).length}`);
