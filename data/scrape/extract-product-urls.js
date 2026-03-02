const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname);

const categoryFiles = [
  { file: 'category-tvs.json',     label: 'TVs' },
  { file: 'dvd-blu-ray.json',      label: 'DVD & Blu-ray' },
  { file: 'soundbars.json',        label: 'Sound Bars' },
  { file: 'speakers-hifi.json',    label: 'Speakers & Hi-Fi' },
  { file: 'tv-accessories.json',   label: 'TV Accessories' },
  { file: 'digital-smart-tv.json', label: 'Digital & Smart TV' },
  { file: 'headphones.json',       label: 'Headphones' },
];

const allProducts = [];
const categoryCounts = {};

for (const { file, label } of categoryFiles) {
  const filePath = path.join(BASE, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const products = data.products || [];
  let count = 0;

  for (const product of products) {
    const url = product.productUrl || product.url;
    if (!url) {
      console.warn(`  WARNING: No URL found for product "${product.name}" in ${file}`);
      continue;
    }

    // Extract product ID: the number before .html at the end of the URL
    const idMatch = url.match(/(\d+)\.html$/);
    const id = idMatch ? idMatch[1] : null;

    if (!id) {
      console.warn(`  WARNING: Could not extract ID from URL: ${url}`);
    }

    allProducts.push({
      url,
      id: id || 'unknown',
      category: label,
    });
    count++;
  }

  categoryCounts[label] = count;
}

// Check for duplicate URLs
const urlSet = new Set();
const duplicates = [];
for (const p of allProducts) {
  if (urlSet.has(p.url)) {
    duplicates.push(p.url);
  }
  urlSet.add(p.url);
}

// Write output
const outputPath = path.join(BASE, 'all-product-urls.json');
fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

// Print summary
console.log('=== Product URL Extraction Summary ===\n');
console.log(`Total products: ${allProducts.length}`);
console.log(`Unique URLs:    ${urlSet.size}`);
if (duplicates.length > 0) {
  console.log(`Duplicates:     ${duplicates.length}`);
}
console.log('\nCount per category:');
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`  ${cat.padEnd(20)} ${count}`);
}
console.log(`\nOutput written to: ${outputPath}`);
