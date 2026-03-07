Scrape all SEO metadata from the reference site to ensure the clone has exact 1:1 parity — page titles, meta descriptions, structured data, OG tags, and canonical URLs.

**Pipeline position:** 4/32 — depends on: `/map-site`, `/scrape-products` | feeds into: `/seo-audit`

**Usage:** `/scrape-seo <url>` — e.g. `/scrape-seo https://www.example-store.com/category-section`

The argument `$ARGUMENTS` is the target site URL. Reads `src/lib/category-data.ts` (for `categoryMap` keys / category page URLs) and `data/scrape/products-index.json` for page URLs to scrape.

---

## Golden Rule

**SEO metadata must match the reference site exactly.** If the reference site's meta description for a category says "Buy the latest products from top brands at {Reference Brand}", that's what we use — not a template like "Shop products at {Reference Brand}. Free delivery available." Every title tag, every description, every piece of structured data is scraped from the real page.

---

## Prerequisites

- A complete list of page URLs is needed. Build it from these sources:
  1. Read `categoryMap` keys from `src/lib/category-data.ts` for category pages
  2. Read `src/app/sitemap.ts` to discover all page URLs
  3. Read `hub-*.json` files in `data/scrape/` for hub page URLs
- `data/scrape/products-index.json` must exist (run `/scrape-products` first). If missing, SEO scraping cannot proceed — run `/scrape-products` first.

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` calls in this skill MUST include:
`location: { country: "{country}", languages: ["{language}"] }`
SEO meta content (title tags, meta descriptions) can be geo-targeted. Locale-specific brand names and spellings must come from the correct locale version.

**Cache Strategy:**
- **First-time scrape:** `maxAge: 0` (fresh data required)
- **Dev iteration / re-runs:** `maxAge: 86400000` (1-day cache, ~5x faster)
- **Final pre-build refresh:** `maxAge: 0` (confirm current state)
Apply chosen `maxAge` to ALL firecrawl calls in this skill run.

---

## Steps

### 1. Identify all pages that need SEO data

From the site map and product index, build a list of every page type:
- Homepage
- Hub/landing pages (e.g., `/{section-slug}`)
- Category listing pages (e.g., `/{section-slug}/{category-slug}`)
- Product detail pages (all unique products)
- Footer/service pages (help, delivery, returns, etc.)

### 2. Scrape SEO metadata from each page type

For each page, use `firecrawl_scrape` with JSON format to extract:

```json
{
  "url": "",
  "title": "",
  "metaDescription": "",
  "canonical": "",
  "robots": "",
  "openGraph": {
    "title": "",
    "description": "",
    "image": "",
    "type": "",
    "url": "",
    "siteName": ""
  },
  "twitter": {
    "card": "",
    "title": "",
    "description": "",
    "image": ""
  },
  "structuredData": [],
  "headings": {
    "h1": [],
    "h2": [],
    "h3": []
  },
  "breadcrumbs": [{ "label": "", "url": "" }],
  "hreflang": [],
  "favicon": ""
}
```

**For structured data**, capture the full JSON-LD blocks as-is from the page. Common schemas to expect:
- `WebSite` + `SearchAction` (homepage)
- `Organization` (homepage)
- `Product` + `Offer` + `AggregateRating` (product pages)
- `BreadcrumbList` (product + category pages)
- `CollectionPage` or `ItemList` (category listings)
- `FAQPage` (buying guides)

### 3. Scrape page types efficiently

**Don't scrape every single product page for SEO** — product SEO is templated on most e-commerce sites. Instead:

1. **Scrape 5 representative product pages** from different categories — identify the title/description pattern
2. **Verify the pattern** against 10 more random products
3. **Record the template** used (e.g., title = `"{Product Name} | {Category} | {Reference Brand}"`)
4. **Capture the structured data schema** from one product page — this is the same structure for all products

For **category pages and hub pages**, scrape every one — these often have unique descriptions.

For **footer/service pages**, scrape every one — unique content per page.

### 4. Save SEO data

**Note:** The `data/scrape/seo/` directory must be created first if it doesn't exist: `mkdir -p data/scrape/seo`

Save to `data/scrape/seo/`:

```
data/scrape/seo/
  homepage.json          — Homepage SEO (title, desc, OG, schema)
  hub-pages.json         — All hub/landing page SEO
  category-pages.json    — All category listing page SEO
  product-template.json  — Product page SEO template + schema structure
  service-pages.json     — Footer/service page SEO
  sitemap-reference.json — Reference site's sitemap structure
  robots-reference.txt   — Reference site's robots.txt
```

### 5. Scrape the reference site's sitemap and robots.txt

```
firecrawl_scrape with url="$ARGUMENTS/sitemap.xml" (or discover sitemap URL from robots.txt)
firecrawl_scrape with url="$ARGUMENTS/robots.txt"
```

Capture:
- Which pages are in the sitemap
- Priority values used
- Change frequencies
- Which paths are disallowed in robots.txt
- Sitemap URL referenced in robots.txt

### 6. Compare against current implementation

After scraping, compare the reference site's SEO against what's currently in the project:

**Title tags:**
- Reference: `"{actual title from site}"`
- Current: `"{what our layout.tsx/page.tsx generates}"`
- Match? yes/no

**Meta descriptions:**
- Reference: `"{actual description from site}"`
- Current: `"{what our template generates}"`
- Match? yes/no

**Structured data:**
- Reference: `[list of schema types found]`
- Current: `[list of schema types we have]`
- Missing: `[schemas on reference site that we don't have]`

**Robots/sitemap:**
- Reference disallowed paths vs our `robots.ts`
- Reference sitemap priorities vs our `sitemap.ts`

### 7. Output SEO parity report

```
## SEO Parity Report

### Page Titles
- Homepage: [MATCH/MISMATCH] Reference: "..." | Ours: "..."
- Section Hub: [MATCH/MISMATCH] Reference: "..." | Ours: "..."
- Category pages: X/Y match
- Product template: [MATCH/MISMATCH] Reference pattern: "..." | Ours: "..."

### Meta Descriptions
- Homepage: [MATCH/MISMATCH]
- Hub pages: X/Y match
- Category pages: X/Y match (list mismatches)
- Product template: [MATCH/MISMATCH]

### Structured Data
- Homepage schemas: [reference has X, we have Y]
  Missing: [BreadcrumbList, etc.]
- Product schemas: [reference has X, we have Y]
  Missing: [variant info, etc.]
- Category schemas: [reference has X, we have Y]

### Open Graph
- Pages with OG image on reference but not ours: X
- OG title mismatches: X

### Robots & Sitemap
- Disallowed paths: [reference: X paths, ours: Y paths]
  Missing from ours: [list]
  Extra in ours: [list]
- Sitemap priorities: [match/mismatch summary]

### Action Items (priority order)
1. [Most impactful SEO fix]
2. [Second most impactful]
3. ...
```

---

## Critical Rules

- **Scrape the actual meta tags from the live site.** Don't assume what they say — the reference site's SEO team may use unexpected wording or formatting.
- **Title tags are exact.** If the reference uses e.g. `"Brand 75" Model OLED 4K Smart TV (2024) | {Reference Brand}"`, that's the format — not `"Brand 75" OLED TV | {Section} | {Reference Brand}"`.
- **Meta descriptions are exact.** The reference site likely has unique descriptions per category, not templates. Capture each one.
- **Structured data schemas must match.** If the reference site has BreadcrumbList on product pages, our clone needs it too. If they have FAQ schema on buying guides, we need it.
- **Don't add SEO that the reference site doesn't have.** If they don't use `CollectionPage` schema on category pages, neither do we. Match exactly — no "improvements".
- **robots.txt and sitemap must match the reference structure** — same disallowed paths, same priority tiers.
