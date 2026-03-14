export interface BehaviourRule {
  id: string;
  template: string;
  interaction: string;
  currysObserved: string;
  evidence: string;
  severity: "P0" | "P1";
}

export const BEHAVIOUR_RULES: BehaviourRule[] = [
  {
    id: "filter-apply-chip",
    template: "plp",
    interaction: "filter-apply-chip",
    currysObserved:
      "Selecting a brand checkbox immediately reduces product count and adds a removable chip above the product grid",
    evidence: "08-category-filters.png",
    severity: "P1",
  },
  {
    id: "filter-clear-one",
    template: "plp",
    interaction: "filter-clear-one",
    currysObserved:
      "Clicking X on one chip removes only that filter; other active filters remain; product count partially restores",
    evidence: "",
    severity: "P1",
  },
  {
    id: "filter-clear-all",
    template: "plp",
    interaction: "filter-clear-all",
    currysObserved:
      "Clicking 'Clear all' removes all active filters and fully restores unfiltered product count",
    evidence: "08-category-filters.png",
    severity: "P1",
  },
  {
    id: "gallery-thumbnail-position",
    template: "pdp",
    interaction: "gallery-thumbnail-position",
    currysObserved:
      "Thumbnails appear BELOW the main image in a horizontal row, not beside it",
    evidence: "09-product-page-top.png",
    severity: "P1",
  },
  {
    id: "gallery-thumbnail-click",
    template: "pdp",
    interaction: "gallery-thumbnail-click",
    currysObserved:
      "Clicking a thumbnail replaces the main image with the clicked image; no page navigation",
    evidence: "",
    severity: "P1",
  },
  {
    id: "size-selector-navigation",
    template: "pdp",
    interaction: "size-selector-navigation",
    currysObserved:
      "Each size is a link that navigates to a different product URL (different slug); not an in-page toggle",
    evidence: "09-product-page-top.png",
    severity: "P1",
  },
  {
    id: "sort-default",
    template: "plp",
    interaction: "sort-default",
    currysObserved:
      "Default sort is 'Most popular' (not price or newest)",
    evidence: "07-category-listing-full.png",
    severity: "P1",
  },
  {
    id: "atb-toast",
    template: "pdp",
    interaction: "atb-toast",
    currysObserved:
      "Clicking 'Add to basket' shows a toast/confirmation with product name and 'View basket' link; button text changes to 'Added'",
    evidence: "",
    severity: "P1",
  },
  {
    id: "atb-header-count",
    template: "pdp",
    interaction: "atb-header-count",
    currysObserved:
      "Header basket icon shows a count badge that increments immediately after add-to-basket",
    evidence: "",
    severity: "P1",
  },
  {
    id: "mobile-menu-drawer",
    template: "homepage-mobile",
    interaction: "mobile-menu-drawer",
    currysObserved:
      "Hamburger opens a full-height drawer from the left with category links; close button (X) dismisses it",
    evidence: "",
    severity: "P1",
  },
  {
    id: "checkout-layout",
    template: "checkout",
    interaction: "checkout-layout",
    currysObserved:
      "Checkout uses a simplified header (logo + security badge only). No main navigation bar, no footer. Step indicators show progress.",
    evidence: "13-checkout-welcome.png",
    severity: "P0",
  },
  {
    id: "checkout-steps",
    template: "checkout",
    interaction: "checkout-steps",
    currysObserved:
      "Guest checkout flows: welcome \u2192 delivery \u2192 customer details \u2192 payment \u2192 confirmation. Completed steps collapse to a summary with green checkmark and 'Edit' link.",
    evidence: "17-checkout-customer-details.png",
    severity: "P1",
  },
];
