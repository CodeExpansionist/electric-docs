Measure performance metrics (Lighthouse scores, Core Web Vitals, bundle sizes) for the clone and compare against the reference site. Identifies optimization opportunities.

**Pipeline position:** 26/32 — depends on: `/strip-external` (recommended) | feeds into: none (verification endpoint)

**Usage:** `/performance-audit` — runs full audit on all key pages

Optionally: `/performance-audit <filter>` where `$ARGUMENTS` is a page name (e.g., `homepage`, `product`), `reference-only` (capture reference scores without testing ours), or `bundle` (analyze build output only). Omit to run all checks.

---

## Golden Rule

**The clone must score within 10 points of the reference site on Lighthouse Performance.** A clone that looks identical but scores 30 points lower is detectably different. Performance is parity.

---

## Prerequisites

- Dev server running (`npm run dev`) or production build available (`npm run build && npm start`)
- `npx lighthouse` available (installed via `npm i -g lighthouse` or npx)
- Reference site accessible

---

## Pages to Audit

| Page | Local URL | Reference URL |
|------|-----------|---------------|
| Homepage | `{dev-server-url}/` | `{reference-site-url}/{section-slug}` |
| Category | `{dev-server-url}/{section-slug}/{category-slug}` | `{reference-site-url}/{section-slug}/{category-slug}` |
| Product | `{dev-server-url}/products/{slug}` | Any product page on the reference site |
| Basket | `{dev-server-url}/basket` | N/A (may require login on reference site) |
| Hub | `{dev-server-url}/{section-slug}` | `{reference-site-url}/{section-slug}` |

---

## Steps

### 1. Run Lighthouse on our pages

**For accurate numbers, use production build:** `npm run build && npm start`. Dev server metrics include hot-reload overhead and are not representative of real performance.

**Note:** `npm run dev` on this project includes `rm -rf .next` — dev server cold starts take extra time due to the cache clear. Factor this in when interpreting startup-related metrics.

For each page, run Lighthouse in both mobile and desktop modes:

```bash
npx lighthouse <url> --output=json --output-path=./lighthouse-{page}-{mode}.json --chrome-flags="--headless" --preset={desktop|mobile}
```

**Note:** Only add `--no-sandbox` if running as root in a Docker/CI container. On macOS and standard Linux desktops, omit it — it disables Chrome's security sandbox.

Extract from each report:
- **Performance** score (0-100)
- **Accessibility** score
- **Best Practices** score
- **SEO** score
- **LCP** (Largest Contentful Paint) — target < 2.5s
- **CLS** (Cumulative Layout Shift) — target < 0.1
- **INP** (Interaction to Next Paint) — target < 200ms
- **FCP** (First Contentful Paint)
- **TBT** (Total Blocking Time)
- **Speed Index**

### 2. Run Lighthouse on reference site

Run the same Lighthouse audit on the reference site pages (mobile + desktop) for comparison.

If `$ARGUMENTS` is `reference-only`, stop after this step.

### 3. Analyze build output

Run the production build and capture bundle analysis:

```bash
npm run build 2>&1
```

Extract from build output:
- Total build time
- Per-page bundle sizes (First Load JS)
- Shared chunks size
- Any build warnings
- Static vs dynamic pages count

### 4. Check image optimization

Scan `public/images/` for optimization issues:

- Any image file > 500KB? (likely needs compression)
- Any non-WebP images being served? (should all be .webp)
- Any images without explicit width/height in components? (causes CLS)
- Total image asset size

### 4b. Check responsive image implementation

Scan all components using `Image` from `next/image` for optimization patterns:

**Priority attribution:**

- Identify the LCP image on each page type (hero banner on homepage, main product image on PDP, first product card on category)
- Verify LCP images have `priority={true}` (skips lazy loading, preloads)
- Verify non-LCP images do NOT have `priority` (wastes bandwidth)

**Lazy loading:**

- Count `Image` components without `priority` — these should lazy-load by default (Next.js does this automatically)
- Check for any manual `loading="eager"` overrides on below-fold images
- Flag gallery thumbnails that load eagerly when only 1-2 are visible above the fold

**Responsive sizing:**

- Check for `Image` components using `fill` prop — verify parent has `position: relative` and explicit dimensions
- Check for `Image` components with static `width`/`height` — verify they also have `sizes` prop for responsive serving
- Flag any `Image` components with `unoptimized` prop (bypasses all optimization)

**Placeholder strategy:**

- Check if any images use `placeholder="blur"` with `blurDataURL` for perceived performance
- Note: this is a MINOR optimization, not a requirement — only flag if LCP images lack it

**Output for this section:**

```markdown
### Responsive Image Audit

| Check | Count | Status |
|-------|-------|--------|
| LCP images with priority | X/Y | OK/WARN |
| Non-LCP images with priority (wasteful) | X | OK/WARN |
| Images using fill + sized parent | X | OK |
| Images with sizes prop | X/Y | OK/WARN |
| Images with unoptimized prop | X | OK/WARN |
| Images with blur placeholder | X | INFO |

LCP images per page:
- Homepage: [component] — priority: [yes/no]
- Category: [component] — priority: [yes/no]
- Product: [component] — priority: [yes/no]
```

### 5. Check font loading

Review font loading strategy:

- Are fonts preloaded in `<head>`? (`<link rel="preload" as="font">`)
- Is `font-display: swap` set in `@font-face`? (prevents FOIT)
- How many font files are loaded? (each is a network request)
- Total font file size

### 6. Check for render-blocking resources

- Any synchronous `<script>` tags? (should be async or defer)
- Any `<link rel="stylesheet">` in `<head>` that blocks render?
- Is CSS critical path optimized? (Next.js usually handles this)

### 7. Output the performance report

```
## Performance Audit Report

### Lighthouse Scores (Mobile)

| Page | Perf | Access | Best Prac | SEO | LCP | CLS | INP |
|------|------|--------|-----------|-----|-----|-----|-----|
| Homepage (ours) | 78 | 95 | 100 | 92 | 2.1s | 0.05 | 120ms |
| Homepage (ref) | 72 | 88 | 95 | 100 | 2.4s | 0.12 | 180ms |
| Category (ours) | ... | ... | ... | ... | ... | ... | ... |
| Category (ref) | ... | ... | ... | ... | ... | ... | ... |

### Lighthouse Scores (Desktop)

| Page | Perf | Access | Best Prac | SEO | LCP | CLS | INP |
|------|------|--------|-----------|-----|-----|-----|-----|
| ... | ... | ... | ... | ... | ... | ... | ... |

### Score Comparison (Ours vs Reference — Mobile)

| Page | Perf Diff | LCP Diff | CLS Diff |
|------|-----------|----------|----------|
| Homepage | +6 (better) | -0.3s (better) | -0.07 (better) |
| Category | -12 (WORSE) | +0.8s (WORSE) | +0.02 (worse) |

### Bundle Analysis

| Page | First Load JS | Status |
|------|---------------|--------|
| / | 142 kB | OK |
| /{section-slug} | 156 kB | OK |
| /{section-slug}/[...category] | 189 kB | REVIEW (> 170kB) |
| /products/[slug] | 201 kB | WARNING (> 200kB) |

Shared chunks: X kB
Total build size: X MB
Build time: Xs

### Image Optimization

- Images > 500KB: X files
  - [path] [size]
- Non-WebP images: X files
- Total image size: X GB
- Images without dimensions in code: X

### Font Loading

- Font files: X (X KB total)
- Preloaded: [yes/no]
- font-display: swap: [yes/no]

### Top 5 Improvements (by impact)

1. [Issue] — [estimated score improvement] — [fix description]
2. [Issue] — [estimated score improvement] — [fix description]
3. ...

Verdict: [PASS: within 10 points on all pages / FAIL: X pages need optimization]
```

---

## Critical Rules

- **Compare against reference, not absolute targets.** If the reference site scores 65 on mobile Performance, we don't need to score 90. We need to score 55-75 (within 10 points).
- **Mobile scores matter more.** Google uses mobile-first indexing. Always report mobile scores prominently.
- **Bundle size is a leading indicator.** If First Load JS exceeds 200kB for any page, flag it — it will hurt Performance score.
- **Don't optimize what the reference doesn't optimize.** If the reference site has a 3.5s LCP on their product page, don't spend time getting ours to 1.5s. Match, don't exceed.
- **Run on production build when possible.** Dev server has hot-reload overhead that inflates metrics. Use `npm run build && npm start` for accurate numbers.
- **CLS is the sneakiest metric.** Images without dimensions, fonts loading late, and dynamic content injection all cause CLS. Check each specifically.
- **Re-run after fixes.** Performance improvements should be verified with a fresh Lighthouse run, not assumed.
