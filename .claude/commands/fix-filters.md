Audit and repair category page filter logic against real product data. Catches case sensitivity bugs, string-vs-numeric comparison errors, and count mismatches that break the filtering experience.

**Pipeline position:** 17/32 — depends on: `/scaffold-project`, `/build-component` | feeds into: `/smoke-test`, `/content-parity`

**Usage:** `/fix-filters` — audits all categories

Optionally: `/fix-filters <category-slug>` where `$ARGUMENTS` is a specific category to audit. Omit to audit all.

---

## Golden Rule

**Filters must match real product data exactly.** If a brand has 42 products in the data, that brand's filter must show 42 results — not 0 (case mismatch), not 89 (wrong comparison), not 41 (off-by-one). Every filter option is verified against actual product data.

---

## Prerequisites

- Category data loaded in the category data module (path from `project-config.md`)
- Product data in `data/scrape/` category JSON files
- Filter rendering logic in place (typically in the category page component)

---

## Steps

### 1. Read the filter implementation

Read the category data module and the category page component to understand:

1. Where filter options are defined (hardcoded list vs extracted from data)
2. How filter matching works (exact match, includes, regex)
3. Whether comparisons are case-sensitive or case-insensitive
4. How numeric values (screen size, price) are compared

### 2. Verify brand filter matching (verification check)

Brand filtering is already implemented. Verify it works correctly for each category:

1. Extract all unique `brand` values from the category JSON
2. Extract all brand filter options from the filter definition
3. Verify:
   - Does every brand in the data appear as a filter option?
   - Does every filter option match at least one product?
   - Is the matching case-insensitive? Confirm: "SAMSUNG", "Samsung", and "samsung" all resolve correctly

**What correct implementation looks like:**

```typescript
// CORRECT
products.filter(p => p.brand.toLowerCase() === filterValue.toLowerCase())
```

### 3. Verify screen size filter logic (verification check)

Screen size filtering is already implemented. The actual implementation extracts size from product names using `p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g)` — there is no `product.screenSize` property. Verify the regex-based extraction works correctly:

1. Extract screen sizes from a sample of product names using the regex
2. Verify the filter comparison uses numeric (not string) comparison
3. Confirm that "55 inch" products don't appear in "9 inch" results (string comparison bug)

**What correct implementation looks like:**

```typescript
// Size is extracted from product name, not a dedicated field:
const sizeMatches = [...p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g)];
const size = sizeMatches.length > 0 ? parseInt(sizeMatches[0][1], 10) : null;
```

### 4. Verify price range filter logic (verification check)

Price filtering is already implemented. Prices are always `{ current, was, savings }` objects — never raw numbers. Verify the filter reads `price.current` correctly:

1. Confirm prices in category JSON are objects with `current`, `was`, `savings` keys
2. Verify the filter compares `price.current` (number), not `price` (the object itself)
3. Confirm range boundaries are inclusive (`>=` and `<=`, not `>` and `<`)

**What correct implementation looks like:**

```typescript
// CORRECT — price is always an object
const price = product.price.current;
if (price >= rangeMin && price <= rangeMax) { ... }
```

### 5. Verify rating filter logic (verification check)

Rating filtering is already implemented. Verify threshold comparisons are inclusive:

1. "4 stars & up" should include 4.0, 4.1, 4.5, 4.9, 5.0
2. Confirm: the comparison uses `>=` (correct) not `>` (which would exclude exact matches)

**What correct implementation looks like:**

```typescript
// CORRECT — includes exact threshold
products.filter(p => p.rating.average >= threshold)
```

### 5b. Verify filter groups match reference site

Filter data should be scraped from the reference site, not generated algorithmically. Check:

1. Read `project-config.md` 'Domain-Specific Filters' table for the expected filter groups per category
2. Compare the `filters` array in each category JSON against the expected groups
3. If groups are missing, re-scrape using `scripts/scrape-category-filters.js`:
   - Run `node scripts/scrape-category-filters.js urls` to get scrape targets
   - Scrape each listing page with Firecrawl (markdown format, stealth proxy, GB locale)
   - Parse with `node scripts/scrape-category-filters.js parse <markdown-file>`
   - Merge with `node scripts/scrape-category-filters.js merge <slug> <json-file>`

### 5c. Verify category-specific filter handlers

Each filter group needs a matching handler in BOTH:
- `countMatchingProducts()` in the category data module (recalculates counts)
- `filteredProducts` useMemo in the category page component (applies filters)

**These MUST stay in sync** — identical matching logic in both locations.

Handler types by matching strategy:
- **Exact field match**: Brand (→ `p.brand`), Energy rating (→ `p.energyRating`)
- **Range parsing**: Price (parse currency + range), Screen Size / Popular screen sizes (extract inches from name)
- **Threshold**: Customer Rating (→ `p.rating.average >= stars`)
- **Regex with exclusions**: Screen technology (LED must not match OLED/QLED/Mini LED)
- **Spec extraction**: Refresh rate (parse Hz from specs), Number of HDMI Ports (parse "HDMI x N")
- **Badge check**: "Loved by {brand}" (→ `p.badges` array)
- **Text in specs**: Guarantee, Year (→ match literal text in `p.specs`)
- **Generic text search**: everything else (→ case-insensitive substring in `p.name + p.specs + p.badges`)

When adding a new handler, ALWAYS add it in both files and verify the handler name exactly matches the filter group name in the category JSON.

Also verify that subcategory keyword filtering in the category data module correctly narrows products within parent categories.

### 6. Verify filter counts

For each filter option, compute the expected count from raw data and compare against what the UI would show:

1. For each brand: count products where brand matches (case-insensitive)
2. For each size range: count products where size falls in range (numeric)
3. For each price range: count products where price.current falls in range
4. Compare against the count the filter logic produces

```
Filter Count Verification — {Category Name}:
| Filter | Option | Expected | Actual | Status |
|--------|--------|----------|--------|--------|
| Brand | {Brand A} | 42 | 42 | PASS |
| Brand | {Brand B} | 38 | 38 | PASS |
| Brand | {Brand C} | 25 | 0 | FAIL (case mismatch: data has "BRAND C") |
| Size | {range} | 67 | 112 | FAIL (string comparison bug) |
| Price | {currency}{min}-{currency}{max} | 89 | 88 | FAIL (off-by-one: excludes upper bound) |
```

### 7. Apply fixes

For each bug found:

1. Identify the exact line in the category data module or the filter component
2. Apply the fix (case-insensitive matching, numeric parsing, inclusive ranges)
3. Re-run the count verification to confirm the fix

### 8. Output report

```
## Filter Audit Report

Categories audited: X

### Bugs Found and Fixed

| Category | Filter | Bug | Fix Applied |
|----------|--------|-----|-------------|
| {Cat A} | Brand: {Brand} | Case-sensitive match ("BRAND" ≠ "Brand") | toLowerCase() comparison |
| {Cat A} | Size/Dimension | String comparison | parseInt() before comparing |
| {Cat B} | Price: {range} | Exclusive upper bound | Changed < to <= |

### Verification After Fixes

| Category | Filters | All Counts Correct | Status |
|----------|---------|-------------------|--------|
| {Cat A} | 4 | Yes | PASS |
| {Cat B} | 3 | Yes | PASS |
| {Cat C} | 3 | Yes | PASS |

Total bugs found: X
Total bugs fixed: X
All filter counts verified: PASS/FAIL
```

---

## Critical Rules

- **Case-insensitive brand matching.** Always `.toLowerCase()` both sides. Brand names in data are inconsistent (e.g., "BRAND", "Brand", "brand").
- **Numeric size comparison.** Parse screen sizes to integers before comparing. String comparison of "55" < "9" is a guaranteed bug.
- **Prices are always objects.** The price field is always `{ current, was, savings }`. Compare `price.current` (number), never the `price` object itself.
- **Inclusive ranges.** Price ranges should include both endpoints. Use `>=` and `<=`, not `>` and `<`.
- **Test with real data.** Don't assume the fix works — verify counts against actual product data after applying.
- **Filters must update counts.** When one filter is active, other filter counts should reflect the narrowed dataset (if the UI shows counts).
- **Label stripping can create false matches.** When stripping trailing category words (e.g., "TVs", "soundbars") to get a core matching term, check for multi-word labels where stripping produces a common word. Example: "Smart TV projectors" → core "Smart" → matches ALL smart TVs instead of just projectors. Always handle ambiguous multi-word labels with explicit checks BEFORE the stripping logic.
- **Sub-category pages: selective 0-count hiding.** When filtering a parent category by brand/type, don't blanket-remove all 0-count options. Groups with reliable dedicated handlers (Brand, Price, Type, Screen Size, etc.) can safely hide 0-count options. Groups relying on generic text fallback (Colour, Voice control, Smart TV apps, etc.) should keep parent options — the generic matcher returns false negatives when product spec data is incomplete.
- **Regex exclusions for overlapping terms.** Any filter where one term is a substring of another needs explicit exclusion handling. Patterns: "LED" vs "OLED"/"QLED"/"Mini LED", "OLED" vs "QD-OLED", "QLED" vs "Neo QLED". Always use word-boundary matching with negative lookahead/exclusion for the longer terms.
- **Live scrape validation is mandatory.** Static analysis of local data files cannot detect missing filter groups or options. After implementing filters, scrape 3+ reference category pages live and compare every group and every option against local data. Expand all collapsed/closed accordion sections during scraping.
