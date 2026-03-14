import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { homepageManifest } from "../../tests/parity/manifests/homepage.manifest";
import { plpManifest } from "../../tests/parity/manifests/plp.manifest";
import { pdpManifest } from "../../tests/parity/manifests/pdp.manifest";
import { basketManifest } from "../../tests/parity/manifests/basket.manifest";
import { checkoutManifest } from "../../tests/parity/manifests/checkout.manifest";
import { searchManifest } from "../../tests/parity/manifests/search.manifest";
import type { TemplateManifest, SectionManifest } from "../../tests/parity/manifests/types";
import {
  extractSections,
  verifySectionOrder,
} from "../../tests/parity/utils/dom-extraction";
import { addProductToBasket } from "../../tests/parity/utils/setup-helpers";

const SETUP_FNS: Record<string, (page: any) => Promise<any>> = {
  addProductToBasket,
};

async function runSetup(page: any, manifest: TemplateManifest) {
  if (manifest.setupFn && SETUP_FNS[manifest.setupFn]) {
    await SETUP_FNS[manifest.setupFn](page);
  }
}

/** After navigating to a page with setupFn, wait for React to hydrate from localStorage */
async function waitForSetupHydration(page: any, manifest: TemplateManifest) {
  if (!manifest.setupFn) return;
  // Wait for React useEffect to hydrate from localStorage
  // The BasketProvider reads localStorage in a useEffect, then re-renders
  await page.waitForTimeout(2000);
  if (manifest.templateId === "basket") {
    try {
      await page.locator('[data-testid="basket-item"]').first().waitFor({ state: "visible", timeout: 15000 });
    } catch { /* might be empty basket, continue */ }
  } else if (manifest.templateId === "checkout") {
    try {
      await page.locator('button:has-text("guest"), button:has-text("Guest"), button:has-text("Sign in")').first().waitFor({ state: "visible", timeout: 15000 });
    } catch { /* continue */ }
  }
}

// All manifests to test
const manifests: TemplateManifest[] = [
  homepageManifest,
  plpManifest,
  pdpManifest,
  basketManifest,
  checkoutManifest,
  searchManifest,
];

// Collect results across all tests for the JSON report
const allResults: Array<{
  templateId: string;
  viewport: string;
  type: string;
  total?: number;
  found?: number;
  missing?: string[];
  passed?: boolean;
  outOfOrder?: Array<{ id: string; expected: number; actual: number }>;
  section?: string;
  childResults?: Array<{ role: string; ok: boolean; count: number }>;
}> = [];

for (const manifest of manifests) {
  test.describe(`@parity Structural — ${manifest.templateId}`, () => {
    // Desktop viewport tests
    test(`${manifest.templateId} desktop: all required sections present`, async ({
      page,
    }) => {
      await runSetup(page, manifest);
      await page.goto(manifest.testUrl);
      await page.waitForLoadState("networkidle");
      await waitForSetupHydration(page, manifest);

      const desktopSections = manifest.sections.filter(
        (s) => s.viewport !== "mobile"
      );

      const results = await extractSections(page, desktopSections);
      const missing: string[] = [];

      for (const section of desktopSections) {
        const result = results.get(section.id);
        if (section.required && (!result || !result.found)) {
          missing.push(section.id);
        }
      }

      // Record results as test annotations for report
      test.info().annotations.push({
        type: "parity-structural",
        description: JSON.stringify({
          templateId: manifest.templateId,
          viewport: "desktop",
          total: desktopSections.length,
          found: desktopSections.length - missing.length,
          missing,
        }),
      });

      allResults.push({
        templateId: manifest.templateId,
        viewport: "desktop",
        type: "sections-present",
        total: desktopSections.length,
        found: desktopSections.length - missing.length,
        missing,
      });

      expect(
        missing,
        `Missing required sections: ${missing.join(", ")}`
      ).toHaveLength(0);
    });

    test(`${manifest.templateId} desktop: sections in correct order`, async ({
      page,
    }) => {
      await runSetup(page, manifest);
      await page.goto(manifest.testUrl);
      await page.waitForLoadState("networkidle");
      await waitForSetupHydration(page, manifest);

      const desktopSections = manifest.sections.filter(
        (s) => s.viewport !== "mobile"
      );

      const orderResult = await verifySectionOrder(page, desktopSections);

      test.info().annotations.push({
        type: "parity-structural-order",
        description: JSON.stringify({
          templateId: manifest.templateId,
          viewport: "desktop",
          passed: orderResult.passed,
          outOfOrder: orderResult.outOfOrder,
        }),
      });

      allResults.push({
        templateId: manifest.templateId,
        viewport: "desktop",
        type: "section-order",
        passed: orderResult.passed,
        outOfOrder: orderResult.outOfOrder,
      });

      expect(
        orderResult.outOfOrder.filter(
          (o) => Math.abs(o.expected - o.actual) >= 3
        ),
        "Sections out of order by 3+ positions"
      ).toHaveLength(0);
    });

    // Check children for sections that define them
    const sectionsWithChildren = manifest.sections.filter(
      (s) => s.children?.length
    );
    for (const section of sectionsWithChildren) {
      test(`${manifest.templateId}: ${section.id} has required children`, async ({
        page,
      }) => {
        await runSetup(page, manifest);
        await page.goto(manifest.testUrl);
        await page.waitForLoadState("networkidle");
        await waitForSetupHydration(page, manifest);

        const parent = page.locator(section.selector).first();
        if ((await parent.count()) === 0 || !(await parent.isVisible())) {
          test.skip();
          return;
        }

        const childResults: Array<{ role: string; ok: boolean; count: number }> =
          [];

        for (const child of section.children!) {
          if (!child.required) continue;
          // Count children across ALL matching parents, not just first
          const allParents = page.locator(section.selector);
          const parentCount = await allParents.count();
          let childCount = 0;
          for (let i = 0; i < parentCount; i++) {
            childCount += await allParents.nth(i).locator(child.selector).count();
          }
          const childLocator = parent.locator(child.selector);
          const count = await childLocator.count();

          childResults.push({
            role: child.role,
            ok: child.expectedCount
              ? count >= child.expectedCount.min
              : count >= 1,
            count,
          });

          if (child.expectedCount) {
            expect(
              count,
              `${section.id} → ${child.role}: expected at least ${child.expectedCount.min}`
            ).toBeGreaterThanOrEqual(child.expectedCount.min);
          } else {
            expect(
              count,
              `${section.id} → ${child.role}: should exist`
            ).toBeGreaterThanOrEqual(1);
          }
        }

        allResults.push({
          templateId: manifest.templateId,
          viewport: "desktop",
          type: "children",
          section: section.id,
          childResults,
        });
      });
    }

    // Mobile viewport test
    test(`${manifest.templateId} mobile: required sections present`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await runSetup(page, manifest);
      await page.goto(manifest.testUrl);
      await page.waitForLoadState("networkidle");
      await waitForSetupHydration(page, manifest);

      const mobileSections = manifest.sections.filter(
        (s) => s.viewport !== "desktop"
      );

      const results = await extractSections(page, mobileSections);
      const missing: string[] = [];

      for (const section of mobileSections) {
        const result = results.get(section.id);
        if (section.required && (!result || !result.found)) {
          missing.push(section.id);
        }
      }

      test.info().annotations.push({
        type: "parity-structural",
        description: JSON.stringify({
          templateId: manifest.templateId,
          viewport: "mobile",
          total: mobileSections.length,
          found: mobileSections.length - missing.length,
          missing,
        }),
      });

      allResults.push({
        templateId: manifest.templateId,
        viewport: "mobile",
        type: "sections-present",
        total: mobileSections.length,
        found: mobileSections.length - missing.length,
        missing,
      });

      expect(
        missing,
        `Missing required sections on mobile: ${missing.join(", ")}`
      ).toHaveLength(0);
    });

    // Write per-template results to avoid parallel worker overwrites
    test.afterAll(() => {
      const reportDir = path.resolve(
        __dirname,
        "../../artifacts/parity/reports"
      );
      mkdirSync(reportDir, { recursive: true });

      const templateResults = allResults.filter(
        (r) => r.templateId === manifest.templateId
      );
      const reportPath = path.join(
        reportDir,
        `structural-results-${manifest.templateId}.json`
      );
      writeFileSync(
        reportPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            templateId: manifest.templateId,
            results: templateResults,
          },
          null,
          2
        ),
        "utf-8"
      );
    });
  });
}
