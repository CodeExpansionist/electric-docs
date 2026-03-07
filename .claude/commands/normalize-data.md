Enforce consistent schema across all scraped JSON files. Normalizes field names, price formats, rating formats, and product IDs so every downstream consumer gets predictable data.

**Pipeline position:** 6/32 — depends on: `/scrape-products` | feeds into: `/build-data-layer`, `/download-images`, `/verify-coverage`

**Usage:** `/normalize-data` — processes all JSON files in `data/scrape/`

Optionally: `/normalize-data <category-file>` to normalize a single file. `$ARGUMENTS` is the optional file filter.

---

## Golden Rule

**Normalize once, consume everywhere.** Every field name inconsistency, price format variation, and rating structure difference gets fixed HERE — not patched in 10 different components. After this step, all JSON files follow one schema. No exceptions.

**Relationship with `scripts/` pipeline:** This skill supplements (does not replace) the canonical data pipeline scripts documented in CLAUDE.md (`build-all-categories.js`, `generate-product-details.js`, etc.). Use this skill for schema-level normalization; use the scripts for data merging and index building.

---

## Prerequisites

- Category JSON files must exist in `data/scrape/` (run `/scrape-products` first)
- Product detail files must exist in `data/scrape/products/`

---

## Steps

### 1. Back up current data

Before modifying any files:

**Warning:** `data/scrape/` may contain thousands of product files. Do NOT use `cp -r` for backups — it will copy thousands of files slowly. Use `tar` instead:

```bash
tar -czf data/scrape-backup-$(date +%Y%m%d).tar.gz data/scrape
```

Log: "Backup created at data/scrape-backup-YYYYMMDD.tar.gz"

### 2. Audit current field names and formats

Read ALL JSON files and document every field name variation:

1. Sample 20 category JSON files — document the product object structure
2. Sample 50 product detail files — document every field name
3. Build a field inventory:

```
Field inventory:
- Product URL: "url" (X files), "productUrl" (Y files), "href" (Z files)
- Product name: "name" (X files), "title" (Y files)
- Price: flat number (X files), { current, was } object (Y files), string "£1,199" (Z files)
- Rating: flat number (X files), { average, count } object (Y files)
- Product ID: "productId" (X files), "id" (Y files), "sku" (Z files)
```

### 3. Apply field name normalization

For EVERY JSON file in `data/scrape/` and `data/scrape/products/`:

**Canonical field names (apply these mappings):**

| Found | Normalize to |
|-------|-------------|
| `productUrl`, `href`, `link` | `url` |
| `title`, `productName`, `displayName` | `name` |
| `id`, `sku`, `productCode` | `productId` |
| `img`, `image`, `thumbnail`, `imageUrl` | `imageUrl` |
| `brandName`, `manufacturer` | `brand` |

Log every transformation: "Renamed 'productUrl' → 'url' in 847 product entries across 14 files"

### 4. Normalize price formats

Every price field must follow this structure:

```json
{
  "price": {
    "current": 1199.00,
    "was": 1499.00,
    "savings": 300.00,
    "savingsPercent": 20
  }
}
```

**Transformation rules:**

| Input format | Transformation |
|---|---|
| `price: 1199` (flat number) | `{ current: 1199, was: null, savings: null, savingsPercent: null }` |
| `price: "£1,199.00"` (string) | Parse to number: `{ current: 1199.00, was: null, savings: null, savingsPercent: null }` |
| `price: { current: 1199, was: 1499 }` (partial object) | Add missing fields: `{ current: 1199, was: 1499, savings: 300, savingsPercent: 20 }` |
| `currentPrice` + `wasPrice` (separate fields) | Merge into single `price` object, remove old fields |

**Calculate derived fields:**
- `savings = was - current` (if `was` is not null)
- `savingsPercent = round((savings / was) * 100)` (if `was` is not null)

### 5. Normalize rating formats

Every rating field must follow this structure:

```json
{
  "rating": {
    "average": 4.7,
    "count": 1247
  }
}
```

**Transformation rules:**

| Input format | Transformation |
|---|---|
| `rating: 4.7` (flat number) | `{ average: 4.7, count: 0 }` |
| `rating: "4.7"` (string) | Parse to number: `{ average: 4.7, count: 0 }` |
| `rating: { score: 4.7, reviews: 1247 }` | Remap: `{ average: 4.7, count: 1247 }` |
| `stars` + `reviewCount` (separate fields) | Merge into single `rating` object, remove old fields |

### 6. Validate product IDs

Every product ID must match the pattern `\d{7,8}` (7-8 digit number):

1. Extract all product IDs across all files
2. Flag any ID that doesn't match the pattern
3. Flag any ID that appears as a string in some files and number in others — normalize to string
4. Verify product detail file names match the `productId` field inside them

Log: "Product IDs validated: X pass, Y flagged (non-numeric or mismatched)"

### 7. Normalize gallery image ordering

Firecrawl extracts gallery images in DOM order, which is **not** reliably the display order. ~5% of products have the base image (no URL suffix) buried mid-array instead of first, and gallery/thumbnail arrays may be misaligned (different orders for the same product).

For every product detail file with `images.gallery`:

1. Sort `images.gallery` URLs by CDN suffix: base image (no `_NNN` suffix) first, then `_001`, `_002`, etc. Non-standard URLs (video frames, external hosts) sort last.
2. Sort `images.thumbnails` URLs by the same suffix logic.
3. This ensures gallery[0] is always the hero/main image and gallery[i] corresponds to thumbnails[i].

**Note:** The runtime code in `product-data.ts` (`mergeScrapedData()`) also sorts via `getImageSortKey()` from `images.ts` as a safety net. But normalizing the source data here prevents the issue at the root.

Log: "Gallery ordering fixed: X products had out-of-order gallery arrays"

### 8. Verify normalization

**Note:** Do NOT generate a `data/scrape/manifest.json` file — nothing in the project reads it. Instead, output the normalization stats directly in the report below.

After all transformations:

1. Re-read 10 random product files — verify all follow canonical schema
2. Re-read 3 random category files — verify product arrays follow canonical schema
3. Verify NO data was deleted (field count per file should be >= before normalization)
4. Verify prices are numbers (not strings), ratings are numbers (not strings)

**Output:**
```
## Normalization Report

Files processed: X
- Category files: X
- Product detail files: X

Transformations applied: X
- Field renames: X (productUrl→url: X, title→name: Y, ...)
- Price normalizations: X (flat→object: X, string→number: Y, partial→complete: Z)
- Rating normalizations: X
- Product ID fixes: X

Field coverage after normalization:
- name: X/Y (Z%)
- price.current: X/Y (Z%)
- rating.average: X/Y (Z%)
- specifications: X/Y (Z%)
- description.main: X/Y (Z%)

Verification: PASS/FAIL
Backup location: data/scrape-backup-YYYYMMDD
```

---

## Critical Rules

- **Never delete fields.** Normalization adds and renames — never removes. Unknown fields are preserved as-is.
- **Back up first.** Always create a timestamped backup before modifying any files. If normalization goes wrong, the backup is the recovery path.
- **Log every transformation.** Every rename, format change, and calculated field is logged in the manifest. This is the audit trail.
- **Strings to numbers for prices and ratings.** `"4.7"` becomes `4.7`. `"£1,199.00"` becomes `1199.00`. Downstream consumers should never have to parse strings.
- **Product IDs are strings.** Even though they're numeric, store as strings to preserve leading zeros and prevent JavaScript number precision issues.
- **Idempotent.** Running this skill twice produces the same result. Already-normalized files are detected and skipped.
