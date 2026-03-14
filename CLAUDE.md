# CLAUDE.md — Electric Project Instructions

Pixel-perfect clone of Electriz TV & Audio section (electriz.co.uk). Next.js 15 App Router, Tailwind CSS 3, React 18, TypeScript 5. All build phases complete — current work is content expansion across all categories, data pipeline work, and visual refinements.

## Commands

```bash
npm run dev        # Dev server — use port 3001 (see post-edit workflow)
npm run build      # Production build
npm run lint       # ESLint check
npm run preflight  # Regenerate repo-facts.json + audit docs for drift
npm run facts      # Regenerate data/repo-facts.json only
npm run audit      # Run doc audit only (needs repo-facts.json to exist)
```

## Core rules

1. **No external dependencies.** This is an independent MVP — zero external requests at runtime. All images are local: product images in `public/images/products/`, banners in `public/images/banners/`, icons in `public/images/icons/`. `src/lib/images.ts` maps scraped CDN URLs to local paths. Never add new external image sources.
2. **Match the reference visually.** The design is cloned for fidelity, but all assets and data are self-contained. No dark mode, extra animations, or features the reference doesn't have. "Electriz" is a placeholder brand name.
3. **Screenshots are truth.** 18 references in `reference-screenshots/`. Screenshot > scrape data. See `docs/PROJECT_SPEC.md` for mappings.
4. **Real data only.** Content from `data/scrape/`, tokens from `data/design-tokens.json`. No placeholders, no hardcoded data.
5. **Section-by-section.** One section at a time, compare against reference before moving on.

## Two layers of every fix

Every fix has two layers. **Update both in the same session.**

### Layer 1: Project fix (THIS site)

Changes go into: `src/`, `data/`, `scripts/`, `public/`, `.claude/project-config.md`

The specific fix — code changes, config values, data corrections. Project-specific values (domain names, component names, CDN patterns, counts) live here, never in skills.

### Layer 2: Methodology update (ALL future sites)

Changes go into: `.claude/commands/*.md`

After every project fix, ask: **"Would a skill have caught this earlier? If not, what step was missing?"** If a step was missing, add it to the relevant skill(s) — but as a generic discovery method, not a hardcoded answer.

**Example — same bug, both layers:**

- **Layer 1**: Fix the filter code so Samsung matches case-insensitively. Add the brand to `project-config.md` if needed.
- **Layer 2**: Add "test brand filters for case sensitivity" as a step in `/fix-filters`. No mention of Samsung — just the test method.

### Skill authoring rules (when editing skills)

1. **Teach the method, not the answer.** Every instruction must explain HOW to discover/extract/replicate a detail — never assume WHAT that detail is. Wrong: "Apply the Samsung brand filter." Right: "Apply a brand filter using a brand known to exist in the data."
2. **Site-specific values go in `project-config.md` only.** Domain names, locale codes, CDN patterns, component names, category slugs, product counts, currency symbols — all belong in `.claude/project-config.md`. Skills reference them as `{placeholder}` (e.g., `{section-slug}`, `{country}`, `{reference-domain}`).
3. **The AO.com test.** Before saving a skill edit, ask: "If I were cloning AO.com (appliances/electronics) instead of this project, would every instruction still make sense?" If not, the instruction is too specific.
4. **Examples use placeholders.** Code examples use `{country}`, `{language}`, `{cdn-host}`, `{section-slug}`, etc. When a concrete example helps clarity, show multiple verticals: "e.g., screen size for electronics, dress size for fashion, weight for grocery."
5. **No hardcoded counts.** Never write "14 categories" or "2,321 products." Use "count from category index" or "all products in the data" — let the data speak for itself.
6. **Validate after editing.** After any skill edit, run: `grep -rn 'electriz\|currys\|tv-and-audio\|electrizprod\|currysprod' .claude/commands/ --include='*.md'` — replace the grep terms with whatever the current project's site-specific terms are. Zero matches = pass.

## Post-edit workflow (MANDATORY)

A task is not complete when code is written. It is complete only when the affected page is live and verified on http://localhost:3001.

After every edit session, run in order:

1. Verify whether `npm run build` is required:
   - Required for final handoff
   - Required if package/config/build-sensitive files changed
   - Otherwise optional during iterative UI work

2. If ANY of these changed during the session: `.md` files, `package.json`, `scripts/`, `.env.example`, `data/repo-facts.json` → run `npm run preflight`. Fix issues and rerun once if needed.

3. Clear conflicting dev processes:
   ```bash
   lsof -ti:3001 | xargs kill -9 2>/dev/null
   lsof -ti:3000 | xargs kill -9 2>/dev/null
   ```

4. Start the dev server on port 3001 and wait for readiness:
   ```bash
   PORT=3001 npx next dev &
   ```
   Do not proceed until the dev server is ready.

5. Verify the exact changed route:
   ```bash
   curl -s -o /tmp/route_check.html -w "%{http_code}" --max-time 10 http://localhost:3001/<changed-route>
   ```
   Required:
   - Status must be 200
   - Response body must not contain known error markers, including:
     - `Internal Server Error`
     - `missing required error components`
     - `"source":"server"`
     - webpack/module/runtime crash strings
   - Server logs must not show runtime / webpack / module / server errors for the request

6. If the route hangs, fails, returns non-200, or shows runtime markers:
   - Debug automatically
   - If corruption is suspected, escalate with:
     ```bash
     rm -rf .next node_modules/.cache
     ```
   - Restart and re-verify before reporting completion

Never report completion until verification passes.
Never switch away from port 3001 unless explicitly instructed.
Never revert unrelated changes.
Never assume browser cache is the issue without backend evidence.
Never change the port, server command, or environment assumptions mid-task.

When reporting completion, always include:
- Exact URL verified
- HTTP status code received
- Whether server logs were checked for errors
- Whether stale processes were cleared
- Confirmation that the page is ready to open

If only `src/` component/styling/layout changes were made with no docs/scripts/data/package changes, skip step 2. A pre-commit hook also enforces step 2 — see `docs/GIT_HOOKS.md`. Install once with `bash scripts/install-git-hooks.sh`.

## Gotchas

- **`.next` cache**: NEVER delete `.next/` while dev server is still running. Always kill the server first. The post-edit workflow above handles this.
- **Category slugs**: URL slugs must match keys in `categoryMap` in `src/lib/category-data.ts`. Fallback matching (suffix/prefix) exists but doesn't catch all mismatches. See auto-memory `routing-patterns.md` for the full slug list.
- **Images**: All local. Products at `public/images/products/{id}/{type}.webp`, banners at `public/images/banners/{slug}.webp`, icons at `public/images/icons/{slug}.svg`. `src/lib/images.ts` parses scraped CDN URLs → local paths. A subset of products use M-prefix Amplience URL format.
- **Image ordering**: Firecrawl extracts gallery images in DOM order, which is **not** reliably the display order. ~5% of products had the base image buried mid-array. `mergeScrapedData()` in `product-data.ts` sorts both gallery and thumbnail arrays by CDN URL suffix (`getImageSortKey()` in `images.ts`) before converting to local paths. If you re-scrape products or change image merging, preserve this sort step.
- **Mass changes**: When renaming or replacing text across the project, search ALL directories (`src/`, `data/`, `scripts/`, root docs) not just source code. The `data/scrape/` folder has thousands of JSON files with embedded URLs. Always verify with a project-wide grep afterward.
- **No external URLs in `<img>` or `Image` src**: Every image source must resolve to a local `/images/...` path. If you find a component using a CDN URL in its `src`, download the asset locally and update the reference.
- **Size-range URL routing**: Routes like `/tvs/24-31` or `/tvs/90-and-more` are numeric filter ranges, not category slugs or keywords. `findParentAndFilter()` in `category-data.ts` has dedicated regex detection for these patterns — it must run *before* the keyword/brand fallback, or the filter returns zero results.

## Data pipeline (at a glance)

Core sequence: scrape category pages → build categories → generate product details → build products index → download images → verify coverage. TV-specific scripts handle family grouping and size variants.

All scripts in `scripts/`. Full pipeline detail + Firecrawl best practices: [docs/DATA_PIPELINE.md](docs/DATA_PIPELINE.md).

## Key paths

**App logic**

- `src/lib/category-data.ts` — categoryMap, banner configs, filter logic
- `src/lib/product-data.ts` — product detail merging (category + scraped data)
- `src/lib/images.ts` — scraped CDN URL → local path parser
- `src/lib/constants.ts` — SITE_URL, stripDomain utility

**Data**

- `data/scrape/` — category JSONs + `products/` individual product JSONs
- `data/design-tokens.json` — colors, fonts, spacing, radii (use these over Tailwind defaults)

**Generated (do not edit manually)**

- `data/repo-facts.json` — run `npm run facts` to regenerate

## Conventions

- **Styling**: Tailwind with custom tokens from `design-tokens.json` in `tailwind.config.ts`. Token values > Tailwind defaults.
- **Page backgrounds**: Content pages (category listings, product detail, hub pages) use `bg-surface` (`#F2F2F2`) as the full-page background with white cards for content. Homepage stays white. Header components: SecondaryNav and USPBar use `bg-surface`, Header and MainNav use `bg-white`.
- **State**: React Context for basket/saved/orders. Checkout state is component-local.
- **API**: `/api/search` — search results + autocomplete (used by search page).
- **Git**: Commit per section `feat(section): add [page] [section-name]`. Auto-commit and push after every implementation per workspace rules.
