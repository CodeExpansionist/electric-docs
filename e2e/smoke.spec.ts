import { test, expect } from "@playwright/test";

test.describe("@smoke Smoke tests", () => {
  test("homepage loads with Electriz title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Electriz/i);
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("category page loads with products visible", async ({ page }) => {
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // At least one product with a price is rendered
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });
  });

  test("PDP loads with price visible", async ({ page }) => {
    // Navigate to TVs then click the first product
    await page.goto("/tv-and-audio/televisions/tvs");
    const firstProduct = page.locator("a[href*='/products/']").first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("basket page loads without errors", async ({ page }) => {
    await page.goto("/basket");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("checkout page loads without errors", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("service page loads without errors", async ({ page }) => {
    await page.goto("/services/delivery");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("account page loads without errors", async ({ page }) => {
    await page.goto("/account");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("techtalk hub loads without errors", async ({ page }) => {
    await page.goto("/techtalk");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("search results page loads with matching content", async ({ page }) => {
    await page.goto("/search?q=samsung");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.locator("text=/samsung/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("invalid URL returns gracefully without crash", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });
});
