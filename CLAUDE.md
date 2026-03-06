# CLAUDE.md — Electric Project Instructions

Pixel-perfect clone of Electriz TV & Audio section (electriz.co.uk). Next.js 14 App Router, Tailwind CSS 3, React 18, TypeScript 5. All build phases complete — current work is content expansion across all 14 categories, data pipeline work, and visual refinements.

## Commands

```bash
npm run dev      # Dev server on localhost:3000 (clears .next first)
npm run build    # Production build
npm run lint     # ESLint check
```

## Core Rules

1. **No external dependencies.** This is an independent MVP — zero external requests at runtime. All images are local: product images in `public/images/products/`, banners in `public/images/banners/`, icons in `public/images/icons/`. `src/lib/images.ts` maps scraped CDN URLs to local paths. Never add new external image sources.
2. **Match the reference visually.** The design is cloned for fidelity, but all assets and data are self-contained. No dark mode, extra animations, or features the reference doesn't have. "Electriz" is a placeholder brand name.
3. **Screenshots are truth.** 18 references in `reference-screenshots/`. Screenshot > scrape data. See `PROJECT_SPEC.md` for mappings.
4. **Real data only.** Content from `data/scrape/`, tokens from `data/design-tokens.json`. No placeholders, no hardcoded data.
5. **Section-by-section.** One section at a time, compare against reference before moving on.

## Post-Edit Checklist (MANDATORY — run after every edit session)

```bash
# 1. Verify build
npm run build

# 2. Restart dev server (MUST be last step before reporting to user)
lsof -ti:3000 | xargs kill -9 2>/dev/null; rm -rf .next && npm run dev &
```

Never tell the user edits are complete until step 2 has run. The user must never see a stale-cache "Cannot find module" error.

## Gotchas

- **`.next` cache**: NEVER delete `.next/` while dev server is still running. Always kill the server first. The post-edit checklist above handles this.
- **Category slugs**: URL slugs must match keys in `categoryMap` in `src/lib/category-data.ts`. Fallback matching (suffix/prefix) exists but doesn't catch all mismatches. See auto-memory `routing-patterns.md` for the full slug list.
- **Images**: All local. Products at `public/images/products/{id}/{type}.webp`, banners at `public/images/banners/{slug}.webp`, icons at `public/images/icons/{slug}.svg`. `src/lib/images.ts` parses scraped CDN URLs → local paths. 37 products use M-prefix Amplience URL format.
- **Image ordering**: Firecrawl extracts gallery images in DOM order, which is **not** reliably the display order. ~5% of products had the base image buried mid-array. `mergeScrapedData()` in `product-data.ts` sorts both gallery and thumbnail arrays by CDN URL suffix (`getImageSortKey()` in `images.ts`) before converting to local paths. If you re-scrape products or change image merging, preserve this sort step.
- **Mass changes**: When renaming or replacing text across the project, search ALL directories (`src/`, `data/`, `scripts/`, root docs) not just source code. The `data/scrape/` folder has 2,300+ JSON files with embedded URLs. Always verify with a project-wide grep afterward.
- **No external URLs in `<img>` or `Image` src**: Every image source must resolve to a local `/images/...` path. If you find a component using a CDN URL in its `src`, download the asset locally and update the reference.

## Key Paths

- `src/lib/category-data.ts` — categoryMap, banner configs, filter logic
- `src/lib/product-data.ts` — product detail merging (category + scraped data)
- `src/lib/images.ts` — scraped CDN URL → local path parser
- `src/lib/constants.ts` — SITE_URL, stripDomain utility
- `data/design-tokens.json` — colors, fonts, spacing, radii (use these over Tailwind defaults)
- `data/scrape/` — category JSONs + `products/` individual product JSONs

## Data Pipeline (scripts/)

Run manually: `node scripts/<name>.js`. Key scripts in pipeline order:

1. `scrape-category-pages.js` — Fetch from Electriz listing pages → category JSONs
2. `build-all-categories.js` — Merge, deduplicate, normalize category data
3. `generate-product-details.js` — Create product detail files from category data
4. `build-products-index.js` — Build master `products-index.json`
5. `download-images.js` — Download images to `public/images/products/{id}/`
6. `build-size-variants.js` — Group TVs by family for size navigation
7. `verify-coverage.js` — Report coverage stats

TV-specific: `analyze-tv-families.js` → `propagate-tv-data.js` → `add-missing-variants.js` → `build-all-tv-products.js`

Utilities (not part of main pipeline): `create-page-content.js`, `strip-finance-collect.js`

## Firecrawl Best Practices

- **No CSS/layout extraction** — do not extract CSS or layout during scrapes; it's inaccurate and not needed.
- **No full crawls** — targeted scrapes only; full crawls are off the table.
- **Quality over speed** — cost is not a factor; get the data right rather than fast.

- **UK locale:** All scrapes must include `location: { country: "GB", languages: ["en-GB"] }`. Firecrawl defaults to US proxies — without this, prices may return in USD and geo-targeted content will differ.
- **Caching:** Dev iteration = `maxAge: 86400000` (1-day cache, ~5x faster). Fresh data = `maxAge: 0`. Always `maxAge: 0` for `/update-data` and `/recover-missing`.
- **Batch scraping:** Max 20 parallel `firecrawl_scrape` calls per batch. Higher risks rate limiting.
- **Lazy content:** If a product scrape returns empty specs or <3 gallery images, retry with `actions: [{ type: "scroll", direction: "down" }, { type: "wait", milliseconds: 2000 }]`.
- **Browser sessions:** Always call `firecrawl_browser_delete` after `firecrawl_browser_create`. Orphaned sessions cost 2 credits/min.
- **Credit costs:** JSON format = +4 credits/page. Agent = dynamic pricing. Browser = 2 credits/min. Enhanced proxy = +4 credits/page.
- **Link checking:** Use `firecrawl_crawl` on localhost for page discovery, then manual HTTP checks for image integrity.

## Conventions

- **Styling**: Tailwind with custom tokens from `design-tokens.json` in `tailwind.config.ts`. Token values > Tailwind defaults.
- **Page backgrounds**: Content pages (category listings, product detail, hub pages) use `bg-surface` (`#F5F5F5`) as the full-page background with white cards for content. Homepage stays white. Header components: SecondaryNav and USPBar use `bg-surface`, Header and MainNav use `bg-white`.
- **State**: React Context for basket/saved/orders. Checkout state is component-local.
- **API**: `/api/search` — search results + autocomplete (used by search page).
- **Git**: Commit per section `feat(section): add [page] [section-name]`. Don't commit without being asked.
