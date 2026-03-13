# Skills Pipeline Index

Quick reference for all skills, organized by phase. Use this to understand what order to run skills and what depends on what.

**How to read this:** Each skill shows its pipeline position, what it needs before it can run (depends on), and what it feeds into next. Skills within the same phase can often run in parallel if their dependencies are met.

---

## Phase 1: Discovery & Site Analysis

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 1 | `/map-site` | Discover site structure, navigation, design tokens | — (entry point) | `/scrape-content`, `/scrape-products`, `/scrape-seo`, `/extract-layout`, `/scaffold-project` |
| 2 | `/scrape-content` | Extract homepage, hub pages, service page content | `/map-site` | `/download-assets`, `/content-parity`, `/extract-layout` |
| 3 | `/scrape-products` | Scrape all category listings + product details | `/map-site` | `/normalize-data`, `/scrape-seo`, `/download-images`, `/audit-data`, `/update-data` |
| 4 | `/scrape-seo` | Extract SEO metadata (titles, schemas, robots.txt) | `/map-site`, `/scrape-products` | `/seo-audit` |
| 5 | `/recover-missing` | Retry failed product scrapes (3-tier strategy) | `/scrape-products` | `/normalize-data`, `/download-images` |

---

## Phase 2: Data Processing

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 6 | `/normalize-data` | Standardize JSON schemas across all scraped files | `/scrape-products` | `/build-data-layer`, `/download-images`, `/verify-coverage` |
| 7 | `/build-data-layer` | Generate products-index.json, size-variants.json | `/normalize-data`, `/scrape-products` | `/verify-coverage`, `/scaffold-project` |
| 8 | `/audit-data` | Verify data completeness and image existence | `/scrape-products`, `/download-images` | `/content-parity`, `/link-check` |

---

## Phase 3: Asset Acquisition

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 9 | `/download-images` | Download product images to local paths | `/scrape-products`, `/normalize-data` | `/verify-coverage`, `/audit-data`, `/content-parity` |
| 10 | `/download-assets` | Download logos, icons, banners, fonts | `/scrape-content`, `/scrape-products` | `/verify-coverage`, `/audit-data`, `/content-parity` |

---

## Phase 4: GO/NO-GO Gate

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 11 | `/verify-coverage` | **BLOCKING** — 95% detail coverage, 100% main images, all nav links | `/download-images`, `/download-assets`, `/normalize-data` | `/scaffold-project` |

**Do not proceed to Phase 5 until `/verify-coverage` passes.**

---

## Phase 5: Project Construction

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 12 | `/scaffold-project` | Generate routes, types, data layer, component shells | `/map-site`, `/normalize-data`, `/verify-coverage` | `/build-component`, `/build-admin` |
| 13 | `/extract-layout` | CSS measurements from reference site | `/scrape-content`, `/map-site` | `/scaffold-project`, `/build-component` |
| 14 | `/build-component` | Build one component at a time with real measurements | `/scaffold-project`, `/extract-layout` | `/fix-filters`, `/fix-routes`, `/content-parity` |
| 15 | `/build-admin` | Full admin dashboard with CRUD, auth | `/scaffold-project`, `/security-audit` | `/smoke-test`, `/link-check` |

---

## Phase 6: Wiring & Fixes

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 16 | `/fix-routes` | Verify nav links resolve to categoryMap keys | `/scaffold-project`, `/build-component` | `/link-check`, `/smoke-test` |
| 16b | `/ecommerce-parity` | Wire all e-commerce user journeys end-to-end | `/build-component`, `/build-admin`, `/scaffold-project` | `/smoke-test`, `/content-parity` |
| 17 | `/fix-filters` | Fix filter bugs (case, numeric, ranges) | `/scaffold-project`, `/build-component` | `/smoke-test`, `/content-parity` |
| 17b | `/scrape-filters` | Scrape filter sidebar data from reference | `/scrape-products` | `/fix-filters`, `/smoke-test` |
| 17c | `/test-filters` | Verify filter data integrity and handler sync | `/scrape-filters`, `/fix-filters` | `/smoke-test` |
| 19 | `/strip-external` | Ensure zero external URLs at runtime | `/download-images`, `/download-assets`, `/build-component` | `/security-audit`, `/performance-audit` |

---

## Phase 7: Verification & Parity

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 20 | `/content-parity` | Rendered content matches JSON data | `/scrape-content`, `/scrape-products`, `/download-images`, `/build-component` | — |
| 21 | `/link-check` | Crawl site, verify all URLs resolve | `/fix-routes` | `/seo-audit` |
| 22 | `/smoke-test` | Functional end-to-end flows | `/fix-filters`, `/fix-routes` | — |
| 23 | `/seo-audit` | Verify SEO metadata matches reference | `/scrape-seo`, `/link-check` | — |

---

## Phase 8: Quality & Compliance

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 24 | `/security-audit` | Headers, XSS, auth, dependencies, secrets | `/strip-external` | `/build-admin` |
| 25 | `/responsive-audit` | Layout at 7 viewports (375–2560px) | `/build-component` | — |
| 26 | `/performance-audit` | Lighthouse scores, bundle sizes, image optimization | `/strip-external` | — |
| 27 | `/accessibility-audit` | WCAG 2.1 AA compliance | `/build-component`, `/build-admin`, `/smoke-test` | — |
| 28 | `/visual-parity` | CSS colors, typography, spacing, effects | `/extract-layout`, `/build-component`, `/responsive-audit` | — |
| 29 | `/motion-parity` | Animation timing, easing, auto-play intervals | `/visual-parity`, `/build-component` | — |
| 33 | `/carousel-parity` | Carousel visible item counts at all breakpoints | `/extract-layout`, `/build-component` | `/motion-parity`, `/smoke-test` |

---

## Phase 9: Testing & Deployment

| # | Skill | Purpose | Depends On | Feeds Into |
|---|-------|---------|------------|------------|
| 30 | `/generate-tests` | Generate test suites | `/build-component`, `/build-admin`, `/smoke-test` | `/deploy` |
| 31 | `/deploy` | Docker, CI/CD, production build, smoke test | `/build-component`, `/build-admin`, `/smoke-test`, `/strip-external`, `/security-audit`, `/generate-tests` | — |

---

## Maintenance (On-Demand)

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/update-data` | Re-scrape reference site for changes | Periodically, or when reference site updates |
| `/session-handoff` | Document progress, decisions, next steps | End of every work session |

---

## Typical Run Order (New Project)

1. `/map-site` → discover everything
2. `/scrape-content` + `/scrape-products` (parallel)
3. `/scrape-seo` + `/recover-missing` (parallel, after scraping)
4. `/normalize-data` → `/build-data-layer`
5. `/download-images` + `/download-assets` (parallel)
6. `/verify-coverage` — **GATE: must pass**
7. `/scaffold-project` → `/extract-layout` → `/build-component`
8. `/build-admin` + `/ecommerce-parity` + `/fix-routes` + filter pipeline
9. Verification sweep: `/content-parity`, `/smoke-test`, `/link-check`, `/seo-audit`
10. Quality sweep: `/security-audit`, `/responsive-audit`, `/performance-audit`, `/accessibility-audit`
11. Parity sweep: `/visual-parity`, `/motion-parity`, `/carousel-parity`
12. `/generate-tests` → `/deploy`
