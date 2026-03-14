import { test, expect } from "@playwright/test";

test.describe("Admin smoke", () => {
  test("/admin loads with dashboard content", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText("Total Orders")).toBeVisible();
    await expect(page.getByText("Total Revenue")).toBeVisible();
  });

  test("/admin/products shows product table", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();
    // Products page renders count text like "X products in catalog"
    await expect(page.getByText(/products in catalog/i)).toBeVisible();
    // At least one price visible in the table
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });
  });

  test("/admin/orders shows orders content", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
    // Export CSV button is present
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
  });

  test("/admin/customers shows customer content", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible();
    // Customer count text like "X customers"
    await expect(page.getByText(/\d+ customers/i)).toBeVisible();
  });
});
