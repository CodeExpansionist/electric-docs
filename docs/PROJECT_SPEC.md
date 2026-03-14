# Visual Reference Map

> **Authority:** Reference — code-level truth is `reference-screenshots/`. This document maps screenshots to pages and sections for visual verification.

## Reference Screenshots

Annotated screenshots in `reference-screenshots/` are the visual source of truth for fidelity checks.

| File | Page | What It Shows |
|------|------|---------------|
| `01-homepage-hero.png` | Homepage | Announcement bar, secondary nav, header, main nav, USP bar, hero carousel, credit bar, shop deals carousel |
| `02-homepage-offers.png` | Homepage | "Discover our amazing offers" 4-card carousel, "Big brand deals" 4-card carousel |
| `03-homepage-products-footer.png` | Homepage | Sponsored products row, Perks banner, full footer (5 columns), sub-footer with legal/social links |
| `04-tv-audio-hub-top.png` | TV & Audio Hub | Breadcrumbs, title, subcategory icon row, top categories sidebar, top deals cards, AI on TV articles |
| `05-tv-audio-hub-mid.png` | TV & Audio Hub | Sidebar continued, Filmmaker Mode promo with video, buying guides, TV size tool |
| `06-tv-audio-hub-bottom.png` | TV & Audio Hub | Promo banner carousel, brand row with CTAs, SEO content, credit bar, news cards |
| `07-category-listing-full.png` | Category Listing | Promo banner, sort/filter bar, product list view with full card layout |
| `08-category-filters.png` | Category Listing | Full filter sidebar: all filter groups, toggle switches, collapsible sections |
| `09-product-page-top.png` | Product Page | Title, rating, gallery with thumbnails, key specs, price panel, screen size selector |
| `10-product-page-mid.png` | Product Page | Sticky header bar, delivery info, Care & Repair upsell, essential services, cross-sell cards |
| `11-product-page-bottom.png` | Product Page | Bundle section, product information (expanded), specs/reviews/delivery (collapsed) |
| `12-basket.png` | Basket | Items list, Care & Repair plans, installation/recycling checkboxes, order summary sidebar |
| `13-checkout-welcome.png` | Checkout | Simplified header, sign in / continue as guest, sidebar basket summary, step list |
| `14-checkout-delivery-empty.png` | Checkout | Delivery form: title, name, phone, postcode, "Find address" button |
| `15-checkout-delivery-filled.png` | Checkout | Filled delivery form with expanded address fields, "Use this address" CTA |
| `16-checkout-signin-modal.png` | Checkout | Modal: email input, "Continue" button, "Continue as guest" alternative |
| `17-checkout-customer-details.png` | Checkout | Email, billing details, marketing preferences, completed delivery step with green checkmark |
| `18-checkout-payment.png` | Checkout | Card/Apple Pay vs PayPal toggle, promo code section, completed steps 1-2 |

## Page Inventory

### 1. Homepage (`/`)

**Screenshots:** `01`, `02`, `03`

Sections (top to bottom): Announcement bar, secondary nav, header, main nav, USP bar, hero carousel, credit bar, shop deals icons, offers carousel, brand deals carousel, sponsored products, Perks banner, footer, sub-footer.

### 2. TV & Audio Hub (`/tv-and-audio`)

**Screenshots:** `04`, `05`, `06`

Two-column layout: persistent left sidebar (top categories, popular links, buying guides, news) + main content (subcategory icons, top deals, AI articles, Filmmaker Mode promo, buying guides, TV size tool, promo banners, brand row, SEO content).

### 3. Category Listing (`/tv-and-audio/[category]`)

**Screenshots:** `07`, `08`

Two-column layout: filter sidebar (left) + product listing (right) with sort bar, list/grid toggle, product cards.

### 4. Product Detail (`/products/[slug]`)

**Screenshots:** `09`, `10`, `11`

Gallery + price panel, delivery info, cross-sell cards, bundle section, collapsible info sections (product info, specs, reviews, delivery & returns).

### 5. Basket (`/basket`)

**Screenshot:** `12`

Items list, Care & Repair upsell (3 plan options), installation/recycling services, order summary sidebar.

### 6. Checkout (`/checkout/[step]`)

**Screenshots:** `13`–`18`

Simplified header (logo + "Secure checkout"). Welcome → Delivery → Customer details → Payment → Confirmation. Completed steps show green checkmark + summary. All flows are simulated.

### 7. Footer Pages (`/[slug]`)

Static content pages linked from footer. Visible in `03`.

## Quality Benchmarks

- **Visual fidelity:** Each section should be indistinguishable from the reference screenshots at a glance.
- **Responsive:** Must match reference behavior at mobile (375px), tablet (768px), and desktop (1280px+).
- **Interactions:** Hover states, dropdown menus, carousels, filter toggles — all must match.
- **Performance:** Page load under 3 seconds on simulated 4G.
- **Forms:** All checkout forms must validate inputs (email format, required fields, UK postcode format, card number format).
