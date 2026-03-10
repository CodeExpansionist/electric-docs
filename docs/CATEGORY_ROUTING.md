# Category Routing

## Overview

Category pages live under `/tv-and-audio/[...category]`. The `[...category]` catch-all receives an array of URL slug segments (e.g., `["speakers-and-hi-fi-systems", "portable-bluetooth-speakers", "sony"]`).

The routing algorithm in `src/lib/category-data.ts` resolves these slugs to product data through a 2-phase lookup.

## Category Keys

These are the direct keys in `categoryMap`. Each maps to a factory function that returns `CategoryData`:

| Key | Display Name | Data File |
|-----|-------------|-----------|
| `televisions/tvs` | TVs | `category-tvs.json` |
| `dvd-blu-ray-and-home-cinema` | DVD, Blu-ray & Home Cinema | `dvd-blu-ray.json` |
| `dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars` | Sound Bars | `soundbars.json` |
| `speakers-and-hi-fi-systems` | HiFi & Speakers | `speakers-hifi.json` |
| `tv-accessories` | TV Accessories | `tv-accessories.json` |
| `digital-and-smart-tv` | Digital & Smart TV | `digital-smart-tv.json` |
| `headphones/headphones` | Headphones | `headphones.json` |
| `tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets` | TV Wall Brackets | `tv-wall-brackets.json` |
| `tv-accessories/cables-and-accessories` | Cables & Accessories | `cables-accessories.json` |
| `tv-accessories/remote-controls` | Remote Controls | `remote-controls.json` |
| `tv-accessories/tv-aerials` | TV Aerials | `tv-aerials.json` |
| `radios` | Radios | `radios.json` |
| `dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players` | Blu-ray & DVD Players | `blu-ray-dvd-players.json` |
| `dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems` | Home Cinema Systems | `home-cinema-systems.json` |

## Category Aliases

URL paths that redirect to existing `categoryMap` keys:

```typescript
const categoryAliases = {
  "tv-accessories/tv-wall-brackets":
    "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
  "speakers-and-hi-fi-systems/speakers":
    "speakers-and-hi-fi-systems",
};
```

## Routing Algorithm

### Phase 1: Direct Lookup (`lookupCategory`)

Given a full slug string (e.g., `"speakers-and-hi-fi-systems"`):

1. **Exact match**: Check if slug exists as a key in `categoryMap`
2. **Alias match**: Check if slug exists in `categoryAliases`, then look up the target
3. **Suffix match**: Check if any `categoryMap` key ends with the slug (or vice versa)

If any match is found, return the category data.

### Phase 2: Parent + Filter Fallback (`findParentAndFilter`)

If Phase 1 finds nothing, the algorithm tries to resolve the URL as a filtered subset of a parent category.

Given slug segments `["speakers-and-hi-fi-systems", "portable-bluetooth-speakers", "sony"]`:

1. Walk backwards through the segments, trying each prefix as a parent:
   - Try `speakers-and-hi-fi-systems/portable-bluetooth-speakers` as parent
   - Try `speakers-and-hi-fi-systems` as parent
2. When a parent is found, take the remaining segments and check the last one:
   - **Brand check**: Does the last segment match any product's brand in the parent category?
   - **Subcategory check**: Does the last segment match keywords in `subcategoryKeywords`?
3. If products match, filter the parent's product list and return a synthetic `CategoryData` with:
   - Filtered products
   - Recalculated filter option counts
   - Updated breadcrumbs and category name

### Example Resolutions

| URL Path | Resolution |
|----------|------------|
| `/tv-and-audio/televisions/tvs` | Direct match: `categoryMap["televisions/tvs"]` |
| `/tv-and-audio/tv-accessories/tv-wall-brackets` | Alias → `categoryMap["tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets"]` |
| `/tv-and-audio/speakers-and-hi-fi-systems/portable-bluetooth-speakers` | Parent+filter: parent=`speakers-and-hi-fi-systems`, keyword filter="portable" |
| `/tv-and-audio/headphones/headphones/sony` | Parent+filter: parent=`headphones/headphones`, brand filter="Sony" |
| `/tv-and-audio/tv-accessories/cables-and-accessories/hdmi-cables` | Parent+filter: parent=`tv-accessories/cables-and-accessories`, keyword filter="hdmi" |

## Subcategory Keywords

The `subcategoryKeywords` map defines which product text to match for each subcategory slug:

```typescript
// Examples:
"portable-bluetooth-speakers" → ["portable"]
"dolby-atmos-soundbars"      → ["dolby atmos", "atmos"]
"4k-ultra-hd-blu-ray-players" → ["4k", "uhd"]
"hifi-systems"               → ["hi-fi", "hifi", "turntable"]
```

Products are matched by checking if any keyword appears in `(product.name + product.specs).toLowerCase()`.

## Hub Pages

Some parent categories have hub pages (with subcategory icons, brand carousel, help cards) instead of product listings:

| Slug | Hub Data File |
|------|---------------|
| `tv-accessories` | `hub-tv-accessories.json` |
| `dvd-blu-ray-and-home-cinema` | `hub-dvd-blu-ray.json` |
| `speakers-and-hi-fi-systems` | `hub-speakers-hifi.json` |

`isHubCategory()` checks if a slug is a hub. If so, the page renders a hub layout instead of a product listing.

Note: These same slugs also exist in `categoryMap` as product listings. When accessed directly, the hub page is shown. When accessed with subcategory segments appended, the listing page with filtered products is shown.

## Caching

`getCategoryData()` caches results in `categoryCache` (a simple object). Each slug's data is computed once per server lifecycle. The cache is not invalidated — restart the dev server after changing data files.

## Filter Counting

When `mapScrapedData()` processes category data, it recalculates filter option counts from the actual product data using `countMatchingProducts()`. This supports:

- **Brand**: Exact brand name match
- **Price**: Range parsing ("Up to £500", "£500 to £1000", "£2000 and above")
- **Customer Rating**: Minimum star threshold
- **Screen Size**: Regex extraction from product name (supports " and " symbols)
- **TV Technology**: LED/OLED/QLED/Mini LED with exclusion logic
- **Resolution**: 4K/Full HD/HD Ready matching
- **Refresh Rate**: Hz value extraction from specs
- **HDMI Ports**: HDMI port count extraction from specs
- **Year of Release**: Literal match in product name
- **Smart TV Platform**: Text match in name + specs
- **Generic**: Fallback text match in name + specs for other filter types
