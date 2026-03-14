#!/usr/bin/env node
/**
 * scrape-category-filters.js
 *
 * Parse filter sidebar data from scraped markdown and merge into category JSONs.
 * Designed for use with Firecrawl-scraped listing pages.
 *
 * Usage:
 *   node scripts/scrape-category-filters.js parse <markdown-file>     — Parse markdown → JSON filters
 *   node scripts/scrape-category-filters.js merge <slug> <json-file>  — Merge filter JSON into category file
 *   node scripts/scrape-category-filters.js urls                      — Print category URLs to scrape
 *
 * Firecrawl scrape settings for each category:
 *   formats: ["markdown"]
 *   location: { country: "GB", languages: ["en-GB"] }
 *   proxy: "stealth"
 *   maxAge: 0
 *
 * Workflow:
 *   1. Scrape listing page with Firecrawl → save markdown to file
 *   2. node scripts/scrape-category-filters.js parse <markdown-file> > filters.json
 *   3. node scripts/scrape-category-filters.js merge <slug> filters.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'scrape');

// Category URL mapping — all listing-page categories (not hub pages)
const CATEGORIES = {
  'tvs': {
    url: 'https://www.currys.co.uk/televisions/tvs',
    file: 'category-tvs.json',
    name: 'TVs',
  },
  'soundbars': {
    url: 'https://www.currys.co.uk/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars',
    file: 'soundbars.json',
    name: 'Soundbars',
  },
  'headphones': {
    url: 'https://www.currys.co.uk/headphones',
    file: 'headphones.json',
    name: 'Headphones',
  },
  'home-cinema-systems': {
    url: 'https://www.currys.co.uk/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems',
    file: 'home-cinema-systems.json',
    name: 'Home Cinema Systems',
  },
  'cables-accessories': {
    url: 'https://www.currys.co.uk/cables-and-accessories',
    file: 'cables-accessories.json',
    name: 'Cables & Accessories',
  },
  'remote-controls': {
    url: 'https://www.currys.co.uk/remote-controls',
    file: 'remote-controls.json',
    name: 'Remote Controls',
  },
  'tv-aerials': {
    url: 'https://www.currys.co.uk/tv-aerials',
    file: 'tv-aerials.json',
    name: 'TV Aerials',
  },
  'radios': {
    url: 'https://www.currys.co.uk/radios',
    file: 'radios.json',
    name: 'Radios',
  },
  'blu-ray-dvd-players': {
    url: 'https://www.currys.co.uk/dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players',
    file: 'blu-ray-dvd-players.json',
    name: 'Blu-ray & DVD Players',
  },
  'tv-wall-brackets': {
    url: 'https://www.currys.co.uk/tv-wall-brackets',
    file: 'tv-wall-brackets.json',
    name: 'TV Wall Brackets',
  },
};

// Filter group names to exclude (not applicable to clone)
const EXCLUDE_GROUPS = [
  'Delivery & Collection',
  'Delivery and Collection',
  'Collect from store',
  'Availability',
  'OK', // Tooltip close button artifacts
];

// Brand name to replace
const BRAND_RENAME = { 'Loved by Electriz': 'Loved by Electriz' };

/**
 * Parse filter groups from Firecrawl markdown output.
 * Handles: checkboxes, price ranges, star ratings, screen sizes, energy ratings.
 */
function parseFiltersFromMarkdown(markdown) {
  // Normalize escaped characters
  let md = markdown
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');

  const filters = [];
  const lines = md.split('\n');

  let currentGroup = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect filter group headers (### or #### level)
    const headerMatch = line.match(/^#{2,4}\s+(.+)$/);
    if (headerMatch) {
      const name = headerMatch[1].trim().replace(/\\/g, '').trim();

      if (EXCLUDE_GROUPS.includes(name)) continue;
      if (name.length < 2 || name.length > 60) continue;
      if (/^\d+$/.test(name)) continue; // Skip pure numbers

      // Save previous group
      if (currentGroup && currentGroup.options.length > 0) {
        filters.push(currentGroup);
      }

      const displayName = BRAND_RENAME[name] || name;
      currentGroup = {
        name: displayName,
        isExpanded: filters.length < 5,
        type: 'checkbox',
        options: [],
      };

      // Detect special types
      if (/price/i.test(name)) currentGroup.type = 'range';
      if (/rating/i.test(name)) currentGroup.type = 'rating';
      if (/hide out of stock/i.test(name)) {
        currentGroup.type = 'toggle';
        currentGroup.options = [];
        filters.push(currentGroup);
        currentGroup = null;
      }

      continue;
    }

    if (!currentGroup) continue;

    // Parse filter options: "Label (count)" or "- [ ] Label (count)" or "Label count"
    // Pattern 1: "Label (123)"
    let optMatch = line.match(/^[-*]?\s*(?:\[.\]\s*)?(.+?)\s*\((\d{1,5})\)\s*$/);
    if (!optMatch) {
      // Pattern 2: "Label 123" at end of line (no parens)
      optMatch = line.match(/^[-*]?\s*(?:\[.\]\s*)?(.+?)\s+(\d{1,5})\s*$/);
    }

    if (optMatch) {
      let label = optMatch[1].trim().replace(/\\/g, '').replace(/\*+/g, '').trim();
      const count = parseInt(optMatch[2], 10);

      if (!label || count === 0) continue;
      if (label.toLowerCase().includes('collect from store')) continue;

      // Apply brand rename
      if (BRAND_RENAME[label]) label = BRAND_RENAME[label];

      // Clean trailing punctuation
      label = label.replace(/[\\:]+$/, '').trim();

      currentGroup.options.push({ label, count });
    }
  }

  // Save last group
  if (currentGroup && currentGroup.options.length > 0) {
    filters.push(currentGroup);
  }

  return filters;
}

/**
 * Merge filter data into an existing category JSON file.
 */
function mergeFilters(slug, filtersJson) {
  const cat = CATEGORIES[slug];
  if (!cat) {
    console.error(`Unknown category slug: ${slug}`);
    console.error('Valid slugs:', Object.keys(CATEGORIES).join(', '));
    process.exit(1);
  }

  const catPath = path.join(DATA_DIR, cat.file);
  if (!fs.existsSync(catPath)) {
    console.error(`Category file not found: ${catPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  const filters = typeof filtersJson === 'string'
    ? JSON.parse(fs.readFileSync(filtersJson, 'utf8'))
    : filtersJson;

  data.filters = filters;
  fs.writeFileSync(catPath, JSON.stringify(data, null, 2));
  console.log(`Merged ${filters.length} filter groups into ${cat.file}`);
}

// CLI
const [,, command, ...args] = process.argv;

if (command === 'parse') {
  if (!args[0]) {
    console.error('Usage: node scripts/scrape-category-filters.js parse <markdown-file>');
    process.exit(1);
  }
  const md = fs.readFileSync(args[0], 'utf8');
  const filters = parseFiltersFromMarkdown(md);
  console.log(JSON.stringify(filters, null, 2));
  console.error(`Parsed ${filters.length} filter groups`);
}
else if (command === 'merge') {
  if (args.length < 2) {
    console.error('Usage: node scripts/scrape-category-filters.js merge <slug> <json-file>');
    process.exit(1);
  }
  mergeFilters(args[0], args[1]);
}
else if (command === 'urls') {
  console.log('Category URLs for Firecrawl scraping:\n');
  for (const [slug, cat] of Object.entries(CATEGORIES)) {
    console.log(`  ${slug.padEnd(25)} ${cat.url}`);
  }
  console.log('\nFirecrawl settings: formats=["markdown"], location={country:"GB"}, proxy="stealth", maxAge=0');
}
else {
  console.log('Usage:');
  console.log('  parse <markdown-file>       — Parse filter sidebar from scraped markdown');
  console.log('  merge <slug> <json-file>    — Merge filter JSON into category data file');
  console.log('  urls                        — Print category URLs for scraping');
}
