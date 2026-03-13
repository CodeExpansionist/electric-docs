Scrape and implement filter sidebar parity with the reference site. Covers the full pipeline: scraping filter groups, writing to data files, implementing matching handlers, and verifying counts.

**Pipeline position:** 17b/32 — depends on: `/scrape-products` | feeds into: `/fix-filters`, `/smoke-test`

**Usage:** `/scrape-filters` — scrape and implement all category filters

Optionally: `/scrape-filters <category-slug>` where `$ARGUMENTS` is a specific category. Omit for all.

---

## Golden Rule

**Filter groups come from the reference site, not from algorithmic generation.** Never build filters by iterating product fields — scrape every filter group name, every option label, and every count directly from the reference listing pages. Counts are then recalculated from actual product data at build time to stay accurate.

---

## Prerequisites

- Category listing pages identified (from `/map-site` or `project-config.md`)
- Product data already scraped and in category JSON files
- Firecrawl MCP tools available
- Category data module and page component in place

---

## Steps

### 1. Identify listing pages vs hub pages

Read the category data module to find all categories. Classify each as:

- **Listing page**: Has products AND a filter sidebar on the reference site. These need scraped filters.
- **Hub page**: Subcategory navigation only, no filter sidebar. These keep generated Brand/Price/Rating.

Visit a sample of each on the reference site to verify classification. Hub pages typically show category cards, not product grids.

### 2. Scrape filter sidebars from reference site

For each listing-page category:

1. Use `firecrawl_scrape` with **markdown** format (not JSON — filters aren't in structured data)
2. Settings: `location: { country: "{country}", languages: ["{language}"] }`, `proxy: "stealth"`, `maxAge: 0`
3. Use `actions` to expand collapsed filter accordion sections:
   ```json
   actions: [
     { "type": "scroll", "direction": "down" },
     { "type": "wait", "milliseconds": 2000 }
   ]
   ```
4. Parse the markdown for filter groups: look for `### Header` followed by `Label (count)` lines
5. Record: group name, option labels, option counts, filter type (checkbox/range/rating/toggle)

**Common parsing pitfalls:**
- Escaped characters: `\\n` → `\n`, `\\"` → `"` in markdown output
- Tooltip artifacts: `##### OK` close buttons appear as false headers — exclude "OK" from group names
- Price labels with trailing backslash: strip `\` from end of labels
- Screen size quotes: `24\"-31\"` needs unescaping before parsing
- Channel names as numbers: "5" may be a valid option label (e.g., Channel 5)

**Exclusions:** Remove "Delivery & Collection", "Collect from store", "Availability" groups. Rename reference brand → project brand in "Loved by" badges.

### 3. Write filter data into category JSONs

For each listing-page category:
1. Read the existing `data/scrape/{category}.json`
2. Replace the `filters` array with the scraped filter data
3. Write back, preserving all other fields (products, metadata)

For hub-page categories: no changes needed.

**Validation per file:**
- `filters.length` matches expected count from scrape
- No filter group has 0 options
- No duplicate group names

### 4. Implement filter matching handlers

Two files MUST be updated in sync — this is the critical invariant:

1. **`countMatchingProducts()`** in the category data module — recalculates option counts from product data
2. **`filteredProducts` useMemo** in the category page component — applies active filters to product list

Both use identical matching logic. When adding a handler to one, add it to the other.

**Handler classification — choose the right strategy for each filter group:**

| Strategy | When to use | Example |
|----------|-------------|---------|
| **Exact field match** | Dedicated product field exists | Brand → `p.brand`, Energy rating → `p.energyRating` |
| **Range parsing** | Numeric ranges in labels | Price (parse `£min to £max`), Screen Size (parse inches from name) |
| **Threshold** | "X and above" pattern | Rating → `p.rating.average >= stars` |
| **Regex with exclusions** | Overlapping terms | Screen tech: "LED" must NOT match "OLED"/"QLED"/"Mini LED" |
| **Spec extraction** | Structured data in specs array | Refresh rate (parse `120 Hz`), HDMI Ports (parse `HDMI x 4`) |
| **Badge check** | Filter matches product badges | "Loved by {brand}" → check `p.badges` array |
| **Generic text search** | No dedicated field, substring works | Type, Colour, Connections, Features, Voice control, etc. |

**Generic fallback** (catches most filter types):
```typescript
const searchText = (p.name + " " + p.specs.join(" ") + " " + p.badges.join(" ")).toLowerCase();
return searchText.includes(label.toLowerCase());
```

Only add specialized handlers when the generic approach produces incorrect matches (e.g., "LED" matching "OLED").

### 5. Update filter sidebar sort order

The filter sidebar component typically has a sort order array that controls the display order of filter groups. Update it to include all new filter group names in priority order:

1. Rating, Brand, Price first (standard across all categories)
2. Category-specific filters in the order they appear on the reference site
3. Badge filters and accessibility features last

### 6. Verify filter counts

For each listing-page category, verify a sample of 3 filter groups:

1. Pick a filter option with a known count
2. Manually count matching products using the handler's matching logic
3. Confirm the count matches

```
Filter Count Verification — {Category}:
| Filter | Option | Expected | Actual | Status |
|--------|--------|----------|--------|--------|
```

### 7. Functional test

For each listing-page category:
1. Apply a filter → product list narrows correctly
2. Clear the filter → full list restores
3. Apply filters from 2 different groups → AND logic works

### 8. Update project documentation

1. Update `project-config.md` "Domain-Specific Filters" table with the complete inventory
2. Run `npm run build` to confirm everything compiles

---

## Critical Rules

- **Two-file sync.** `countMatchingProducts()` and `filteredProducts` useMemo MUST have identical handler names and matching logic. If you update one, update the other in the same edit session.
- **Scrape, don't generate.** Filter groups come from the reference site. Algorithmic generation only produces Brand/Price/Rating — it misses 60-90% of actual filters.
- **Stealth proxy for bot-protected sites.** If a listing page returns 404 or empty with basic proxy, switch to `proxy: "stealth"`.
- **Markdown format for filters.** Filters are sidebar UI elements, not structured data. JSON extraction misses them. Scrape as markdown and parse the text.
- **Hub pages have no filters.** Don't scrape or add filters to hub/navigation pages that only show subcategory links.
- **Counts are recalculated.** Scraped counts are from the reference site's product data. Our clone recalculates counts from our product data at build time via `countMatchingProducts()`. Options with 0 matching products are automatically hidden.
- **Collapsed sections get missed.** Firecrawl may not capture collapsed/closed filter accordion sections. Use `waitFor: 5000` minimum, and when using JSON extraction, explicitly prompt for "ALL filter groups including collapsed/closed sections." After scraping, compare the group count against what the reference site shows — if you only got 3-4 groups for a page that should have 10+, re-scrape with a longer wait or try markdown format.
- **Brand names truncate during scraping.** Multi-word brand names (e.g., "AUDIO PRO", "HOUSE OF MARLEY", "FRESH N REBEL") sometimes get truncated to just the first word ("AUDIO", "HOUSE", "FRESH"). After scraping, cross-check brand filter labels against the actual `brand` field in product data. If a brand label is a single common word, it's likely truncated.
- **Parent categories share filters with sub-pages.** On the reference site, a sub-page (e.g., home cinema systems) may inherit the Type filter from its parent (e.g., soundbars + home cinema). Verify by checking: do the Type option counts match the parent's total products rather than the sub-page's? If so, the filter is inherited and should be scraped from the parent, not generated for the sub-page.
- **Validate with live comparison.** After writing filter data to JSON files, scrape the same reference pages again and diff every group and every option. This catches: missing groups, truncated labels, wrong counts, and structural differences between hub and listing pages.
