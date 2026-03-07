Verify that rendered page content matches the scraped data files. Catches bugs where data exists in JSON but isn't displayed, or where hardcoded content doesn't match any data source.

**Pipeline position:** 20/32 — depends on: `/scrape-content`, `/scrape-products`, `/download-images`, `/build-component` | feeds into: none (verification endpoint)

**Usage:** `/content-parity` — checks all key pages

Optionally: `/content-parity <page>` where `$ARGUMENTS` is a page type: `homepage`, `hub`, `category`, `product`. Omit to check all.

---

## Golden Rule

**What's on screen must match what's in the data files.** If `data/scrape/products/12345.json` says the price is 499.00, the rendered product page must show 499.00. If the homepage JSON has 3 hero slides, the rendered homepage must show 3 hero slides. Any mismatch is a rendering bug.

---

## Prerequisites

- Dev server running (check `package.json` scripts for the actual dev server URL — do NOT assume port 3000)
- Scraped data files in `data/scrape/` (run `/scrape-content` and `/scrape-products` first). If `data/scrape/homepage.json` doesn't exist, skip homepage checks and note it in the report.
- `firecrawl_scrape` available for extracting rendered content

---

## Steps

### 1. Check Homepage Content

**Data source:** `data/scrape/homepage.json` (or equivalent hub page JSON)

**Extract from rendered page** using `firecrawl_scrape` with JSON schema:
- Hero carousel: slide titles, CTAs, image presence
- Shop deals: category names and icons
- Sponsored products: product names, prices, images
- Announcement bar text
- USP bar items

**Compare:**
- Number of hero slides matches JSON
- Category names in Shop Deals match JSON
- Product prices in Sponsored section match JSON
- Announcement text matches JSON

### 2. Check Hub Page Content

**Data source:** Hub page JSON files in `data/scrape/` — all hub JSON files matching `hub-*.json` or `*-hub.json` patterns. These correspond to the section's top-level hub and any sub-hub pages.

**Extract from rendered page:**
- Section titles (editorial, brands, subcategories)
- Brand names in brand row
- Subcategory names and counts
- Editorial card titles and descriptions

**Compare:**
- All sections from JSON appear on page
- Brand names match exactly
- Subcategory counts match JSON product counts

### 3. Check Category Listing Content

**Data source:** Category JSON file (e.g., `data/scrape/category-{category-name}.json`)

**Extract from rendered page:**
- Total product count displayed
- First 10 product names and prices
- Filter options available (brands, price ranges)
- Sort options available
- Breadcrumb trail

**Compare:**
- Product count matches JSON entry count (or paginated subset)
- Product names match JSON exactly (no truncation, no different products)
- Prices match JSON (watch for formatting: "499.00" vs "499" vs "From 499.00")
- Filter brand list matches brands present in JSON data

### 3b. Check Category Listing Structure

Verify the listing page UI chrome matches the reference site's structure. These are not data-driven — they're layout/component checks that `/visual-parity` may miss if it only checks header/footer.

**Sort bar elements (must all be present):**
- "Sort by" dropdown with label
- "Show per page" dropdown with options (e.g., 20/40/60)
- List/Grid view toggle with text labels (not just icons)
- Item count on a separate line below sort controls

**Filter sidebar elements:**
- "Hide out of stock" toggle at top
- Filter groups in correct order matching reference site
- Each group has expand/collapse chevron

**Product card elements (check first 3 cards):**

- Title uses regular weight (not bold)
- Spec bullets use regular weight (not semibold/bold)
- Price size is consistent across cards
- "Compare" checkbox and "Save for later" button in bottom row
- Domain-specific product badges/attributes render when the corresponding data field exists (e.g., energy ratings, certifications, awards)
- Delivery info line present

**Flag as MISMATCH** any missing element or styling difference from the reference. These are structural bugs, not cosmetic preferences.

### 4. Check Product Detail Content

**Data source:** `data/scrape/products/{id}.json`

Pick 5 representative products — one from each of the 5 largest categories. Read `src/lib/category-data.ts` to identify the 5 largest categories by product count. Choose products with a was-price, rating, and gallery images to maximize field coverage. For each:

**Extract from rendered page:**
- Product title
- Current price
- Was-price (if applicable)
- Rating stars and review count
- Key specs (first 4-5)
- Description text (first paragraph)
- Number of gallery images
- Cross-sell product count
- Breadcrumb trail

**Compare:**
- Title matches JSON `name` exactly
- Price matches JSON `price.current`
- Was-price matches JSON `price.was` (if present)
- Rating matches JSON `rating.value` and `rating.count`
- Specs match JSON `keySpecs` entries
- Description matches JSON `description.main` (at least first 200 chars)
- Gallery count matches JSON `images.gallery` length
- Cross-sells present if JSON has `crossSellProducts`

### 4b. Check Cart/Basket Content Parity

**Process: Measure, then verify — for ANY cart page.**

1. **Extract from the reference cart page** (add a product, then inspect):

   - Exact image container dimensions (measure in px, don't estimate)
   - Which product metadata is shown (title, price, was-price, savings, energy rating, delivery info)
   - Which interactive elements are present (qty selector, remove, save, promo code)
   - Sidebar content (payment options, summary line items, CTA button text)

2. **Compare each field against the clone:**

   - [ ] Image dimensions match measured value (not a guess)
   - [ ] All product metadata fields from step 1 are rendered
   - [ ] Delivery info content and icon types match (distinct per line type, not generic)
   - [ ] Sidebar has the same line items in the same order
   - [ ] Promo code interaction style matches (icon? underline? chevron?)
   - [ ] Service add-on sections present with correct content
   - [ ] Payment method selector matches format (radio, tabs, toggle)

3. **Rule: Cart item cards must display the same product metadata as listing page cards.** If the reference's listing page shows energy ratings, delivery info, and savings — the cart page must too. Cross-reference the listing card component against the cart item card.

### 4c. Check Filter Interaction Parity

Verify that filtering actually produces correct results by testing against data:

1. Navigate to a category page (e.g., the largest category)
2. Click a brand filter (e.g., a popular brand in that category)
3. Count visible products after filtering
4. Compare against: count of products in the category JSON where `brand` matches the selected brand (case-insensitive)
5. If counts don't match, the filter logic has a bug

Repeat with:

- A screen size filter (if available) — verify numeric comparison works
- A price range filter — verify price parsing handles the format in use

This catches filter bugs where counts in the UI don't match actual data.

### 5. Check for Hardcoded Content

Search `src/` for content that might be hardcoded instead of coming from data files:

- Grep for product names in component files (should come from data, not inline)
- Grep for prices in component files (same)
- Check announcement bar text — is it from JSON or hardcoded?
- Check footer links — do they match scraped navigation data?
- Flag any inline text that looks like product/category content

### 6. Output the parity report

```
## Content Parity Report

### Homepage

| Element | Data Source | Expected | Rendered | Match |
|---------|------------|----------|----------|-------|
| Hero slides | homepage.json | 3 slides | 3 slides | MATCH |
| Hero slide 1 title | homepage.json | "Big Brand..." | "Big Brand..." | MATCH |
| Shop deals categories | homepage.json | 8 items | 8 items | MATCH |
| Sponsored products | homepage.json | 6 products | 6 products | MATCH |
| Sponsored product 1 price | homepage.json | 299.00 | 299.00 | MATCH |
| Announcement bar | homepage.json | "Free delivery..." | "Free next day..." | MISMATCH |

Parity: X/Y fields match (Z%)

### Category: {category-name}

| Element | Expected | Rendered | Match |
|---------|----------|----------|-------|
| Product count | 156 | 156 | MATCH |
| Product 1 name | "{product name}..." | "{product name}..." | MATCH |
| Product 1 price | 699.00 | 699.00 | MATCH |
| Brand filter: {brand} | 42 products | 42 products | MATCH |
| ... | ... | ... | ... |

Parity: X/Y fields match (Z%)

### Product: [name] (ID: [id])

| Field | JSON Value | Rendered Value | Match |
|-------|-----------|----------------|-------|
| Title | "{product name}..." | "{product name}..." | MATCH |
| Price | 1299.00 | 1299.00 | MATCH |
| Rating | 4.7 (123 reviews) | 4.7 (123 reviews) | MATCH |
| Specs count | 5 | 4 | MISMATCH (missing 1 spec) |
| Gallery images | 7 | 5 | MISMATCH (2 not rendering) |
| Cross-sells | 4 | 4 | MATCH |

Parity: X/Y fields match (Z%)

### Hardcoded Content Found

- src/components/layout/{Component}.tsx:{line} — hardcoded text (should come from data)
- src/components/layout/{Component}.tsx:{line} — hardcoded items (should come from data)

---

## Summary

| Page | Fields Checked | Matches | Mismatches | Parity |
|------|----------------|---------|------------|--------|
| Homepage | 24 | 23 | 1 | 96% |
| Hub | 18 | 18 | 0 | 100% |
| Category | 32 | 31 | 1 | 97% |
| Product (avg of 5) | 15 | 13 | 2 | 87% |

Overall parity: X%

Mismatches to fix:
1. [page] [field] — expected [X] got [Y] — likely cause: [reason]
2. ...

Verdict: [PASS: 95%+ parity / FAIL: X% parity, Y fields need fixing]
```

---

## Critical Rules

- **Compare against data files, not the reference site.** This skill checks if our frontend renders our data correctly. Reference site comparison is `/visual-parity`'s job.
- **Be precise with price comparisons.** "499" vs "499.00" vs "From 499.00" are all different. Check the exact format rendered.
- **Sample products, don't check all of them.** Pick 5 representative products across different categories. If those 5 are correct, the rendering logic is likely correct for all.
- **Hardcoded content is a bug, not a feature.** If text appears on screen but isn't in any data file, it was hardcoded. Flag it — it won't update when data changes.
- **Missing content is worse than wrong content.** A section from the JSON that doesn't render at all is a bigger bug than a section with slightly wrong formatting.
- **Check both presence and correctness.** First verify the element exists on the page, then verify its content matches the data.
