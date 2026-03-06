/**
 * Generate product detail JSON files from category listing data.
 * Uses category JSON data + CDN image patterns to create baseline product detail files.
 * Real scraped data (from firecrawl) always takes precedence — this only fills gaps.
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'data', 'scrape');
const productsDir = path.join(baseDir, 'products');

// All category files
const categories = [
  { file: 'category-tvs.json', name: 'TVs', categorySlug: 'tvs' },
  { file: 'soundbars.json', name: 'Soundbars', categorySlug: 'sound-bars' },
  { file: 'headphones.json', name: 'Headphones', categorySlug: 'headphones' },
  { file: 'speakers-hifi.json', name: 'Speakers', categorySlug: 'hifi-speakers' },
  { file: 'tv-accessories.json', name: 'TV Accessories', categorySlug: 'tv-accessories' },
  { file: 'dvd-blu-ray.json', name: 'DVD Blu-ray', categorySlug: 'dvd-blu-ray' },
  { file: 'digital-smart-tv.json', name: 'Digital Smart TV', categorySlug: 'digital-and-smart-tv' }
];

// CDN image URL builders
function buildGalleryImages(productId, count = 10) {
  const images = [`https://media.electriz.biz/i/electrizprod/${productId}?$l-large$&fmt=auto`];
  for (let i = 1; i <= count; i++) {
    images.push(`https://media.electriz.biz/i/electrizprod/${productId}_${String(i).padStart(3, '0')}?$l-large$&fmt=auto`);
  }
  return images;
}

function buildThumbnails(productId, count = 10) {
  const images = [`https://media.electriz.biz/i/electrizprod/${productId}?$t-thumbnail$&fmt=auto`];
  for (let i = 1; i <= count; i++) {
    images.push(`https://media.electriz.biz/i/electrizprod/${productId}_${String(i).padStart(3, '0')}?$t-thumbnail$&fmt=auto`);
  }
  return images;
}

// Build key specs from category data
function buildKeySpecs(product, category) {
  const specs = [];

  if (product.specs && product.specs.length > 0) {
    product.specs.forEach(spec => {
      specs.push({ icon: '', label: spec });
    });
  }

  // Add category-specific defaults
  if (category === 'TVs') {
    if (!specs.find(s => s.label.includes('year'))) {
      specs.push({ icon: '', label: '2 year guarantee' });
    }
  } else if (category === 'Soundbars') {
    if (!specs.find(s => s.label.includes('year'))) {
      specs.push({ icon: '', label: '2 year guarantee' });
    }
  }

  return specs;
}

// Build description from product name and specs
function buildDescription(product, category) {
  const name = product.name || product.title;
  const brand = product.brand || '';

  let main = '';
  const specs = product.specs || [];

  switch (category) {
    case 'TVs':
      main = `Experience stunning visuals with the ${name}. ` +
        (specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `this ${brand} TV delivers an immersive viewing experience for movies, gaming, and everyday entertainment.`;
      break;
    case 'Soundbars':
      main = `Upgrade your audio with the ${name}. ` +
        (specs.length > 0 ? `With ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `this soundbar brings cinematic sound quality to your living room.`;
      break;
    case 'Headphones':
      main = `Enjoy premium audio with the ${name}. ` +
        (specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `these headphones deliver exceptional sound quality for music, calls, and entertainment.`;
      break;
    case 'Speakers':
      main = `Fill your space with rich sound from the ${name}. ` +
        (specs.length > 0 ? `With ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `this speaker delivers powerful, detailed audio wherever you need it.`;
      break;
    case 'TV Accessories':
      main = `Enhance your setup with the ${name}. ` +
        (specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `this accessory is designed to complement your TV viewing experience.`;
      break;
    case 'DVD Blu-ray':
      main = `Watch your favourite films and shows with the ${name}. ` +
        (specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `enjoy high-quality playback for your disc collection.`;
      break;
    case 'Digital Smart TV':
      main = `Stream all your favourite content with the ${name}. ` +
        (specs.length > 0 ? `Featuring ${specs.slice(0, 3).join(', ').toLowerCase()}, ` : '') +
        `access thousands of apps and channels from one device.`;
      break;
    default:
      main = `The ${name} from ${brand}.`;
  }

  const goodToKnow = [];
  if (product.deliveryFree) goodToKnow.push('Free standard delivery');
  else goodToKnow.push('Free standard delivery on orders over £40');
  goodToKnow.push('2 year guarantee included');

  return { main, goodToKnow };
}

// Build delivery info
function buildDeliveryInfo(product) {
  const price = typeof product.price === 'object' ? (product.price.current || 0) : (product.price || 0);
  return {
    freeDelivery: product.deliveryFree || price >= 40,
    standardDeliveryPrice: product.deliveryFree ? 0 : 3.99,
    nextDayDeliveryPrice: price >= 200 ? 9.99 : 5.99,
    standardDeliveryDays: '3-5'
  };
}

// Build care and repair options
function buildCareAndRepair(price, category) {
  if (price < 50) return [];

  const plans = [];

  if (price >= 200) {
    plans.push({
      plan: 'Care & Repair',
      price: Math.round(price * 0.012 * 100) / 100,
      period: 'per month',
      mostPopular: true
    });
  }

  if (['TVs', 'Soundbars'].includes(category)) {
    plans.push({
      plan: 'Installation',
      price: price >= 500 ? 65 : 45,
      period: 'One-time fee'
    });
  }

  plans.push({
    plan: 'Recycle my old tech',
    price: 20,
    period: 'One-time fee'
  });

  return plans;
}

// Extract product ID from URL
function extractId(url) {
  const match = url.match(/(\d{7,8})\.html/);
  return match ? match[1] : null;
}

// Main generation
const existing = new Set(fs.readdirSync(productsDir).map(f => f.replace('.json', '')));
let generated = 0;
let skipped = 0;

for (const cat of categories) {
  const filePath = path.join(baseDir, cat.file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${cat.name}: file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const products = data.products || [];

  let catGenerated = 0;

  for (const p of products) {
    const url = p.productUrl || p.url || '';
    const id = p.productId || extractId(url);
    if (!id) continue;

    // Skip if already exists (real scraped data takes precedence)
    if (existing.has(id)) {
      skipped++;
      continue;
    }

    const price = typeof p.price === 'object' ? (p.price.current || 0) : (p.price || 0);
    const name = p.name || p.title || '';
    const brand = p.brand || '';

    // Build the product detail JSON
    const detail = {
      id,
      title: name,
      brand,
      price: {
        current: price,
        was: (typeof p.price === 'object' ? p.price.was : p.wasPrice) || 0,
        savings: (typeof p.price === 'object' ? p.price.savings : p.savings) || 0
      },
      rating: {
        average: (typeof p.rating === 'object' ? p.rating.average : p.rating) || 0,
        count: (typeof p.rating === 'object' ? p.rating.count : p.reviewCount) || 0
      },
      images: {
        gallery: buildGalleryImages(id),
        thumbnails: buildThumbnails(id),
        video: null
      },
      keySpecs: buildKeySpecs(p, cat.name),
      careAndRepair: buildCareAndRepair(price, cat.name),
      essentialServices: [],
      crossSellProducts: [],
      offers: p.offers || [],
      badges: p.badges || [],
      specifications: {},
      description: buildDescription(p, cat.name),
      deliveryInfo: buildDeliveryInfo(p),
      category: cat.name
    };

    // Add energy rating if present
    if (p.energyRating) {
      detail.energyRating = p.energyRating;
    }

    // Write the file
    const outputPath = path.join(productsDir, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(detail));
    catGenerated++;
    generated++;
    existing.add(id); // Mark as existing so we don't double-generate
  }

  console.log(`${cat.name}: generated ${catGenerated} product detail files`);
}

console.log(`\nDone! Generated ${generated} files, skipped ${skipped} (already exist)`);
console.log(`Total product detail files: ${existing.size}`);
