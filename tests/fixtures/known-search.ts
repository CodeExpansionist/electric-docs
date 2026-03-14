/**
 * Search fixtures with stable expectations.
 * Uses "at least" assertions — no exact counts since catalogue can drift.
 */

export const SEARCH = {
  /** Known brand with many results */
  withResults: {
    query: "samsung",
    brand: "Samsung",
    expectAtLeast: 1,
  },
  /** Query that returns zero results */
  noResults: {
    query: "xyznonexistent999",
    expectExact: 0,
  },
  /** Partial match for suggestions */
  suggestion: {
    query: "sam",
    expectSuggestionsAtLeast: 1,
  },
  /** XSS-style query that should be safely handled */
  xss: {
    query: "<script>alert(1)</script>",
  },
};
