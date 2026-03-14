import { Page, expect } from "@playwright/test";

/**
 * Navigate to TVs category, click first product, add to basket.
 * Returns product title and price text.
 */
export async function addProductToBasket(
  page: Page
): Promise<{ title: string; price: string }> {
  // Navigate directly to a known product — avoids PLP→PDP click navigation race
  await page.goto(
    "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html"
  );
  await page.waitForLoadState("networkidle");

  // Wait for the add-to-basket button to be ready
  await page
    .locator("[data-testid='add-to-basket']")
    .waitFor({ state: "visible", timeout: 15000 });

  // Extract title and price
  const title =
    (await page.getByRole("heading", { level: 1 }).textContent()) ?? "";
  const price =
    (await page.locator("[data-testid='product-price']").textContent()) ?? "";

  // Add to basket
  await page.locator("[data-testid='add-to-basket']").click();

  // Wait for confirmation — either basket count badge or toast
  try {
    await page
      .locator("[data-testid='basket-count']")
      .waitFor({ state: "visible", timeout: 5000 });
  } catch {
    // Fallback: wait for the "Added" text on the button
    await page.waitForTimeout(1000);
  }

  // Ensure localStorage is populated before navigating away — BasketProvider
  // persists state via useEffect which can lag behind the UI update
  await page.waitForFunction(
    () => {
      const data = localStorage.getItem("electric-basket");
      if (!data) return false;
      try {
        const parsed = JSON.parse(data);
        return parsed.items && parsed.items.length > 0;
      } catch {
        return false;
      }
    },
    { timeout: 10000 }
  );

  return { title: title.trim(), price: price.trim() };
}

/**
 * Navigate to first TV PDP. Returns the product URL.
 */
export async function navigateToFirstProduct(page: Page): Promise<string> {
  const url =
    "/products/lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html";
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  return page.url();
}

/**
 * Inject a product into the basket via localStorage — more reliable than UI flow
 * for setup purposes. Navigates to any page first to establish the origin.
 */
export async function seedBasketViaStorage(page: Page): Promise<void> {
  // Navigate to homepage first to establish localStorage origin
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Inject a realistic basket item into localStorage matching the Product type
  await page.evaluate(() => {
    const basketData = {
      items: [
        {
          product: {
            id: "10281549",
            slug: "lg-c5-55-oled-evo-ai-4k-hdr-smart-tv-2025-oled55c54la-10281549.html",
            title: 'LG C5 55" OLED evo AI 4K HDR Smart TV 2025 - OLED55C54LA',
            brand: "LG",
            category: "tvs",
            subcategory: "televisions",
            price: { current: 1299, was: 1353.12, savings: 54.12 },
            images: {
              main: "/images/products/10281549/main.webp",
              gallery: ["/images/products/10281549/main.webp"],
              thumbnail: "/images/products/10281549/main.webp",
            },
            rating: { average: 4.5, count: 120 },
            specs: { "Screen Size": '55"', Resolution: "4K Ultra HD" },
            keySpecs: ['55" OLED', "4K Ultra HD", "AI Picture"],
            description: "LG C5 OLED TV",
            deliveryInfo: { freeDelivery: true, estimatedDate: "Tomorrow" },
            badges: [],
            tags: [],
            offers: [],
            energyRating: "G",
            inStock: true,
          },
          quantity: 1,
        },
      ],
      subtotal: 1299,
      deliveryCost: 0,
      total: 1299,
    };
    localStorage.setItem("electric-basket", JSON.stringify(basketData));
  });
}

/**
 * Wait for Next.js hydration — ensures interactive elements are ready.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  // Allow React hydration to complete after network settles
  await page.waitForTimeout(500);
}
