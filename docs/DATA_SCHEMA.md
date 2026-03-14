# Data Schema

> **Authority:** Reference — code-level truth is `src/lib/types.ts`. This document explains the type system and data flow.

## Overview

The application uses two sets of TypeScript interfaces:

1. **Display types** (`src/lib/types.ts`) — Used by UI components for rendering
2. **Data layer types** (`src/lib/category-data.ts`, `src/lib/product-data.ts`) — Used for data loading and merging

These two layers have intentionally different shapes for the same concepts (e.g., specs). Understanding the difference is critical.

## Core Types (`src/lib/types.ts`)

### Product

The canonical product type used by UI components.

```typescript
interface Product {
  id: string;               // Product ID (e.g., "10282094")
  slug: string;             // URL slug for routing
  title: string;            // Display name
  brand: string;            // Brand name (e.g., "Samsung", "LG", "Sony")
  category: string;         // Category display name
  subcategory: string;      // Subcategory display name
  price: {
    current: number;        // Current selling price in GBP
    was?: number;           // Previous price (if on sale)
    savings?: number;       // Absolute savings amount
    savingsPercent?: number; // Percentage savings
  };
  images: {
    main: string;           // Listing thumbnail path (/images/products/{id}/main.webp)
    gallery: string[];      // Full-size gallery image paths
    thumbnail: string;      // Small thumbnail path
  };
  rating: {
    average: number;        // Star rating (0-5, one decimal)
    count: number;          // Number of reviews
  };
  specs: Record<string, string>;  // ⚠️ Key-value pairs (NOT an array)
  keySpecs: string[];       // Bullet-point spec highlights
  description: string;      // Product description text
  deliveryInfo: {
    freeDelivery: boolean;  // Whether delivery is free (£40+ threshold)
    estimatedDate: string;  // Estimated delivery date text
  };
  badges: string[];         // Badge labels (e.g., "Best Seller")
  tags: Array<{             // Promotional tags
    label: string;          // Display text
    type: "epic-deal"       // Red sale badge
        | "trade-in"        // Green trade-in badge
        | "free-gift";      // Pink free gift badge
  }>;
  offers: Array<{
    text: string;           // Offer description
    moreOffersCount?: number; // "X more offers" link count
  }>;
  energyRating?: string;    // EU energy label class (e.g., "A", "B", "C")
  energyLabelUrl?: string;  // URL path to energy label image
  inStock: boolean;         // Stock availability
}
```

### Category

```typescript
interface Category {
  id: string;
  slug: string;             // URL slug (matches categoryMap key)
  name: string;             // Display name
  description: string;
  image: string;            // Category hero image path
  icon?: string;            // Category icon path (for hub pages)
  productCount: number;
  subcategories: Category[]; // Nested subcategories
  filters: FilterGroup[];
}
```

### FilterGroup

```typescript
interface FilterGroup {
  name: string;             // Filter group label (e.g., "Brand", "Price")
  type: "checkbox"          // Multi-select checkboxes
     | "range"              // Price range slider
     | "rating"             // Star rating selector
     | "toggle";            // On/off toggle (handled separately in UI)
  isExpanded: boolean;      // Whether group starts expanded
  options: Array<{
    label: string;          // Display label (e.g., "Samsung", "£500 to £1000")
    count: number;          // Number of matching products
  }>;
}
```

### Basket Types

```typescript
interface BasketItem {
  product: Product;
  quantity: number;
}

interface Basket {
  items: BasketItem[];
  subtotal: number;         // Sum of (price × quantity)
  deliveryCost: number;     // £0 if subtotal ≥ £40, else £4.99
  total: number;            // subtotal + deliveryCost - promoDiscount
  promoCode?: string;
  promoDiscount?: number;
}
```

### Navigation Types

```typescript
interface NavItem {
  label: string;
  href: string;
  badge?: string;           // Optional badge text (e.g., "New")
  children?: NavItem[];     // Dropdown menu items
}

interface FooterColumn {
  title: string;            // Column heading
  links: Array<{
    label: string;
    href: string;
  }>;
}
```

## Data Layer Types

### CategoryProduct (`src/lib/category-data.ts`)

The product shape as it comes from category JSON files. Note the differences from `Product`:

```typescript
interface CategoryProduct {
  name: string;             // (Product uses "title")
  brand: string;
  price: {
    current: number;
    was: number | null;     // (Product uses optional "was?")
    savings: number | null;
  };
  rating: {
    average: number;
    count: number;
  };
  url: string;              // Full URL path (e.g., "/products/samsung-tv-10282094.html")
  imageUrl: string | null;  // Local image path or null
  productId?: string;       // Product ID extracted from URL
  specs: string[];          // ⚠️ Array of strings (NOT Record<string, string>)
  badges: string[];
  offers: string[];         // ⚠️ Array of strings (Product uses Array<{text, count}>)
  deliveryFree: boolean;
  energyRating?: string | null;
  energyLabelUrl?: string | null;
}
```

### Key Differences: Product vs CategoryProduct

| Field | `Product` (types.ts) | `CategoryProduct` (category-data.ts) |
|-------|---------------------|--------------------------------------|
| `specs` | `Record<string, string>` (key-value) | `string[]` (flat list) |
| `offers` | `Array<{text, moreOffersCount}>` | `string[]` |
| `price.was` | `number \| undefined` (optional) | `number \| null` |
| Name field | `title` | `name` |
| Image field | `images.main` | `imageUrl` |

### ProductDetail (`src/lib/product-data.ts`)

The enriched product type returned by `getProductBySlug()`. Extends `CategoryProduct` with optional fields from individual product scrapes:

```typescript
interface ProductDetail {
  // Core fields (always available)
  name: string;
  brand: string;
  price: { current: number; was: number | null; savings: number | null };
  rating: { average: number; count: number };
  url: string;
  imageUrl: string | null;
  imageLarge: string | null;
  specs: string[];
  badges: string[];
  offers: string[];
  deliveryFree: boolean;
  energyRating?: string | null;
  energyLabelUrl?: string | null;
  category: string;
  categorySlug: string;
  productId?: string;

  // Enriched fields (from scraped product JSON — may be undefined)
  images?: { gallery: string[]; thumbnails: string[]; video?: string };
  keySpecs?: KeySpec[];
  sizeOptions?: SizeOption[];
  wallBracket?: WallBracket;
  careAndRepair?: CareAndRepairPlan[];
  careAndRepairBenefits?: string[];
  essentialServices?: EssentialService[];
  crossSellProducts?: CrossSellProduct[];
  badgeImages?: BadgeInfo[];
  awards?: AwardInfo[];
  specifications?: Record<string, Record<string, string>>;
  description?: ProductDescription;
  deliveryInfo?: DeliveryInfo;
  bundleDeals?: BundleDeal[];
  promotionalOffers?: Array<{ title: string; description: string; code?: string; terms?: string }>;
  whatsInTheBox?: string[];
  modelNumber?: string;
}
```

## Data Flow

```
Scraped JSON → category-data.ts (CategoryProduct) → product-data.ts (ProductDetail) → Components
                                                                                         ↕
                                                                        types.ts (Product) ← used by basket/saved contexts
```

The `Product` type in `types.ts` is primarily used by the basket and saved-items contexts. Category listings use `CategoryProduct` directly. Product detail pages use `ProductDetail`.

## Normalized Field Formats

All product data should follow these conventions (enforced by `normalize-scrape-batch1.js`):

| Field | Format | Example |
|-------|--------|---------|
| `price` | Object: `{ current, was, savings }` | `{ current: 1299, was: 1499, savings: 200 }` |
| `rating` | Object: `{ average, count }` | `{ average: 4.7, count: 123 }` |
| `productId` | String | `"10282094"` (not number `10282094`) |
| `url` | Relative path | `"/products/samsung-tv-10282094.html"` (not full domain) |
| `imageUrl` | Local path or null | `"/images/products/10282094/main.webp"` |
