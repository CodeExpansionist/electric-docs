import { test, expect } from "@playwright/test";
import {
  BEHAVIOUR_RULES,
  BehaviourRule,
} from "../../tests/parity/behaviour-rules";
import {
  navigateToFirstProduct,
  addProductToBasket,
  waitForHydration,
} from "../../tests/parity/utils/setup-helpers";

interface BehaviourVerdict {
  ruleId: string;
  interaction: string;
  template: string;
  status: "same" | "different" | "missing";
  detail: string;
  severity: "P0" | "P1";
  currysExpected: string;
  electrizActual: string;
}

const verdicts: BehaviourVerdict[] = [];

function ruleById(id: string): BehaviourRule {
  const rule = BEHAVIOUR_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Unknown rule: ${id}`);
  return rule;
}

function pushVerdict(verdict: BehaviourVerdict, info: ReturnType<typeof test.info>) {
  verdicts.push(verdict);
  info.annotations.push({
    type: "parity-behavioural",
    description: JSON.stringify(verdict),
  });
}

// ─── PLP URL used across filter tests ───
const PLP_URL = "/tv-and-audio/televisions/tvs";

test.describe("@parity Behavioural parity", () => {
  // ────────────────────────────────────────────────
  // 1. filter-apply-chip (PLP)
  // ────────────────────────────────────────────────
  test("filter-apply-chip: selecting a brand filter reduces count and shows chip @parity", async ({
    page,
  }) => {
    const rule = ruleById("filter-apply-chip");
    let verdict: BehaviourVerdict;

    try {
      await page.goto(PLP_URL);
      await page.waitForLoadState("networkidle");

      // Capture initial product count text (e.g. "142 Items")
      const countLocator = page.locator("text=/\\d+ Items/").first();
      await countLocator.waitFor({ timeout: 15000 });
      const initialCountText = await countLocator.textContent();
      const initialCount = parseInt(initialCountText?.match(/(\d+)/)?.[1] || "0", 10);

      // Find the Brand filter group and expand it if collapsed
      const filterGroups = page.locator("[data-testid='filter-group']");
      const groupCount = await filterGroups.count();
      let brandGroup = null;

      for (let i = 0; i < groupCount; i++) {
        const groupEl = filterGroups.nth(i);
        const label = await groupEl.locator("span.text-sm.font-semibold").first().textContent();
        if (label?.includes("Brand")) {
          brandGroup = groupEl;
          break;
        }
      }

      if (!brandGroup) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "missing",
          detail: "Could not find Brand filter group",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "Brand filter group not found",
        };
      } else {
        // Expand the group if needed by clicking its header button
        const checkbox = brandGroup.locator("input[type='checkbox']").first();
        const isVisible = await checkbox.isVisible().catch(() => false);
        if (!isVisible) {
          await brandGroup.locator("button").first().click();
          await checkbox.waitFor({ state: "visible", timeout: 5000 });
        }

        // Click the first brand checkbox
        await checkbox.click();
        await page.waitForTimeout(500); // allow React state update

        // Check new count
        const newCountText = await countLocator.textContent();
        const newCount = parseInt(newCountText?.match(/(\d+)/)?.[1] || "0", 10);

        // Check for applied filter chip/pill
        const chipVisible = await page
          .locator("text=Applied filters")
          .isVisible()
          .catch(() => false);

        if (newCount < initialCount && chipVisible) {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "same",
            detail: `Product count decreased from ${initialCount} to ${newCount} and filter chip appeared`,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Count: ${initialCount} -> ${newCount}, chip visible`,
          };
        } else {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "different",
            detail: `Count changed: ${initialCount} -> ${newCount}, chip visible: ${chipVisible}`,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Count: ${initialCount} -> ${newCount}, chip: ${chipVisible}`,
          };
        }
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 2. filter-clear-one (PLP)
  // ────────────────────────────────────────────────
  test("filter-clear-one: removing one chip keeps the other active @parity", async ({
    page,
  }) => {
    const rule = ruleById("filter-clear-one");
    let verdict: BehaviourVerdict;

    try {
      await page.goto(PLP_URL);
      await page.waitForLoadState("networkidle");

      // Wait for products
      await page.locator("text=/\\d+ Items/").first().waitFor({ timeout: 15000 });

      // Find and expand Brand filter group
      const filterGroups = page.locator("[data-testid='filter-group']");
      const groupCount = await filterGroups.count();
      let brandGroup = null;

      for (let i = 0; i < groupCount; i++) {
        const groupEl = filterGroups.nth(i);
        const label = await groupEl.locator("span.text-sm.font-semibold").first().textContent();
        if (label?.includes("Brand")) {
          brandGroup = groupEl;
          break;
        }
      }

      if (!brandGroup) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "missing",
          detail: "Could not find Brand filter group",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "Brand filter group not found",
        };
      } else {
        // Expand if collapsed
        const firstCheckbox = brandGroup.locator("input[type='checkbox']").first();
        const isVisible = await firstCheckbox.isVisible().catch(() => false);
        if (!isVisible) {
          await brandGroup.locator("button").first().click();
          await firstCheckbox.waitFor({ state: "visible", timeout: 5000 });
        }

        // Select first two brand checkboxes
        const checkboxes = brandGroup.locator("input[type='checkbox']");
        const checkboxCount = await checkboxes.count();

        if (checkboxCount < 2) {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "missing",
            detail: "Need at least 2 brand checkboxes, found " + checkboxCount,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: "Insufficient brand options",
          };
        } else {
          // Get first two brand labels for verification
          const label1 = await brandGroup.locator("label").nth(0).locator("span.text-sm").textContent();
          const label2 = await brandGroup.locator("label").nth(1).locator("span.text-sm").textContent();
          const brand1Name = label1?.split("(")[0]?.trim() || "";
          const brand2Name = label2?.split("(")[0]?.trim() || "";

          await checkboxes.nth(0).click();
          await page.waitForTimeout(300);
          await checkboxes.nth(1).click();
          await page.waitForTimeout(300);

          // Verify two chips exist in Applied filters section
          const chipButtons = page.locator("button[aria-label^='Remove']");
          const chipCountBefore = await chipButtons.count();

          // Remove the first chip (click the X button)
          if (chipCountBefore >= 2) {
            await chipButtons.first().click();
            await page.waitForTimeout(300);

            const chipCountAfter = await page.locator("button[aria-label^='Remove']").count();
            const appliedFiltersStillVisible = await page
              .locator("text=Applied filters")
              .isVisible()
              .catch(() => false);

            if (chipCountAfter === chipCountBefore - 1 && appliedFiltersStillVisible) {
              verdict = {
                ruleId: rule.id,
                interaction: rule.interaction,
                template: rule.template,
                status: "same",
                detail: `Removed one chip (${brand1Name}), other chip (${brand2Name}) remains. Chips: ${chipCountBefore} -> ${chipCountAfter}`,
                severity: rule.severity,
                currysExpected: rule.currysObserved,
                electrizActual: `One chip removed, other persists (${chipCountAfter} remaining)`,
              };
            } else {
              verdict = {
                ruleId: rule.id,
                interaction: rule.interaction,
                template: rule.template,
                status: "different",
                detail: `After removing one chip: chips ${chipCountBefore} -> ${chipCountAfter}, filters visible: ${appliedFiltersStillVisible}`,
                severity: rule.severity,
                currysExpected: rule.currysObserved,
                electrizActual: `Chips: ${chipCountBefore} -> ${chipCountAfter}`,
              };
            }
          } else {
            verdict = {
              ruleId: rule.id,
              interaction: rule.interaction,
              template: rule.template,
              status: "different",
              detail: `Expected 2 chips after selecting 2 brands, found ${chipCountBefore}`,
              severity: rule.severity,
              currysExpected: rule.currysObserved,
              electrizActual: `${chipCountBefore} chips after 2 brand selections`,
            };
          }
        }
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 3. filter-clear-all (PLP)
  // ────────────────────────────────────────────────
  test("filter-clear-all: 'Clear all' removes all chips and restores count @parity", async ({
    page,
  }) => {
    const rule = ruleById("filter-clear-all");
    let verdict: BehaviourVerdict;

    try {
      await page.goto(PLP_URL);
      await page.waitForLoadState("networkidle");

      const countLocator = page.locator("text=/\\d+ Items/").first();
      await countLocator.waitFor({ timeout: 15000 });
      const initialCountText = await countLocator.textContent();
      const initialCount = parseInt(initialCountText?.match(/(\d+)/)?.[1] || "0", 10);

      // Find and expand Brand filter group
      const filterGroups = page.locator("[data-testid='filter-group']");
      const groupCount = await filterGroups.count();
      let brandGroup = null;

      for (let i = 0; i < groupCount; i++) {
        const groupEl = filterGroups.nth(i);
        const label = await groupEl.locator("span.text-sm.font-semibold").first().textContent();
        if (label?.includes("Brand")) {
          brandGroup = groupEl;
          break;
        }
      }

      if (!brandGroup) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "missing",
          detail: "Could not find Brand filter group",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "Brand filter group not found",
        };
      } else {
        // Expand if needed
        const firstCheckbox = brandGroup.locator("input[type='checkbox']").first();
        const isVisible = await firstCheckbox.isVisible().catch(() => false);
        if (!isVisible) {
          await brandGroup.locator("button").first().click();
          await firstCheckbox.waitFor({ state: "visible", timeout: 5000 });
        }

        // Apply a filter
        await firstCheckbox.click();
        await page.waitForTimeout(300);

        // Verify filter was applied
        const chipsVisible = await page.locator("text=Applied filters").isVisible().catch(() => false);

        // Click "Clear all"
        const clearAllBtn = page.locator("button:has-text('Clear all')");
        await clearAllBtn.click();
        await page.waitForTimeout(500);

        // Verify chips removed
        const chipsAfterClear = await page.locator("text=Applied filters").isVisible().catch(() => false);
        const restoredCountText = await countLocator.textContent();
        const restoredCount = parseInt(restoredCountText?.match(/(\d+)/)?.[1] || "0", 10);

        if (!chipsAfterClear && restoredCount === initialCount) {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "same",
            detail: `Clear all removed all chips and restored count to ${initialCount}`,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Chips cleared, count restored: ${restoredCount}`,
          };
        } else {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "different",
            detail: `After Clear all: chips still visible: ${chipsAfterClear}, count: ${restoredCount} (expected ${initialCount})`,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Chips visible: ${chipsAfterClear}, count: ${restoredCount}`,
          };
        }
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 4. gallery-thumbnail-position (PDP) — KEPT AS-IS
  // ────────────────────────────────────────────────
  test("gallery-thumbnail-position: thumbnails are below main image, not beside it @parity", async ({
    page,
  }) => {
    const rule = ruleById("gallery-thumbnail-position");

    await navigateToFirstProduct(page);

    const positions = await page.evaluate(() => {
      const images = document.querySelectorAll(
        "img[src*='/images/products/']"
      );
      if (images.length < 2) return null;
      const main = images[0].getBoundingClientRect();
      const thumb = images[1].getBoundingClientRect();
      return {
        mainBottom: main.bottom,
        thumbTop: thumb.top,
        mainRight: main.right,
        thumbLeft: thumb.left,
        mainWidth: main.width,
        thumbWidth: thumb.width,
      };
    });

    let verdict: BehaviourVerdict;

    if (!positions) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: "Could not find main image and thumbnail images",
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Gallery images not found",
      };
    } else {
      const TOLERANCE_PX = 20;
      const isBelow =
        positions.thumbTop >= positions.mainBottom - TOLERANCE_PX;

      if (isBelow) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: "Thumbnails render below the main image",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Thumbnail top (${positions.thumbTop}) is below main bottom (${positions.mainBottom})`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail:
            `Thumbnails appear beside main image instead of below. ` +
            `thumb.top=${positions.thumbTop}, main.bottom=${positions.mainBottom}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual:
            `Thumbnail positioned beside main image ` +
            `(top: ${positions.thumbTop}, main bottom: ${positions.mainBottom})`,
        };
      }
    }

    pushVerdict(verdict, test.info());
    expect(verdict.status, verdict.detail).not.toBe("missing");
    if (verdict.status === "different") {
      console.warn(
        `PARITY MISMATCH [${rule.severity}]: ${verdict.detail}`
      );
    }
  });

  // ────────────────────────────────────────────────
  // 5. gallery-thumbnail-click (PDP)
  // ────────────────────────────────────────────────
  test("gallery-thumbnail-click: clicking a thumbnail changes the main image @parity", async ({
    page,
  }) => {
    const rule = ruleById("gallery-thumbnail-click");
    let verdict: BehaviourVerdict;

    try {
      await navigateToFirstProduct(page);
      await waitForHydration(page);

      // Get all product gallery images
      const productImages = page.locator("img[src*='/images/products/']");
      const imageCount = await productImages.count();

      if (imageCount < 2) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "missing",
          detail: `Need at least 2 product images for thumbnail click test, found ${imageCount}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Only ${imageCount} product image(s) found`,
        };
      } else {
        // Get the initial main image src
        const initialMainSrc = await productImages.nth(0).getAttribute("src");

        // Click the second thumbnail image
        await productImages.nth(1).click();
        await page.waitForTimeout(500);

        // Check if main image src changed
        const newMainSrc = await productImages.nth(0).getAttribute("src");

        if (newMainSrc && initialMainSrc && newMainSrc !== initialMainSrc) {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "same",
            detail: "Clicking thumbnail changed the main image src",
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Main image changed from ${initialMainSrc} to ${newMainSrc}`,
          };
        } else {
          // Alternative: check if the page uses a different mechanism
          // (e.g. the clicked thumbnail becomes visually highlighted)
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "different",
            detail: `Main image src did not change after thumbnail click. Before: ${initialMainSrc}, After: ${newMainSrc}`,
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `Main image src unchanged after click`,
          };
        }
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 6. size-selector-navigation (PDP)
  // ────────────────────────────────────────────────
  test("size-selector-navigation: clicking a size variant link navigates to a new URL @parity", async ({
    page,
  }) => {
    const rule = ruleById("size-selector-navigation");
    let verdict: BehaviourVerdict;

    try {
      await navigateToFirstProduct(page);
      await waitForHydration(page);

      const initialUrl = page.url();

      // Size variant links are <a> elements inside the size selector
      // They link to /products/{slug} for different sizes
      const sizeLinks = page.locator("a[href*='/products/']").filter({
        has: page.locator("svg"), // size circles contain a TV icon SVG
      });
      const sizeLinkCount = await sizeLinks.count();

      if (sizeLinkCount === 0) {
        // This product may not have size variants — try navigating to
        // a product that does by looking for one with size selectors
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "missing",
          detail: "No size variant links found on this PDP (product may not have size variants)",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "No size variant links available",
        };
      } else {
        // Click first available (non-selected) size variant link
        await sizeLinks.first().click();
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveURL(/\/products\//);

        const newUrl = page.url();

        if (newUrl !== initialUrl) {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "same",
            detail: "Clicking size variant navigated to a different product URL",
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `URL changed from ${initialUrl} to ${newUrl}`,
          };
        } else {
          verdict = {
            ruleId: rule.id,
            interaction: rule.interaction,
            template: rule.template,
            status: "different",
            detail: "Size variant click did not change URL (expected navigation to different product)",
            severity: rule.severity,
            currysExpected: rule.currysObserved,
            electrizActual: `URL unchanged: ${newUrl}`,
          };
        }
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 7. sort-default (PLP)
  // ────────────────────────────────────────────────
  test("sort-default: default sort is 'Most popular' @parity", async ({
    page,
  }) => {
    const rule = ruleById("sort-default");
    let verdict: BehaviourVerdict;

    try {
      await page.goto(PLP_URL);
      await page.waitForLoadState("networkidle");

      const sortSelect = page.locator("[data-testid='sort-select']");
      await sortSelect.waitFor({ timeout: 15000 });

      // Get the selected option text
      const selectedValue = await sortSelect.inputValue();
      const selectedText = await sortSelect.locator("option:checked").textContent();

      const isPopular =
        selectedValue === "popular" ||
        (selectedText || "").toLowerCase().includes("most popular");

      if (isPopular) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: `Default sort is "Most popular" (value="${selectedValue}")`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Sort default: ${selectedText} (value: ${selectedValue})`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: `Default sort is "${selectedText}" (value="${selectedValue}"), expected "Most popular"`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Sort default: ${selectedText}`,
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 8. atb-toast (PDP)
  // ────────────────────────────────────────────────
  test("atb-toast: add to basket shows toast with 'Added to basket' and 'View basket' link @parity", async ({
    page,
  }) => {
    const rule = ruleById("atb-toast");
    let verdict: BehaviourVerdict;

    try {
      await navigateToFirstProduct(page);
      await waitForHydration(page);

      // Click add to basket
      const atbBtn = page.locator("[data-testid='add-to-basket']");
      await atbBtn.waitFor({ timeout: 5000 });
      await atbBtn.click();

      // Wait for toast to appear (fixed top-right overlay)
      const toastText = page.locator("text=Added to basket");
      await toastText.waitFor({ state: "visible", timeout: 5000 });

      const viewBasketLink = page.locator("a:has-text('View basket')");
      const hasViewBasket = await viewBasketLink.isVisible().catch(() => false);

      if (hasViewBasket) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: "Toast appeared with 'Added to basket' text and 'View basket' link",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "Toast visible with expected text and link",
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: "Toast appeared with 'Added to basket' but 'View basket' link not found",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: "Toast visible but missing 'View basket' link",
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 9. atb-header-count (PDP)
  // ────────────────────────────────────────────────
  test("atb-header-count: header basket count increments after add to basket @parity", async ({
    page,
  }) => {
    const rule = ruleById("atb-header-count");
    let verdict: BehaviourVerdict;

    try {
      await navigateToFirstProduct(page);
      await waitForHydration(page);

      // Check if basket count badge exists before adding
      const countBadge = page.locator("[data-testid='basket-count']");
      const countBefore = await countBadge.isVisible().catch(() => false)
        ? parseInt((await countBadge.textContent()) || "0", 10)
        : 0;

      // Click add to basket
      const atbBtn = page.locator("[data-testid='add-to-basket']");
      await atbBtn.waitFor({ timeout: 5000 });
      await atbBtn.click();

      // Wait for basket count badge to appear/update
      await countBadge.waitFor({ state: "visible", timeout: 5000 });
      const countAfter = parseInt((await countBadge.textContent()) || "0", 10);

      if (countAfter > countBefore) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: `Header basket count incremented from ${countBefore} to ${countAfter}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Basket count: ${countBefore} -> ${countAfter}`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: `Header basket count did not increment: ${countBefore} -> ${countAfter}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Basket count unchanged: ${countAfter}`,
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 10. mobile-menu-drawer (homepage mobile)
  // ────────────────────────────────────────────────
  test("mobile-menu-drawer: hamburger opens drawer, X closes it @parity", async ({
    page,
  }) => {
    const rule = ruleById("mobile-menu-drawer");
    let verdict: BehaviourVerdict;

    try {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find hamburger button (contains "Menu" text, has aria-controls="mobile-nav")
      const hamburger = page.locator("button[aria-controls='mobile-nav']");
      await hamburger.waitFor({ timeout: 15000 });

      // Click hamburger to open drawer
      await hamburger.click();

      // Wait for drawer to appear
      const drawer = page.locator("#mobile-nav");
      await drawer.waitFor({ state: "visible", timeout: 5000 });

      const drawerVisible = await drawer.isVisible();

      // Verify drawer has navigation links
      const navLinks = drawer.locator("nav a");
      const linkCount = await navLinks.count();

      // Click close button (X)
      const closeBtn = page.locator("button[aria-label='Close menu']");
      await closeBtn.click();
      await page.waitForTimeout(300);

      // Verify drawer is closed
      const drawerAfterClose = await drawer.isVisible().catch(() => false);

      if (drawerVisible && linkCount > 0 && !drawerAfterClose) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: `Hamburger opened drawer with ${linkCount} nav links, X button closed it`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Drawer opens with ${linkCount} links, closes on X`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: `Drawer open: ${drawerVisible}, links: ${linkCount}, closed after X: ${!drawerAfterClose}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Drawer behaviour incomplete`,
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 11. checkout-layout (checkout) — P0
  // ────────────────────────────────────────────────
  test("checkout-layout: no MainNav or Footer visible on checkout @parity", async ({
    page,
  }) => {
    const rule = ruleById("checkout-layout");
    let verdict: BehaviourVerdict;

    try {
      // Add a product to basket first
      await addProductToBasket(page);

      // Navigate to checkout
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      // MainNav is identified by aria-label="Main categories" and is a <nav> inside a
      // div that is hidden on checkout via LayoutWrapper
      const mainNav = page.locator("nav[aria-label='Main categories']");
      const mainNavVisible = await mainNav.isVisible().catch(() => false);

      // Footer is a <footer> element
      const footer = page.locator("footer");
      const footerVisible = await footer.isVisible().catch(() => false);

      // Verify simplified header exists (checkout header with logo)
      const checkoutHeader = page.locator("header");
      const headerExists = await checkoutHeader.isVisible().catch(() => false);

      if (!mainNavVisible && !footerVisible) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: "Checkout uses simplified layout: no MainNav, no Footer",
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `MainNav: ${mainNavVisible}, Footer: ${footerVisible}, Header: ${headerExists}`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: `Checkout layout has MainNav: ${mainNavVisible}, Footer: ${footerVisible} (both should be hidden)`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `MainNav visible: ${mainNavVisible}, Footer visible: ${footerVisible}`,
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // 12. checkout-steps (checkout)
  // ────────────────────────────────────────────────
  test("checkout-steps: completed step collapses with green checkmark and Edit button @parity", async ({
    page,
  }) => {
    const rule = ruleById("checkout-steps");
    let verdict: BehaviourVerdict;

    try {
      // Add a product to basket first
      await addProductToBasket(page);

      // Navigate to checkout
      await page.goto("/checkout");
      await page.waitForLoadState("networkidle");

      // Click "Checkout as guest" to move past welcome step
      const guestBtn = page.locator("button:has-text('guest'), button:has-text('Guest')");
      await guestBtn.first().waitFor({ timeout: 5000 });
      await guestBtn.first().click();
      await page.waitForTimeout(500);

      // Fill in delivery form to complete the delivery step
      // Required fields: title, firstName, lastName, phone, postcode, address1, city
      await page.locator("select").first().selectOption({ index: 1 }); // title dropdown
      await page.fill("input[name='firstName'], input[placeholder*='First']", "Test");
      await page.fill("input[name='lastName'], input[placeholder*='Last']", "User");
      await page.fill("input[name='phone'], input[placeholder*='phone'], input[placeholder*='Phone']", "07123456789");
      await page.fill("input[name='postcode'], input[placeholder*='postcode'], input[placeholder*='Postcode']", "SW1A 1AA");
      await page.fill("input[name='address1'], input[placeholder*='Address line 1'], input[placeholder*='address']", "10 Downing Street");
      await page.fill("input[name='city'], input[placeholder*='city'], input[placeholder*='City']", "London");

      // Submit the delivery step
      const continueBtn = page.locator("button:has-text('Continue'), button[type='submit']").last();
      await continueBtn.click();
      await page.waitForTimeout(1000);

      // After delivery step is completed, look for:
      // 1. Green checkmark circle (bg-green-600 with checkmark SVG)
      const greenCheck = page.locator("div.bg-green-600").first();
      const hasGreenCheck = await greenCheck.isVisible().catch(() => false);

      // 2. Edit button for the completed step
      const editBtn = page.locator("button:has-text('Edit'), a:has-text('Edit')");
      const hasEdit = await editBtn.first().isVisible().catch(() => false);

      // 3. Collapsed summary (delivery address summary card)
      const summaryCard = page.locator("text=Delivering to");
      const hasSummary = await summaryCard.isVisible().catch(() => false);

      if (hasGreenCheck && hasEdit) {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "same",
          detail: `Completed delivery step shows green checkmark and Edit button. Summary visible: ${hasSummary}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Green check: ${hasGreenCheck}, Edit: ${hasEdit}, Summary: ${hasSummary}`,
        };
      } else {
        verdict = {
          ruleId: rule.id,
          interaction: rule.interaction,
          template: rule.template,
          status: "different",
          detail: `Green checkmark: ${hasGreenCheck}, Edit button: ${hasEdit}, Summary: ${hasSummary}`,
          severity: rule.severity,
          currysExpected: rule.currysObserved,
          electrizActual: `Incomplete step completion UI`,
        };
      }
    } catch (err) {
      verdict = {
        ruleId: rule.id,
        interaction: rule.interaction,
        template: rule.template,
        status: "missing",
        detail: `Error: ${(err as Error).message}`,
        severity: rule.severity,
        currysExpected: rule.currysObserved,
        electrizActual: "Test error",
      };
    }

    pushVerdict(verdict!, test.info());
    expect(verdict!.status, verdict!.detail).not.toBe("missing");
    if (verdict!.status === "different") {
      console.warn(`PARITY MISMATCH [${rule.severity}]: ${verdict!.detail}`);
    }
  });

  // ────────────────────────────────────────────────
  // afterAll: write all verdicts to JSON report
  // ────────────────────────────────────────────────
  test.afterAll(async () => {
    const { writeFileSync, mkdirSync } = await import("fs");
    const pathMod = await import("path");
    const outDir = pathMod.resolve("artifacts/parity/reports");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      pathMod.join(outDir, "behavioural-verdicts.json"),
      JSON.stringify(verdicts, null, 2)
    );
  });
});
