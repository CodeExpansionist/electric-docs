import { test, expect } from "@playwright/test";
import { ALL_CATEGORY_URLS } from "../tests/fixtures/known-categories";

test.describe("All categories smoke", () => {
  for (const url of ALL_CATEGORY_URLS) {
    test(`${url} — renders without crash`, async ({ page }) => {
      const response = await page.goto(url, { timeout: 15000 });
      expect(response?.status()).toBe(200);

      const body = page.locator("body");
      await expect(body).not.toContainText("Internal Server Error");
      // Guard against a completely blank page (no visible content at all)
      await expect(body).not.toBeEmpty();
    });

    test(`${url} — at least one product with price visible`, async ({ page }) => {
      await page.goto(url, { timeout: 15000 });
      await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
        timeout: 15000,
      });
    });

    test(`${url} — filter sidebar present`, async ({ page }) => {
      await page.goto(url, { timeout: 15000 });
      await expect(
        page.locator('[data-testid="filter-group"]').first()
      ).toBeVisible({ timeout: 15000 });
    });
  }
});
