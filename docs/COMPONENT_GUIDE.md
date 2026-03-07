# Component Guide

## Component Organization

```
src/components/
├── layout/          # Site-wide layout components
├── category/        # Category listing page components
├── product/         # Product detail page components
├── checkout/        # Checkout step components
└── ui/              # Shared reusable UI components
```

## Layout Components

### Header (`layout/Header.tsx`)

Site-wide header with search, navigation, basket, and saved items.

**State:** Uses `useBasket()` for item count, `useSaved()` for saved count, `useRouter()` for navigation.

**Features:**
- Search bar with debounced autocomplete (suggestions from `/api/search?mode=suggest`)
- Keyboard navigation in autocomplete dropdown (up/down arrows, Enter, Escape)
- Account dropdown menu
- Mobile hamburger menu
- Basket count badge
- Saved items count badge

### MainNav (`layout/MainNav.tsx`)

Main navigation bar with category links and mega-menu dropdowns.

**Convention:** All category links must resolve to keys in `categoryMap` (see [CATEGORY_ROUTING.md](CATEGORY_ROUTING.md)).

### Footer (`layout/Footer.tsx`)

Multi-column footer with link columns, social icons, and legal text.

Footer links point to `/services/*`, `/help-and-support`, and other paths handled by the `[...slug]` catch-all route.

### AnnouncementBar (`layout/AnnouncementBar.tsx`)

Teal banner at the top of the page with promotional messages.

### USPBar (`layout/USPBar.tsx`)

Horizontal bar showing unique selling propositions (free delivery, price promise, recycling, finance).

### HeroCarousel (`layout/HeroCarousel.tsx`)

Homepage hero slider with auto-play (5-second intervals).

## Category Components

### ProductListCard (`category/ProductListCard.tsx`)

Product card used in category listing grids.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | Product display name |
| `image` | `string \| null` | No | Listing image path |
| `price` | `number` | Yes | Current price in GBP |
| `wasPrice` | `number \| null` | No | Previous price (shows "Was" label) |
| `savings` | `number \| null` | No | Savings amount (shows savings badge) |
| `rating` | `number \| null` | No | Star rating (0-5) |
| `reviewCount` | `number \| null` | No | Number of reviews |
| `specs` | `string[]` | Yes | Key spec bullet points |
| `badges` | `string[]` | Yes | Badge labels |
| `offers` | `string[]` | Yes | Offer descriptions |
| `deliveryFree` | `boolean` | Yes | Whether delivery is free |
| `url` | `string` | Yes | Product page URL |
| `energyRating` | `string \| null` | No | EU energy rating letter |

### HubSidebar (`category/HubSidebar.tsx`)

Sidebar navigation for hub pages with categorized link sections.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sections` | `SidebarSection[]` | Yes | Array of `{ title: string; links: { text, url }[] }` |

## Product Components

### ProductGallery (`product/ProductGallery.tsx`)

Image gallery with thumbnails strip, main image display, and click-to-zoom.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `images` | `string[]` | Yes | Full-size gallery image paths |
| `thumbnails` | `string[]` | Yes | Thumbnail image paths |
| `alt` | `string` | Yes | Alt text for all images |

**Behavior:**
- Thumbnails strip on the left (desktop) or bottom (mobile)
- Click thumbnail to select main image
- Failed image loads are silently filtered out
- Gallery images come from `ProductDetail.images.gallery`

### PricePanel (`product/PricePanel.tsx`)

Price display, size selector, offers, and add-to-basket button.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `price` | `number` | (required) | Current price |
| `wasPrice` | `number \| null` | — | Previous price |
| `savings` | `number \| null` | — | Savings amount |
| `offers` | `string[]` | (required) | Offer descriptions |
| `sizeVariants` | `SizeVariant[]` | `[]` | Size options for TV size selector |
| `energyRating` | `string \| null` | — | Energy rating letter |
| `wallBracket` | `WallBracket` | — | Optional wall bracket upsell |
| `onAddToBasket` | `() => void` | — | Add to basket callback |

## UI Components

### Carousel (`ui/Carousel.tsx`)

Responsive horizontal carousel with navigation arrows.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode[]` | (required) | Carousel items |
| `visibleCount` | `number` | `4` | Items visible on desktop |
| `mobileCount` | `number` | `2` | Items visible on mobile (<640px) |
| `tabletCount` | `number` | `min(visibleCount, 3)` | Items visible on tablet (640-1024px) |
| `className` | `string` | `""` | Additional CSS classes |

**Responsive breakpoints:** 640px (mobile), 1024px (tablet), determined by `useResponsiveCount` hook.

## State Management Components

### BasketProvider (`lib/basket-context.tsx`)

Wraps the app to provide basket state. Uses `useReducer` with localStorage persistence.

**Actions:** `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_BASKET`, `APPLY_PROMO`

**Hook:** `useBasket()` returns `{ items, subtotal, deliveryCost, total, itemCount, addItem, removeItem, updateQuantity, clearBasket }`

### SavedProvider (`lib/saved-context.tsx`)

Provides saved/wishlist item state with localStorage persistence.

**Hook:** `useSaved()` returns `{ savedItems, savedCount, toggleSaved, isSaved }`

### OrdersProvider (`lib/orders-context.tsx`)

Provides order history state. Seeded with a demo order for account page display.

**Hook:** `useOrders()` returns `{ orders, addOrder }`
