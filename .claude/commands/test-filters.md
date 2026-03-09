Comprehensive verification of filter implementation — data integrity, handler synchronization, count accuracy, functional behavior, and edge cases. Run after any filter changes to catch regressions.

**Pipeline position:** 17c/32 — depends on: `/scrape-filters`, `/fix-filters` | feeds into: `/smoke-test`

**Usage:** `/test-filters` — runs all verification checks

Optionally: `/test-filters <check>` where `$ARGUMENTS` is a specific check: `data`, `sync`, `counts`, `functional`, `edges`, `team`. Omit for all.

---

## Golden Rule

**Test the implementation, not the intention.** Every check verifies actual behavior against actual data. Never assume a handler works because the code "looks right" — compute the expected result independently and compare.

---

## Prerequisites

- Category data loaded in category JSON files
- Filter handlers implemented in the category data module AND the category page component
- Dev server running for functional tests
- `scripts/verify-filters.js` available

---

## Checks

### 1. Data Integrity (automated)

Run `node scripts/verify-filters.js` to verify structural integrity across all category JSON files.

**What it checks:**
- Every category JSON has a non-empty `filters` array
- Every filter group has: `name` (string), `isExpanded` (boolean), `type` (one of: checkbox, range, rating, toggle), `options` (array)
- Every option has: `label` (non-empty string), `count` (number > 0) — except toggle type which has no options
- No duplicate filter group names within a file
- No excluded group names: "Delivery & Collection", "Collect from store", "Availability", "OK"
- No reference brand names in option labels (e.g., the reference site's brand name should be replaced with the project brand name)
- Hub-page categories have only basic filters (Brand/Price/Rating), listing-page categories have more

**Manual follow-up if script reports issues:**
1. For empty filter groups: re-scrape the category using `/scrape-filters`
2. For reference brand contamination: search `data/scrape/*.json` for the reference brand name and replace
3. For missing filters on listing pages: check if the category was misclassified as a hub page

### 2. Handler Synchronization

Verify that the two filter-matching implementations are perfectly in sync.

**Files to compare:**
- `countMatchingProducts()` in the category data module (path from `project-config.md`)
- `filteredProducts` useMemo in the category page component

**Steps:**
1. Read `countMatchingProducts()` — list every explicit handler name (the `groupName ===` or `group ===` checks)
2. Read `filteredProducts` useMemo — list every explicit handler name
3. Compare the two lists:
   - Every handler in file A must exist in file B with the SAME name
   - Every handler in file B must exist in file A with the SAME name
   - The matching logic inside each handler must be identical
4. Check the generic fallback at the bottom of each function — both must construct the search text identically (same fields, same join order)
5. Cross-reference handler names against filter group names in the category JSONs — every handler name must match at least one group name exactly

**Output format:**
```
Handler Sync Check:
| Handler Name | In countMatchingProducts | In filteredProducts | Names Match JSON | Status |
|--------------|------------------------|---------------------|------------------|--------|
| Brand        | Yes (line X)           | Yes (line Y)        | Yes              | PASS   |
```

**Common sync bugs:**
- Handler added to one file but not the other
- Group name changed in JSON but not in handler (`"TV Technology"` → `"Screen technology"`)
- Generic fallback uses different field sets (e.g., one includes `badges`, other doesn't)

### 3. Count Accuracy Verification

For each listing-page category, verify filter counts are correct.

**Steps:**
1. Read `project-config.md` to get the list of listing-page categories
2. For each category, pick 3 filter groups: Brand (always), plus 2 others
3. For each picked group, pick 1 option with a moderate count (not the highest, not the lowest)
4. Compute the expected count by running the handler's matching logic against the product array independently
5. Compare against the count shown in the filter data after `mapScrapedData()` processing

**How to compute expected count independently:**
```javascript
// Read the category JSON
const data = JSON.parse(fs.readFileSync('data/scrape/{category}.json'));
const products = data.products;

// For Brand "Samsung":
const count = products.filter(p => p.brand.toLowerCase() === 'samsung').length;

// For Screen technology "OLED":
const count = products.filter(p => /OLED/i.test(p.name) && !/Mini\s*LED/i.test(p.name)).length;

// For generic text match (e.g., Colour "Black"):
const count = products.filter(p =>
  (p.name + ' ' + (p.specs||[]).join(' ')).toLowerCase().includes('black')
).length;
```

**Output format:**
```
Count Accuracy — {Category}:
| Filter Group | Option | Expected | Actual | Status |
|--------------|--------|----------|--------|--------|
```

**If counts differ:** The handler logic doesn't match the filter group name, or the handler uses a different matching strategy than expected. Read the actual handler code and trace the mismatch.

### 4. Functional Filter Tests (dev server required)

Test filter interactions on the live dev server. Requires dev server running.

**For each listing-page category (or a representative sample of 3):**

1. **Apply single filter:** Click a Brand filter → verify product count decreases, all visible products match the brand
2. **Clear filter:** Remove the brand filter → verify product count returns to original
3. **Cross-filter (AND logic):** Apply Brand + one other filter (e.g., Price range) → verify results satisfy BOTH conditions
4. **Sort + filter:** Apply a filter, then change sort order → verify both are applied (filtered AND sorted)
5. **Pagination + filter:** If the category has >20 products, apply a filter that results in >20 matches → verify pagination controls update correctly

**How to test without a browser (automated approach):**
- The `filteredProducts` useMemo runs client-side, so test by reading the component code and tracing the logic manually
- Or use `firecrawl_browser_create` to automate: create a browser session, navigate to a category page, click filter checkboxes, observe product count changes

### 5. Edge Case Tests

Test filter behaviors that commonly break:

**5a. Brand case sensitivity:**
- Find a brand that exists in the data in UPPERCASE (e.g., from `product.brand`)
- Verify the filter option (which may be Title Case) still matches
- Check: `p.brand.toLowerCase() === label.toLowerCase()` — both sides lowercased?

**5b. Screen technology regex exclusions:**
- If "LED" is a filter option, apply it
- Verify results do NOT include products with "OLED", "QLED", or "Mini LED" in the name
- These require word-boundary matching: `/\bLED\b/` with negative lookahead for OLED/QLED

**5c. Price range boundaries:**
- Apply "Up to {currency}{amount}" — verify products at exactly that price ARE included
- Apply "{currency}{min} to {currency}{max}" — verify products at both min and max ARE included
- Check: uses `>=` and `<=` (inclusive), not `>` and `<` (exclusive)

**5d. Energy rating single letters:**
- If "Energy rating" filter exists with options like "A", "B", "C"
- Verify the handler matches against `p.energyRating` field, NOT generic text search
- Generic text search for "A" would match almost everything — this needs a dedicated handler

**5e. Badge-based filters:**
- If a "Loved by {brand}" filter exists, verify it checks the `p.badges` array
- Not the product name or specs (badges are a separate field)

**5f. Year filter:**
- If a "Year" filter exists with options like "2025", "2024"
- Verify it matches the year string in the product name
- Check: "2025" doesn't false-match product IDs or prices containing "2025"

**5g. Size range parsing:**
- If Screen Size filter has ranges like `24" - 31"`, verify:
  - Size is extracted from product name using regex, not a dedicated field
  - Comparison is numeric (parseInt), not string
  - Escaped quotes (`\"`) are unescaped before parsing

### 6. Team Verification Pattern

When running comprehensive verification across a large codebase, spawn parallel agents for efficiency.

**How to spawn a verification team:**

```
Launch 3-4 agents in parallel, each with a specific verification focus:

Agent 1: Data Integrity
- Check all category JSON filter arrays for structural issues
- MUST specify full project path in prompt

Agent 2: Handler Synchronization
- Compare countMatchingProducts() and filteredProducts useMemo line by line
- MUST specify full project path in prompt

Agent 3: Sidebar Rendering
- Verify FilterSidebar sort order covers all filter group names
- Verify all filter types render correctly (checkbox, range, rating, toggle)
- MUST specify full project path in prompt

Agent 4: Count Accuracy (optional)
- Spot-check filter counts for 3 categories
- MUST specify full project path in prompt
```

**Critical:** Every agent prompt MUST include the full absolute path to the project directory. Agents run from `~` by default and will fail to find files if given relative paths.

**Interpreting agent results:**
- Agents return a summary. Look for: FAIL, MISMATCH, MISSING, ERROR
- For each finding, determine severity: BLOCKER (wrong results shown to user), WARNING (cosmetic/ordering issue), INFO (minor inconsistency)
- Blockers must be fixed before deployment. Warnings can be tracked for later.

### 7. Interpreting Findings & Fix Patterns

| Finding | Root Cause | Fix |
|---------|-----------|-----|
| **Count mismatch** | Handler logic differs from what the filter option expects | Read the handler, trace the matching logic, compare against manual count |
| **Handler missing** | Filter group exists in JSON but no handler in code | Add handler to BOTH `countMatchingProducts()` AND `filteredProducts` useMemo |
| **Handler name mismatch** | JSON uses "Screen technology" but handler checks "TV Technology" | Update handler name to match JSON exactly (or accept both with `\|\|`) |
| **Zero results for all options** | Handler name doesn't match any filter group name, so it never fires | Check for typos, case differences, or renamed groups |
| **False positives** | Generic text search matches too broadly | Add a specialized handler that uses exact field match or regex with exclusions |
| **Filter group not rendering** | Group name not in FilterSidebar sort order array | Add the group name to the sort order array |
| **Wrong sort position** | Group renders but in wrong order | Reorder the sort array to match reference site ordering |

**After fixing any issue:**
1. Re-run the specific check that found it
2. Run `npm run build` to verify compilation
3. Run `node scripts/verify-filters.js` for data integrity
4. Restart dev server: `lsof -ti:{port} | xargs kill -9 2>/dev/null; rm -rf .next && npm run dev &`

---

## Quick Regression Checklist (run after ANY filter change)

```
[ ] npm run build passes
[ ] node scripts/verify-filters.js — 0 empty groups, 0 errors
[ ] Handler sync — same handler count in both files
[ ] Generic fallback — same search text construction in both files
[ ] Dev server starts without errors
```

---

## Critical Rules

- **Always test BOTH files.** A handler added to `countMatchingProducts()` but not `filteredProducts` means counts show correctly but clicking the filter doesn't work. And vice versa.
- **Compute expected counts independently.** Don't trust the handler's own output to verify itself. Write an independent count computation.
- **Full project paths in agent prompts.** Agents run from `~` and will search the wrong directories without absolute paths.
- **Fix → verify → build.** Never declare a fix complete without running the regression checklist.
- **Edge cases are not optional.** The "LED" vs "OLED" bug, single-letter energy ratings, and brand case sensitivity are the most common filter bugs. Test them every time.
