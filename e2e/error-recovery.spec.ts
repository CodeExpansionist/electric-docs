import { test, expect } from "@playwright/test";

test.describe("@regression Error recovery", () => {
  test("nonexistent product slug shows 404 or fallback, no crash", async ({ page }) => {
    await page.goto("/products/nonexistent-slug-xyz");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // Page must not be blank — at least the header or some content should render
    await expect(
      page.locator("header, nav, main, h1, [role='banner']").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("nonexistent category slug handled gracefully, no crash", async ({ page }) => {
    await page.goto("/tv-and-audio/fake-category-xyz");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(
      page.locator("header, nav, main, h1, [role='banner']").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("XSS search query does not crash or execute script", async ({ page }) => {
    // Listen for dialogs — if an alert fires, the XSS executed
    let alertFired = false;
    page.on("dialog", async (dialog) => {
      alertFired = true;
      await dialog.dismiss();
    });

    await page.goto("/search?q=<script>alert(1)</script>");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // Page must render something — not a blank screen
    await expect(
      page.locator("header, nav, main, h1, [role='banner']").first()
    ).toBeVisible({ timeout: 10000 });
    // The injected script tag must not have executed
    expect(alertFired).toBe(false);
  });

  test("direct checkout with empty basket loads without crash", async ({ page }) => {
    // Go straight to checkout with no items in basket
    await page.goto("/checkout");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    // Page must render — may redirect to basket or show an empty-state warning
    await expect(
      page.locator("header, nav, main, h1, [role='banner']").first()
    ).toBeVisible({ timeout: 10000 });
  });
});
