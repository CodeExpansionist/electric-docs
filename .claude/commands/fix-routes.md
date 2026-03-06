Debug and repair routing mismatches between navigation links and category data. Cross-references all nav links against categoryMap keys, detects common slug mistakes, and generates fixes.

**Pipeline position:** 16/32 — depends on: `/scaffold-project`, `/build-component` | feeds into: `/link-check`, `/smoke-test`

**Usage:** `/fix-routes` — audits all routes

Optionally: `/fix-routes <component>` where `$ARGUMENTS` is a specific component to audit (e.g., `MainNav`, `ShopDeals`, `Footer`). Omit to audit all.

---

## Golden Rule

**Every link must resolve.** If a navigation component renders a link to `/{section-slug}/{category-slug}`, there must be a matching key in `categoryMap` that resolves to real product data. No dead ends. No empty pages. No fuzzy-matching band-aids hiding broken routes.

---

## Prerequisites

- `src/lib/category-data.ts` with `categoryMap` defined (note: `categoryMap` is not exported — grep the file for its keys rather than importing it)
- Navigation components in `src/components/layout/`
- `memory/routing-patterns.md` (auto-memory reference, optional but helpful)

---

## Steps

### 1. Extract all categoryMap keys

Read `src/lib/category-data.ts` and extract every key from the `categoryMap` object. These are the valid slugs.

```
Valid categoryMap keys (example — read actual keys from category-data.ts):
1. {parent-category}/{child-category}
2. {single-segment-category}
3. {parent}/{mid-level}/{leaf-category}
4. ...
```

### 2. Extract all navigation links

Read every component that renders `/{section-slug}/*` links:

**Files to scan:**

- `src/components/layout/MainNav.tsx` — top navigation bar
- `src/components/layout/ShopDeals.tsx` — homepage category grid
- `src/components/layout/Footer.tsx` — footer columns
- `src/components/layout/SubFooter.tsx` — sub-footer links
- `src/components/layout/SecondaryNav.tsx` — secondary navigation
- `src/components/layout/HeroCarousel.tsx` — hero CTA links
- `src/components/layout/AnnouncementBar.tsx` — announcement links
- `src/components/category/HubSidebar.tsx` — hub page sidebar category links
- Any other component with `/{section-slug}/` href values

For each link, extract:
- The full href path
- The slug portion (everything after `/{section-slug}/`)
- The component and line number

### 3. Cross-reference links against categoryMap

For each navigation link slug, check if it exists as a categoryMap key:

```
Link Cross-Reference:
| Component | Line | Link Slug | categoryMap Match | Status |
|-----------|------|-----------|-------------------|--------|
| MainNav | 15 | {parent}/{child} | {parent}/{child} | MATCH |
| MainNav | 18 | {shortened-slug} | (none) | BROKEN |
| ShopDeals | 42 | {truncated-slug} | (none) | BROKEN |
| ShopDeals | 45 | {category-a}/{category-a} | {category-a}/{category-a} | MATCH |
```

### 4. Detect common slug mistakes

Check each broken link against common mispattern categories:

**Shortened slugs:**
- Link: `{leaf-slug}` → Actual key: `{parent}/{mid-level}/{leaf-slug}`
- Fix: Use the full multi-segment path, not a shortened version

**Singular/plural mismatches:**
- Link: `{category}` (singular) → Actual key: `{categories}` (plural) or vice versa
- Check both forms when debugging broken routes

**Missing parent segments:**
- Link: `{leaf-slug}` → Actual key: `{parent}/{mid-level}/{leaf-slug}`
- The child slug exists but needs its full parent path

**Hyphenation differences:**
- Link: `{slug-without-hyphens}` → Actual key: `{slug-with-hyphens}`
- E.g., "bluray" vs "blu-ray", compound words may differ

**Hub page vs listing page confusion:**
- Link: `{section-slug}` → This is the hub page (separate route), not a category listing

### 5. Check catch-all route handling

Read `src/app/tv-and-audio/[...category]/page.tsx` and verify:

1. It uses `[...category]` catch-all (not `[category]` single-segment) if multi-segment slugs exist
2. The slug joining logic is correct: `params.category.join('/')` produces the key format used in categoryMap
3. Fuzzy matching (if present) logs warnings when activated — fuzzy matches hide broken routes
4. Check `categoryAliases` in `category-data.ts` — these map alternative slug spellings to canonical keys
5. Check `subcategoryKeywords` in `category-data.ts` — these provide keyword-based resolution as a fallback when exact slug matching fails

### 6. Generate fixes

For each broken link, generate the specific fix:

```typescript
// Component.tsx line N
// BEFORE (broken):
{ label: "{Category}", href: "/{section-slug}/{shortened-slug}" }
// AFTER (fixed):
{ label: "{Category}", href: "/{section-slug}/{parent}/{mid-level}/{full-slug}" }
```

Or, if the categoryMap key should be simplified:
```typescript
// category-data.ts — add alias
// "{shortened-slug}" → redirect to full key
```

### 7. Apply fixes and verify

1. Apply each fix to the component file
2. If adding categoryMap aliases, update `category-data.ts`
3. Run the dev server and click each fixed link to verify it loads a page with products

### 8. Output report

```
## Route Fix Report

### Links Audited

| Source | Total Links | Matched | Broken | Fixed |
|--------|-------------|---------|--------|-------|
| MainNav | 12 | 10 | 2 | 2 |
| ShopDeals | 8 | 7 | 1 | 1 |
| Footer | 15 | 13 | 2 | 2 |
| Other | 5 | 5 | 0 | 0 |
| **Total** | **40** | **35** | **5** | **5** |

### Fixes Applied

| # | Component:Line | Before (broken) | After (fixed) | Type |
|---|---------------|-----------------|---------------|------|
| 1 | MainNav:18 | /{shortened-slug} | /{parent}/.../{full-slug} | Shortened slug |
| 2 | ShopDeals:42 | /{truncated} | /{full-category-path} | Truncated path |
| 3 | Footer:89 | /{singular} | /{plural-form} | Singular→plural |

### Verification

All fixed links tested on dev server:
- MainNav:18 → loads products — PASS
- ShopDeals:42 → loads hub page — PASS
- Footer:89 → loads products — PASS
- ...

Route catch-all: [...category] — handles all multi-segment slugs — PASS
```

---

## Critical Rules

- **Exact slug matching is the goal.** Fuzzy matching is a band-aid, not a solution. If fuzzy matching catches a route, that's a bug to fix — not a feature to rely on.
- **Read the actual categoryMap.** Don't assume slug patterns — read `category-data.ts` and use the exact keys defined there.
- **Multi-segment slugs need full paths.** `sound-bars` alone won't resolve if the key is `dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars`. Always use the complete path.
- **Test every fix on the dev server.** A link that resolves to a categoryMap key can still show an empty page if the data file is missing. Click through to verify products appear.
- **Check routing-patterns.md.** If `/map-site` generated this file, it documents known slug pitfalls. Use it as a reference.
- **Don't modify slugs in data files.** Fix the links in components to match the data, not the other way around. The data slugs come from the real site and are the source of truth.
