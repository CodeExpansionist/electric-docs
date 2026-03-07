Verify that the clone's CSS transitions, animations, and timed interactions match the reference site — carousel slide timing, accordion expand/collapse, dropdown open/close, hover transitions, auto-play intervals, and loading states. Closes the gap between `/visual-parity` (which checks static hover states) and this skill (which checks the motion between states).

**Pipeline position:** 29/32 — depends on: `/visual-parity`, `/build-component` | feeds into: none (motion fidelity endpoint)

**Usage:** `/motion-parity` — runs full motion audit (all components, all motion types)

Optionally: `/motion-parity <scope>` where `$ARGUMENTS` is one of:
- A motion type: `transitions`, `animations`, `auto-play`, `scroll`
- A component name: `carousel`, `accordion`, `dropdown`, `gallery`, `filter-toggle`
- A phase: `extract`, `compare`, `fix`

---

## Golden Rule

**If a human can see it move differently, this skill must catch it.** A carousel that snaps instead of slides, a hover that pops instead of fades, or an accordion that appears instead of expanding — these break the clone illusion immediately, even when every static pixel matches.

---

## Prerequisites

- Dev server running at the dev server URL (from `package.json`)
- `/visual-parity` has been run — interactive state CSS values already captured
- Firecrawl MCP tools available (`firecrawl_browser_create`, `firecrawl_browser_execute`)
- `src/lib/constants.ts` exists (exports SITE_URL and stripDomain)

---

## Firecrawl Settings

**Browser Sessions:** This skill uses two concurrent sessions (reference + clone). **Always** call `firecrawl_browser_delete` on both when done.

**Locale:** Reference site captures must include locale from `project-config.md`: `location: { country: "{country}", languages: ["{language}"] }`.

**Session TTL:** Set `ttl: 600` (10 minutes) — motion extraction requires multiple interaction cycles per component.

---

## Motion Inventory

These are the motion types to audit, mapped to components:

| Component Type | Motion Type | What to Measure |
|---------------|------------|-----------------|
| Hero/main carousel | Auto-play interval | Time between auto-advances (seconds) |
| Hero/main carousel | Slide transition | Duration, easing, direction (slide vs fade) |
| Any carousel | Slide transition | Duration, easing when arrow clicked |
| Carousel arrows | Hover transition | Duration of color/opacity change |
| Accordion sections | Expand/collapse | Duration, easing, height animation vs instant |
| Dropdown menus | Open/close | Duration, easing, transform origin |
| Gallery thumbnails | Selection transition | Duration of border/opacity change |
| Toggle switches | Knob slide | Duration, easing of position change |
| Sticky header | Entrance animation | Duration, easing, direction (slide-down vs fade) |
| All buttons/links | Hover transition | Duration of color/shadow/transform change |
| Content/promo cards | Image hover zoom | Duration, scale amount, easing |
| Loading spinners | Spin animation | Duration per revolution, easing |
| Mobile menu | Open/close | Duration, direction (slide-in vs fade) |

**Identify the actual component names from the project source code.** The types above are common patterns.

---

## Steps

### 1. Create two browser sessions

One for the reference site, one for the clone:

```
// Reference session
firecrawl_browser_create({ ttl: 600, activityTtl: 120 })

// Clone session
firecrawl_browser_create({ ttl: 600, activityTtl: 120 })
```

Read `src/lib/constants.ts` for SITE_URL. The section slug is from `project-config.md`. The dev server URL is from `package.json`.

### 2. Extract transition properties from CSS

For each component in the Motion Inventory, extract the declared CSS transition properties from both sites:

```javascript
// Run in both reference and clone sessions
function extractTransitions(selector) {
  const el = document.querySelector(selector);
  if (!el) return { error: 'Not found: ' + selector };
  const style = getComputedStyle(el);
  return {
    transitionProperty: style.transitionProperty,
    transitionDuration: style.transitionDuration,
    transitionTimingFunction: style.transitionTimingFunction,
    transitionDelay: style.transitionDelay,
    animationName: style.animationName,
    animationDuration: style.animationDuration,
    animationTimingFunction: style.animationTimingFunction,
    animationIterationCount: style.animationIterationCount,
    animationDirection: style.animationDirection,
    animationDelay: style.animationDelay,
    willChange: style.willChange,
  };
}

// Extract for key interactive elements
const results = {};
const selectors = {
  carouselSlide: '[class*="carousel"] [class*="track"], [class*="carousel"] > div > div',
  carouselArrow: '[class*="carousel"] button',
  accordionPanel: '[class*="accordion"] [class*="content"], details > div',
  accordionChevron: '[class*="accordion"] svg, details summary svg',
  filterToggle: '[class*="toggle"], [role="switch"]',
  stickyHeader: '[class*="sticky"], [class*="StickyProduct"]',
  hubCardImage: '[class*="hub"] img, [class*="content-grid"] img',
  navDropdown: '[class*="dropdown"], [class*="mega-menu"]',
  galleryThumb: '[class*="gallery"] [class*="thumb"], [class*="thumbnail"]',
};

for (const [name, sel] of Object.entries(selectors)) {
  results[name] = extractTransitions(sel);
}
JSON.stringify(results, null, 2);
```

**Adapt selectors** by reading the actual component source files. The selectors above are starting points — use class names from the real code.

### 3. Measure carousel auto-play interval

On both sites, measure the time between automatic slide changes:

```javascript
(async () => {
  // Observe carousel slide changes
  const track = document.querySelector('[class*="carousel"] [style*="transform"]')
    || document.querySelector('[class*="carousel"] > div > div');

  if (!track) return JSON.stringify({ error: 'No carousel track found' });

  const timestamps = [];
  let lastTransform = track.style.transform || getComputedStyle(track).transform;

  const observer = new MutationObserver(() => {
    const current = track.style.transform || getComputedStyle(track).transform;
    if (current !== lastTransform) {
      timestamps.push(performance.now());
      lastTransform = current;
    }
  });

  observer.observe(track, { attributes: true, attributeFilter: ['style', 'class'] });

  // Wait for 3 auto-advances (need at least 2 intervals)
  await new Promise(r => setTimeout(r, 20000));
  observer.disconnect();

  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(Math.round(timestamps[i] - timestamps[i - 1]));
  }

  return JSON.stringify({
    slideCount: timestamps.length,
    intervals: intervals,
    averageInterval: intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : null
  });
})();
```

**Tolerance:** Auto-play interval within ±500ms = MATCH, ±1000ms = MINOR, >1000ms = MAJOR.

### 4. Measure transition duration by triggering interactions

For elements with CSS transitions, trigger the state change and measure actual duration:

```javascript
(async () => {
  async function measureTransition(selector, trigger) {
    const el = document.querySelector(selector);
    if (!el) return { error: 'Not found: ' + selector };

    // Record pre-transition computed values
    const before = {};
    const props = ['backgroundColor', 'color', 'opacity', 'transform', 'boxShadow',
                   'height', 'maxHeight', 'borderColor', 'textDecoration'];
    const style = getComputedStyle(el);
    props.forEach(p => before[p] = style[p]);

    const startTime = performance.now();

    // Trigger the interaction
    if (trigger === 'hover') {
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    } else if (trigger === 'click') {
      el.click();
    } else if (trigger === 'focus') {
      el.focus();
    }

    // Poll until computed style stabilizes (max 2 seconds)
    let endTime = startTime;
    let lastChange = startTime;
    let stable = false;

    for (let i = 0; i < 40; i++) {  // 40 × 50ms = 2s max
      await new Promise(r => setTimeout(r, 50));
      const current = getComputedStyle(el);
      const changed = props.some(p => current[p] !== before[p]);

      if (changed) {
        // Check if still changing
        const prevSnapshot = JSON.stringify(props.map(p => current[p]));
        await new Promise(r => setTimeout(r, 50));
        const nextSnapshot = JSON.stringify(props.map(p => getComputedStyle(el)[p]));

        if (prevSnapshot === nextSnapshot) {
          endTime = performance.now();
          stable = true;
          break;
        }
        lastChange = performance.now();
      }
    }

    const after = {};
    const finalStyle = getComputedStyle(el);
    props.forEach(p => after[p] = finalStyle[p]);

    // Find which properties changed
    const changedProps = props.filter(p => before[p] !== after[p]);

    return {
      duration: Math.round(endTime - startTime),
      stable: stable,
      changedProperties: changedProps,
      before: Object.fromEntries(changedProps.map(p => [p, before[p]])),
      after: Object.fromEntries(changedProps.map(p => [p, after[p]])),
    };
  }

  // Call measureTransition for target elements here
  return JSON.stringify(await measureTransition('.primary-cta', 'hover'));
})();
```

Run this for each interactive element on both reference and clone:

| Element | Trigger | Expected Motion |
|---------|---------|-----------------|
| CTA button | hover | Background color transition |
| Product card | hover | Shadow/lift transition |
| Carousel arrow | click | Slide track translateX |
| Accordion header | click | Content height expand |
| Gallery thumbnail | click | Border/opacity change |
| Filter toggle | click | Knob position slide |
| Content card image | hover | Scale transform |
| Nav link | hover | Color/underline transition |

### 5. Detect animation type mismatches

Beyond duration, check that the animation TYPE matches:

**Carousel transition type:**
- SLIDE: `transform: translateX()` changes (reference uses slide)
- FADE: `opacity` changes between slides
- SNAP: no transition, instant change
- If reference = SLIDE and clone = SNAP, that's a MAJOR mismatch

**Accordion expand type:**
- ANIMATED HEIGHT: `height` or `max-height` transitions from 0 to auto (smooth expand)
- INSTANT: Content appears via `display: block` or conditional rendering (no motion)
- If reference = ANIMATED HEIGHT and clone = INSTANT, that's a MAJOR mismatch

**Dropdown open type:**
- SLIDE DOWN: `transform: translateY()` or `height` transition
- FADE IN: `opacity` transition
- SCALE: `transform: scale()` from origin point
- INSTANT: no transition

### 6. Measure easing curve parity

Compare `transition-timing-function` values:

| Reference | Clone | Verdict |
|-----------|-------|---------|
| `ease` | `ease` | MATCH |
| `ease-in-out` | `ease-in-out` | MATCH |
| `ease` | `linear` | MINOR — visually different acceleration |
| `cubic-bezier(0.4, 0, 0.2, 1)` | `ease` | MATCH — these are perceptually similar |
| `ease-in-out` | `ease-in` | MINOR — different deceleration feel |
| Any easing | `steps()` | MAJOR — stepped vs smooth is obvious |

**Easing equivalence map** (treat these as matching):
- `ease` ≈ `cubic-bezier(0.25, 0.1, 0.25, 1.0)`
- `ease-in-out` ≈ `cubic-bezier(0.42, 0, 0.58, 1.0)`
- Material Design standard: `cubic-bezier(0.4, 0, 0.2, 1)` ≈ `ease` (close enough)

### 7. Check prefers-reduced-motion compliance

On both sites, verify behavior when reduced motion is preferred:

To emulate `prefers-reduced-motion`, use Playwright scripting via `firecrawl_browser_execute` with `language: "python"`:

```python
# Emulate prefers-reduced-motion: reduce via Playwright CDP
await page.emulate_media(reduced_motion="reduce")

# Verify the media query is active
result = await page.evaluate("window.matchMedia('(prefers-reduced-motion: reduce)').matches")
print(f"prefers-reduced-motion active: {result}")

# After enabling reduced motion, check:
# 1. Auto-play carousel should pause or use instant transitions
# 2. Hover transitions should be instant or very fast (< 10ms)
# 3. No @keyframes animations should be running

# Check for running animations
anim_count = await page.evaluate("document.getAnimations().length")
print(f"Running animations: {anim_count}")
```

**Note:** This requires Playwright scripting (`language: "python"` in `firecrawl_browser_execute`). The `agent-browser` bash commands do not support media feature emulation.

This is a bonus check — MINOR if the clone doesn't match the reference's reduced-motion behavior, but worth noting for accessibility.

### 8. Output the motion parity report

```markdown
## Motion Parity Report

Audit date: [timestamp]
Project: {project name from project-config.md}
Reference: {reference domain from project-config.md}

### Overall Verdict: [PASS / REVIEW / FAIL]

### Auto-Play Timing

| Component | Reference Interval | Clone Interval | Delta | Verdict |
|-----------|-------------------|----------------|-------|---------|
| {primary carousel} | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| {secondary carousel} | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |

### Transition Duration Comparison

| Element | Trigger | Ref Duration | Clone Duration | Delta | Verdict |
|---------|---------|-------------|----------------|-------|---------|
| CTA button | hover | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Product card | hover | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Carousel slide | click | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Accordion expand | click | Xms | Xms (or INSTANT) | — | MATCH/MINOR/MAJOR |
| Gallery thumb | click | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Filter toggle | click | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Content card zoom | hover | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |
| Nav link | hover | Xms | Xms | ±Xms | MATCH/MINOR/MAJOR |

### Transition Duration Tolerances

| Delta | Verdict |
|-------|---------|
| ±50ms | MATCH — imperceptible |
| 50–150ms | MINOR — noticeable on close comparison |
| >150ms | MAJOR — obviously different feel |

### Animation Type Comparison

| Component | Reference Type | Clone Type | Verdict |
|-----------|---------------|------------|---------|
| Carousel | SLIDE / FADE / SNAP | SLIDE / FADE / SNAP | MATCH/MAJOR |
| Accordion | ANIMATED / INSTANT | ANIMATED / INSTANT | MATCH/MAJOR |
| Dropdown | SLIDE / FADE / INSTANT | SLIDE / FADE / INSTANT | MATCH/MAJOR |
| Mobile menu | SLIDE / FADE / INSTANT | SLIDE / FADE / INSTANT | MATCH/MAJOR |

### Easing Curve Comparison

| Element | Reference Easing | Clone Easing | Verdict |
|---------|-----------------|--------------|---------|
| Carousel slide | ease-in-out | ease-in-out | MATCH |
| Hover transitions | ease | ease | MATCH |
| Accordion | ease | (none — instant) | MAJOR |

### Changed Properties Per Interaction

| Element | Trigger | Reference Changes | Clone Changes | Match |
|---------|---------|-------------------|---------------|-------|
| CTA button | hover | backgroundColor, boxShadow | backgroundColor | MINOR (missing shadow) |
| Product card | hover | transform, boxShadow | boxShadow | MINOR (missing lift) |

### Reduced Motion Compliance

| Behavior | Reference | Clone | Verdict |
|----------|-----------|-------|---------|
| Auto-play pauses | YES/NO | YES/NO | MATCH/MINOR |
| Transitions instant | YES/NO | YES/NO | MATCH/MINOR |
| Keyframe anims stopped | YES/NO | YES/NO | MATCH/MINOR |

### Fix Priority (MAJOR issues first)

1. [Component] — [what's wrong] — [suggested fix]
2. [Component] — [what's wrong] — [suggested fix]
3. ...

### Summary

| Metric | Value |
|--------|-------|
| Components audited | X |
| Motion types compared | X |
| MATCH | X (X%) |
| MINOR | X (X%) |
| MAJOR | X (X%) |
| Animation type mismatches | X |
| Missing animations on clone | X |

Verdict: [PASS / REVIEW / FAIL]
- PASS: zero MAJOR mismatches, overall match rate ≥ 85%
- REVIEW: 1–2 MAJOR mismatches or match rate 70–84%
- FAIL: 3+ MAJOR mismatches or match rate < 70%
```

If `$ARGUMENTS` is `fix`, read the most recent motion parity report and work through MAJOR mismatches in priority order — one component at a time, verify after each fix.

---

## Critical Rules

1. **Two browser sessions — always.** Motion parity requires real-time comparison. Don't rely on saved reference data for timing — CSS declarations don't tell you what the browser actually does (JavaScript can override, lazy-loaded transitions may not fire, etc.).

2. **Measure actual duration, not declared duration.** `transition-duration: 300ms` in CSS might be overridden by JavaScript, or the element might not transition at all if the property doesn't change. Always measure wall-clock time from trigger to stable state.

3. **Animation TYPE mismatches are more important than timing mismatches.** A carousel that slides in 250ms vs 300ms is a MINOR issue. A carousel that snaps instead of sliding is MAJOR. Check type first, timing second.

4. **INSTANT is a valid animation type.** If the reference has no transition on an element, the clone shouldn't add one. Transitions where none exist on the reference are noise, not enhancement.

5. **Auto-play requires patience.** Measuring carousel auto-play intervals requires waiting for at least 2–3 complete cycles (15–20 seconds). Don't shortcut this.

6. **Easing curves are fuzzy matches.** Most standard curves are perceptually similar. Only flag easing mismatches when they're categorically different (smooth vs stepped, or ease-in vs ease-out).

7. **Don't fix what the reference doesn't have.** If the reference accordion has no expand animation (instant show/hide), don't add one to the clone. Match, don't enhance.

8. **Destroy both browser sessions.** Always clean up both the reference and clone sessions. Two orphaned sessions = 4 credits/min.

9. **Reduced motion is a bonus check, not a gate.** Flag mismatches as MINOR, not MAJOR. The primary goal is motion parity at default settings.

10. **Test at desktop viewport only.** Motion timing is viewport-independent (same CSS transitions apply). Mobile-specific motion differences (hamburger menu animation) should be tested at 375px, but general transitions don't need dual-viewport testing.
