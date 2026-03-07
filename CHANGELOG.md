# Changelog

All notable changes to this project are documented here.

## [1.0.0] - 2026-03-06

### Initial Release

Complete pixel-perfect clone of the Electriz TV & Audio section.

#### Pages
- Homepage with hero carousel, promotional offers, brand deals, sponsored products
- TV & Audio hub page with category icons, brand carousel, help cards
- 14 category listing pages with filters, sort, grid/list view toggle
- Product detail pages with gallery, specs, size variants, care plans, cross-sells
- Shopping basket with quantity controls and upsells
- Multi-step checkout (delivery, customer, payment, confirmation)
- Account page with order history
- Help & support page with FAQ accordions
- Search page with autocomplete suggestions
- Footer content pages (delivery, returns, gift cards, track order)

#### Data
- 2,321 products across 14 categories
- 37,309 local WebP images (main, large, gallery, thumbnail variants)
- 31 promotional banner images, 8 category icons
- Full product specifications, ratings, offers, and delivery info

#### Infrastructure
- Next.js 14 App Router with TypeScript 5 strict mode
- Tailwind CSS 3 with custom design tokens from live site extraction
- React Context state management (basket, saved items, orders)
- Static JSON data layer with no external runtime dependencies
- 17 data pipeline scripts for scraping, normalizing, and building data
- SEO setup: meta tags, JSON-LD structured data, robots.txt, sitemap.xml

### Known Issues

See [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) for the full list.
