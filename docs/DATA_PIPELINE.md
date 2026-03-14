# Data Pipeline

> **Authority:** Reference — code-level truth is `scripts/`. This document explains the pipeline order and when to re-run.

## Current Data State

> Last updated: 2026-03-14 (source: `data/repo-facts.json`)

| Metric | Value |
| --- | --- |
| Total products | 2,321 |
| Total categories | 14 |
| Total images | 37,740+ |
| Product detail coverage | 99.9% (2,318 of 2,321 have scraped detail files) |
| Products missing `main.webp` | 4 (see [KNOWN_ISSUES.md](KNOWN_ISSUES.md)) |
| Last full pipeline run | 2026-03-09 |

To refresh these numbers, run `npm run facts` and check `data/repo-facts.json`.

## Overview

The data pipeline scrapes product data from the live Electriz website, normalizes it, downloads images, and builds the static JSON files that power the application. All scripts live in `scripts/` and are run manually with Node.js.

```
Live Site → Scrape → Normalize → Build Indexes → Download Images → Verify
```

## Pipeline Order

Run scripts in this order. Each step depends on the output of the previous step.

### Phase 1: Scraping

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 1 | `scrape-category-pages.js` | Live Electriz category URLs | `data/scrape/category-*.json` | Fetches category listing pages, extracts product cards, filters, and metadata. Uses Firecrawl MCP with UK locale. |
| 2 | `save-all-categories.js` | Category page scrapes | `data/scrape/category-*.json` | Saves individual category JSON files from bulk scrape results. |
| 3 | `save-product-details.js` | Product page scrapes | `data/scrape/products/{id}.json` | Saves individual product detail JSON files from bulk scrape results. |

### Phase 2: Recovery & Enrichment

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 4 | `find-missing-products.js` | Category JSONs + product directory | `data/scrape/missing-products.json` | Identifies products listed in categories that have no detail file. |
| 5 | `generate-product-details.js` | Category JSONs + missing list | `data/scrape/products/{id}.json` | Creates product detail files from category data for products that failed individual scraping. |

### Phase 3: Normalization

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 6 | `normalize-scrape-batch1.js` | Raw product JSONs | Normalized product JSONs | Converts flat price/rating fields to nested objects, standardizes field names (`productUrl` → `url`), ensures IDs are strings. |
| 7 | `strip-finance-collect.js` | Product + category JSONs | Cleaned JSONs | Removes finance-related fields (monthly payments, credit terms) and collection-related content not applicable to this clone. |

### Phase 4: Building

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 8 | `build-all-categories.js` | All category JSONs | Merged category JSONs | 8-step merge pipeline: deduplicate products across categories, normalize prices, sort, rebuild filter counts. |
| 9 | `build-products-index.js` | `data/scrape/products/` | `data/scrape/products-index.json` | Builds the master product index (object keyed by product ID) used by `product-data.ts` for O(1) lookups. |
| 10 | `analyze-tv-families.js` | TV product data | Analysis output | Groups TVs by model family (e.g., Samsung QN85D across 55"/65"/75") for size variant linking. |
| 11 | `propagate-tv-data.js` | TV family analysis | Enriched TV JSONs | Copies rich data (specs, gallery, description) from the most complete product in a family to its siblings. |
| 12 | `add-missing-variants.js` | TV family data | Updated size links | Adds size variant links verified via Firecrawl scraping. |
| 13 | `build-size-variants.js` | TV product data | `data/scrape/size-variants.json` | Builds the `productToVariants` mapping for the size selector on product detail pages. |
| 14 | `build-all-tv-products.js` | Multiple TV sources | Final TV JSONs | Three-source merge (category + scraped + propagated) with priority ordering. |

### Phase 5: Assets

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 15 | `download-images.js` | Product data with CDN URLs | `public/images/products/{id}/` | Downloads all product images (main, large, gallery, thumbnail variants). Supports `--concurrency` and `--skip-gallery` flags. |

### Phase 6: Verification

| # | Script | Input | Output | Description |
|---|--------|-------|--------|-------------|
| 16 | `verify-coverage.js` | All data + images | Coverage report | Reports product detail coverage, image coverage, and data completeness stats. |

### Utility Scripts (Not Part of Main Pipeline)

| Script | Purpose |
|--------|---------|
| `create-page-content.js` | Generates static page content JSON for footer pages (delivery, returns, etc.) |

## When to Re-run

| Scenario | Scripts to Run |
|----------|---------------|
| Fresh data from scratch | All scripts, phases 1–6 |
| New products added to existing categories | 1 → 4 → 5 → 6 → 8 → 9 → 15 → 16 |
| Fix missing product data | 4 → 5 → 9 → 15 → 16 |
| TV size variants out of date | 10 → 11 → 12 → 13 → 14 |
| Images missing or corrupt | 15 → 16 |
| Verify current state | 16 only |

## Firecrawl Best Practices

All scraping scripts use the Firecrawl MCP tool.

### Ground rules

- **No CSS/layout extraction** — do not extract CSS or layout during scrapes; it's inaccurate and not needed.
- **No full crawls** — targeted scrapes only; full crawls are off the table.
- **Quality over speed** — cost is not a factor; get the data right rather than fast.

### Configuration

- **UK locale required**: All scrapes must include `location: { country: "GB", languages: ["en-GB"] }`. Firecrawl defaults to US proxies — without this, prices may return in USD and geo-targeted content will differ.
- **Caching**: `maxAge: 86400000` (1-day cache, ~5x faster) for dev iteration. `maxAge: 0` for fresh data. Always `maxAge: 0` for `/update-data` and `/recover-missing`.
- **Batch limit**: Max 20 parallel `firecrawl_scrape` calls per batch. Higher risks rate limiting.
- **Lazy content**: If a product scrape returns empty specs or <3 gallery images, retry with `actions: [{ type: "scroll", direction: "down" }, { type: "wait", milliseconds: 2000 }]`.

### Resource management

- **Browser sessions**: Always call `firecrawl_browser_delete` after `firecrawl_browser_create`. Orphaned sessions cost 2 credits/min.
- **Credit costs**: JSON format = +4 credits/page. Agent = dynamic pricing. Browser = 2 credits/min. Enhanced proxy = +4 credits/page.

### Special cases

- **Link checking**: Use `firecrawl_crawl` on localhost for page discovery, then manual HTTP checks for image integrity.
- **Dynamic video/media**: JS-injected `<video>` elements don't appear in Firecrawl's structured output. Search the raw scraped HTML (`rawHtml` or markdown) for `.mp4`/`.webm` URL patterns to extract dynamically loaded media URLs.

## Output File Formats

### Category JSON (`data/scrape/category-tvs.json`)

```json
{
  "categoryName": "TVs",
  "categorySlug": "televisions/tvs",
  "breadcrumbs": ["Home", "TV & Audio", "Televisions", "All TVs"],
  "totalProducts": 245,
  "filters": [{ "name": "Brand", "type": "checkbox", "options": [...] }],
  "products": [{ "name": "...", "brand": "...", "price": {...}, ... }]
}
```

### Product Detail JSON (`data/scrape/products/10282094.json`)

```json
{
  "productId": "10282094",
  "name": "SAMSUNG QE65QN85D 65\" Smart 4K Neo QLED TV",
  "brand": "Samsung",
  "price": { "current": 1299, "was": 1499, "savings": 200 },
  "rating": { "average": 4.7, "count": 123 },
  "images": { "gallery": ["..."], "thumbnails": ["..."] },
  "keySpecs": [{ "icon": "screen", "label": "65 inch" }],
  "specifications": { "Display": { "Screen Size": "65\"", ... } },
  "description": { "main": "...", "features": [...] }
}
```

### Products Index (`data/scrape/products-index.json`)

An object keyed by product ID (not an array):

```json
{
  "10282094": { "productId": "10282094", "name": "...", ... },
  "10282095": { "productId": "10282095", "name": "...", ... }
}
```
