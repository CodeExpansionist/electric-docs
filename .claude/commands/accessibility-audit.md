Audit the entire site against WCAG 2.1 AA, fix violations in forms, modals, accordions, and galleries, and verify with automated tools plus manual keyboard testing. Produces a page-by-page compliance report.

**Pipeline position:** 27/32 — depends on: `/build-component`, `/build-admin`, `/smoke-test` | feeds into: none (compliance endpoint)

**Usage:** `/accessibility-audit` — runs full audit on all pages

Optionally: `/accessibility-audit <scope>` where `$ARGUMENTS` is a page type (`homepage`, `category`, `product`, `basket`, `checkout`, `admin`), a WCAG principle (`perceivable`, `operable`, `understandable`, `robust`), or `fix-only` (apply fixes without re-auditing). Omit to run everything.

---

## Golden Rule

**Every user must be able to complete every task — keyboard-only, screen reader, or mouse.** An inaccessible checkout blocks real purchases. An unlabeled filter sidebar makes the entire category page unusable. Accessibility is not polish — it is functionality.

---

## Prerequisites

- Dev server running at the URL configured in `package.json`
- `firecrawl_browser_create` available for keyboard testing
- All pages built and functional (run `/smoke-test` first)
- `src/lib/constants.ts` exists (exports SITE_URL and stripDomain)

---

## Existing Accessibility Inventory

Before auditing, read these files to understand what already exists:

| File | Existing A11y | Known Gaps |
|------|---------------|------------|
| `src/app/layout.tsx` | `lang="{language}"` (from `project-config.md`), skip-to-content link | — |
| `src/components/ui/StarRating.tsx` | `role="img"`, `aria-label` | — |
| `src/components/ui/Accordion.tsx` | `<button>` element (keyboard focusable) | Missing `aria-expanded`, `aria-controls`, `id` on panels |
| `src/components/product/ProductGallery.tsx` | — | Missing keyboard navigation, `aria-label` on thumbnails |
| `src/components/category/FilterSidebar.tsx` | — | Checkbox inputs may lack labels, no `aria-live` for result count |
| `src/components/layout/HeroCarousel.tsx` | — | Missing `aria-roledescription`, slide announcements |
| `src/components/checkout/DeliveryStep.tsx` | — | Missing `aria-invalid`, `aria-describedby` for errors |
| `src/components/checkout/PaymentStep.tsx` | — | Missing format hints, `aria-invalid` |
| `src/components/layout/Header.tsx` (search) | Keyboard nav exists | Missing `aria-expanded`, `role="combobox"` |
| `src/components/checkout/WelcomeStep.tsx` | — | Missing form field labels, `aria-required` attributes |
| `src/components/checkout/CheckoutSidebar.tsx` | — | Missing heading hierarchy, `aria-live` for order summary updates |

Read each of these files at the start of the audit to confirm current state before making any changes.

---

## Checks

### Check 1: Automated scan with Lighthouse Accessibility

For each page type, run a Lighthouse accessibility audit.

If `npx lighthouse` is available:

```bash
npx lighthouse {dev-server-url}/ --output=json --only-categories=accessibility --chrome-flags="--headless"
```

Alternatively, use `firecrawl_browser_create` to load each page and manually inspect the DOM for common violations.

**Pages to scan:**

| # | Page | URL |
|---|------|-----|
| 1 | Homepage | `/` |
| 2 | Section hub | `/{section-slug}` |
| 3 | Category listing | `/{section-slug}/{first-category-slug}` |
| 4 | Product detail | `/products/{any-product-slug}` |
| 5 | Basket | `/basket` |
| 6 | Checkout | `/checkout/payment` |
| 7 | Search results | `/search?q={search-term}` |
| 8 | Admin | `/admin` |

Use the section slug from `project-config.md`. Read `src/lib/category-data.ts` for a real category slug and product slug.

For each page, record: total violations, violations by severity (critical, serious, moderate, minor).

### Check 2: Perceivable (WCAG 1.x)

#### 2a. Non-text Content (1.1.1)

**Scan all `<Image>` and `<img>` usages across `src/components/`.**

**Verify:**

- Product images: `alt` should be the product name (e.g., "65 inch OLED TV"), not "product image" or the filename
- Decorative images (brand logos in carousels, background patterns): `alt=""`
- Icon buttons (search, basket, menu, close): must have `aria-label` since icons have no text
- SVG icons: must have either `aria-hidden="true"` (decorative) or `role="img"` + `aria-label` (informational)

**Search for issues:**

```
Search src/components/ for: <Image
  → verify every match has a meaningful alt prop

Search src/components/ for: <svg
  → verify every match has aria-hidden or role="img"
```

#### 2b. Info and Relationships (1.3.1)

**Form inputs:**

Scan all `<input>`, `<select>`, `<textarea>` elements in checkout and search:

- Each must have an associated `<label>` via `htmlFor`/`id` match or by wrapping
- Groups of related inputs (delivery address, payment details) should use `<fieldset>` + `<legend>`
- Error messages should be programmatically linked with `aria-describedby`

**Heading hierarchy:**

For each page, extract all `h1`–`h6` elements and verify:

- Exactly one `<h1>` per page
- No heading level skips (h1 → h3 without h2)
- Heading text is meaningful (not "Section 1" or empty)

**Tables:**

Check admin data tables for:

- `<th>` elements with `scope="col"` or `scope="row"`
- No presentational tables using `<table>` for layout

#### 2c. Contrast (1.4.3 and 1.4.11)

**Read `data/design-tokens.json` and `tailwind.config.ts`** to extract the actual color values.

**Check these specific combinations:**

| Element | Foreground | Background | Required Ratio |
|---------|------------|------------|----------------|
| Body text | `text-primary` | `bg-white` | 4.5:1 |
| Secondary text | `text-secondary` | `bg-white` | 4.5:1 |
| Price text | price color | card background | 4.5:1 |
| "Was" price (strikethrough) | gray text | card background | 4.5:1 |
| Button text | white | `bg-primary` | 4.5:1 |
| Placeholder text | placeholder color | input background | 4.5:1 |
| Disabled button text | disabled text | disabled bg | 3:1 (informational) |
| Link text | link color | background | 4.5:1 |

**Non-text contrast (1.4.11):**

- Input borders against background: 3:1
- Focus indicators against background: 3:1
- Custom checkbox/radio borders: 3:1

Use a contrast calculator (compute from hex values in design tokens) to verify each pairing. **Placeholder text almost always fails** — check this carefully.

### Check 3: Operable (WCAG 2.x)

#### 3a. Keyboard Navigation (2.1.1)

Use `firecrawl_browser_create` to create a browser session and test keyboard navigation on each page.

**Tab through each page and verify all interactive elements are reachable:**

**Homepage tab order:**

1. Skip-to-content link (first focusable element)
2. Logo link
3. Main nav items (in order)
4. Search input
5. Account/basket/saved icons
6. Hero carousel controls (if visible)
7. Category cards in shop deals grid
8. Footer links
9. No element is skipped, no focus trap occurs

**Category page tab order:**

1. Filter sidebar checkboxes — each checkbox focusable
2. Sort dropdown — Enter/Space opens, arrow keys navigate options
3. Product cards — first focusable element in card is the product link
4. Pagination — each page number is focusable

**Product detail tab order:**

1. Gallery thumbnails — Enter/Space selects, main image updates
2. Size selector buttons (if present)
3. "Add to basket" button — Enter activates
4. Accordion sections — Enter/Space toggles open/closed
5. Specification table cells

**Checkout tab order:**

1. All form fields in logical order (top to bottom)
2. Error messages announced when field is invalid
3. "Place Order" button activatable with Enter
4. No field is skipped or unreachable

**Critical keyboard interactions to verify:**

- **Escape** closes any open dropdown, modal, or autocomplete
- **Arrow keys** navigate within composite widgets (carousels, autocomplete, tab groups)
- **Enter/Space** activate buttons and toggle controls
- **Tab** never gets trapped (can always Tab away from any element)

#### 3b. Skip Navigation (2.4.1)

Verify the existing skip-to-content link:

1. Load homepage
2. Press Tab once — skip link should appear/become visible
3. Press Enter — focus moves to `#main-content`
4. Verify `id="main-content"` exists on the main content container

Read `src/app/layout.tsx` and `src/components/layout/LayoutWrapper.tsx` to verify the skip link target.

#### 3c. Focus Order (2.4.3)

For modal/dropdown interactions:

- When a modal opens → focus moves to the first focusable element inside
- Tab cycles within the modal (focus trap)
- When modal closes → focus returns to the element that opened it
- Off-screen elements are not focusable (no tabbing to hidden content)

Check `src/components/checkout/SignInModal.tsx` for focus trap implementation.

#### 3d. Focus Visible (2.4.7)

Check `src/app/globals.css` for focus styles:

- `:focus-visible` should have a visible outline (at least 2px)
- `:focus:not(:focus-visible)` should remove outline for mouse users
- Every interactive element must show focus indicator on keyboard Tab

**Custom components to check:**

- Product cards (link wrapping entire card)
- Filter checkboxes (custom-styled checkboxes)
- Gallery thumbnails (button or clickable div)
- Carousel navigation arrows

#### 3e. Target Size (2.5.8)

At 375px viewport width, verify minimum touch targets:

| Element | Location | Minimum Size |
|---------|----------|-------------|
| Hamburger menu | Header | 44x44px |
| Search button | Header | 44x44px |
| Basket icon | Header | 44x44px |
| Filter checkboxes | Category sidebar | 44x44px (including label) |
| Pagination buttons | Category page | 44x44px |
| Gallery thumbnails | Product detail | 44x44px |
| Quantity +/- buttons | Basket | 44x44px |
| "Add to basket" button | Product detail | 44x44px height |

### Check 4: Understandable (WCAG 3.x)

#### 4a. Language (3.1.1)

Verify `<html lang="{language}">` (using the language from `project-config.md`) in `src/app/layout.tsx`. This should already be present.

#### 4b. Error Identification (3.3.1)

**Checkout form validation — read these files:**

- `src/components/checkout/DeliveryStep.tsx`
- `src/components/checkout/CustomerStep.tsx`
- `src/components/checkout/PaymentStep.tsx`
- `src/lib/validation.ts`

**For each form field, verify:**

1. Invalid input shows a text error message (not just a red border)
2. Error message clearly describes the error (e.g., "Please enter a valid postcode/zip code", not just "Invalid")
3. `aria-invalid="true"` is set on the input when invalid
4. `aria-describedby` links the input to its error message `<span id="...">`
5. Error is not conveyed by color alone (red border must be accompanied by text and/or icon)

**Promo code in basket:**

- Invalid promo code shows clear text error

#### 4c. Labels and Instructions (3.3.2)

**Required fields:**

- Marked with asterisk (*) AND `aria-required="true"`
- Format hints provided where needed (adjust examples for target locale):
  - Phone: "e.g., 07123 456789" (UK example — adjust for target locale)
  - Postcode/Zip: "e.g., SW1A 1AA" (UK example — adjust for target locale)
  - Card expiry: "MM/YY"
  - CVV: "3 or 4 digits on back of card"

### Check 5: Robust (WCAG 4.x)

#### 5a. Name, Role, Value (4.1.2)

Custom components must have correct ARIA roles. Below are the specific patterns to verify and apply.

**Accordion (`src/components/ui/Accordion.tsx`):**

Current state: uses `<button>` (good) but missing ARIA attributes.

Required fix:

```jsx
<button
  aria-expanded={openIndex === i}
  aria-controls={`accordion-panel-${i}`}
  id={`accordion-header-${i}`}
  onClick={() => setOpenIndex(openIndex === i ? null : i)}
>
  {title}
</button>

<div
  id={`accordion-panel-${i}`}
  role="region"
  aria-labelledby={`accordion-header-${i}`}
  hidden={openIndex !== i}
>
  {content}
</div>
```

**Hero carousel (`src/components/layout/HeroCarousel.tsx`):**

```jsx
<div role="region" aria-roledescription="carousel" aria-label="Featured deals">
  <button aria-label="Previous slide">...</button>
  <button aria-label="Next slide">...</button>
  <div aria-live="polite">Slide {current} of {total}</div>
</div>
```

**Search autocomplete (`src/components/layout/Header.tsx`):**

```jsx
<input
  role="combobox"
  aria-expanded={suggestionsOpen}
  aria-controls="search-suggestions"
  aria-activedescendant={activeSuggestionId}
  aria-autocomplete="list"
/>
<ul id="search-suggestions" role="listbox">
  <li role="option" id="suggestion-0" aria-selected={activeIndex === 0}>
    ...
  </li>
</ul>
```

**Product gallery (`src/components/product/ProductGallery.tsx`):**

```jsx
<div role="group" aria-label="Product images">
  <img role="img" aria-label="{product name} - main image" />
  <div role="tablist" aria-label="Image thumbnails">
    <button
      role="tab"
      aria-selected={selectedIndex === i}
      aria-label={`View image ${i + 1}`}
    >
      <img alt="" /> {/* Decorative — label is on button */}
    </button>
  </div>
</div>
```

**Filter checkboxes (`src/components/category/FilterSidebar.tsx`):**

```jsx
<input
  type="checkbox"
  id={`filter-${filterName}-${optionLabel}`}
  aria-label={`${optionLabel} (${count} products)`}
/>
<label htmlFor={`filter-${filterName}-${optionLabel}`}>
  {optionLabel} <span>({count})</span>
</label>
```

#### 5b. Status Messages (4.1.3)

Dynamic content that changes must be announced to screen readers:

| Event | Announcement | `aria-live` |
|-------|-------------|-------------|
| Item added to basket | "Added to basket" | `polite` |
| Filter applied | "{X} products shown" | `polite` |
| Search results loaded | "{X} results for '{query}'" | `polite` |
| Form submitted | "Order placed successfully" | `assertive` |
| Form error | "{X} errors found" | `assertive` |

**Implementation pattern:**

```jsx
{/* Add near the dynamic content */}
<div aria-live="polite" className="sr-only">
  {filterResultCount !== null && `${filterResultCount} products shown`}
</div>
```

The `sr-only` class (Tailwind's screen-reader-only utility) makes the element visually hidden but announced by screen readers.

### Check 6: Page-by-page audit

Run all checks above on each page type and record results:

| Page | Key Focus Areas |
|------|----------------|
| Homepage | Carousel keyboard nav, skip-to-content, image alts, USP bar list semantics |
| Category listing | Filter label association, sort dropdown ARIA, product card links, pagination focus, result count announcement |
| Category hub | Banner carousel ARIA, brand carousel keyboard nav, sidebar nav semantics |
| Product detail | Gallery keyboard nav, accordion ARIA, "Add to basket" feedback, size selector labels |
| Search results | Combobox pattern, suggestion listbox, results announcement, empty state |
| Basket | Quantity control labels, remove button labels, promo code form |
| Checkout delivery | Form field labels, error messages, fieldset/legend for address, postcode format hint |
| Checkout customer | Email validation feedback, billing address toggle label |
| Checkout payment | Card number format hint, expiry format hint, CVV label, "Place Order" confirmation |
| Admin dashboard | Data table headers/scope, sort control labels, pagination focus, stats card semantics |

### 7. Apply fixes

For each violation found, apply the fix directly to the component file.

**Fix application order (highest impact first):**

1. **Form labels and error messages** (checkout) — blocks task completion
2. **Keyboard navigation** (accordion, gallery, carousel) — blocks interaction
3. **ARIA attributes on custom widgets** — blocks screen reader use
4. **Image alt text** — informational gap
5. **Contrast issues** — readability
6. **Live region announcements** — dynamic content awareness

**For each fix:**

1. Read the component file
2. Identify the exact element(s) to modify
3. Apply the minimum change needed (don't restructure working components)
4. Verify the fix doesn't break visual appearance or functionality

### 8. Verify fixes with keyboard testing

After applying all fixes, re-test keyboard navigation on every page:

1. Create a browser session with `firecrawl_browser_create`
2. Tab through the entire page
3. Verify every interactive element is reachable
4. Verify ARIA attributes are present (use `agent-browser snapshot -i` to see accessible names)
5. Verify focus indicators are visible
6. Clean up the browser session with `firecrawl_browser_delete`

### 9. Generate screen reader testing checklist

Output a manual testing guide for VoiceOver (macOS) or NVDA (Windows):

```markdown
## Manual Screen Reader Testing Checklist

### Setup

- macOS: Enable VoiceOver (Cmd + F5)
- Windows: Install NVDA (free), press Insert + Space to start

### Per-Page Checks

1. **Page title announced on load**
   - VoiceOver reads the `<title>` when the page loads
   - Expected: "{Page Name} | {Clone Brand Name}"

2. **Headings navigation**
   - VoiceOver: Ctrl+Option+Cmd+H to jump between headings
   - Expected: headings follow h1 → h2 → h3 hierarchy, all meaningful

3. **Links list makes sense out of context**
   - VoiceOver: Ctrl+Option+U → Links list
   - Expected: no "click here" or "read more" — all links have descriptive text

4. **Forms read labels correctly**
   - Tab to each form field → VoiceOver announces the label
   - Expected: "First name, text field", not just "text field"

5. **Dynamic content announced**
   - Add item to basket → VoiceOver announces "Added to basket"
   - Apply filter → announces "{X} products shown"

6. **Images described meaningfully**
   - Product images: announces product name
   - Decorative images: skipped (aria-hidden or empty alt)
```

### 10. Output the compliance report

```markdown
## WCAG 2.1 AA Compliance Report

Audit date: [timestamp]
Pages audited: X
Dev server: {dev-server-url}
Tool: Manual + Lighthouse Accessibility

### Violation Summary

| Severity | Count | Examples |
|----------|-------|---------|
| Critical | X | Unlabeled form inputs, keyboard traps |
| Serious | X | Missing ARIA attributes, contrast failures |
| Moderate | X | Missing alt text, heading hierarchy |
| Minor | X | Missing lang attribute on inline text |

### Violations by WCAG Criterion

| Criterion | Name | Violations | Fixed |
|-----------|------|-----------|-------|
| 1.1.1 | Non-text Content | X | X |
| 1.3.1 | Info and Relationships | X | X |
| 1.4.3 | Contrast (Minimum) | X | X |
| 1.4.11 | Non-text Contrast | X | X |
| 2.1.1 | Keyboard | X | X |
| 2.4.1 | Bypass Blocks | X | X |
| 2.4.3 | Focus Order | X | X |
| 2.4.7 | Focus Visible | X | X |
| 2.5.8 | Target Size | X | X |
| 3.3.1 | Error Identification | X | X |
| 3.3.2 | Labels or Instructions | X | X |
| 4.1.2 | Name, Role, Value | X | X |
| 4.1.3 | Status Messages | X | X |

### Page-by-Page Results

| Page | Critical | Serious | Moderate | Minor | Score |
|------|----------|---------|----------|-------|-------|
| Homepage | 0 | X | X | X | X/100 |
| Category | 0 | X | X | X | X/100 |
| Product | 0 | X | X | X | X/100 |
| Basket | 0 | X | X | X | X/100 |
| Checkout | 0 | X | X | X | X/100 |
| Search | 0 | X | X | X | X/100 |
| Admin | 0 | X | X | X | X/100 |

### Fixes Applied

| # | Component | WCAG | Fix Description |
|---|-----------|------|-----------------|
| 1 | Accordion.tsx | 4.1.2 | Added `aria-expanded`, `aria-controls`, `role="region"` on panels |
| 2 | Header.tsx | 4.1.2 | Added combobox pattern to search autocomplete |
| 3 | ProductGallery.tsx | 2.1.1 | Added keyboard navigation to thumbnails |
| 4 | FilterSidebar.tsx | 1.3.1 | Added `<label>` association to checkboxes |
| 5 | DeliveryStep.tsx | 3.3.1 | Added `aria-invalid`, `aria-describedby` for errors |
| 6 | PaymentStep.tsx | 3.3.2 | Added format hints for card/expiry/CVV |
| 7 | HeroCarousel.tsx | 4.1.2 | Added carousel ARIA pattern with `aria-roledescription` |
| 8 | ... | ... | ... |

### Remaining Manual Checks Needed

- [ ] Screen reader testing with VoiceOver or NVDA
- [ ] Color contrast verification in high-contrast mode
- [ ] Zoom to 200% — verify no content loss or overlap
- [ ] Reduced motion — verify animations respect `prefers-reduced-motion`

### Keyboard Navigation Matrix

| Page | Tab Order Correct | No Traps | Focus Visible | Escape Works |
|------|-------------------|----------|---------------|-------------|
| Homepage | YES / NO | YES | YES / NO | N/A |
| Category | YES / NO | YES | YES / NO | YES / NO |
| Product | YES / NO | YES | YES / NO | N/A |
| Checkout | YES / NO | YES | YES / NO | YES / NO |
| Admin | YES / NO | YES | YES / NO | N/A |

Verdict: [PASS: zero critical + zero serious violations / FAIL: X critical, Y serious need fixing]
```

---

## Critical Rules

- **Fix forms first.** Unlabeled form inputs in checkout block task completion. This is the highest-impact accessibility fix in any e-commerce clone.
- **Keyboard testing is not optional.** Automated tools catch ~30% of accessibility issues. Keyboard testing catches interaction failures that no scanner detects — trapped focus, unreachable buttons, non-functional arrow key navigation.
- **`aria-expanded` is the most common missing attribute.** Every toggle control (accordion, dropdown, menu, filter group) needs `aria-expanded="true/false"`. This single fix resolves the largest class of screen reader usability problems.
- **Don't add ARIA where native HTML works.** A `<button>` does not need `role="button"`. A `<label htmlFor="id">` does not need `aria-label`. Use ARIA only when native HTML cannot express the relationship.
- **Contrast failures are real barriers.** A person with low vision cannot read text that fails 4.5:1 contrast. Check placeholder text especially — it almost always fails the minimum ratio.
- **`aria-live` must be used sparingly.** Announcing every state change overwhelms screen reader users. Only announce things the user needs to know immediately: basket additions, filter result counts, form errors, order confirmation.
- **Focus must return after modal close.** When a modal, dropdown, or autocomplete closes, focus must return to the element that triggered it. Losing focus after dismissal is disorienting for keyboard and screen reader users.
- **Test with a real screen reader if possible.** VoiceOver on macOS is built in (Cmd+F5 to toggle). Even 5 minutes of screen reader testing reveals issues no automated tool can find.
- **Do not break visual design.** Adding `aria-label`, `aria-expanded`, `role`, `id`, and `aria-controls` attributes should never change how the component looks. If a fix requires visible changes (like adding text labels), match the reference site's approach.
- **One component at a time.** Fix all accessibility issues in one component before moving to the next. Scattered partial fixes across files are hard to verify and easy to miss.
