Run functional end-to-end tests on the dev server by clicking through real user journeys — browse, search, filter, add to basket, checkout. Catches interactive bugs that visual audits miss.

**Pipeline position:** 22/32 — depends on: `/fix-filters`, `/fix-routes` (recommended) | feeds into: none (verification endpoint)

**Usage:** `/smoke-test` — runs all test flows

Optionally: `/smoke-test <flow>` where `$ARGUMENTS` is a specific flow to test (e.g., `checkout`, `search`, `search-ux`, `filters`, `navigation`, `gallery`, `basket`, `form-behavior`, `error-pages`). Omit to run all flows.

---

## Golden Rule

**Every user journey must complete without errors.** A page can look pixel-perfect and still be broken — buttons that don't click, forms that don't submit, filters that don't filter. This skill tests what users actually do, not what the page looks like.

---

## Prerequisites

- Dev server running (`npm run dev`) at the URL configured in `package.json`
- `firecrawl_browser_create` available for browser automation
- Product data loaded (at least one product in each category)

---

## Test Flows

### Flow 1: Navigation

Verify every top-level nav link loads a real page (not a 404 or blank screen).

**Steps:**
1. Open homepage
2. Get all `<a>` links in the main navigation bar
3. Click each link in sequence
4. For each: verify page loads (has `<h1>` or main content), no console errors, HTTP 200
5. Verify logo link returns to homepage

**Pass criteria:** All nav links resolve to pages with content. Zero 404s.

### Flow 2: Browse → Add to Basket

Test the core shopping flow from category to basket.

**Steps:**
1. Navigate to a category page. Use the section slug from `project-config.md`. Pick the first category from `categoryMap` keys in `src/lib/category-data.ts` (e.g., `/{section-slug}/{first-category-slug}`)
2. Verify product grid renders (at least 1 product card visible)
3. Click the first product card
4. Verify product detail page loads (title, price, gallery visible)
5. Click "Add to basket" button
6. Verify basket count in header increments (was 0, now 1+)
7. Click basket icon in header
8. Verify basket page shows the added product with correct name and price

**Pass criteria:** Product appears in basket with matching name/price. Basket count reflects addition.

### Flow 3: Search

Test search functionality end-to-end.

**Steps:**
1. Navigate to homepage
2. Click search input in header
3. Type a known product name or brand (e.g., a popular brand from the scraped data)
4. Submit search (press Enter or click search button)
5. Verify search results page loads
6. Verify at least 1 result appears
7. Click the first result
8. Verify product detail page loads

**Pass criteria:** Search returns relevant results. Result links navigate to real product pages.

### Flow 4: Category Filters

Test filter and sort interactions on category page. For deep filter verification (data integrity, handler sync, count accuracy, edge cases), use `/test-filters` instead.

**Steps:**
1. Navigate to `/{section-slug}/{category-slug}` (a category with multiple brands, using section slug from `project-config.md`)
2. Record initial product count
3. Apply a brand filter (e.g., click a popular brand in the filter panel)
4. Verify product count changes (should decrease or stay same, never increase)
5. Verify all visible products match the filter
6. Clear the filter
7. Verify product count returns to original
8. Change sort order (e.g., "Price: Low to High")
9. Verify first product price <= second product price

**Pass criteria:** Filters reduce results correctly. Sort order is applied. Clear restores original.

### Flow 4b: Filter Edge Cases

Test specific filter bugs that commonly break:

**Brand case sensitivity:**
1. Navigate to a category page
2. Apply a brand filter (e.g., a brand known to exist in the data)
3. Verify results > 0 (if the brand exists in the data)
4. Check: are products matched case-insensitively? (uppercase, title case, and lowercase of the brand should all match)

**Screen size numeric comparison:**
1. If a "screen size" filter exists, apply a size filter (e.g., "55 inch")
2. Verify results include products with size "55", "55\"", "55 inches", "139cm (55\")"
3. Test: apply "9 inch" filter — if no 9-inch products exist but "90 inch" products appear, the filter is doing string comparison instead of numeric

**Price range parsing:**
1. Apply a price range filter (e.g., "£500 - £1000")
2. Verify all visible products have prices within that range
3. Check: are prices compared as numbers? (String "£1,199" > "£500" fails because "1" < "5" in string comparison)

**Pass criteria:** Brand filters are case-insensitive. Size filters use numeric comparison. Price filters parse correctly.

### Flow 5: Product Gallery

Test image gallery interactions on product detail page.

**Steps:**
1. Navigate to any product with multiple gallery images
2. Verify main image loads (not a placeholder)
3. Click the second thumbnail
4. Verify main image changes (src attribute updates)
5. Click the third thumbnail (if exists)
6. Verify main image changes again

**Pass criteria:** Thumbnail clicks update the main image. All gallery images load.

### Flow 6: Full Checkout

Test the complete checkout flow from basket to order confirmation. The checkout is a multi-step flow within a single page (`checkout/payment/page.tsx`), not separate delivery/payment routes.

**Steps:**
1. Navigate to a category page (use section slug from `project-config.md`, pick the first category from `categoryMap` keys in `src/lib/category-data.ts`)
2. Click first product → click "Add to basket"
3. Navigate to `/basket`
4. Click "Continue to checkout" (or equivalent CTA)
5. Verify checkout page loads at `/checkout/payment`
6. Step 1 — Customer details: Fill the customer/delivery form within the multi-step checkout (adjust values for target locale):
   - Name: "Mr John Smith"
   - Phone: "07193190923" (example — adjust format for target locale)
   - Address: "Flat 8 Brehon House", "17-19 Pratt Street"
   - City: "London"
   - Postcode: "NW1 0AE" (example — adjust format for target locale)
7. Click "Continue" to advance to the next step within the same page
8. Step 2 — Payment: Fill payment form:
   - Card: "4111111111111111"
   - Expiry: valid future date
   - CVV: "123"
9. Click "Place Order"
10. Verify confirmation/order summary shows (order number, delivery details)

**Pass criteria:** Order completes with confirmation. All form validations pass. Multi-step progression works within the single checkout page. No console errors.

### Flow 7: Search UX Comparison

Compare search behavior against the reference site to verify autocomplete, result count, and empty-state handling.

**Steps:**

1. Open a second browser session on the reference site (with `location: { country: "{country}", languages: ["{language}"] }` from `project-config.md`)
2. On both sites, type a popular brand name into the search input (e.g., "Samsung")
3. **Autocomplete check:** After 500ms debounce, verify:
   - Suggestions dropdown appears on both sites
   - Count of suggestions: clone count should be within ±3 of reference
   - Suggestion format matches (product name + price, or just product name)
4. Submit the search on both sites
5. **Result count:** Compare total results count (clone within ±20% of reference = PASS)
6. **Empty search:** Search for a nonsense string (e.g., "xyzzy123") on both sites
   - Verify both show an empty results state
   - Clone should have a "no results" message (not a blank page)
7. **Partial match:** Search for a truncated term (e.g., "Sam" instead of "Samsung")
   - Verify clone returns results (tests prefix/partial matching)

**Pass criteria:** Autocomplete fires on both. Result counts are comparable. Empty states are handled. Partial matches work.

### Flow 8: Form Behavior Comparison

Compare checkout form validation behavior against the reference site.

**Steps:**

1. On the clone, navigate to checkout with an item in the basket
2. **Empty submit test:** Click submit/continue without filling any fields
   - Record: Do errors appear inline or as a summary? Immediately or after submit?
   - Record: Which fields show errors? What are the error messages?
3. **Inline validation test:** Start typing in the email field, then clear it
   - Does the error appear on blur? On change? Only on submit?
4. **Input masking test** (adjust values for target locale):
   - Type "07123456789" (example UK mobile) in the phone field — does it auto-format?
   - Type "sw1a 1aa" (example UK postcode) in the postcode field — does it auto-uppercase?
5. **Valid submission:** Fill all fields with valid data, submit
   - Verify progression to next step without errors
6. **Compare against reference** (if reference checkout is accessible without real payment):
   - Open reference checkout in the second browser session
   - Submit empty form — compare error timing (inline vs on-submit)
   - Compare error message wording for at least 3 fields
   - Note any input masking the reference uses that the clone doesn't

**Pass criteria:** Form validates all required fields. Errors are visible and descriptive. Input formatting works for locale-specific fields (e.g., postcode/zip).

### Flow 9: Error State Pages

Verify custom error pages render correctly.

**Steps:**
1. Navigate to a URL that doesn't exist (e.g., `/this-page-does-not-exist-12345`)
2. Verify custom 404 page renders (not Next.js default)
3. Verify it contains: heading, description, link back to homepage
4. Verify header/footer still render around the 404 content

**Pass criteria:** Custom 404 page with navigation back to homepage. No unstyled default page.

### Flow 10: Mobile Menu (375px)

Test mobile-specific interactions at smallest viewport.

**Steps:**
1. Create browser session with viewport 375x812
2. Navigate to homepage
3. Check if hamburger menu icon exists
4. If yes: click it → verify menu opens → click a category link → verify navigation works → close menu
5. If no hamburger: verify nav links are accessible (scrollable row or similar)
6. Verify "Add to basket" button is tappable (min 44x44px touch target)

**Pass criteria:** Navigation is accessible on mobile. Interactive elements are usable.

---

### Flow 11: Footer Accordion (375px)

Test that footer sections collapse/expand on mobile viewports.

**Steps:**
1. Create browser session with viewport 375x812
2. Navigate to homepage, scroll to footer
3. Verify all 5 section link lists are COLLAPSED by default on fresh load (offsetHeight = 0 or max-height: 0)
4. Verify no section has expanded/show/open class on fresh load — default state must be closed
5. Verify all 5 section headings visible and stacked vertically (single column)
6. Verify chevron/arrow icons visible next to each heading
7. Click "Help & support" heading → verify link list EXPANDS (height > 0, links visible)
8. Click "Help & support" again → verify link list collapses back (height = 0)
9. Resize to 1280px → verify headings are NOT clickable (no chevron icons, static multi-column grid)
10. Verify all link lists are visible at 1280px without any toggle interaction

**Pass criteria:** Footer sections are toggleable accordions on mobile, static columns on desktop.

---

## Steps

### 1. Set up browser session

```
firecrawl_browser_create({
  ttl: 300,
  activityTtl: 60
})
```

### 2. Run each test flow

For each flow (or the one specified in `$ARGUMENTS`):
1. Execute the steps using `agent-browser` commands (open, click, type, snapshot)
2. Use `agent-browser snapshot -i -c` to verify interactive elements exist
3. Take a screenshot after each critical step
4. Log pass/fail for each step within the flow

### 3. Handle failures

On any step failure:
- Take a screenshot immediately
- Log the exact failure (element not found, unexpected content, console error)
- Continue to next flow (don't abort all tests)

### 4. Output the test report

```
## Smoke Test Report

Test run: [timestamp]
Server: {dev-server-url}
Browser session: [session-id]

| Flow | Steps | Passed | Failed | Status |
|------|-------|--------|--------|--------|
| Navigation | 8 | 8 | 0 | PASS |
| Browse → Cart | 8 | 8 | 0 | PASS |
| Search | 8 | 7 | 1 | FAIL |
| Filters | 9 | 9 | 0 | PASS |
| Gallery | 5 | 5 | 0 | PASS |
| Checkout | 10 | 10 | 0 | PASS |
| Search UX | 7 | 7 | 0 | PASS |
| Form Behavior | 6 | 5 | 1 | FAIL |
| Error Pages | 4 | 4 | 0 | PASS |
| Mobile Menu | 6 | 5 | 1 | FAIL |

Overall: X/Y flows passed (Z%)

Failed steps:
1. [Search] Step 6: Expected at least 1 result, got 0 results for "{search-term}"
   Screenshot: reference-screenshots/smoke-test/search-fail.png
2. [Mobile Menu] Step 3: No hamburger menu icon found at 375px
   Screenshot: reference-screenshots/smoke-test/mobile-menu-fail.png

Console errors detected:
- [page] [error message]
```

### 5. Clean up

ALWAYS clean up the browser session, even if tests failed. Orphaned sessions consume 2 credits/minute until TTL expires.

```
firecrawl_browser_delete with sessionId: [session-id from step 1]
```

If the session ID was lost due to an error, find and delete orphaned sessions:

```
firecrawl_browser_list with status: "active"
```

Then delete each active session. This is a finally-equivalent pattern — always execute cleanup regardless of test pass/fail.

---

## Critical Rules

- **Use real browser interactions.** Don't just check if elements exist in HTML — actually click, type, and navigate. A button can exist but have a broken onClick handler.
- **Screenshot on failure.** Every failed step gets a screenshot saved to `reference-screenshots/smoke-test/`. This is essential for debugging.
- **Don't hard-code product names.** Use whatever product is first in the listing — the tests should work regardless of which products are in the data.
- **Respect timeouts.** Wait up to 5 seconds for page loads and interactions. If something takes longer, it's a performance bug worth noting.
- **Test with a clean state.** Clear localStorage before starting tests so basket/saved state doesn't interfere.
- **Console errors are failures.** Any uncaught exception or React error boundary in the console counts as a test failure, even if the page looks fine.
- **React key warnings are bugs.** Check for "Each child in a list should have a unique key prop" warnings. Array-index keys (`key={index}`) in product lists cause reordering bugs when filters/sorts change. Always use `product.productId` as the key.
- **Don't test layout.** That's `/responsive-audit`'s job. This skill tests *functionality* — does clicking do the right thing?
