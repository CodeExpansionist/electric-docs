import { test, expect } from "@playwright/test";
import {
  writeFileSync,
  existsSync,
  readFileSync,
  mkdirSync,
} from "fs";
import path from "path";
import { REGIONS, VisualRegion } from "../../tests/parity/utils/regions";
import { addProductToBasket } from "../../tests/parity/utils/setup-helpers";

// ---------------------------------------------------------------------------
// Setup function registry — maps setupFn string names to implementations
// ---------------------------------------------------------------------------

const SETUP_FNS: Record<
  string,
  (page: import("@playwright/test").Page) => Promise<void>
> = {
  addProductToBasket: async (page) => {
    await addProductToBasket(page);
  },
};

// ---------------------------------------------------------------------------
// Resolve element — tries primary selector, then fallbackSelector
// ---------------------------------------------------------------------------

async function resolveElement(
  page: import("@playwright/test").Page,
  region: VisualRegion
) {
  const primary = page.locator(region.selector).first();
  try {
    await primary.waitFor({ state: "visible", timeout: 5_000 });
    return primary;
  } catch {
    if (region.fallbackSelector) {
      const fallback = page.locator(region.fallbackSelector).first();
      await fallback.waitFor({ state: "visible", timeout: 10_000 });
      return fallback;
    }
    // No fallback — re-wait with the full timeout so the error message is clear
    await primary.waitFor({ state: "visible", timeout: 15_000 });
    return primary;
  }
}

// ---------------------------------------------------------------------------
// Comparison helper — uses pixelmatch + pngjs if available, otherwise falls
// back to a basic buffer comparison that still catches dimension mismatches
// and large-scale content differences.
// ---------------------------------------------------------------------------

interface CompareResult {
  mismatchPercent: number;
  dimensionMismatch: boolean;
  electrizSize: { width: number; height: number };
  currysSize: { width: number; height: number };
  diffBuffer: Buffer | null;
}

async function compareImages(
  electrizBuf: Buffer,
  currysBuf: Buffer
): Promise<CompareResult> {
  try {
    // Attempt pixelmatch + pngjs (transitive Playwright dep or user-installed)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PNG } = require("pngjs") as { PNG: any };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pixelmatch = require("pixelmatch") as any;

    const electrizPng = PNG.sync.read(electrizBuf);
    const currysPng = PNG.sync.read(currysBuf);

    const electrizSize = {
      width: electrizPng.width,
      height: electrizPng.height,
    };
    const currysSize = { width: currysPng.width, height: currysPng.height };

    if (
      electrizPng.width !== currysPng.width ||
      electrizPng.height !== currysPng.height
    ) {
      return {
        mismatchPercent: 1,
        dimensionMismatch: true,
        electrizSize,
        currysSize,
        diffBuffer: null,
      };
    }

    const { width, height } = electrizPng;
    const diff = new PNG({ width, height });
    const mismatchedPixels = pixelmatch(
      electrizPng.data,
      currysPng.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const mismatchPercent =
      totalPixels > 0 ? mismatchedPixels / totalPixels : 0;

    return {
      mismatchPercent,
      dimensionMismatch: false,
      electrizSize,
      currysSize,
      diffBuffer: PNG.sync.write(diff),
    };
  } catch {
    // Fallback: basic dimension + raw buffer comparison
    return compareBasic(electrizBuf, currysBuf);
  }
}

function compareBasic(electrizBuf: Buffer, currysBuf: Buffer): CompareResult {
  // PNG header stores dimensions at fixed offsets (IHDR chunk):
  //   width  = bytes 16-19 (big-endian uint32)
  //   height = bytes 20-23 (big-endian uint32)
  const readPngDimensions = (
    buf: Buffer
  ): { width: number; height: number } => {
    if (buf.length < 24) return { width: 0, height: 0 };
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  };

  const electrizSize = readPngDimensions(electrizBuf);
  const currysSize = readPngDimensions(currysBuf);

  if (
    electrizSize.width !== currysSize.width ||
    electrizSize.height !== currysSize.height
  ) {
    return {
      mismatchPercent: 1,
      dimensionMismatch: true,
      electrizSize,
      currysSize,
      diffBuffer: null,
    };
  }

  // Same dimensions — compare raw compressed data byte-by-byte
  const len = Math.min(electrizBuf.length, currysBuf.length);
  let diffBytes = 0;
  for (let i = 0; i < len; i++) {
    if (electrizBuf[i] !== currysBuf[i]) diffBytes++;
  }
  // Also count any extra bytes in the longer buffer
  diffBytes += Math.abs(electrizBuf.length - currysBuf.length);

  const maxLen = Math.max(electrizBuf.length, currysBuf.length);
  const mismatchPercent = maxLen > 0 ? diffBytes / maxLen : 0;

  return {
    mismatchPercent,
    dimensionMismatch: false,
    electrizSize,
    currysSize,
    diffBuffer: null,
  };
}

// ---------------------------------------------------------------------------
// Shared pre-capture steps: setup, navigation, viewport, wait, scroll
// ---------------------------------------------------------------------------

async function prepareRegion(
  page: import("@playwright/test").Page,
  region: VisualRegion,
  viewport: { width: number; height: number }
) {
  // 1. Set viewport
  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  // 2. Run setupFn BEFORE navigating to the region page (e.g. basket needs a
  //    product added first, which navigates through PLP → PDP)
  if (region.setupFn && SETUP_FNS[region.setupFn]) {
    await SETUP_FNS[region.setupFn](page);
  }

  // 3. Navigate to the region page
  await page.goto(region.page);
  await page.waitForLoadState("networkidle");

  // 3b. Extra hydration wait for pages that need setup (basket reads localStorage in useEffect)
  if (region.setupFn) {
    await page.waitForTimeout(2000);
  }

  // 4. Wait for a specific selector if specified
  if (region.waitForSelector) {
    await page
      .locator(region.waitForSelector)
      .first()
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  // 5. Resolve element (primary → fallback)
  const element = await resolveElement(page, region);

  // 6. Scroll into view if needed
  if (region.scrollIntoView) {
    await element.scrollIntoViewIfNeeded();
    // Small pause for any lazy-loaded content to render after scroll
    await page.waitForTimeout(300);
  }

  return element;
}

// ---------------------------------------------------------------------------
// Block 1: Currys visual parity comparison
// ---------------------------------------------------------------------------

test.describe("@parity Visual parity — Currys comparison", () => {
  for (const region of REGIONS) {
    for (const viewport of region.viewports) {
      test(`${region.name} — ${viewport.label}`, async ({ page }) => {
        // Prepare page and resolve element
        const element = await prepareRegion(page, region, viewport);

        // Capture element screenshot with animations disabled
        const screenshotBuffer = await element.screenshot({
          animations: "disabled",
        });

        // Save Electriz screenshot
        const electrizDir = path.resolve(
          "artifacts/parity/screenshots/electriz"
        );
        mkdirSync(electrizDir, { recursive: true });
        const electrizPath = path.join(
          electrizDir,
          `${region.id}-${viewport.label}.png`
        );
        writeFileSync(electrizPath, screenshotBuffer);

        // Check if Currys baseline exists
        const currysBaseline = path.resolve(
          `tests/parity/baselines/currys/${region.id}-${viewport.label}.png`
        );

        if (!existsSync(currysBaseline)) {
          // No baseline — capture only, test passes with note
          test.info().annotations.push({
            type: "parity-visual",
            description: JSON.stringify({
              regionId: region.id,
              viewport: viewport.label,
              mismatchPercent: null,
              threshold: region.tolerance,
              passed: true,
              dimensionMismatch: false,
              electrizSize: null,
              currysSize: null,
              diffPath: null,
              note: "No Currys baseline available — Electriz screenshot captured only",
            }),
          });
          return;
        }

        // Compare with baseline
        const currysBuffer = readFileSync(currysBaseline);
        const result = await compareImages(screenshotBuffer, currysBuffer);

        // Save diff image (if available)
        let diffPath: string | null = null;
        if (result.diffBuffer) {
          const diffDir = path.resolve("artifacts/parity/diffs");
          mkdirSync(diffDir, { recursive: true });
          diffPath = path.join(
            diffDir,
            `${region.id}-${viewport.label}-diff.png`
          );
          writeFileSync(diffPath, result.diffBuffer);
        }

        const passed = result.mismatchPercent <= region.tolerance;

        // Record annotation
        test.info().annotations.push({
          type: "parity-visual",
          description: JSON.stringify({
            regionId: region.id,
            viewport: viewport.label,
            mismatchPercent: result.mismatchPercent,
            threshold: region.tolerance,
            passed,
            dimensionMismatch: result.dimensionMismatch,
            electrizSize: result.electrizSize,
            currysSize: result.currysSize,
            diffPath,
          }),
        });

        // Assert mismatch within tolerance
        expect(
          result.mismatchPercent,
          `Visual mismatch for ${region.name} (${viewport.label}): ` +
            `${(result.mismatchPercent * 100).toFixed(2)}% exceeds ` +
            `${(region.tolerance * 100).toFixed(2)}% threshold` +
            (result.dimensionMismatch
              ? ` — dimension mismatch: Electriz ${result.electrizSize.width}x${result.electrizSize.height}` +
                ` vs Currys ${result.currysSize.width}x${result.currysSize.height}`
              : "")
        ).toBeLessThanOrEqual(region.tolerance);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Block 2: Electriz self-check (regression guard)
// ---------------------------------------------------------------------------

test.describe("@regression-visual Electriz self-check", () => {
  for (const region of REGIONS) {
    for (const viewport of region.viewports) {
      test(`${region.name} — ${viewport.label} (self-check)`, async ({
        page,
      }) => {
        // Prepare page and resolve element
        const element = await prepareRegion(page, region, viewport);

        await expect(element).toHaveScreenshot(
          `${region.id}-${viewport.label}.png`,
          { maxDiffPixelRatio: 0.01, animations: "disabled" }
        );
      });
    }
  }
});
