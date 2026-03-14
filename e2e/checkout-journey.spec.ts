import { test, expect, type Page } from "@playwright/test";
import {
  DELIVERY_ADDRESS,
  CUSTOMER_DETAILS,
  PAYMENT_CARD,
} from "../tests/fixtures/checkout-data";

/**
 * Adds the first available product from the TVs category to the basket.
 * Returns the product title text and the displayed price string.
 */
async function addFirstProductToBasket(page: Page) {
  await page.goto("/tv-and-audio/televisions/tvs");
  await expect(page.locator("a[href*='/products/']").first()).toBeVisible({
    timeout: 15000,
  });

  // Click into the first product detail page
  const firstProduct = page.locator("a[href*='/products/']").first();
  await firstProduct.click();
  await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });

  // Capture title and price from the PDP before adding
  const titleEl = page.getByRole("heading", { level: 1 });
  await expect(titleEl).toBeVisible({ timeout: 15000 });
  const productTitle = (await titleEl.textContent()) ?? "";

  const priceEl = page.locator("[data-testid='product-price']");
  await expect(priceEl).toBeVisible({ timeout: 15000 });
  const priceText = (await priceEl.textContent()) ?? "";

  // Add to basket
  const addBtn = page.locator("[data-testid='add-to-basket']");
  await expect(addBtn).toBeVisible({ timeout: 15000 });
  await addBtn.click();

  // Wait for the basket count badge to appear in the header
  const basketCount = page.locator("[data-testid='basket-count']");
  await expect(basketCount).toBeVisible({ timeout: 15000 });

  return { productTitle, priceText };
}

test.describe("@regression Checkout journey", () => {
  // Increase the default timeout for the full purchase flow — it includes a
  // simulated payment processing delay of up to 7 seconds.
  test.setTimeout(120_000);

  test("complete purchase: category -> PDP -> basket -> checkout -> confirmation", async ({
    page,
  }) => {
    // ----------------------------------------------------------------
    // Step 1 — Navigate to category, click product, add to basket
    // ----------------------------------------------------------------
    const { productTitle, priceText } = await addFirstProductToBasket(page);

    // ----------------------------------------------------------------
    // Step 2 — Go to basket, verify item and price are visible
    // ----------------------------------------------------------------
    await page.goto("/basket");
    await expect(page.locator("body")).not.toContainText(
      "Internal Server Error",
      { timeout: 15000 }
    );

    // The basket item row should be present
    const basketItem = page.locator("[data-testid='basket-item']").first();
    await expect(basketItem).toBeVisible({ timeout: 15000 });

    // A fragment of the product title should appear somewhere in the basket
    const nameFragment = productTitle.split(" ").slice(0, 3).join(" ");
    if (nameFragment) {
      await expect(
        page.locator(`text=/${nameFragment}/i`).first()
      ).toBeVisible({ timeout: 15000 });
    }

    // At least one price should be visible on the basket page
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // ----------------------------------------------------------------
    // Step 3 — Proceed to checkout
    // ----------------------------------------------------------------
    const checkoutLink = page.getByRole("link", {
      name: /continue to checkout/i,
    });
    await expect(checkoutLink).toBeVisible({ timeout: 15000 });
    await checkoutLink.click();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 15000 });

    // Welcome step should be visible — continue as guest
    const guestBtn = page.getByRole("button", {
      name: /continue as guest/i,
    });
    await expect(guestBtn).toBeVisible({ timeout: 15000 });
    await guestBtn.click();

    // ----------------------------------------------------------------
    // Step 4 — Fill delivery address
    // ----------------------------------------------------------------

    // Title select
    const titleSelect = page.locator("select");
    await expect(titleSelect).toBeVisible({ timeout: 15000 });
    await titleSelect.selectOption("Mr");

    // Name fields
    const firstNameInput = page.getByPlaceholder("First name*").first();
    await expect(firstNameInput).toBeVisible({ timeout: 15000 });
    await firstNameInput.fill(DELIVERY_ADDRESS.firstName);

    const lastNameInput = page.getByPlaceholder("Last name*").first();
    await lastNameInput.fill(DELIVERY_ADDRESS.lastName);

    // Phone
    const phoneInput = page.getByPlaceholder("Phone number*").first();
    await phoneInput.fill(DELIVERY_ADDRESS.phone);

    // Postcode
    const postcodeInput = page.getByPlaceholder("Postcode*").first();
    await postcodeInput.fill(DELIVERY_ADDRESS.postcode);

    // Click "Enter address manually" to reveal address fields
    const manualLink = page.getByText("Enter address manually");
    await expect(manualLink).toBeVisible({ timeout: 15000 });
    await manualLink.click();

    // Address line 1
    const address1Input = page.getByPlaceholder("Address 1*").first();
    await expect(address1Input).toBeVisible({ timeout: 15000 });
    await address1Input.fill(DELIVERY_ADDRESS.addressLine1);

    // City
    const cityInput = page.getByPlaceholder("Town / City*").first();
    await cityInput.fill(DELIVERY_ADDRESS.city);

    // Submit delivery step
    const useAddressBtn = page.getByRole("button", {
      name: /use this address/i,
    });
    await expect(useAddressBtn).toBeVisible({ timeout: 15000 });
    await useAddressBtn.click();

    // ----------------------------------------------------------------
    // Step 5 — Fill customer details (email)
    // ----------------------------------------------------------------

    const emailInput = page.getByPlaceholder("Email address*");
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await emailInput.fill(CUSTOMER_DETAILS.email);

    // "Use my delivery details as my billing details" checkbox is checked
    // by default — leave it checked.

    // Submit customer step
    const continueToPayment = page.getByRole("button", {
      name: /continue to payment/i,
    });
    await expect(continueToPayment).toBeVisible({ timeout: 15000 });
    await continueToPayment.click();

    // ----------------------------------------------------------------
    // Step 6 — Fill payment form
    // ----------------------------------------------------------------

    // Card number — the label text "Card number" is present
    const cardNumberInput = page
      .getByLabel("Card number")
      .or(page.getByPlaceholder("0000 0000 0000 0000"));
    await expect(cardNumberInput.first()).toBeVisible({ timeout: 15000 });
    await cardNumberInput.first().fill(PAYMENT_CARD.number.replace(/\s/g, ""));

    // Name on card
    const cardNameInput = page
      .getByLabel("Name on card")
      .or(page.getByPlaceholder("J Smith"));
    await expect(cardNameInput.first()).toBeVisible({ timeout: 15000 });
    await cardNameInput.first().fill(PAYMENT_CARD.name);

    // Expiry date — the raw digits without the slash
    const expiryInput = page
      .getByLabel("Expiry date")
      .or(page.getByPlaceholder("MM/YY"));
    await expect(expiryInput.first()).toBeVisible({ timeout: 15000 });
    await expiryInput.first().fill(PAYMENT_CARD.expiry.replace("/", ""));

    // CVV
    const cvvInput = page
      .getByLabel("CVV")
      .or(page.getByPlaceholder("123"));
    await expect(cvvInput.first()).toBeVisible({ timeout: 15000 });
    await cvvInput.first().fill(PAYMENT_CARD.cvv);

    // ----------------------------------------------------------------
    // Step 7 — Submit order and verify confirmation
    // ----------------------------------------------------------------
    const placeOrderBtn = page.getByRole("button", {
      name: /place order/i,
    });
    await expect(placeOrderBtn).toBeVisible({ timeout: 15000 });
    await placeOrderBtn.click();

    // The checkout page uses a setTimeout of up to 7000ms for processing.
    // Wait for the confirmation page.
    await expect(page).toHaveURL(/\/checkout\/confirmation\?order=/, {
      timeout: 30000,
    });

    // Order number should be displayed
    const orderNumber = page.locator("[data-testid='order-number']");
    await expect(orderNumber).toBeVisible({ timeout: 15000 });
    const orderNumText = await orderNumber.textContent();
    expect(orderNumText).toBeTruthy();
    expect(orderNumText).toMatch(/^ELZ-/);

    // "Thank you" heading should appear
    await expect(
      page.getByRole("heading", { name: /thank you/i })
    ).toBeVisible({ timeout: 15000 });

    // Order items section should list at least one item
    await expect(page.getByText("Order items")).toBeVisible({
      timeout: 15000,
    });

    // A price (total) should be visible on the confirmation page
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // "Total" label should be present
    await expect(page.getByText("Total").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("no console errors through homepage -> PDP -> basket -> checkout flow", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const uncaughtExceptions: string[] = [];

    // Listen for console.error messages
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for uncaught exceptions (page crashes, unhandled promise rejections)
    page.on("pageerror", (error) => {
      uncaughtExceptions.push(error.message);
    });

    // 1. Homepage
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    // 2. Navigate to a category and then a PDP
    await page.goto("/tv-and-audio/televisions/tvs");
    await expect(page.locator("a[href*='/products/']").first()).toBeVisible({
      timeout: 15000,
    });

    const firstProduct = page.locator("a[href*='/products/']").first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\//, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible({ timeout: 15000 });

    // 3. Add to basket and go to basket page
    const addBtn = page.locator("[data-testid='add-to-basket']");
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    await page.goto("/basket");
    await expect(
      page.locator("[data-testid='basket-item']").first()
    ).toBeVisible({ timeout: 15000 });

    // 4. Go to checkout
    await page.goto("/checkout");
    await expect(page.locator("text=/£\\d+/").first()).toBeVisible({
      timeout: 15000,
    });

    // Filter out known benign Next.js hydration/dev-mode warnings
    const realErrors = consoleErrors.filter(
      (msg) =>
        !msg.includes("Download the React DevTools") &&
        !msg.includes("Warning:") &&
        !msg.includes("ReactDOM.render is no longer supported") &&
        !msg.includes("404 (Not Found)") &&
        !msg.includes("Failed to load resource") &&
        !msg.includes("[Fast Refresh]")
    );

    expect(
      uncaughtExceptions,
      `Uncaught exceptions found:\n${uncaughtExceptions.join("\n")}`
    ).toHaveLength(0);

    expect(
      realErrors,
      `Console errors found:\n${realErrors.join("\n")}`
    ).toHaveLength(0);
  });
});
