Scrape all product listings and full product details from every category discovered by `/map-site`.

**Pipeline position:** 3/32 — depends on: `/map-site` | feeds into: `/normalize-data`, `/scrape-seo`, `/download-images`, `/audit-data`, `/update-data`

**Usage:** `/scrape-products` — runs against the current project's `src/lib/category-data.ts` categoryMap

Optionally: `/scrape-products <category-slug>` to scrape a single category. `$ARGUMENTS` is the optional category filter.

---

## Golden Rule

**Exact 1:1 fidelity.** Every piece of product data must come from the real site. NEVER fabricate, template-generate, or approximate any content. If a product has 47 specifications, we capture all 47. If a description has 3 paragraphs, we get all 3. Prices, ratings, and review counts must be exact — no rounding. If a scrape fails, log it as missing and retry — do NOT fill gaps with AI-generated text.

---

## Prerequisites

- Read `src/lib/category-data.ts` `categoryMap` keys to get the canonical list of category URLs. This is the primary source of truth for which categories to scrape.
- Firecrawl MCP tools must be available

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` calls in this skill MUST include:
`location: { country: "GB", languages: ["en-GB"] }`
Without this, product prices may return in USD and geo-targeted content will differ. This is a correctness requirement for UK sites.

**Cache Strategy:**
- **Initial scrape of a category:** `maxAge: 0` (fresh data required)
- **Re-scraping a failed product (retry):** `maxAge: 0` (always fresh on retries)
- **Verifying a sample product during development:** `maxAge: 3600000` (1-hour cache)
- **Full re-scrape for `/update-data`:** `maxAge: 0` (always fresh)
Apply chosen `maxAge` to ALL firecrawl calls in this skill run.

---

## Steps

### 1. Load the site map

Read `src/lib/category-data.ts` `categoryMap` to get the canonical list of category slugs and their associated URLs. If `$ARGUMENTS` is provided, filter to just that category slug.

**Valid category slugs** are the keys in `categoryMap`. Read that file to get the current list — do not hardcode slugs here as they vary per project.

**Note:** Category file names do NOT mechanically derive from URL slugs. Reference the import statements in `src/lib/category-data.ts` to find the correct JSON filename for each slug.

### 1b. Sample and validate JSON structure (do this BEFORE bulk scraping)

Before scraping all categories, scrape ONE small category (e.g., whichever has the fewest products) first:

1. Scrape the listing page and examine the returned JSON structure
2. Document actual field names: is it `url` or `productUrl`? `name` or `title`? `price` (flat number) or `price.current` (nested object)?
3. Create a field-name mapping that normalizes all subsequent scrapes
4. This prevents the 5+ crashes caused by assumed JSON structures on the Electric project

**Normalization rules to apply at scrape time:**
- `productUrl` → `url`
- `title` → `name`
- Flat `price` (number) → `{ price: { current: N, was: null, savings: null } }`
- Flat `rating` (number) → `{ rating: { average: N, count: 0 } }`

### 2. Scrape category listing pages

For each category, use `firecrawl_scrape` with JSON format to extract ALL products from the listing page. Use pagination — keep scraping until all pages are captured.

**Extract per product from the listing page:**

```json
{
  "products": [{
    "productId": "",
    "name": "",
    "brand": "",
    "url": "",
    "price": {
      "current": 0,
      "was": null,
      "savings": null,
      "savingsPercent": null,
      "monthlyPayment": null
    },
    "rating": { "average": 0, "count": 0 },
    "imageUrl": "",
    "keySpecs": [],
    "badges": [],
    "offers": [],
    "inStock": true,
    "energyRating": null
  }]
}
```

Save each category as: `data/scrape/{category-filename}.json`

Include metadata in the file:
```json
{
  "category": "Category Name",
  "url": "https://...",
  "scrapedAt": "ISO timestamp",
  "totalProducts": 0,
  "products": [...]
}
```

### 2b. Verify exhaustive coverage (BLOCKING — do NOT proceed if failing)

After scraping each category, verify completeness:

1. Extract the "Showing X of Y results" or total product count from the listing page header
2. Compare against products actually captured in the JSON
3. If captured < 90% of stated total: STOP and re-paginate or use alternative scraping approach
4. Log per category: "{Category}: site says N products, we captured M (X%) — PASS/FAIL"
5. **FAIL threshold:** Any category below 90% coverage blocks proceeding to Step 3

This prevents the 4-round incremental scraping trap that consumed ~40% of total session time on the Electric project. Scrape exhaustively FIRST, validate SECOND, build THIRD.

**SPA pagination note:** Some e-commerce sites are JavaScript SPAs where `?page=N` parameters return the same first-page results. If pagination produces duplicate products, try: scrolling/loading more results via Firecrawl actions, or extracting product URLs from the sitemap via `firecrawl_map`.

### 3. Deduplicate across categories

After all categories are scraped:
- Collect all product IDs across all category files
- Identify duplicates (same product in multiple categories)
- Log: "X total entries, Y unique products, Z duplicates"

### 4. Scrape individual product detail pages

For EVERY unique product, use `firecrawl_scrape` with JSON format on the product's detail page URL.

**Batch strategy (required for >50 products):**
Process product URLs in batches of 20 parallel `firecrawl_scrape` calls. Wait for each batch to complete before starting the next. Do NOT exceed 20 concurrent — higher risks rate limiting. For 2,000+ products, this reduces total scrape time from ~2 hours (sequential) to ~6 minutes (batched).

**Handling lazy-loaded content:**
If a product detail scrape returns empty `specifications` or fewer than 3 `images.gallery` entries, retry with actions to trigger JavaScript rendering:

```
firecrawl_scrape with:
  url: [product-url]
  formats: ["json"]
  location: { country: "GB", languages: ["en-GB"] }
  actions: [
    { type: "scroll", direction: "down" },
    { type: "wait", milliseconds: 2000 },
    { type: "scroll", direction: "down" },
    { type: "wait", milliseconds: 1000 }
  ]
  jsonOptions: { prompt: "...", schema: { ... } }
```

Only use actions on retry — they add ~3s per call, making them expensive for bulk use.

**Extract the full product detail:**

```json
{
  "productId": "",
  "name": "",
  "brand": "",
  "modelNumber": "",
  "url": "",
  "price": {
    "current": 0,
    "was": null,
    "savings": null,
    "savingsPercent": null
  },
  "rating": { "average": 0, "count": 0 },
  "images": {
    "gallery": ["url1", "url2"],
    "thumbnails": ["url1", "url2"],
    "video": null
  },
  "keySpecs": [{ "icon": "", "label": "" }],
  "specifications": {
    "Section Name": {
      "Spec Label": "Spec Value"
    }
  },
  "description": {
    "main": "",
    "features": [],
    "additionalInformation": [],
    "goodToKnow": [],
    "whyWeLoveIt": null
  },
  "sizeVariants": [{ "size": "", "price": 0, "productId": "", "url": "", "selected": false }],
  "colorVariants": [],
  "deliveryInfo": {
    "freeDelivery": false,
    "estimatedDate": "",
    "collectionAvailable": false,
    "collectionTime": ""
  },
  "offers": [],
  "promotionalOffers": [{ "title": "", "description": "", "code": "", "terms": "" }],
  "badges": [{ "type": "", "image": "" }],
  "crossSellProducts": [{
    "productId": "",
    "name": "",
    "price": 0,
    "wasPrice": null,
    "savings": null,
    "image": "",
    "rating": 0,
    "reviewCount": 0
  }],
  "careAndRepair": [{
    "plan": "",
    "price": 0,
    "period": "",
    "description": "",
    "features": [],
    "mostPopular": false
  }],
  "essentialServices": [{ "name": "", "price": 0, "description": "" }],
  "bundleDeals": [],
  "whatsInTheBox": [],
  "awards": [],
  "flexpay": {
    "monthlyAmount": 0,
    "months": 0,
    "totalPayable": 0,
    "apr": 0
  }
}
```

Save each as: `data/scrape/products/{productId}.json`

### 5. Handle scrape failures

For any product that fails to scrape:
- Retry up to 3 times with increasing wait (5s, 10s, 20s)
- If still failing, log to `data/scrape/missing-products.json` with product ID, URL, and error (this filename must match what `/recover-missing` reads)
- **NEVER create a placeholder/template file.** A missing file is better than fake data.

### 6. Output coverage report

**Note:** Building `products-index.json` and `size-variants.json` is handled by `/build-data-layer` (which runs the data pipeline scripts). This skill only scrapes — it does not build indexes.

Report to the user:
```
## Scrape Coverage Report

Categories scraped: X
Total product listings: X (Y unique)
Product details scraped: X/Y (Z%)

Per-category breakdown:
- {Category 1}: N products, M with full details, X failed
- {Category 2}: N products, M with full details, X failed
- ...

Failed products (need retry): X
  - [product ID] [URL] [error]

Quality check:
- Products with full specifications: X
- Products with descriptions: X
- Products with gallery images: X
- Products with cross-sells: X
```

---

## Critical Rules

- **Every product gets a detail page scrape.** No "baseline" tier. No "template" tier. Either we have the real data or it's flagged as failed/missing.
- **No AI-generated content.** Descriptions, specs, offers — all must come from the actual product page. If a field is empty on the real site, it's empty in our data.
- **Prices are exact.** £1,199.00 is not £1,199. Include the exact format as displayed.
- **Ratings are exact.** 4.7 out of 5 based on 1,247 reviews — capture both the average and the count.
- **Image URLs are captured for later download.** Don't download images here — that's `/download-images`. Just record every image URL from the gallery and thumbnails.
- **Gallery image order is unreliable from scrapes.** Firecrawl returns images in DOM order, not display order. ~5% of products will have the base image (no `_NNN` suffix) buried mid-array. The runtime code sorts by suffix in `mergeScrapedData()` via `getImageSortKey()`, but be aware of this when validating scrape output — don't assume gallery[0] is the hero image in raw scraped data.
- **Deduplication is by product ID.** Same product in 3 categories = 1 detail file, listed in 3 category files.
- **Normalize price formats at scrape time.** Always output `{ price: { current: N, was: N|null, savings: N|null } }`. If the site returns a flat `price` number, map it to `price.current` with `was` and `savings` as null. Same for ratings: always `{ rating: { average: N, count: N } }`. This prevents every downstream consumer (product cards, price panels, filters) from having to handle multiple formats.
- **Normalize field names at scrape time.** `productUrl` becomes `url`. `title` becomes `name`. Normalize once here, not repeatedly in every consumer. Check the field-name mapping from Step 1b and apply it consistently across all categories.
