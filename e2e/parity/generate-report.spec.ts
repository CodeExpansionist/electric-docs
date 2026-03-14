import { test } from "@playwright/test";
import path from "path";
import { generateParityReport } from "../../tests/parity/utils/report-generator";

test.describe.configure({ mode: "serial" });

test.describe("@parity Generate parity report", () => {
  test("generate combined parity scorecard and markdown report", async () => {
    const projectRoot = path.resolve(__dirname, "../..");
    const scorecard = await generateParityReport(projectRoot);

    // Attach scorecard summary to test annotations for CI visibility
    test.info().annotations.push({
      type: "parity-report",
      description: JSON.stringify({
        verdict: scorecard.verdict,
        totalChecks: scorecard.summary.totalChecks,
        passed: scorecard.summary.passed,
        failed: scorecard.summary.failed,
        p0: scorecard.summary.p0Count,
        p1: scorecard.summary.p1Count,
        p2: scorecard.summary.p2Count,
        p3: scorecard.summary.p3Count,
        blockers: scorecard.summary.blockers,
      }),
    });

    console.log(
      `\nParity Report Generated — Verdict: ${scorecard.verdict}\n` +
        `  Total: ${scorecard.summary.totalChecks} | ` +
        `Passed: ${scorecard.summary.passed} | ` +
        `Failed: ${scorecard.summary.failed}\n` +
        `  P0: ${scorecard.summary.p0Count} | ` +
        `P1: ${scorecard.summary.p1Count} | ` +
        `P2: ${scorecard.summary.p2Count} | ` +
        `P3: ${scorecard.summary.p3Count}\n` +
        `  Output: artifacts/parity/reports/parity-scorecard.json\n` +
        `  Report: artifacts/parity/reports/parity-report.md`
    );
  });
});
