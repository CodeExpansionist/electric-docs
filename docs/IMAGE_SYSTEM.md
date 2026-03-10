# Image System

## Overview

All images are served locally from `public/images/`. There are zero external image requests at runtime. The `remotePatterns: []` setting in `next.config.mjs` enforces this at the framework level.

## Directory Structure

```
public/images/
├── products/
│   └── {productId}/
│       ├── main.webp           # Listing thumbnail (from $g-small$ transform)
│       ├── large.webp          # Gallery main image (from $l-large$ transform)
│       ├── thumb.webp          # Small thumbnail (from $t-thumbnail$ transform)
│       ├── gallery_001.webp    # Gallery variant 1
│       ├── gallery_002.webp    # Gallery variant 2
│       ├── ...                 # Up to gallery_012.webp
│       ├── thumb_001.webp      # Thumbnail variant 1
│       ├── thumb_002.webp      # Thumbnail variant 2
│       └── ...                 # Up to thumb_012.webp
├── banners/
│   └── {slug}.webp             # Promotional banners
├── icons/
│   └── {slug}.svg              # Category icons
└── brand-electriz-logo.svg     # Brand logo
```

## Image Stats

| Type | Format | Typical Size |
|------|--------|-------------|
| Product images (thousands) | WebP | 5–200 KB |
| Banners | WebP | 50–300 KB |
| Icons | SVG | 1–5 KB |
| Brand logo | SVG | 2.4 KB |

## CDN URL Parsing (`src/lib/images.ts`)

Scraped product data contains CDN image URLs in this format:

```
https://media.electriz.biz/i/electrizprod/{productId}?${transform}$&fmt=auto
```

The `toLocalImage()` function parses these URLs and maps them to local paths.

### URL Patterns

| Pattern | Example | Local Path |
|---------|---------|------------|
| Standard | `electrizprod/10282094?$g-small$` | `/images/products/10282094/main.webp` |
| With variant | `electrizprod/10282094_003?$l-large$` | `/images/products/10282094/gallery_003.webp` |
| M-prefix | `electrizprod/M10282426_Black?$g-small$` | `/images/products/10282426/main.webp` |
| Thumbnail | `electrizprod/10282094?$t-thumbnail$` | `/images/products/10282094/thumb.webp` |
| Thumbnail variant | `electrizprod/10282094_002?$t-thumbnail$` | `/images/products/10282094/thumb_002.webp` |
| Legacy domain | `currysprod/10282094?$g-small$` | `/images/products/10282094/main.webp` |

### Regex

```javascript
/(?:currysprod|electrizprod)\/M?(\d{7,8})(?:_[a-zA-Z]+)?(?:_(\d{3}))?\?/
```

- Matches both `currysprod` (legacy) and `electrizprod` (current) domains
- Captures the 7-8 digit product ID
- Strips the optional M-prefix (used by 37 products with Amplience color variants)
- Strips the optional color suffix (e.g., `_Black`)
- Captures the optional variant number (e.g., `_003`)

### Transform → File Type Mapping

| CDN Transform | Image Type | Filename |
|---------------|-----------|----------|
| `$g-small$` | Listing image | `main.webp` |
| `$s-swatch$` | Listing image | `main.webp` |
| `$t-thumbnail$` | Thumbnail | `thumb.webp` / `thumb_{NNN}.webp` |
| `$l-large$` (no variant) | Gallery main | `large.webp` |
| `$l-large$` (with variant) | Gallery image | `gallery_{NNN}.webp` |

## Helper Functions

All in `src/lib/images.ts`:

| Function | Purpose | Example |
|----------|---------|---------|
| `toLocalImage(cdnUrl)` | Convert CDN URL to local path | `toLocalImage("...electrizprod/10282094?$g-small$...")` → `"/images/products/10282094/main.webp"` |
| `toLocalImages(cdnUrls)` | Convert array of CDN URLs | Maps over array |
| `getListingImage(productId)` | Direct path for listing image | `"/images/products/10282094/main.webp"` |
| `getLargeImage(productId)` | Direct path for large image | `"/images/products/10282094/large.webp"` |
| `getGalleryImages(productId, count)` | Generate gallery paths | Array of `large.webp` + `gallery_001.webp` through `gallery_{count}.webp` |
| `getThumbnailImages(productId, count)` | Generate thumbnail paths | Array of `thumb.webp` + `thumb_001.webp` through `thumb_{count}.webp` |
| `getImageSortKey(cdnUrl)` | Sort key from variant suffix | Base image = 0, `_001` = 1, `_002` = 2, etc. |

## Usage in Components

Components should use the helper functions or direct paths, not raw CDN URLs:

```tsx
// Category listing cards — use getListingImage
import { getListingImage } from "@/lib/images";
<Image src={getListingImage(product.productId)} alt={product.name} />

// Product gallery — use the images from ProductDetail
const product = getProductBySlug(slug);
product.images?.gallery.map(src => <Image src={src} />)

// Banner images — use direct local paths
<Image src="/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp" />
```

## M-Prefix Products

Some products use Amplience's M-prefix URL format where multiple color variants share a single base product image:

```
electrizprod/M10282426_Black?$g-small$   → /images/products/10282426/main.webp
electrizprod/M10282426_Silver?$g-small$  → /images/products/10282426/main.webp
```

The `toLocalImage()` regex strips both the `M` prefix and color suffix, so all variants map to the same local image directory.
