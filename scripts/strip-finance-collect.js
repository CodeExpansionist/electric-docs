#!/usr/bin/env node

/**
 * strip-finance-collect.js
 *
 * Removes finance/credit and in-store collection fields from all product JSON files.
 * Fields removed:
 *   - flexpay (and all sub-fields)
 *   - monthlyPayment
 *   - collectionAvailable, collectionTime, collectionFree (from deliveryInfo)
 */

const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '..', 'data', 'scrape', 'products');

const FINANCE_KEYS = ['flexpay', 'monthlyPayment'];
const COLLECTION_KEYS = ['collectionAvailable', 'collectionTime', 'collectionFree'];

let filesModified = 0;
let financeRemoved = 0;
let collectionRemoved = 0;

const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(productsDir, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    continue;
  }

  let modified = false;

  // Remove top-level finance fields
  for (const key of FINANCE_KEYS) {
    if (key in data) {
      delete data[key];
      financeRemoved++;
      modified = true;
    }
  }

  // Remove collection fields from deliveryInfo
  if (data.deliveryInfo && typeof data.deliveryInfo === 'object') {
    for (const key of COLLECTION_KEYS) {
      if (key in data.deliveryInfo) {
        delete data.deliveryInfo[key];
        collectionRemoved++;
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    filesModified++;
  }
}

console.log(`\nStrip Finance & Collection — Complete`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Finance fields removed: ${financeRemoved}`);
console.log(`Collection fields removed: ${collectionRemoved}`);
