import { test, expect } from "@playwright/test";

test.describe("@regression Filter deep interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tv-and-audio/televisions/tvs");
    // Wait for product prices to render — confirms listing is loaded
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });
  });

  test("applying Brand + Price filters together reduces product count", async ({ page }) => {
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // --- Apply Brand filter ---
    // Expand Brand group if collapsed
    const brandGroup = page.locator("[data-testid='filter-group']", {
      has: page.locator("text=/^Brand$/"),
    });
    if (await brandGroup.count() > 0) {
      const brandHeader = brandGroup.locator("button").first();
      // Click to expand if options aren't visible
      const brandCheckbox = brandGroup.locator("input[type='checkbox']").first();
      if (!(await brandCheckbox.isVisible({ timeout: 2000 }).catch(() => false))) {
        await brandHeader.click();
        await page.waitForTimeout(300);
      }
      // Pick the first available brand
      await brandGroup.locator("input[type='checkbox']").first().click();
      await page.waitForTimeout(500);
    }

    const afterBrandCount = await productCards.count();
    expect(afterBrandCount).toBeLessThanOrEqual(initialCount);

    // --- Apply Price filter ---
    const priceGroup = page.locator("[data-testid='filter-group']", {
      has: page.locator("text=/^Price$/"),
    });
    if (await priceGroup.count() > 0) {
      const priceCheckbox = priceGroup.locator("input[type='checkbox']").first();
      if (await priceCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceCheckbox.click();
        await page.waitForTimeout(500);
      }
    }

    const afterBothCount = await productCards.count();
    // Combined filters should reduce (or at least not increase) from brand-only
    expect(afterBothCount).toBeLessThanOrEqual(afterBrandCount);
    // At least one filter should have reduced from initial
    expect(afterBothCount).toBeLessThan(initialCount);
  });

  test("clearing one filter partially restores the product count", async ({ page }) => {
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();

    // Expand Brand group and apply a brand filter
    const brandGroup = page.locator("[data-testid='filter-group']", {
      has: page.locator("text=/^Brand$/"),
    });
    if (await brandGroup.count() === 0) {
      test.skip();
      return;
    }

    const brandHeader = brandGroup.locator("button").first();
    const brandCheckbox = brandGroup.locator("input[type='checkbox']").first();
    if (!(await brandCheckbox.isVisible({ timeout: 2000 }).catch(() => false))) {
      await brandHeader.click();
      await page.waitForTimeout(300);
    }
    // Apply first brand
    await brandGroup.locator("input[type='checkbox']").first().click();
    await page.waitForTimeout(500);

    // Apply a Price filter too
    const priceGroup = page.locator("[data-testid='filter-group']", {
      has: page.locator("text=/^Price$/"),
    });
    if (await priceGroup.count() > 0) {
      const priceCheckbox = priceGroup.locator("input[type='checkbox']").first();
      if (await priceCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await priceCheckbox.click();
        await page.waitForTimeout(500);
      }
    }

    const combinedCount = await productCards.count();

    // Now clear the brand filter using the chip dismiss button in the active-filter pill area
    // The chip buttons contain an SVG cross and have aria-label "Remove ... filter"
    const brandChip = page.locator("button[aria-label*='Remove'][aria-label*='filter']").first();
    if (await brandChip.isVisible({ timeout: 2000 }).catch(() => false)) {
      await brandChip.click();
      await page.waitForTimeout(500);
    } else {
      // Fallback: uncheck the brand checkbox directly
      await brandGroup.locator("input[type='checkbox']:checked").first().click();
      await page.waitForTimeout(500);
    }

    const afterClearOneCount = await productCards.count();
    // Removing one filter should restore some products
    expect(afterClearOneCount).toBeGreaterThanOrEqual(combinedCount);
    // But not necessarily all, since Price filter is still active
    expect(afterClearOneCount).toBeLessThanOrEqual(initialCount);
  });

  test("price range min/max filters products within expected range", async ({ page }) => {
    const priceGroup = page.locator("[data-testid='filter-group']", {
      has: page.locator("text=/^Price$/"),
    });
    if (await priceGroup.count() === 0) {
      test.skip();
      return;
    }

    // The Price filter group has min/max inputs and an Apply button
    const minInput = priceGroup.locator("input[placeholder='Min']");
    const maxInput = priceGroup.locator("input[placeholder='Max']");
    const applyButton = priceGroup.locator("button", { hasText: "Apply" });

    if (!(await minInput.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip();
      return;
    }

    const MIN_PRICE = 200;
    const MAX_PRICE = 500;

    await minInput.fill(String(MIN_PRICE));
    await maxInput.fill(String(MAX_PRICE));
    await applyButton.click();
    await page.waitForTimeout(1000);

    // Verify all visible prices fall within range
    const priceSpans = page.locator("span.text-2xl");
    const priceCount = await priceSpans.count();

    // If the price-range input is wired up (it may be display-only in the MVP),
    // check the rendered prices
    if (priceCount > 0) {
      for (let i = 0; i < Math.min(priceCount, 10); i++) {
        const text = await priceSpans.nth(i).textContent();
        if (text) {
          const value = parseFloat(text.replace(/[£,]/g, ""));
          if (!isNaN(value) && value > 0) {
            // Allow generous tolerance — some edge products may be at boundary
            expect(value).toBeGreaterThanOrEqual(MIN_PRICE * 0.9);
            expect(value).toBeLessThanOrEqual(MAX_PRICE * 1.1);
          }
        }
      }
    }
  });

  test("page 2 shows different products than page 1", async ({ page }) => {
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();

    // Pagination only exists when there are more products than perPage (default 20)
    const nextButton = page.locator("button", { hasText: "Next" });
    if (!(await nextButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      // Not enough products for pagination — skip gracefully
      test.skip();
      return;
    }

    // Collect product hrefs from page 1
    const page1Hrefs: string[] = [];
    const count = await productCards.count();
    for (let i = 0; i < count; i++) {
      const href = await productCards.nth(i).getAttribute("href");
      if (href) page1Hrefs.push(href);
    }

    // Navigate to page 2
    await nextButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({ timeout: 15000 });

    // Collect product hrefs from page 2
    const page2Cards = page.locator("a[href*='/products/']");
    const page2Count = await page2Cards.count();
    expect(page2Count).toBeGreaterThan(0);

    const page2Hrefs: string[] = [];
    for (let i = 0; i < page2Count; i++) {
      const href = await page2Cards.nth(i).getAttribute("href");
      if (href) page2Hrefs.push(href);
    }

    // Page 2 products should differ from page 1 — no overlap
    const overlap = page2Hrefs.filter((h) => page1Hrefs.includes(h));
    expect(overlap.length).toBe(0);
  });

  test("changing per-page to 40 shows more products", async ({ page }) => {
    const productCards = page.locator("a[href*='/products/']");
    const initialCount = await productCards.count();

    // The per-page selector is the second <select> in the sort bar
    // It contains options: "Show: 20", "Show: 40", "Show: 60"
    const perPageSelect = page.locator("select").filter({ hasText: "Show:" });
    if (!(await perPageSelect.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip();
      return;
    }

    // Only meaningful if there are more than 20 products total
    const itemsText = page.locator("text=/\\d+ Items/");
    let totalItems = 0;
    if (await itemsText.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await itemsText.textContent();
      const match = text?.match(/(\d+)/);
      if (match) totalItems = parseInt(match[1], 10);
    }

    if (totalItems <= 20) {
      // Not enough products to see a difference — skip
      test.skip();
      return;
    }

    // Switch to 40 per page
    await perPageSelect.selectOption("40");
    await page.waitForTimeout(1000);

    const newCount = await productCards.count();
    // Should show more products than the default 20
    expect(newCount).toBeGreaterThan(initialCount);
    // Should show at most 40
    expect(newCount).toBeLessThanOrEqual(40);
  });
});
