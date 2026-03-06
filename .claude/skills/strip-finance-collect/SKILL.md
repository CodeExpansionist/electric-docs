---
name: strip-finance-collect
description: Remove all finance/credit purchase and click & collect / in-store collection content from an e-commerce clone project. Use this skill when the user mentions removing finance options, stripping credit/flexpay, removing click & collect, removing store collection, or cleaning up purchase methods that require real backend services. Also trigger when the user says "strip finance", "remove collection", "no finance", or "no click and collect".
---

# Strip Finance & Collection Content

Removes two categories of content that don't belong in a standalone e-commerce clone:

1. **Finance/credit purchasing** — flexpay, pay monthly, APR, interest-free offers, Klarna, PayPal Credit, spread the cost
2. **In-store collection** — click & collect, order & collect, store pickup, collection availability

These features require real payment providers and physical stores, so they should be stripped from clone projects entirely.

## Execution Steps

### Phase 1: Audit (read-only)

Search the entire project for matches before changing anything. This gives you the scope of work and lets the user see what will be affected.

**Finance terms to search** (case-insensitive):
- `flexpay`, `flex pay`, `flexipay`
- `pay monthly`, `monthly payment`, `monthly amount`
- `finance`, `financing`, `finance option`
- `interest-free`, `interest free`, `0% interest`
- `APR` (but NOT product model numbers like "MDR-EX110APR" — only match APR in financial contexts)
- `representative example`, `credit subject to status`
- `pay in 3`, `pay in three`, `buy now pay later`, `BNPL`
- `Klarna`, `PayPal Credit`, `Clearpay`
- `spread the cost`, `pay at your pace`
- `totalPayable`, `monthlyAmount`, `interestRate`

**Collection terms to search** (case-insensitive):
- `collect in store`, `collect in-store`, `collection in store`
- `click & collect`, `click and collect`, `order & collect`, `order and collect`
- `store pickup`, `pick up in store`, `pick up in-store`
- `reserve in store`
- `collect today`, `collect in as little as`
- `collectionAvailable`, `collectionTime`, `collectionFree`
- `free collection`, `free in-store collection`

**Where to search:**
- `src/` — components, pages, lib files, API routes
- `data/` — scraped JSON files (category listings, product details, homepage, hub pages)
- `scripts/` — data pipeline scripts
- Root config files

Present the audit as a table:

```
| Location | Type | Content | Action |
|----------|------|---------|--------|
| src/components/product/PricePanel.tsx:16 | TypeScript prop | flexpay?: Flexpay | Remove prop |
| src/lib/product-data.ts:31-42 | TypeScript interface | FlexpayOption, Flexpay | Remove interfaces |
| data/scrape/homepage.json:124 | JSON field | "Pay at your pace with flexpay" | Remove entry |
```

### Phase 2: Source code changes (src/)

Work through source files methodically:

**TypeScript interfaces and types:**
- Remove `Flexpay`, `FlexpayOption` interfaces from `product-data.ts`
- Remove `flexpay` property from `ProductDetail` interface
- Remove any flexpay merge logic in product data assembly
- Remove collection-related fields (`collectionAvailable`, `collectionTime`, `collectionFree`) from delivery interfaces

**React components:**
- Remove finance/flexpay rendering blocks (JSX sections showing monthly payments, APR info, finance CTAs)
- Remove in-store collection rendering blocks (JSX sections showing "FREE in-store collection in as little as 1 HOUR")
- Remove unused imports after content removal
- If a component prop is no longer used after removal, remove the prop from the interface and all call sites

**Key files to check:**
- `src/components/product/PricePanel.tsx` — flexpay display, collection info
- `src/components/category/ProductListCard.tsx` — collection badge/text
- `src/app/products/[slug]/page.tsx` — product detail collection section
- `src/lib/product-data.ts` — interfaces and data merging
- `src/components/layout/AnnouncementBar.tsx` — "order & collect" messaging
- `src/components/layout/USPBar.tsx` — "Free order & collect" USP item
- `src/components/layout/SecondaryNav.tsx` — "Spread the cost" nav link
- `src/components/layout/Footer.tsx` — finance/collection links

### Phase 3: Data file changes (data/)

For JSON data files, remove finance and collection entries but preserve the rest of the data structure:

- **homepage.json**: Remove "Spread the cost" nav links, "Pay at your pace" USP items, credit representative text, interest-free offer banners, "order & collect" announcement bar text and USP items
- **product-example.json**: Remove `monthlyPayment`, `flexpay`, and collection fields from delivery info
- **Category JSONs** (category-tvs.json, soundbars.json, etc.): Remove interest-free banners, APR references, collection availability text from product entries
- **Hub JSONs** (hub-tv-accessories.json, hub-dvd-blu-ray.json, etc.): Remove "collect in-store" service descriptions and flexible credit links
- **Individual product JSONs** (data/scrape/products/*.json): Remove flexpay and collection fields

For bulk JSON changes across hundreds of product files, write a Node.js script rather than editing each file manually:

```js
// scripts/strip-finance-collect.js
// Reads each product JSON, removes finance/collection fields, writes back
```

### Phase 4: Script changes (scripts/)

Check data pipeline scripts for references to finance/collection fields:
- `generate-product-details.js` — may copy flexpay data
- `build-all-categories.js` — may include collection fields
- Remove any field mappings for stripped content

### Phase 5: Verify and summarize

After all changes:

1. **Grep verify** — run a final search for all finance and collection terms to confirm nothing was missed
2. **Build check** — run `npm run build` to catch any TypeScript errors from removed interfaces/props
3. **Fix any breakage** — missing imports, undefined references, type errors from removed fields

Present a summary:

```
## Strip Finance & Collection — Summary

### Removed
- X finance references across Y files
- X collection references across Y files

### Files modified
- src/lib/product-data.ts (removed Flexpay interfaces)
- src/components/product/PricePanel.tsx (removed flexpay prop)
- ... etc

### Files created
- scripts/strip-finance-collect.js (bulk JSON cleaner)

### Verified
- npm run build: PASS
- Remaining finance terms: 0
- Remaining collection terms: 0 (excluding product model numbers)
```

## Important Notes

- **Don't remove "in-store" from returns/gift-card pages** where it refers to returning items or redeeming gift cards — those are legitimate even without physical stores, and removing them would leave incomplete sentences. Only remove content that promotes collection as a delivery/purchase method.
- **Watch for APR in product model numbers** — Sony headphones like "MDR-EX110APR" contain "APR" but it's a color code (Red), not a finance term. Don't touch these.
- **Preserve JSON structure** — when removing fields from JSON objects, ensure the resulting JSON is still valid (no trailing commas, correct nesting).
- **Announcement bar** — if the only announcement is about collection, replace it with a delivery-focused message rather than leaving it empty.
- **USP bar** — if removing a USP item leaves a gap, check that the remaining items still look balanced in the layout.
