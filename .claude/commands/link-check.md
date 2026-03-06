Crawl the entire local site to find dead links, broken images, orphan pages, and missing assets. Ensures every URL resolves and every image loads.

**Pipeline position:** 21/32 — depends on: `/fix-routes` (recommended) | feeds into: `/seo-audit`

**Usage:** `/link-check` — crawls from homepage, follows all internal links

Optionally: `/link-check <start-path>` where `$ARGUMENTS` is the starting URL path (e.g., `/admin` to crawl admin section, `/{section-slug}` to crawl category pages only). Omit to crawl everything.

---

## Golden Rule

**Zero 404s. Every link resolves, every image loads, every page is reachable.** A single broken link or missing image is a bug. This skill finds them all by crawling the site like a search engine would.

---

## Prerequisites

- Dev server running at the dev server URL (from `package.json`)
- Site must have navigable content (at least homepage + some products)

---

## Steps

### 1. Start the crawl

Use `firecrawl_crawl` to automatically discover all internal pages:

```
firecrawl_crawl with:
  url: "http://localhost:3000" (or start path from $ARGUMENTS)
  maxDiscoveryDepth: 4
  limit: 400
  allowExternalLinks: false
  deduplicateSimilarURLs: true
  sitemap: "skip"
  scrapeOptions: { formats: ["links"], onlyMainContent: false }
```

Poll with `firecrawl_check_crawl_status` until complete. This handles link extraction, deduplication, and depth tracking natively — no manual BFS implementation needed.

The crawl results give you every internal page URL discovered, with the links found on each page. Use this as the master URL list for step 2.

**Note:** `firecrawl_crawl` discovers URLs but does not verify HTTP status codes or image integrity. Step 2 still requires direct HTTP checks for images and assets.

### 2. Check each discovered URL

For every URL found (pages, images, assets):

**Pages (`<a href>`):**
- HTTP status code (200 = OK, 301/302 = redirect, 404 = broken)
- Has meaningful content (not blank/error page)
- No uncaught console errors

**Images (`<img>`, `<source>`):**
- HTTP status code 200
- File size > 500 bytes (smaller = likely corrupt or error page)
- Content-Type is image/* (not HTML error page)

**Assets (`<link>`, `<script>`):**
- HTTP status code 200
- Correct Content-Type

### 2b. Cross-reference nav links against categoryMap

For every `/{section-slug}/*` link found during the crawl:

1. Read `src/lib/category-data.ts` and extract all `categoryMap` keys
2. For each nav link, extract the slug portion after `/{section-slug}/`
3. Check if that slug exists as a key in `categoryMap` (exact match or fuzzy match)
4. If no match: this link will show an empty page or 404 — flag as CRITICAL

This catches routing mismatches where nav links use slugs that don't match any categoryMap key.

```
Nav Link vs categoryMap:
- /{section-slug}/{category-slug} → categoryMap["{category-slug}"] → MATCH
- /{section-slug}/{unknown-slug} → categoryMap["{unknown-slug}"] → NO MATCH (CRITICAL)
```

### 3. Find orphan pages

Cross-reference crawled pages against:
- `src/app/sitemap.ts` output — pages in sitemap but not reachable by crawling
- Known routes from `src/app/` directory structure — routes that exist in code but no link points to them

### 4. Check for redirect chains

Flag any URL that redirects more than once (A → B → C). Single redirects are noted; chains of 3+ are flagged as issues.

### 5. Output the crawl report

```
## Link Check Report

Crawl started: [timestamp]
Start URL: {dev-server-url}/
Max depth: 4

### Coverage

- Pages crawled: X
- Unique URLs checked: X (pages + images + assets)
- Crawl depth reached: X levels
- External links found: X (not checked)

### Broken Links (CRITICAL)

| Source Page | Broken Link | Status | Type |
|------------|-------------|--------|------|
| /{section-slug} | /{section-slug}/{unknown-category} | 404 | page |
| /products/{product-slug} | /images/products/{product-id}/main.webp | 404 | image |

Total broken links: X

### Broken Images

| Page | Image URL | Status | Size |
|------|-----------|--------|------|
| /{section-slug}/{category-slug} | /images/products/{product-id}/main.webp | 200 | 312 bytes (CORRUPT?) |
| /products/{product-slug} | /images/products/{product-id}/gallery_005.webp | 404 | — |

Total broken images: X

### Redirect Chains

| Start URL | Chain | Final Destination |
|-----------|-------|-------------------|
| /old-path | /old-path → /new-path → /final-path | /final-path |

### Orphan Pages (in sitemap but not linked)

- /{section-slug}/{orphan-category} (in sitemap, no nav link found)
- /products/{discontinued-product} (in sitemap, not in any category listing)

### External Links Found

- [source page] → [external URL] (not checked)

### Summary

| Check | Count | Status |
|-------|-------|--------|
| Broken page links | X | [PASS: 0 / FAIL: X broken] |
| Broken images | X | [PASS: 0 / FAIL: X broken] |
| Corrupt images (< 500b) | X | [PASS: 0 / FAIL: X suspect] |
| Redirect chains (3+) | X | [PASS: 0 / WARN: X chains] |
| Orphan pages | X | [INFO: X unreachable pages] |

Verdict: [PASS: all links and images resolve / FAIL: X broken URLs found]
```

---

## Critical Rules

- **Crawl the real rendered site, not the file system.** A file existing on disk doesn't mean it's accessible via HTTP. Test the actual URLs.
- **Check images by HTTP request, not by path existence.** An image path might exist in `public/` but be corrupt (0 bytes, wrong format, error page).
- **Don't follow external links.** Only crawl the dev server hostname. Log external URLs but don't check them — they're not our responsibility.
- **Respect the 500 page limit.** With 2,294 products, crawling every product page would take too long. Crawl navigation paths + a sample of products.
- **Report the source page for every broken link.** Saying "404 on /images/x.webp" is useless without knowing which page links to it.
- **Orphan pages aren't necessarily bugs.** A page might be intentionally unlinked (admin, API routes). Flag them as INFO, not CRITICAL.
- **Run on dev server, not production.** Dev server matches what the developer sees. Production build might have different behavior.
