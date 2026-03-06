Audit and repair category page filter logic against real product data. Catches case sensitivity bugs, string-vs-numeric comparison errors, and count mismatches that break the filtering experience.

**Pipeline position:** 17/32 — depends on: `/scaffold-project`, `/build-component` | feeds into: `/smoke-test`, `/content-parity`

**Usage:** `/fix-filters` — audits all categories

Optionally: `/fix-filters <category-slug>` where `$ARGUMENTS` is a specific category to audit. Omit to audit all.

---

## Golden Rule

**Filters must match real product data exactly.** If Samsung has 42 TVs in the data, the Samsung filter must show 42 results — not 0 (case mismatch), not 89 (wrong comparison), not 41 (off-by-one). Every filter option is verified against actual product data.

---

## Prerequisites

- Category data loaded in `src/lib/category-data.ts`
- Product data in `data/scrape/` category JSON files
- Filter rendering logic in place (typically in the category page component)

---

## Steps

### 1. Read the filter implementation

Read `src/lib/category-data.ts` and the category page component to understand:

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

### 5b. Verify TV-specific filter groups

TV categories have additional filter groups beyond brand/price/rating. Verify these are present and functional:

- **TV Technology** — OLED, QLED, LED, Mini-LED, NanoCell
- **Resolution** — 4K, 8K, Full HD, HD Ready
- **Refresh Rate** — 50Hz, 60Hz, 100Hz, 120Hz, 144Hz
- **HDMI Ports** — 1, 2, 3, 4+
- **Smart TV Platform** — Tizen, webOS, Google TV, Fire TV, Roku, Vidaa

Also verify that `subcategoryKeywords` filtering in `category-data.ts` correctly narrows products within parent categories (e.g., "OLED TVs" subcategory within "TVs" only shows OLED products).

### 6. Verify filter counts

For each filter option, compute the expected count from raw data and compare against what the UI would show:

1. For each brand: count products where brand matches (case-insensitive)
2. For each size range: count products where size falls in range (numeric)
3. For each price range: count products where price.current falls in range
4. Compare against the count the filter logic produces

```
Filter Count Verification — TVs:
| Filter | Option | Expected | Actual | Status |
|--------|--------|----------|--------|--------|
| Brand | Samsung | 42 | 42 | PASS |
| Brand | LG | 38 | 38 | PASS |
| Brand | Sony | 25 | 0 | FAIL (case mismatch: data has "SONY") |
| Size | 50-59" | 67 | 112 | FAIL (string comparison includes 5xx) |
| Price | £500-£1000 | 89 | 88 | FAIL (off-by-one: excludes £1000) |
```

### 7. Apply fixes

For each bug found:

1. Identify the exact line in `src/lib/category-data.ts` or the filter component
2. Apply the fix (case-insensitive matching, numeric parsing, inclusive ranges)
3. Re-run the count verification to confirm the fix

### 8. Output report

```
## Filter Audit Report

Categories audited: X

### Bugs Found and Fixed

| Category | Filter | Bug | Fix Applied |
|----------|--------|-----|-------------|
| TVs | Brand: Sony | Case-sensitive match ("SONY" ≠ "Sony") | toLowerCase() comparison |
| TVs | Size: 50-59" | String comparison | parseInt() before comparing |
| Soundbars | Price: £500-£1000 | Exclusive upper bound | Changed < to <= |

### Verification After Fixes

| Category | Filters | All Counts Correct | Status |
|----------|---------|-------------------|--------|
| TVs | 4 | Yes | PASS |
| Headphones | 3 | Yes | PASS |
| Soundbars | 3 | Yes | PASS |

Total bugs found: X
Total bugs fixed: X
All filter counts verified: PASS/FAIL
```

---

## Critical Rules

- **Case-insensitive brand matching.** Always `.toLowerCase()` both sides. Brand names in data are inconsistent ("SAMSUNG", "Samsung", "sony", "Sony").
- **Numeric size comparison.** Parse screen sizes to integers before comparing. String comparison of "55" < "9" is a guaranteed bug.
- **Prices are always objects.** The price field is always `{ current, was, savings }`. Compare `price.current` (number), never the `price` object itself.
- **Inclusive ranges.** Price range "£500-£1000" should include both £500 and £1000. Use `>=` and `<=`, not `>` and `<`.
- **Test with real data.** Don't assume the fix works — verify counts against actual product data after applying.
- **Filters must update counts.** When one filter is active, other filter counts should reflect the narrowed dataset (if the UI shows counts).
