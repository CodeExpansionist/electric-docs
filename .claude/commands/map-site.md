Systematically discover and map the complete structure of an e-commerce website for cloning.

**Pipeline position:** 1/32 — depends on: none (entry point) | feeds into: `/scrape-content`, `/scrape-products`, `/scrape-seo`, `/extract-layout`, `/scaffold-project`

**Usage:** `/map-site <url>` — e.g. `/map-site https://www.example-store.com/category-section`

The argument `$ARGUMENTS` is the target URL (a section or full site) to map.

---

## Golden Rule

**Exact 1:1 fidelity.** Every piece of data must come from the real site. Never fabricate, paraphrase, or approximate. If a category is called "DVD, Blu-ray & Home Cinema" on the site, that's what we record — not "DVD & Blu-ray" or "Home Cinema". Full independence: once mapped, the clone has zero connection to the original site at runtime.

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` and `firecrawl_map` calls in this skill MUST include:
`location: { country: "GB", languages: ["en-GB"] }`
This ensures UK-specific pricing, content, and navigation are captured. Firecrawl defaults to US proxies without this.

**Cache Strategy:**
- **First-time map of a new site:** `maxAge: 0` (fresh data required)
- **Dev iteration / re-runs:** `maxAge: 86400000` (1-day cache, ~5x faster)
- **Final pre-build refresh:** `maxAge: 0` (confirm current state)
Apply chosen `maxAge` to ALL firecrawl calls in this skill run.

---

## Steps

### 0. Read site constants

Before any scraping begins, read `src/lib/constants.ts` (which has SITE_URL and stripDomain) to understand the current project configuration. This file is the central config that all subsequent skills reference — do NOT create a separate `data/site-config.json`.

To gather site information:

1. Parse the target URL to extract the base domain and section slug
2. Use `firecrawl_scrape` with branding format on the homepage to discover the brand name
3. Inspect page source or asset URLs to identify CDN domains and path prefixes (look for image `src` attributes, CSS `url()` values, and `<link>` tags that point to external CDN hosts)
4. Ask the user for the clone brand name, or leave it as a placeholder to be filled later

All subsequent skills (`/scrape-content`, `/scrape-products`, `/scrape-seo`, etc.) should read from `src/lib/constants.ts` instead of hardcoding site-specific values.

### 1. Discover all URLs

Use `firecrawl_map` on the target URL to get a complete list of pages:

```
firecrawl_map with url=$ARGUMENTS
```

Save the raw URL list. This gives us the full scope before drilling into anything.

### 2. Scrape the homepage/section landing page

Use `firecrawl_scrape` with JSON and links formats on the target URL. The `links` format returns a structured list of every `href` on the page — catching mega-menu URLs rendered only in JavaScript that JSON extraction may miss. Extract:

```json
{
  "navigation": {
    "mainNav": [{ "label": "", "url": "", "hasDropdown": false }],
    "secondaryNav": [{ "label": "", "url": "" }],
    "utilityNav": [{ "label": "", "url": "", "icon": "" }]
  },
  "categoryLinks": [{ "name": "", "url": "", "icon": "" }],
  "footerColumns": [{
    "heading": "",
    "links": [{ "label": "", "url": "" }]
  }]
}
```

Every label, link text, and URL must be captured exactly as displayed on the site.

### 2b. Determine clone scope (IMPORTANT — prevents 3-component rebuild)

After scraping navigation, explicitly document what is being cloned. Record scope in the category tree output:

```json
{
  "scope": "section",
  "targetSection": "Target Section Name",
  "targetUrl": "/{section-slug}",
  "otherSections": ["Other Section 1", "Other Section 2", "..."],
  "scopeNotes": "Only cloning the target section. MainNav shows all sections but only target section links are functional. ShopDeals and AnnouncementBar content scoped to target section only."
}
```

This scope decision affects:

- **MainNav:** Shows all sections for visual fidelity, but only target section links resolve to real pages
- **ShopDeals / Category Grid:** Only shows categories within the target section
- **AnnouncementBar:** Content scoped to target section deals
- **Footer:** Full site footer for visual fidelity, but most links are non-functional

On the Electric project, scope confusion caused 3 component rebuilds (MainNav, ShopDeals, AnnouncementBar) when components were initially built with full-site content then had to be rescoped to section-only.

### 3. Map the category tree

For each top-level category found in step 2, use `firecrawl_scrape` with JSON format on its hub/landing page. Extract:

- Breadcrumb path (full hierarchy)
- Subcategory links (name + URL)
- Sidebar navigation sections (headings + links)
- Promotional sections and banner data
- Any "top categories" or "popular links" lists

Build a complete tree:
```json
{
  "categories": [
    {
      "name": "Exact name from site",
      "url": "/exact/url/path",
      "breadcrumb": ["Home", "{Section Name}", "{Category Name}"],
      "subcategories": [
        { "name": "", "url": "", "productCount": null }
      ],
      "hubPage": {
        "sidebar": { "topCategories": [], "popularLinks": [], "buyingGuides": [] },
        "promoSections": [],
        "brandRow": []
      }
    }
  ]
}
```

### 3b. Validate route slugs (prevents routing mismatches)

For every URL captured in the category tree, analyze the path segments for routing implications:

1. **Flag multi-segment slugs** that require `[...category]` catch-all routes (e.g., `parent-category/subcategory/leaf-category` — 3 segments deep)
2. **Flag slugs that differ from display names** (e.g., display: "Category Name" -> slug: `category-name`; display: "Long, Complex & Category Name" -> slug: `long-complex-and-category-name`)
3. **Flag duplicate or ambiguous slugs** (e.g., `parent/parent` where parent and child share the same name)

Save as `memory/routing-patterns.md`:

```markdown
## Route Depth Analysis
- 1-segment slugs: X (use [category] dynamic route)
- 2-segment slugs: X (need [...category] catch-all)
- 3-segment slugs: X (need [...category] catch-all)

## Slug ↔ Display Name Mapping
| Display Name | URL Slug | Segments |
|---|---|---|
| Example Category | example-slug | 3 (parent.../sub.../leaf) |

## Potential Routing Pitfalls
- [list any ambiguous, duplicate, or surprising slugs]
```

This prevents the persistent routing mismatch problems where nav links didn't resolve because slug conventions were inconsistent.

### 4. Extract design tokens

**4a. Branding format (quick initial pass):**

```
firecrawl_scrape with url=$ARGUMENTS, formats=["branding"]
```

**4b. Comprehensive color extraction (REQUIRED — branding format alone is insufficient):**

The branding format typically captures only 3-5 prominent colors. Real sites use 15-20+ distinct colors across different UI contexts. To capture the full palette, use a browser session to extract ALL computed colors across 3 page types:

1. Create a browser session
2. Navigate to the homepage, a category listing page, and a product detail page
3. On each page, run JavaScript to extract ALL `backgroundColor`, `color`, `borderColor`, and `outlineColor` from every visible element
4. Deduplicate and group by purpose:
   - **Text colors:** primary body text, secondary text, muted/caption text, price text, link text
   - **Background colors:** page background, surface/card background, header background, footer background, light accent backgrounds (e.g., light purple for promo cards)
   - **Border colors:** card borders, input borders, divider/HR colors, tab borders
   - **Interactive colors:** badge/counter backgrounds, hover state colors, focus ring colors, selected state colors
   - **Semantic colors:** error/sale red, success green, warning, info
   - **Icon colors:** default icon fill color
5. Log the FULL palette with hex values and usage context
6. Destroy the browser session

**CRITICAL:** The branding format extraction missed the badge color (`#E5006D`), icon color (`#56707A`), secondary text color (`#444444`), and 6 other tokens on the Electric project — causing color mismatches that persisted for weeks. Always do the comprehensive extraction.

Also scrape CSS variables/computed styles to extract:
- Colors: ALL colors from 4b above — minimum 15 distinct color tokens
- Typography: font families (exact names), sizes, weights, line heights
- Spacing: container max-width, padding, section gaps, card gaps
- Border radii: small, medium, large, pill
- Breakpoints: sm, md, lg, xl

### 5. Save outputs

Create the following files in the current project:

- The site map is implicit in `src/lib/category-data.ts` categoryMap keys + `src/app/` route structure — do NOT create a separate `data/scrape/site-map.json`
- `data/scrape/branding.json` — Raw branding extraction
- `data/design-tokens.json` — Processed design tokens (colors, fonts, spacing, radii, breakpoints)

### 6. Output summary

Report to the user:
- Total URLs discovered
- Category tree (formatted as indented list)
- Number of top-level categories and total subcategories
- Design tokens extracted (color count, font families found)
- Any pages that failed to scrape (for retry)

---

## Critical Rules

- **No hardcoding.** Discover categories from the site navigation — never manually list them.
- **Exact text.** Category names, breadcrumb labels, sidebar link text, footer headings — all must be verbatim from the site.
- **Record exact URL paths.** These become route slugs in the clone. `/full-category-name` is not the same as `/abbreviated-name`.
- **Capture the full depth.** Some categories are 3 levels deep (e.g., `parent-category/subcategory/leaf-category`). Map every level.
- **Design tokens from the site, not guesswork.** If a color looks purple, don't write `#800080` — extract the actual hex value from the CSS.
