Extract exact CSS measurements from the reference site for every major component. Outputs per-component layout specs with grid columns, gaps, padding, font sizes, and Tailwind class suggestions — so building uses real measurements instead of visual guessing.

**Pipeline position:** 13/32 — depends on: `/scrape-content`, `/map-site` | feeds into: `/scaffold-project`, `/build-component`

**Usage:** `/extract-layout <url>` — extracts layout measurements from the reference site

`$ARGUMENTS` is the reference site URL (from `src/lib/constants.ts` `SITE_URL`, e.g., `https://www.example.com/{section-slug}`).

---

## Golden Rule

**Measure, don't guess.** Every pixel value, grid column count, gap size, and font size comes from actual CSS extraction — not from eyeballing screenshots. Hero carousels get rebuilt multiple times when measurements are estimated. Extract once, build once.

---

## Prerequisites

- Reference site must be accessible
- Firecrawl MCP tools must be available
- `src/lib/category-data.ts` exists (to know which pages to measure from `categoryMap` keys)

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` calls in this skill MUST include:
`location: { country: "GB", languages: ["en-GB"] }`
Layout and component visibility can vary by geo (e.g., banners shown only to UK visitors).

**Cache Strategy:** Default to `maxAge: 86400000` (1-day cache) since CSS measurements rarely change between iterations. Use `maxAge: 0` only if the reference site has been redesigned.

---

## Steps

### 1. Identify components to measure

From the site map and reference screenshots, compile a list of every distinct component type:

**Homepage / Section landing:**
- Announcement bar
- Header (logo, search, utility nav)
- Main navigation (mega menu)
- Hero carousel
- USP bar (trust badges row)
- Category grid (ShopDeals)
- Sponsored products carousel
- Footer

**Category listing page:**
- Breadcrumbs
- Category banner
- Filter sidebar
- Sort bar
- Product grid
- Product card
- Pagination

**Product detail page:**
- Product gallery (main image + thumbnails)
- Price panel
- Key specs
- Tabbed content (description, specifications, reviews)
- Cross-sell carousel
- Care & repair plans

### 2. Extract measurements at multiple breakpoints

For EACH component, use Firecrawl to extract computed CSS at two breakpoints:

**Desktop (1280px viewport):**
```
firecrawl_scrape with url=$ARGUMENTS, formats=["json"],
  location={ country: "GB", languages: ["en-GB"] },
  jsonOptions={
    prompt: "Extract the exact CSS computed values for the [component name]: container max-width, padding, grid template columns, grid gap, font sizes, line heights, colors, border radius, box shadow, margin",
    schema: { ... }
  },
  screenshotOptions={ viewport: { width: 1280, height: 900 } }
```

**Mobile (375px viewport):**
```
firecrawl_scrape with url=$ARGUMENTS, formats=["json"],
  location={ country: "GB", languages: ["en-GB"] },
  mobile: true,
  jsonOptions={
    prompt: "Extract the exact CSS computed values for the [component name] at mobile viewport...",
    schema: { ... }
  }
```

**Also capture a screenshot at each breakpoint** for visual reference:
```
firecrawl_scrape with url=$ARGUMENTS, formats=["screenshot"],
  location={ country: "GB", languages: ["en-GB"] },
  screenshotOptions={ viewport: { width: 1280, height: 900 }, fullPage: true }
```

### 3. Extract per-component measurements

For each component, capture:

```json
{
  "component": "hero-carousel",
  "extractedFrom": "https://www.example.com/{section-slug}",
  "desktop": {
    "containerMaxWidth": "1280px",
    "containerPadding": "0 16px",
    "width": "100%",
    "height": "400px",
    "gridColumns": 1,
    "gap": "0",
    "slideTransition": "0.3s ease",
    "dotsPosition": "bottom-center",
    "dotsSize": "8px",
    "arrowSize": "40px"
  },
  "mobile": {
    "containerMaxWidth": "100%",
    "height": "250px",
    "dotsSize": "6px",
    "arrowsHidden": true
  },
  "typography": {
    "heading": { "fontSize": "28px", "fontWeight": "700", "lineHeight": "1.2", "color": "#1a1a1a" },
    "subheading": { "fontSize": "16px", "fontWeight": "400", "lineHeight": "1.5", "color": "#666" },
    "cta": { "fontSize": "14px", "fontWeight": "600", "textTransform": "uppercase" }
  },
  "colors": {
    "background": "#ffffff",
    "ctaBackground": "#d4145a",
    "ctaText": "#ffffff"
  },
  "tailwindSuggestion": {
    "container": "max-w-[1280px] mx-auto px-4",
    "slide": "relative w-full h-[400px] md:h-[250px]",
    "heading": "text-[28px] font-bold leading-[1.2] text-[#1a1a1a]",
    "cta": "bg-[#d4145a] text-white text-sm font-semibold uppercase px-6 py-3"
  }
}
```

### 4. Extract product card measurements (critical)

Product cards appear in 4 contexts with different layouts. Extract each:

1. **Category grid card** — the main listing card (image, name, price, rating, specs)
2. **Sponsored carousel card** — smaller card in horizontal scroll
3. **Cross-sell card** — compact card on product detail page
4. **Search results card** — list-style card in search

For each context, measure: card width, padding, image aspect ratio, font sizes, spacing between elements, border/shadow styles.

### 5. Extract grid system

Measure the overall grid system used across the site:

- **Category grid:** How many product cards per row at desktop? Tablet? Mobile?
- **Category sidebar:** What's the sidebar width? Does it collapse on mobile?
- **Container max-width:** Is it 1200px? 1280px? 1440px?
- **Gutter width:** Consistent gap between elements?

```json
{
  "gridSystem": {
    "containerMaxWidth": "1280px",
    "containerPadding": "0 16px",
    "categoryGrid": {
      "desktop": { "columns": 4, "gap": "16px", "sidebarWidth": "260px" },
      "tablet": { "columns": 3, "gap": "12px", "sidebarCollapsed": true },
      "mobile": { "columns": 2, "gap": "8px", "sidebarCollapsed": true }
    },
    "sponsoredCarousel": {
      "desktop": { "visibleCards": 6, "gap": "12px" },
      "mobile": { "visibleCards": 2, "gap": "8px" }
    }
  }
}
```

### 6. Verify design token completeness (BLOCKING)

Before saving outputs, cross-reference the colors discovered during extraction against `data/design-tokens.json`:

1. Collect ALL unique colors found across all component measurements (background, text, border, CTA, badge, icon colors)
2. For each color, check if it exists in `data/design-tokens.json` — either as an exact match or within Delta-E ≤ 3
3. Flag any color used by 2+ components that has no matching token

**Output a token coverage table:**

```
COLOR TOKEN COVERAGE
────────────────────
Extracted Color │ Token Name    │ Token Value │ Status
#213038         │ text.primary  │ #213038     │ MATCH
#444444         │ text.secondary│ #666666     │ MISMATCH (Delta-E: 42)
#56707A         │ (none)        │ —           │ MISSING
#E5006D         │ (none)        │ —           │ MISSING
...
```

**BLOCK if any MISMATCH or MISSING color is used in 3+ components.** These are site-wide colors that will cause pervasive visual differences if not tokenized.

**Common colors missed by branding-only extraction:**
- Badge/counter notification colors (often distinct from primary)
- Default icon fill colors
- Secondary/body text colors (often darker than assumed)
- Surface/card background greys (often subtly different from #F5F5F5)
- Price text colors (often darker than body text)
- Light accent backgrounds (light purple, light pink for promo cards)
- Footer background variants

If gaps are found, update `data/design-tokens.json` and `tailwind.config.ts` before proceeding to `/build-component`.

### 7. Save outputs

Save per-component layout specs:

- `data/scrape/layouts/hero-carousel.json`
- `data/scrape/layouts/product-card.json`
- `data/scrape/layouts/category-grid.json`
- `data/scrape/layouts/product-gallery.json`
- `data/scrape/layouts/price-panel.json`
- `data/scrape/layouts/header.json`
- `data/scrape/layouts/footer.json`
- `data/scrape/layouts/announcement-bar.json`
- `data/scrape/layouts/usp-bar.json`
- `data/scrape/layouts/filter-sidebar.json`
- `data/scrape/layouts/sort-bar.json`
- `data/scrape/layouts/breadcrumbs.json`
- `data/scrape/layouts/main-nav.json`
- ... (one per component)

Also save:
- `data/scrape/layouts/grid-system.json` — site-wide grid measurements
- `data/scrape/layouts/screenshots/` — captured screenshots at each breakpoint

### 7. Generate Tailwind mapping

Create `data/scrape/layouts/tailwind-mapping.json` that maps extracted CSS values to Tailwind classes:

```json
{
  "spacing": {
    "4px": "1", "8px": "2", "12px": "3", "16px": "4", "24px": "6", "32px": "8"
  },
  "customValues": [
    { "css": "max-width: 1280px", "tailwind": "max-w-[1280px]" },
    { "css": "font-size: 13px", "tailwind": "text-[13px]" },
    { "css": "gap: 18px", "tailwind": "gap-[18px]" }
  ],
  "designTokenOverrides": {
    "note": "Values that should go in tailwind.config.ts extend section",
    "colors": { "brand-accent": "#d4145a", "brand-dark": "#1a1a1a" },
    "fontSize": { "product-name": "13px", "product-price": "18px" }
  }
}
```

### 8. Output summary

```
## Layout Extraction Report

Components measured: X
Breakpoints: desktop (1280px), mobile (375px)
Screenshots captured: X

Per-component files saved to data/scrape/layouts/

Grid system:
- Container: [max-width]
- Category grid: [columns at desktop] / [tablet] / [mobile]
- Product card dimensions: [width] x [height]

Custom Tailwind values needed: X
- [list non-standard values that need tailwind.config.ts entries]

Ready for /build-component to consume.
```

### 9. DOM Structure Map (per component, per viewport)

For each key component (`header`, `footer`, `main-nav`, `usp-bar`, `product-card`), extract the DOM structure at **both breakpoints** (375px and 1280px) using a browser session:

```javascript
// Run via page.evaluate() at each breakpoint
(selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  return Array.from(el.children).map((child, i) => ({
    index: i,
    tag: child.tagName.toLowerCase(),
    text: child.textContent?.trim().substring(0, 50) || '',
    classes: child.className?.split?.(' ').slice(0, 5) || [],
    visible: window.getComputedStyle(child).display !== 'none'
      && window.getComputedStyle(child).visibility !== 'hidden',
    role: child.getAttribute('role') || null,
    ariaLabel: child.getAttribute('aria-label') || null,
  }));
}
```

Save output per component:

```json
// data/scrape/layouts/header-structure.json
{
  "component": "header",
  "selector": "header",
  "viewports": {
    "375": {
      "children": [
        { "index": 0, "tag": "a", "text": "Currys", "visible": true, "role": null },
        { "index": 1, "tag": "div", "text": "Search our products...", "visible": true },
        { "index": 2, "tag": "nav", "text": "Account Saved Basket Menu", "visible": true, "ariaLabel": "Account and shopping" }
      ]
    },
    "1280": {
      "children": [
        { "index": 0, "tag": "a", "text": "Currys", "visible": true },
        { "index": 1, "tag": "div", "text": "Search our products...", "visible": true },
        { "index": 2, "tag": "nav", "text": "Account Saved Basket", "visible": true }
      ]
    }
  }
}
```

**Purpose:** This gives `/build-component` concrete structural targets (element order, visibility states, text labels) — not just CSS measurements. It also feeds into `/visual-parity` Step 5b for structural comparison.

**Key fields to capture:**
- `visible` — catches elements hidden via `display:none` or responsive classes
- `index` — catches element ordering within flex/grid containers
- `text` — catches missing labels (e.g., "Menu" text on hamburger)
- `ariaLabel` — catches accessibility landmarks

**Default interactive state extraction:**

After recording structure, also record the **initial state** of interactive elements on fresh page load (before any clicks). For each element with `cursor: pointer`, `aria-expanded`, or a sibling with `overflow: hidden`:

```javascript
// Run on fresh page load — NO clicks beforehand
(selector) => {
  const el = document.querySelector(selector);
  if (!el) return [];
  const interactive = [];
  el.querySelectorAll('[aria-expanded], [role="button"]').forEach(child => {
    const contentId = child.getAttribute('aria-controls');
    const content = contentId ? document.getElementById(contentId) : child.nextElementSibling;
    interactive.push({
      text: child.textContent?.trim().substring(0, 50) || '',
      ariaExpanded: child.getAttribute('aria-expanded'),
      cursor: window.getComputedStyle(child).cursor,
      contentHeight: content ? content.offsetHeight : null,
      defaultState: content && content.offsetHeight === 0 ? 'collapsed' : 'expanded',
    });
  });
  return interactive;
}
```

Output field per element: `defaultState: "collapsed" | "expanded" | "static"`. This prevents building components with the wrong initial state (e.g., footer accordion defaulting to open when reference defaults to closed).

---

## Critical Rules

- **Extract, don't estimate.** "Looks like about 16px" is not acceptable. Extract the computed value.
- **Two breakpoints minimum.** Desktop and mobile. If the layout changes significantly at tablet, extract that too.
- **Screenshots alongside data.** Every extracted measurement should have a corresponding screenshot for visual verification during building.
- **Tailwind suggestions are suggestions.** The component builder decides final classes, but having a starting point from real measurements prevents the "rebuild 4 times" problem.
- **One file per component.** Keep layouts modular so `/build-component` can read just what it needs.
- **Include the source URL and viewport.** Every layout file documents where measurements came from, so they can be re-extracted if the reference site changes.
