import { test, expect } from "@playwright/test";

test.describe("@regression Saved items", () => {
  // Clear saved items state before each test so they start with a clean slate
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("electric-saved"));
    await page.evaluate(() => localStorage.removeItem("electric-basket"));
  });

  test("save product from PDP appears on /saved page", async ({ page }) => {
    // Navigate to a PDP via category listing
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // Click first product link to open PDP
    const firstProduct = page.locator("a[href*='/products/']").first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });

    // Capture the product title from the PDP heading
    const productTitle = page.getByRole("heading", { level: 1 });
    await expect(productTitle).toBeVisible({ timeout: 15000 });
    const titleText = await productTitle.textContent();
    expect(titleText).toBeTruthy();

    // Click the "Save for later" button (heart icon with text)
    const saveButton = page.getByRole("button", { name: /save for later/i });
    await expect(saveButton).toBeVisible({ timeout: 15000 });
    await saveButton.click();

    // Button text should change to "Saved" indicating it was saved
    await expect(
      page.getByRole("button", { name: /^saved$/i })
    ).toBeVisible({ timeout: 15000 });

    // Navigate to the saved items page
    await page.goto("/saved");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error"
    );

    // The heading should show "Saved items (1)"
    await expect(
      page.getByRole("heading", { name: /saved items\s*\(1\)/i })
    ).toBeVisible({ timeout: 15000 });

    // The saved product title should be visible on the page
    if (titleText) {
      const nameFragment = titleText.split(" ").slice(0, 3).join(" ");
      await expect(
        page.locator(`text=/${nameFragment}/i`).first()
      ).toBeVisible({ timeout: 15000 });
    }

    // A price should be visible for the saved product
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("move saved item to basket updates basket count", async ({ page }) => {
    // Navigate to a PDP and save a product first
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    await page.locator("a[href*='/products/']").first().click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });

    const saveButton = page.getByRole("button", { name: /save for later/i });
    await expect(saveButton).toBeVisible({ timeout: 15000 });
    await saveButton.click();

    // Wait for state to update — button text changes to "Saved"
    await expect(
      page.getByRole("button", { name: /^saved$/i })
    ).toBeVisible({ timeout: 15000 });

    // Go to the saved items page
    await page.goto("/saved");
    await expect(
      page.getByRole("heading", { name: /saved items\s*\(1\)/i })
    ).toBeVisible({ timeout: 15000 });

    // Click the "Add to basket" button on the saved product card
    const addToBasketBtn = page.getByRole("button", {
      name: /add to basket/i,
    });
    await expect(addToBasketBtn.first()).toBeVisible({ timeout: 15000 });
    await addToBasketBtn.first().click();

    // Basket count badge in the header should now show at least 1
    const basketIndicator = page
      .locator("[data-testid='basket-count']")
      .or(
        page
          .locator("header")
          .locator("a[href='/basket']")
          .locator("span")
          .filter({ hasText: /^[1-9]/ })
      );
    await expect(basketIndicator.first()).toBeVisible({ timeout: 15000 });
    await expect(basketIndicator.first()).toContainText(/[1-9]/);
  });

  test("remove item from saved updates the list", async ({ page }) => {
    // Navigate to a PDP and save a product first
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    await page.locator("a[href*='/products/']").first().click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });

    const saveButton = page.getByRole("button", { name: /save for later/i });
    await expect(saveButton).toBeVisible({ timeout: 15000 });
    await saveButton.click();

    await expect(
      page.getByRole("button", { name: /^saved$/i })
    ).toBeVisible({ timeout: 15000 });

    // Go to saved items page
    await page.goto("/saved");
    await expect(
      page.getByRole("heading", { name: /saved items\s*\(1\)/i })
    ).toBeVisible({ timeout: 15000 });

    // Click the "Remove" button on the saved product card
    const removeButton = page.getByRole("button", { name: /^remove$/i });
    await expect(removeButton.first()).toBeVisible({ timeout: 15000 });
    await removeButton.first().click();

    // The heading should update to show 0 saved items
    await expect(
      page.getByRole("heading", { name: /saved items\s*\(0\)/i })
    ).toBeVisible({ timeout: 15000 });

    // The empty state message should appear
    await expect(
      page.getByText(/no saved items yet/i)
    ).toBeVisible({ timeout: 15000 });
  });
});
