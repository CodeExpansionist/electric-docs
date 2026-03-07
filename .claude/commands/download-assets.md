Download all non-product static assets from the reference site — brand logos, spec icons, badge images, navigation icons, fonts, and promotional images. Ensures zero external asset dependencies at runtime.

**Pipeline position:** 10/32 — depends on: `/scrape-content`, `/scrape-products` | feeds into: `/verify-coverage`, `/audit-data`, `/content-parity`

**Usage:** `/download-assets` — runs against the current project's scraped data files

Optionally: `/download-assets <type>` where `$ARGUMENTS` is a specific asset type to download (e.g., `fonts`, `icons`, `logos`, `banners`). Omit to download all.

---

## Golden Rule

**Full independence.** Every asset the clone renders must be served locally — fonts, icons, logos, banner images, badge SVGs. After this runs, the app must work with no network access to any external domain. Not a single request to the reference site.

---

## Prerequisites

- Scraped data files must exist in `data/scrape/` (run `/map-site`, `/scrape-content`, `/scrape-products` first)
- These files contain the asset URLs to download

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` calls in this skill MUST include:
`location: { country: "{country}", languages: ["{language}"] }`

---

## Steps

### 1. Collect all asset URLs from scraped data

Scan all JSON files in `data/scrape/` for non-product image/asset URLs. Categorize them:

**Brand logos** — Found in:
- Hub page `brandRow[].logo`
- Big brand deals cards
- Product badges

**Spec icons** — Found in:
- Product detail `keySpecs[].icon` (SVG URLs for spec icons like HDMI, WiFi, etc.)
- Filter icons

**Badge/tag images** — Found in:
- Product `badges[].image`
- Award logos
- Energy rating images

**Promotional images** — Found in:
- Homepage hero carousel `heroCarousel[].image`
- Discover offers cards
- Big brand deals cards
- Hub page editorial sections
- Promo banners
- Article card images

**Navigation icons** — Found in:
- Shop deals category icons
- Hub page subcategory icons
- USP bar icons
- Footer social media icons

**Site branding** — Found in:
- Logo (main site logo)
- Favicon
- Apple touch icon

### 1b. Scan source code for hardcoded asset URLs

Before downloading from data files alone, also scan `src/` for external asset URLs that may be hardcoded directly in components:

- Grep `src/` for `https://` in image-related patterns: `src=`, `background-image`, `url(`, `Image` component props
- Check `src/lib/*-context.tsx` files for seed/demo data with external image URLs
- Check any component that renders product images outside of the `toLocalImage()` pipeline

Include any findings in the asset collection alongside data file URLs. This catches assets hardcoded in components that aren't in any `data/scrape/` file — e.g., demo basket items, default saved items, or seed order images.

### 2. Download fonts

Check `data/design-tokens.json` and `data/scrape/branding.json` for font family names.

Use `firecrawl_scrape` on the reference site's CSS to find `@font-face` declarations:
- Extract font file URLs (woff2, woff, ttf)
- Download font files and reference them in `src/app/globals.css`

**Note:** This project does not use a `public/fonts/` directory. Fonts are loaded via `@font-face` rules in `globals.css` pointing to CDN or system font stacks. If custom font files are needed, create the directory and update `globals.css` accordingly.

### 3. Download icons and SVGs

Download all spec icons, badge images, and navigation icons:

```
public/images/icons/
  {icon-name}.svg    — Flat directory, asset counts computed from scraped data
                     — Includes: spec icons, badge icons, nav icons, social icons
                     — No subdirectories (spec/, badges/, nav/, social/, energy/)
```

For SVG files:
- Download the raw SVG
- Validate it's a valid SVG (not an error page)
- Strip any inline references to external domains

### 4. Download brand logos

```
public/images/brands/
  {brand-a}.svg (or .png)
  {brand-b}.svg
  {brand-c}.svg
  ...
```

File names should be lowercase, slugified versions of the brand name (e.g., `samsung.svg`, `lg.svg`).

### 5. Download promotional/content images

```
public/images/banners/
  {slug}.webp     — All promotional images in a flat directory (asset counts computed from scraped data)
                  — Includes: hero carousel banners, offer cards, editorial images,
                    buying guide thumbnails, article cards, promo banners
                  — No subdirectories (hero/, offers/, editorial/, etc.)
```

### 5b. Validate asset integrity

After downloading, validate each asset file:

- **SVGs:** Must start with `<svg` or `<?xml`. If it starts with `<html` or `<!DOCTYPE`, it's an error page, not an SVG.
- **Images (PNG/JPG/WebP):** Must have valid magic bytes (PNG: `\x89PNG`, JPEG: `\xFF\xD8\xFF`, WebP: `RIFF`). Files under 100 bytes are almost certainly errors.
- **Fonts (WOFF2/WOFF):** Must have valid headers (`wOF2` for WOFF2, `wOFF` for WOFF).
- **Any file under 100 bytes:** Flag as likely error page or empty response.

Log: "Asset integrity: X/Y valid, Z corrupt/error files detected"

Delete and re-download any corrupt files. If re-download fails, flag as missing.

### 6. Download site branding assets

```
public/images/
  brand-logo.svg          — Main site logo
  brand-logo-white.svg    — White variant (for dark backgrounds)
  favicon.ico
  apple-touch-icon.png
```

### 7. Verify asset path resolution

Components resolve asset paths directly via local path constants and the `toLocalImage()` pipeline in `src/lib/images.ts` — there is no separate `asset-map.json` file.

After downloading, verify that:
- Banner images are referenced in components using `/images/banners/{slug}.webp` paths
- Icon SVGs are referenced using `/images/icons/{name}.svg` paths
- Brand logo is referenced using `/images/{brand-logo}.svg`
- No component reads from a nonexistent `asset-map.json`

**DO NOT modify the original JSON files in `data/scrape/`.** The source data is the ground truth from scraping and must remain unchanged. Components resolve asset URLs at render time via `src/lib/images.ts` and hardcoded local path constants.

### 8. Verify and report

```
## Asset Download Report

Fonts:
- Font families found: X
- Font files downloaded: X
- Saved to: public/fonts/

Icons & SVGs:
- Spec icons: X downloaded
- Badge images: X downloaded
- Navigation icons: X downloaded
- Social icons: X downloaded
- Energy labels: X downloaded

Brand logos: X downloaded

Promotional images:
- Hero banners: X
- Offer cards: X
- Editorial images: X
- Article thumbnails: X
- Promo banners: X

Site branding:
- Logo: [downloaded/missing]
- Favicon: [downloaded/missing]
- Apple touch icon: [downloaded/missing]

Total assets: X files, X MB
External URLs remaining: X (should be 0)

Failed downloads:
- [URL] [type] [error]
```

---

## Critical Rules

- **Every asset must be local.** After this runs, grep the entire `src/` and `data/` directories for external URLs — there should be zero that are loaded at runtime.
- **SVGs must be clean.** Strip any embedded references to external domains, tracking pixels, or analytics scripts inside SVG files.
- **Fonts must match exactly.** If the reference site uses a custom typeface, download the actual font files. Don't substitute with a similar Google Font.
- **Don't skip "small" assets.** A missing 2KB icon SVG is just as visible as a missing 200KB banner image.
- **Components resolve paths directly.** There is no `asset-map.json`. Components use local path constants (`/images/banners/...`, `/images/icons/...`) and the `toLocalImage()` pipeline in `src/lib/images.ts` to resolve asset paths. The scraped JSON files stay unchanged (source of truth).
