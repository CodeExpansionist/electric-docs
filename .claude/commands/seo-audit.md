Verify SEO implementation matches the reference site exactly — page titles, meta descriptions, Open Graph, structured data, sitemap, and robots.txt. Compares rendered SEO output against data captured by `/scrape-seo`.

**Pipeline position:** 23/32 — depends on: `/scrape-seo`, `/link-check` | feeds into: none (verification endpoint)

**Usage:** `/seo-audit` — runs full SEO audit across all page types

Optionally: `/seo-audit <filter>` where `$ARGUMENTS` is:
- A page type: `homepage`, `hub`, `category`, `product`
- A check type: `schemas` (JSON-LD only), `meta` (titles + descriptions only), `sitemap`, `robots`
- Omit to run all checks.

---

## Golden Rule

**SEO output must match the reference site exactly. Don't add what they don't have, don't miss what they do.** If the reference site has a BreadcrumbList schema on product pages, we must too. If they don't have an FAQ schema, we must not. Parity, not improvement.

---

## Prerequisites

- `data/scrape/seo/` directory must exist with reference SEO data. **Run `/scrape-seo` first to populate this directory** — it does not exist by default. If missing, run `/scrape-seo <reference-url>` first to populate it with page title patterns, meta descriptions, structured data schemas, and robots/sitemap references.
- Dev server running (URL from `package.json`)
- `firecrawl_scrape` available for extracting rendered metadata

---

## Checks to Run

### Check 1: Page Titles

For each page type, compare our rendered `<title>` tag against the reference pattern from `data/scrape/seo/`.

**Pages to check:**
- Homepage
- Section hub page
- 3 category listing pages (sample from different categories)
- 5 product detail pages (one from each major category)
- Basket, Checkout (if reference data available)

**Compare:**
- Exact title text match (or pattern match for templated titles)
- Title length (should be 50-60 chars, matching reference)
- Brand suffix format (e.g., "| {Clone Brand}" vs "| {Reference Brand}" — adjusted for our brand)

### Check 2: Meta Descriptions

For the same pages, compare `<meta name="description">`:
- Content matches reference pattern
- Length is 150-160 chars (matching reference range)
- Contains target keywords from reference
- Not a generic fallback (all pages sharing one description = bug)

### Check 3: Canonical URLs

Verify every page has a `<link rel="canonical">`:
- Present on all pages
- Points to the correct absolute URL (using SITE_URL from constants.ts)
- No duplicate canonicals
- Self-referencing (canonical points to the page itself, not a different page)

### Check 4: Open Graph Tags

For each page, extract and verify:
- `og:title` — matches or mirrors page title
- `og:description` — matches or mirrors meta description
- `og:image` — present (not missing!), points to a real image
- `og:url` — matches canonical URL
- `og:type` — correct type (website for homepage, product for product pages)
- `og:site_name` — present and correct

### Check 5: Twitter Card Tags

Verify:
- `twitter:card` — type matches reference (summary_large_image vs summary)
- `twitter:title` — present
- `twitter:description` — present
- `twitter:image` — present and valid

### Check 6: JSON-LD Structured Data

For each page type, extract all `<script type="application/ld+json">` blocks and compare against reference:

**Homepage:**
- WebSite schema (with SearchAction if reference has it)
- Organization schema (name, logo, URL)

**Category pages:**
- ItemList or CollectionPage (if reference has it)
- BreadcrumbList

**Product pages:**
- Product schema (name, image, brand, sku, description)
- Offer schema (price, priceCurrency, availability, url)
- AggregateRating (if product has reviews)
- BreadcrumbList

**All pages:**
- BreadcrumbList (if reference has breadcrumbs in structured data, not just HTML)

**For each schema, verify:**
- Schema type matches reference
- Required fields are present (per Google's requirements)
- Values match the rendered page content (price in schema = price on page)
- No deprecated schema properties

### Check 7: Sitemap Validation

Fetch `{dev-server-url}/sitemap.xml` and compare against reference:
- Total URL count (within 5% of reference)
- Priority values match reference ranges
- Change frequency values match reference
- All important pages included (homepage, hub, all categories, all products)
- No broken URLs in sitemap. Run `/link-check` to verify all sitemap URLs resolve to live pages.

### Check 8: Robots.txt Validation

Fetch `{dev-server-url}/robots.txt` and compare against reference:
- Same Disallow rules (adjusted for our domain)
- Same Allow rules
- Sitemap URL present and correct
- No sensitive paths exposed (admin, API routes)

---

## Output

```
## SEO Audit Report

### Page Titles

| Page | Reference Pattern | Our Title | Match |
|------|------------------|-----------|-------|
| Homepage | "{Section} | {Reference Brand}" | "{Section} | {Clone Brand}" | MATCH (brand adjusted) |
| Hub | "{Section} - Shop..." | "{Section} | {Description}" | MISMATCH (different format) |
| Category | "{Category} | {Reference Brand}" | "{Category} | {Clone Brand}" | MATCH |
| Product | "{name} | {Reference Brand}" | DEFAULT TEMPLATE | MISSING (no generateMetadata) |

Issues: X pages missing per-page titles

### Meta Descriptions

| Page | Has Description | Matches Reference | Length |
|------|----------------|-------------------|--------|
| Homepage | YES | YES | 155 chars |
| Category: TVs | YES | NO (generic fallback) | 160 chars |
| Product page | NO (using root default) | — | — |

Issues: X pages using fallback description

### Canonical URLs

| Page | Has Canonical | Correct URL | Self-Referencing |
|------|--------------|-------------|------------------|
| Homepage | YES | YES | YES |
| Product page | NO | — | — |
| Category page | NO | — | — |

Issues: X pages missing canonical

### Open Graph

| Page | og:title | og:desc | og:image | og:url | og:type |
|------|----------|---------|----------|--------|---------|
| Homepage | OK | OK | MISSING | OK | OK |
| Product | OK | OK | MISSING | MISSING | MISSING |

Issues: X pages missing og:image, Y pages missing og:url

### JSON-LD Schemas

| Page | Expected Schemas | Found Schemas | Match |
|------|-----------------|---------------|-------|
| Homepage | WebSite, Organization | WebSite | PARTIAL (missing Organization) |
| Category | ItemList, BreadcrumbList | None | MISSING |
| Product | Product, Offer, Rating, Breadcrumb | Product, Offer, Rating | PARTIAL (missing Breadcrumb) |

Issues: X missing schemas, Y incomplete schemas

### Sitemap

- Our URLs: X | Reference URLs: Y | Difference: Z%
- Priority ranges: [match/mismatch]
- Change frequencies: [match/mismatch]
- Missing pages: X

### Robots.txt

- Disallow rules: [match/mismatch]
- Sitemap URL: [correct/incorrect]

---

## Summary

| Check | Status | Issues |
|-------|--------|--------|
| Page titles | X/Y match | Z missing per-page titles |
| Meta descriptions | X/Y match | Z using fallback |
| Canonical URLs | X/Y present | Z missing |
| Open Graph | X/Y complete | Z missing og:image |
| Twitter Cards | X/Y complete | Z incomplete |
| JSON-LD schemas | X/Y match | Z missing, W incomplete |
| Sitemap | [MATCH/MISMATCH] | X missing pages |
| Robots.txt | [MATCH/MISMATCH] | X rule differences |

Priority fixes:
1. [Most impactful SEO fix]
2. [Second most impactful]
3. ...

Verdict: [PASS: all checks match reference / FAIL: X issues need fixing]
```

---

## Critical Rules

- **Compare against `/scrape-seo` output, not generic SEO best practices.** If the reference site doesn't have an FAQ schema, don't recommend adding one. Match, don't improve.
- **Adjust for brand name.** The reference brand name in titles should map to the clone brand name in our titles. The pattern/format must match even if the brand name differs.
- **JSON-LD must validate.** Use Google's structured data requirements as the baseline. A schema that's present but invalid is worse than no schema.
- **og:image is critical.** Missing Open Graph images means social share previews show no image — this is the most visible SEO gap.
- **Product pages are highest priority.** There are typically far more product pages than category/hub pages. Fixing product page SEO has the biggest impact.
- **Canonical URLs prevent duplicate content penalties.** Every page must have exactly one canonical URL pointing to itself.
- **Don't check every product.** Sample 5 products across categories. If the `generateMetadata` function is correct, all products will be correct.
- **Sitemap accuracy matters.** A sitemap with broken URLs or missing pages hurts crawl efficiency. Cross-reference with actual site structure.
