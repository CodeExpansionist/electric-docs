/**
 * Find products that exist in category listings but have no individual detail file.
 * Outputs missing-products.json with product IDs, names, and source categories.
 * Run after scraping to identify products needing recovery.
 *
 * Usage: node scripts/find-missing-products.js
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'data', 'scrape');
const productsDir = path.join(baseDir, 'products');

const categories = [
  { file: 'category-tvs.json', name: 'TVs' },
  { file: 'soundbars.json', name: 'Soundbars' },
  { file: 'headphones.json', name: 'Headphones' },
  { file: 'speakers-hifi.json', name: 'Speakers' },
  { file: 'tv-accessories.json', name: 'TV Accessories' },
  { file: 'dvd-blu-ray.json', name: 'DVD Blu-ray' },
  { file: 'digital-smart-tv.json', name: 'Digital Smart TV' }
];

const existing = new Set(fs.readdirSync(productsDir).map(f => f.replace('.json', '')));
const missing = [];

for (const cat of categories) {
  const data = JSON.parse(fs.readFileSync(path.join(baseDir, cat.file), 'utf8'));
  for (const p of data.products || []) {
    const url = p.productUrl || p.url;
    if (!url) continue;
    const match = url.match(/(\d{7,8})\.html/);
    if (!match) continue;
    const id = match[1];
    if (!existing.has(id)) {
      missing.push({ id, url, category: cat.name });
    }
  }
}

// Group by category
const byCat = {};
for (const m of missing) {
  if (!byCat[m.category]) byCat[m.category] = [];
  byCat[m.category].push(m);
}

console.log('=== Missing Product Detail Files ===');
for (const [cat, items] of Object.entries(byCat)) {
  console.log(`${cat}: ${items.length} missing`);
}
console.log(`\nTOTAL MISSING: ${missing.length}`);
console.log(`ALREADY HAVE: ${existing.size}`);

// Output all missing URLs as JSON for consumption
const outputPath = path.join(__dirname, '..', 'data', 'scrape', 'missing-products.json');
fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
console.log(`\nWrote missing product list to: ${outputPath}`);

// Output first batch of URLs (non-TV products first since there are fewer)
const nonTv = missing.filter(m => m.category !== 'TVs');
const tvs = missing.filter(m => m.category === 'TVs');

console.log('\n=== Priority Batch (non-TV): ' + nonTv.length + ' products ===');
nonTv.forEach(m => console.log(m.url));

console.log('\n=== TV Batch: ' + tvs.length + ' products ===');
tvs.slice(0, 20).forEach(m => console.log(m.url));
if (tvs.length > 20) console.log(`... and ${tvs.length - 20} more TVs`);
