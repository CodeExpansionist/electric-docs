const fs = require('fs');
const path = require('path');

const categories = [
  'category-tvs.json', 'soundbars.json', 'headphones.json',
  'speakers-hifi.json', 'tv-accessories.json', 'dvd-blu-ray.json', 'digital-smart-tv.json'
];

let totalProducts = 0;
let productsWithUrls = 0;
const uniqueIds = new Set();
const baseDir = path.join(__dirname, '..', 'data', 'scrape');

for (const file of categories) {
  const data = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf8'));
  const products = data.products || [];
  totalProducts += products.length;

  for (const p of products) {
    const url = p.productUrl || p.url;
    if (url) {
      productsWithUrls++;
      const match = url.match(/(\d{7,8})\.html/);
      if (match) uniqueIds.add(match[1]);
    }
  }
}

// Count product detail files
const productFiles = fs.readdirSync(path.join(baseDir, 'products')).filter(f => f.endsWith('.json'));

// Check filter coverage
let filtersOk = 0;
for (const file of categories) {
  const data = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf8'));
  if (data.filters && data.filters.length > 0) {
    filtersOk++;
    console.log(file + ': ' + data.filters.length + ' filter groups');
  } else {
    console.log(file + ': NO FILTERS');
  }
}

console.log('\n=== Data Coverage Summary ===');
console.log('Total products in category JSONs: ' + totalProducts);
console.log('Products with URLs: ' + productsWithUrls);
console.log('Unique product IDs: ' + uniqueIds.size);
console.log('Product detail files: ' + productFiles.length);
console.log('Coverage: ' + ((productFiles.length / uniqueIds.size) * 100).toFixed(1) + '%');
console.log('Filter groups: ' + filtersOk + '/' + categories.length + ' categories have filters');

// Check missing detail files
const productFileIds = new Set(productFiles.map(f => f.replace('.json', '')));
const missing = [];
for (const id of uniqueIds) {
  if (!productFileIds.has(id)) missing.push(id);
}

// Check extra detail files (not in any category)
const extras = [];
for (const id of productFileIds) {
  if (!uniqueIds.has(id)) extras.push(id);
}

console.log('\nMissing detail files: ' + missing.length);
if (missing.length > 0) console.log('  ' + missing.slice(0, 5).join(', '));
console.log('Extra detail files (not in categories): ' + extras.length);

// Check data richness
let rich = 0;
let basic = 0;
for (const file of productFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(baseDir, 'products', file), 'utf8'));
    const hasRealDesc = data.description && data.description.main && data.description.main.length > 100;
    const hasSpecs = data.specifications && Object.keys(data.specifications).length > 0;
    if (hasRealDesc || hasSpecs) rich++;
    else basic++;
  } catch (e) {
    // skip
  }
}

console.log('\nData richness:');
console.log('  Rich (real descriptions/specs): ' + rich);
console.log('  Basic (generated only): ' + basic);
