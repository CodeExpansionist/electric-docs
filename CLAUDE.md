# CLAUDE.md — Electric Project Instructions

You are building a pixel-perfect clone of Curry's TV & Audio section (currys.co.uk). Read PROJECT_SPEC.md first — it contains the full page inventory, component architecture, data model, and build order.

---

## Core Principles

1. **Pixel-perfect fidelity is the #1 priority.** Every section must be visually indistinguishable from the original Curry's site. When in doubt, match the original exactly — do not "improve" or "modernize" anything.
2. **Reference screenshots are the source of truth.** The `reference-screenshots/` directory contains 18 annotated screenshots of every major page. Your output must match these. See PROJECT_SPEC.md for the full screenshot index.
3. **Section-by-section, never whole-page.** Build each page one section at a time. Complete and verify each section before moving to the next.
4. **Scrape first, build second.** Always use Firecrawl MCP to get the actual site data before writing any component. Never guess at content, layout, or structure.
5. **Self-correct with screenshots.** After building each section, take a screenshot of your output AND open the reference screenshot. Compare them. Fix discrepancies. Repeat until they match.

---

## Reference Screenshots

**Location:** `reference-screenshots/`

These 18 screenshots cover every page type. They are your visual ground truth — if the scrape data and the screenshot disagree on any visual detail, **the screenshot wins**.

### Screenshot → Page Mapping

| Screenshot | Use When Building |
|------------|-------------------|
| `01-homepage-hero.png` | Header, nav, announcement bar, USP bar, hero carousel, shop deals |
| `02-homepage-offers.png` | Offers carousel, brand deals section |
| `03-homepage-products-footer.png` | Sponsored products, Currys Perks banner, footer |
| `04-tv-audio-hub-top.png` | TV & Audio hub: category icons, sidebar, top deals, AI section |
| `05-tv-audio-hub-mid.png` | TV & Audio hub: filmmaker mode, buying guides, TV size finder |
| `06-tv-audio-hub-bottom.png` | TV & Audio hub: promo banners, brand row, SEO content, news |
| `07-category-listing-full.png` | Category page: full layout, sort bar, product cards in list view |
| `08-category-filters.png` | Filter sidebar: all filter groups, toggle, checkboxes, price range |
| `09-product-page-top.png` | Product page: gallery, price panel, flexpay, size selector, offers |
| `10-product-page-mid.png` | Product page: sticky header, delivery/collection, care & repair, cross-sell |
| `11-product-page-bottom.png` | Product page: buy together bundle, product info, specs, reviews (collapsed) |
| `12-basket.png` | Basket: items, care & repair upsell, installation, recycling, order summary |
| `13-checkout-welcome.png` | Checkout: welcome page, sign in vs guest, basket sidebar, step list |
| `14-checkout-delivery-empty.png` | Checkout: delivery form empty state, address fields, radio toggles |
| `15-checkout-delivery-filled.png` | Checkout: delivery form filled state, expanded address fields |
| `16-checkout-signin-modal.png` | Checkout: sign in modal overlay with email input, continue/guest buttons |
| `17-checkout-customer-details.png` | Checkout: step 2 customer details, email, billing, marketing prefs, Currys Perks |
| `18-checkout-payment.png` | Checkout: step 3 payment methods, Card/Apple Pay vs PayPal, promo code |

### Key Visual Details to Match (from screenshots)

These are the details most likely to be missed. Check every one:

**Colors:**
- Curry's logo: deep purple circle with white "currys" text
- Announcement bar: teal/dark cyan (#007D8A approximate)
- Primary buttons ("Add to basket", "Continue to payment"): purple filled
- Secondary buttons ("View product", "Shop now", "Continue as guest"): purple outlined with rounded borders
- Sale/savings text: red (#CC0000 approximate)
- "Epic Deal" tags: red background, white text
- Footer: dark charcoal (#333 approximate), NOT pure black
- Star ratings: gold/amber
- "Deals" nav item: red pill badge
- Completed checkout steps: green checkmark icon

**Layout patterns:**
- Product list view: 3-zone horizontal layout (image | specs | price+actions)
- Sidebar pill links: rounded border, right-facing chevron, consistent height
- Card carousels: left/right arrow buttons, cards have subtle rounded corners
- Filter groups: collapsible with up/down chevrons, some have (?) tooltip icons
- Brand logos: original brand colors, not recolored
- Checkout: simplified header, numbered steps, completed steps show green check + summary + "Edit" link

**Typography:**
- Extract font families from scrape, do not use generic
- Price is large bold
- Savings text is smaller, red
- Monthly payment text is smaller, gray

**Interactive elements:**
- Toggle switch for "Hide out of stock": rounded pill shape
- Checkboxes: standard with counts in parentheses
- Price filter: £ Min / £ Max inputs side by side, purple "Apply" button
- View toggle: List/Grid buttons, active one appears selected
- Sort dropdown: "Sort By:" label inside the dropdown border

**Product page specifics (from screenshots 09-11):**
- Image gallery has left/right arrows, counter "1/12", thumbnail strip with video icon
- Key spec icons below gallery: 4 icons in a row with labels
- Size selector: horizontal pills, selected size has purple highlight/border
- "Spread the cost with Currys flexpay" is a distinct purple-branded expandable section
- Cross-sell products stack vertically with "Select alternative" links
- Bundle section: products side-by-side, combined total with savings math, "See all bundles" in red
- Collapsible sections with chevrons
- Sticky header appears on scroll with product title + "Add to basket" button

**Basket specifics (from screenshot 12):**
- Each item shows product image, title, quantity dropdown, price + savings
- Care & Repair upsell has 3 radio options with monthly prices
- Installation and Recycling are checkbox sections with prices and service descriptions
- Order summary sidebar has payment method toggle and flexpay breakdown

**Checkout specifics (from screenshots 13-18):**
- Simplified header: just logo + "Secure checkout" lock icon — NO main navigation
- Welcome page: two buttons "Sign in or Create an account" (filled) vs "Continue as guest" (outlined)
- Sign-in modal (screenshot 16): centered overlay with email input, "Continue" filled button, "OR" divider, "Continue as guest" outlined button
- Step 2 (screenshot 17): completed step 1 shows green checkmark with delivery summary and "Edit" link. Email field, billing details pre-filled from delivery, "Use my delivery details as my billing details" checkbox. "Let's stay in touch!" Currys Perks section with Email/SMS checkboxes. "Continue to payment" CTA
- Step 3 (screenshot 18): completed steps 1 & 2 with green checkmarks. Promo code/gift card expandable. Card/Apple Pay radio (shows Apple Pay, Amex, Visa, Mastercard, Maestro icons) vs PayPal radio. "Continue to payment" CTA
- Right sidebar basket summary persists through all checkout steps

---

## MCP Tools

### Firecrawl MCP
Your primary data source. Use it to:
- Scrape page HTML/structure from currys.co.uk
- Extract CSS values (colors, fonts, spacing, border-radius)
- Pull product data (names, prices, images, specs)
- Get footer link structure
- Scrape individual footer pages for content

**Usage pattern:**
```
1. Scrape the target URL
2. Parse the response for structure + content + styles
3. Save structured data to /data/scrape/
4. Extract design tokens to /data/design-tokens.json
5. Cross-reference scraped values with reference screenshots
6. Build the component using scrape data + screenshot as dual reference
```

**Important:** Scrape each page type ONCE and save the output. Don't re-scrape on every build iteration — reference the saved JSON.

---

## Build Workflow

For every page, follow this exact sequence:

### Step 1: Prepare References
```
1. Open the reference screenshot(s) for the page you're building
2. Load the scrape data for this page from /data/scrape/
3. Identify every section visible in the screenshot
4. Note specific CSS values from the scrape data
```

### Step 2: Build Section-by-Section
```
For each section of the page (top to bottom):
1. Identify the section boundaries in BOTH the screenshot and scrape data
2. Create the component(s) needed
3. Style with Tailwind using the exact CSS values from the scrape
4. Use real content/images from the scrape data
5. Run the dev server and take a screenshot
6. Compare your screenshot to the reference screenshot
7. Check these specifically:
   - Colors (exact hex values, not "close enough")
   - Spacing (margins, padding in pixels)
   - Typography (font-family, size, weight, line-height)
   - Border radius and border colors
   - Icon sizes and positions
   - Text content matches
8. Fix any differences
9. Move to the next section only when this one matches
```

### Step 3: Assemble
```
Combine all sections into the full page.
Take a full-page screenshot.
Compare against the full reference screenshot(s).
Check responsive behavior at 375px, 768px, and 1280px.
```

---

## Coding Standards

### TypeScript
- Strict mode enabled
- All components are functional React components with TypeScript
- Props interfaces defined for every component
- No `any` types

### Tailwind CSS
- Configure `tailwind.config.ts` with design tokens from `/data/design-tokens.json`
- Use custom token values over default Tailwind values
- Extend the theme, don't override it

### Images
- Use `next/image` for all images
- Set explicit width/height to prevent layout shift
- Use Curry's CDN URLs directly (internal dev build)
- Styled fallback placeholder for failed loads

### State Management
- React Context for basket state
- Basket persists in localStorage
- Checkout form state in component state (useState/useReducer)

---

## Form Validation Rules (Checkout)

| Field | Validation |
|-------|-----------|
| Email | Valid email format |
| Name | Required, min 2 characters |
| Address Line 1 | Required |
| Postcode | UK postcode format (e.g., SW1A 1AA) |
| Phone | UK phone format (07xxx or +44) |
| Card Number | 16 digits, Luhn check |
| Expiry | MM/YY format, not expired |
| CVV | 3-4 digits |

Mock submission: On "Place Order", show a loading spinner for 2 seconds, then display the confirmation page with a randomly generated order number.

---

## What NOT to Do

- **Don't "improve" the design.** Match Curry's exactly.
- **Don't add features Curry's doesn't have.** No dark mode, no extra animations.
- **Don't use generic placeholder text.** Use actual data from the scrape.
- **Don't build the whole page in one go.** Section by section. Every time.
- **Don't skip the screenshot comparison step.** Open the reference screenshot and compare side-by-side.
- **Don't hardcode data inline.** All data comes from JSON files in /data/.
- **Don't ignore the reference screenshots.** If scrape and screenshot disagree, screenshot wins.

---

## Git Workflow

- Commit after completing each section (not each file)
- Commit messages: `feat(section): add [page] [section-name]`
- Push after completing each full page

---

## Quick Reference: Build Order

```
Phase 0: Scrape all target URLs with Firecrawl → save to /data/scrape/
Phase 1: Extract design tokens → /data/design-tokens.json (cross-ref with screenshots)
Phase 2: Scaffold Next.js + configure Tailwind with tokens
Phase 3: Build layout shell — ref: 01 + 03 screenshots
Phase 4: Homepage — ref: 01 → 02 → 03 screenshots
Phase 5: TV & Audio Hub — ref: 04 → 05 → 06 screenshots
Phase 6: Category listing — ref: 07 + 08 screenshots
Phase 7: Product detail page — ref: 09 → 10 → 11 screenshots
Phase 8: Basket page — ref: 12 screenshot
Phase 9: Checkout flow — ref: 13 → 14 → 15 → 16 → 17 → 18 screenshots
Phase 10: All footer pages
Phase 11: Responsive polish + interaction states
Phase 12: Full visual audit — every page compared to reference screenshots
```

Start at Phase 0. Do not skip phases.
