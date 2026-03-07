# Known Issues

Issues identified during the E2E pipeline test (March 2026). Sorted by severity.

## Critical

### Hub Page `/tv-and-audio` Returns 500

**Impact:** The main TV & Audio hub page is broken in development.

**Cause:** `data/scrape/tv-audio-hub.json` contains external CDN URLs in the `iconUrl` field (e.g., `https://media.electriz.biz/i/electrizprod/top-cat-tvs-all-new?fmt=auto&$q-large$`). When passed to `next/image`, these fail because `remotePatterns: []` in `next.config.mjs` blocks all external image sources.

**Fix:** Download the hub category icons locally and update the JSON to use local paths (e.g., `/images/icons/top-cat-tvs.webp`).

**Affected files:** `data/scrape/tv-audio-hub.json`, `src/app/tv-and-audio/page.tsx`

## Moderate

### 8 Products Missing `main.webp`

**Impact:** 8 products will show broken images in category listings.

**Cause:** The CDN domain `media.electriz.biz` does not resolve (placeholder domain). These 8 products' images were never downloaded because the CDN was unreachable during the download phase.

**Products missing images:** Check with `node scripts/verify-coverage.js`

**Fix:** Source images from an alternative CDN or add placeholder images.

### 5 Categories Missing Filter Data

**Impact:** Remote Controls, Wall Brackets, Radios, Blu-ray Players, and Home Cinema categories show filters with 0 options.

**Cause:** These category pages use heavy JavaScript rendering (SPA). The Firecrawl scraper couldn't extract filter data from the rendered page.

**Fix:** Re-scrape these categories with scroll + wait actions to allow JavaScript to render filters:
```javascript
actions: [
  { type: "scroll", direction: "down" },
  { type: "wait", milliseconds: 3000 },
  { type: "scroll", direction: "down" },
  { type: "wait", milliseconds: 2000 }
]
```

### 36 Image Components Missing Alt Text

**Impact:** Accessibility issue (WCAG 2.1 AA non-compliance for images).

**Cause:** Many `<Image>` components use empty `alt=""` or generic alt text.

**Fix:** Add descriptive alt text derived from product name, brand, and category.

## Low

### No Test Infrastructure

**Impact:** No automated testing. Zero test files exist.

**Cause:** Testing was deferred during the initial build phase.

**Fix:** Install Jest + React Testing Library, create unit tests for data layer functions, component tests for key UI components, and E2E tests with Playwright.

### No Dockerfile or CI/CD Configuration

**Impact:** No standardized deployment pipeline.

**Fix:** See [DEPLOYMENT.md](DEPLOYMENT.md) for recommended Docker and CI/CD setup.

### 21 Zero-Byte WebP Files

**Impact:** Some thumbnail and gallery image variants are 0 bytes. These are not `main.webp` files so they don't break listings, but gallery views may show broken images.

**Cause:** Download failures during the image acquisition phase.

**Fix:** Re-run `node scripts/download-images.js` for affected products.

### Stray Empty File: `src/components/layout/CLAUDE.md`

**Impact:** None (empty file).

**Fix:** Delete the file.

### `size-variants.json` May Be Empty

**Impact:** TV size selectors on product detail pages won't show size options.

**Cause:** The `build-size-variants.js` script may need to be re-run after data updates.

**Fix:** `node scripts/build-size-variants.js`
