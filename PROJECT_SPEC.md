# Electric — Curry's TV & Audio Clone: Project Specification

## Overview

High-fidelity, pixel-perfect clone of Curry's TV & Audio section (currys.co.uk). This serves as an MVP baseline for future A/B testing. All Curry's branding, images, and content are used as placeholders for visual fidelity during development.

**Repo:** github.com/CodeExpansionist/electric
**Stack:** Next.js 14 (App Router) + Tailwind CSS
**Data:** Firecrawl MCP scrape of currys.co.uk → static JSON files
**Checkout:** Form validation + mock data (no real payments)

---

## CRITICAL: Visual Reference Screenshots

Reference screenshots of every major page and section are in `reference-screenshots/`. These are the single source of truth for visual fidelity. **Your build output must match these screenshots pixel-for-pixel.**

### Screenshot Index

| File | Page | What It Shows |
|------|------|---------------|
| `01-homepage-hero.png` | Homepage | Full homepage top: announcement bar (teal, white text), secondary nav links (Help & Support, Track my order, Delivery, Returns, etc.), header with Curry's purple logo, search bar with purple search icon, utility icons (Stores, Account, Saved, Basket), main nav (Appliances, TV & Audio, Computing, Gaming, etc.), USP bar (free order & collect, price match, recycling, flexpay), hero carousel (3 large promotional banners: Epic Deals, Recycling, Samsung Galaxy S26), credit representative example bar, Shop deals category carousel (Mobile phones, TVs, Laptops, etc.) |
| `02-homepage-offers.png` | Homepage | "Discover our amazing offers" section: 4-card horizontal carousel with left/right arrows, cards have product images on colored backgrounds with text overlay (Samsung Galaxy S26, Galaxy Book6 Pro, Samsung appliances, Galaxy Buds4 Pro). "Big brand deals" section below: 4-card carousel (iPhone Air, Dyson, LG OLED, hair & beauty tech), each card has brand logo at top, product image center, promotional text with red highlight text for savings |
| `03-homepage-products-footer.png` | Homepage | "Sponsored products" section: 6 product cards in a horizontal row, each with product image, star rating (e.g. 4.8/5), review count link, product title, price in bold, red "Save £X" text. "Join Currys Perks" dark charcoal banner with centered white text and "Sign me up" CTA button with rounded border. Full footer: dark charcoal background, 5 columns (Help & support, Services, Care Services, Our websites, About us) with white text links. Sub-footer: lighter gray bar with Privacy & cookies policy, Terms & conditions, Product recalls, Sitemap links separated by pipes, social media icons (Facebook, X, Instagram, YouTube), legal text |
| `04-tv-audio-hub-top.png` | TV & Audio Hub | Breadcrumbs (Home > TV & Audio), page title "TV & Audio" in large bold text, subcategory icon row (7 circular icons: Televisions, DVD/Blu-ray & home cinema, Soundbars, HiFi & Speakers, TV accessories, Digital & smart TV, Headphones — each with product silhouette icon and label below). "Top categories" left sidebar with pill-shaped links (TVs, Airpods, Headphones and earphones, Smart TVs, Wireless headphones, DAB radios, Soundbars). "Top deals" section: 4 promotional cards (Shop selected LG TVs with cashback, Samsung TVs & soundbars, 75"+ TVs, Galaxy Buds4 Pro). "AI on TV. The next big thing!" section: 3 article cards (Subtitling, AI sound, AI picture) with lifestyle images |
| `05-tv-audio-hub-mid.png` | TV & Audio Hub | Continued left sidebar: "Popular links" section, "Buying guides" section, "News and reviews" section. Main content: "Filmmaker Mode" promotional block with video embed (Mark Kermode in cinema), "Shop now" CTA. "Buying guides" visual cards: 3 circular icon cards. "Find your perfect TV size" interactive tool: distance input (cm/in toggle), TV size carousel |
| `06-tv-audio-hub-bottom.png` | TV & Audio Hub | Promotional banner carousel (3 banners). Brand row: Samsung, LG, Panasonic, Sony, Hisense, Bose logos with CTAs. SEO content: 3-column text block. Representative example credit bar. Article cards: 3 news cards |
| `07-category-listing-full.png` | Category Listing (TVs) | Full category listing page layout. Samsung promotional banner, sort/filter bar, product list view with 2 products showing full card layout (image, specs, price, tags, badges, CTAs) |
| `08-category-filters.png` | Category Listing (TVs) | Full filter sidebar detail. All filter groups: Delivery and Collection, Customer Rating, Type, By Price, Screen Size, Brand, Sound enhancement, Smart TV apps, Screen technology, Picture & contrast enhancement |
| `09-product-page-top.png` | Product Page | Product title, star rating, gallery with thumbnails, key spec icons, price panel with savings, flexpay section, offers, screen size selector pills, wall bracket upsell |
| `10-product-page-mid.png` | Product Page | Sticky header bar, delivery/collection info, Care & Repair upsell, essential services checkboxes, cross-sell product cards |
| `11-product-page-bottom.png` | Product Page | "Buy together and save" bundle section, Product information (expanded), Specifications/Reviews/Delivery & returns (collapsed) |
| `12-basket.png` | Basket Page | "Your basket (2 items)", basket item with image/price/quantity, Care & Repair upsell with 3 plan options, Installation and Recycling checkboxes with prices, Order summary sidebar with flexpay |
| `13-checkout-welcome.png` | Checkout | Simplified header (logo + "Secure checkout"). "Welcome!" with "Sign in or Create an account" (purple filled) and "Continue as guest" (purple outlined) buttons. Right sidebar basket summary. Numbered step list (1. Delivery options, 2. Customer details, 3. Payment methods) |
| `14-checkout-delivery-empty.png` | Checkout | Step 1 Delivery: "We'll deliver it" / "Collect it" radio toggle. Delivery form with Title, First name, Last name, Phone, Postcode, "Find address" button. Right sidebar basket summary |
| `15-checkout-delivery-filled.png` | Checkout | Same as 14 but form filled: Mr John Smith, phone, postcode NW1 0AE. Expanded address fields: Address 1, Address 2, Town/City, County. "Use this address" purple CTA |
| `16-checkout-signin-modal.png` | Checkout | Modal overlay "Welcome" with X close. "Sign in or create an account" heading. Email address input field. "Continue" purple filled button. "OR" divider. "Continue as guest" purple outlined button. Background shows checkout page blurred |
| `17-checkout-customer-details.png` | Checkout | Step 2 Customer details (expanded). Step 1 Delivery options completed (green checkmark, delivery summary shown: "Arriving Mon 02 Mar, All day 7am-8pm – £20.00", product name, "Delivering to" address). Email input field with "Please enter your email to receive your order confirmation". "Billing details" pre-filled from delivery. "Use my delivery details as my billing details" checkbox (checked). Contact consent note. "Let's stay in touch!" section: Join Currys Perks with Email and SMS checkboxes (both checked). Terms & Conditions link. Privacy promise text. "Continue to payment" purple CTA. Right sidebar: basket summary with Subtotal £1,199.00, Delivery £20.00, Total £1,219.00 |
| `18-checkout-payment.png` | Checkout | Step 3 Payment methods (expanded). Steps 1 & 2 completed (green checkmarks with summaries). "Add a discount/promo code or gift card" expandable section. Payment method toggle: "Card / Apple Pay" (radio selected, with Apple Pay, Amex, Visa, Mastercard, Maestro card icons) vs "PayPal" (radio with PayPal logo). "The button below takes you to a new, secure payment page" note. "Continue to payment" purple CTA. Right sidebar: same basket summary |

### How to Use These Screenshots

1. **Before building any section**, open the corresponding screenshot(s) from `reference-screenshots/`
2. **Compare your output to the screenshot** after building each section — take a screenshot of your local dev server and overlay/compare
3. **Pay attention to these commonly-missed details visible in the screenshots:**
   - The Curry's purple (#2D0A6E approximate) used in the logo, buttons, and nav highlights
   - The teal/green announcement bar at the very top
   - Rounded pill-shaped category links with subtle borders and chevron arrows
   - Red text for sale prices and savings amounts
   - Purple filled buttons ("Add to basket") vs purple outlined buttons ("View product", "Shop now")
   - Star ratings use gold/amber filled stars
   - The "Epic Deal" tags are red with white text
   - Product cards in list view are horizontal with image left, specs center, price/actions right
   - Filter sidebar has specific toggle switch styling, collapsible sections with chevrons
   - Brand logos are displayed at original brand styling (not colored Curry's purple)
   - Footer is dark charcoal (#333 approximate) with white text, not black
   - Checkout uses simplified header (logo + "Secure checkout" only, NO main navigation)
   - Completed checkout steps show green checkmark + summary, with "Edit" link
   - Payment section shows card brand icons (Apple Pay, Amex, Visa, Mastercard, Maestro)

---

## Phase 0: Scrape & Extract (Firecrawl MCP)

Before writing any code, use Firecrawl MCP to scrape the following URLs and save the output as structured JSON in `/data/scrape/`. Cross-reference the scrape data with the reference screenshots to ensure nothing is missed.

### URLs to Scrape

1. **Homepage:** `https://www.currys.co.uk`
   - Extract: header/nav structure, hero banners, promotional grids, featured categories, footer (all sections and links)
   - Save as: `data/scrape/homepage.json`
   - **Reference:** `01-homepage-hero.png`, `02-homepage-offers.png`, `03-homepage-products-footer.png`

2. **TV & Audio Hub:** `https://www.currys.co.uk/tv-and-audio`
   - Extract: category grid, subcategory links, promotional banners, breadcrumb structure, left sidebar navigation, buying guides, interactive tools
   - Save as: `data/scrape/tv-audio-hub.json`
   - **Reference:** `04-tv-audio-hub-top.png`, `05-tv-audio-hub-mid.png`, `06-tv-audio-hub-bottom.png`

3. **Category Listing (TVs):** `https://www.currys.co.uk/tv-and-audio/televisions`
   - Extract: filter sidebar (all filter groups + options), product grid (all products), sort options, pagination structure, product card data (name, price, image URL, rating, specs summary), promotional banners, product badges/tags
   - Save as: `data/scrape/category-tvs.json`
   - **Reference:** `07-category-listing-full.png`, `08-category-filters.png`

4. **Product Page (pick any TV):** Follow the first product link from the category page
   - Extract: image gallery, product title, price block, specs table, description, reviews section, delivery info, "add to basket" UI, breadcrumbs, cross-sell/upsell sections
   - Save as: `data/scrape/product-example.json`
   - **Reference:** `09-product-page-top.png`, `10-product-page-mid.png`, `11-product-page-bottom.png`

5. **Basket Page:** `https://www.currys.co.uk/basket` (may be empty/blocked — scrape what's available)
   - Extract: line item layout, quantity controls, subtotal/total structure, promo code input, proceed to checkout CTA
   - Save as: `data/scrape/basket.json`
   - **Reference:** `12-basket.png`

6. **Footer Pages:** Scrape every unique link from the footer
   - Extract: page content, headings, layout structure
   - Save as: `data/scrape/footer-pages/[slug].json`
   - **Reference:** Footer visible in `03-homepage-products-footer.png`

### Design Token Extraction

From the scrape output AND the reference screenshots, extract and document in `data/design-tokens.json`.

**Values visible in the screenshots (use these as starting points, verify with scrape):**

```json
{
  "colors": {
    "primary": "#2D0A6E",
    "primaryLight": "#7B2BFC",
    "announcement": "#007D8A",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": {
      "primary": "#1A1A1A",
      "secondary": "#666666",
      "muted": "#999999",
      "inverse": "#FFFFFF"
    },
    "border": "#E0E0E0",
    "error": "#CC0000",
    "success": "#008A00",
    "sale": "#CC0000",
    "tagEpicDeal": "#CC0000",
    "footer": "#333333",
    "ratingStars": "#E8A317",
    "ctaPrimary": "#7B2BFC",
    "ctaOutline": "#7B2BFC",
    "checkoutComplete": "#008A00"
  },
  "typography": {
    "fontFamily": {
      "heading": "___",
      "body": "___"
    },
    "sizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "32px"
    },
    "weights": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    }
  },
  "spacing": {
    "containerMaxWidth": "1280px",
    "containerPadding": "16px",
    "sectionGap": "32px",
    "cardGap": "16px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "24px",
    "pill": "9999px"
  },
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  }
}
```

**IMPORTANT:** The values above are approximations from the screenshots. After scraping, verify and replace with exact values from the CSS. The font families in particular MUST come from the scrape — do not guess.

---

## Page Inventory

### 1. Homepage (`/`)

**Reference screenshots:** `01-homepage-hero.png`, `02-homepage-offers.png`, `03-homepage-products-footer.png`

**Sections (top to bottom, as visible in screenshots):**

1. **Announcement bar** — Teal/dark cyan background, white text: "Take it home today with free order & collect in as little as an hour! Subject to availability", X close button right
2. **Secondary nav** — Small text links: Help & Support · Track my order · Delivery · Returns · Spread the cost · Gift cards · TechTalk · Business
3. **Header** — Curry's purple circle logo (left), search bar with purple search icon button (center-left), utility icons (Stores, Account, Saved, Basket) with labels below each icon (right)
4. **Main navigation** — Horizontal: Appliances, TV & Audio, Computing, Gaming, Health & Beauty, Phones, Smart Tech, Home & Outdoor, Gifts, Clearance. "Deals" has a red pill/badge. Second row: Services, Brands
5. **USP bar** — 4 USP items with icons
6. **Hero carousel** — 3 large promotional banners side-by-side with left/right navigation arrows
7. **Credit representative example** — Thin bar with credit APR details
8. **Shop deals** — Horizontal scrollable category icons
9. **Discover our amazing offers** — Heading, then 4-card carousel with arrows
10. **Big brand deals** — 4-card carousel
11. **Sponsored products** — 6 product cards in a row
12. **Join Currys Perks** — Dark charcoal full-width banner, white text, "Sign me up" outlined CTA
13. **Footer** — Dark charcoal background, 5 columns
14. **Sub-footer** — Privacy links, social icons, legal text

### 2. TV & Audio Hub Page (`/tv-and-audio`)

**Reference screenshots:** `04-tv-audio-hub-top.png`, `05-tv-audio-hub-mid.png`, `06-tv-audio-hub-bottom.png`

**Layout:** Two-column — left sidebar (approx 240px) + main content area

**Left Sidebar (persistent):**
- Top categories, Popular links, Buying guides, News and reviews — all pill-shaped links with chevrons

**Main Content (top to bottom):**
1. Breadcrumbs, page title
2. Subcategory icons (7 circular icons)
3. Top deals (4 promo cards)
4. AI on TV section (3 article cards)
5. Filmmaker Mode promo with video
6. Buying guides visual (3 circular icon cards)
7. Find your perfect TV size (interactive tool)
8. Promotional banner carousel
9. Brand row (6 logos with CTAs)
10. SEO content (3-column text)
11. Credit bar, news cards

### 3. Category Listing Page (`/tv-and-audio/[category]`)

**Reference screenshots:** `07-category-listing-full.png`, `08-category-filters.png`

**Layout:** Two-column — filter sidebar (left) + product listing (right)

(See full filter sidebar detail in screenshot 08, full product card layout in screenshot 07)

### 4. Product Detail Page (`/product/[slug]`)

**Reference screenshots:** `09-product-page-top.png`, `10-product-page-mid.png`, `11-product-page-bottom.png`

**Sections:** Gallery + price panel, delivery/collection, cross-sell, bundles, collapsible info sections

### 5. Basket Page (`/basket`)

**Reference screenshot:** `12-basket.png`

**Sections:** Items list, Care & Repair upsell (3 plan options), Installation/Recycling checkboxes, Order summary sidebar

### 6. Checkout Flow (`/checkout/[step]`)

**Reference screenshots:** `13-checkout-welcome.png`, `14-checkout-delivery-empty.png`, `15-checkout-delivery-filled.png`, `16-checkout-signin-modal.png`, `17-checkout-customer-details.png`, `18-checkout-payment.png`

**Key layout:** Simplified header (logo + "Secure checkout"), no main nav. Steps show green checkmark when complete.

**Welcome page:** Sign in modal (screenshot 16) or welcome page (screenshot 13)
**Step 1 — Delivery:** Form with address lookup (screenshots 14-15)
**Step 2 — Customer details:** Email, billing, marketing preferences (screenshot 17)
**Step 3 — Payment:** Card/Apple Pay vs PayPal toggle, promo code section (screenshot 18)
**Step 4 — Confirmation:** Mock order number (no screenshot — approximate)

### 7. Footer Pages (`/[slug]`)

All footer links visible in `03-homepage-products-footer.png`: Help & support, Services, Care Services, Our websites, About us columns.

---

## Data Model

### Product

```typescript
interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: {
    current: number;
    was?: number;
    savings?: number;
    savingsPercent?: number;
    monthlyPayment?: {
      amount: number;
      months: number;
      interestFree: boolean;
    };
  };
  images: {
    main: string;
    gallery: string[];
    thumbnail: string;
  };
  rating: {
    average: number;
    count: number;
  };
  specs: Record<string, string>;
  keySpecs: string[];
  description: string;
  deliveryInfo: {
    freeDelivery: boolean;
    estimatedDate: string;
    collectionAvailable: boolean;
    collectionTime?: string;
  };
  badges: string[];
  tags: Array<{
    label: string;
    type: 'epic-deal' | 'trade-in' | 'credit' | 'free-gift' | 'buy-now-pay-later';
  }>;
  offers: Array<{
    text: string;
    moreOffersCount?: number;
  }>;
  energyRating?: string;
  inStock: boolean;
}
```

### Category

```typescript
interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  productCount: number;
  subcategories: Category[];
  filters: FilterGroup[];
}

interface FilterGroup {
  name: string;
  type: 'checkbox' | 'range' | 'rating' | 'toggle';
  collapsed: boolean;
  hasTooltip: boolean;
  options: FilterOption[];
}

interface FilterOption {
  label: string;
  value: string;
  count: number;
  hasTooltip?: boolean;
}
```

### Basket

```typescript
interface BasketItem {
  product: Product;
  quantity: number;
}

interface Basket {
  items: BasketItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  promoCode?: string;
  promoDiscount?: number;
}
```

---

## Project Structure

```
electric/
├── CLAUDE.md
├── PROJECT_SPEC.md
├── reference-screenshots/
│   ├── 01-homepage-hero.png
│   ├── 02-homepage-offers.png
│   ├── 03-homepage-products-footer.png
│   ├── 04-tv-audio-hub-top.png
│   ├── 05-tv-audio-hub-mid.png
│   ├── 06-tv-audio-hub-bottom.png
│   ├── 07-category-listing-full.png
│   ├── 08-category-filters.png
│   ├── 09-product-page-top.png
│   ├── 10-product-page-mid.png
│   ├── 11-product-page-bottom.png
│   ├── 12-basket.png
│   ├── 13-checkout-welcome.png
│   ├── 14-checkout-delivery-empty.png
│   ├── 15-checkout-delivery-filled.png
│   ├── 16-checkout-signin-modal.png
│   ├── 17-checkout-customer-details.png
│   └── 18-checkout-payment.png
├── data/
│   ├── scrape/
│   ├── design-tokens.json
│   ├── products.json
│   ├── categories.json
│   └── footer-links.json
├── public/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tv-and-audio/
│   │   ├── product/
│   │   ├── basket/
│   │   ├── checkout/
│   │   └── [slug]/
│   ├── components/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── category/
│   │   ├── basket/
│   │   ├── checkout/
│   │   └── ui/
│   ├── lib/
│   └── styles/
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Build Order

1. **Scrape** — Firecrawl all target URLs, save JSON
2. **Extract tokens** — Parse colors, fonts, spacing from scrape data, cross-reference with reference screenshots
3. **Scaffold** — `create-next-app`, configure Tailwind with tokens
4. **Layout shell** — AnnouncementBar, SecondaryNav, Header, MainNav, Footer (ref: `01-homepage-hero.png`, `03-homepage-products-footer.png`)
5. **Homepage** — Section by section (ref: `01` → `02` → `03`)
6. **TV & Audio Hub** — Left sidebar + all content sections (ref: `04` → `05` → `06`)
7. **Category listing** — Filters + product list/grid + sort (ref: `07`, `08`)
8. **Product page** — Gallery, price panel, specs, cross-sell, bundles (ref: `09` → `10` → `11`)
9. **Basket** — Items, upsells, services, order summary (ref: `12`)
10. **Checkout flow** — Welcome → Delivery → Customer → Payment → Confirmation (ref: `13` → `18`)
11. **Footer pages** — All static content pages
12. **Polish** — Responsive breakpoints, hover states, transitions, loading states
13. **Validation** — Screenshot every page/section, compare side-by-side against reference-screenshots/

---

## Quality Benchmarks

- **Visual fidelity:** Each section should be indistinguishable from the reference screenshots at a glance.
- **Responsive:** Must match Curry's behavior at mobile (375px), tablet (768px), and desktop (1280px+).
- **Interactions:** Hover states, dropdown menus, carousels, filter toggles — all must match.
- **Performance:** Page load under 3 seconds on simulated 4G.
- **Forms:** All checkout forms must validate inputs (email format, required fields, UK postcode format, card number format).
