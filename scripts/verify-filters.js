#!/usr/bin/env node
/**
 * verify-filters.js
 *
 * Comprehensive filter data verification:
 * 1. Structural integrity of filter arrays in category JSONs
 * 2. Duplicate group name detection
 * 3. Reference brand contamination check
 * 4. Excluded group name detection
 * 5. Hub vs listing page filter count validation
 *
 * Usage: node scripts/verify-filters.js
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'scrape');

const LISTING_FILES = [
  'category-tvs.json','soundbars.json','headphones.json','home-cinema-systems.json',
  'cables-accessories.json','remote-controls.json','tv-aerials.json','radios.json',
  'blu-ray-dvd-players.json','tv-wall-brackets.json'
];

const HUB_FILES = [
  'dvd-blu-ray.json','tv-accessories.json','digital-smart-tv.json','speakers-hifi.json'
];

const ALL_FILES = LISTING_FILES.concat(HUB_FILES);

const EXCLUDED_NAMES = ['Delivery & Collection', 'Delivery and Collection', 'Collect from store', 'Availability', 'OK'];
// Reference brand names to detect contamination — update per project
// (the clone should NOT contain the reference site's brand in filter labels)
const REFERENCE_BRANDS = ['currys', 'curry'];

let totalGroups = 0, totalOptions = 0, totalEmpty = 0, totalErrors = 0;

console.log('=== Filter Data Verification ===\n');

ALL_FILES.forEach(function(f) {
  const filePath = path.join(DATA_DIR, f);
  if (!fs.existsSync(filePath)) {
    console.log(f.padEnd(30) + ' MISSING FILE');
    totalErrors++;
    return;
  }

  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const filters = d.filters || [];
  const issues = [];

  // Check: filters array exists and is non-empty
  if (filters.length === 0) {
    issues.push('NO_FILTERS');
  }

  // Check each filter group
  const nonToggle = filters.filter(function(g) { return g.type !== 'toggle'; });
  const opts = nonToggle.reduce(function(s, g) { return s + g.options.length; }, 0);
  const empty = nonToggle.filter(function(g) { return g.options.length === 0; });

  // Check: duplicate group names
  const names = filters.map(function(g) { return g.name; });
  const dupes = names.filter(function(n, i) { return names.indexOf(n) !== i; });
  if (dupes.length > 0) {
    issues.push('DUPLICATES=' + dupes.join(','));
  }

  // Check: excluded group names
  filters.forEach(function(g) {
    if (EXCLUDED_NAMES.indexOf(g.name) !== -1) {
      issues.push('EXCLUDED_GROUP=' + g.name);
    }
  });

  // Check: reference brand contamination in option labels
  nonToggle.forEach(function(g) {
    g.options.forEach(function(o) {
      REFERENCE_BRANDS.forEach(function(brand) {
        if (o.label.toLowerCase().indexOf(brand) !== -1) {
          issues.push('REF_BRAND=' + g.name + ':' + o.label);
        }
      });
    });
  });

  // Check: valid filter types
  filters.forEach(function(g) {
    if (['checkbox', 'range', 'rating', 'toggle'].indexOf(g.type) === -1) {
      issues.push('INVALID_TYPE=' + g.name + ':' + g.type);
    }
  });

  // Check: empty groups (non-toggle)
  if (empty.length > 0) {
    issues.push('EMPTY=' + empty.map(function(g) { return g.name; }).join(','));
  }

  // Check: hub pages should have <= 4 groups (Brand, Price, Rating + toggle)
  var isHub = HUB_FILES.indexOf(f) !== -1;
  if (isHub && nonToggle.length > 3) {
    issues.push('HUB_TOO_MANY=' + nonToggle.length + ' (expected <=3)');
  }

  // Check: listing pages should have > 3 groups
  if (!isHub && nonToggle.length <= 3) {
    issues.push('LISTING_TOO_FEW=' + nonToggle.length + ' (expected >3)');
  }

  // Check: options have valid labels and counts
  nonToggle.forEach(function(g) {
    g.options.forEach(function(o) {
      if (!o.label || o.label.trim() === '') {
        issues.push('EMPTY_LABEL=' + g.name);
      }
      if (typeof o.count !== 'number' || o.count <= 0) {
        issues.push('BAD_COUNT=' + g.name + ':' + o.label + '=' + o.count);
      }
    });
  });

  totalGroups += nonToggle.length;
  totalOptions += opts;
  totalEmpty += empty.length;

  var status = issues.length > 0 ? ' ' + issues.join(' | ') : ' OK';
  if (issues.length > 0) totalErrors += issues.length;

  var prefix = isHub ? '[hub] ' : '      ';
  console.log(prefix + f.padEnd(30) + ' groups=' + nonToggle.length + ' opts=' + opts + ' prods=' + (d.products || []).length + status);
});

console.log('\n=== Summary ===');
console.log('Total: ' + totalGroups + ' filter groups, ' + totalOptions + ' options');
console.log('Empty groups: ' + totalEmpty);
console.log('Issues found: ' + totalErrors);
console.log('Status: ' + (totalErrors === 0 ? 'ALL CHECKS PASSED' : totalErrors + ' ISSUE(S) FOUND'));

process.exit(totalErrors > 0 ? 1 : 0);
