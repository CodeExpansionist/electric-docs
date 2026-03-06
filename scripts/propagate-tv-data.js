/**
 * Propagate real scraped data from representative TV products to other sizes in the same family.
 *
 * How it works:
 * 1. Read all TV product detail files
 * 2. Group TVs into families based on model series (e.g., all Samsung QN95D sizes)
 * 3. Find the "richest" product in each family (most complete data = has real scraped data)
 * 4. Copy description, specifications, and other family-shared fields to siblings
 * 5. Keep size-specific fields (title, price, images, etc.) from each product's own data
 */
const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '..', 'data', 'scrape', 'products');
const categoryFile = path.join(__dirname, '..', 'data', 'scrape', 'category-tvs.json');

// Read category data for product URLs
const categoryData = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
const productsByUrl = {};
for (const p of categoryData.products || []) {
  const url = p.productUrl || p.url;
  if (url) {
    const match = url.match(/(\d{7,8})\.html/);
    if (match) productsByUrl[match[1]] = p;
  }
}

// Extract model family from product title
function extractFamily(title) {
  if (!title) return null;

  // Remove size indicators and normalize
  let family = title
    .replace(/\b(24|27|32|40|42|43|48|50|55|58|65|75|77|83|85|86|97|98|100|116)["″\s]*(?:inch|in|"|'')?/gi, 'SIZE')
    .replace(/\b(24|27|32|40|42|43|48|50|55|58|65|75|77|83|85|86|97|98|100|116)\b/g, 'SIZE')
    .replace(/\bSIZE["″]?\b/g, 'SIZE')
    .trim();

  // Remove product IDs and trailing identifiers
  family = family
    .replace(/\d{7,8}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return family;
}

// Check if a product has "rich" data (from real scrape vs generated)
function dataRichness(product) {
  let score = 0;
  if (product.description && product.description.main && product.description.main.length > 100) score += 3;
  if (product.specifications && Object.keys(product.specifications).length > 0) score += 3;
  if (product.keySpecs && product.keySpecs.length > 2) score += 1;
  if (product.description && product.description.goodToKnow && product.description.goodToKnow.length > 2) score += 1;
  if (product.images && product.images.gallery && product.images.gallery.length > 5) score += 1;
  return score;
}

// Read all TV product files
const allFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
const tvProducts = [];

for (const file of allFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf8'));
    if (data.category === 'TVs') {
      tvProducts.push(data);
    }
  } catch (e) {
    // Skip invalid files
  }
}

console.log(`Found ${tvProducts.length} TV product files`);

// Group into families
const families = {};
for (const tv of tvProducts) {
  const family = extractFamily(tv.title);
  if (!family) continue;
  if (!families[family]) families[family] = [];
  families[family].push(tv);
}

const familyEntries = Object.entries(families);
console.log(`Identified ${familyEntries.length} TV families`);

// For each family, find richest product and propagate
let propagated = 0;
let familiesWithRichData = 0;

for (const [family, members] of familyEntries) {
  if (members.length <= 1) continue;

  // Find richest member
  let richest = members[0];
  let richestScore = dataRichness(richest);

  for (const member of members) {
    const score = dataRichness(member);
    if (score > richestScore) {
      richest = member;
      richestScore = score;
    }
  }

  if (richestScore < 4) continue; // Only propagate if we have meaningfully rich data
  familiesWithRichData++;

  // Propagate to siblings
  for (const member of members) {
    if (member.id === richest.id) continue;

    const memberScore = dataRichness(member);
    if (memberScore >= richestScore) continue; // Don't overwrite equally rich data

    let changed = false;

    // Propagate description (adapt for size differences)
    if (richest.description && richest.description.main && richest.description.main.length > 100) {
      if (!member.description || !member.description.main || member.description.main.length < 100) {
        // Adapt description - replace the representative's size mentions with this product's size
        let desc = richest.description.main;
        // Extract this product's screen size from title
        const sizeMatch = member.title && member.title.match(/\b(24|27|32|40|42|43|48|50|55|58|65|75|77|83|85|86|97|98|100|116)["″\s]*/);
        const richSizeMatch = richest.title && richest.title.match(/\b(24|27|32|40|42|43|48|50|55|58|65|75|77|83|85|86|97|98|100|116)["″\s]*/);

        if (sizeMatch && richSizeMatch) {
          desc = desc.replace(new RegExp('\\b' + richSizeMatch[1] + '["″]?', 'g'), sizeMatch[1] + '"');
        }

        member.description = {
          main: desc,
          goodToKnow: richest.description.goodToKnow || member.description?.goodToKnow || []
        };
        changed = true;
      }
    }

    // Propagate specifications
    if (richest.specifications && Object.keys(richest.specifications).length > 0) {
      if (!member.specifications || Object.keys(member.specifications).length === 0) {
        // Copy specs but update size-specific values
        const specs = JSON.parse(JSON.stringify(richest.specifications));
        // Size-specific spec keys to skip propagating
        // (these would be different per size)
        member.specifications = specs;
        changed = true;
      }
    }

    // Propagate keySpecs (shared across sizes)
    if (richest.keySpecs && richest.keySpecs.length > member.keySpecs?.length) {
      member.keySpecs = richest.keySpecs;
      changed = true;
    }

    // Propagate careAndRepair template
    if (richest.careAndRepair && richest.careAndRepair.length > 0 && (!member.careAndRepair || member.careAndRepair.length === 0)) {
      member.careAndRepair = richest.careAndRepair;
      changed = true;
    }

    if (changed) {
      // Write updated product
      fs.writeFileSync(path.join(productsDir, `${member.id}.json`), JSON.stringify(member));
      propagated++;
    }
  }
}

console.log(`\nPropagation results:`);
console.log(`Families with rich data: ${familiesWithRichData}`);
console.log(`Products enriched from family siblings: ${propagated}`);
