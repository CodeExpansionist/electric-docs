#!/usr/bin/env node
/**
 * scrape-category-pages.js
 *
 * Fetches all products from Currys category listing pages by directly
 * requesting the HTML and parsing embedded product data.
 *
 * Currys uses Salesforce Commerce Cloud which embeds product data in
 * the HTML response. We parse product cards from the HTML.
 *
 * Usage: node scripts/scrape-category-pages.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'scrape');

const CATEGORIES = [
  {
    name: 'TVs',
    url: 'https://www.electriz.co.uk/tv-and-audio/televisions/tvs',
    file: 'category-tvs.json',
    expectedTotal: 420,
  },
  {
    name: 'Soundbars',
    url: 'https://www.electriz.co.uk/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars',
    file: 'soundbars.json',
    expectedTotal: 150,
  },
  {
    name: 'Speakers & Hi-Fi',
    url: 'https://www.electriz.co.uk/tv-and-audio/speakers-and-hi-fi-systems',
    file: 'speakers-hifi.json',
    expectedTotal: 490,
  },
  {
    name: 'DVD/Blu-ray',
    url: 'https://www.electriz.co.uk/tv-and-audio/dvd-blu-ray-and-home-cinema',
    file: 'dvd-blu-ray.json',
    expectedTotal: 25,
  },
  {
    name: 'TV Accessories',
    url: 'https://www.electriz.co.uk/tv-and-audio/tv-accessories',
    file: 'tv-accessories.json',
    expectedTotal: 350,
  },
  {
    name: 'Digital & Smart TV',
    url: 'https://www.electriz.co.uk/tv-and-audio/digital-and-smart-tv',
    file: 'digital-smart-tv.json',
    expectedTotal: 20,
  },
  {
    name: 'Headphones',
    url: 'https://www.electriz.co.uk/tv-and-audio/headphones/headphones',
    file: 'headphones.json',
    expectedTotal: 830,
  },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.5',
  'Accept-Encoding': 'identity',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirects
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://www.electriz.co.uk${res.headers.location}`;
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, statusCode: res.statusCode }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractProductsFromHtml(html) {
  const products = [];

  // Strategy 1: Look for product card data in structured patterns
  // Currys product cards follow patterns like:
  // data-product-sku="10281549"
  // data-product-name="..."
  // data-product-price="1299"

  // Strategy 2: Parse product links and extract IDs
  const productUrlPattern = /href="(\/products\/[^"]+?-(\d{7,8})\.html)"/g;
  const urls = new Map(); // Use Map to deduplicate by product ID
  let match;

  while ((match = productUrlPattern.exec(html)) !== null) {
    const [, urlPath, productId] = match;
    if (!urls.has(productId)) {
      urls.set(productId, urlPath);
    }
  }

  // Strategy 3: Look for JSON data embedded in script tags
  // SFCC often embeds product data in analytics/data layer
  const jsonPatterns = [
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/,
    /dataLayer\.push\(({[\s\S]*?})\);/g,
    /"products"\s*:\s*(\[[\s\S]*?\])/,
  ];

  // Strategy 4: Parse product cards from HTML structure
  // Look for product name, price, rating patterns near product URLs
  for (const [productId, urlPath] of urls) {
    const product = extractProductDetails(html, productId, urlPath);
    if (product) {
      products.push(product);
    }
  }

  // Try to extract total product count
  let totalProducts = 0;
  const totalMatch = html.match(/(\d{1,4})\s*(?:results?|products?|items?)\b/i);
  if (totalMatch) {
    totalProducts = parseInt(totalMatch[1]);
  }
  // Also try specific patterns like "1 - 20 of 417"
  const rangeMatch = html.match(/of\s+(\d{1,4})/);
  if (rangeMatch && parseInt(rangeMatch[1]) > totalProducts) {
    totalProducts = parseInt(rangeMatch[1]);
  }

  return { products, totalProducts };
}

function extractProductDetails(html, productId, urlPath) {
  // Find the region of HTML around this product URL
  const urlIndex = html.indexOf(urlPath);
  if (urlIndex === -1) return null;

  // Get a chunk of HTML around this product (product card is typically within ~3000 chars)
  const start = Math.max(0, urlIndex - 2000);
  const end = Math.min(html.length, urlIndex + 3000);
  const chunk = html.substring(start, end);

  // Extract product name - look for title/heading near the URL
  let name = '';
  const namePatterns = [
    new RegExp(`data-product-name="([^"]+)"`, 'i'),
    new RegExp(`title="([^"]*${productId}[^"]*)"`, 'i'),
    new RegExp(`<(?:h[1-6]|a|span)[^>]*>([^<]*(?:${productId}|TV|Sound|Speaker|Headphone)[^<]*)<`, 'i'),
  ];
  for (const p of namePatterns) {
    const m = chunk.match(p);
    if (m && m[1].length > 10) { name = m[1].trim(); break; }
  }

  // Extract price
  let price = 0;
  const priceMatch = chunk.match(/(?:data-product-price|"price"|£|data-price)[\s:="]*(\d+(?:\.\d{1,2})?)/i);
  if (priceMatch) price = parseFloat(priceMatch[1]);

  // Extract brand
  let brand = '';
  const brandMatch = chunk.match(/data-product-brand="([^"]+)"/i);
  if (brandMatch) brand = brandMatch[1];

  // Extract image URL
  let imageUrl = null;
  const imgMatch = chunk.match(/(?:src|data-src)="(https?:\/\/[^"]*(?:electrizprod|amplience)[^"]*\d{7,8}[^"]*)"/i);
  if (imgMatch) imageUrl = imgMatch[1];

  // Extract rating
  let rating = 0;
  let reviewCount = 0;
  const ratingMatch = chunk.match(/(\d+\.?\d*)\s*(?:out of 5|stars|\/5)/i);
  if (ratingMatch) rating = parseFloat(ratingMatch[1]);
  const reviewMatch = chunk.match(/(\d+)\s*(?:reviews?|ratings?)/i);
  if (reviewMatch) reviewCount = parseInt(reviewMatch[1]);

  return {
    name: name || `Product ${productId}`,
    brand: brand || '',
    price: { current: price, was: null, savings: null },
    rating: { average: rating, count: reviewCount },
    url: urlPath.startsWith('http') ? urlPath.replace('https://www.electriz.co.uk', '') : urlPath,
    imageUrl,
    productId,
    specs: [],
    badges: [],
    offers: [],
    deliveryFree: true,
    energyRating: null,
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCategory(category) {
  console.log(`\n=== Scraping ${category.name} ===`);
  console.log(`URL: ${category.url}`);

  const allProducts = new Map();
  let totalProducts = 0;
  let page = 1;
  let consecutiveEmpty = 0;
  const maxPages = Math.ceil(category.expectedTotal / 20) + 2;

  while (page <= maxPages && consecutiveEmpty < 2) {
    const pageUrl = page === 1 ? category.url : `${category.url}?page=${page}`;
    console.log(`  Page ${page}: ${pageUrl}`);

    try {
      const { html, statusCode } = await fetchPage(pageUrl);
      console.log(`    Status: ${statusCode}, HTML length: ${html.length}`);

      if (statusCode !== 200) {
        console.log(`    Skipping (non-200 status)`);
        consecutiveEmpty++;
        page++;
        continue;
      }

      const result = extractProductsFromHtml(html);

      if (result.totalProducts > totalProducts) {
        totalProducts = result.totalProducts;
        console.log(`    Total products on site: ${totalProducts}`);
      }

      if (result.products.length === 0) {
        console.log(`    No products found on this page`);
        consecutiveEmpty++;
      } else {
        consecutiveEmpty = 0;
        let newCount = 0;
        for (const p of result.products) {
          if (!allProducts.has(p.productId)) {
            allProducts.set(p.productId, p);
            newCount++;
          }
        }
        console.log(`    Found ${result.products.length} products (${newCount} new, ${allProducts.size} total)`);
      }

    } catch (err) {
      console.log(`    Error: ${err.message}`);
      consecutiveEmpty++;
    }

    page++;
    await sleep(1000); // Be respectful
  }

  console.log(`  Final: ${allProducts.size} unique products scraped for ${category.name}`);
  return { products: Array.from(allProducts.values()), totalProducts };
}

async function main() {
  console.log('Starting category scraping...\n');
  console.log('Testing with a single page first to validate approach...\n');

  // Test with one page
  const testUrl = 'https://www.electriz.co.uk/tv-and-audio/televisions/tvs';
  try {
    const { html, statusCode } = await fetchPage(testUrl);
    console.log(`Test fetch: status=${statusCode}, length=${html.length}`);

    // Check if we got actual HTML content
    if (html.includes('product') || html.includes('electriz')) {
      console.log('Got HTML content with product/electriz references');
    }

    // Check for bot detection
    if (html.includes('captcha') || html.includes('blocked') || html.includes('cloudflare')) {
      console.log('WARNING: Possible bot detection! May need Firecrawl instead.');
      console.log('First 500 chars:', html.substring(0, 500));
      return;
    }

    // Try extracting products
    const result = extractProductsFromHtml(html);
    console.log(`Extracted ${result.products.length} products, total: ${result.totalProducts}`);

    if (result.products.length > 0) {
      console.log('Sample product:', JSON.stringify(result.products[0], null, 2));
    } else {
      // Output some HTML for debugging
      console.log('\nNo products extracted. Checking HTML structure...');

      // Look for common product-related strings
      const patterns = [
        'data-product', 'productUrl', 'product-card', 'product-list',
        'ProductCard', 'product_', 'addToBasket', 'productId',
        'data-sku', 'data-name', 'data-price',
      ];
      for (const p of patterns) {
        const count = (html.match(new RegExp(p, 'gi')) || []).length;
        if (count > 0) console.log(`  "${p}" found ${count} times`);
      }

      // Save HTML for analysis
      fs.writeFileSync('/tmp/electriz-test.html', html);
      console.log('\nSaved HTML to /tmp/electriz-test.html for analysis');
    }
  } catch (err) {
    console.error('Test fetch failed:', err.message);
  }
}

main().catch(console.error);
