# Known Issues

Last audited: 2026-03-10

## Moderate

### 4 Products Missing `main.webp`

**Impact:** These products show broken images in category listings.

**Products:** `10194276` (Ross wall mount), `10194482` (One For All remote), `10215892` (AVF TV stand), `10248652` (Sanus wall mount)

**Cause:** Images were never downloaded during the original scrape pipeline. The CDN URLs in their data use the placeholder domain and cannot be resolved.

**Fix:** Re-scrape these 4 products from the real source site to obtain working image URLs, then run the download pipeline.

## Low

### No Test Infrastructure

**Impact:** No automated testing. Zero test files exist.

**Fix:** Install Vitest + React Testing Library for unit/component tests, Playwright for E2E.

### No Dockerfile or CI/CD Configuration

**Impact:** No standardized deployment pipeline.

**Fix:** See [DEPLOYMENT.md](DEPLOYMENT.md) for recommended Docker and CI/CD setup.

---

## Resolved (2026-03-10)

- ~~Image alt text gaps~~ — Fixed: all `<Image>` components now use descriptive alt text
- ~~Hub page `/tv-and-audio` returns 500~~ — Fixed: hub icons now use local paths
- ~~21 zero-byte WebP files~~ — Fixed: 0 zero-byte files remain
- ~~Stray empty `src/components/layout/CLAUDE.md`~~ — Deleted
- ~~`size-variants.json` may be empty~~ — Contains valid TV variant data
- ~~5 categories missing filter data~~ — verify-coverage.js reports 7/7 categories have filters
