---
description: Verify carousel and repeating grid layouts match the reference site — visible item counts, card dimensions, navigation controls, and breakpoint transitions at all viewports.
---

Verify that every carousel and repeating grid on the clone matches the reference site's layout at all responsive breakpoints.

**Pipeline position:** 33 — depends on: `/extract-layout`, `/build-component` | feeds into: `/motion-parity`, `/smoke-test`

**Usage:** `/carousel-parity` — runs full audit across all pages and viewports

---

## Golden Rule

**Count the cards.** The most common carousel bug is showing the wrong number of items at a given viewport. If the reference shows 3 cards at 768px, the clone must show 3 cards at 768px. Dimensions can be close — item count must be exact.

---

## Prerequisites

- Dev server running at localhost
- Reference site accessible
- Firecrawl browser sessions available
- Ideally: `data/scrape/layouts/carousels.json` from `/extract-layout` Step 5b (if missing, this skill extracts from scratch)

---

## Firecrawl Settings

**Locale:** ALL browser sessions MUST set viewport with proper locale headers. Use the locale from `project-config.md` for any `firecrawl_scrape` calls: `location: { country: "{country}", languages: ["{language}"] }`.

**Browser sessions:** Always call `firecrawl_browser_delete` when done. Max session lifetime: 300s with `activityTtl: 180`.

---

## Viewport Sizes

All measurements use these 7 standard widths (height: 900px):

| Width | Category |
|-------|----------|
| 375px | Small mobile (iPhone SE) |
| 428px | Large mobile (iPhone Pro Max) |
| 576px | Phablet / small tablet |
| 640px | Tailwind `sm` breakpoint |
| 768px | Tailwind `md` / iPad portrait |
| 1024px | Tailwind `lg` / laptop |
| 1280px | Tailwind `xl` / desktop |

---

## Phase 1 — Inventory carousels on both sites

1. Open a Firecrawl browser session for the **reference site**
2. Navigate to each key page (homepage, category hub, product detail)
3. Identify all carousels and repeating grids using `page.evaluate()`:

```javascript
() => {
  const results = [];
  // Slick carousels
  document.querySelectorAll('.slick-slider, .slick-initialized').forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const slides = el.querySelectorAll('.slick-slide:not(.slick-cloned)');
    results.push({
      type: 'slick', index: i, selector: el.className.substring(0, 80),
      top: Math.round(rect.top), height: Math.round(rect.height),
      totalSlides: slides.length
    });
  });
  // CSS grids with 3+ uniform children
  document.querySelectorAll('[style*="grid"], [class*="grid"]').forEach((el, i) => {
    const style = getComputedStyle(el);
    if (style.display === 'grid' && el.children.length >= 3) {
      const rect = el.getBoundingClientRect();
      results.push({
        type: 'grid', index: i, selector: el.className.substring(0, 80),
        top: Math.round(rect.top), height: Math.round(rect.height),
        totalSlides: el.children.length
      });
    }
  });
  // Flex overflow containers
  document.querySelectorAll('[style*="overflow"], [class*="carousel"], [class*="scroll"]').forEach((el, i) => {
    const style = getComputedStyle(el);
    if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && el.children.length >= 3) {
      const rect = el.getBoundingClientRect();
      results.push({
        type: 'flex-scroll', index: i, selector: el.className.substring(0, 80),
        top: Math.round(rect.top), height: Math.round(rect.height),
        totalSlides: el.children.length
      });
    }
  });
  return results;
}
```

4. Record: type, selector, page, position on page (top offset), total slide count
5. Repeat for the **clone site** (localhost)
6. Match carousels between sites by page + approximate position

Output: carousel inventory table

```
| Page | Position | Reference Type | Clone Type | Ref Slides | Clone Slides |
|------|----------|----------------|------------|------------|--------------|
| Home | ~220px   | slick (4)      | grid (4)   | 4          | 4            |
| Home | ~800px   | slick (8)      | grid (8)   | 8          | 8            |
```

---

## Phase 2 — Measure visible items at each breakpoint

For EACH matched carousel pair:

1. Set viewport to each of 7 widths listed above
2. On the **reference**, count visible items:

```javascript
(carouselSelector, vw) => {
  const carousel = document.querySelector(carouselSelector);
  if (!carousel) return null;

  // Method 1: Slick active slides
  const activeSlides = carousel.querySelectorAll('.slick-slide.slick-active');
  if (activeSlides.length > 0) {
    const first = activeSlides[0].getBoundingClientRect();
    return {
      visibleCards: activeSlides.length,
      cardWidth: Math.round(first.width),
      cardHeight: Math.round(first.height),
      containerWidth: Math.round(carousel.getBoundingClientRect().width),
    };
  }

  // Method 2: CSS grid columns
  const style = getComputedStyle(carousel);
  if (style.display === 'grid') {
    const cols = style.gridTemplateColumns.split(' ').filter(v => v !== '').length;
    const firstChild = carousel.children[0]?.getBoundingClientRect();
    return {
      visibleCards: cols,
      cardWidth: firstChild ? Math.round(firstChild.width) : 0,
      cardHeight: firstChild ? Math.round(firstChild.height) : 0,
      containerWidth: Math.round(carousel.getBoundingClientRect().width),
    };
  }

  // Method 3: Visible children in flex/scroll container
  const visible = Array.from(carousel.children).filter(c => {
    const r = c.getBoundingClientRect();
    return r.width > 10 && r.left >= -5 && r.right <= window.innerWidth + 5;
  });
  const first = visible[0]?.getBoundingClientRect();
  return {
    visibleCards: visible.length,
    cardWidth: first ? Math.round(first.width) : 0,
    cardHeight: first ? Math.round(first.height) : 0,
    containerWidth: Math.round(carousel.getBoundingClientRect().width),
  };
}
```

3. Measure card dimensions: width, height, computed aspect ratio
4. Measure gap between cards (distance between right edge of card N and left edge of card N+1)
5. Check navigation controls: arrows visible? dots visible? dot count?
6. Repeat all measurements on the **clone**

Output per carousel — comparison table:

```
| Viewport | Ref Items | Clone Items | Match | Ref Card W×H | Clone Card W×H |
|----------|-----------|-------------|-------|--------------|----------------|
| 375px    | 1         | 1           | ✅    | 249×185      | 245×180        |
| 428px    | 1         | 1           | ✅    | 299×224      | 295×220        |
| 576px    | 1         | 2           | ❌    | 438×331      | 254×305        |
| 640px    | 2         | 2           | ✅    | 299×224      | 295×355        |
| 768px    | 3         | 2           | ❌    | 240×288      | 350×420        |
| 1024px   | 3         | 3           | ✅    | 320×369      | 315×380        |
| 1280px   | 3         | 3           | ✅    | 400×471      | 395×475        |
```

---

## Phase 3 — Detect breakpoint transitions

For each carousel, identify WHERE the visible count changes:

1. Starting from 375px, increase viewport width in 20px increments up to 1280px
2. At each width, count visible items on the reference site
3. Record each width where visible item count changes (the "transition point")
4. Repeat for the clone
5. Compare transition points

Output:

```
| Transition | Reference Width | Clone Width | Delta      |
|------------|----------------|-------------|------------|
| 1 → 2     | ~640px         | ~640px      | 0px ✅     |
| 2 → 3     | ~768px         | ~1024px     | +256px ❌  |
```

**BLOCKING** if any transition point differs by more than 50px.

---

## Phase 4 — Navigation control parity

For each carousel at each viewport:

1. **Arrows:** visible on reference? visible on clone? Check for elements matching `[class*="arrow"], [class*="prev"], [class*="next"], [aria-label*="slide"], [aria-label*="Previous"], [aria-label*="Next"]`
2. **Dots/pagination:** visible? count matches slide count? Check for `.slick-dots`, `[class*="dot"]`, `[class*="indicator"]`, `[class*="pagination"]`
3. **Card aspect ratio:** compute width/height ratio. Portrait (ratio < 0.9) vs landscape (ratio > 1.1) vs square (0.9-1.1). Portrait vs landscape mismatch is **BLOCKING**.
4. **Card image source:** at mobile viewports, does the reference use a different image variant (e.g., mobile-optimized landscape banner) vs desktop portrait cards? Log any image `src` pattern differences.

---

## Phase 5 — Report

Generate a summary report:

```
## Carousel Parity Report

**Carousels checked:** N
**Viewports tested:** 7
**Date:** YYYY-MM-DD

### Results

| Carousel | Page | Status | Issues |
|----------|------|--------|--------|
| Hero carousel | Homepage | ❌ FAIL | 768px: ref=3 clone=2; transition 2→3 at 768px vs 1024px |
| Shop Deals | Homepage | ✅ PASS | — |
| Discover Offers | Homepage | ✅ PASS | — |
| Sponsored Products | Homepage | ✅ PASS | — |

### Blocking Issues

1. **Hero carousel at 768px** — Reference shows 3 cards, clone shows 2.
   - Root cause: clone uses `lg` (1024px) breakpoint for 3-column, should use `md` (768px)
   - Fix: change `hidden lg:grid grid-cols-3` to `hidden md:grid grid-cols-3`

2. **Hero carousel transition** — Reference transitions 2→3 at ~768px, clone at ~1024px.
   - Same root cause as above.

### Non-blocking Notes

- Card dimensions within ±20px tolerance at all viewports
- Gap differences < 4px
```

---

## Severity Levels

| Level | Criteria |
|-------|----------|
| **BLOCKING** | Visible item count differs at any viewport |
| **BLOCKING** | Card aspect ratio type differs (portrait vs landscape) |
| **BLOCKING** | Breakpoint transition point differs by >50px |
| **MAJOR** | Navigation controls (arrows/dots) present on reference but missing on clone |
| **MINOR** | Card dimensions differ by >20px but item count matches |
| **INFO** | Gap differs by <4px, minor dimension variance |

---

## Critical Rules

- **Item count is king.** Dimensions can be close; visible count must be exact.
- **Test ALL 7 viewports.** Don't skip intermediate sizes — breakpoint bugs hide at 576px and 640px.
- **Fresh page load.** Measure on fresh navigation, not after manual interaction (some carousels change layout after user clicks).
- **Both sites, same viewport.** Always measure reference and clone at the same width in the same session to avoid browser rendering differences.
- **Log selectors.** Record the CSS selectors used to find each carousel so fixes can target the right component.
- **Delete browser sessions.** Always call `firecrawl_browser_delete` when done. Orphaned sessions cost credits.
