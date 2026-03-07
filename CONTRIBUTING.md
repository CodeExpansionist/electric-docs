# Contributing to Electric

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
git clone <repo-url>
cd electric-docs
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Code Standards

### Styling

- Use Tailwind CSS utility classes with custom design tokens from `data/design-tokens.json`.
- Token values take priority over Tailwind defaults. Use `bg-primary`, `text-text-primary`, `bg-surface` etc.
- See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for the full token reference.

### No External Dependencies at Runtime

This is a fully self-contained MVP. Every image is local, every data file is static JSON. Do not:

- Add external image URLs to `<img>` or `next/image` `src` attributes
- Add API calls to external services
- Add `remotePatterns` entries to `next.config.mjs`

### Data

All content comes from `data/scrape/` JSON files. No hardcoded product names, prices, or descriptions in components. See [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) for the data model.

### Images

Product images live at `public/images/products/{productId}/{type}.webp`. Use the helpers in `src/lib/images.ts` (`getListingImage`, `getLargeImage`, `getGalleryImages`) instead of constructing paths manually.

### TypeScript

- Strict mode enabled
- All exports in `src/lib/` should have JSDoc comments
- Prefer explicit types over `any` (use `eslint-disable` sparingly for scraped data parsing)

### Category Routing

URL slugs must match keys in `categoryMap` in `src/lib/category-data.ts`. See [docs/CATEGORY_ROUTING.md](docs/CATEGORY_ROUTING.md) for the full routing algorithm.

## Commit Conventions

```
feat(section): add [page] [section-name]
fix(component): resolve [issue description]
chore: [maintenance task]
```

Do not commit:
- `.env` files (use `.env.example` as template)
- The `.next/` build cache
- `node_modules/`

## Dev Server Gotcha

Never delete `.next/` while the dev server is running. Kill the server first:

```bash
lsof -ti:3000 | xargs kill -9
rm -rf .next
npm run dev
```

## Pull Request Checklist

- [ ] Changes match the reference screenshots in `reference-screenshots/`
- [ ] No external image URLs or API calls added
- [ ] Design tokens used instead of hardcoded colors/sizes
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes
