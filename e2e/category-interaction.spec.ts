import { test, expect } from "@playwright/test";

test.describe("@regression Category browsing — TVs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tv-and-audio/televisions/tvs");
    // Wait for products to render
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });
  });

  test("selecting a brand filter visibly reduces product count", async ({ page }) => {
    // Count initial product cards
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();

    // Find and click a brand filter checkbox
    const brandFilter = page.getByText(/^LG$/i).first();
    if (await brandFilter.isVisible()) {
      await brandFilter.click();
      // Wait for filter to apply
      await page.waitForTimeout(500);
      const filteredCount = await productCards.count();
      expect(filteredCount).toBeLessThan(initialCount);
    }
  });

  test("clearing filters restores original product count", async ({ page }) => {
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();

    // Apply a filter
    const brandFilter = page.getByText(/^LG$/i).first();
    if (await brandFilter.isVisible()) {
      await brandFilter.click();
      await page.waitForTimeout(500);

      // Clear all filters
      const clearButton = page.getByText(/clear all/i);
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);
        const restoredCount = await productCards.count();
        expect(restoredCount).toBe(initialCount);
      }
    }
  });

  test("changing sort to price-asc orders products by price", async ({ page }) => {
    // Select "Price low - high" by value
    const sortControl = page.locator("select").first();
    await sortControl.selectOption("price-asc");
    // Wait for re-render after sort
    await page.waitForTimeout(1000);

    // Primary prices are in text-2xl spans starting with £
    const priceSpans = page.locator("span.text-2xl");
    const count = await priceSpans.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const firstText = await priceSpans.nth(0).textContent();
    const secondText = await priceSpans.nth(1).textContent();

    if (firstText && secondText) {
      const firstPrice = parseFloat(firstText.replace(/[£,]/g, ""));
      const secondPrice = parseFloat(secondText.replace(/[£,]/g, ""));
      expect(firstPrice).toBeLessThanOrEqual(secondPrice);
    }
  });

  test("clicking a product card navigates to its PDP", async ({ page }) => {
    const firstProductLink = page.locator("a[href*='/products/']").first();
    const productName = await firstProductLink.textContent();
    await firstProductLink.click();

    await expect(page).toHaveURL(/\/products\//);
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // PDP should have a price
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible();
  });
});
