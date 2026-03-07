Re-scrape the reference site and generate a change report showing new products, removed products, price changes, and structural differences since the last scrape. Optionally apply updates.

**Pipeline position:** Maintenance (on-demand) — depends on: `/scrape-products` | feeds into: `/normalize-data`, `/download-images`, `/audit-data`

**Usage:** `/update-data` — re-scrapes all categories and generates a diff report

Optionally: `/update-data <args>` where `$ARGUMENTS` is:
- A category slug: e.g., `televisions`, `headphones`, `soundbars`, etc. — re-scrape one category
- `all` — re-scrape everything
- `apply` — after a category slug to auto-apply changes (e.g., `/update-data televisions apply`)
- `dry-run` — generate report only, don't modify any files (default behavior)

---

## Golden Rule

**Detect what changed, report it clearly, apply updates safely.** The reference site evolves — new products launch, prices change, items go out of stock. This skill keeps the clone in sync by detecting drift and applying targeted updates.

---

## Prerequisites

- Existing scraped data in `data/scrape/` (from previous `/scrape-products` run)
- `data/scrape/products-index.json` must exist
- Reference site accessible for re-scraping (URL from `src/lib/constants.ts` SITE_URL)
- `firecrawl_scrape` available

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` and `firecrawl_extract` calls in this skill MUST include:
`location: { country: "{country}", languages: ["{language}"] }`

**Cache Strategy:** Always use `maxAge: 0` — the purpose of this skill is to detect what changed, so cached results defeat the goal.

---

## Steps

### 1. Snapshot current state

Before re-scraping, record the current state:
- Count of products per category in existing JSON files
- Total products in `products-index.json`
- Last modified dates on category JSON files
- Price range per category (min/max/avg)

### 2. Re-scrape target categories

For the target category (or all if `$ARGUMENTS` is `all` or empty):

Create the temporary directory for re-scraped data:

```bash
mkdir -p data/scrape/_update/
```

Use the same scraping approach as `/scrape-products`:
- Scrape category listing pages with pagination
- Extract product IDs, names, prices, ratings, images
- Save to a temporary location (`data/scrape/_update/`) — not overwriting existing files yet

**Category slug to data file mapping:** Read the category mapping from `project-config.md` or the category data module's imports in `src/lib/category-data.ts`.

> **Note:** This mapping is project-specific. Slugs do NOT mechanically derive from filenames — they can be 1-3 segments deep. Always read `src/lib/category-data.ts` imports directly for the canonical mapping.

### 2b. Price-only update mode (faster and cheaper)

If `$ARGUMENTS` contains `prices` (e.g., `/update-data televisions prices`), use targeted extraction instead of full scraping:

```
firecrawl_extract with:
  urls: [all product detail URLs for the target category]
  location: { country: "{country}", languages: ["{language}"] }
  prompt: "Extract the current price, was price (if shown), and product ID for each product"
  schema: {
    type: "object",
    properties: {
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string" },
            currentPrice: { type: "number" },
            wasPrice: { type: "number" },
            inStock: { type: "boolean" }
          }
        }
      }
    }
  }
```

Process URLs in batches of 20 (max parallel Firecrawl calls per CLAUDE.md). `firecrawl_extract` is cheaper than full JSON scrape for targeted field extraction across many URLs. Skip to step 3 after extraction.

### 3. Diff against existing data

Compare the re-scraped data against existing files:

**New products** (in re-scrape, not in existing):
- Product ID, name, price, category
- These need images downloaded too

**Removed products** (in existing, not in re-scrape):
- Product ID, name, price, category
- May have been discontinued or moved to a different category

**Price changes** (product exists in both, price differs):
- Product ID, name, old price, new price, % change
- Flag any change > 20% as suspicious (might be a scraping error)

**Attribute changes** (same product, different metadata):
- Rating changes (new reviews)
- Description updates
- Spec changes
- Image URL changes (new gallery images)

**Structural changes:**
- New categories or subcategories
- Renamed categories
- Changed navigation structure
- New filter options

### 4. Generate the change report

```
## Data Update Report

Scrape date: [timestamp]
Categories checked: X
Reference site: {reference-site-url}

### Summary

| Category | Current | Re-scraped | New | Removed | Price Changes |
|----------|---------|------------|-----|---------|---------------|
| Televisions | 156 | 162 | 8 | 2 | 14 |
| Headphones | 89 | 91 | 3 | 1 | 7 |
| Soundbars | 45 | 44 | 1 | 2 | 3 |
| ... | ... | ... | ... | ... | ... |
| **Total** | **X** | **Y** | **Z** | **W** | **V** |

### New Products

| ID | Name | Price | Category |
|----|------|-------|----------|
| {product-id} | e.g., Brand X Model Y 65" OLED | 2499.00 | {category-name} |
| {product-id} | e.g., Brand X Model Z | 349.00 | {category-name} |
| ... | ... | ... | ... |

Action needed: Download images for X new products

### Removed Products

| ID | Name | Last Price | Category | Reason |
|----|------|-----------|----------|--------|
| {product-id} | e.g., Brand X Model Y | 999.00 | {category-name} | Not in listing |
| ... | ... | ... | ... | ... |

Action needed: Decide whether to keep or remove X products

### Price Changes

| ID | Name | Old Price | New Price | Change |
|----|------|----------|-----------|--------|
| {product-id} | e.g., Brand X Model A | 1299.00 | 1199.00 | -7.7% |
| {product-id} | e.g., Brand Y Model B | 999.00 | 899.00 | -10.0% |
| {product-id} | e.g., Brand Z Model C | 349.00 | 379.00 | +8.6% |
| ... | ... | ... | ... | ... |

Suspicious changes (>20%): X
- [ID] [name] [old] → [new] ([change]%) — verify manually

### Structural Changes

- New category detected: [name] ([url])
- Category renamed: [old] → [new]
- Navigation change: [description]

### Actions Required

1. Download images for X new products (run `/download-images <id>` for each)
2. Update X product prices in category JSON files
3. Review X removed products — keep data or delete?
4. Review X suspicious price changes — verify against live site
```

### 5. Apply updates (if requested)

If `$ARGUMENTS` includes `apply`:

1. Update category JSON files with new product entries
2. Update prices for changed products
3. Remove products marked as discontinued
4. Update `products-index.json` with new/removed entries
5. Log what was changed for rollback reference

If `apply` is not specified, output: "Run `/update-data <category> apply` to apply these changes."

### 6. Post-update actions

After applying:

- Restart the dev server to pick up data changes: `lsof -ti:3000 | xargs kill -9; rm -rf .next && npm run dev`
- Run `/download-images <product-id>` for each new product ID (the `/download-images` skill accepts a single product ID as `$ARGUMENTS`)
- Run `/audit-data` to verify data integrity after updates
- Note any products that need individual detail scraping (new products only have listing data)

---

## Critical Rules

- **Never overwrite existing data without diffing first.** Always save re-scraped data to a temp location, diff, report, then optionally apply.
- **Default is dry-run.** Unless `apply` is explicitly in `$ARGUMENTS`, this skill only reports — it doesn't modify any files.
- **Flag suspicious changes.** A 50% price drop might be a Black Friday sale, or it might be a scraping error. Flag any change > 20% for manual review.
- **New products need images.** Adding a product to the data without downloading its images means broken image cards. Always note this as a required follow-up action.
- **Removed products might come back.** Don't delete product data on the first removal detection. Mark as "not in listing" and suggest review. It might be temporarily out of stock.
- **Track what changed for rollback.** If `apply` is used, log every file modified and what changed. This enables manual rollback if the update introduces problems.
- **Re-scraping is expensive.** Don't re-scrape categories unnecessarily. If only checking prices, use the listing page (faster) rather than individual product pages (slower but more complete).
