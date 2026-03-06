#!/usr/bin/env node
/**
 * Download all product images from Currys CDN to local storage.
 *
 * Structure: public/images/products/{productId}/
 *   main.webp        - listing image
 *   large.webp       - gallery main
 *   gallery_001.webp - gallery variant 1
 *   gallery_002.webp - gallery variant 2 (etc.)
 *   thumb.webp       - thumbnail main
 *   thumb_001.webp   - thumbnail variant 1 (etc.)
 *
 * Usage: node scripts/download-images.js [--concurrency=10] [--skip-gallery]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'images', 'products');
const DATA_DIR = path.resolve(__dirname, '..', 'data', 'scrape');

// Parse CLI args
const args = process.argv.slice(2);
const concurrency = parseInt((args.find(a => a.startsWith('--concurrency=')) || '').split('=')[1]) || 10;
const skipGallery = args.includes('--skip-gallery');
const mainOnly = args.includes('--main-only');

// CDN URL patterns
const CDN_BASE = 'https://media.electriz.biz/i/electrizprod';

function buildUrls(productId) {
  const urls = [];

  // Main listing image
  urls.push({
    url: `${CDN_BASE}/${productId}?$g-small$&fmt=auto`,
    file: 'main.webp',
    required: true,
  });

  if (mainOnly) return urls;

  // Large image
  urls.push({
    url: `${CDN_BASE}/${productId}?$l-large$&fmt=auto`,
    file: 'large.webp',
    required: false,
  });

  if (skipGallery) return urls;

  // Gallery variants (001-010)
  for (let i = 1; i <= 10; i++) {
    const num = String(i).padStart(3, '0');
    urls.push({
      url: `${CDN_BASE}/${productId}_${num}?$l-large$&fmt=auto`,
      file: `gallery_${num}.webp`,
      required: false,
      stopOnMissing: true, // Stop gallery download on first 404
    });
  }

  // Thumbnails
  urls.push({
    url: `${CDN_BASE}/${productId}?$t-thumbnail$&fmt=auto`,
    file: 'thumb.webp',
    required: false,
  });

  for (let i = 1; i <= 10; i++) {
    const num = String(i).padStart(3, '0');
    urls.push({
      url: `${CDN_BASE}/${productId}_${num}?$t-thumbnail$&fmt=auto`,
      file: `thumb_${num}.webp`,
      required: false,
      stopOnMissing: true,
    });
  }

  return urls;
}

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(filepath);
        return download(res.headers.location, filepath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        return resolve({ success: false, status: res.statusCode });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        try {
          if (!fs.existsSync(filepath)) {
            return resolve({ success: false, status: 'missing' });
          }
          const stats = fs.statSync(filepath);
          // If file is too small (< 500 bytes), it's likely an error page
          if (stats.size < 500) {
            fs.unlinkSync(filepath);
            return resolve({ success: false, status: 'too_small' });
          }
          resolve({ success: true, size: stats.size });
        } catch (err) {
          resolve({ success: false, status: 'stat_error' });
        }
      });
    }).on('error', (err) => {
      file.close();
      try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch (_) {}
      reject(err);
    });
  });
}

async function downloadWithRetry(url, filepath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await download(url, filepath);
    } catch (err) {
      if (i === retries - 1) return { success: false, error: err.message };
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function downloadProductImages(productId) {
  const dir = path.join(IMAGES_DIR, productId);

  // Check if large image already exists (skip fully-downloaded products)
  // Note: main.webp may exist from --main-only run; large.webp means full download was done
  if (fs.existsSync(path.join(dir, 'large.webp'))) {
    return { productId, skipped: true };
  }

  fs.mkdirSync(dir, { recursive: true });

  const urls = buildUrls(productId);
  let downloaded = 0;
  let failed = 0;
  let totalSize = 0;
  let stopGallery = false;
  let stopThumbs = false;

  for (const item of urls) {
    // Skip gallery/thumb variants after first 404
    if (item.stopOnMissing && item.file.startsWith('gallery_') && stopGallery) continue;
    if (item.stopOnMissing && item.file.startsWith('thumb_') && stopThumbs) continue;

    const filepath = path.join(dir, item.file);
    if (fs.existsSync(filepath)) {
      downloaded++;
      continue;
    }

    const result = await downloadWithRetry(item.url, filepath);
    if (result.success) {
      downloaded++;
      totalSize += result.size || 0;
    } else {
      failed++;
      if (item.stopOnMissing) {
        if (item.file.startsWith('gallery_')) stopGallery = true;
        if (item.file.startsWith('thumb_')) stopThumbs = true;
      }
    }
  }

  return { productId, downloaded, failed, totalSize };
}

async function processQueue(productIds, concurrentLimit) {
  let index = 0;
  let completed = 0;
  let totalDownloaded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalSize = 0;
  const startTime = Date.now();

  async function worker() {
    while (index < productIds.length) {
      const currentIndex = index++;
      const productId = productIds[currentIndex];

      const result = await downloadProductImages(productId);
      completed++;

      if (result.skipped) {
        totalSkipped++;
      } else {
        totalDownloaded += result.downloaded || 0;
        totalFailed += result.failed || 0;
        totalSize += result.totalSize || 0;
      }

      // Progress update every 50 products
      if (completed % 50 === 0 || completed === productIds.length) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const eta = Math.round((productIds.length - completed) / rate);
        const sizeMB = (totalSize / 1024 / 1024).toFixed(1);
        process.stdout.write(
          `\r  Progress: ${completed}/${productIds.length} (${totalSkipped} skipped, ${totalDownloaded} images, ${sizeMB}MB, ETA: ${eta}s)     `
        );
      }
    }
  }

  const workers = Array.from({ length: concurrentLimit }, () => worker());
  await Promise.all(workers);

  console.log('');
  return { totalDownloaded, totalFailed, totalSkipped, totalSize };
}

async function main() {
  console.log('Product Image Downloader');
  console.log(`  Concurrency: ${concurrency}`);
  console.log(`  Mode: ${mainOnly ? 'main only' : skipGallery ? 'main + large' : 'full (main + large + gallery + thumbs)'}`);
  console.log('');

  // Collect all product IDs from category files
  const categoryFiles = [
    'category-tvs.json', 'headphones.json', 'soundbars.json',
    'speakers-hifi.json', 'tv-accessories.json', 'dvd-blu-ray.json',
    'digital-smart-tv.json',
  ];

  const productIds = new Set();
  for (const file of categoryFiles) {
    const filepath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filepath)) continue;
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    for (const p of (data.products || [])) {
      const id = p.productId;
      if (id) productIds.add(id);
    }
  }

  console.log(`Found ${productIds.size} products to download images for`);

  // Create base directory
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const result = await processQueue(Array.from(productIds), concurrency);

  console.log(`\nDone!`);
  console.log(`  Products processed: ${productIds.size}`);
  console.log(`  Products skipped (already done): ${result.totalSkipped}`);
  console.log(`  Images downloaded: ${result.totalDownloaded}`);
  console.log(`  Images failed: ${result.totalFailed}`);
  console.log(`  Total size: ${(result.totalSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(console.error);
