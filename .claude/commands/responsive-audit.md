Verify and fix responsive layout across all viewport sizes by capturing reference site screenshots, comparing against the local build, and implementing pixel-accurate fixes.

**Pipeline position:** 25/32 — depends on: `/build-component` (recommended) | feeds into: none (verification endpoint)

**Usage:** `/responsive-audit` — runs full audit (all pages, all viewports)

Optionally: `/responsive-audit <filter>` where `$ARGUMENTS` is one of:
- A phase: `capture`, `compare`, `fix`
- A page name: `homepage`, `hub`, `category`, `product`, `basket`, `checkout`
- A viewport width: `375`, `428`, `768`, `1024`, `1280`, `1920`, `2560`

---

## Golden Rule

**The reference site is the source of truth at every viewport size.** If the reference site shows a hamburger menu at 375px, we show a hamburger menu at 375px. If their product grid is 2 columns on tablet, ours is 2 columns on tablet. Don't invent responsive behavior — match it exactly.

---

## Prerequisites

- Dev server running at the dev server URL (from `package.json`)
- `firecrawl_scrape` or `firecrawl_browser_create` must be available for screenshot capture
- Existing desktop reference screenshots in `reference-screenshots/` (from initial build)

---

## Viewport Sizes

All captures use these 7 standard viewport widths with height fixed at 900px:

| Name | Width | Represents | Tailwind Breakpoint |
|------|-------|------------|---------------------|
| Mobile S | 375px | iPhone SE / small phones | Below `sm` |
| Mobile L | 428px | iPhone Pro Max / large phones | Below `sm` |
| Tablet | 768px | iPad portrait | `md` breakpoint |
| Laptop | 1024px | iPad landscape / small laptops | `lg` breakpoint |
| Desktop | 1280px | Standard desktop | `xl` breakpoint |
| Wide | 1920px | Full HD monitors | Above `xl` |
| Ultra-wide | 2560px | 2K / ultra-wide monitors | Above `xl` |

**Important:** 375px and 428px are both below Tailwind's `sm: 640px` breakpoint. Default mobile-first styles apply identically to both. Any layout difference between them in the reference site requires custom CSS (`min-width` media queries or container queries), not Tailwind responsive prefixes like `sm:`.

---

## Pages to Audit

| Page | Reference URL | Local URL | Key Responsive Elements |
|------|---------------|-----------|------------------------|
| Homepage | `{reference-site-url}/{section-slug}` | `/` | Hero carousel columns, shop deals grid, sponsored products row |
| Section Hub | `{reference-site-url}/{section-slug}` | `/{section-slug}` | Editorial cards, brand row, subcategory grid |
| Category Listing | `{reference-site-url}/{section-slug}/{category-slug}` | `/{section-slug}/{category-slug}` | Filter sidebar show/hide, product grid columns, sort bar layout |
| Product Detail | Any product page on the reference site | `/products/{any-slug}` | Gallery vs price panel split, specs layout, cross-sell grid |
| Basket | `{reference-site-url}/basket` | `/basket` | Line item layout, upsell cards, summary panel position |
| Checkout | `{reference-site-url}/checkout` | `/checkout/payment` | Form width, payment fields, order summary |

If `$ARGUMENTS` is a page name, audit only that page at all 7 viewports.

---

## Steps

### Phase 1: Capture Reference Screenshots

### 1. Capture the reference site at all viewport sizes

For each page in the audit list, use `firecrawl_scrape` with screenshot format to capture the reference site's target section:

```
firecrawl_scrape({
  url: "<reference-url>",
  formats: ["screenshot"],
  location: { country: "GB", languages: ["en-GB"] },
  screenshotOptions: {
    fullPage: true,
    viewport: { width: <viewport-width>, height: 900 }
  }
})
```

Ensure the output directory exists:

```bash
mkdir -p comparison-screenshots/responsive
```

Save each screenshot to:

```
reference-screenshots/responsive/ref-{page}-{width}px.png
```

Example filenames:
- `ref-homepage-375px.png`
- `ref-category-1280px.png`
- `ref-product-2560px.png`

**Capture order:** Process one page at a time, all 7 viewports per page, before moving to the next page.

**If a page requires login or redirects** (basket, checkout), note it and skip — capture what's publicly accessible.

### 2. Log the capture results

After Phase 1, output:

```
## Reference Capture Report

Pages captured: X/6
Screenshots saved: X/42

| Page | 375 | 428 | 768 | 1024 | 1280 | 1920 | 2560 |
|------|-----|-----|-----|------|------|------|------|
| Homepage | OK | OK | OK | OK | OK | OK | OK |
| Hub | OK | OK | OK | OK | OK | OK | OK |
| Category | OK | OK | OK | OK | OK | OK | OK |
| Product | OK | OK | OK | OK | OK | OK | OK |
| Basket | SKIP | SKIP | SKIP | SKIP | SKIP | SKIP | SKIP |
| Checkout | SKIP | SKIP | SKIP | SKIP | SKIP | SKIP | SKIP |

Saved to: reference-screenshots/responsive/
```

If `$ARGUMENTS` is `capture`, stop here.

---

### Phase 2: Capture Local & Compare

### 3. Start the dev server

Ensure the dev server is running:

```bash
npm run dev
```

Wait for the server to be ready at the dev server URL (from `package.json`).

### 4. Capture our site at matching viewport sizes

For each page, capture our local site at the same viewport sizes. Use `firecrawl_scrape` pointed at the local URL:

```
firecrawl_scrape({
  url: "{dev-server-url}/<local-path>",
  formats: ["screenshot"],
  screenshotOptions: {
    fullPage: true,
    viewport: { width: <viewport-width>, height: 900 }
  }
})
```

Save to:

```
reference-screenshots/responsive/ours-{page}-{width}px.png
```

For product page, use any product that has good data — check `data/scrape/products-index.json` for a TV with full details.

### 5. Visual comparison

For each page x viewport pair, read both screenshots (reference and ours) and compare these elements:

**Layout structure:**
- Column count (grid columns at each breakpoint)
- Sidebar visibility (filter panel: hidden on mobile, visible on desktop?)
- Flex direction changes (stack vs side-by-side)
- Content width (full-bleed vs contained)

**Navigation:**
- Is there a hamburger/mobile menu on the reference at this size?
- Search bar: full width, collapsed, or hidden?
- Account/basket icons: visible or hidden?

**Product grid:**
- How many columns per row? (typically 1→2→3→4→6 as width increases)
- Card layout: vertical stack vs horizontal?
- Image size relative to card

**Typography & spacing:**
- Heading sizes (do they scale down on mobile?)
- Body text size
- Padding and gaps between sections
- Margin around the main container

**Visibility:**
- Elements that appear/disappear at breakpoints
- Promotional banners that hide on mobile
- Secondary CTAs that collapse

**Rate each comparison:**
- **MATCH** — layout structure and proportions are the same
- **MINOR** — same structure but spacing/sizing is slightly off (< 20px difference)
- **MAJOR** — different layout structure (wrong column count, missing element, wrong flex direction)

### 6. Output the comparison report

```
## Responsive Comparison Report

### Homepage

| Viewport | Verdict | Issues |
|----------|---------|--------|
| 375px | MAJOR | Hero shows 3 cols, ref shows 1 stacked card |
| 428px | MAJOR | Same as 375 — hero not responsive below lg |
| 768px | MINOR | Shop deals grid gap 4px wider than ref |
| 1024px | MATCH | — |
| 1280px | MATCH | — |
| 1920px | MINOR | Content not centered, left-aligned vs ref centered |
| 2560px | MAJOR | Content stretches full width, ref has max-width constraint |

### Category Listing

| Viewport | Verdict | Issues |
|----------|---------|--------|
| 375px | MAJOR | Filter sidebar visible, ref hides it on mobile |
| ... | ... | ... |

---

## Summary

| Verdict | Count |
|---------|-------|
| MATCH | X |
| MINOR | X |
| MAJOR | X |

Total comparisons: X
Pages with MAJOR issues: [list]

Priority fixes (MAJOR issues first):
1. [component:line] — [description of fix needed]
2. [component:line] — [description of fix needed]
3. ...
```

If `$ARGUMENTS` is `compare`, stop here.

---

### Phase 3: Fix & Verify

### 7. Fix responsive issues (widest → narrowest)

After fixing CSS, restart: `lsof -ti:3000 | xargs kill -9; rm -rf .next && npm run dev`

Work through the issues from the comparison report, starting with the widest viewport and working down:

**Order: 2560px → 1920px → 1280px → 1024px → 768px → 428px → 375px**

This "desktop-first fix order" prevents mobile fixes from accidentally breaking desktop layout.

**For each fix:**

1. Identify the component and line number from the comparison report
2. Read the component to understand current responsive classes
3. Check the reference screenshot at that viewport to see the expected behavior
4. Apply the fix — typically one of:
   - Add/change Tailwind responsive prefix (`hidden md:block`, `grid-cols-2 lg:grid-cols-4`)
   - Adjust container max-width at breakpoint
   - Change flex direction at breakpoint (`flex-col sm:flex-row`)
   - Add/remove padding or gap at breakpoint
   - Adjust typography size (`text-sm md:text-base lg:text-lg`)
5. Check that the fix doesn't break other viewport sizes by reviewing nearby responsive classes

**Hero carousel special attention:** The hero carousel was rebuilt 4 times on the Electric project due to layout guessing. Check `data/scrape/layouts/hero-carousel.json` (if it exists from `/extract-layout`) for exact grid measurements. Key things to verify at each breakpoint: slide height, CTA button positioning, dot indicator size, arrow visibility (hidden on mobile in most implementations).

**Common responsive fixes:**

| Issue | Typical Fix |
|-------|-------------|
| Sidebar visible on mobile | Add `hidden md:block` to sidebar wrapper |
| Grid too many columns on small | Add `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| Content too wide on ultra-wide | Add `max-w-[1400px] mx-auto` to content container |
| Text too large on mobile | Add `text-sm md:text-base lg:text-lg` scaling |
| Element not stacking on mobile | Change to `flex-col sm:flex-row` |
| Horizontal overflow on mobile | Add `overflow-x-hidden` or reduce padding |
| Touch targets too small | Add `min-h-[44px] min-w-[44px]` on mobile interactive elements |

### 8. Re-capture and verify

After fixing all issues for a page, re-capture our site at all viewport sizes:

```
reference-screenshots/responsive/ours-{page}-{width}px.png
```

Compare again against reference screenshots. Repeat until all comparisons are MATCH or MINOR.

### 9. Output the verification report

```
## Responsive Verification Report

### Fixes Applied

| # | Component | Line | Fix Description | Viewports Affected |
|---|-----------|------|-----------------|--------------------|
| 1 | HeroCarousel.tsx | 45 | Added grid-cols-1 below sm breakpoint | 375, 428 |
| 2 | FilterSidebar.tsx | 12 | Added hidden md:block wrapper | 375, 428, 768 |
| 3 | ... | ... | ... | ... |

### Before/After Comparison

| Page | Viewport | Before | After |
|------|----------|--------|-------|
| Homepage | 375px | MAJOR | MATCH |
| Homepage | 428px | MAJOR | MATCH |
| Category | 375px | MAJOR | MATCH |
| ... | ... | ... | ... |

### Final Scorecard

| Page | 375 | 428 | 768 | 1024 | 1280 | 1920 | 2560 |
|------|-----|-----|-----|------|------|------|------|
| Homepage | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH |
| Hub | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH |
| Category | MATCH | MATCH | MINOR | MATCH | MATCH | MATCH | MATCH |
| Product | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH |
| Basket | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH |
| Checkout | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH | MATCH |

Remaining MINOR issues (acceptable):
- [page] [viewport] [description]

---

### 10. Responsive interaction audit (BLOCKING)

Components can change interaction model across breakpoints — static content on desktop becoming accordion/collapsible on mobile, or vice versa. Layout checks (Steps 1–9) only compare visual appearance; this step catches **behavioral** mismatches.

**Components to check:** header, footer, filter sidebar, product specs

**For each component:**

1. Open browser session at reference site at **1280px**
   - Record per visible heading/label:
     - `cursor` value (`auto` vs `pointer`)
     - Presence of toggle buttons or `aria-expanded` attributes
     - Presence of chevron/arrow icons (SVG children, `::after` pseudo-elements)
     - `overflow` on sibling content containers
2. Resize to **375px**, repeat the same checks
3. **Flag** any element where:
   - `cursor` changes from `auto` to `pointer` (or vice versa) between viewports
   - `aria-expanded` appears at one viewport but not the other
   - A chevron/arrow icon appears at one viewport but not the other
   - A content container gains `overflow: hidden` + `height: 0` at one viewport
4. Open browser session at **clone** at same viewports, repeat checks
5. **Compare:** reference interactive elements vs clone interactive elements at each viewport
6. **BLOCK** if reference has an interactive toggle at a viewport but clone does not (e.g., footer accordion on mobile missing from clone)
7. For each interactive element found, record its **DEFAULT STATE** on fresh page load (no clicks):
   - Accordion/collapsible: open or closed? (check `offsetHeight` of content — 0 = collapsed)
   - Dropdown: expanded or collapsed? (check `aria-expanded`)
   - Toggle: on or off? (check class list for `show`/`open`/`active`/`expanded`)
8. Compare default states between reference and clone at each viewport
9. **BLOCK** if default states differ (e.g., reference accordion loads collapsed but clone loads expanded)

Verdict: [PASS: all MATCH or MINOR / FAIL: X MAJOR issues remain]
```

---

## Critical Rules

- **Reference site is truth.** Never guess what a page should look like at a given viewport — always capture and compare against the reference site.
- **Capture reference FIRST, then ours.** Never compare from memory or assumption.
- **Save all screenshots to disk.** They become the project's responsive reference set alongside the existing desktop screenshots.
- **Fix widest → narrowest.** Desktop layout fixes first, then progressively fix smaller viewports. This prevents mobile fixes from breaking desktop.
- **Don't invent responsive behavior.** If the reference site shows the same layout at 375px and 428px, our site should too. Don't add breakpoints that don't exist in the reference.
- **One component at a time.** Fix one component's responsive behavior completely before moving to the next. Don't scatter partial fixes across files.
- **Re-capture after every batch of fixes.** Verify that fixes at one viewport didn't break another.
- **Respect existing patterns.** The codebase uses mobile-first Tailwind (default = mobile, `sm:`, `md:`, `lg:`, `xl:` for larger). Don't introduce desktop-first patterns or JS media queries unless the reference site requires behavior that CSS alone can't express.
- **Touch targets on mobile.** Any interactive element at 375px and 428px must be at least 44x44px (Apple HIG minimum).
- **No horizontal scroll on mobile.** If any page scrolls horizontally at 375px, that's a MAJOR issue regardless of what the reference shows.
- **Full-page screenshots.** Always use `fullPage: true` — responsive issues often appear below the fold in content sections, not just the header.
