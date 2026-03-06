Build out the full admin dashboard — authentication, order management, product catalog, customer directory, analytics, and content management. Enhances the existing admin pages (dashboard, orders, products, customers) and their 10 reusable components to add full CRUD, auth, analytics, and content management.

**Pipeline position:** 15/32 — depends on: `/scaffold-project`, `/security-audit` | feeds into: `/smoke-test`, `/link-check`

**Usage:** `/build-admin` — builds all admin sections

Optionally: `/build-admin <section>` where `$ARGUMENTS` is a specific section to build: `auth`, `orders`, `products`, `customers`, `analytics`, `content`. Omit to build all sections in sequence.

---

## Golden Rule

**The admin must be functional, secure, and complete.** Every data entity (orders, products, customers) must have full CRUD operations. Every admin route must be protected by authentication. Every table must be searchable, sortable, and paginated.

---

## Prerequisites

- Existing admin pages at `src/app/admin/` (dashboard, orders/, products/, customers/ already have content)
- Admin components in `src/components/admin/` (DataTable, StatsCard, StatusBadge, etc.)
- Context providers for orders, basket, saved items in `src/lib/`
- Run `/security-audit auth` first — the report's Check 3 (Auth & Access Control) lists every unprotected route that the auth implementation must address

---

## Existing Admin Components to Reuse

Before building new features, leverage existing components:

- `src/components/admin/DataTable.tsx` — reusable table with headers, rows, hover states
- `src/components/admin/Pagination.tsx` — page navigation with prev/next
- `src/components/admin/SearchInput.tsx` — debounced search input
- `src/components/admin/StatsCard.tsx` — metric card (count + label)
- `src/components/admin/StatusBadge.tsx` — colored status label
- `src/components/admin/StatusSelect.tsx` — dropdown for status changes
- `src/components/admin/EmptyState.tsx` — "no results" placeholder
- `src/components/admin/ProductImage.tsx` — product image with fallback. **KNOWN ISSUE:** Its `extractProductId()` regex may not handle CDN variant-format product IDs. Instead of re-implementing regex logic, import and use `toLocalImage()` from `src/lib/images.ts` which already handles all CDN patterns (standard, variant, M-prefix). This avoids duplicated regex that drifts out of sync.
- `src/components/admin/AdminHeader.tsx` — admin header bar
- `src/components/admin/AdminSidebar.tsx` — admin side navigation

---

## Sections to Build

### Section 1: Authentication

**Files to create/modify (not yet implemented — these files do not exist yet and must be created from scratch):**
- `src/app/admin/login/page.tsx` — login form (does not exist yet)
- `src/middleware.ts` — route protection for `/admin/*` (does not exist yet)
- `src/lib/admin-auth.ts` — auth utilities (validate, session, logout) (does not exist yet)

**Implementation:**
1. Create login page with email/password form
2. Create `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` (default: `admin@yourclone.example` / `admin123`). These variables do NOT exist yet — also add them to `.env.example` with placeholder values.
3. On successful login, set an auth token in localStorage (demo-appropriate — no real backend for httpOnly cookies). Store a JSON object: `{ token, expiresAt }`.
4. Add Next.js middleware to check for auth token on all `/admin/*` routes (except `/admin/login`)
5. Redirect unauthenticated users to `/admin/login`
6. Add logout button to `AdminHeader.tsx`
7. Session expires after 24 hours

**Verify:** Navigate to `/admin` without logging in → should redirect to `/admin/login`. Log in → should access dashboard. Log out → should redirect to login.

### Section 2: Orders Management

**Files to create/modify:**
- `src/app/admin/orders/page.tsx` — orders list (enhance existing)
- `src/app/admin/orders/[orderNumber]/page.tsx` — order detail (enhance existing)

**Orders list page:**
- Full order table using `DataTable` component
- Columns: Order #, Date, Customer, Items, Total, Status, Actions
- Search by order number, customer name, or email
- Filter by status (All, Confirmed, Processing, Dispatched, Delivered)
- Filter by date range (Today, This Week, This Month, Custom)
- Sort by date (newest first default), total, status
- Pagination (20 per page)
- Bulk actions: select multiple → update status, export CSV

**Order detail page:**
- Order summary card (number, date, total, status)
- Status timeline showing order progression
- Customer info section (name, email, phone, address)
- Line items table (product image, name, quantity, unit price, subtotal)
- Status update dropdown (using `StatusSelect`)
- Notes section (text area for internal notes)
- Back button to orders list

### Section 3: Product Management

**Files to create/modify:**
- `src/app/admin/products/page.tsx` — product catalog (enhance existing)
- `src/app/admin/products/[slug]/page.tsx` — product detail (enhance existing)

**Product catalog page:**
- Product grid/list with `ProductImage` thumbnails
- Search by product name, ID, or brand
- Filter by category (dropdown of all categories from `categoryMap`)
- Filter by price range (min/max sliders or inputs)
- Filter by availability (in stock / out of stock)
- Sort by name, price, rating, category
- Toggle grid/list view
- Pagination (24 per page)
- Quick stats bar: total products, categories, average price

**Product detail page:**
- Hero section: large image gallery + key info (name, ID, price, brand)
- Editable fields: price (current + was-price), description, availability
- Specifications table (read-only, from scraped data)
- Image gallery management (view all images, see which exist on disk)
- Cross-sell products list
- Category assignment
- Save changes button (updates component state and localStorage — Next.js cannot write to `data/scrape/` files from the browser at runtime. Edits persist via localStorage across sessions but do NOT modify source JSON files.)
- Link to live product page: "View on site →"

### Section 4: Customer Management

**Files to create/modify:**
- `src/app/admin/customers/page.tsx` — customer directory (enhance existing)
- `src/app/admin/customers/[email]/page.tsx` — customer detail (enhance existing)

**Customer directory:**
- Derive customer list from all orders (deduplicate by email)
- Table columns: Name, Email, Phone, Orders Count, Total Spent, Last Order
- Search by name, email, or phone
- Sort by name, total spent, last order date
- Pagination (20 per page)

**Customer detail:**
- Customer info card (name, email, phone, address from most recent order)
- Order history table (all orders by this customer)
- Stats: total orders, total spent, average order value
- Timeline of all interactions (order placed, status changes)

### Section 5: Analytics Dashboard

**Files to modify:**
- `src/app/admin/page.tsx` — enhance existing dashboard

**Enhancements:**
- **Revenue chart:** Line/bar chart showing daily revenue for last 30 days (derive from order dates)
- **Orders chart:** Daily order count for last 30 days
- **Top products:** Top 10 most ordered products (by quantity)
- **Category breakdown:** Pie/bar chart of orders by product category
- **KPI cards** (enhance existing): Total Revenue, Orders Today, Avg Order Value, Total Customers
- **Recent activity feed:** Last 10 order events (placed, status changed)
- **Quick date filters:** Today, 7 days, 30 days, All time

**Chart implementation:** Use basic SVG charts or a lightweight library. Don't add heavy charting dependencies — CSS/SVG bar charts and sparklines are sufficient for demo data.

### Section 6: Content Management

**Files to create:**
- `src/app/admin/content/page.tsx` — content management hub
- `src/app/admin/content/announcements/page.tsx` — announcement bar editor
- `src/app/admin/content/hero/page.tsx` — hero carousel manager
- `src/app/admin/content/banners/page.tsx` — promotional banner toggle

**Announcement bar:**
- Current text display with edit button
- Text input field + save button
- Toggle on/off (hide/show announcement bar)
- Preview of how it looks on the site

**Hero carousel:**
- List of current slides with thumbnails
- Reorder slides (drag or up/down buttons)
- Toggle individual slides on/off
- Preview slide appearance

**Promotional banners:**
- List of all banner sections across the site
- Toggle each on/off
- Preview banner content

---

## Design Guidelines

- **Reuse existing components.** Every admin section should use `DataTable`, `SearchInput`, `Pagination`, `StatsCard`, `StatusBadge`, and `EmptyState`. Don't create duplicate components.
- **Consistent layout.** All pages use `AdminHeader` + `AdminSidebar` + main content area. The sidebar should have links to all sections (Dashboard, Orders, Products, Customers, Content).
- **Responsive admin.** Admin should work at desktop (1280px+) and tablet (768px+). Mobile admin is nice-to-have, not required.
- **Loading states.** Show skeleton loaders while data loads. Use `EmptyState` when no results match filters.
- **Tailwind styling.** Match the existing admin design tokens. Use the existing card, table, and input styles from admin components.

---

## Output

After building each section, verify:

```
## Admin Build Report

### Authentication
- Login page: [built/missing]
- Middleware protection: [active/missing]
- Logout: [working/missing]
- Session expiry: [configured/missing]

### Orders
- List page: [built/missing] — features: [search, filter, sort, pagination, bulk actions]
- Detail page: [built/missing] — features: [status update, timeline, notes]
- Test: Create order → view in admin → update status → verify

### Products
- Catalog page: [built/missing] — features: [search, filter, sort, pagination, grid/list]
- Detail page: [built/missing] — features: [edit price, view specs, image gallery]
- Test: Browse products → edit price → save → verify

### Customers
- Directory page: [built/missing] — features: [search, sort, pagination]
- Detail page: [built/missing] — features: [order history, stats]
- Test: Find customer → view order history → verify

### Analytics
- Revenue chart: [built/missing]
- Top products: [built/missing]
- Category breakdown: [built/missing]
- Date filters: [built/missing]

### Content
- Announcement editor: [built/missing]
- Hero carousel manager: [built/missing]
- Banner toggles: [built/missing]

Pages built: X/Y
Components reused: X
New components created: X
```

**Verification:** After building, run `/smoke-test` (Navigation flow to verify admin routes), `/link-check /admin` to catch broken admin links, and `/security-audit auth` to verify the authentication implementation.

---

## Critical Rules

- **Auth first.** Always build authentication before any other section. An unprotected admin with CRUD operations is a critical security risk.
- **Reuse, don't rebuild.** Check existing `src/components/admin/` components before creating new ones. The DataTable, SearchInput, and Pagination components handle most listing page needs.
- **Data comes from existing contexts.** Orders come from `useOrders()`, products from `product-data.ts`, categories from `category-data.ts`. Don't create new data sources — work with what exists.
- **Client-side editing is fine for demo.** Product edits can update local state or localStorage. This is a demo admin, not a production CMS. Don't build a real database backend.
- **SVG charts, not chart libraries.** For analytics, use inline SVG bar charts and CSS progress bars. Adding Chart.js or Recharts for a demo admin is over-engineering.
- **Section-by-section verification.** After building each section, test it end-to-end before moving to the next. Don't build all 6 sections then debug them all at once.
- **Match existing admin styling.** The existing dashboard has a specific look (card shadows, table styles, color palette). New pages must match exactly.
- **Sidebar navigation must update.** After adding new pages, update `AdminSidebar.tsx` with links to all new routes.
