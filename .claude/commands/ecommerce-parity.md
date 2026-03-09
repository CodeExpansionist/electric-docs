Audit and wire all e-commerce user journeys so every interactive flow works end-to-end with real product data. No dummy data, no dead buttons, no broken links.

**Pipeline position:** 16/34 — depends on: `/build-component`, `/build-admin`, `/scaffold-project` | feeds into: `/smoke-test`, `/content-parity`

**Usage:** `/ecommerce-parity` — audits and fixes all flows

Optionally: `/ecommerce-parity <flow>` where `$ARGUMENTS` is a specific flow to check: `basket`, `saved`, `checkout`, `payment`, `orders`, `account`, `promo`, `branding`. Omit to run all.

---

## Golden Rule

**No dummy data, no dead buttons, no broken links.** Every interactive element on the e-commerce path must be wired to real state and real product data. If a button exists, it must do something. If data is shown, it must come from the product data layer — never hardcoded. A page can look pixel-perfect and still be broken if the "Add to basket" button does nothing.

---

## Prerequisites

- Dev server running (check `package.json` scripts for the actual dev server URL — do NOT assume port 3000)
- Product data loaded (`data/scrape/products/` populated, `data/scrape/products-index.json` exists)
- State contexts exist: `src/lib/basket-context.tsx`, `src/lib/saved-context.tsx`, `src/lib/orders-context.tsx`
- Core pages exist: product detail, basket, saved, checkout, payment, confirmation, account

---

## Step 1: State Context Audit

Check each context provider for these patterns:

**Files:** `src/lib/basket-context.tsx`, `src/lib/saved-context.tsx`, `src/lib/orders-context.tsx`

- **No hardcoded/demo data** — initial state must be empty. No `defaultBasket`, `defaultSaved`, `demoOrders` arrays. Hydration comes only from localStorage.
- **Hydration guard** — a `useRef(false)` must prevent the persistence `useEffect` from writing the initial empty state to localStorage before hydration runs. Pattern:

  ```tsx
  const hydrated = useRef(false);
  useEffect(() => { /* load from localStorage */ hydrated.current = true; }, []);
  useEffect(() => { if (hydrated.current) localStorage.setItem(...); }, [state]);
  ```

- **Persistence symmetry** — every reducer action that modifies state must trigger a localStorage write via the persistence `useEffect` dependency array.
- **All action types wired** — verify the reducer handles: ADD, REMOVE, UPDATE, CLEAR, HYDRATE, plus domain-specific actions (APPLY_PROMO, REMOVE_PROMO for basket).
- **No persistence guards that prevent empty saves** — `if (items.length > 0)` guards on persistence cause demo data to reappear. Always persist, even empty arrays.

**Report:** List each context, its status (pass/fail), and any issues fixed.

---

## Step 2: Data Bridge Audit

The `toProduct()` function in `src/app/products/[slug]/page.tsx` converts `ProductDetail` → `Product` for basket/saved contexts. Any field missing from this conversion silently disappears when the product enters state.

- Read `src/lib/types.ts` — list every field on the `Product` interface
- Read `toProduct()` — list every field it maps
- **Flag any gaps** — fields in the type but not in the conversion
- Common misses: `energyLabelUrl`, `energyRating` (added after initial implementation)

This is critical because basket and saved pages render from `Product` objects, not `ProductDetail`. A field that exists on the product page but is missing from `toProduct()` will break in the basket (e.g., energy label PDFs not opening).

**Report:** List any missing field mappings found and fixed.

---

## Step 3: User Journey — Browse to Basket

On the product detail page (`src/app/products/[slug]/page.tsx`), verify each interactive element:

- **Add to basket** button → calls `addItem()` from `useBasket()` → visual feedback:
  - Button changes to "Added ✓" (green) for 2 seconds, then reverts
  - Toast notification appears: "Added to basket" with "View basket" link
  - Header basket count increments in real-time
- **Save for later** button → calls `addSaved()`/`removeSaved()` from `useSaved()`:
  - Heart icon fills when saved, empties when unsaved
  - Text toggles between "Save for later" and "Saved"
- **Size variant** links → navigate to the correct product page (verify href includes full slug with product ID and `.html`)
- **Energy rating badge** → if `energyLabelUrl` exists, clicking opens PDF in new tab

Check: `src/components/product/PricePanel.tsx` for the add-to-basket button component.

---

## Step 4: User Journey — Basket Page

**File:** `src/app/basket/page.tsx`

- Product links use `/products/` (plural) — NOT `/product/` (singular)
- Product images load (verify `item.product.images.main` resolves to a real file)
- **Energy rating badges** are clickable when `item.product.energyLabelUrl` exists (opens PDF in new tab)
- **"Product fiche"** link works (same URL, `target="_blank"`)
- Quantity +/- controls update totals correctly
- Remove button removes item from basket and updates totals
- Save for later button moves item from basket to saved list
- Empty state renders with "Browse products" link when basket is cleared
- **Order summary** shows: subtotal, delivery cost (free over £40, otherwise £5), total

---

## Step 5: User Journey — Promo Codes

**File:** `src/app/basket/page.tsx` (OrderSummary component)

- Apply button validates code (case-insensitive) against known promo codes
- Invalid code shows red error message, input not cleared
- Valid code shows applied state: green pill with code name, discount amount, Remove button
- **Discount persists when quantity changes** — `calculateTotals()` in basket-context must accept optional `promoDiscount` parameter, and all reducer cases must pass `state.promoDiscount` through
- Remove button dispatches `REMOVE_PROMO`, clears code and discount, reverts total
- Total calculation: `Math.max(0, subtotal + deliveryCost - promoDiscount)`
- **Promo persists into orders** — when order is created, `promoCode` and `promoDiscount` must be saved to the Order object (check `Order` type in `orders-context.tsx` has these optional fields)
- **Promo shows in checkout sidebar** — `CheckoutSidebar.tsx` must display promo line (code + discount amount in green) between delivery and total when a promo is applied
- **Promo shows on confirmation page** — `confirmation/page.tsx` must display a promo discount row between delivery and total
- **Promo shows in admin** — `admin/orders/[orderNumber]/page.tsx` must display promo in both the totals breakdown and the Payment info card
- **Promo shows in account orders** — `account/page.tsx` order detail must display promo discount row between delivery and total
- **Promo shows on payment page sidebar** — `checkout/payment/page.tsx` order summary sidebar must show promo line and subtract discount from total

---

## Step 6: User Journey — Saved Items

**File:** `src/app/saved/page.tsx`

- Product links use `/products/${product.slug}` — NOT `/product/${product.slug}`
- Add to basket button works (calls `addItem()` from basket context)
- Remove from saved button works (calls `removeSaved()`)
- Empty state renders correctly with browse link
- Product data displays: images, prices, ratings, badges, delivery info

---

## Step 7: User Journey — Checkout Flow

**File:** `src/app/checkout/page.tsx`

- **No hardcoded product references** — search for any literal product names (e.g., "SAMSUNG", "UB00F"). The `CompletedDeliverySummary` must show actual basket item titles, not hardcoded strings.
- **Order prefix** matches brand: `ELZ-` not `CUR-`
- Step navigation works: welcome → delivery → customer → payment
- Edit button on completed steps re-opens that step with data preserved
- Guest checkout works without sign-in
- Sidebar order summary reflects actual basket contents and totals (including promo discount if applied)
- **Promo data saved to order** — `addOrder()` call must spread `promoCode`/`promoDiscount` from basket state into the order object
- Form validation on required fields (name, address, postcode, phone, email)

---

## Step 8: User Journey — Payment & Confirmation

**Files:** `src/app/checkout/payment/page.tsx`, `src/app/checkout/confirmation/page.tsx`

- **No hardcoded fallback items** — if basket is empty, should not render fake items. Either redirect to `/basket` or show empty state.
- **Order prefix** consistent: `ELZ-` not `CUR-`
- Card type detection works (Visa starts 4, MC starts 5, Amex starts 3)
- Input formatting works (card number auto-spacing, expiry MM/YY)
- Order creation saves to orders context with: all basket items, delivery address, customer email, payment method, totals, promo code/discount (if applied)
- Basket cleared after successful order (`clearBasket()`)
- Confirmation page displays: order number, items list, subtotal, delivery, promo discount (if applied), total, delivery address
- **Order persists** — navigating to `/account` → My Orders shows the order (including promo data)

---

## Step 9: Totals Consistency Audit

Every page that displays or saves subtotal, delivery cost, promo discount, or total must read from the **basket context** (the single source of truth) — never recalculate locally. Local recalculation risks mismatched thresholds, delivery costs, or fallback values.

- `basket-context.tsx` `calculateTotals()` is the canonical source for: subtotal, deliveryCost, total (including promo)
- **Checkout page** (`checkout/page.tsx`) — must use `basket.subtotal`, `basket.deliveryCost`, `basket.total`
- **Payment page** (`checkout/payment/page.tsx`) — must use `basket.subtotal`, `basket.deliveryCost`, `basket.total` — NOT recalculate with `items.reduce()`
- **Checkout sidebar** (`CheckoutSidebar.tsx`) — must use `basket.subtotal`, `basket.deliveryCost`, `basket.total`
- **Order creation** (both checkout and payment flows) — `subtotal`, `deliveryCost`, `total` saved to order must come from basket context values
- **No hardcoded fallback amounts** — if basket is empty, redirect or show empty state. Never fall back to a dummy subtotal.
- **Grep check:** Search for `items.reduce`, `> 40`, `>= 40`, `3.99`, `5.00` across `src/app/checkout/` and `src/components/checkout/` — any local total recalculation is a bug.

---

## Step 10: Cross-Feature Integration

Verify state changes propagate correctly across pages:

- Add to basket from product page → header basket count updates
- Add to basket from saved page → header basket count updates, item removed from saved
- Save for later on product page → saved count in header updates (if displayed)
- Checkout completion → basket cleared → header count resets to 0
- Order created at checkout → visible in account page My Orders tab (including promo data if applied)
- Order visible in admin dashboard (`/admin`) and admin orders table (`/admin/orders`) (including promo data if applied)
- Admin order table shows real orders, not demo data

---

## Step 11: Branding Consistency

Search all source files for old brand references:

```bash
grep -r "CUR-" src/
grep -ri "currys" src/ --include="*.tsx" --include="*.ts"
```

- Order number format must be `ELZ-XXXXXX-XXXX`
- All user-facing copy must reference "Electriz" not "Currys"
- No external URLs in any e-commerce pages (CDN, analytics, payment gateways)

---

## Report Format

Output a summary table after completing all steps:

```
| Flow              | Status | Issues Found | Fixed |
|-------------------|--------|--------------|-------|
| State Contexts    | ✓/✗    | ...          | ...   |
| Data Bridge       | ✓/✗    | ...          | ...   |
| Browse → Basket   | ✓/✗    | ...          | ...   |
| Basket Page       | ✓/✗    | ...          | ...   |
| Promo Codes       | ✓/✗    | ...          | ...   |
| Saved Items       | ✓/✗    | ...          | ...   |
| Checkout Flow     | ✓/✗    | ...          | ...   |
| Payment & Confirm | ✓/✗    | ...          | ...   |
| Cross-Feature     | ✓/✗    | ...          | ...   |
| Branding          | ✓/✗    | ...          | ...   |
```

---

## Post-Edit Checklist

After all fixes, run the mandatory post-edit checklist from CLAUDE.md:

```bash
# 1. Verify build
npm run build

# 2. Restart dev server
lsof -ti:3000 | xargs kill -9 2>/dev/null; rm -rf .next && npm run dev &
```

Adjust port if using a worktree (e.g., port 3002).
