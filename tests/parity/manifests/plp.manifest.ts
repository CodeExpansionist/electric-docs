import type { TemplateManifest } from "./types";

export const plpManifest: TemplateManifest = {
  templateId: "plp",
  description:
    "PLP (Product Listing Page): Breadcrumbs, CategoryTitle, FilterSidebar, SortBar, ActiveFilterChips, ProductGrid, Pagination",
  testUrl: "/tv-and-audio/televisions/tvs",
  sections: [
    {
      id: "breadcrumbs",
      selector: "main nav:first-of-type",
      fallbackSelectors: [
        'nav[aria-label="Breadcrumb"]',
        "nav ol",
      ],
      required: true,
      order: 1,
      viewport: "both",
      currysEvidence: "07-category-listing-full.png",
    },
    {
      id: "category-title",
      selector: "h1",
      fallbackSelectors: [
        "main h1",
        '[data-testid="category-title"]',
      ],
      required: true,
      order: 2,
      viewport: "both",
      currysEvidence: "07-category-listing-full.png",
    },
    {
      id: "filter-sidebar",
      selector: "aside",
      fallbackSelectors: [
        '[data-testid="filter-sidebar"]',
        'aside[role="complementary"]',
      ],
      required: true,
      order: 3,
      viewport: "desktop",
      currysEvidence: "08-category-filters.png",
      children: [
        {
          role: "filter-group",
          selector: '[data-testid="filter-group"]',
          required: true,
          expectedCount: { min: 3 },
        },
      ],
    },
    {
      id: "sort-bar",
      selector: '[data-testid="sort-select"]',
      fallbackSelectors: [
        "select[name='sort']",
        '[aria-label="Sort by"]',
      ],
      required: true,
      order: 4,
      viewport: "both",
      currysEvidence: "07-category-listing-full.png",
    },
    {
      id: "active-filter-chips",
      selector: '[data-testid="active-filters"]',
      fallbackSelectors: [
        ".flex.flex-wrap.gap-2:has(button)",
        '[role="list"]:has([data-testid="filter-chip"])',
      ],
      required: false,
      order: 5,
      viewport: "both",
    },
    {
      id: "product-grid",
      selector: "main .space-y-4",
      fallbackSelectors: [
        '[data-testid="product-grid"]',
        "main > div > .space-y-4",
      ],
      required: true,
      order: 6,
      viewport: "both",
      currysEvidence: "07-category-listing-full.png",
      children: [
        {
          role: "product-card",
          selector: '[data-testid="product-card"], a[href^="/products/"]',
          required: true,
          expectedCount: { min: 1 },
        },
      ],
    },
    {
      id: "pagination",
      selector: 'nav[aria-label="Pagination"]',
      fallbackSelectors: [
        '[data-testid="pagination"]',
        "nav:has(a[href*='page='])",
      ],
      required: false,
      order: 7,
      viewport: "both",
    },
  ],
};
