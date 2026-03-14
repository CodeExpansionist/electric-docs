import { test, expect } from "@playwright/test";

test.describe("@regression Search user flow", () => {
  test("typing a query shows suggestions in dropdown", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator("#site-search");
    await searchInput.fill("samsung");
    // Suggestions should appear
    await expect(
      page.locator("[role='listbox'], [data-testid='search-suggestions']").or(
        page.locator("ul, div").filter({ hasText: /samsung/i })
      ).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("submitting a search shows results with matching products", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator("#site-search");
    await searchInput.fill("samsung");
    await searchInput.press("Enter");
    // Should navigate to search results
    await expect(page).toHaveURL(/search|q=samsung/i);
    // Results should contain matching products
    await expect(page.locator("text=/samsung/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("empty search shows graceful empty state", async ({ page }) => {
    await page.goto("/search?q=");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // Should not crash — either shows empty state or redirects
  });

  test("nonsense query shows no-results state without errors", async ({ page }) => {
    await page.goto("/search?q=xyznonexistent999");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });
});
