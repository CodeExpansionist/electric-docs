Go/no-go gate before building. Verifies every product has data, every product has images, every category has products, and every nav link resolves. If coverage is below threshold, building is BLOCKED.

**Pipeline position:** 11/32 — depends on: `/download-images`, `/download-assets`, `/normalize-data` | feeds into: `/scaffold-project` (BLOCKING — must pass before Phase 5 construction)

**Usage:** `/verify-coverage` — runs all coverage checks

Optionally: `/verify-coverage <check>` where `$ARGUMENTS` is a specific check (e.g., `images`, `products`, `routes`).

---

## Golden Rule

**If it's not 100%, don't build.** Discovering mid-build that "80% of products had NO image data" wastes days of work. This gate catches gaps BEFORE construction starts — when fixing is cheap (re-scrape/re-download) instead of expensive (rebuild components).

---

## Prerequisites

- Category JSON files in `data/scrape/` (from `/scrape-products`)
- Product detail files in `data/scrape/products/` (from `/scrape-products`)
- Product images in `public/images/products/` (from `/download-images`)
- `src/lib/category-data.ts` with `categoryMap` (from `/scaffold-project`)
- `data/scrape/manifest.json` (from `/normalize-data`, optional but recommended)

---

## Checks

### Check 1: Product Detail Coverage

Every product listed in category files must have a corresponding detail file.

1. Read ALL category JSON files in `data/scrape/` — collect every unique product ID
2. For each product ID, check: does `data/scrape/products/{productId}.json` exist?
3. For each existing file, check: is it > 1KB? (Files under 1KB are likely empty/template)

**Threshold: 95% detail file coverage required to pass.**

```
Product Detail Coverage:
- Unique products across categories: {N}
- With detail file (>1KB): {N} ({pct}%) — PASS
- With detail file (<1KB — likely empty): {N}
- Missing detail file entirely: {N}

Missing product IDs:
- {product-id} ({category-slug} category)
- {product-id} ({category-slug} category)
- ...
```

### Check 2: Image Coverage

Every product must have at least `main.webp` — the listing thumbnail.

1. For each product ID from Check 1, check: does `public/images/products/{productId}/main.webp` exist?
2. Also check `large.webp` existence (gallery main image)
3. Count gallery images per product

**Threshold: 100% main.webp coverage required to pass.**

```
Image Coverage:
- Products checked: {N}
- With main.webp: {N} ({pct}%) — PASS
- With large.webp: {N} ({pct}%)
- With 3+ gallery images: {N} ({pct}%)
- Average images per product: {N}

Products missing main.webp (CRITICAL — BLOCKS BUILD):
- [none — PASS]

Products missing large.webp:
- {product-id}
- {product-id}
```

### Check 3: Category Coverage

Every category in `categoryMap` must have a corresponding data file with products.

1. Read `src/lib/category-data.ts` — extract all keys from the `categoryMap` object
2. For each category key, invoke its factory function and verify the returned data has a `products` array with > 0 entries
3. Cross-check that the underlying JSON data file exists in `data/scrape/` for each category

**Threshold: 100% category coverage required to pass.**

```
Category Coverage:
- Categories in categoryMap: {N} (count from category index)
- With data and products: {N} (100%) — PASS
- With 0 products: 0

Per-category product counts:
- {category-slug}: {N} products
- {category-slug}: {N} products
- {category-slug}: {N} products
- ...
```

### Check 4: Navigation Link Resolution

Every navigation link must resolve to either a category page or a static page.

1. Scan nav components in `src/components/layout/` for all link `href` values:
   - Main navigation component — primary nav links
   - Secondary navigation component — secondary nav links
   - Footer component — footer column links
   - Any promotional/deals section components — category links
2. For category links: verify the slug maps to a key in `categoryMap` from `src/lib/category-data.ts` (also check `categoryAliases` for alias resolution)
3. For static page links: verify a page route exists in `src/app/`
4. For external links: flag them (these need to be handled or removed)

```
Navigation Link Resolution:
- Total nav links: {N}
- Resolve to category with data: {N}
- Resolve to static page: {N}
- External (need handling): {N}
- BROKEN (no route or data): {N}

Broken links (BLOCKS BUILD):
- /{section-slug}/{promo-slug} → no categoryMap key or alias
- /{section-slug}/{promo-slug} → no data file
```

### Check 5: Data Schema Consistency

Verify all JSON files follow the normalized schema (from `/normalize-data`).

1. Sample 50 product detail files — check they have `price.current` (not flat price), `rating.average` (not flat rating), `url` (not `productUrl`)
2. Check for any remaining un-normalized fields
3. If `data/scrape/manifest.json` exists, verify field coverage percentages

```
Schema Consistency:
- Files sampled: 50
- With normalized price format: 50/50 — PASS
- With normalized rating format: 48/50 — 2 still have flat rating
- With normalized field names: 50/50 — PASS

Un-normalized files found: 2
- data/scrape/products/{product-id}.json — rating is flat number
- data/scrape/products/{product-id}.json — rating is flat number
```

### Check 6: Asset Completeness

Verify non-product assets are downloaded (logos, icons, badges).

1. Check `public/images/` for brand logos, category icons, badge images
2. Check `public/fonts/` if custom fonts were downloaded
3. Grep `data/scrape/` JSON files for image URLs — verify each has a local equivalent

```
Asset Completeness:
- Brand logos: X downloaded
- Category icons: X downloaded
- Badge images: X downloaded
- Fonts: X downloaded
- Missing assets: X
```

---

## Go/No-Go Decision

After all checks, produce a clear verdict:

```
## Coverage Verification — GO/NO-GO

| Check | Threshold | Actual | Status |
|-------|-----------|--------|--------|
| Product details | 95% | 99.6% | PASS |
| Main images | 100% | 100% | PASS |
| Category data | 100% | 100% | PASS |
| Nav link resolution | 100% | 95.7% | FAIL |
| Schema consistency | 100% | 96% | FAIL |
| Asset completeness | 90% | 100% | PASS |

## VERDICT: NO-GO — 2 checks below threshold

### Actions required before building:

1. **Fix 2 broken nav links:**
   - /{section-slug}/{promo-slug} → add to categoryMap or remove from nav
   - /{section-slug}/{promo-slug} → scrape category data or remove from nav

2. **Normalize 2 remaining product files:**
   - Run /normalize-data on products {product-id}, {product-id}

### After fixing, re-run: /verify-coverage
```

Or if everything passes:

```
## VERDICT: GO — All checks pass. Ready to build.

Summary:
- {N} products with full data and images
- {N} categories with complete product listings
- {N} nav links all resolving correctly
- Schema fully normalized

Proceed to /scaffold-project → /build-component
```

---

## Critical Rules

- **This is a BLOCKING gate.** If the verdict is NO-GO, do NOT proceed to building. Fix the gaps first.
- **100% main.webp is non-negotiable.** Every product card needs a listing image. There is no acceptable fallback.
- **95% detail coverage allows for edge cases** — some products may be discontinued or have anti-scraping protection. But below 95% means the scrape was incomplete.
- **Re-run after fixes.** After addressing gaps, run `/verify-coverage` again. Don't assume fixes worked.
- **Log specific IDs and paths.** "12 products are missing" is not actionable. "Products {product-id}, {product-id}, ... are missing detail files" is.
- **This is cheap insurance.** Running this check takes minutes. Discovering gaps mid-build costs hours of rework.
