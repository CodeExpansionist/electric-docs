Download all product images locally from CDN URLs captured by `/scrape-products`. Ensures zero external image dependencies at runtime.

**Pipeline position:** 9/32 — depends on: `/scrape-products`, `/normalize-data` | feeds into: `/verify-coverage`, `/audit-data`, `/content-parity`

**Usage:** `/download-images` — runs against the current project's `data/scrape/products-index.json`

Optionally: `/download-images <product-id>` to download images for a single product. `$ARGUMENTS` is the optional product ID filter.

---

## Golden Rule

**Full independence.** Every image the clone displays must be served locally. After this skill runs, the app must work with no network access to any external CDN. No `<img src="https://...">` anywhere in the final product.

---

## Prerequisites

- `data/scrape/products-index.json` must exist (run `/scrape-products` first)
- Product detail files in `data/scrape/products/` must contain image URLs

---

## Steps

### 1. Load product data

Read `data/scrape/products-index.json` to get all product IDs and their image URLs (gallery + thumbnails). If `$ARGUMENTS` is a product ID, filter to just that product.

### 2. Mandatory CDN pattern discovery (BLOCKING — do this BEFORE any downloading)

Sample at least 100 image URLs across ALL categories (not just one) and group by URL pattern. This discovers every distinct CDN format before downloading begins — preventing silent failures where variant-pattern products are missed.

**Steps:**

1. Extract ALL unique image URLs from `products-index.json` and individual product detail files
2. Group URLs by pattern (regex bucket): standard, variant suffix, alternative URL patterns, and any unknown patterns
3. Count products per pattern — log the count for each discovered pattern and flag any unknowns
4. Verify ALL patterns are handled by the `toLocalImage()` regex in `src/lib/images.ts`
5. **BLOCK if any unhandled pattern exists** — "Found N products with [pattern] URLs not handled by toLocalImage(). Fix the regex before proceeding."

**Example CDN patterns (discovered during Step 2's pattern analysis):**

- **Standard single-ID:** `https://{image-cdn}/{cdn-path-prefix}/{productId}?$transform$&fmt=auto`
- **With variant suffix:** `https://{image-cdn}/{cdn-path-prefix}/{productId}_{variant}?$transform$&fmt=auto`
- **Alternative URL pattern (e.g., color variants):** `https://{image-cdn}/{cdn-path-prefix}/{alt-prefix}{productId}_{color}?$transform$&fmt=auto`
- **Alternative pattern with suffix:** `https://{image-cdn}/{cdn-path-prefix}/{alt-prefix}{productId}_{color}_{variant}?$transform$&fmt=auto`

**Every site has its own patterns.** The point is to discover them ALL before downloading, not to assume any fixed list. The above are illustrative examples only.

### 3. Download images for each product

For each product, create a directory `public/images/products/{productId}/` and download:

| File | CDN Transform | Purpose |
|------|---------------|---------|
| `main.webp` | `$g-small$` | Listing/card thumbnail |
| `large.webp` | `$l-large$` | Gallery main image |
| `thumb.webp` | `$t-thumbnail$` | Gallery thumbnail |
| `gallery_001.webp` to `gallery_012.webp` | `$l-large$` with `_{001}` to `_{012}` variant suffix | Gallery additional images |
| `thumb_001.webp` to `thumb_012.webp` | `$t-thumbnail$` with `_{001}` to `_{012}` variant suffix | Gallery additional thumbnails |

**Download rules:**
- Use a Node.js download script with concurrency of 10 parallel workers
- Retry failed downloads 3 times with exponential backoff (2s, 4s, 8s)
- Reject any downloaded file smaller than 500 bytes (likely an error page)
- For gallery/thumb variants, stop on first 404 — not all products have 12 variants
- Skip products that already have `large.webp` (already downloaded)
- Request `fmt=auto` to get WebP format
- Set a realistic User-Agent header

### 4. Handle alternative URL pattern color variants

Some products use alternative URL patterns where:
- All color variants of the same product share an image base
- e.g., `{alt-prefix}{product-id}_black`, `{alt-prefix}{product-id}_white` → both save to `public/images/products/{product-id}/`

When detected:
- Download using the first color variant found
- All color variants of that product share the same local directory
- Log which products use the alternative URL pattern for reference

### 4b. Enumerate all alternative-pattern products

After handling alternative-pattern downloads, produce a complete inventory:

1. List ALL alternative-pattern products with their product IDs, color names, and source URLs
2. Identify which products share image bases across colors (e.g., a product where all color variants use the same base image ID)
3. Verify the download script correctly mapped alternative-pattern IDs to standard product directories
4. Log count: "N alternative-pattern products across M product families, X unique image bases"

This prevents the silent failure where alternative-pattern products downloaded to wrong directories or were skipped entirely.

### 5. Create/update the image mapping utility

Create or update `src/lib/images.ts` with a `toLocalImage()` function that:
- Takes any CDN image URL as input
- Returns the local path (`/images/products/{id}/{type}.webp`)
- Handles all detected CDN patterns (standard, variant, alternative URL patterns)
- Falls back to the original URL only if no pattern matches (should be rare)

Also create helper functions:
- `getListingImage(productId)` → `/images/products/{id}/main.webp`
- `getLargeImage(productId)` → `/images/products/{id}/large.webp`
- `getGalleryImages(productId, count)` → array of gallery paths
- `getThumbnailImages(productId, count)` → array of thumb paths

### 5b. Verify regex compatibility (do this BEFORE step 3 on a new project)

Before downloading, verify the `toLocalImage()` regex in `src/lib/images.ts` actually matches the CDN URLs in the scraped data. **This is a BLOCKING gate — do NOT proceed to Step 3 if it fails.**

1. Take 10 representative CDN image URLs from across the scraped data (mix of standard, variant, and alternative URL patterns — at least 1 from each pattern found in Step 2)
2. Test each against BOTH the `toLocalImage()` regex AND the `ProductImage.tsx` `extractProductId()` regex
3. Log: "Regex compatibility: 10/10 matched toLocalImage(), 8/10 matched ProductImage.tsx — PASS/FAIL"
4. If ANY URL fails to match either regex: **STOP and fix the regex before proceeding** — "Frontend won't map these URLs to local paths — images will break at runtime"

**KNOWN ISSUE:** If secondary components (e.g., admin image previews) use a simpler regex than the main `toLocalImage()` function, variant/color-pattern URLs will fail to match. Ensure ALL regex patterns that extract product IDs from CDN URLs handle every pattern discovered in Step 2 — standard single-ID, variant suffixes, and color-prefix patterns. **Fix any simplified regex to match the full pattern** before proceeding, or variant-pattern product images will show fallback placeholders.

### 6. Verify and report

After downloading, run a coverage check:

```
## Image Download Report

Products processed: X
Products skipped (already complete): X
Products downloaded: X
Products failed: X

Total images downloaded: X
Total disk usage: X GB

Coverage:
- Products with main.webp: X/Y (Z%)
- Products with large.webp: X/Y (Z%)
- Products with 3+ gallery images: X/Y (Z%)
- Average images per product: X

CDN patterns used:
- Standard single-ID pattern: X products
- Alternative URL pattern: X products

Failed downloads (need retry):
  - [product ID] [image type] [error]
```

### 7. Verify no external image dependencies remain

After download completes, check:
- `next.config.mjs` `remotePatterns` — these should be fallback-only. Flag if present.
- Grep `src/` for any hardcoded external image URLs that bypass `toLocalImage()`
- Confirm the app works if all external CDN domains are unreachable

---

## Critical Rules

- **Every product must have at least `main.webp`.** This is the listing image — without it the product card is broken.
- **No external image loading at runtime.** The `remotePatterns` in `next.config.mjs` are emergency fallbacks, not a feature.
- **Don't guess image URLs.** Use the actual URLs from the scraped product data. If no gallery URLs were captured, download only main/large/thumb.
- **Preserve image quality.** Download at the highest available resolution (use `$l-large$` transform for gallery images).
- **Log everything.** Failed downloads, skipped products, alternative-pattern detections — all logged for debugging.
- **Gallery image order is unreliable from scrapes.** Firecrawl returns gallery URLs in DOM order, not display order. ~5% of products will have the base image (no `_NNN` suffix) buried mid-array instead of first, and gallery/thumbnail arrays may be misaligned. The file naming convention (base → `large.webp`, `_001` → `gallery_001.webp`) is correct regardless of array order — but `mergeScrapedData()` in `product-data.ts` sorts both arrays by suffix via `getImageSortKey()` before mapping to local paths. If you modify `toLocalImage()` or the naming convention, ensure this sort step still works.
