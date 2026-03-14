# Component Guide

> **Authority:** Reference — code-level truth is `src/components/`. This document provides an overview of component organisation and key patterns.

## Component Organization (53 components)

```
src/components/
├── admin/           # Admin dashboard components (10)
├── category/        # Category listing & hub page components (9)
├── checkout/        # Checkout step components (6)
├── layout/          # Site-wide layout components (15)
├── product/         # Product detail page components (9)
└── ui/              # Shared reusable UI components (4)
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

Horizontal bar showing unique selling propositions (free delivery, price promise, recycling).

### HeroCarousel (`layout/HeroCarousel.tsx`)

Homepage hero slider with auto-play at 5-second intervals (`setInterval(goNext, 5000)`). Pauses on mouse hover and respects `prefers-reduced-motion`.

### Additional Layout Components

| Component | File | Description |
| --- | --- | --- |
| SecondaryNav | `layout/SecondaryNav.tsx` | Top navigation links (Store locator, Help, Account) |
| CheckoutHeader | `layout/CheckoutHeader.tsx` | Simplified header for checkout pages (logo + "Secure checkout") |
| LayoutWrapper | `layout/LayoutWrapper.tsx` | Wraps all pages with providers, header, footer |
| ShopDeals | `layout/ShopDeals.tsx` | Homepage "Shop Deals" icon row |
| BigBrandDeals | `layout/BigBrandDeals.tsx` | Homepage brand deals card carousel |
| DiscoverOffers | `layout/DiscoverOffers.tsx` | Homepage offers card carousel |
| SponsoredProducts | `layout/SponsoredProducts.tsx` | Sponsored product cards with view tracking |
| ElectrizPerks | `layout/ElectrizPerks.tsx` | Perks membership promo banner |
| SubFooter | `layout/SubFooter.tsx` | Legal links and social media icons below footer |

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

### Additional Category Components

| Component | File | Description |
| --- | --- | --- |
| CategoryHub | `category/CategoryHub.tsx` | Full hub page layout (sidebar + content areas) |
| FilterSidebar | `category/FilterSidebar.tsx` | Collapsible filter groups for category listings |
| HubBannerCarousel | `category/HubBannerCarousel.tsx` | Promo banner carousel on hub pages |
| HubBrandCarousel | `category/HubBrandCarousel.tsx` | Brand logo row with CTA links |
| HubContentGrid | `category/HubContentGrid.tsx` | Content cards grid (articles, guides) |
| HubPromoBanners | `category/HubPromoBanners.tsx` | Promotional banners section |
| TvSizeFinder | `category/TvSizeFinder.tsx` | Interactive TV size recommendation tool |

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
| `wasPrice` | `number \| null` | --- | Previous price |
| `savings` | `number \| null` | --- | Savings amount |
| `offers` | `string[]` | (required) | Offer descriptions |
| `sizeVariants` | `SizeVariant[]` | `[]` | Size options for TV size selector |
| `energyRating` | `string \| null` | --- | Energy rating letter |
| `wallBracket` | `WallBracket` | --- | Optional wall bracket upsell |
| `onAddToBasket` | `() => void` | --- | Add to basket callback |

### Additional Product Components

| Component | File | Description |
| --- | --- | --- |
| BuyTogetherBundle | `product/BuyTogetherBundle.tsx` | "Buy together and save" bundle section |
| CareAndRepair | `product/CareAndRepair.tsx` | Care & Repair plan upsell (3 tiers) |
| CrossSellProducts | `product/CrossSellProducts.tsx` | "Customers also bought" product cards |
| EssentialServices | `product/EssentialServices.tsx` | Installation, recycling, and setup services |
| ProductSpecs | `product/ProductSpecs.tsx` | Collapsible specification groups |
| StickyProductHeader | `product/StickyProductHeader.tsx` | Sticky header bar on scroll with price and CTA |
| ViewTracker | `product/ViewTracker.tsx` | Invisible component that tracks product page views via `/api/track-view` |

## Checkout Components

| Component | File | Description |
| --- | --- | --- |
| WelcomeStep | `checkout/WelcomeStep.tsx` | Sign in or continue as guest |
| DeliveryStep | `checkout/DeliveryStep.tsx` | Address form with UK postcode entry and manual address toggle |
| CustomerStep | `checkout/CustomerStep.tsx` | Email, billing address, marketing preferences |
| PaymentStep | `checkout/PaymentStep.tsx` | Card form with Luhn validation, promo code entry |
| CheckoutSidebar | `checkout/CheckoutSidebar.tsx` | Order summary sidebar (items, totals, delivery cost) |
| SignInModal | `checkout/SignInModal.tsx` | Email sign-in modal with guest fallback |

See [CHECKOUT_FLOW.md](CHECKOUT_FLOW.md) for the full flow documentation.

## Admin Components

The admin dashboard at `/admin` uses modular components for data display and management.

| Component | File | Description |
| --- | --- | --- |
| AdminHeader | `admin/AdminHeader.tsx` | Admin page header with title and actions |
| AdminSidebar | `admin/AdminSidebar.tsx` | Navigation sidebar (Dashboard, Products, Orders, Customers) |
| DataTable | `admin/DataTable.tsx` | Sortable, paginated data table |
| EmptyState | `admin/EmptyState.tsx` | Placeholder for empty data views |
| Pagination | `admin/Pagination.tsx` | Page navigation controls |
| ProductImage | `admin/ProductImage.tsx` | Product thumbnail with fallback |
| SearchInput | `admin/SearchInput.tsx` | Search bar with debounce |
| StatsCard | `admin/StatsCard.tsx` | Dashboard metric card |
| StatusBadge | `admin/StatusBadge.tsx` | Colored status indicator |
| StatusSelect | `admin/StatusSelect.tsx` | Status dropdown for order management |

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

### Additional UI Components

| Component | File | Description |
| --- | --- | --- |
| Accordion | `ui/Accordion.tsx` | Collapsible content sections (used for product info, FAQ) |
| StarRating | `ui/StarRating.tsx` | Star rating display (filled/half/empty stars) |
| EnergyRatingBadge | `ui/EnergyRatingBadge.tsx` | EU energy rating label badge |

## State Management

### BasketProvider (`lib/basket-context.tsx`)

Wraps the app to provide basket state. Uses `useReducer` with localStorage persistence.

**Actions:** `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_BASKET`, `APPLY_PROMO`

**Hook:** `useBasket()` returns `{ basket, addItem, removeItem, updateQuantity, applyPromo, removePromo, clearBasket, itemCount }`

### SavedProvider (`lib/saved-context.tsx`)

Provides saved/wishlist item state with localStorage persistence.

**Hook:** `useSaved()` returns `{ savedItems, savedCount, addSaved, removeSaved, isSaved }`

### OrdersProvider (`lib/orders-context.tsx`)

Provides order history state. Seeded with a demo order for account page display.

**Hook:** `useOrders()` returns `{ orders, isHydrated, addOrder, getOrder, updateOrderStatus }`
