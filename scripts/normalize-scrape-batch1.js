/**
 * Normalize scraped data for categories 1-7 (E2E pipeline test)
 * Merges multiple page scrapes, deduplicates, normalizes field names
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'scrape');
const PRODUCTS_DIR = path.join(DATA_DIR, 'products');
const timestamp = new Date().toISOString();

// Normalize a single product from scrape format to our canonical format
function normalizeProduct(p) {
  const productId = String(p.productId || '').replace(/\D/g, '');
  if (!productId || productId.length < 5) return null; // Skip invalid IDs (subcategory links etc.)
  
  const price = typeof p.price === 'number' ? p.price : (p.price?.current ?? 0);
  const wasPrice = p.wasPrice && p.wasPrice > 0 && p.wasPrice !== price ? p.wasPrice : (p.price?.was ?? null);
  const savings = p.savings && p.savings > 0 ? p.savings : (p.price?.savings ?? null);
  const rating = typeof p.rating === 'number' ? p.rating : (p.rating?.average ?? 0);
  const reviewCount = p.reviewCount || p.rating?.count || 0;
  const energyRating = p.energyRating && p.energyRating !== '' && p.energyRating !== 'null' ? p.energyRating : null;
  
  // Extract brand from name if not provided
  let brand = p.brand || '';
  // Capitalize brand consistently
  if (brand) {
    brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
    // Fix common brand capitalization
    const brandFixes = {
      'Lg': 'LG', 'Jbl': 'JBL', 'Jvc': 'JVC', 'Tcl': 'TCL', 'Bose': 'Bose',
      'Sony': 'Sony', 'Samsung': 'Samsung', 'Hisense': 'Hisense', 'Sonos': 'Sonos',
      'Panasonic': 'Panasonic', 'Beats': 'Beats', 'Apple': 'Apple', 'Amazon': 'Amazon',
      'Sharp': 'Sharp', 'Philips': 'Philips', 'Toshiba': 'Toshiba', 'Denon': 'Denon',
      'Marshall': 'Marshall', 'Soundcore': 'Soundcore', 'Skullcandy': 'Skullcandy',
      'Jlab': 'JLab', 'Groov-e': 'Groov-e', 'Roku': 'Roku', 'Freesat': 'Freesat',
      'Manhattan': 'Manhattan', 'Humax': 'Humax', 'Majority': 'Majority', 'Oakcastle': 'Oakcastle',
      'Streetz': 'Streetz', 'Logik': 'Logik', 'Fresh n rebel': 'Fresh N Rebel',
    };
    for (const [k, v] of Object.entries(brandFixes)) {
      if (brand.toLowerCase() === k.toLowerCase()) { brand = v; break; }
    }
  }
  
  return {
    productId,
    name: p.name || p.title || '',
    brand,
    url: (p.url || p.productUrl || '').replace('https://www.currys.co.uk', ''),
    imageUrl: p.imageUrl || null,
    price: {
      current: price,
      was: wasPrice,
      savings: savings
    },
    rating: {
      average: rating,
      count: reviewCount
    },
    specs: p.keySpecs || p.specs || [],
    badges: (p.badges || []).filter(b => !b.includes('Delivery') && !b.includes('collection')),
    offers: (p.offers || []).filter(o => !o.includes('Delivery') && !o.includes('collection')),
    deliveryFree: true,
    energyRating,
    inStock: p.inStock !== false
  };
}

// Merge and deduplicate products from multiple scrape results
function mergeProducts(productArrays) {
  const seen = new Map();
  for (const products of productArrays) {
    for (const p of products) {
      const norm = normalizeProduct(p);
      if (!norm) continue;
      // Keep the one with more specs/data
      if (!seen.has(norm.productId) || 
          (norm.specs.length > (seen.get(norm.productId).specs?.length || 0))) {
        seen.set(norm.productId, norm);
      }
    }
  }
  return Array.from(seen.values());
}

// Build filter groups from product data
function buildFilters(products, categoryType) {
  const filters = [];
  
  // Hide out of stock toggle
  filters.push({ name: 'Hide out of stock', isExpanded: true, type: 'toggle', options: [] });
  
  // Brand filter
  const brandCounts = {};
  products.forEach(p => { if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });
  const brandOptions = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
  if (brandOptions.length > 0) {
    filters.push({ name: 'Brand', isExpanded: true, type: 'checkbox', options: brandOptions });
  }
  
  // Price filter
  const priceRanges = [
    { label: 'Up to £100', min: 0, max: 100 },
    { label: '£100 to £300', min: 100, max: 300 },
    { label: '£300 to £500', min: 300, max: 500 },
    { label: '£500 to £1,000', min: 500, max: 1000 },
    { label: '£1,000 and above', min: 1000, max: Infinity },
  ];
  const priceOptions = priceRanges.map(r => ({
    label: r.label,
    count: products.filter(p => p.price.current >= r.min && p.price.current < r.max).length
  })).filter(o => o.count > 0);
  if (priceOptions.length > 0) {
    filters.push({ name: 'Price', isExpanded: true, type: 'checkbox', options: priceOptions });
  }
  
  // Customer Rating filter
  const ratingOptions = [5, 4, 3].map(stars => ({
    label: `${stars} stars & above`,
    count: products.filter(p => p.rating.average >= stars).length
  })).filter(o => o.count > 0);
  if (ratingOptions.length > 0) {
    filters.push({ name: 'Customer Rating', isExpanded: false, type: 'rating', options: ratingOptions });
  }
  
  // Category-specific filters
  if (categoryType === 'tvs') {
    // Screen Size
    const sizeRanges = [
      { label: '90" or more', min: 90, max: 999 },
      { label: '85" - 89"', min: 85, max: 89 },
      { label: '80" - 84"', min: 80, max: 84 },
      { label: '75" - 79"', min: 75, max: 79 },
      { label: '65" - 74"', min: 65, max: 74 },
      { label: '55" - 64"', min: 55, max: 64 },
      { label: '46" - 54"', min: 46, max: 54 },
      { label: '39" - 45"', min: 39, max: 45 },
      { label: '32" - 38"', min: 32, max: 38 },
      { label: '24" - 31"', min: 24, max: 31 },
    ];
    const sizeOptions = sizeRanges.map(r => {
      const count = products.filter(p => {
        const m = p.name.match(/\b(\d{2,3})(?:"|″|\s)/);
        const size = m ? parseInt(m[1]) : 0;
        return size >= r.min && size <= r.max;
      }).length;
      return { label: r.label, count };
    }).filter(o => o.count > 0);
    if (sizeOptions.length > 0) {
      filters.push({ name: 'Screen Size', isExpanded: true, type: 'checkbox', options: sizeOptions });
    }
  }
  
  return filters;
}

// ========== CATEGORY DATA ==========

// Category 1: TVs
const tvProducts_p1 = [
  {"productId":"10281549","name":"LG C5 55\" OLED evo AI 4K HDR Smart TV 2025 - OLED55C54LA","brand":"LG","url":"https://www.currys.co.uk/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html","price":1299,"wasPrice":1353.12,"savings":54.12,"rating":4.8,"reviewCount":538,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10281549?$g-small$&fmt=auto","keySpecs":["Advanced OLED α9 AI processor with AI Super Upscaling","Stunning brightness with Brightness Booster Ultimate","Refresh rate: 120 Hz","HDMI 2.1 x 4","5 year guarantee","LG's webOS gives you easy access to all your must-have apps"],"badges":["Loved by Currys","Dolby Vision Atmos"],"offers":["Claim £100 cashback on this TV.+4 more offers"],"inStock":true,"energyRating":"F"},
  {"productId":"10282706","name":"SAMSUNG S90F 65\" OLED 4K Vision AI Smart TV 2025 - QE65S90F","brand":"SAMSUNG","url":"https://www.currys.co.uk/products/samsung-s90f-65-oled-4k-vision-ai-smart-tv-2025-qe65s90f-10282706.html","price":1599,"wasPrice":1749,"savings":150,"rating":4.8,"reviewCount":128,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282706?$g-small$&fmt=auto","keySpecs":["NQ4 AI Gen3 Processor: Samsung's best AI 4K processor","OLED HDR+ for pure blacks & vivid colour","Refresh rate: 120 Hz (up to 144 Hz)","HDMI 2.1 x 4","5 year guarantee","Samsung Smart TV has a large choice of apps & services"],"badges":["Award: Trusted Reviews Recommended","Loved by Currys"],"offers":["Get £150 off this TV when you trade-in any old TV. Use TRADETV150 and select Recycling at checkout.+5 more offers"],"inStock":true,"energyRating":"F"},
  {"productId":"10283696","name":"HISENSE U7Q PRO 55\" Mini LED 4K 165Hz Smart AI TV with Freely - 55U7QTUK PRO","brand":"HISENSE","url":"https://www.currys.co.uk/products/hisense-u7q-pro-55-mini-led-4k-165hz-smart-ai-tv-with-freely-55u7qtuk-pro-10283696.html","price":699,"wasPrice":799,"savings":100,"rating":4.7,"reviewCount":505,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10283696?$g-small$&fmt=auto","keySpecs":["Mini LED PRO: 1000s of tiny MINI LEDs for an amazing image","Hi-View Engine PRO: Cutting-Edge AI powered processing","Refresh rate: 120 Hz (up to 165 Hz)","HDMI 2.1 x 4","5 year guarantee","Freely: Stream live & on demand TV for free"],"badges":["Loved by Currys","Dolby Vision Atmos"],"offers":["Get £50 off this TV when you trade-in any old TV. Use TRADETV50 and select Recycling at checkout.+3 more offers"],"inStock":true,"energyRating":"E"},
  {"productId":"10291777","name":"SONY BRAVIA 8A 55\" OLED 4K HDR AI Smart TV - K55XR8AB","brand":"SONY","url":"https://www.currys.co.uk/products/sony-bravia-8a-55-oled-4k-hdr-ai-smart-tv-k55xr8ab-10291777.html","price":1399,"wasPrice":1449,"savings":50,"rating":4.7,"reviewCount":835,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10291777?$g-small$&fmt=auto","keySpecs":["BRAVIA XR OLED with 8+ million self-illuminating pixels","Cinematic sound from screen with Acoustic Surface Audio+","Refresh rate: 120 Hz","HDMI 2.1 x 2 / HDMI 2.0b x 2","Claim a 5 year guarantee","5 movies included with Sony Pictures Core Streaming Service"],"badges":["Loved by Currys","Dolby Vision"],"offers":["Get £100 off this TV when you trade-in any old TV. Use TRADETV100 and select Recycling at checkout.+3 more offers"],"inStock":true,"energyRating":"F"},
  {"productId":"10284860","name":"SAMSUNG S90F 55\" OLED 4K Vision AI Smart TV 2025 - QE55S90F","brand":"SAMSUNG","url":"https://www.currys.co.uk/products/samsung-s90f-55-oled-4k-vision-ai-smart-tv-2025-qe55s90f-10284860.html","price":1199,"wasPrice":1299,"savings":100,"rating":4.8,"reviewCount":128,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10284860?$g-small$&fmt=auto","keySpecs":["NQ4 AI Gen3 Processor: Samsung's best AI 4K processor","OLED HDR+ for pure blacks & vivid colour","Refresh rate: 120 Hz (up to 144 Hz)","HDMI 2.1 x 4","5 year guarantee","Samsung Smart TV has a large choice of apps & services"],"badges":["Loved by Currys","Award: Trusted Reviews Recommended"],"offers":["Get £100 off this TV when you trade-in any old TV. Use TRADETV100 and select Recycling at checkout.+5 more offers"],"inStock":true,"energyRating":"G"},
  {"productId":"10282631","name":"SAMSUNG Q7F 55\" QLED 4K Vision AI Smart TV 2025 - QE55Q7F","brand":"SAMSUNG","url":"https://www.currys.co.uk/products/samsung-q7f-55-qled-4k-vision-ai-smart-tv-2025-qe55q7f-10282631.html","price":429,"wasPrice":529,"savings":100,"rating":4.7,"reviewCount":605,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282631?$g-small$&fmt=auto","keySpecs":["Q4 AI Processor brings true-to-life 4K detail to each scene","100% Colour Volume with real Quantum Dot","Refresh rate: 60 Hz","HDMI 1.4 x 3"],"badges":[],"offers":["Save 20% on selected TV Accessories when bought with this TV. Use code SAVE20TVACCS."],"inStock":true,"energyRating":"G"},
  {"productId":"10284234","name":"SHARP 2T-C40HD2725KB Roku TV 40\" Smart Full HD HDR LED TV","brand":"SHARP","url":"https://www.currys.co.uk/products/sharp-2tc40hd2725kb-roku-tv-40-smart-full-hd-hdr-led-tv-10284234.html","price":169.99,"wasPrice":179.99,"savings":10,"rating":4.4,"reviewCount":33,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10284234?$g-small$&fmt=auto","keySpecs":["Refresh rate: 60 Hz","HDMI 1.4 x 3","Roku TV provides access to 500000+ movies & TV shows","HDR: HDR10 / Hybrid Log-Gamma (HLG)"],"badges":[],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10283642","name":"SAMSUNG U8000F 75\" Crystal UHD 4K HDR Smart TV 2025 - UE75U8000F","brand":"SAMSUNG","url":"https://www.currys.co.uk/products/samsung-u8000f-75-crystal-uhd-4k-hdr-smart-tv-2025-ue75u8000f-10283642.html","price":649,"wasPrice":749,"savings":100,"rating":4.8,"reviewCount":718,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10283642?$g-small$&fmt=auto","keySpecs":["Crystal Processor 4K for intelligent 4K picture enhancement","Refresh rate: 60 Hz","HDMI 1.4 x 3"],"badges":[],"offers":[],"inStock":true,"energyRating":"G"},
  {"productId":"10275818","name":"JVC LT-40CT450 40\" Smart Full HD HDR LED TV","brand":"JVC","url":"https://www.currys.co.uk/products/jvc-lt40ct450-40-smart-full-hd-hdr-led-tv-10275818.html","price":189.99,"wasPrice":219.99,"savings":30,"rating":4.4,"reviewCount":43,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10275818?$g-small$&fmt=auto","keySpecs":["Refresh rate: 60 Hz","HDMI 1.4 x 2","HDR: HDR10 / Hybrid Log-Gamma (HLG)","Freely: Stream live & on demand TV for free"],"badges":[],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10275816","name":"JVC LT-24CT150 24\" Smart HD Ready HDR LED TV","brand":"JVC","url":"https://www.currys.co.uk/products/jvc-lt24ct150-24-smart-hd-ready-hdr-led-tv-10275816.html","price":129.99,"wasPrice":139,"savings":9.01,"rating":4.5,"reviewCount":129,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10275816?$g-small$&fmt=auto","keySpecs":["Refresh rate: 60 Hz","HDMI 1.4 x 2","HDR: HDR10 / Hybrid Log-Gamma (HLG)","Freely: Stream live & on demand TV for free"],"badges":[],"offers":[],"inStock":true,"energyRating":"D"},
  {"productId":"10283934","name":"TCL T6C 43\" QLED 4K HDR Smart Fire TV with Freely - 43T6C-UK","brand":"TCL","url":"https://www.currys.co.uk/products/tcl-t6c-43-qled-4k-hdr-smart-fire-tv-with-freely-43t6cuk-10283934.html","price":219,"wasPrice":249,"savings":30,"rating":4.7,"reviewCount":55,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10283934?$g-small$&fmt=auto","keySpecs":["Quantum Dot 1 billion colours for brighter detailed scenes","Dolby Vision HDR inspired by cinema technology","Refresh rate: 60 Hz","HDMI 2.1 x 3","2 year guarantee","Enjoy apps / Alexa skills / channels with Fire TV"],"badges":["Dolby Vision Atmos"],"offers":[],"inStock":true,"energyRating":"G"},
  {"productId":"10283886","name":"HISENSE A6Q 55\" LED 4K HDR Smart TV with Freely - 55A6QTUK","brand":"HISENSE","url":"https://www.currys.co.uk/products/hisense-a6q-55-led-4k-hdr-smart-tv-with-freely-55a6qtuk-10283886.html","price":329,"wasPrice":349,"savings":20,"rating":4.8,"reviewCount":3929,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10283886?$g-small$&fmt=auto","keySpecs":["4K Direct Lit Full Array: gives vivid colours & deep blacks","Hi-View Engine: continuously optimises and enhances content","Refresh rate: 60 Hz","HDMI 2.1 x 3","2 year guarantee","Freely: Stream live & on demand TV for free"],"badges":["Dolby Vision"],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10282625","name":"SAMSUNG QN70F 55\" Neo QLED 4K Mini LED Vision AI Smart TV 2025 - QE55QN70F","brand":"SAMSUNG","url":"https://www.currys.co.uk/products/samsung-qn70f-55-neo-qled-4k-mini-led-vision-ai-smart-tv-2025-qe55qn70f-10282625.html","price":729,"wasPrice":749,"savings":20,"rating":4.8,"reviewCount":107,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282625?$g-small$&fmt=auto","keySpecs":["NQ4 AI Gen2 Processor: Experience AI for superior viewing","Quantum Matrix Technology Slim with Mini LEDs","Refresh rate: 120 Hz (up to 144 Hz)","HDMI 2.1 x 4","5 year guarantee","Samsung Smart TV has a large choice of apps & services"],"badges":[],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10282792","name":"HISENSE E7Q 65\" QLED 4K Smart AI TV with Freely - 65E7QTUK","brand":"HISENSE","url":"https://www.currys.co.uk/products/hisense-e7q-65-qled-4k-smart-ai-tv-with-freely-65e7qtuk-10282792.html","price":699,"wasPrice":799,"savings":100,"rating":4.7,"reviewCount":505,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282792?$g-small$&fmt=auto","keySpecs":["Quantum Dot 1 billion colours for brighter detailed scenes","Hi-View Engine: continuously optimises and enhances content","Refresh rate: 60 Hz","HDMI 2.1 x 4","2 year guarantee","Freely: Stream live & on demand TV for free"],"badges":["Dolby Vision"],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10282778","name":"SONY BRAVIA 3 43\" LED 4K HDR AI Smart TV - K43S38BP","brand":"SONY","url":"https://www.currys.co.uk/products/sony-bravia-3-43-led-4k-hdr-ai-smart-tv-k43s38bp-10282778.html","price":519,"wasPrice":549,"savings":30,"rating":4.3,"reviewCount":423,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282778?$g-small$&fmt=auto","keySpecs":["Upscale to 4K with X1 AI Processor","Get the cinema package with Dolby Vision & Atmos","Refresh rate: 60 Hz","HDMI 2.0 x 4"],"badges":[],"offers":[],"inStock":true,"energyRating":"E"},
  {"productId":"10282141","name":"LG UA75 65\" LED 4K HDR Smart TV 2025 - 65UA75006LA","brand":"LG","url":"https://www.currys.co.uk/products/lg-ua75-65-led-4k-hdr-smart-tv-2025-65ua75006la-10282141.html","price":469,"wasPrice":499,"savings":30,"rating":4.5,"reviewCount":78,"imageUrl":"https://cdn.media.amplience.net/i/currysprod/10282141?$g-small$&fmt=auto","keySpecs":["Intelligent α7 AI processor with AI Super Upscaling","Filmmaker Mode for a stunning movie viewing experience","Refresh rate: 60 Hz","HDMI 2.0 x 3"],"badges":[],"offers":[],"inStock":true,"energyRating":"F"}
];

// Merge existing data with fresh scrape
function loadExistingProducts(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data.products || [];
  } catch { return []; }
}

// Process each category
const categories = [
  {
    slug: 'televisions/tvs',
    name: 'TVs',
    file: 'category-tvs.json',
    type: 'tvs',
    url: 'https://www.currys.co.uk/tv-and-audio/televisions/tvs',
    newProducts: tvProducts_p1
  }
];

// Save category file
function saveCategoryFile(cat, products) {
  const filters = buildFilters(products, cat.type);
  const output = {
    categoryName: cat.name,
    categorySlug: cat.slug,
    url: cat.url,
    scrapedAt: timestamp,
    totalProducts: products.length,
    filters,
    products
  };
  const filePath = path.join(DATA_DIR, cat.file);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`Saved ${cat.file}: ${products.length} products`);
}

// Process TVs
const existingTvs = loadExistingProducts(path.join(DATA_DIR, 'category-tvs.json'));
const tvMerged = mergeProducts([tvProducts_p1, existingTvs]);
saveCategoryFile(categories[0], tvMerged);

// Quick count
console.log(`\nTV products merged: ${tvMerged.length} unique (${tvProducts_p1.length} new + ${existingTvs.length} existing)`);
