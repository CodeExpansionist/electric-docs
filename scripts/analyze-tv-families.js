/**
 * Analyze TV product families to group TVs by model (e.g., Samsung QN85D across 55"/65"/75").
 * Reads missing-products.json and groups TV products by brand and model family.
 * Output is used by propagate-tv-data.js and build-size-variants.js.
 *
 * Usage: node scripts/analyze-tv-families.js
 */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/scrape/missing-products.json', 'utf8'));
const tvs = data.filter(p => p.category === 'TVs');

// Extract URLs grouped by brand
const brands = {};
for (const tv of tvs) {
  const match = tv.url.match(/products\/([a-z]+)-/);
  const brand = match ? match[1].toUpperCase() : 'UNKNOWN';
  if (!brands[brand]) brands[brand] = [];
  brands[brand].push(tv);
}

// Pick representative products: first product from each brand
const representatives = [];
for (const [brand, items] of Object.entries(brands)) {
  // Pick diverse models - take every Nth product to get variety
  const step = Math.max(1, Math.floor(items.length / 3));
  for (let i = 0; i < items.length; i += step) {
    representatives.push(items[i]);
    if (representatives.filter(r => {
      const m = r.url.match(/products\/([a-z]+)-/);
      return m && m[1].toUpperCase() === brand;
    }).length >= 3) break;
  }
}

console.log('=== Representative TVs to scrape (' + representatives.length + ') ===');
representatives.forEach((r, i) => {
  console.log((i + 1) + '. ' + r.id + ' - ' + r.url.split('/products/')[1].replace(/-\d{7,8}\.html/, '').substring(0, 80));
});

// Output URLs for scraping
console.log('\n=== URLs ===');
representatives.forEach(r => console.log(r.url));
