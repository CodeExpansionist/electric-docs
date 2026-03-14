# Known Issues

> **Authority:** Governance — this document is the human-readable project status tracker. For automated parity results, see [`artifacts/parity/reports/parity-report.md`](../artifacts/parity/reports/parity-report.md).

Last audited: 2026-03-14

## Open Issues

### P0 — Critical

#### Checkout Form Parity Test Timeout

**Severity:** P0 (parity test blocker)
**Identified:** 2026-03-14 (automated parity run)
**Status:** Open — test selector issue, not a user-facing bug

**Impact:** Parity test for "checkout-steps" interaction times out waiting for `input[name='address1']`. The address fields are hidden behind a `showManual` state toggle in `DeliveryStep.tsx` — the test does not trigger "Enter address manually" or "Find address" before attempting to fill the form.

**Fix:** Update the parity test to click "Enter address manually" or "Find address" before filling address fields.

### P1 — Major

#### PDP Gallery Thumbnail Click Does Not Change Main Image

**Severity:** P1 (behavioural mismatch)
**Identified:** 2026-03-14 (automated parity run)
**Status:** Open

**Impact:** On product 10248732, clicking a gallery thumbnail does not update the main image src. The `ProductGallery.tsx` click handler is correct (`setCurrent(i)`), but the local image paths may resolve to the same file after CDN URL conversion in `mergeScrapedData()`.

**Fix:** Investigate `mergeScrapedData()` in `product-data.ts` and `getImageSortKey()` in `images.ts` to determine if multiple CDN URLs map to the same local path.

#### PDP Size Selector Does Not Navigate

**Severity:** P1 (behavioural mismatch)
**Identified:** 2026-03-14 (automated parity run)
**Status:** Open

**Impact:** Clicking a size variant on a TV product page does not change the URL. The reference site navigates to a different product page for each size variant.

**Fix:** Verify size variant links in the PDP component and ensure they navigate to the correct product slug.

### Moderate

#### 4 Products Missing `main.webp`

**Impact:** These products show broken images in category listings.

**Products:** `10194276` (Ross wall mount), `10194482` (One For All remote), `10215892` (AVF TV stand), `10248652` (Sanus wall mount)

**Cause:** Images were never downloaded during the original scrape pipeline. The CDN URLs in their data use the placeholder domain and cannot be resolved.

**Fix:** Re-scrape these 4 products from the real source site to obtain working image URLs, then run the download pipeline.

### Low

#### No Test Infrastructure

**Impact:** No automated testing. Zero test files exist.

**Fix:** Install Vitest + React Testing Library for unit/component tests, Playwright for E2E.

#### No Dockerfile or CI/CD Configuration

**Impact:** No standardized deployment pipeline.

**Fix:** See [DEPLOYMENT.md](DEPLOYMENT.md) for recommended Docker and CI/CD setup.

---

## Automated Parity Status

**Latest run:** 2026-03-14T17:23:10.214Z
**Verdict:** FAIL
**Report:** [`artifacts/parity/reports/parity-report.md`](../artifacts/parity/reports/parity-report.md)

| Template        | Structural | Behavioural | Verdict |
| --------------- | ---------- | ----------- | ------- |
| basket          | 7/7        | No rules    | PASS    |
| checkout        | 6/6        | 1/2         | FAIL    |
| homepage        | 23/23      | No rules    | PASS    |
| pdp             | 8/8        | 3/5         | FAIL    |
| plp             | 6/6        | 1/1         | PASS    |
| search          | 12/12      | No rules    | PASS    |
| homepage-mobile | 0/0        | 1/1         | PASS    |

Additionally, 10 P2 section-ordering mismatches were detected on homepage and search pages (sections offset by 2 positions). See the full report for details.

---

## Resolved (2026-03-10)

- ~~Image alt text gaps~~ — Fixed: all `<Image>` components now use descriptive alt text
- ~~Hub page `/tv-and-audio` returns 500~~ — Fixed: hub icons now use local paths
- ~~21 zero-byte WebP files~~ — Fixed: 0 zero-byte files remain
- ~~Stray empty `src/components/layout/CLAUDE.md`~~ — Deleted
- ~~`size-variants.json` may be empty~~ — Contains valid TV variant data
- ~~5 categories missing filter data~~ — verify-coverage.js reports 7/7 categories have filters
