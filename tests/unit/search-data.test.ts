import { describe, it, expect } from "vitest";
import { searchProducts, getSuggestions } from "../../src/lib/search-data";

describe("searchProducts", () => {
  it("returns at least 1 result for 'samsung'", () => {
    const results = searchProducts("samsung");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it("all results for 'samsung' contain the term in brand or name", () => {
    const results = searchProducts("samsung");
    for (const result of results) {
      const brandMatch = result.brand.toLowerCase().includes("samsung");
      const nameMatch = result.name.toLowerCase().includes("samsung");
      expect(brandMatch || nameMatch).toBe(true);
    }
  });

  it("returns empty array for empty query", () => {
    const results = searchProducts("");
    expect(results).toEqual([]);
  });

  it("returns empty array for whitespace-only query", () => {
    const results = searchProducts("   ");
    expect(results).toEqual([]);
  });
});

describe("getSuggestions", () => {
  it("returns at most the requested limit", () => {
    const suggestions = getSuggestions("sam", 5);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it("returns at least 1 suggestion for 'sam'", () => {
    const suggestions = getSuggestions("sam", 5);
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
  });

  it("returns no category or brand matches for nonsense query", () => {
    const suggestions = getSuggestions("xyznonexistent", 5);
    const categoryOrBrand = suggestions.filter(
      (s) => s.type === "category" || s.type === "brand"
    );
    expect(categoryOrBrand).toEqual([]);
  });

  it("returns empty array for empty query", () => {
    const suggestions = getSuggestions("", 5);
    expect(suggestions).toEqual([]);
  });

  it("each suggestion has required fields", () => {
    const suggestions = getSuggestions("sam", 5);
    for (const s of suggestions) {
      expect(s).toHaveProperty("type");
      expect(s).toHaveProperty("text");
      expect(s).toHaveProperty("url");
      expect(["product", "category", "brand"]).toContain(s.type);
    }
  });
});
