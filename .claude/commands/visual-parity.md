Verify that the clone's rendered CSS matches the reference site's extracted layout measurements — colors, typography, spacing, shadows, borders, and interactive states. Closes the loop between `/extract-layout` (which captures reference specs) and `/build-component` (which implements them).

**Pipeline position:** 28/32 — depends on: `/extract-layout`, `/build-component`, `/responsive-audit` | feeds into: none (visual fidelity endpoint)

**Usage:** `/visual-parity` — runs full visual parity check (all components, all property groups)

Optionally: `/visual-parity <scope>` where `$ARGUMENTS` is one of:
- A property group: `colors`, `typography`, `spacing`, `effects`, `states`
- A component name: `header`, `hero`, `product-card`, `price-panel`, `footer`, `filter-sidebar`
- A phase: `extract`, `compare`, `fix`

---

## Golden Rule

**If a human can see the difference, this skill must catch it.** Layout structure is necessary but not sufficient — two pages can have identical grid columns and completely different visual identity. Colors, typography, shadows, borders, and hover states are what make a clone look like the real thing.

---

## Prerequisites

- Dev server running at the dev server URL (from `package.json`)
- `/extract-layout` has been run — `data/scrape/layouts/*.json` files exist with reference CSS measurements
- `/build-component` has been run — components are built and rendering on the dev server
- Firecrawl MCP tools must be available (`firecrawl_browser_create`, `firecrawl_browser_execute`)
- `src/lib/constants.ts` exists (exports SITE_URL and stripDomain)

---

## Firecrawl Settings

**Cache Strategy:** `maxAge: 86400000` (1-day cache) for reference site screenshots. The clone is always fetched fresh (no cache).

**Browser Sessions:** This skill uses `firecrawl_browser_create` extensively. **Always** call `firecrawl_browser_delete` when done — orphaned sessions cost 2 credits/min.

**Locale:** All reference site captures must include the locale from `project-config.md`: `location: { country: "{country}", languages: ["{language}"] }` to match the reference site's geo-targeted content.

---

## Steps

### 1. Load reference measurements

Ensure the output directory exists:

```bash
mkdir -p comparison-screenshots/visual-parity
```

Read all layout spec files from `data/scrape/layouts/`:

```
data/scrape/layouts/hero-carousel.json
data/scrape/layouts/product-card.json
data/scrape/layouts/category-grid.json
data/scrape/layouts/product-gallery.json
data/scrape/layouts/price-panel.json
data/scrape/layouts/header.json
data/scrape/layouts/footer.json
data/scrape/layouts/announcement-bar.json
data/scrape/layouts/usp-bar.json
data/scrape/layouts/filter-sidebar.json
data/scrape/layouts/sort-bar.json
data/scrape/layouts/breadcrumbs.json
data/scrape/layouts/main-nav.json
data/scrape/layouts/grid-system.json
```

**If the layouts directory is empty or missing, STOP.** Run `/extract-layout` first — this skill verifies against saved reference data, it does not re-scrape the reference site.

Build a component manifest mapping each component to:
- Its reference CSS values (from the layout JSON)
- The page URL where it appears on the clone
- The CSS selector to locate it in the DOM

Read `src/lib/constants.ts` for SITE_URL. The section slug is from `project-config.md`. The dev server URL is from `package.json`.

### 2. Map components to pages

Each component appears on specific page types. Use this mapping to know which pages to visit:

| Component Type | Page URL | Notes |
|---------------|----------|-------|
| Announcement/promo bar | `/` (homepage) | Top of every page |
| Header | `/` (homepage) | Top of every page |
| Main navigation | `/` (homepage) | Top of every page |
| Hero/carousel | `/` (homepage) | Homepage only |
| USP/trust bar | `/` (homepage) | Homepage + some category pages |
| Category/deals grid | `/` (homepage) | Homepage only |
| Breadcrumbs | `/{section-slug}/{first-category}` | Category + product pages |
| Filter sidebar | `/{section-slug}/{first-category}` | Category listing pages |
| Sort bar | `/{section-slug}/{first-category}` | Category listing pages |
| Product card | `/{section-slug}/{first-category}` | Category listing pages |
| Product gallery | `/products/{any-product-slug}` | Product detail pages |
| Price/purchase panel | `/products/{any-product-slug}` | Product detail pages |
| Footer | `/` (homepage) | Bottom of every page |
| Cart item card | `/basket` | Product image, badges, delivery info |
| Order summary | `/basket` | Payment options, totals, promo |
| Service add-ons | `/basket` | Protection plans, installation, etc. |
| Checkout steps | `/checkout` | Step indicators, form fields, validation |
| Payment form | `/checkout/payment` | Card inputs, payment method toggle |

**The actual component names vary per project.** Read `src/lib/constants.ts` for SITE_URL. The section slug is from `project-config.md`. Read category data to pick a real category slug and product slug for testing.

### 2b. Cart/checkout page comparison workflow

Cart pages have the MOST layout micro-differences because they combine product cards, interactive controls, pricing, and sidebar summaries. Use this systematic comparison:

**Step 1: Screenshot overlay.**
Take reference screenshot and clone screenshot at the same viewport width. Compare:

**Product item card layout:**

- [ ] Column count matches (2-col vs 3-col — this is the #1 structural mistake)
- [ ] Image container: border present/absent matches reference
- [ ] Image dimensions match (measure in px, don't eyeball)
- [ ] Title width: does it span full info area or is it constrained by a price column?
- [ ] Action links (remove/save): same row or stacked vertically?
- [ ] Price position: separate column, or inline with action row?
- [ ] Secondary price info (was-price, savings): where does it align?
- [ ] Badges/ratings: left-aligned or right-aligned? Inside or outside the info area?
- [ ] Supplementary boxes (delivery, warranty): full card width or info-area width?

**Interactive controls:**

- [ ] Quantity selector size matches (height, padding, font-size)
- [ ] Link decoration: always-underlined vs hover-only
- [ ] Radio/checkbox styling matches (custom or native)

**Order summary sidebar:**

- [ ] Payment method selector format (tabs, radio buttons, toggle)
- [ ] Promo code trigger: icon + text, or just text?
- [ ] Line item labels match (e.g., "X items + Y services" format)
- [ ] Total section typography matches

**Page chrome:**

- [ ] Background color (white vs surface/gray)
- [ ] Card wrapping (content areas in white cards on gray, or flat on white?)
- [ ] Icon style per delivery line (distinct per type vs generic checkmarks)

### 2c. Quick dimension sanity check (BLOCKING — catches oversized/undersized elements)

Before extracting full CSS, do a fast pass comparing **rendered dimensions** of key fixed-size elements between the reference screenshot and the clone. These elements have a "correct" size that rarely changes across breakpoints — if they're wrong, everything around them (spacing, alignment, whitespace) will look off.

**Elements to check at 1280px viewport:**

| Element | Selector hint | What to measure | Typical range |
|---------|--------------|-----------------|---------------|
| Logo | `header img`, `header svg` | rendered height | 28–44px |
| Search bar | `header input[type="text"]` | rendered height | 36–44px |
| Nav link text | `nav a` | font-size | 13–16px |
| Utility icons | header icon SVGs (account, basket, saved) | width × height | 20–28px |
| CTA buttons | `.btn-primary`, `[class*="btn"]` | height, padding | 36–48px height |

**Method:** Use `getBoundingClientRect()` on both reference and clone for each element. Compare rendered height/width.

**BLOCK if:** Any element's rendered height differs from the reference by more than **50%**. This indicates a sizing constant (width/height attribute, Tailwind class, or CSS dimension) is fundamentally wrong — not a subtle spacing issue but a structural sizing error that cascades into surrounding whitespace.

**Why this exists:** CSS property-level comparison (Steps 4–8) checks individual values in isolation. But an oversized logo (e.g., 100px vs reference 36px) passes every individual check — the padding is correct, the flex alignment is correct, the gap is correct — yet the header looks completely wrong because the element itself is too large. This step catches the root cause before wasting time auditing downstream symptoms.

---

### 3. Create browser session and extract clone CSS

Create a Firecrawl browser session pointed at the dev server:

```
firecrawl_browser_create()
```

For each page in the component manifest, navigate to it and extract computed CSS for every component on that page:

```
firecrawl_browser_execute({
  sessionId: "<session-id>",
  code: "agent-browser open {dev-server-url}/",
  language: "bash"
})
```

Then extract CSS for each component using JavaScript:

```
firecrawl_browser_execute({
  sessionId: "<session-id>",
  code: `
    // Extract computed CSS for a component
    function extractCSS(selector) {
      const el = document.querySelector(selector);
      if (!el) return { error: 'Element not found: ' + selector };
      const style = getComputedStyle(el);
      return {
        // Layout
        maxWidth: style.maxWidth,
        width: style.width,
        height: style.height,
        padding: style.padding,
        margin: style.margin,
        gap: style.gap,
        // Colors
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor,
        // Typography
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        fontFamily: style.fontFamily,
        // Effects
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle,
        opacity: style.opacity,
        // Image
        objectFit: style.objectFit,
        aspectRatio: style.aspectRatio,
      };
    }

    // Extract for component and its key children
    const result = {
      container: extractCSS('[data-component="hero-carousel"], .hero-wrapper, [class*="hero"]'),
      heading: extractCSS('[data-component="hero-carousel"] h2, .hero-wrapper h2'),
      cta: extractCSS('[data-component="hero-carousel"] a, .hero-wrapper a[class*="btn"]'),
    };
    JSON.stringify(result, null, 2);
  `,
  language: "node"
})
```

**Adapt the selectors per component.** The selectors above are examples — use the actual class names and structure from the clone's source code. Read the component source files to identify the correct selectors.

**Extract at two viewport sizes:**
- Desktop: 1280px width (default browser session)
- Mobile: 375px width (resize viewport or create a second session with mobile viewport)

### 3b. Live color audit (BLOCKING — catches design token gaps)

**Why this step exists:** Layout JSON comparison (Step 4) only catches color differences for colors already captured in design tokens. It CANNOT catch colors that were never tokenized. On real projects, the initial branding scrape often captures only a handful of colors — the real site may use 15+. Badge colors, icon fills, secondary text, and other tokens are commonly missing, causing pervasive visual differences that persist until caught by a live audit.

This step extracts ALL computed colors from both the reference site and the clone, then cross-references against `data/design-tokens.json` to catch gaps.

**Step 3b-1: Extract all colors from the reference site**

Create a browser session for the reference site. Navigate to 3 page types (homepage, a category listing, a product detail page). On each page, run:

```javascript
// Extract ALL visible colors from every element on the page
const elements = document.querySelectorAll('*');
const colors = { bg: {}, text: {}, border: {}, other: {} };

elements.forEach(el => {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return; // skip invisible

  const bg = style.backgroundColor;
  const text = style.color;
  const borderTop = style.borderTopColor;

  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    colors.bg[bg] = (colors.bg[bg] || 0) + 1;
  }
  if (text && text !== 'rgba(0, 0, 0, 0)') {
    colors.text[text] = (colors.text[text] || 0) + 1;
  }
  if (borderTop && borderTop !== 'rgba(0, 0, 0, 0)' && style.borderTopWidth !== '0px') {
    colors.border[borderTop] = (colors.border[borderTop] || 0) + 1;
  }
});

JSON.stringify(colors, null, 2);
```

Merge results across all 3 pages. Convert all `rgb(r, g, b)` values to hex. Deduplicate. Group by purpose:

- **Text colors:** primary body, secondary, muted/caption, price, link, heading
- **Background colors:** page bg, surface/card, header, footer, accent (light purple, pink for promo cards)
- **Border colors:** card borders, input borders, divider/HR, tab borders
- **Badge/icon colors:** notification badges, default icon fills
- **Semantic colors:** error/sale red, success green, warning, info

**Step 3b-2: Extract all colors from the clone**

Using the existing clone browser session from Step 3, run the same extraction on the same 3 page types.

**Step 3b-3: Cross-reference against design tokens**

Read `data/design-tokens.json`. For every color found on the reference site that appears on 2+ elements:

1. Check if it exists in design-tokens.json (exact match or Delta-E ≤ 3)
2. Check if the clone renders the same color in the same context
3. **Context mismatch detection:** Compare HOW each color is used, not just whether it exists. For each color that appears in both sites' tokens, check whether it's used in the same CSS property category:
   - If the reference uses a color as `backgroundColor` on 5+ elements but the clone only uses it as `color` (text/icon fill) — flag as **CONTEXT MISMATCH**
   - If the reference uses a color as `borderColor` but the clone never applies it to borders — flag as **CONTEXT MISMATCH**
   - This catches scenarios where the right token exists but is applied to the wrong components (e.g., `#56707A` used as arrow background on the reference but only as icon text color on the clone — the token existed, but the arrows were built with inverted colors)

**Output a token coverage table:**

```
LIVE COLOR AUDIT
────────────────
Reference Color │ Context          │ Token Match      │ Clone Color │ Status
#E5006D         │ badge bg         │ badge: #E5006D   │ #E5006D     │ MATCH
#56707A         │ icon fill        │ icon: #56707A    │ #56707A     │ MATCH
#444444         │ secondary text   │ text.secondary   │ #666666     │ MISMATCH
#FAF5FF         │ promo card bg    │ (none)           │ (none)      │ MISSING TOKEN
...
```

**BLOCK if:**
- Any reference color used in 10+ elements has no matching token (site-wide color, not tokenized)
- Any reference color differs from clone by Delta-E > 10 in the same context (obvious visual difference)
- Any CONTEXT MISMATCH where a color is used as `backgroundColor` on 5+ reference elements but never as `backgroundColor` on the clone (indicates inverted or misapplied component colors)

If blocked, update `data/design-tokens.json` and `tailwind.config.ts` before continuing to Step 4.

**Destroy the reference browser session** after extraction. Keep the clone session for subsequent steps.

### 4. Compare colors (per-component, against layout JSONs)

For each color property extracted (backgroundColor, color, borderColor, CTA backgrounds, accent colors):

**Parse to a common format.** Reference values may be hex (`#d4145a`), the clone returns `rgb(212, 20, 90)`. Convert both to RGB for comparison.

**Calculate perceptual difference using Delta-E (simplified):**

```
// Simplified Delta-E: Euclidean distance in RGB space
// (Full CIEDE2000 is better but RGB distance catches >95% of issues)
deltaE = sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²)
```

**Tolerance thresholds:**

| Delta-E | Verdict | Meaning |
|---------|---------|---------|
| ≤ 3 | MATCH | Imperceptible to the human eye |
| 3–10 | MINOR | Noticeable on close inspection |
| > 10 | MAJOR | Obviously different |

**Check these color pairings per component:**

- Container background vs reference `colors.background`
- Primary text color vs reference `typography.heading.color`
- Secondary text color vs reference `typography.subheading.color`
- CTA button background vs reference `colors.ctaBackground`
- CTA button text vs reference `colors.ctaText`
- Border color vs reference border values
- Link color (if applicable)

**Special cases:**
- `rgba()` with alpha — compare RGB channels and alpha separately
- Gradients — compare start and end color stops
- `transparent` / `rgba(0,0,0,0)` — exact match only

If `$ARGUMENTS` is `colors`, run both Step 3b and this step, then output the combined colors section of the report.

### 5a. Live Typography Extraction (BLOCKING — replaces screenshot estimation)

**Why this step exists:** Layout JSONs from `/extract-layout` rarely capture comprehensive typography data for every text element. Screenshot-based estimation commonly produces errors of ±2–4px (one full Tailwind size tier), leading to changes in the WRONG direction. This step extracts ground-truth computed styles from the live reference site.

**Step 1: Define the element inventory**

Before extracting, build a complete list of every text-rendering element across 3 page types:
- Homepage (section headings, nav links, utility labels, USP text, card titles, card descriptions, footer headings, footer links)
- Category listing (breadcrumbs, page title, card title, card price, card specs, ratings, delivery info, filter labels, sort labels, button text, was-price, savings)
- Product detail (title, price, was-price, savings, breadcrumbs, spec headings, spec values, collapsible section titles, button text, rating text)

**Step 2: Extract from live reference at ALL breakpoints**

Use `firecrawl_scrape` with `formats: ["extract"]` on each page type at 3 viewports:
- 375px (mobile)
- 768px (tablet)
- 1280px (desktop)

Extraction JS (run on each page):

```js
(() => {
  const selectors = 'h1,h2,h3,h4,h5,h6,p,a,span,label,button,input,li,td,th,figcaption';
  const results = [];
  document.querySelectorAll(selectors).forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (!el.textContent?.trim()) return;
    const style = getComputedStyle(el);
    results.push({
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().substring(0, 60),
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      selector: el.className ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase(),
    });
  });
  return JSON.stringify(results);
})()
```

**Step 3: Extract from clone at ALL breakpoints**

Same extraction on the clone dev server, same 3 page types × 3 viewports.

**Step 4: Build multi-breakpoint comparison table**

For each element role × page type × breakpoint:

| Page | Element | Breakpoint | Ref Size | Ref Weight | Clone Size | Clone Weight | Status |
|------|---------|------------|----------|------------|------------|-------------|--------|

Flag elements where:
- Size differs by more than 1px at ANY breakpoint → MAJOR
- Weight differs at ANY breakpoint → MAJOR (weight is exact-match)
- Reference changes size between breakpoints but clone doesn't → responsive class needed
- Clone changes size between breakpoints but reference doesn't → unnecessary responsive class

**Step 5: Apply corrections**

For each MAJOR mismatch, determine the correct Tailwind class:
- 12px = `text-xs`, 14px = `text-sm`, 16px = `text-base`, 18px = `text-lg`, 20px = `text-xl`, 24px = `text-2xl`, 30px = `text-3xl`
- 400 = `font-normal`, 500 = `font-medium`, 600 = `font-semibold`, 700 = `font-bold`

If reference size changes between breakpoints, use responsive prefixes (e.g., `text-sm md:text-base lg:text-lg`).

**CRITICAL ANTI-PATTERN:**

> NEVER estimate font sizes from screenshots or visual inspection. Browser rendering, zoom levels, and display scaling make visual estimation unreliable — errors of 2–4px (one full Tailwind tier) are common and have historically caused changes in the WRONG direction. Always use `getComputedStyle().fontSize` on the live reference site.

---

### 5. Compare typography

**Prerequisite:** Step 5a must have run first. The reference values for this comparison come from live extraction (Step 5a), NOT from layout JSONs alone. If Step 5a data is available, use it as the primary source — layout JSONs are supplementary only.

For each text element in each component, compare:

| Property | Tolerance | Match | Minor | Major |
|----------|-----------|-------|-------|-------|
| font-size | ±1px | ≤1px | 2–3px | >3px |
| font-weight | exact | exact | — | any diff |
| line-height | ±0.1 | ≤0.1 | 0.1–0.2 | >0.2 |
| letter-spacing | ±0.5px | ≤0.5px | 0.5–1px | >1px |
| text-transform | exact | exact | — | any diff |
| font-family | contains check | primary font matches | — | different family |

**Check at both breakpoints.** Typography often scales differently on mobile. The reference layout JSON includes both `desktop` and `mobile` measurements — compare each against the corresponding viewport.

**Heading hierarchy:** Verify that relative sizing is preserved even if absolute values differ slightly. If the reference has h1=28px, h2=22px, h3=18px, the clone should maintain that ratio.

If `$ARGUMENTS` is `typography`, only run this step and output the typography section.

### 5b. Structural comparison (BLOCKING — catches element order/visibility mismatches)

Compares the DOM structure of key components between the reference site and the clone. Catches mismatches that CSS property checks cannot: wrong element ordering, missing elements, incorrect visibility states across breakpoints.

**Requires:** Structure map JSONs from `/extract-layout` Step 9 in `data/scrape/layouts/*-structure.json`. If these don't exist, extract live from the reference using a browser session (same `page.evaluate` as Step 9 of `/extract-layout`).

**Components to check:** `header`, `footer`, `main-nav`, `usp-bar`, `sort-bar`, `filter-sidebar`, `product-card`, `pagination`

**Listing page–specific structural checks** (run on any category listing page):

| Check | What to verify | BLOCK condition |
|-------|---------------|-----------------|
| Sort bar dropdowns | "Sort by" and "Show per page" dropdowns both present | Missing dropdown |
| Sort bar labels | Text labels next to List/Grid toggle icons | Icons without text labels |
| Item count placement | Item count on separate line below sort controls | Item count inline with sort bar |
| Filter group ordering | Groups appear in the same order as the reference site | Groups in different order |
| Filter toggle | "Hide out of stock" toggle present at top | Toggle missing |
| Product card font weights | Title uses `font-normal` (400), specs use regular weight (not bold/semibold) | Bold title or bold spec text |
| Badge rendering | Product badges/certifications render with correct icon/style | Badge type mismatch (text vs image, wrong icon) |
| Price typography | Price uses consistent size across cards (check `text-xl` not `text-2xl`) | Inconsistent or oversized price text |
| Compare/Save row | Bottom row has "Compare" checkbox and "Save for later" button | Missing interactive elements |

**For each component, at both 375px and 1280px:**

1. **Extract clone structure** — open browser session at clone URL, run:
```javascript
(selector) => {
  const el = document.querySelector(selector);
  if (!el) return null;
  return Array.from(el.children).map((child, i) => ({
    index: i,
    tag: child.tagName.toLowerCase(),
    text: child.textContent?.trim().substring(0, 50) || '',
    visible: window.getComputedStyle(child).display !== 'none'
      && window.getComputedStyle(child).visibility !== 'hidden',
    ariaLabel: child.getAttribute('aria-label') || null,
  }));
}
```

2. **Load reference structure** from `data/scrape/layouts/{component}-structure.json`

3. **Compare and flag:**

| Check | PASS | BLOCK |
|-------|------|-------|
| Child count | Same visible count at each viewport | Different visible count |
| Element order | Visible children in same sequence | Flex/grid items reordered |
| Visibility states | Same elements visible at 375px and 1280px | Element visible on reference but `display:none` on clone (or vice versa) |
| Text labels | Key labels match (e.g., "Menu", "Search", "Basket") | Missing or different labels on interactive elements |
| ARIA landmarks | Same `role` and `aria-label` on equivalent elements | Missing landmark on clone |

**Output table:**

```
Component  | Viewport | Check          | Status | Details
-----------|----------|----------------|--------|--------
header     | 375px    | child count    | BLOCK  | ref=3 clone=2 (search bar missing)
header     | 375px    | element order  | BLOCK  | ref=[logo,search,nav] clone=[hamburger,logo,nav]
header     | 1280px   | visibility     | PASS   |
footer     | 375px    | text labels    | PASS   |
```

**BLOCK if any component has a structural mismatch at any viewport.** These are not cosmetic issues — they affect UX, navigation, and accessibility.

If `$ARGUMENTS` is `structure`, only run this step and output the structural comparison section.

### 6. Compare spacing and dimensions

For each component container and key child elements:

| Property | Tolerance | Match | Minor | Major |
|----------|-----------|-------|-------|-------|
| padding (each side) | ±2px | ≤2px | 3–8px | >8px |
| margin (each side) | ±2px | ≤2px | 3–8px | >8px |
| gap | ±2px | ≤2px | 3–8px | >8px |
| max-width | ±4px | ≤4px | 5–16px | >16px |
| width | ±4px | ≤4px | 5–16px | >16px |
| height | ±4px | ≤4px | 5–16px | >16px |
| border-radius | ±1px | ≤1px | 2–3px | >3px |

**Special attention areas:**
- Container `max-width` — drives the overall page feel (too wide = content feels stretched)
- Product card dimensions — inconsistent card sizes are immediately noticeable
- Grid `gap` — tight gaps vs loose gaps completely change the visual density
- Section spacing — padding between major sections on the homepage

**Note:** `/responsive-audit` catches column-count and flex-direction differences. This step catches pixel-level spacing within those columns — the fine-grained differences that make a layout feel "off" even when the structure is correct.

If `$ARGUMENTS` is `spacing`, only run this step and output the spacing section.

### 7. Compare visual effects

For each component with visual effects:

**Box shadow:**
Parse shadow values into components: `offset-x offset-y blur spread color`. Compare each component:
- Offset: ±1px tolerance
- Blur: ±2px tolerance
- Spread: ±1px tolerance
- Color: Delta-E ≤ 3 (same as step 4)

**Border:**
- `border-width`: exact match expected
- `border-style`: exact match expected (solid, dashed, none)
- `border-color`: Delta-E comparison

**Responsive border check (BLOCKING):**

Compare border properties at BOTH 375px and 1280px (same as typography in Step 5). Flag when:
- Border exists at one viewport but `border-style: none` / `border-width: 0` at the other
- Border color differs between viewports by Delta-E > 3
- Border width differs between viewports (e.g., 1px desktop vs 0px mobile)

This catches components styled differently per breakpoint (e.g., search bar: bordered on desktop, borderless on mobile).

**Border-radius:**
- Exact match expected — these are usually design token values (`4px`, `8px`, `9999px`)
- If the reference has `border-radius: 8px` and the clone has `border-radius: 12px`, that's a MAJOR mismatch

**Opacity:**
- ±0.05 = MATCH
- ±0.1 = MINOR
- > 0.1 = MAJOR

If `$ARGUMENTS` is `effects`, only run this step and output the effects section.

### 8. Test interactive states (highest-value check)

This is the single most impactful check in this skill. Hover and focus states are the #1 most commonly missed visual detail in clones because they require user interaction to see.

**For each interactive element type:**

| Element Type | Where Found | States to Test |
|-------------|-------------|---------------|
| Primary CTA button | Hero, price panel, basket | hover, focus, active |
| Secondary button | Product card, filters | hover, focus |
| Navigation link | Header, main nav, footer | hover, focus |
| Product card | Category listing | hover (card lift/shadow) |
| Thumbnail image | Product gallery | hover, selected/active |
| Filter checkbox | Category sidebar | hover, focus, checked |
| Input field | Search bar, checkout forms | hover, focus, filled |
| Accordion header | Product specs, FAQs | hover, focus, expanded |
| Carousel arrow | Hero, cross-sell | hover, focus |

**Extraction method for each state:**

```
firecrawl_browser_execute({
  sessionId: "<session-id>",
  code: `
    const el = document.querySelector('.primary-cta');

    // Default state
    const defaultStyle = getComputedStyle(el);
    const defaultBg = defaultStyle.backgroundColor;
    const defaultColor = defaultStyle.color;
    const defaultShadow = defaultStyle.boxShadow;
    const defaultTransform = defaultStyle.transform;
    const defaultTextDecoration = defaultStyle.textDecoration;

    // Hover state
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    // Wait for CSS transition
    await new Promise(r => setTimeout(r, 300));
    const hoverStyle = getComputedStyle(el);
    const hoverBg = hoverStyle.backgroundColor;
    const hoverColor = hoverStyle.color;
    const hoverShadow = hoverStyle.boxShadow;
    const hoverTransform = hoverStyle.transform;
    const hoverTextDecoration = hoverStyle.textDecoration;

    // Reset
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    // Focus state
    el.focus();
    await new Promise(r => setTimeout(r, 100));
    const focusStyle = getComputedStyle(el);
    const focusOutline = focusStyle.outline;
    const focusOutlineOffset = focusStyle.outlineOffset;
    const focusShadow = focusStyle.boxShadow;

    JSON.stringify({
      default: { backgroundColor: defaultBg, color: defaultColor, boxShadow: defaultShadow, transform: defaultTransform, textDecoration: defaultTextDecoration },
      hover: { backgroundColor: hoverBg, color: hoverColor, boxShadow: hoverShadow, transform: hoverTransform, textDecoration: hoverTextDecoration },
      focus: { outline: focusOutline, outlineOffset: focusOutlineOffset, boxShadow: focusShadow }
    });
  `,
  language: "node"
})
```

**Then capture the same states on the reference site** using a separate browser session (or use the reference layout JSON if it includes state data). If reference interactive state data is not in the layout JSON, create a reference browser session:

```
firecrawl_browser_create()
// Navigate to reference site and extract the same hover/focus CSS
```

**Compare each state:**
- Default → Default: should match (already checked in steps 4-7)
- Hover → Hover: background-color change? Text color change? Shadow added? Transform applied? Underline added?
- Focus → Focus: outline style? Outline color? Box-shadow ring?
- Active → Active: background darkened? Scale transform?

**Key mismatches to flag:**
- Element has hover effect on reference but none on clone (MAJOR)
- Hover changes different properties (reference changes bg, clone changes text color) (MAJOR)
- Focus indicator missing on clone (MAJOR — also an accessibility issue)
- Hover transition timing differs significantly (MINOR)

If `$ARGUMENTS` is `states`, only run this step and output the interactive states section.

### 9. Check image rendering

For product images, gallery images, and hero banners:

**Aspect ratio:**
- Extract the rendered image dimensions via `getComputedStyle` and the natural dimensions via `el.naturalWidth` / `el.naturalHeight`
- Compare rendered aspect ratio against reference
- Tolerance: ±0.05 ratio = MATCH, ±0.1 = MINOR, >0.1 = MAJOR

**Object-fit:**
- Must match reference exactly (`contain` vs `cover` vs `fill` produces very different results)
- A `cover` image on the reference showing as `contain` on the clone will have visible whitespace = MAJOR

**Container sizing:**
- Image container width/height should match reference ±4px
- Check that images don't overflow their containers
- Gallery thumbnails should be uniform size (check for inconsistent thumb dimensions)

### 10. Component-level screenshot comparison

For each major component, capture a cropped screenshot from both the reference site and the clone:

**Reference screenshots:**

```
firecrawl_scrape({
  url: "{reference-site-url}/{page-path}",
  formats: ["screenshot"],
  location: { country: "{country}", languages: ["{language}"] },
  screenshotOptions: {
    fullPage: false,
    viewport: { width: 1280, height: 900 }
  }
})
```

**Clone screenshots:**

```
firecrawl_scrape({
  url: "{dev-server-url}/{page-path}",
  formats: ["screenshot"],
  screenshotOptions: {
    fullPage: false,
    viewport: { width: 1280, height: 900 }
  }
})
```

Save screenshot pairs to `comparison-screenshots/visual-parity/`:
- `ref-{component}-desktop.png` / `clone-{component}-desktop.png`
- `ref-{component}-mobile.png` / `clone-{component}-mobile.png`

**These screenshots are for human review.** The automated CSS comparison (steps 4-8) provides the machine-readable verdict. Screenshots are supplementary evidence for visual inspection.

### 11. Generate per-component parity scores

For each component, calculate a weighted parity score:

| Property Group | Weight | Score Calculation |
|---------------|--------|-------------------|
| Colors | 25% | (matched color properties / total color properties) × 100 |
| Typography | 25% | (matched type properties / total type properties) × 100 |
| Spacing | 20% | (matched spacing properties / total spacing properties) × 100 |
| Visual Effects | 15% | (matched effect properties / total effect properties) × 100 |
| Interactive States | 15% | (matched state properties / total state properties) × 100 |

Where "matched" means within the MATCH tolerance threshold (not MINOR or MAJOR).

**Component score** = weighted sum of the 5 groups.

**Page score** = average of all component scores on that page.

**Overall score** = average of all page scores.

**Verdict thresholds:**
- PASS: score ≥ 85 AND zero MAJOR mismatches
- REVIEW: score 70–84 OR fewer than 3 MAJOR mismatches
- FAIL: score < 70 OR 3+ MAJOR mismatches

### 12. Output report

```markdown
## Visual Parity Report

Audit date: [timestamp]
Project: {project name from project-config.md}
Reference: {reference domain from project-config.md}
Breakpoints tested: desktop (1280px), mobile (375px)

### Overall Score: X/100 — [PASS / REVIEW / FAIL]

### Live Color Audit (Step 3b)

| Reference Color | Context | Token Match | Clone Color | Status |
|-----------------|---------|-------------|-------------|--------|
| [hex] | [context] | [token name or (none)] | [hex] | MATCH/MISMATCH/MISSING |
| ... | ... | ... | ... | ... |

Token coverage: X/Y reference colors have matching design tokens (X%)
Blocking issues: [count] (colors used in 10+ elements without tokens)

### Structural Comparison (Step 5b)

| Component | Viewport | Check | Status | Details |
|-----------|----------|-------|--------|---------|
| header | 375px | child count | PASS/BLOCK | ref=X clone=Y |
| header | 375px | element order | PASS/BLOCK | [details if mismatched] |
| header | 375px | visibility | PASS/BLOCK | [details if mismatched] |
| header | 375px | text labels | PASS/BLOCK | [details if mismatched] |
| header | 1280px | child count | PASS/BLOCK | |
| ... | ... | ... | ... | ... |

Structural blocking issues: [count]

### Per-Component Breakdown

| Component Type | Colors | Typography | Spacing | Effects | States | Score | Verdict |
|---------------|--------|-----------|---------|---------|--------|-------|---------|
| Announcement/promo bar | X | X | X | X | N/A | X | PASS/REVIEW/FAIL |
| Header | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Main navigation | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Hero/carousel | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| USP/trust bar | X | X | X | X | N/A | X | PASS/REVIEW/FAIL |
| Category/deals grid | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Filter sidebar | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Product card | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Product gallery | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Price/purchase panel | X | X | X | X | X | X | PASS/REVIEW/FAIL |
| Footer | X | X | X | X | X | X | PASS/REVIEW/FAIL |

**List the actual component names from the project.** The types above are examples.

### All Mismatches (sorted by severity, then component)

| # | Component | Property | Breakpoint | Reference | Clone | Delta | Severity |
|---|-----------|----------|------------|-----------|-------|-------|----------|
| 1 | [comp] | [prop] | desktop | [ref value] | [clone value] | [delta] | MAJOR |
| 2 | ... | ... | ... | ... | ... | ... | ... |

### Interactive States Audit

| Element | Location | Default | Hover | Focus | Active |
|---------|----------|---------|-------|-------|--------|
| Primary CTA | Hero | MATCH | [verdict] | [verdict] | SKIP |
| Add to Basket | Price panel | MATCH | [verdict] | [verdict] | SKIP |
| Product card link | Category | MATCH | [verdict] | [verdict] | SKIP |
| Nav link | Header | MATCH | [verdict] | [verdict] | SKIP |
| Filter checkbox | Sidebar | MATCH | [verdict] | [verdict] | SKIP |
| Search input | Header | MATCH | [verdict] | [verdict] | SKIP |
| Gallery thumbnail | Product | MATCH | [verdict] | [verdict] | SKIP |
| Carousel arrow | Hero | MATCH | [verdict] | [verdict] | SKIP |
| ... | ... | ... | ... | ... | ... |

### Image Rendering

| Image Type | Ref Aspect Ratio | Clone Aspect Ratio | Object-Fit Match | Verdict |
|------------|------------------|-------------------|------------------|---------|
| Product listing | [ratio] | [ratio] | YES/NO | MATCH/MINOR/MAJOR |
| Product gallery main | [ratio] | [ratio] | YES/NO | MATCH/MINOR/MAJOR |
| Gallery thumbnail | [ratio] | [ratio] | YES/NO | MATCH/MINOR/MAJOR |
| Hero banner | [ratio] | [ratio] | YES/NO | MATCH/MINOR/MAJOR |

### Screenshots Saved

comparison-screenshots/visual-parity/
├── ref-header-desktop.png / clone-header-desktop.png
├── ref-hero-desktop.png / clone-hero-desktop.png
├── ref-product-card-desktop.png / clone-product-card-desktop.png
├── ref-price-panel-desktop.png / clone-price-panel-desktop.png
├── ref-footer-desktop.png / clone-footer-desktop.png
├── ref-header-mobile.png / clone-header-mobile.png
└── ... (one pair per component per breakpoint)

### Fix Priority (MAJOR issues first)

1. [Component:Line] — [what to fix] — [suggested Tailwind change]
2. [Component:Line] — [what to fix] — [suggested Tailwind change]
3. ...

### Summary

| Metric | Value |
|--------|-------|
| Components audited | X |
| Total properties compared | X |
| MATCH | X (X%) |
| MINOR | X (X%) |
| MAJOR | X (X%) |
| Interactive elements tested | X |
| Hover state mismatches | X |
| Focus state mismatches | X |

Verdict: [PASS / REVIEW / FAIL]
```

If `$ARGUMENTS` is `fix`, read the most recent visual parity report, then work through the MAJOR mismatches in priority order — fixing each component completely before moving to the next.

---

## Critical Rules

1. **`/extract-layout` must run first.** This skill verifies against saved reference data — it does not re-scrape reference CSS. If `data/scrape/layouts/` is empty, the output is meaningless.

2. **Use `getComputedStyle()`, not parsed CSS files.** Computed style is what the browser actually renders. Source CSS can be overridden by specificity, media queries, or JavaScript. Always measure what the user sees.

3. **Color comparison uses Delta-E, not string matching.** `rgb(213, 20, 90)` and `#d5145a` are the same color. `rgba(0,0,0,0.1)` and `rgba(0,0,0,0.12)` are perceptually identical. Never flag format-only differences.

4. **Interactive states are the highest-value check.** Hover/focus styling is the #1 most commonly missed visual detail in clones. A perfect color/spacing match with missing hover states still looks wrong. Prioritize fixing state mismatches over minor spacing differences.

5. **Tolerance thresholds exist because browsers render differently.** A 1px font-size difference between the reference (captured in one browser version) and the clone (rendered in another) is browser variance, not a clone error. Only flag differences above the threshold.

6. **Don't fix token values — fix component usage.** If the reference uses `#d4145a` and the clone also defines `#d4145a` in `design-tokens.json` but the component renders a different color, the issue is in the component's Tailwind classes or CSS, not in the token definition.

7. **Test at both 1280px and 375px.** Visual styling differences often only appear at one breakpoint. Mobile font sizes, padding, and shadow values frequently diverge from desktop even when the layout structure matches.

8. **One component at a time.** Fix all mismatches for one component before moving to the next. Verify the fix at both breakpoints before moving on. Scattered fixes across components make verification impossible.

9. **Screenshot pairs are for human review, not automated scoring.** The CSS value comparison provides the automated verdict. Screenshots are supplementary evidence for cases where computed values match but the visual result still looks different (e.g., font rendering differences, subpixel antialiasing).

10. **Destroy the browser session.** Always call `firecrawl_browser_delete` when done. Orphaned sessions cost 2 credits/min. If the skill crashes or is interrupted, clean up sessions manually.

11. **Typography must be extracted from the live reference site using `getComputedStyle()`, never estimated from screenshots.** Screenshot-based estimation commonly produces errors of ±2–4px (one full Tailwind size tier), leading to changes in the wrong direction. If layout JSONs don't have typography data, extract it live — never guess.
