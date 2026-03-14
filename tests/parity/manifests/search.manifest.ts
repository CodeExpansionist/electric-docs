import type { TemplateManifest } from "./types";

export const searchManifest: TemplateManifest = {
  templateId: "search",
  description:
    "Search Results: Breadcrumbs, SearchTitle, ResultCount, SortBar, ResultsList, Pagination",
  testUrl: "/search?q=samsung",
  sections: [
    {
      id: "breadcrumbs",
      selector: "nav",
      fallbackSelectors: [
        'nav[aria-label="Breadcrumb"]',
        "nav:has(a[href='/'])",
      ],
      required: true,
      order: 1,
      viewport: "both",
    },
    {
      id: "search-title",
      selector: "h1",
      fallbackSelectors: [
        "main h1",
        '[data-testid="search-title"]',
      ],
      required: true,
      order: 2,
      viewport: "both",
    },
    {
      id: "result-count",
      selector: '[data-testid="result-count"]',
      fallbackSelectors: [
        'p:has-text("result")',
        'span:has-text("result")',
      ],
      required: true,
      order: 3,
      viewport: "both",
    },
    {
      id: "sort-bar",
      selector: '[data-testid="sort-select"]',
      fallbackSelectors: [
        "select[name='sort']",
        '[aria-label="Sort by"]',
      ],
      required: false,
      order: 4,
      viewport: "both",
    },
    {
      id: "results-list",
      selector: ".space-y-4",
      fallbackSelectors: [
        '[data-testid="search-results"]',
        "main .space-y-4",
      ],
      required: true,
      order: 5,
      viewport: "both",
      children: [
        {
          role: "product-list-card",
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
      order: 6,
      viewport: "both",
    },
  ],
};
