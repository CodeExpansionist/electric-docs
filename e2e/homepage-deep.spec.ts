import { test, expect } from "@playwright/test";

test.describe("Homepage deep", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  // ---------------------------------------------------------------
  // 1. Hero carousel: clicking next arrow advances the slide
  // ---------------------------------------------------------------
  test("hero carousel advances when clicking the next arrow", async ({ page }) => {
    const heroSection = page.locator('section[aria-roledescription="carousel"]');
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Grab the first hero image's alt text before clicking
    const firstImage = heroSection.locator("img").first();
    await expect(firstImage).toBeVisible({ timeout: 10000 });
    const altBefore = await firstImage.getAttribute("alt");

    // Click "Next slide" arrow
    const nextBtn = heroSection.getByLabel("Next slide");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // After advancing, the first visible image should have a different alt
    // (the carousel shifts which slides are in view)
    await expect(async () => {
      const altAfter = await heroSection.locator("img").first().getAttribute("alt");
      expect(altAfter).not.toBe(altBefore);
    }).toPass({ timeout: 5000 });
  });

  test("hero carousel goes back when clicking the previous arrow", async ({ page }) => {
    const heroSection = page.locator('section[aria-roledescription="carousel"]');
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Advance once, then go back
    const nextBtn = heroSection.getByLabel("Next slide");
    const prevBtn = heroSection.getByLabel("Previous slide");
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Wait for slide to change
    await page.waitForTimeout(400);

    const altAfterNext = await heroSection.locator("img").first().getAttribute("alt");

    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(async () => {
      const altAfterPrev = await heroSection.locator("img").first().getAttribute("alt");
      expect(altAfterPrev).not.toBe(altAfterNext);
    }).toPass({ timeout: 5000 });
  });

  // ---------------------------------------------------------------
  // 2. Shop Deals section has category links
  // ---------------------------------------------------------------
  test("Shop Deals section shows deal categories", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="shop-deals-heading"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Heading is present
    const heading = section.locator("#shop-deals-heading");
    await expect(heading).toHaveText(/shop deals/i);

    // At least 3 category links are visible
    const links = section.locator('a[href*="/"]');
    await expect(links.first()).toBeVisible({ timeout: 5000 });
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Each link has an image and a label
    for (let i = 0; i < Math.min(count, 3); i++) {
      const link = links.nth(i);
      await expect(link.locator("img")).toBeVisible();
      // Link text (category name) should not be empty
      const text = await link.locator("span").innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  // ---------------------------------------------------------------
  // 3. Big Brand Deals section shows branded deal cards with images
  // ---------------------------------------------------------------
  test("Big Brand Deals section displays deal cards with images", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="big-brand-deals-heading"]');
    await expect(section).toBeVisible({ timeout: 15000 });

    const heading = section.locator("#big-brand-deals-heading");
    await expect(heading).toHaveText(/big brand deals/i);

    // At least one deal card is visible (rendered via Carousel)
    const cards = section.locator("a[href]");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // First visible card has an image
    await expect(cards.first().locator("img")).toBeVisible();

    // First visible card has a title (h3)
    const title = await cards.first().locator("h3").innerText();
    expect(title.trim().length).toBeGreaterThan(0);
  });

  test("Discover Offers section displays offer cards", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="discover-offers-heading"]');
    await expect(section).toBeVisible({ timeout: 15000 });

    const heading = section.locator("#discover-offers-heading");
    await expect(heading).toHaveText(/discover our amazing offers/i);

    const cards = section.locator("a[href]");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Cards contain images
    await expect(cards.first().locator("img")).toBeVisible();
  });

  // ---------------------------------------------------------------
  // 4. CTA links resolve (not empty or "#")
  // ---------------------------------------------------------------
  test("hero carousel CTAs have valid hrefs", async ({ page }) => {
    const heroSection = page.locator('section[aria-roledescription="carousel"]');
    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const links = heroSection.locator("a[href]");
    await expect(links.first()).toBeVisible({ timeout: 5000 });
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).not.toBeNull();
      expect(href).not.toBe("");
      expect(href).not.toBe("#");
      // Should start with "/" (internal link)
      expect(href!.startsWith("/")).toBe(true);
    }
  });

  test("Shop Deals CTAs have valid hrefs", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="shop-deals-heading"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    const links = section.locator("a[href]");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).not.toBeNull();
      expect(href).not.toBe("");
      expect(href).not.toBe("#");
      expect(href!.startsWith("/")).toBe(true);
    }
  });

  test("Big Brand Deals CTAs have valid hrefs", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="big-brand-deals-heading"]');
    await expect(section).toBeVisible({ timeout: 15000 });

    const links = section.locator("a[href]");
    await expect(links.first()).toBeVisible({ timeout: 10000 });
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).not.toBeNull();
      expect(href).not.toBe("");
      expect(href).not.toBe("#");
      expect(href!.startsWith("/")).toBe(true);
    }
  });

  // ---------------------------------------------------------------
  // Bonus: Big Brand Deals carousel navigation works
  // ---------------------------------------------------------------
  test("Big Brand Deals carousel Next button advances cards", async ({ page }) => {
    const section = page.locator('section[aria-labelledby="big-brand-deals-heading"]');
    await expect(section).toBeVisible({ timeout: 15000 });

    // The Carousel component renders a "Next" button when there are more items
    const nextBtn = section.getByLabel("Next");
    // If there are more cards than visible slots, the Next button should appear
    const nextVisible = await nextBtn.isVisible().catch(() => false);

    if (nextVisible) {
      // Grab the transform style before clicking
      const track = section.locator(".flex.items-stretch");
      const transformBefore = await track.getAttribute("style");

      await nextBtn.click();

      // Transform should change after click
      await expect(async () => {
        const transformAfter = await track.getAttribute("style");
        expect(transformAfter).not.toBe(transformBefore);
      }).toPass({ timeout: 5000 });
    } else {
      // All items fit in view - no navigation needed, test passes
      test.info().annotations.push({
        type: "skip-reason",
        description: "All Big Brand Deals cards fit in viewport, no carousel navigation needed",
      });
    }
  });
});
