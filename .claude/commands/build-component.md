Guided component construction using extracted layout measurements, real data sources, and project guardrails. Builds one component at a time with pixel-accurate measurements instead of visual guessing.

**Pipeline position:** 14/32 — depends on: `/scaffold-project`, `/extract-layout` | feeds into: `/fix-filters`, `/fix-routes`, `/content-parity`

**Usage:** `/build-component <component-name>` — e.g. `/build-component hero-carousel`

`$ARGUMENTS` is the component name (matching a layout spec file in `data/scrape/layouts/`).

---

## Golden Rule

**Read before building.** Every component starts by reading three things: (1) the reference screenshot, (2) the extracted layout measurements, (3) the data source. Only then write code. This prevents the "rebuild 4 times" pattern where components were built from memory or visual estimation.

---

## Prerequisites

- Layout spec file: `data/scrape/layouts/{component-name}.json` (from `/extract-layout`) — **optional.** If no layout spec exists, use reference screenshots in `reference-screenshots/` for visual targets instead
- Reference screenshot in `reference-screenshots/` or `data/scrape/layouts/screenshots/`
- Data source identified (which JSON file feeds this component)
- `src/lib/types.ts` with TypeScript interfaces (from `/scaffold-project`)
- `src/lib/images.ts` with `toLocalImage()` function

---

## Steps

### 1. Read the reference screenshot

Before writing any code, read the reference screenshot for this component:

```
Read the screenshot file at reference-screenshots/{relevant-screenshot}.png
```

Identify:
- What sections/elements are visible
- Approximate layout (grid, flex, absolute positioning)
- Visual hierarchy (what's prominent, what's secondary)
- Interactive elements (buttons, links, carousels)

### 2. Read the layout spec

Read `data/scrape/layouts/{component-name}.json` for exact measurements:

- Container max-width and padding
- Grid columns and gaps at each breakpoint
- Font sizes, weights, line heights
- Colors (background, text, accent)
- Border radius, shadows
- Spacing between elements
- Tailwind class suggestions

### 3. Identify the data source

Determine which JSON file(s) feed this component:

Read the component inventory from `project-config.md` to identify the data source for this component. Common e-commerce component patterns:

| Component Type | Typical Data Source |
|---------------|-------------------|
| Hero/carousel | Homepage scrape JSON → carousel/banner array |
| Category grid | Homepage scrape JSON → category/department array |
| Sponsored/featured products | Homepage scrape JSON → sponsored/featured array |
| Product listing card | Category JSON → products[] |
| Product gallery | Product detail JSON → images |
| Price display | Product detail JSON → price, delivery |
| Filter sidebar | Category data module → filter definitions |
| Navigation | Hardcoded or from site map scrape |
| Footer | Homepage scrape JSON → footer section |
| Announcement bar | Homepage scrape JSON → announcement data |
| Basket/cart items | Basket context → uses same Product type as listing cards |

**The actual component names and data sources vary per project.** Check `project-config.md` for the real mapping.

**Rule: Cart/basket item cards must render the same product metadata as category listing cards — if listing cards show badges, delivery icons, and savings, basket items must too.** If the listing card renders a field, the cart item card must too.

### 3b. Cart/basket page — extraction technique

Before building ANY cart/basket page, extract these measurements from the reference:

**Step 1: Identify the column structure.**
Count the number of flex/grid children at the top level of each cart item card.
Common patterns:

- 2-column: `[Image] [Info area with price inside]` (price shares row with qty/actions)
- 3-column: `[Image] [Info] [Price column]` (price is a separate column)

Do NOT guess — inspect the reference and count the columns. Getting this wrong creates a layout that looks "off" everywhere.

**Step 2: Map the element flow within the info area.**
For each cart item, list every element vertically in DOM order:

- Title (does it span full width or share with price?)
- Action row (which elements share a row: qty, remove, save, price?)
- Secondary info (was-price, savings, badges — where do they align?)
- Supplementary content (delivery box, warranty box — same width as info area or full card width?)

**Step 3: Measure boundaries.**

- Does the image container have a border/outline or is it borderless?
- Does supplementary content (delivery info) extend under the image or stay within the info column?
- What is the exact image container size? Measure, don't estimate.

**Step 4: Extract interactive element sizes.**

- Measure the quantity selector (height, padding, font-size, min-width)
- Check if action links are always-underlined or hover-only
- Check if action links are inline (horizontal) or stacked (vertical)

### 4. Write the component

Create the component file with these mandatory patterns:

**TypeScript interface:**
```typescript
interface {ComponentName}Props {
  // Props interface with exact types from src/lib/types.ts
}
```

**Image handling — always use `toLocalImage()`:**
```typescript
import { toLocalImage } from '@/lib/images';

// CORRECT
<Image src={toLocalImage(product.imageUrl)} ... />

// WRONG — never use CDN URLs directly
<Image src={product.imageUrl} ... />
```

**React keys — always use product ID, never array index:**
```typescript
// CORRECT
{products.map(product => (
  <ProductCard key={product.productId} product={product} />
))}

// WRONG — causes reorder bugs with filters/sort
{products.map((product, index) => (
  <ProductCard key={index} product={product} />
))}
```

**Link handling — use `stripDomain()` for any URLs from scraped data:**
```typescript
import { stripDomain } from '@/lib/constants';

// CORRECT — strips external domain, keeps path
<Link href={stripDomain(item.url)}>

// WRONG — links to external site
<Link href={item.url}>
```

**Tailwind classes — use extracted measurements, not estimates:**
```typescript
// CORRECT — from layout spec
<div className="max-w-[1280px] mx-auto px-4 grid grid-cols-4 gap-4">

// WRONG — guessing
<div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6">
```

### 5. Apply responsive breakpoints

Use the mobile measurements from the layout spec:

```typescript
// Desktop-first with mobile override from layout spec
<div className="grid grid-cols-4 gap-4 md:grid-cols-2 sm:grid-cols-1">
```

Verify breakpoint behavior matches the reference at both desktop (1280px) and mobile (375px).

### 6. Handle loading and error states

Every component that loads data should handle:

- **Loading:** Skeleton placeholder matching the component's dimensions
- **Empty:** Graceful message if data array is empty
- **Image error:** Styled fallback for failed image loads (not a broken image icon)

```typescript
// Image with fallback — use toLocalImage() which returns a valid local path
// or falls back gracefully. There is no /images/placeholder.webp file.
// Instead, use the fallback logic built into images.ts:
import { toLocalImage, getListingImage } from '@/lib/images';

<Image
  src={toLocalImage(product.imageUrl) || getListingImage(product.productId)}
  alt={product.name}
  width={280}
  height={280}
  onError={(e) => {
    // Hide broken image icon with a transparent pixel or CSS
    e.currentTarget.style.visibility = 'hidden';
  }}
/>
```

### 7. Visually compare against reference

After building, visually compare the component against the reference screenshot:

1. Run the dev server
2. Navigate to the page containing this component
3. Compare side-by-side with the reference screenshot
4. Check: grid columns, spacing, font sizes, colors, image sizing
5. If any measurement is visibly off, re-check the layout spec and adjust

**Listing page components — extra checks:**

If building any component that appears on a category listing page (sort bar, filter sidebar, product cards, pagination), also verify:

- Sort bar has both "Sort by" and "Show per page" dropdowns with label text
- List/Grid toggle has text labels next to icons, not icons alone
- Item count appears on its own line below sort controls
- Filter groups render in reference order (extract order from reference site, don't assume)
- Product card titles use `font-normal` (400 weight), not bold
- Product card spec bullets use regular weight, not semibold/bold
- Price text size is consistent across all cards (check `text-xl` / 20px)
- Compare checkbox and Save for later button present in card footer

### 8. Output component report

```
## Component Build Report: {component-name}

File: src/components/{category}/{ComponentName}.tsx

Data source: {data file path} → {field path}
Layout spec: data/scrape/layouts/{component-name}.json

Measurements applied:
- Container: {max-width} with {padding}
- Grid: {columns} columns at {gap} gap
- Typography: {font sizes used}
- Colors: {key colors}

Guardrails verified:
- toLocalImage() for all images: YES/NO
- productId as React key: YES/NO (or N/A)
- stripDomain() for URLs: YES/NO
- TypeScript strict: YES/NO

Visual comparison: MATCH / NEEDS ADJUSTMENT
```

---

## Critical Rules

- **Read screenshot FIRST.** Before writing a single line of code, look at what you're building. This prevents building the wrong thing.
- **Use extracted measurements.** The layout spec exists to prevent guessing. `gap-4` because the spec says `16px`, not because it "looks right".
- **`toLocalImage()` for every image.** No exceptions. Every `<Image>` component routes through the local image mapper.
- **`product.productId` as React key.** Never use array index. This causes subtle bugs when filters reorder the list.
- **`stripDomain()` for data URLs.** Any URL from scraped JSON might contain the reference site's domain. Strip it.
- **One component at a time.** Build, verify, move on. Don't batch-build 5 components and then discover they're all wrong.
- **Match the reference exactly.** Don't "improve" the design. If the reference site has 16px gap, we use 16px gap — not 20px because it "looks better".
