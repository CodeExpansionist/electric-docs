# Electric — Electriz TV & Audio Clone

A pixel-perfect clone of the [Electriz](https://www.electriz.co.uk) TV & Audio section, built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** React Context (basket, saved items, orders)
- **Persistence:** localStorage for basket and order data

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage
│   ├── tv-and-audio/       # TV & Audio hub page
│   ├── tv-and-audio/televisions/  # Category listing
│   ├── products/[slug]/    # Product detail page
│   ├── basket/             # Basket page
│   ├── checkout/           # Checkout flow (multi-step)
│   ├── account/            # Account & orders
│   ├── help-and-support/   # Help & support page
│   └── [...slug]/          # Catch-all for footer pages
├── components/
│   ├── layout/             # Header, footer, navigation
│   ├── home/               # Homepage sections
│   ├── hub/                # TV & Audio hub sections
│   ├── category/           # Category listing components
│   ├── product/            # Product detail components
│   ├── basket/             # Basket page components
│   └── checkout/           # Checkout step components
├── lib/
│   ├── basket-context.tsx  # Basket state (Context + useReducer)
│   ├── saved-context.tsx   # Saved items state
│   ├── orders-context.tsx  # Order history state
│   ├── product-data.ts     # Product data loading utilities
│   ├── types.ts            # Shared TypeScript types
│   └── validation.ts       # Form validation utilities
└── data/
    ├── design-tokens.json  # Design system tokens
    ├── scrape/             # Scraped page data (JSON)
    └── ...                 # Category and product data
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero carousel, offers, deals |
| `/tv-and-audio` | TV & Audio hub with categories, guides |
| `/tv-and-audio/televisions` | Category listing with filters, sort, list/grid view |
| `/products/[slug]` | Product detail with gallery, specs, bundles |
| `/basket` | Shopping basket with upsells |
| `/checkout` | Multi-step checkout (delivery, customer, payment) |
| `/checkout/confirmation` | Order confirmation |
| `/account` | Account overview and order history |
| `/help-and-support` | Help centre with FAQs |
| `/[...slug]` | Footer content pages (returns, delivery, etc.) |

## Design System

Design tokens are extracted from the live Electriz site and stored in `data/design-tokens.json`. These tokens drive the Tailwind configuration in `tailwind.config.ts`.

Key tokens include:
- **Colors:** Primary purple (`#4C12A1`), announcement teal, sale red, text hierarchy
- **Typography:** Electriz Sans font family, size scale from xs to 3xl
- **Spacing:** Container max-width, border radii, shadows
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)

## Data

Product data is scraped from electriz.co.uk and stored as JSON in `data/`. The scraping workflow:

1. Full category pages scraped via Firecrawl MCP
2. Individual product pages enriched with specs, gallery, flexpay, bundles
3. Data indexed in `data/scrape/products/products-index.json`

Product images use local images with `next/image` and `unoptimized` flag.

## Checkout Flow

The checkout implements a multi-step flow:

1. **Welcome** — Sign in or continue as guest
2. **Delivery** — Address form with UK postcode lookup
3. **Customer** — Email, billing, marketing preferences
4. **Payment** — Card/Apple Pay or PayPal selection
5. **Confirmation** — Order number and summary

Form validation includes UK postcode format, phone number format, email validation, and card number Luhn check. Mock submission shows a spinner then redirects to confirmation with a generated order number.

## Reference Screenshots

18 annotated screenshots in `reference-screenshots/` serve as the visual source of truth. See `PROJECT_SPEC.md` for the full screenshot-to-page mapping.

## License

Private project — not for redistribution.
