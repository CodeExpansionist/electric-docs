import { test, expect } from "@playwright/test";

test.describe("@regression Responsive critical paths", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("homepage loads and mobile menu hamburger opens navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Hamburger button should be visible at mobile viewport
    const menuButton = page.getByRole("button", { name: "Menu" });
    await expect(menuButton).toBeVisible({ timeout: 15000 });

    // Open the mobile drawer
    await menuButton.click();
    const drawer = page.locator("#mobile-nav");
    await expect(drawer).toBeVisible({ timeout: 15000 });

    // Drawer should contain navigation links from navLinks
    await expect(drawer.getByRole("link", { name: "Televisions" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Soundbars" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Headphones" })).toBeVisible();

    // Close the drawer
    const closeButton = drawer.getByRole("button", { name: "Close menu" });
    await closeButton.click();
    await expect(drawer).toBeHidden({ timeout: 15000 });
  });

  test("category page: products visible and sort control accessible", async ({
    page,
  }) => {
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Category heading should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // At least one product card with a price is rendered
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // Product links should be visible on mobile
    await expect(
      page.locator("a[href*='/products/']").first()
    ).toBeVisible({ timeout: 15000 });

    // Sort control should be accessible on mobile (filter sidebar is desktop-only,
    // but the sort select is always visible)
    const sortSelect = page.locator("[data-testid='sort-select']");
    await expect(sortSelect).toBeVisible({ timeout: 15000 });

    // Page should not have horizontal overflow at 375px
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test("PDP: add-to-basket button visible and clickable", async ({ page }) => {
    // Navigate to a category and click the first product
    await page.goto("/tv-and-audio/televisions/tvs");
    const firstProduct = page.locator("a[href*='/products/']").first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Price should be visible on PDP
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // Add-to-basket button must be visible and clickable at mobile width
    const addToBasket = page.locator("[data-testid='add-to-basket']");
    await expect(addToBasket).toBeVisible({ timeout: 15000 });
    await expect(addToBasket).toBeEnabled();

    // Click and verify the basket count badge appears
    await addToBasket.click();
    await expect(page.locator("[data-testid='basket-count']")).toBeVisible({
      timeout: 15000,
    });
  });

  test("basket page is usable with no horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/basket");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Page content should be visible (heading or basket content area)
    await expect(page.getByRole("heading").first()).toBeVisible({
      timeout: 15000,
    });

    // No horizontal overflow at mobile viewport
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Basket content (empty state or items) should be within viewport width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("search input accessible on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Mobile search bar (id="mobile-search") is visible on mobile viewport
    // (desktop search with data-testid="search-input" is hidden md:block)
    const mobileSearch = page.locator("#mobile-search");
    await expect(mobileSearch).toBeVisible({ timeout: 15000 });

    // The mobile search input should be focusable and accept text
    await mobileSearch.fill("samsung");
    await expect(mobileSearch).toHaveValue("samsung");

    // Submit search and verify navigation to results
    await mobileSearch.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=samsung/, { timeout: 15000 });
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // Results page should show matching content at mobile width
    await expect(page.locator("text=/samsung/i").first()).toBeVisible({
      timeout: 15000,
    });

    // No horizontal overflow on search results page
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
