Run a comprehensive data quality and completeness audit against the current project. Identifies gaps, quality issues, external dependencies, and routing problems.

**Pipeline position:** 8/32 — depends on: `/scrape-products`, `/download-images` | feeds into: `/content-parity`, `/link-check`

**Usage:** `/audit-data` — audits the current project

Optionally: `/audit-data <check>` where `$ARGUMENTS` is a specific check to run (e.g., `images`, `products`, `routes`, `external`). Omit to run all checks.

---

## Golden Rule

**The goal is 100% real data, 100% local assets, 100% working routes.** Any product at baseline/minimal quality is a bug. Any external domain reference is a bug. Any broken route is a bug. This audit finds them all.

---

## Checks to Run

### Check 1: Product Data Quality

Read every file in `data/scrape/products/`. Classify each into quality tiers:

**Full** (acceptable):
- Has non-empty `specifications` object with at least 3 spec groups
- Has `description.main` that is NOT a template (not matching any pattern in the template detection list below)
- Has at least 1 entry in `crossSellProducts`
- Has at least 1 entry in `offers` or `promotionalOffers`
- File size > 3KB

**Baseline** (needs re-scraping):
- Has a description but it reads like a template
- Empty `specifications` object
- Empty `crossSellProducts` array
- File size 1-3KB

**Minimal** (critical — needs re-scraping):
- Near-empty file (< 1KB)
- Missing description entirely
- Only has price and name

**Output:**
```
## Product Quality Audit

Total product files: X
- Full quality: X (Y%)
- Baseline (needs re-scrape): X (Y%)
- Minimal (critical): X (Y%)

Baseline products by category:
- {category-name}: X products need re-scraping
- {category-name}: X products need re-scraping
- ...

Top 20 minimal products (scrape these first):
- [productId] [name] [file size] [missing fields]
```

### Check 2: Image Coverage

For every product in `data/scrape/products-index.json`, check `public/images/products/{id}/`:

- Does the directory exist?
- Does `main.webp` exist? (critical — listing image)
- Does `large.webp` exist? (gallery main)
- How many `gallery_*.webp` files? (should be 1-12)
- How many `thumb_*.webp` files?
- Any files under 500 bytes? (likely corrupt)

**Output:**
```
## Image Coverage Audit

Products checked: X
- With image directory: X (Y%)
- With main.webp: X (Y%)
- With large.webp: X (Y%)
- With 3+ gallery images: X (Y%)
- Average images per product: X

Products missing main.webp (CRITICAL):
- [productId] [name]

Products with potentially corrupt images (< 500 bytes):
- [productId] [filename] [size]

Total images: X
Total disk usage: X GB
```

### Check 3: External Dependencies

Scan the entire `src/` directory for references to external domains:

**Search for:**

- Grep for the CDN path prefixes defined in `src/lib/images.ts` (e.g., `{cdn-path-prefix}` and `{legacy-path-prefix}` from `project-config.md`). These are the known CDN patterns used across all scraped data.
- Any `https://` URL in image src attributes or fetch calls

**Also check:**
- `next.config.mjs` `remotePatterns` — should be empty array. If it has entries, flag for review.
- `src/lib/images.ts` — verify `toLocalImage()` handles all CDN patterns
- `src/lib/constants.ts` — verify `SITE_URL` default port matches the port in `package.json` dev script. Verify `stripDomain()` handles all CDN domains (the path prefixes defined in `src/lib/images.ts`).
- `.env` or `.env.local` — check `NEXT_PUBLIC_SITE_URL` value
- Any `fetch()` calls to external APIs

**Output:**
```
## External Dependencies Audit

Source files with external domain references: X
- [file:line] [domain] [context snippet]

next.config.mjs remote patterns: [empty (good) / X entries (review needed)]
- [domain] — [needed/can be removed]

constants.ts:
- SITE_URL default port: [matches/mismatches] package.json dev port
- stripDomain() handles: [{cdn-path-prefix}, {legacy-path-prefix}] — [covers all scraped data: yes/no]

Environment variables:
- NEXT_PUBLIC_SITE_URL = [value or "not set"]

External fetch calls: X
- [file:line] [URL]

Verdict: [PASS: fully self-contained / FAIL: X external dependencies remain]
```

### Check 4: Route Validation

Verify all category slugs in the navigation match actual data files:

- Read `src/lib/category-data.ts` — extract all `categoryMap` keys
- For each key, verify a corresponding category JSON exists in `data/scrape/`
- Read `src/components/layout/MainNav.tsx` — extract all `/{section-slug}/` links
- Read `src/components/layout/ShopDeals.tsx` — extract all category links
- Cross-reference: every nav link must resolve to a categoryMap key

**Output:**
```
## Route Validation Audit

categoryMap keys: X
- [key] → [matched data file / MISSING]

MainNav links: X
- [link path] → [resolves to categoryMap key / BROKEN]

ShopDeals links: X
- [link path] → [resolves to categoryMap key / BROKEN]

Broken routes: X
- [link in component] → [expected categoryMap key] → [actual match: none]
```

### Check 5: Index Synchronization

Verify `data/scrape/products-index.json` is in sync with individual product files:

- Count files in `data/scrape/products/`
- Count entries in `products-index.json`
- Check for files that exist but aren't in the index
- Check for index entries that have no corresponding file
- Verify `size-variants.json` groups match actual product data

**Output:**
```
## Index Sync Audit

Product files: X
Index entries: X
- In sync: [yes/no]
- Files not in index: X
- Index entries without files: X

size-variants.json:
- Variant groups: X
- Products covered: X
- Orphaned entries: X
```

### Check 6: Seed & Demo Data Validation

Scan React Context files for hardcoded external URLs and invalid product references:

**Files to check:**
- `src/lib/orders-context.tsx`
- `src/lib/saved-context.tsx`
- `src/lib/basket-context.tsx`
- Any other `src/lib/*-context.tsx` files

**For each file, check:**
- Any `https://` image URLs (should all be local `/images/...` paths)
- Product IDs referenced in seed data — do they exist in `data/scrape/products/`?
- Image paths referenced — do they exist on disk in `public/images/products/{id}/`?

**Output:**
```
## Seed & Demo Data Audit

Context files scanned: X

External URLs found (CRITICAL):
- [file:line] [full URL]

Invalid product IDs (no scraped data):
- [file:line] [productId] — not in data/scrape/products/

Missing local images (referenced but not on disk):
- [file:line] [path] — file does not exist in public/

Verdict: [PASS: all seed data uses local assets / FAIL: X external URLs, Y invalid IDs, Z missing images]
```

### Check 7: Image Regex Compatibility

Verify `toLocalImage()` regex in `src/lib/images.ts` can actually match CDN URLs in the scraped data:

**Steps:**
- Extract the regex pattern from `src/lib/images.ts` `toLocalImage()` function
- Sample 50 CDN image URLs from across `data/scrape/` JSON files (category listings + product details)
- Test each URL against the extracted regex
- Report any URLs that fail to match — these will silently fall through to the original CDN URL at runtime

**Also check:**
- `src/components/admin/ProductImage.tsx` `extractProductId()` regex — must also match scraped data patterns
- If `next.config.mjs` `remotePatterns` is empty, unmatched URLs will cause runtime image errors (not just fallback)

**Output:**
```
## Image Regex Compatibility Audit

Regex from images.ts toLocalImage(): /pattern/
Regex from ProductImage.tsx extractProductId(): /pattern/

CDN URLs sampled: 50
- Matched by toLocalImage(): X/50
- Matched by extractProductId(): X/50

Unmatched URL patterns (CRITICAL if remotePatterns is empty):
- [pattern] — seen in X files (example: [url])

remotePatterns status: [empty — unmatched URLs WILL break / has entries — unmatched URLs fall back to CDN]

Verdict: [PASS: all CDN patterns matched / FAIL: X patterns unmatched, images will break at runtime]
```

### Check 8: Link Coverage

Verify all navigation links resolve to either a dedicated page route or a scraped JSON content file:

**Files to extract links from:**
- `src/components/layout/Footer.tsx` — all `url` values in `columns[].links[]`
- `src/components/layout/SubFooter.tsx` — all `url` values in `privacyLinks[]`
- `src/components/layout/SecondaryNav.tsx` — all `url` values in `links[]`

**For each link, verify ONE of:**
1. A dedicated page route exists: `src/app/{slug}/page.tsx`
2. A scraped JSON content file exists: `data/scrape/pages/{slug-with-__-separators}.json`
3. The link is handled by a known catch-all route

**Output:**
```
## Link Coverage Audit

Links extracted:
- Footer: X links
- SubFooter: X links
- SecondaryNav: X links
- Total unique: X

Coverage:
- Dedicated page route: X
- JSON content file: X
- Missing (404): X

Missing pages (CRITICAL):
- [link path] — referenced in [component] — no route or JSON file found

Verdict: [PASS: all links resolve / FAIL: X links have no backing page]
```

### Check 9: Filter Logic Validation

Verify that category page filters actually work against real product data. This catches the "Samsung 89 → 0 results" bug where brand filters were case-sensitive, screen size comparisons used string matching instead of numeric, and price ranges failed to parse formatted prices.

**For each category in `src/lib/category-data.ts`:**

1. **Brand filters:** Extract all brand filter options. For each brand name, count products where `product.brand` matches. Check case sensitivity — "SAMSUNG" vs "Samsung" vs "samsung" must all match. If any brand shows 0 matches despite products existing, flag it.

2. **Screen size filters:** If the category has screen size filters, verify they use numeric comparison (not string). "55 inch" must match products with screenSize "55", "55\"", "55 inches", "139cm (55\")". String comparison of "55" < "9" is a known trap.

3. **Price range filters:** Verify price ranges parse correctly. If products have `price.current` as a number, ensure filter comparison uses numbers too. If prices are strings like "£1,199.00", verify the filter strips currency symbols and commas before comparing.

4. **Rating filters:** Verify "4 stars & up" correctly includes products with ratings of 4.0, 4.1, 4.5, 4.9, 5.0.

5. **Filter counts:** For each filter option, count how many products match. If any filter shows a count in the UI that differs from the actual match count, flag it.

**Output:**
```
## Filter Logic Audit

Categories checked: X

Brand filter issues:
- [category] [brand name] — filter expects "[value]" but products have "[actual value]" (case mismatch)

Screen size issues:
- [category] — uses string comparison instead of numeric (will fail for sizes > 9)

Price range issues:
- [category] — price format "[format]" not handled by filter parser

Rating issues:
- [category] — threshold comparison excludes exact matches

Filter count mismatches:
- [category] [filter] — shows X, actual matches: Y

Verdict: [PASS: all filters produce correct results / FAIL: X filter issues found]
```

---

## Final Summary

After all checks, output a combined summary:

```
## Data Audit Summary

| Check | Status | Issues |
|-------|--------|--------|
| Product quality | X% full quality | Y need re-scraping |
| Image coverage | X% complete | Y missing main.webp |
| External deps | PASS/FAIL | Y references to clean up |
| Route validation | X/Y routes valid | Z broken links |
| Index sync | In sync / Out of sync | X discrepancies |
| Seed data | PASS/FAIL | X external URLs, Y invalid IDs |
| Image regex | PASS/FAIL | X unmatched CDN patterns |
| Link coverage | PASS/FAIL | X nav links with no backing page |

Priority actions:
1. [Most critical issue]
2. [Second most critical]
3. ...
```

---

## Critical Rules

- **Run all checks unless a specific check is requested via $ARGUMENTS.**
- **Be exact with counts.** Don't say "about 300" — say "312".
- **Show specific file paths and product IDs** for every issue found — actionable output, not vague summaries.
- **Template detection (expanded):** Flag any description matching these patterns — all are likely AI-generated, not scraped from the real site:
  - Starts with generic phrases: "Enhance your", "Upgrade your", "Experience the", "Discover the", "Transform your", "Elevate your", "Immerse yourself", "Take your", "Bring your", "Enjoy the"
  - Description under 50 characters (likely truncated or placeholder)
  - Duplicate descriptions across different products (same text, different product IDs)
  - Empty specifications object `{}` or specifications with 0 groups
  - Description that doesn't mention the product's brand or model name
- **A passing audit means:** 100% full-quality products, 100% local images, 0 external dependencies, 0 broken routes, index in sync, seed data fully local, all CDN regex patterns matched, all nav links resolve to a page.
