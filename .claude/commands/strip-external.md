Scan the entire codebase for any remaining external domain references and eliminate them. Ensures the clone is fully self-contained with zero runtime dependencies on the reference site or CDN.

**Pipeline position:** 19/32 — depends on: `/download-images`, `/download-assets`, `/build-component` | feeds into: `/security-audit`, `/performance-audit`

**Usage:** `/strip-external` — scans entire project

Optionally: `/strip-external <scope>` where `$ARGUMENTS` is `src`, `data`, `config`, or `public`. Omit to scan everything.

---

## Golden Rule

**Zero external requests at runtime.** The clone must work with airplane mode on. No CDN image loads, no reference site links, no external font fetches, no analytics scripts. Every asset is local. Every link is internal.

---

## Prerequisites

- All images downloaded (run `/download-images` first)
- All assets downloaded (run `/download-assets` first)
- `src/lib/images.ts` with `toLocalImage()` function

---

## Steps

### 1. Scan source code for external URLs

Grep the entire `src/` directory for external domain patterns:

**CDN domains to find:**

The CDN domains are `electrizprod` and `currysprod` (from `src/lib/images.ts`). These are the image CDN path prefixes used in scraped data URLs. Also check `src/lib/constants.ts` for the canonical domain strings and `SITE_URL`.

**Reference site domains:**

The reference site domain (electriz.co.uk) and any subdomains.

**Other external patterns:**

- Any `https://` in `src=`, `href=`, `url(`, `fetch(`, `Image` props
- Any `http://` references (even more problematic)
- Google Fonts, Adobe Fonts, or other external font CDNs
- Analytics scripts (Google Analytics, Hotjar, etc.)
- Social media embed URLs

**For each hit, classify:**

| Type | Action |
|------|--------|
| Image URL in component | Wrap with `toLocalImage()` |
| Image URL in data/seed | Map through `asset-map.json` |
| Link to reference site | Use `stripDomain()` to extract path |
| Font URL | Should already be local from `/download-assets` |
| Analytics/tracking | Remove entirely |
| External API call | Remove or mock |

### 2. Scan data files for external URLs

Grep `data/scrape/` JSON files for external URLs:

**Note:** Scraped data files SHOULD contain external URLs — they're the source of truth from scraping. The issue is when these URLs leak into runtime rendering without being mapped to local paths.

Check:
- Are any external URLs from data files rendered directly in components (without `toLocalImage()` or `asset-map.json` lookup)?
- Are seed data files in context providers using external URLs?

### 3. Scan config files

Check these specific files:

**`next.config.mjs`:**
- `remotePatterns` — should be empty array `[]`. If it has entries, those are CDN domains the app can still fetch from at runtime.
- `images.domains` — should be empty or not present.

**`tailwind.config.ts`:**
- No external font URLs
- No external image references in theme

**`.env` / `.env.local`:**
- No external API endpoints
- `NEXT_PUBLIC_SITE_URL` should point to localhost or the clone domain

### 4. Scan public directory

Check `public/` for:
- Any files that are actually HTML error pages (< 100 bytes, or start with `<!DOCTYPE`)
- Any symlinks or references to external paths
- Verify critical assets exist: favicon, logo, fonts

### 5. Check React Context seed data

Read every `src/lib/*-context.tsx` file:

- `orders-context.tsx` — seed order images should use local paths
- `saved-context.tsx` — saved item images should use local paths
- `basket-context.tsx` — any default basket items

For each external URL found: replace with the local equivalent from `asset-map.json` or `toLocalImage()`.

### 6. Apply fixes

For each external reference found:

**Image in component → wrap with `toLocalImage()`:**
```typescript
// BEFORE
<Image src={product.imageUrl} ... />

// AFTER
import { toLocalImage } from '@/lib/images';
<Image src={toLocalImage(product.imageUrl)} ... />
```

**Link to reference site → use `stripDomain()`:**
```typescript
// BEFORE
<Link href="https://www.reference-site.com/{section-slug}/{category-slug}">

// AFTER
import { stripDomain } from '@/lib/constants';
<Link href={stripDomain("https://www.reference-site.com/{section-slug}/{category-slug}")}>
// Or better — just use the path directly:
<Link href="/{section-slug}/{category-slug}">
```

**Seed data external URL → replace with local path:**
```typescript
// BEFORE
image: "https://{image-cdn}/{cdn-path-prefix}/{product-id}?$transform$"

// AFTER
image: "/images/products/{product-id}/main.webp"
```

**next.config.mjs → empty remotePatterns:**
```javascript
// BEFORE
remotePatterns: [
  { protocol: 'https', hostname: '{image-cdn-domain}' },
]

// AFTER
remotePatterns: []
```

### 7. Verify with network blocking

After all fixes, verify the app works with no external network:

1. Start the dev server
2. Open a browser session (or use Firecrawl)
3. Navigate to: homepage, a category page, a product detail page, basket, checkout
4. Check browser dev tools Network tab — any requests to external domains?
5. All images should load from `/images/products/...` paths

If network verification isn't possible, grep the built output:
```bash
# Check the .next build output for external URLs — use CDN domains from src/lib/images.ts
grep -r "{cdn-domain-1}\|{cdn-domain-2}\|{reference-site-domain}" .next/
```

### 8. Output report

```
## External Dependency Strip Report

### Scan Results

| Scope | Files Scanned | External URLs Found | Fixed |
|-------|--------------|--------------------:|------:|
| src/ | X | Y | Y |
| data/ (runtime) | X | Y | Y |
| config | X | Y | Y |
| public/ | X | Y | — |
| Context seed data | X | Y | Y |
| **Total** | **X** | **Y** | **Y** |

### External URLs by Domain

| Domain | Count | Action |
|--------|------:|--------|
| {image-cdn-domain} | X | Wrapped with toLocalImage() |
| {reference-site-domain} | X | Replaced with local paths |
| {content-cdn-domain} | X | Wrapped with toLocalImage() |

### Fixes Applied

| # | File:Line | Before | After | Type |
|---|-----------|--------|-------|------|
| 1 | orders-context.tsx:45 | https://{image-cdn}/... | /images/products/{product-id}/main.webp | Seed data |
| 2 | HeroCarousel.tsx:23 | https://{reference-site}/... | /{section-slug}/{category-slug} | Link |
| 3 | next.config.mjs:12 | remotePatterns: [...] | remotePatterns: [] | Config |

### Config Verification

| Config | Status |
|--------|--------|
| next.config.mjs remotePatterns | Empty — PASS |
| next.config.mjs images.domains | Not present — PASS |
| .env NEXT_PUBLIC_SITE_URL | localhost:{port} — PASS |
| tailwind.config.ts | No external URLs — PASS |

### Runtime Verification

Network requests to external domains: 0 — PASS

Verdict: PASS — fully self-contained, zero external dependencies
```

---

## Critical Rules

- **Zero means zero.** Even one external URL that loads at runtime is a failure. The clone must work offline.
- **Don't modify scraped data files.** The JSON files in `data/scrape/` are the source of truth from scraping. Fix the rendering layer (components, context providers) to map external URLs to local paths — don't rewrite the data.
- **`remotePatterns: []` is the goal.** If `next.config.mjs` has CDN domains in `remotePatterns`, those are escape hatches that should be closed once all images are local.
- **Seed data is often forgotten.** Context providers with demo orders, saved items, or basket defaults often contain hardcoded CDN URLs that bypass `toLocalImage()`. Always check these.
- **Analytics must be removed entirely.** Don't just comment out tracking scripts — delete them. They serve no purpose in a clone.
- **Test by clicking, not just grepping.** A grep might miss dynamically constructed URLs. Actually navigate the site and check the Network tab.
