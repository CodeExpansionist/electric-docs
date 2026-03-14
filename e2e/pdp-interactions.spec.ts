import { test, expect, type Page } from "@playwright/test";

/**
 * Navigate from the TVs listing page to the first product's PDP.
 * Returns the PDP page so subsequent tests can interact with it.
 */
async function navigateToFirstTvPdp(page: Page) {
  await page.goto("/tv-and-audio/televisions/tvs", { waitUntil: "domcontentloaded", timeout: 30_000 });

  // The listing renders ProductListCards — each has an <a> wrapping the
  // product image or title that links to /products/<slug>.
  // Click the first "View product" button (btn-outline) or the first
  // product title link.
  const firstProductLink = page
    .locator('a[href^="/products/"]')
    .first();

  await expect(firstProductLink).toBeVisible({ timeout: 15_000 });
  await firstProductLink.click();

  // Wait for the PDP to settle — the price test-id is a reliable anchor.
  await expect(page.locator('[data-testid="product-price"]')).toBeVisible({ timeout: 15_000 });
}

test.describe("@regression PDP interactions", () => {
  // ------------------------------------------------------------------ //
  // 1. Gallery: click a thumbnail and verify the main image changes
  // ------------------------------------------------------------------ //
  test("gallery thumbnail click updates the main image", async ({ page }) => {
    await navigateToFirstTvPdp(page);

    // The gallery renders thumbnails as <button> elements with <img> inside.
    // Each thumbnail button has an 80x80 Image (alt "Thumbnail N").
    const thumbnails = page.locator('button:has(img[alt^="Thumbnail"])');
    const thumbnailCount = await thumbnails.count();

    // Some products have a single image (no gallery). Skip gracefully.
    if (thumbnailCount < 2) {
      test.skip(true, "Product has fewer than 2 gallery images — nothing to toggle");
      return;
    }

    // The main/hero image sits in the aspect-[4/3] container and its alt
    // follows the pattern "<product name> - Image N".
    const mainImage = page.locator('img[alt*="- Image"]').first();
    const initialAlt = await mainImage.getAttribute("alt");

    // Click the second thumbnail (index 1) — it should differ from the
    // initially selected thumbnail (index 0).
    await thumbnails.nth(1).click();

    // The main image alt should update to reflect "Image 2".
    await expect(mainImage).not.toHaveAttribute("alt", initialAlt!, { timeout: 5_000 });

    // Also verify the counter label updates. The counter is a <span>
    // inside the gallery showing "N / M".
    const counter = page.locator("span").filter({ hasText: /^\d+\s*\/\s*\d+$/ }).first();
    if (await counter.isVisible()) {
      await expect(counter).toContainText("2 /");
    }
  });

  // ------------------------------------------------------------------ //
  // 2. Size variant: click a different size and confirm URL navigation
  // ------------------------------------------------------------------ //
  test("clicking a different size variant navigates to a new product URL", async ({ page }) => {
    await navigateToFirstTvPdp(page);

    const initialUrl = page.url();

    // Size variants are rendered as circular selectors inside a "Screen Size"
    // section. Available (non-selected) sizes are wrapped in <a> tags
    // pointing to /products/<other-slug>.
    const sizeLinks = page.locator('a[href^="/products/"] div:has(svg) + span');
    // Alternatively, target the <a> wrappers directly.
    const sizeAnchors = page.locator(
      'a[href^="/products/"][class*="no-underline"]:has(div.rounded-full)'
    );

    const anchorCount = await sizeAnchors.count();

    if (anchorCount === 0) {
      // Fallback: try broader selector for any size-variant link that is
      // NOT the currently selected one (selected sizes are <span> not <a>).
      const fallbackAnchors = page.locator(
        'a[href^="/products/"]:has(div.w-\\[60px\\])'
      );
      const fallbackCount = await fallbackAnchors.count();

      if (fallbackCount === 0) {
        test.skip(true, "Product has no navigable size variants");
        return;
      }

      await fallbackAnchors.first().click();
    } else {
      await sizeAnchors.first().click();
    }

    // Wait for navigation to complete — the URL should change.
    await page.waitForURL(/\/products\//, { timeout: 15_000 });
    expect(page.url()).not.toBe(initialUrl);

    // The new PDP should also show a price.
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible({ timeout: 15_000 });
  });

  // ------------------------------------------------------------------ //
  // 3. Cross-sell section shows products
  // ------------------------------------------------------------------ //
  test("cross-sell section displays accessory products", async ({ page }) => {
    await navigateToFirstTvPdp(page);

    // The CrossSellProducts component renders a heading:
    // "What you'll need to make it even better"
    // and each product sits inside a bordered card with a checkbox.
    const crossSellHeading = page.locator("h3").filter({
      hasText: /make it even better/i,
    });

    if (!(await crossSellHeading.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "This product has no cross-sell section");
      return;
    }

    await expect(crossSellHeading).toBeVisible();

    // Each cross-sell product card contains a checkbox + product title + price.
    const crossSellCards = page.locator("div.border.border-border.rounded-lg.p-4");
    await expect(crossSellCards.first()).toBeVisible({ timeout: 5_000 });
    const cardCount = await crossSellCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Verify each card has a price (contains a pound sign).
    const firstCardPrice = crossSellCards.first().locator("span.font-bold");
    await expect(firstCardPrice).toContainText("£");
  });

  // ------------------------------------------------------------------ //
  // 4. Energy rating badge is visible where applicable
  // ------------------------------------------------------------------ //
  test("energy rating badge is visible for products with an energy rating", async ({ page }) => {
    await navigateToFirstTvPdp(page);

    // The EnergyRatingBadge renders an <img> with alt "Energy rating X"
    // where X is A-G. It lives inside the PricePanel (right column).
    const energyBadge = page.locator('img[alt^="Energy rating"]');

    if (!(await energyBadge.first().isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "This product has no energy rating");
      return;
    }

    await expect(energyBadge.first()).toBeVisible();

    // The badge image src should point to a local energy-class SVG.
    const src = await energyBadge.first().getAttribute("src");
    expect(src).toMatch(/energy-class-[A-G]\.svg/i);

    // There should also be a "Product fiche" link next to it.
    const ficheLink = page.locator("text=Product fiche").first();
    await expect(ficheLink).toBeVisible({ timeout: 3_000 });
  });

  // ------------------------------------------------------------------ //
  // 5. Add to basket button works and shows confirmation
  // ------------------------------------------------------------------ //
  test("add to basket button shows confirmation toast", async ({ page }) => {
    await navigateToFirstTvPdp(page);

    const addToBasket = page.locator('[data-testid="add-to-basket"]');
    await expect(addToBasket).toBeVisible({ timeout: 10_000 });
    await expect(addToBasket).toContainText("Add to basket");

    await addToBasket.click();

    // The button text changes to "Added" briefly.
    await expect(addToBasket).toContainText("Added", { timeout: 3_000 });

    // A toast appears with "Added to basket" and a "View basket" link.
    const toast = page.locator("text=Added to basket").first();
    await expect(toast).toBeVisible({ timeout: 3_000 });

    const viewBasketLink = page.locator('a[href="/basket"]').filter({ hasText: "View basket" });
    await expect(viewBasketLink).toBeVisible({ timeout: 3_000 });
  });
});
