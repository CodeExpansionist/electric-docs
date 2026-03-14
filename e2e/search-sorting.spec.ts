import { test, expect } from "@playwright/test";

const SEARCH_URL = "/search?q=samsung";

test.describe("Search sorting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SEARCH_URL);
    // Wait for results to load (spinner gone, at least one product card visible)
    await expect(page.locator(".card").first()).toBeVisible({ timeout: 15000 });
  });

  test("sort by price-asc → first result cheaper than last", async ({
    page,
  }) => {
    const sortSelect = page.locator("select");
    await expect(sortSelect).toBeVisible();

    await sortSelect.selectOption("price-asc");

    // Wait for re-render after sort change
    await page.waitForTimeout(1000);
    await expect(page.locator(".card").first()).toBeVisible({ timeout: 10000 });

    // Extract all visible prices from the price zone (the £xx.xx spans)
    const prices = await page
      .locator(".card .text-2xl")
      .allTextContents();

    // Parse pound values — format is "£1,299.00"
    const numericPrices = prices
      .map((t) => parseFloat(t.replace(/[£,]/g, "")))
      .filter((n) => !isNaN(n));

    expect(numericPrices.length).toBeGreaterThanOrEqual(2);

    const first = numericPrices[0];
    const last = numericPrices[numericPrices.length - 1];
    expect(first).toBeLessThanOrEqual(last);
  });

  test("sort by price-desc → first result more expensive than last", async ({
    page,
  }) => {
    const sortSelect = page.locator("select");
    await sortSelect.selectOption("price-desc");

    await page.waitForTimeout(1000);
    await expect(page.locator(".card").first()).toBeVisible({ timeout: 10000 });

    const prices = await page
      .locator(".card .text-2xl")
      .allTextContents();

    const numericPrices = prices
      .map((t) => parseFloat(t.replace(/[£,]/g, "")))
      .filter((n) => !isNaN(n));

    expect(numericPrices.length).toBeGreaterThanOrEqual(2);

    const first = numericPrices[0];
    const last = numericPrices[numericPrices.length - 1];
    expect(first).toBeGreaterThanOrEqual(last);
  });

  test("sort by rating → highest rated first", async ({ page }) => {
    const sortSelect = page.locator("select");

    // Verify rating option exists
    const ratingOption = sortSelect.locator('option[value="rating"]');
    const optionCount = await ratingOption.count();
    test.skip(optionCount === 0, "Rating sort option not available");

    await sortSelect.selectOption("rating");

    await page.waitForTimeout(1000);
    await expect(page.locator(".card").first()).toBeVisible({ timeout: 10000 });

    // Rating text is in format "4.5/5" inside the star rating component
    const ratingTexts = await page
      .locator(".card .text-xs.text-text-secondary.font-medium")
      .allTextContents();

    const numericRatings = ratingTexts
      .map((t) => {
        const match = t.match(/([\d.]+)\/5/);
        return match ? parseFloat(match[1]) : NaN;
      })
      .filter((n) => !isNaN(n));

    if (numericRatings.length >= 2) {
      const first = numericRatings[0];
      const last = numericRatings[numericRatings.length - 1];
      expect(first).toBeGreaterThanOrEqual(last);
    }
  });

  test("pagination: page 2 shows different results than page 1", async ({
    page,
  }) => {
    // Check if pagination exists (totalPages > 1)
    const nextButton = page.locator("button", { hasText: "Next" });
    const nextCount = await nextButton.count();
    const nextDisabled =
      nextCount > 0 ? await nextButton.isDisabled() : true;

    test.skip(
      nextCount === 0 || nextDisabled,
      "Pagination not available or only one page of results"
    );

    // Capture page 1 product titles
    const page1Titles = await page
      .locator(".card h3")
      .allTextContents();

    expect(page1Titles.length).toBeGreaterThan(0);

    // Navigate to page 2
    await nextButton.click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.locator(".card").first()).toBeVisible({ timeout: 10000 });

    // Capture page 2 product titles
    const page2Titles = await page
      .locator(".card h3")
      .allTextContents();

    expect(page2Titles.length).toBeGreaterThan(0);

    // At least some titles should differ between pages
    const overlap = page1Titles.filter((t) => page2Titles.includes(t));
    expect(overlap.length).toBeLessThan(page1Titles.length);
  });

  test("click search result → navigates to correct PDP", async ({ page }) => {
    // Get the first product card's link
    const firstCardLink = page.locator(".card a").first();
    await expect(firstCardLink).toBeVisible();

    const href = await firstCardLink.getAttribute("href");
    expect(href).toBeTruthy();

    // Click the product title link (the h3 inside a link)
    const titleLink = page.locator(".card h3").first();
    await titleLink.click();

    // Should navigate to the product page
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    // PDP should load without errors
    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    // Should show product content (title or price present)
    await expect(
      page.locator("h1, [data-testid='product-title']").first()
    ).toBeVisible({ timeout: 10000 });
  });
});
