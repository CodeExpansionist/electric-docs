import { test, expect } from "@playwright/test";

test.describe("@regression Add-to-basket journey", () => {
  test("adding a product updates the basket count", async ({ page }) => {
    // Navigate to a PDP via category listing
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });

    const firstProduct = page.locator("a[href*='/products/']").first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//);

    // Find and click add to basket button
    const addToBasket = page.getByRole("button", { name: /add to basket/i });
    await expect(addToBasket).toBeVisible({ timeout: 5000 });
    await addToBasket.click();

    // Basket count in header should show at least 1
    const basketIndicator = page.locator(
      "[data-testid='basket-count'], .basket-count"
    ).or(page.locator("header").locator("text=/[1-9]/"));
    await expect(basketIndicator.first()).toBeVisible({ timeout: 3000 });
  });

  test("added item appears on basket page with correct details", async ({ page }) => {
    // Add a product first
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });

    const firstProduct = page.locator("a[href*='/products/']").first();
    const productLinkHref = await firstProduct.getAttribute("href");
    await firstProduct.click();

    // Get the product name from the PDP
    const productTitle = page.getByRole("heading", { level: 1 });
    const titleText = await productTitle.textContent();

    const addToBasket = page.getByRole("button", { name: /add to basket/i });
    await addToBasket.click();

    // Navigate to basket
    await page.goto("/basket");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    // Product should be visible in basket with a price
    if (titleText) {
      // At least part of the product name should appear
      const nameFragment = titleText.split(" ").slice(0, 3).join(" ");
      await expect(page.locator(`text=/${nameFragment}/i`).first()).toBeVisible({
        timeout: 5000,
      });
    }
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible();
  });

  test("basket persists through navigation", async ({ page }) => {
    // Add a product
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });

    await page.locator("a[href*='/products/']").first().click();
    await page.getByRole("button", { name: /add to basket/i }).click();

    // Navigate to homepage
    await page.goto("/");

    // Navigate back to basket
    await page.goto("/basket");

    // Item should still be there — at least one product with a price
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 5000 });
  });

  test("checkout route loads without errors", async ({ page }) => {
    // Add an item then go to checkout
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });

    await page.locator("a[href*='/products/']").first().click();
    await expect(page).toHaveURL(/\/products\//);
    const addBtn = page.getByRole("button", { name: /add to basket/i });
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    await page.goto("/checkout");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // Checkout should show at least a price or total
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 5000 });
  });
});
