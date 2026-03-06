const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data', 'scrape');
const PRODUCTS_DIR = path.join(DATA_DIR, 'products');
const timestamp = new Date().toISOString();

const files = ['category-tvs.json','digital-smart-tv.json','dvd-blu-ray.json','soundbars.json','speakers-hifi.json','headphones.json','tv-accessories.json'];

const allIds = new Set();
let detailsSaved = 0;
let existingDetails = 0;

for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    const products = d.products || [];
    for (const p of products) {
      const id = p.productId;
      if (!id) continue;
      allIds.add(id);
      const detailFile = path.join(PRODUCTS_DIR, `${id}.json`);
      if (fs.existsSync(detailFile)) {
        existingDetails++;
        // Update price data in existing detail files
        try {
          const existing = JSON.parse(fs.readFileSync(detailFile, 'utf8'));
          if (p.price && p.price.current) {
            existing.price = p.price;
            existing.rating = p.rating;
            existing.lastUpdated = timestamp;
            fs.writeFileSync(detailFile, JSON.stringify(existing, null, 2));
          }
        } catch {}
      } else {
        // Create a new detail file from listing data
        const detail = {
          productId: id,
          name: p.name,
          brand: p.brand,
          url: p.url,
          price: p.price,
          rating: p.rating,
          imageUrl: p.imageUrl,
          specs: p.specs || p.keySpecs || [],
          badges: p.badges || [],
          offers: p.offers || [],
          energyRating: p.energyRating,
          scrapedAt: timestamp,
          source: 'listing-only'
        };
        fs.writeFileSync(detailFile, JSON.stringify(detail, null, 2));
        detailsSaved++;
      }
    }
  } catch (e) {
    console.log(`Error processing ${f}: ${e.message}`);
  }
}

const totalDetailFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json')).length;
console.log(`Unique product IDs across categories: ${allIds.size}`);
console.log(`New product detail files created: ${detailsSaved}`);
console.log(`Existing detail files updated: ${existingDetails}`);
console.log(`Total product detail files: ${totalDetailFiles}`);
