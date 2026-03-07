Generate a comprehensive test suite — unit tests for data utilities, component tests with React Testing Library, integration tests for context providers, and E2E tests with Playwright. Sets up the entire test infrastructure from zero.

**Pipeline position:** 30/32 — depends on: `/build-component`, `/build-admin`, `/smoke-test` (must pass first) | feeds into: `/deploy` (CI/CD runs tests)

**Usage:** `/generate-tests` — generates all test files and configs

Optionally: `/generate-tests <scope>` where `$ARGUMENTS` is `setup`, `unit`, `component`, `integration`, `e2e`, or a specific file like `validation` or `images`. Omit to generate everything.

---

## Golden Rule

**Tests must pass on first run.** Every generated test must pass immediately — no "TODO: fix this test" stubs, no known failures. A test suite with red tests on creation teaches everyone to ignore red tests. Generate fewer tests that all pass rather than more tests that some fail.

---

## Prerequisites

- All building skills complete (12–15) — components must exist before testing them
- `/smoke-test` passes — if the app is broken, fix it before generating tests
- Dev server can start (`npm run dev`) — E2E tests need a running server
- Data layer files exist: `src/lib/validation.ts`, `src/lib/images.ts`, `src/lib/search-data.ts`, `src/lib/product-data.ts`, `src/lib/category-data.ts`
- Context providers exist: `src/lib/basket-context.tsx`, `src/lib/saved-context.tsx`, `src/lib/orders-context.tsx`

---

## Steps

### 1. Install test dependencies

Add Vitest, React Testing Library, and Playwright:

```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @vitest/coverage-v8
```

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium firefox webkit
```

Verify installation: `npx vitest --version` and `npx playwright --version` should both print version numbers.

### 2. Generate vitest.config.ts

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/lib/**', 'src/components/**'],
      exclude: ['src/test/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@data': path.resolve(__dirname, './data'),
    },
  },
});
```

The `@` and `@data` aliases must match `tsconfig.json` paths so test imports of data files resolve correctly.

### 3. Generate playwright.config.ts

Read `package.json` to find the dev server port (look for the `-p` flag in the `dev` script, or default to 3000).

Create `playwright.config.ts` at the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

Replace the port number with the actual value from `package.json` if it differs from 3000.

### 4. Generate test utilities

**`src/test/setup.ts`** — Global test setup:

```typescript
// NOTE: The import path for jest-dom varies by version:
//   v6+: import '@testing-library/jest-dom/vitest'
//   v5:  import '@testing-library/jest-dom'
// Check the installed version with: npm ls @testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// Mock localStorage (not available in jsdom by default)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset localStorage between tests to prevent hydration leakage
afterEach(() => {
  localStorage.clear();
});
```

**`src/test/utils.tsx`** — Custom render with all providers:

```typescript
import { render, type RenderOptions } from '@testing-library/react';
import { BasketProvider } from '@/lib/basket-context';
import { SavedProvider } from '@/lib/saved-context';
import { OrdersProvider } from '@/lib/orders-context';
import type { ReactElement } from 'react';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <SavedProvider>
        <OrdersProvider>
          {children}
        </OrdersProvider>
      </SavedProvider>
    </BasketProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RTL so tests import from one place
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**`src/test/mocks/next-navigation.ts`** — Mock `next/navigation`:

```typescript
import { vi } from 'vitest';

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

export const usePathname = vi.fn(() => '/');
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const useParams = vi.fn(() => ({}));
```

Register in individual test files via `vi.mock('next/navigation', () => import('../test/mocks/next-navigation'))`.

### 5. Generate unit tests — validation.ts (Priority: HIGH)

Create `src/lib/__tests__/validation.test.ts`.

**First, read `src/lib/validation.ts`** to confirm the exact function signatures and regex patterns.

**Test cases to generate:**

```
describe('isValidUKPostcode', () => {
  // VALID formats
  test.each([
    'SW1A 1AA',   // Westminster
    'EC1A 1BB',   // City of London
    'W1A 0AX',    // BBC
    'M1 1AE',     // Manchester (short outward)
    'B33 8TH',    // Birmingham
    'CR2 6XH',    // Croydon
    'DN55 1PT',   // DVLA
    'SW1A1AA',    // No space variant
  ])('%s is valid', (postcode) => { ... });

  // INVALID formats
  test.each([
    '12345',
    'ABCDE',
    '',
    '123 ABC',
    'SW1A 1A',    // Too short inward code
  ])('%s is invalid', (postcode) => { ... });
});

describe('isValidUKPhone', () => {
  // VALID
  test.each(['07123456789', '+447123456789', '01234567890'])
  // INVALID
  test.each(['123', 'abc', '1234', ''])
});

describe('isValidEmail', () => {
  // VALID
  test.each(['test@example.com', 'user.name@domain.co.uk'])
  // INVALID
  test.each(['no-at-sign', '@no-local', ''])
});

describe('isValidCardNumber', () => {
  // VALID (Luhn-valid test cards)
  test.each(['4111111111111111', '5500000000000004'])
  // VALID with spaces
  test('accepts spaces', () => { expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true) });
  // INVALID (Luhn-invalid)
  test.each(['1234567890123456', '123', 'abc', ''])
});

describe('isValidExpiry', () => {
  // VALID — dynamically generated future date
  test('accepts future expiry', () => {
    const futureYear = (new Date().getFullYear() + 2) % 100;
    const padded = String(futureYear).padStart(2, '0');
    expect(isValidExpiry(`12/${padded}`)).toBe(true);
  });
  // INVALID
  test.each(['01/20', '13/25', '00/25', 'abc', ''])
});

describe('isValidCVV', () => {
  // VALID
  test.each(['123', '1234', '000'])
  // INVALID
  test.each(['12', '12345', 'abc', ''])
});
```

**IMPORTANT:** The expiry test must use dynamically generated future dates. Never hardcode a date like `"12/25"` — it becomes invalid in January 2026.

### 6. Generate unit tests — images.ts (Priority: HIGH)

Create `src/lib/__tests__/images.test.ts`.

**First, read `src/lib/images.ts`** to understand the exact CDN URL regex patterns, transform token mappings, and all exported functions.

**Test cases to generate based on the actual CDN patterns found in the code:**

```
describe('toLocalImage', () => {
  // Standard CDN URL → main image
  test('standard CDN URL with small transform → main.webp')
  // Large transform
  test('large transform → large.webp')
  // Thumbnail transform
  test('thumbnail transform → thumb.webp')
  // Variant (gallery)
  test('variant _003 with large transform → gallery_003.webp')
  // Variant (thumbnail)
  test('variant _002 with thumb transform → thumb_002.webp')
  // Alternative CDN pattern
  test('alternative CDN pattern URL strips prefix and color → correct product path')
  // Unknown URL
  test('unknown URL → returns original unchanged')
  // Empty string
  test('empty string → returns empty string')
});

describe('toLocalImages', () => {
  test('converts array of CDN URLs to local paths')
  test('empty array → empty array')
});

describe('getListingImage', () => {
  test('returns /images/products/{id}/main.webp')
});

describe('getLargeImage', () => {
  test('returns /images/products/{id}/large.webp')
});

describe('getGalleryImages', () => {
  test('default count returns large + 6 gallery images (7 total)')
  test('custom count (3) returns large + 3 gallery images (4 total)')
  test('each path follows /images/products/{id}/gallery_00N.webp pattern')
});

describe('getThumbnailImages', () => {
  test('default count returns thumb + 6 thumbnails (7 total)')
  test('custom count (3) returns thumb + 3 thumbnails (4 total)')
  test('each path follows /images/products/{id}/thumb_00N.webp pattern')
});
```

Use the exact CDN URL format found in the source code. Do NOT guess the URL patterns — read `src/lib/images.ts` and copy the regex input format.

### 7. Generate unit tests — search-data.ts (Priority: MEDIUM)

Create `src/lib/__tests__/search-data.test.ts`.

**First, read `src/lib/search-data.ts`** to understand the scoring algorithm and suggestion types.

```
describe('searchProducts', () => {
  test('empty query returns empty array')
  test('whitespace-only query returns empty array')
  test('single term returns results with length > 0')
  test('multi-word query (AND logic) returns results matching all terms')
  test('no-match query returns empty array')
  test('results are sorted by relevance score (brand exact match first)')
  test('every result has name, brand, and price properties')
});

describe('getSuggestions', () => {
  test('empty query returns empty array')
  test('brand query includes suggestion with type "brand"')
  test('returns suggestions with type "product" that have price and image')
  test('limit parameter caps the result count')
  test('no duplicate suggestions')
});
```

**Caution:** These tests depend on real data from `data/scrape/` JSON files being importable. If imports fail, verify the `@data` path alias in `vitest.config.ts` matches the actual data directory.

### 8. Generate unit tests — product-data.ts and category-data.ts (Priority: MEDIUM)

**First, read both source files** to find real slugs and category keys. Never invent test slugs — use what the code actually contains.

**`src/lib/__tests__/product-data.test.ts`:**

```
describe('getProductBySlug', () => {
  test('valid slug returns ProductDetail with name, brand, price')
  test('invalid slug "nonexistent-product-99999" returns null')
});

describe('getAllProducts', () => {
  test('returns array with length > 0')
  test('every item has name, brand, and price.current as number')
});

describe('getSizeVariants', () => {
  test('product with known variants returns array with size, productId, price')
  test('product without variants returns empty array')
});
```

**`src/lib/__tests__/category-data.test.ts`:**

```
describe('getCategoryData', () => {
  test('valid category slug returns CategoryData with products array')
  test('unknown slug returns null')
});

describe('isHubCategory', () => {
  test('hub slug returns true')
  test('non-hub slug returns false')
});

// Parameterized: test every category key resolves
describe('all categories resolve', () => {
  // Read allCategorySlugs from the source and test.each
  test.each(allCategorySlugs)('"%s" resolves to non-null data')
});
```

**Finding real slugs:** Read `src/lib/category-data.ts` and extract the `categoryMap` keys or `allCategorySlugs` array. Read `src/lib/product-data.ts` to find a real product slug from the data.

### 9. Generate component tests (Priority: MEDIUM)

Create tests in `src/components/__tests__/`. Use `renderWithProviders` from `src/test/utils.tsx`.

**Read each component source file first** to understand the exact props interface.

**`src/components/__tests__/StarRating.test.tsx`:**

```
describe('StarRating', () => {
  test('renders 5 star SVGs')
  test('rating 4.5 shows correct filled/partial/empty distribution')
  test('rating 0 shows all empty stars')
  test('displays rating text when showText is true or default')
  test('displays review count when provided')
  test('has aria-label containing the rating value')
});
```

Read `src/components/ui/StarRating.tsx` to verify the props interface (`rating`, `count`, `showText`), fill color values, and `role="img"` pattern.

**`src/components/__tests__/Accordion.test.tsx`:**

```
describe('Accordion', () => {
  test('renders all section titles')
  test('all panels collapsed by default')
  test('click title → panel content appears')
  test('click same title again → panel collapses')
  test('click different title → previous collapses, new opens')
  test('keyboard: Enter toggles panel')
  test('keyboard: Space toggles panel')
});
```

Read `src/components/ui/Accordion.tsx` to verify the state pattern (`openIndex` or similar) and the exact props shape.

**`src/components/__tests__/PricePanel.test.tsx`:**

```
describe('PricePanel', () => {
  test('displays current price with £ symbol')
  test('displays "Was" price when wasPrice is provided')
  test('displays savings when savings is provided')
  test('hides "Was" section when wasPrice is null')
  test('"Add to basket" button renders and calls onAddToBasket on click')
});
```

Read `src/components/product/PricePanel.tsx` for the exact props.

**`src/components/__tests__/ProductGallery.test.tsx`:**

```
describe('ProductGallery', () => {
  test('renders main image')
  test('renders thumbnail strip')
  test('clicking a thumbnail updates the main image src')
  test('first thumbnail is active by default')
});
```

Read `src/components/product/ProductGallery.tsx` for image switching logic.

**`src/components/__tests__/DeliveryStep.test.tsx`** (Priority: HIGH — highest-value checkout component):

```
describe('DeliveryStep', () => {
  test('renders all delivery form fields (title, first name, last name, phone, postcode, address)')
  test('displays validation errors for empty required fields on submit')
  test('accepts valid UK postcode and phone number')
  test('rejects invalid postcode format')
  test('calls onComplete callback with form data when all fields are valid')
});
```

Read `src/components/checkout/DeliveryStep.tsx` for the exact props interface, field names, and validation logic.

### 10. Generate integration tests — Context providers (Priority: MEDIUM)

**Must clear localStorage before each test** to prevent the default seeded data from interfering.

**`src/lib/__tests__/basket-context.test.tsx`:**

Create a test component that uses `useBasket()` and renders basket state. Wrap with `<BasketProvider>`.

```
describe('BasketProvider', () => {
  beforeEach(() => localStorage.clear());

  test('initial state after localStorage clear: empty basket')
  test('addItem → itemCount increases by 1')
  test('addItem same product twice → quantity increases, not duplicate entry')
  test('removeItem → item disappears, itemCount decreases')
  test('updateQuantity to 0 → item removed')
  test('updateQuantity to 5 → item quantity is 5')
  test('applyPromo → promoCode set, total reduced by discount')
  test('clearBasket → items empty, totals zero')
  test('free delivery: subtotal >= 40 → deliveryCost === 0')
  test('paid delivery: subtotal < 40 → deliveryCost === 5')
  test('persists to localStorage on add')
});
```

Read `src/lib/basket-context.tsx` to verify the exact threshold (40), delivery cost (5), `calculateTotals` logic, and `HYDRATE` action.

**`src/lib/__tests__/saved-context.test.tsx`:**

```
describe('SavedProvider', () => {
  beforeEach(() => localStorage.clear());

  test('addSaved → savedCount increases')
  test('addSaved duplicate → count unchanged')
  test('removeSaved → count decreases')
  test('isSaved returns true for saved items')
  test('isSaved returns false for unsaved items')
});
```

**`src/lib/__tests__/orders-context.test.tsx`:**

```
describe('OrdersProvider', () => {
  beforeEach(() => localStorage.clear());

  test('addOrder → appears in orders list')
  test('getOrder by orderNumber → returns correct order')
  test('getOrder with unknown number → returns undefined')
  test('updateOrderStatus → status changes')
});
```

### 11. Generate E2E tests with Playwright (Priority: HIGH)

Create the `e2e/` directory with 7 spec files.

**Before writing any spec:** Read `src/lib/category-data.ts` to find real category slugs. Read `src/lib/product-data.ts` to understand how product slugs are formed. Never hardcode product names — use CSS selectors to find "the first product" in a listing.

**`e2e/homepage.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads with correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/); // Non-empty title
  });

  test('hero carousel is visible', async ({ page }) => {
    await page.goto('/');
    // Adjust selector to match actual hero component
    await expect(page.locator('[data-testid="hero-carousel"], .hero-carousel, section').first()).toBeVisible();
  });

  test('category grid renders cards', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('a[href*="/{section-slug}/"]');
    await expect(cards.first()).toBeVisible();
  });

  test('navigation links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});
```

Replace `{section-slug}` with the actual primary section slug from the project's route structure (found in `src/lib/category-data.ts`).

**`e2e/category.spec.ts`:**

```
test.describe('Category Page', () => {
  test('products load in grid')
  test('product cards show name, price, and image')
  test('filter sidebar is visible on desktop viewport')
  test('applying a brand filter changes product count')
  test('sort dropdown changes product order')
});
```

Navigate to the first category slug found in the route structure.

**`e2e/product-detail.spec.ts`:**

```
test.describe('Product Detail', () => {
  test('clicking a product from category → product page loads')
  test('product title, price, and gallery are visible')
  test('clicking "Add to basket" → basket count in header increments')
});
```

Find the first product link in a category page, click it, then verify the detail page.

**`e2e/search.spec.ts`:**

```
test.describe('Search', () => {
  test('typing in search input shows suggestions')
  test('clicking a suggestion navigates to correct page')
  test('submitting search shows results page with products')
});
```

Use a generic search term found in the data (read a brand name from the first product in any category).

**`e2e/basket.spec.ts`:**

```
test.describe('Basket', () => {
  test('add product → navigate to /basket → product visible')
  test('update quantity → total recalculates')
  test('remove item → item disappears')
  test('"Continue to checkout" button navigates to checkout')
});
```

**`e2e/checkout.spec.ts`:**

```
test.describe('Checkout', () => {
  test('complete checkout flow: delivery → customer → payment → confirmation', async ({ page }) => {
    // 1. Add a product to basket first
    // 2. Navigate to checkout
    // 3. Fill delivery: Mr, John, Smith, 07123456789, SW1A 1AA, 10 Downing Street, London
    // 4. Fill customer: test@example.com
    // 5. Fill payment: 4111111111111111, future expiry, 123
    // 6. Click "Place Order"
    // 7. Verify confirmation page with order number
  });
});
```

Use test card `4111111111111111` (Visa test number) with a dynamically generated future expiry.

**`e2e/admin.spec.ts`:**

```
test.describe('Admin Dashboard', () => {
  test('dashboard page loads')
  test('stats cards render with numbers')
  test('orders table renders with rows')
});
```

### 12. Update package.json scripts

Read `package.json` and add test scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:chromium": "playwright test --project=chromium"
  }
}
```

Do not overwrite existing scripts — merge these in alongside `dev`, `build`, `start`, `lint`.

### 13. Run all tests and verify green

After generating all test files:

1. Run `npm test` — all unit and component tests must pass
2. Run `npm run test:e2e -- --project=chromium` — all E2E tests must pass against dev server
3. Fix any failures immediately — do NOT leave red tests

If a test fails because the implementation has a genuine bug (e.g., validation returns wrong result for an edge case), adjust the test expectation to match current behavior. Note the bug in the report but do not leave red tests.

### 14. Output test report

```markdown
## Test Generation Report

Generation date: [timestamp]

### Infrastructure

| Package | Version | Status |
|---------|---------|--------|
| vitest | X.X.X | Installed |
| @testing-library/react | X.X.X | Installed |
| @playwright/test | X.X.X | Installed |
| @vitest/coverage-v8 | X.X.X | Installed |

Config files created:
- vitest.config.ts
- playwright.config.ts
- src/test/setup.ts
- src/test/utils.tsx
- src/test/mocks/next-navigation.ts

### Test Files Generated

| Category | Files | Tests | Pass | Fail |
|----------|-------|-------|------|------|
| Unit — validation | 1 | X | X | 0 |
| Unit — images | 1 | X | X | 0 |
| Unit — search | 1 | X | X | 0 |
| Unit — product-data | 1 | X | X | 0 |
| Unit — category-data | 1 | X | X | 0 |
| Component — StarRating | 1 | X | X | 0 |
| Component — Accordion | 1 | X | X | 0 |
| Component — PricePanel | 1 | X | X | 0 |
| Component — ProductGallery | 1 | X | X | 0 |
| Integration — basket | 1 | X | X | 0 |
| Integration — saved | 1 | X | X | 0 |
| Integration — orders | 1 | X | X | 0 |
| E2E — homepage | 1 | X | X | 0 |
| E2E — category | 1 | X | X | 0 |
| E2E — product detail | 1 | X | X | 0 |
| E2E — search | 1 | X | X | 0 |
| E2E — basket | 1 | X | X | 0 |
| E2E — checkout | 1 | X | X | 0 |
| E2E — admin | 1 | X | X | 0 |
| **Total** | **19** | **X** | **X** | **0** |

### Coverage Summary (Unit + Component + Integration)

| Area | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| src/lib/validation.ts | X% | X% | 100% | X% |
| src/lib/images.ts | X% | X% | 100% | X% |
| src/lib/search-data.ts | X% | X% | X% | X% |
| Overall | X% | X% | X% | X% |

### File Structure

src/test/
  setup.ts
  utils.tsx
  mocks/
    next-navigation.ts
src/lib/__tests__/
  validation.test.ts
  images.test.ts
  search-data.test.ts
  product-data.test.ts
  category-data.test.ts
  basket-context.test.tsx
  saved-context.test.tsx
  orders-context.test.tsx
src/components/__tests__/
  StarRating.test.tsx
  Accordion.test.tsx
  PricePanel.test.tsx
  ProductGallery.test.tsx
e2e/
  homepage.spec.ts
  category.spec.ts
  product-detail.spec.ts
  search.spec.ts
  basket.spec.ts
  checkout.spec.ts
  admin.spec.ts

Verdict: [PASS: all tests green / FAIL: X tests failing]
```

---

## Critical Rules

- **All tests must pass on first run.** Never generate a test you know will fail. If the implementation has a quirk, match the test to the implementation. File bugs separately.
- **Use real data, not fabricated fixtures.** Import from the same JSON data files the app uses. If `searchProducts` returns 0 results in a test but 50 in the app, the test import chain is broken.
- **Mock localStorage, not the context providers.** Test the real provider logic — mock only the browser APIs (localStorage, window) that don't exist in jsdom.
- **Clear localStorage before each test.** The `BasketProvider` and `SavedProvider` hydrate from localStorage on mount. Leftover state between tests causes flaky failures. The `afterEach` in `setup.ts` handles this globally, but integration tests should also clear in `beforeEach` for clarity.
- **E2E tests must not depend on specific product data.** Use CSS selectors and structural patterns to find "the first product" — never hardcode a product name that might change when data is re-scraped.
- **Dynamic expiry dates in validation tests.** Never hardcode `"12/25"` as a valid expiry — it becomes invalid in January 2026. Calculate a future date programmatically.
- **Playwright auto-waits — don't add sleep().** `page.click`, `page.fill`, and `expect(locator).toBeVisible()` all auto-wait. Adding `page.waitForTimeout(5000)` hides real performance issues.
- **One test file per source file.** `validation.ts` gets `validation.test.ts`. Never bundle unrelated tests into one file.
- **Test behavior, not implementation.** Assert what the user sees — "price displays as £299", not "state.items[0].product.price.current === 299".
- **Never delete `.next/` while the dev server is running for E2E tests.** This causes `__webpack_modules__` errors that look like test failures. Always: kill server, clear `.next/`, restart, then run E2E.
