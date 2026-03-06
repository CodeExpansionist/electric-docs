Verify and supplement the output of the data pipeline scripts — product indexes, variant mappings, and category imports. Verifies the output of the canonical `scripts/` pipeline documented in CLAUDE.md.

**Pipeline position:** 7/32 — depends on: `/normalize-data`, `/scrape-products` | feeds into: `/verify-coverage`, `/scaffold-project`

**Usage:** `/build-data-layer` — rebuilds all data indexes from source files

Optionally: `/build-data-layer <index>` where `$ARGUMENTS` is a specific index to rebuild (e.g., `products-index`, `size-variants`, `search-index`). Omit to rebuild all.

---

## Golden Rule

**Always rebuild from source — never append.** Every index is regenerated from the individual JSON files in `data/scrape/products/`. If a product was removed or updated, the index reflects that automatically. No manual "add this product to the index" steps.

---

## Prerequisites

- Normalized product detail files in `data/scrape/products/` (run `/normalize-data` first)
- Category JSON files in `data/scrape/`

---

## Steps

### 1. Build products-index.json

Read every file in `data/scrape/products/` and create a unified index:

```json
{
  "{product-id}": {
    "productId": "{product-id}",
    "name": "e.g., Brand A Model-X 55 inch...",
    "brand": "e.g., Brand A",
    "price": { "current": 1299, "was": 1499, "savings": 200 },
    "rating": { "average": 4.7, "count": 123 },
    "imageUrl": "...",
    "categories": ["{category-slug}"]
  }
}
```

**Rules:**

- Key is the product ID (string)
- Include core listing fields only (name, brand, price, rating, imageUrl, categories)
- Do NOT include full specifications or descriptions — those stay in individual files
- The `categories` array lists which category slugs contain this product
- Validate: every entry has `productId`, `name`, `price.current`

Save as: `data/scrape/products-index.json`

Log: "Products index: X entries from Y source files"

### 2. Build size-variants.json

Group products by model family to identify size variants:

1. For each product, extract brand + model series (strip size from model name)
2. Group products that share the same brand + model series but differ by screen size
3. Create variant mappings using the `productToVariants` key structure:

```json
{
  "productToVariants": {
    "{product-id}": {
      "variants": [
        { "size": "42\"", "productId": "{variant-id-1}", "price": 899 },
        { "size": "48\"", "productId": "{variant-id-2}", "price": 1099 },
        { "size": "55\"", "productId": "{variant-id-3}", "price": 1299 },
        { "size": "65\"", "productId": "{variant-id-4}", "price": 1799 }
      ]
    }
  }
}
```

**Rules:**

- The actual file structure uses a `productToVariants` top-level key that maps each product ID to its variant group
- Only include families with 2+ size variants
- Sort variants by size (numeric, ascending)
- Include price for each variant
- Use product data `sizeVariants` field if available; otherwise infer from model names
- For TVs specifically, run the TV-specific scripts first: `analyze-tv-families.js` -> `propagate-tv-data.js` -> `add-missing-variants.js` -> `build-all-tv-products.js`

Save as: `data/scrape/size-variants.json`

Log: "Size variants: X product families, Y total products with variants"

### 3. Update category-data.ts imports

**Note:** Do NOT build a separate `search-index.json` file. The actual search uses `src/lib/search-data.ts` which reads from `products-index.json` and category data directly.

Verify that `src/lib/category-data.ts` has import statements for every category JSON file:

1. List all category JSON files in `data/scrape/` (exclude product detail files, manifests, etc.)
2. Read `src/lib/category-data.ts` — check for a matching import for each file
3. If any category file is missing an import, add it
4. If any import references a file that no longer exists, flag it

**Do NOT auto-generate the entire file** — only verify imports are complete. The `categoryMap` and filter logic are maintained by `/scaffold-project` or manual editing.

### 4. Validate bidirectionally

After building all indexes:

1. **Index → Source:** For 10 random index entries, verify the source file exists and data matches
2. **Source → Index:** For 10 random source files, verify they appear in the index
3. **Size variants → Products:** For every variant entry, verify the product ID exists in the index
4. **Category imports → Files:** For every import in category-data.ts, verify the file exists

```
Validation:
- Index → Source: 10/10 match — PASS
- Source → Index: 10/10 found — PASS
- Variant products in index: X/X — PASS
- Category imports resolve: X/X — PASS
```

### 5. Output report

```
## Data Layer Build Report

Files generated:
- data/scrape/products-index.json — X entries (Y KB)
- data/scrape/size-variants.json — X families, Y products (Z KB)

Category imports:
- src/lib/category-data.ts — X imports verified, Y added, Z flagged

Validation: PASS/FAIL

Stats:
- Total products indexed: X
- Products with variants: X (Y families)
- Categories with imports: X/X
```

---

## Critical Rules

- **Rebuild from source, never append.** Delete the old index and regenerate from individual files. This prevents stale entries from deleted products.
- **Validate bidirectionally.** Index must match source files. Source files must appear in index. No orphans in either direction.
- **Product IDs are strings.** Even in JSON keys and variant mappings, keep IDs as strings for consistency.
- **Search text is lowercase.** All search text normalized to lowercase for case-insensitive matching.
- **Don't include full details in the index.** The products-index.json is for listing pages — keep it lean. Full specs/descriptions stay in individual files and are loaded on demand for product detail pages.
- **This verifies the output of the data pipeline scripts.** The canonical scripts (`build-all-categories.js`, `generate-product-details.js`, `build-size-variants.js`, etc.) are documented in CLAUDE.md. This skill verifies their output and fills gaps — it does not replace them. For TVs, also run the TV-specific pipeline: `analyze-tv-families.js` -> `propagate-tv-data.js` -> `add-missing-variants.js` -> `build-all-tv-products.js`.
