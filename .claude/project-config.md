# Project Configuration

**This is the ONLY place for site-specific values.** Skills in `.claude/commands/` must never hardcode values that belong here — they reference this file using `{placeholder}` syntax instead. See "Skill Authoring Rules" in CLAUDE.md.

Populated by `/map-site` (pipeline position 1), refined by later skills.

## Site Identity

- **Project name**: Electriz TV & Audio
- **Reference domain**: electriz.co.uk
- **Legacy domains**: currys.co.uk
- **Brand name**: Electriz
- **Section slug**: tv-and-audio

## Locale

- **Country**: GB
- **Languages**: en-GB
- **Currency symbol**: £

## Architecture

- **Framework**: Next.js 15 App Router
- **Dev server port**: 3000
- **Category route type**: `[...category]` catch-all
- **Product route pattern**: `/products/[slug]`
- **Category data module**: `src/lib/category-data.ts`
- **Product data module**: `src/lib/product-data.ts`
- **Image utility module**: `src/lib/images.ts`
- **Constants module**: `src/lib/constants.ts`
- **Data directory**: `data/scrape/`
- **Product detail directory**: `data/scrape/products/`
- **Product index file**: `data/scrape/products-index.json`
- **Design tokens file**: `data/design-tokens.json`

## CDN Patterns (discovered by /download-images Step 2)

- **Image CDN host**: media.electriz.biz
- **CDN path prefix**: electrizprod
- **Legacy path prefix**: currysprod
- **Known URL patterns**:
  - Standard: `{cdn-host}/{prefix}/{productId}?$transform$&fmt=auto`
  - With variant suffix: `{cdn-host}/{prefix}/{productId}_{variant}?$transform$&fmt=auto`
  - M-prefix color variant: `{cdn-host}/{prefix}/M{productId}_{color}?$transform$&fmt=auto`
  - M-prefix color+variant: `{cdn-host}/{prefix}/M{productId}_{color}_{variant}?$transform$&fmt=auto`
- **M-prefix product count**: 33

## Data Stats (updated by /verify-coverage)

- **Total categories**: 14
- **Total products**: 2,321
- **Total images**: 37,392

## Category Mapping (verified against categoryMap in category-data.ts, 2026-03-09)

| categoryMap Key | Data File | Display Name |
| --------------- | --------- | ------------ |
| televisions/tvs | category-tvs.json | Televisions |
| dvd-blu-ray-and-home-cinema | dvd-blu-ray.json | DVD, Blu-ray & Home Cinema |
| dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars | soundbars.json | Sound Bars |
| speakers-and-hi-fi-systems | speakers-hifi.json | HiFi & Speakers |
| tv-accessories | tv-accessories.json | TV Accessories |
| digital-and-smart-tv | digital-smart-tv.json | Digital & Smart TV |
| headphones/headphones | headphones.json | Headphones |
| tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets | tv-wall-brackets.json | TV Wall Brackets |
| tv-accessories/cables-and-accessories | cables-accessories.json | Cables & Accessories |
| tv-accessories/remote-controls | remote-controls.json | Remote Controls |
| tv-accessories/tv-aerials | tv-aerials.json | TV Aerials |
| radios | radios.json | Radios |
| dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players | blu-ray-dvd-players.json | Blu-ray & DVD Players |
| dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems | home-cinema-systems.json | Home Cinema Systems |

## Component Inventory (from /scaffold-project)

| Component | File | Data Source |
| --------- | ---- | ----------- |
| HeroCarousel | src/components/layout/HeroCarousel.tsx | data/scrape/homepage.json → heroCarousel[] |
| ShopDeals | src/components/layout/ShopDeals.tsx | data/scrape/homepage.json → shopDeals[] |
| BigBrandDeals | src/components/layout/BigBrandDeals.tsx | data/scrape/homepage.json → bigBrandDeals[] |
| DiscoverOffers | src/components/layout/DiscoverOffers.tsx | data/scrape/homepage.json → discoverOffers[] |
| ProductListCard | src/components/category/ProductListCard.tsx | Category JSON → products[] |
| FilterSidebar | src/components/category/FilterSidebar.tsx | Category data module → filter definitions |
| ProductGallery | src/components/product/ProductGallery.tsx | Product detail JSON → images |
| PricePanel | src/components/product/PricePanel.tsx | Product detail JSON → price, deliveryInfo |
| MainNav | src/components/layout/MainNav.tsx | Hardcoded nav links |
| Footer | src/components/layout/Footer.tsx | data/scrape/homepage.json → footer |
| AnnouncementBar | src/components/layout/AnnouncementBar.tsx | data/scrape/homepage.json → announcementBar |

## Domain-Specific Filters (from /fix-filters, scraped 2026-03-09)

| Category | Filter Groups (beyond Brand/Price/Rating) |
| -------- | ----------------------------------------- |
| tvs | Type, Screen Size, Sound enhancement, Smart TV apps, Screen technology, Picture & contrast enhancement, Gaming, Refresh rate, Tuner, Resolution, Design features, Energy rating, Smart platform, Voice control, Colour, LED backlighting, Guarantee, Year, Gaming Technology, Loved by Electriz, Accessibility features |
| soundbars | Type, Premium audio technology, Sound bar design, Connections, Colour, Voice control, Loved by Electriz |
| headphones | Type, Design, Colour, Features, Compatible voice assistant, Loved by Electriz |
| home-cinema-systems | Premium audio technology, Sound bar design, Connections, Colour, Voice control |
| cables-accessories | Type, Length, Colour |
| remote-controls | Type, Number of devices controlled, Colour |
| tv-aerials | Type, Colour |
| radios | Type, Tuner, Connections, Features, Colour |
| blu-ray-dvd-players | Type, Connections, Colour, 4K Ultra HD, Features, Recording, Tuner |
| tv-wall-brackets | Type, Popular screen sizes, VESA, Max. weight, Colour, Suitable for curved TVs |

Hub pages (no filters scraped — use generated Brand/Price/Rating): dvd-blu-ray, tv-accessories, digital-smart-tv, speakers-hifi
