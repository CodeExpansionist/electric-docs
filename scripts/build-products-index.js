/**
 * Build products-index.json from all individual product detail files.
 * This is the master index used by product-data.ts to load enriched product data.
 *
 * Usage: node scripts/build-products-index.js
 */
const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '..', 'data', 'scrape', 'products');
const outputFile = path.join(__dirname, '..', 'data', 'scrape', 'products-index.json');

const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
const index = {};
let errors = 0;

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf8'));
    const id = file.replace('.json', '');
    index[id] = data;
  } catch (e) {
    console.error(`Error reading ${file}: ${e.message}`);
    errors++;
  }
}

// Write the index
fs.writeFileSync(outputFile, JSON.stringify(index));

const stats = {
  totalProducts: Object.keys(index).length,
  fileSize: (fs.statSync(outputFile).size / 1024).toFixed(1) + ' KB',
  errors,
};

console.log('Built products-index.json');
console.log(`  Products: ${stats.totalProducts}`);
console.log(`  File size: ${stats.fileSize}`);
if (errors > 0) console.log(`  Errors: ${errors}`);

// Category breakdown
const categories = {};
for (const [id, p] of Object.entries(index)) {
  const cat = p.category || 'Unknown';
  categories[cat] = (categories[cat] || 0) + 1;
}
console.log('\n  By category:');
for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${cat}: ${count}`);
}
