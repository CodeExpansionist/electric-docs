# Architecture

## Overview

Electric is a pixel-perfect clone of the Electriz TV & Audio section, built as a fully self-contained Next.js application. It has **zero external runtime dependencies** — all data is static JSON, all images are local WebP files, and all state is client-side.

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React Context (basket, saved, orders)           │
│  localStorage persistence                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            Next.js 15 App Router                 │
│                                                  │
│  src/app/                                        │
│  ├── page.tsx              (homepage)            │
│  ├── tv-and-audio/         (hub + categories)    │
│  ├── products/[slug]/      (product detail)      │
│  ├── basket/               (basket)              │
│  ├── checkout/             (multi-step checkout)  │
│  ├── account/              (order history)       │
│  ├── search/               (search results)      │
│  ├── api/search/           (search API)          │
│  └── [...slug]/            (catch-all pages)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│               Data Layer (src/lib/)              │
│                                                  │
│  category-data.ts  → categoryMap (all categories) │
│  product-data.ts   → product detail merging      │
│  search-data.ts    → search indexing + scoring   │
│  article-data.ts   → TechTalk article loading    │
│  admin-utils.ts    → admin dashboard utilities   │
│  images.ts         → CDN URL → local path        │
│  constants.ts      → SITE_URL, stripDomain       │
│  types.ts          → shared TypeScript interfaces │
│  basket-context.tsx → basket state + persistence  │
│  saved-context.tsx  → wishlist state              │
│  orders-context.tsx → order history state         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             Static Data (data/scrape/)            │
│                                                  │
│  Category JSON files (product listings)           │
│  Individual product detail JSON files             │
│  products-index.json (master index)              │
│  size-variants.json (TV size groupings)          │
│  Hub JSON files (subcategory hub pages)          │
│  seo/ directory (robots, sitemap references)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│          Local Assets (public/images/)            │
│                                                  │
│  products/{id}/main.webp     (product images)    │
│  banners/{slug}.webp         (promo banners)     │
│  icons/{slug}.svg            (category icons)    │
│  brand-electriz-logo.svg     (brand logo)        │
└─────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Fully Local Data & Images

All product data is scraped from the live Electriz site and stored as static JSON. All images are downloaded and served locally. This means:

- No CORS issues or rate limiting
- Works offline after build
- No CDN costs or external service dependencies
- `remotePatterns: []` in `next.config.mjs` enforces this at the framework level

Trade-off: Data freshness requires re-running the scraping pipeline (see [DATA_PIPELINE.md](DATA_PIPELINE.md)).

### 2. JSON Data Layer (No Database)

Product and category data lives in `data/scrape/` as JSON files imported directly into TypeScript modules. This approach was chosen because:

- The dataset is read-only (cloned site, no user-generated content)
- JSON imports are statically analyzed by webpack for tree-shaking
- No database setup, migration, or connection management
- Data is version-controlled alongside code

The `products-index.json` master index maps product IDs to their enriched data, enabling O(1) lookups.

### 3. Two-Tier Product Data

Products exist in two forms that get merged at read time:

1. **Category-level data** (e.g., `category-tvs.json`): Name, price, rating, image URL, basic specs. Available for all products.
2. **Scraped detail data** (e.g., `products/10282094.json`): Full gallery, specifications table, care plans, cross-sells, delivery info. Available for products with successful individual page scrapes.

`product-data.ts` → `mergeScrapedData()` combines both tiers, preferring the more detailed scraped data when available.

### 4. Client-Side State with React Context

Three Context providers manage interactive state:

| Context | Purpose | Persistence |
|---------|---------|-------------|
| `BasketContext` | Shopping basket items and totals | localStorage |
| `SavedContext` | Wishlist / saved items | localStorage |
| `OrdersContext` | Order history (from checkout) | localStorage |

Checkout form state is component-local (not in Context) since it doesn't need to persist across page navigations.

### 5. Category Routing Algorithm

URL slugs map to product data through a 2-phase lookup in `category-data.ts`:

1. **Direct lookup**: Exact match → alias match → suffix match against `categoryMap` keys
2. **Parent + filter fallback**: Walk up the slug segments, find the nearest parent category, then filter its products by brand name or subcategory keywords

This allows deep URLs like `/tv-and-audio/speakers-and-hi-fi-systems/portable-bluetooth-speakers/sony` to work without needing a dedicated data file for every brand×subcategory combination.

See [CATEGORY_ROUTING.md](CATEGORY_ROUTING.md) for the full algorithm.

### 6. Design Token Pipeline

Visual design values flow through a single pipeline:

```
Live site CSS extraction → data/design-tokens.json → tailwind.config.ts → Tailwind classes
```

Components use semantic Tailwind classes (`bg-primary`, `text-text-secondary`, `border-border`) that resolve to token values. This ensures visual consistency and makes site-wide color changes a single-file edit.

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the full token reference.

## Directory Structure

```
electriz/
├── data/
│   ├── design-tokens.json          # Design system tokens
│   └── scrape/                     # All scraped data
│       ├── category-*.json          # Category listing data
│       ├── products/               # Individual product detail files
│       ├── products-index.json     # Master product index
│       ├── size-variants.json      # TV size variant groupings
│       ├── hub-*.json              # Hub page data
│       ├── homepage.json           # Homepage content
│       ├── pages/                  # Static page content
│       └── seo/                    # SEO reference data
├── public/
│   └── images/
│       ├── products/{id}/          # Product images (WebP)
│       ├── banners/                # Promotional banners
│       ├── icons/                  # Category icons
│       └── brand-electriz-logo.svg # Brand logo
├── scripts/                        # Data pipeline scripts
├── src/
│   ├── app/                        # Next.js App Router pages
│   ├── components/                 # React components
│   │   ├── layout/                 # Header, Footer, Nav, etc.
│   │   ├── category/               # Category listing components
│   │   ├── product/                # Product detail components
│   │   ├── basket/                 # Basket page components
│   │   ├── checkout/               # Checkout step components
│   │   ├── admin/                  # Admin dashboard components
│   │   └── ui/                     # Shared UI components
│   └── lib/                        # Data layer, types, state
├── reference-screenshots/          # Visual reference images
├── docs/                           # Project documentation
├── CLAUDE.md                       # AI assistant instructions
└── README.md                       # Project overview
```
