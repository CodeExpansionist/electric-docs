# Design System

## Overview

Design tokens are extracted from the live Electriz website and stored in `data/design-tokens.json`. These tokens are imported into `tailwind.config.ts` to create custom Tailwind utility classes. Components use these semantic classes instead of hardcoded values.

```
data/design-tokens.json → tailwind.config.ts → Tailwind classes → Components
```

## Colors

### Primary Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `primary` | `#4C12A1` | `bg-primary`, `text-primary` | Brand purple — buttons, links, highlights |
| `primaryLight` | `#7B2BFC` | `bg-primary-light` | Hover states, accents |
| `primaryDark` | `#2D0A6E` | `bg-primary-dark` | Active states |

### UI Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `surface` | `#F2F2F2` | `bg-surface` | Page background for content pages (category, product, hub). Homepage stays white. |
| `background` | `#FFFFFF` | `bg-white` | Card backgrounds, homepage |
| `border` | `#E9EAEB` | `border-border` | Standard borders |
| `borderLight` | `#CDD8DF` | `border-border-light` | Input borders, lighter dividers |
| `announcement` | `#007D8A` | `bg-announcement` | Announcement bar (teal) |

### Text Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `text.primary` | `#213038` | `text-text-primary` | Main body text |
| `text.secondary` | `#444444` | `text-text-secondary` | Secondary text, descriptions |
| `text.muted` | `#696969` | `text-text-muted` | Tertiary text, metadata |
| `text.inverse` | `#FFFFFF` | `text-white` | Text on dark backgrounds |
| `text.price` | `#222222` | `text-text-price` | Price display |

### Semantic Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `sale` | `#CC0000` | `text-sale`, `bg-sale` | Sale prices, "Was" labels |
| `success` | `#008A00` | `text-success` | In-stock indicators, success messages |
| `error` | `#CC0000` | `text-error` | Form validation errors |
| `ratingStars` | `#E8A317` | `text-rating-stars` | Star rating icons |
| `badge` | `#E5006D` | `bg-badge` | Product badges (pink) |
| `icon` | `#56707A` | `text-icon` | Default icon color |

### Footer & Subfooter

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `footer` | `#33434A` | `bg-footer-bg` | Footer background (dark slate) |
| `footerText` | `#D1D5DB` | `text-footer-text` | Footer link text |
| `subfooterBg` | `#292929` | `bg-subfooter-bg` | Subfooter background (darker) |
| `subfooterText` | `#BFBFBF` | `text-subfooter-text` | Subfooter text |
| `subfooterDivider` | `#555555` | `border-subfooter-divider` | Subfooter divider lines |

### Accent Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `lightPurple` | `#FAF5FF` | `bg-light-purple` | Light purple highlight backgrounds |
| `offerPink` | `#FDE6F1` | `bg-offer-pink` | Offer tag backgrounds |
| `galleryOverlay` | `#F9F9F9` | `bg-gallery-overlay` | Image gallery background |

## Typography

### Font Families

| Token | Value | Tailwind Class |
|-------|-------|---------------|
| `heading` | "Electriz Sans Headline", "ElectrizSans-Regular", sans-serif | `font-heading` |
| `body` | "Electriz Sans", "ElectrizSans-Regular", sans-serif | `font-body` |

Note: "Electriz Sans" is a placeholder name. The actual font files are system sans-serif fallbacks.

### Font Sizes

| Token | Size | Tailwind Class |
|-------|------|---------------|
| `xs` | 12px | `text-xs` |
| `sm` | 14px | `text-sm` |
| `base` | 16px | `text-base` |
| `lg` | 18px | `text-lg` |
| `xl` | 20px | `text-xl` |
| `2xl` | 24px | `text-2xl` |
| `3xl` | 32px | `text-3xl` |

### Font Weights

| Weight | Value | Tailwind Class |
|--------|-------|---------------|
| Normal | 400 | `font-normal` |
| Medium | 500 | `font-medium` |
| Semibold | 600 | `font-semibold` |
| Bold | 700 | `font-bold` |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `containerMaxWidth` | 1280px | `max-w-container` — main content width |
| `containerPadding` | 16px | Horizontal padding on container |
| `sectionGap` | 32px | Vertical gap between page sections |
| `cardGap` | 16px | Gap between cards in grids |

## Border Radius

| Token | Value | Tailwind Class | Usage |
|-------|-------|---------------|-------|
| `sm` | 4px | `rounded-sm` | Small elements |
| `md` | 8px | `rounded-md` | Cards, containers |
| `lg` | 24px | `rounded-lg` | Large elements |
| `pill` | 999px | `rounded-pill` | Buttons, pills, tags |
| `input` | 30px | `rounded-input` | Form inputs |

## Breakpoints

| Token | Value | Tailwind Prefix |
|-------|-------|----------------|
| `sm` | 640px | `sm:` |
| `md` | 768px | `md:` |
| `lg` | 1024px | `lg:` |
| `xl` | 1280px | `xl:` |

## Component Tokens

### Buttons

| Component | Background | Text | Border | Radius |
|-----------|-----------|------|--------|--------|
| Primary | `#4C12A1` | `#FFFFFF` | none | `999px` (pill) |
| Outline | `#FFFFFF` | `#4C12A1` | `2px solid #4C12A1` | `999px` (pill) |

### Inputs

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Text color | `#495057` |
| Border | `#CDD8DF` |
| Border radius | `30px` |

### Cards

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border radius | `8px` |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |

## Page Background Convention

| Page Type | Background |
|-----------|-----------|
| Homepage | White (`bg-white`) |
| Category listings | Surface (`bg-surface` / `#F2F2F2`) with white cards |
| Product detail | Surface with white cards |
| Hub pages | Surface with white cards |
| Checkout | White |
| Basket | Surface |

## Header Component Backgrounds

| Component | Background |
|-----------|-----------|
| AnnouncementBar | `bg-announcement` (teal `#007D8A`) |
| SecondaryNav | `bg-surface` (`#F2F2F2`) |
| Header (search bar) | `bg-white` |
| MainNav | `bg-white` |
| USPBar | `bg-surface` |
