import { Page } from "@playwright/test";

/**
 * For each selector, check if the element exists, is visible, and get its top position.
 */
export async function extractSections(
  page: Page,
  sections: Array<{
    id: string;
    selector: string;
    fallbackSelectors?: string[];
  }>
): Promise<Map<string, { found: boolean; top: number; visible: boolean }>> {
  const results = new Map<
    string,
    { found: boolean; top: number; visible: boolean }
  >();

  for (const section of sections) {
    let locator = page.locator(section.selector);
    let count = await locator.count();

    if (count === 0 && section.fallbackSelectors) {
      for (const fallback of section.fallbackSelectors) {
        locator = page.locator(fallback);
        count = await locator.count();
        if (count > 0) break;
      }
    }

    if (count === 0) {
      results.set(section.id, { found: false, top: -1, visible: false });
      continue;
    }

    const visible = await locator.first().isVisible();
    const handle = await locator.first().elementHandle();

    let top = -1;
    if (handle) {
      top = await page.evaluate(
        (el) => el.getBoundingClientRect().top,
        handle
      );
      await handle.dispose();
    }

    results.set(section.id, { found: true, top, visible });
  }

  return results;
}

/**
 * Verify sections appear in the expected logical order.
 * Groups sections into order bands (tolerance of 50px for elements at similar positions).
 * Returns which sections are out of order.
 */
export async function verifySectionOrder(
  page: Page,
  sections: Array<{
    id: string;
    selector: string;
    order: number;
    fallbackSelectors?: string[];
  }>
): Promise<{
  passed: boolean;
  outOfOrder: Array<{ id: string; expected: number; actual: number }>;
}> {
  const positions = await extractSections(page, sections);

  const foundSections: Array<{ id: string; expectedOrder: number; top: number }> = [];

  for (const section of sections) {
    const data = positions.get(section.id);
    if (data && data.found) {
      foundSections.push({
        id: section.id,
        expectedOrder: section.order,
        top: data.top,
      });
    }
  }

  // Sort by y-position to determine actual visual order
  const sorted = [...foundSections].sort((a, b) => a.top - b.top);

  // Assign actual order using bands — elements within 50px share the same band
  const BAND_TOLERANCE = 50;
  let currentBand = 1;
  let bandTop = sorted.length > 0 ? sorted[0].top : 0;

  const actualOrders = new Map<string, number>();

  for (const item of sorted) {
    if (item.top - bandTop > BAND_TOLERANCE) {
      currentBand++;
      bandTop = item.top;
    }
    actualOrders.set(item.id, currentBand);
  }

  // Compare expected vs actual — flag anything off by 2+ positions
  const outOfOrder: Array<{ id: string; expected: number; actual: number }> = [];

  for (const item of foundSections) {
    const actual = actualOrders.get(item.id)!;
    if (Math.abs(actual - item.expectedOrder) >= 2) {
      outOfOrder.push({
        id: item.id,
        expected: item.expectedOrder,
        actual,
      });
    }
  }

  return {
    passed: outOfOrder.length === 0,
    outOfOrder,
  };
}

/**
 * Count child elements matching a selector within a parent.
 */
export async function countChildren(
  page: Page,
  parentSelector: string,
  childSelector: string
): Promise<number> {
  return page.locator(parentSelector).locator(childSelector).count();
}
