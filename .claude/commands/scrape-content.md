Scrape all non-product page content from the reference site — homepage sections, hub page editorial, service pages, footer, navigation, announcements, and promotional blocks.

**Pipeline position:** 2/32 — depends on: `/map-site` | feeds into: `/download-assets`, `/content-parity`, `/extract-layout`

**Usage:** `/scrape-content <url>` — e.g. `/scrape-content https://www.example-store.com`

The argument `$ARGUMENTS` is the target site base URL. Reads `hub-*.json` files in `data/scrape/` for page URLs.

---

## Golden Rule

**Every piece of page content must come from the real site.** Announcement bar text, hero banner copy, promotional card headlines, buying guide summaries, service page paragraphs, footer link labels — all verbatim from the reference. Never write or paraphrase page content. If a section can't be scraped, flag it as missing.

---

## Prerequisites

- Read `hub-*.json` files in `data/scrape/` for hub page URLs. These files contain navigation and subcategory links that identify all pages to scrape.

---

## Firecrawl Settings

**Locale:** ALL `firecrawl_scrape` calls in this skill MUST include:
`location: { country: "{country}", languages: ["{language}"] }`
Announcement bar text, hero banner copy, and promotional content can be geo-targeted — scraping without the correct locale risks capturing wrong-region variants.

**Cache Strategy:**
- **First-time scrape:** `maxAge: 0` (fresh data required)
- **Dev iteration / re-runs:** `maxAge: 86400000` (1-day cache, ~5x faster)
- **Final pre-build refresh:** `maxAge: 0` (confirm current state)
Apply chosen `maxAge` to ALL firecrawl calls in this skill run.

---

## Steps

### 0. Read clone scope

Before scraping anything, determine the clone scope from the existing project structure:

- Check `src/lib/category-data.ts` categoryMap keys to understand which section is being cloned
- If the project only covers one section — only scrape content for that section. Homepage content should be scoped to that section's deals, not full-site promotions.
- If the project covers the full site — scrape everything.

This prevents the confusion where homepage content was scraped for the full site but the clone only covers one section, leading to rebuilds when content had to be rescoped.

### 1. Capture visual screenshot before extraction

Before extracting JSON from any page, capture a full-page screenshot:

```bash
firecrawl_scrape with url=[page-url], formats=["screenshot"],
  screenshotOptions={ fullPage: true, viewport: { width: 1280, height: 900 } }
```

Save to `data/scrape/screenshots/{page-slug}-desktop.png`. This serves as a visual reference to verify no sections were missed during JSON extraction. Compare the screenshot section count against the extracted JSON section count.

### 2. Scrape the homepage

Use `firecrawl_scrape` with JSON format on the homepage. Extract every visible section:

```json
{
  "announcementBar": {
    "text": "",
    "backgroundColor": "",
    "dismissible": true
  },
  "secondaryNav": [{ "label": "", "url": "" }],
  "uspBar": [{ "icon": "", "text": "", "url": "" }],
  "heroCarousel": [{
    "image": "",
    "altText": "",
    "headline": "",
    "subheadline": "",
    "ctaText": "",
    "ctaUrl": "",
    "backgroundColor": ""
  }],
  "creditBar": {
    "text": "",
    "apr": "",
    "representativeExample": ""
  },
  "shopDeals": [{
    "label": "",
    "icon": "",
    "url": ""
  }],
  "discoverOffers": {
    "heading": "",
    "cards": [{
      "image": "",
      "headline": "",
      "subtext": "",
      "ctaText": "",
      "ctaUrl": "",
      "backgroundColor": ""
    }]
  },
  "bigBrandDeals": {
    "heading": "",
    "cards": [{
      "brandLogo": "",
      "image": "",
      "headline": "",
      "highlightText": "",
      "ctaText": "",
      "ctaUrl": ""
    }]
  },
  "sponsoredProducts": {
    "heading": "",
    "productIds": []
  },
  "perksSection": {
    "heading": "",
    "bodyText": "",
    "ctaText": "",
    "ctaUrl": "",
    "backgroundColor": ""
  },
  "footer": {
    "columns": [{
      "heading": "",
      "links": [{ "label": "", "url": "" }]
    }],
    "subFooter": {
      "links": [{ "label": "", "url": "" }],
      "socialIcons": [{ "platform": "", "url": "", "icon": "" }],
      "legalText": ""
    }
  }
}
```

Save as: `data/scrape/homepage.json`

### 2. Scrape hub/landing pages

For each hub page in the site map (e.g., `/{section-slug}`), scrape:

```json
{
  "breadcrumbs": [{ "label": "", "url": "" }],
  "pageTitle": "",
  "subcategoryIcons": [{ "label": "", "icon": "", "url": "" }],
  "sidebar": {
    "topCategories": [{ "label": "", "url": "" }],
    "popularLinks": [{ "label": "", "url": "" }],
    "buyingGuides": [{ "label": "", "url": "" }],
    "newsAndReviews": [{ "label": "", "url": "" }]
  },
  "topDeals": [{
    "image": "",
    "headline": "",
    "subtext": "",
    "ctaText": "",
    "ctaUrl": ""
  }],
  "editorialSections": [{
    "heading": "",
    "type": "",
    "content": "",
    "cards": [{
      "image": "",
      "title": "",
      "description": "",
      "url": ""
    }],
    "videoUrl": null,
    "ctaText": "",
    "ctaUrl": ""
  }],
  "buyingGuides": [{
    "icon": "",
    "title": "",
    "url": ""
  }],
  "interactiveTools": [{
    "type": "",
    "title": "",
    "description": "",
    "config": {}
  }],
  "promoBanners": [{
    "image": "",
    "headline": "",
    "ctaText": "",
    "ctaUrl": ""
  }],
  "brandRow": [{
    "name": "",
    "logo": "",
    "ctaText": "",
    "ctaUrl": ""
  }],
  "seoContent": {
    "columns": [{ "heading": "", "text": "" }]
  },
  "articleCards": [{
    "image": "",
    "title": "",
    "date": "",
    "excerpt": "",
    "url": ""
  }]
}
```

Save each as: `data/scrape/hub-{slug}.json`

### 3. Scrape category listing page chrome

Category pages have product listings (handled by `/scrape-products`) but also have surrounding content:

- Promotional banner at top of listing
- Filter sidebar labels and options
- Sort options and labels
- "Showing X results" text format
- Any category-specific promo sections

Use `firecrawl_scrape` with JSON format on each category listing page. Extract the non-product content only.

Save as part of existing category files in `data/scrape/`. The frontend reads filter config from `src/lib/category-data.ts` — do NOT create a separate `data/scrape/category-chrome/` directory.

### 4. Scrape service and footer pages

For every page linked in the footer (help & support, delivery, returns, gift cards, track order, etc.):

```json
{
  "url": "",
  "pageTitle": "",
  "breadcrumbs": [],
  "sections": [{
    "heading": "",
    "content": "",
    "type": ""
  }],
  "sidebar": null,
  "faqs": [{
    "question": "",
    "answer": ""
  }]
}
```

Save each as: `data/scrape/pages/{slug}.json`

### 5. Scrape mega-menu / navigation dropdowns

The main navigation has dropdown menus with subcategories, promotional images, and featured links. Scrape the full mega-menu structure and incorporate the data into the relevant hub page JSON files or the homepage JSON.

**Note:** Navigation is hardcoded in components (`MainNav.tsx`, `SecondaryNav.tsx`) — do NOT create a separate `data/scrape/navigation.json` file. Instead, use the scraped mega-menu data to verify and update the navigation components directly.

### 6. Output summary

```
## Content Scrape Report

Pages scraped:
- Homepage: [success/failed] — X sections captured
- Hub pages: X/Y scraped
- Service pages: X/Y scraped
- Navigation: [success/failed] — X menu items with mega-menus

Content sections captured:
- Hero banners: X
- Promotional cards: X
- Editorial sections: X
- Buying guides: X
- Footer columns: X with Y total links
- FAQ sections: X questions

Missing/failed:
- [page] [section] [reason]
```

---

## Critical Rules

- **Every text string is verbatim.** "Take it home today with free order & collect in as little as an hour!" is not "Free order and collect available" — use the exact copy.
- **Capture promotional content.** Hero banners, deal cards, and promo sections change over time. Scrape what's live now — it becomes the clone's content.
- **Record image URLs for all content images.** Banner backgrounds, promotional card images, buying guide thumbnails, brand logos — these get downloaded by `/download-assets`.
- **Footer structure matters.** Column headings, link order, sub-footer legal text — all must match exactly.
- **Don't merge this with product data.** Page content and product data are separate concerns. Homepage may reference product IDs (sponsored products), but the content structure is its own data.
- **Service pages have real copy.** Delivery timelines, return policies, help topics — scrape the actual content, don't write generic placeholder text.
