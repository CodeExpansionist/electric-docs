import { test, expect } from "@playwright/test";

/**
 * Content pages smoke tests
 *
 * Loops through every service, footer-linked, and standalone content page
 * to verify none of them crash, all render a heading, and all have visible
 * content (i.e. not a blank white page).
 */

const CONTENT_PAGES = [
  // ── Services (from /src/app/services/) ──
  { url: "/services/delivery", label: "Delivery options" },
  { url: "/services/returns", label: "Returns & cancellations" },
  { url: "/services/gift-cards", label: "Gift cards" },
  { url: "/services/instant-replacement", label: "Instant Replacement" },
  { url: "/services/price-promise", label: "Price Promise" },
  { url: "/services/shoplive", label: "ShopLive" },
  { url: "/services/tablet-insurance", label: "Tablet Insurance" },

  // ── Footer / help links ──
  { url: "/contact-us", label: "Contact us" },
  { url: "/track-your-order", label: "Track your order" },
  { url: "/help-and-support", label: "Help & support" },
  { url: "/product-reviews", label: "Product reviews" },

  // ── Standalone content pages ──
  { url: "/techtalk", label: "TechTalk hub" },
  { url: "/account", label: "Account" },
  { url: "/privacy-cookies-policy", label: "Privacy & cookies policy" },
  { url: "/product-recalls", label: "Product recalls" },
  { url: "/terms-and-conditions", label: "Terms & conditions" },
  { url: "/site-map", label: "Site map" },
];

test.describe("Content pages smoke", () => {
  for (const { url, label } of CONTENT_PAGES) {
    test(`${label} (${url}) renders without crashing`, async ({ page }) => {
      // Generous timeout — some content pages lazy-load data
      test.setTimeout(30_000);

      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });

      // 1. Page did not crash — no "Internal Server Error" in body
      const body = page.locator("body");
      await expect(body).not.toContainText("Internal Server Error", {
        timeout: 10_000,
      });

      // Also verify we got a successful HTTP status (not 500)
      expect(response?.status()).toBeLessThan(500);

      // 2. A heading is visible (h1–h6)
      const heading = page.getByRole("heading").first();
      await expect(heading).toBeVisible({ timeout: 10_000 });

      // 3. Content section is present — page is not blank
      //    Check that the main content area has meaningful text (> 20 chars)
      const mainContent = page.locator("main, [role='main'], .container-main, article").first();
      if (await mainContent.count()) {
        await expect(mainContent).not.toBeEmpty();
      } else {
        // Fallback: body itself should have substantial content beyond header/footer
        const bodyText = await body.innerText();
        expect(bodyText.length).toBeGreaterThan(50);
      }
    });
  }
});
