Generate a structured handoff document before a session ends or context fills up. Captures build progress, active issues, decisions made, and exact next steps — so the next session can resume without re-reading files or re-discovering decisions.

**Pipeline position:** 32/32 — Maintenance (on-demand) — depends on: none | feeds into: next session

**Usage:** `/session-handoff` — generates handoff document from current session state

---

## Golden Rule

**Specific, not summary.** "Working on product pages" is useless. "Product detail page gallery: thumbnails 1-6 render correctly, thumbnails 7-12 show fallback. Bug is in `ProductGallery.tsx:47` where `gallery_` prefix doesn't match files named `gallery_007.webp`. Fix: change regex from `/gallery_(\d+)/` to `/gallery_0*(\d+)/`." — that's a handoff.

---

## Steps

### 1. Capture build progress

Document what has been built, what's in progress, and what hasn't started:

```markdown
## Build Progress

### Completed
- [x] Project scaffold (all routes, types, data layer)
- [x] Header + MainNav (matches reference)
- [x] Footer (matches reference)
- [x] Homepage hero carousel (3 slides, auto-rotate working)
- [x] Product card component (used in category grid + sponsored)

### In Progress
- [ ] Product detail page — gallery works, price panel needs was-price styling
  - File: src/app/products/[slug]/page.tsx
  - Blocked by: PricePanel was-price format (line 89 — renders "null" when no was-price)

### Not Started
- [ ] Search page
- [ ] Admin dashboard
- [ ] Checkout flow
```

### 2. Capture active issues

List every known bug or issue, with exact file paths and line numbers:

```markdown
## Active Issues

### Critical (blocks further progress)
1. **PricePanel shows "null" for was-price**
   - File: src/components/product/PricePanel.tsx:89
   - Cause: Renders `price.was` without null check
   - Fix: Add `{price.was && <span className="...">Was £{price.was}</span>}`

### Non-Critical (can fix later)
2. **Gallery thumbnail 7-12 show fallback**
   - File: src/components/product/ProductGallery.tsx:47
   - Cause: Regex expects `gallery_7` but files are `gallery_007`
   - Fix: Update regex to handle zero-padded numbers

3. **React key warning on category page**
   - File: src/app/{section-slug}/[...category]/page.tsx:{line}
   - Cause: Using array index as key in product grid
   - Fix: Change `key={index}` to `key={product.productId}`
```

### 3. Capture decisions made

Record architectural and implementation decisions so the next session doesn't re-debate them:

```markdown
## Decisions Made

1. **Route type:** Using `[...category]` catch-all (not `[category]`) because slugs go 3 segments deep
2. **Data loading:** Static JSON imports (not `fs.readFileSync`) per CLAUDE.md requirement
3. **Image mapping:** All images through `toLocalImage()` — CDN regex handles standard + M-prefix patterns
4. **Scope:** Target section only (TV & Audio) — MainNav shows all sections but only target section links are functional
5. **Port:** Dev server URL (from `package.json`) — check the `dev` script for port configuration
```

### 4. Capture server and environment state

```markdown
## Environment State

- Dev server: running at {dev-server-url} (pid: {pid})
- Git branch: main
- Last commit: abc1234 "feat: add product detail page"
- Uncommitted changes: 5 files (src/components/product/PricePanel.tsx, ...)
- .next cache: clean (no corruption)
- Node version: 18.x
- npm packages: up to date
```

### 5. Capture which screenshots have been matched

```markdown
## Screenshot Parity

| Screenshot | Page | Status | Notes |
|-----------|------|--------|-------|
| 01-homepage.png | / | 90% match | Hero needs CTA button color fix |
| 02-category.png | /{section-slug}/{category-slug} | 85% match | Filter sidebar width off by ~20px |
| 03-product-detail.png | /products/[slug] | 70% match | Gallery and specs done, cross-sells not started |
| 04-basket.png | /basket | Not started | — |
```

### 6. Define exact next steps

Not vague goals — specific, actionable steps with file paths:

```markdown
## Next Steps (in order)

1. Fix PricePanel null was-price → `src/components/product/PricePanel.tsx:89`
2. Fix gallery thumbnail regex → `src/components/product/ProductGallery.tsx:47`
3. Build cross-sell carousel on product detail page
   - Data: `data/scrape/products/{id}.json` → `crossSellProducts[]`
   - Layout: `data/scrape/layouts/cross-sell-carousel.json`
   - Reference: screenshot 03, bottom section
4. Build basket page
   - Reference: screenshot 04-basket.png
   - Data: basket context + product data lookup
5. Run `/content-parity` on completed pages
```

### 7. Save the handoff document

Save to: `.claude/session-handoff.md`

**Max 500 lines.** This is a handoff, not a history. If it's longer than 500 lines, cut the least important sections.

If a previous handoff exists, archive it as `.claude/session-handoff-{date}.md` before overwriting.

### 8. Report to user

```
## Session Handoff Generated

Saved to: .claude/session-handoff.md

Summary:
- Completed: X components/pages
- In progress: X (with Y blocking issues)
- Not started: X
- Active bugs: X critical, Y non-critical
- Next session starts at: [first next step]

The next session should read .claude/session-handoff.md before starting any work.
```

---

## Critical Rules

- **File paths + line numbers.** Every issue, every in-progress item, every next step must include the exact file path and line number. "The product page has a bug" is not a handoff.
- **Max 500 lines.** Force prioritization. If you can't fit everything, cut the least impactful items.
- **Decisions are permanent unless overridden.** The next session should not re-decide things already decided. If a decision needs revisiting, say so explicitly.
- **Server state matters.** Is the dev server running? What port? Any `.next` cache issues? The next session needs to know.
- **Run before context fills.** Don't wait until the session is dying. Run this when you sense context is getting heavy (long conversations, many files read, complex state).
- **Archive, don't overwrite.** Previous handoffs are useful history. Archive before replacing.
