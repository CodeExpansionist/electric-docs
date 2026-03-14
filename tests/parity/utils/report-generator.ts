import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParityScorecard {
  timestamp: string;
  templates: TemplateScore[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    p0Count: number;
    p1Count: number;
    p2Count: number;
    p3Count: number;
    blockers: string[];
  };
  verdict: "PASS" | "REVIEW" | "FAIL";
}

export interface TemplateScore {
  templateId: string;
  structural: {
    sectionsExpected: number;
    sectionsFound: number;
    missingRequired: string[];
    outOfOrder: string[];
  };
  behavioural: {
    verdicts: Array<{
      ruleId: string;
      status: "same" | "different" | "missing";
      severity: string;
      detail: string;
    }>;
    sameCount: number;
    differentCount: number;
    missingCount: number;
  };
  visual: {
    regions: Array<{
      regionId: string;
      mismatchPercent: number;
      threshold: number;
      passed: boolean;
      dimensionMismatch: boolean;
      electrizScreenshot: string;
      currysBaseline: string;
      diffImage: string;
    }>;
  };
  verdict: "PASS" | "REVIEW" | "FAIL";
  blockers: string[];
}

// ─── Raw input shapes (from the spec JSON files) ────────────────────────────

interface StructuralResult {
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
}

interface StructuralReport {
  generatedAt: string;
  manifests: string[];
  results: StructuralResult[];
}

interface BehaviouralVerdict {
  ruleId: string;
  interaction: string;
  template: string;
  status: "same" | "different" | "missing";
  detail: string;
  severity: "P0" | "P1";
  currysExpected: string;
  electrizActual: string;
}

interface VisualResult {
  regionId: string;
  viewport: string;
  mismatchPercent: number | null;
  threshold: number;
  passed: boolean;
  dimensionMismatch: boolean;
  electrizSize: { width: number; height: number } | null;
  currysSize: { width: number; height: number } | null;
  diffPath: string | null;
  note?: string;
}

// Severity tags for collected issues
interface SeverityIssue {
  severity: "P0" | "P1" | "P2" | "P3";
  templateId: string;
  description: string;
}

// Critical templates where P1 issues escalate to FAIL
const CRITICAL_TEMPLATES = ["pdp", "plp", "basket", "checkout"];

// ─── File I/O helpers ────────────────────────────────────────────────────────

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (!existsSync(filePath)) return fallback;
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Severity classification ─────────────────────────────────────────────────

function classifyStructuralIssues(
  templateId: string,
  results: StructuralResult[]
): SeverityIssue[] {
  const issues: SeverityIssue[] = [];

  for (const r of results) {
    if (r.templateId !== templateId) continue;

    // Missing required sections = P0
    if (r.type === "sections-present" && r.missing && r.missing.length > 0) {
      for (const sectionId of r.missing) {
        issues.push({
          severity: "P0",
          templateId,
          description: `Required section "${sectionId}" missing from DOM (${r.viewport})`,
        });
      }
    }

    // Out-of-order sections
    if (r.type === "section-order" && r.outOfOrder) {
      for (const oo of r.outOfOrder) {
        const drift = Math.abs(oo.expected - oo.actual);
        if (drift >= 3) {
          issues.push({
            severity: "P1",
            templateId,
            description: `Section "${oo.id}" out of order by ${drift} positions (expected ${oo.expected}, actual ${oo.actual})`,
          });
        } else {
          issues.push({
            severity: "P2",
            templateId,
            description: `Section "${oo.id}" out of order by ${drift} position${drift > 1 ? "s" : ""} (expected ${oo.expected}, actual ${oo.actual})`,
          });
        }
      }
    }
  }

  return issues;
}

function classifyBehaviouralIssues(
  templateId: string,
  verdicts: BehaviouralVerdict[]
): SeverityIssue[] {
  const issues: SeverityIssue[] = [];

  for (const v of verdicts) {
    if (v.template !== templateId) continue;

    if (v.status === "missing") {
      // Missing interaction on a key template = P0
      if (CRITICAL_TEMPLATES.includes(templateId)) {
        issues.push({
          severity: "P0",
          templateId,
          description: `Interaction "${v.ruleId}" missing on critical template "${templateId}": ${v.detail}`,
        });
      } else {
        issues.push({
          severity: "P1",
          templateId,
          description: `Interaction "${v.ruleId}" missing: ${v.detail}`,
        });
      }
    } else if (v.status === "different") {
      issues.push({
        severity: "P1",
        templateId,
        description: `Interaction "${v.ruleId}" differs from Currys: ${v.detail}`,
      });
    }
  }

  return issues;
}

function classifyVisualIssues(
  templateId: string,
  visualResults: VisualResult[]
): SeverityIssue[] {
  const issues: SeverityIssue[] = [];

  // Map region IDs to template — use a simple prefix heuristic:
  // header/footer/usp/hero/shop-deals => homepage
  // filter-sidebar/product-card-plp/sort-bar => plp
  // buy-box/product-gallery => pdp
  // basket-item/order-summary => basket
  const regionTemplateMap: Record<string, string> = {
    header: "homepage",
    "usp-bar": "homepage",
    "hero-carousel": "homepage",
    "shop-deals": "homepage",
    footer: "homepage",
    "filter-sidebar": "plp",
    "product-card-plp": "plp",
    "sort-bar": "plp",
    "buy-box": "pdp",
    "product-gallery": "pdp",
    "basket-item": "basket",
    "order-summary": "basket",
  };

  for (const vr of visualResults) {
    const regionTemplate = regionTemplateMap[vr.regionId] ?? "unknown";
    if (regionTemplate !== templateId) continue;
    if (vr.mismatchPercent === null) continue; // no baseline, skip
    if (vr.passed) {
      // Check for minor-but-notable mismatch (5-10% but below tolerance)
      if (vr.mismatchPercent >= 0.05 && vr.mismatchPercent <= 0.1) {
        issues.push({
          severity: "P3",
          templateId,
          description: `Visual diff for "${vr.regionId}" (${vr.viewport}) at ${(vr.mismatchPercent * 100).toFixed(1)}% — below tolerance but noticeable`,
        });
      }
      continue;
    }
    // Failed visual comparison
    issues.push({
      severity: "P2",
      templateId,
      description: `Visual diff for "${vr.regionId}" (${vr.viewport}) at ${(vr.mismatchPercent * 100).toFixed(1)}% exceeds ${(vr.threshold * 100).toFixed(1)}% tolerance${vr.dimensionMismatch ? " (dimension mismatch)" : ""}`,
    });
  }

  return issues;
}

// ─── Template score builder ──────────────────────────────────────────────────

function buildTemplateScore(
  templateId: string,
  structuralResults: StructuralResult[],
  behaviouralVerdicts: BehaviouralVerdict[],
  visualResults: VisualResult[]
): TemplateScore {
  // Structural
  const templateStructural = structuralResults.filter(
    (r) => r.templateId === templateId
  );
  const presenceResults = templateStructural.filter(
    (r) => r.type === "sections-present"
  );
  const orderResults = templateStructural.filter(
    (r) => r.type === "section-order"
  );

  const sectionsExpected = presenceResults.reduce(
    (acc, r) => acc + (r.total ?? 0),
    0
  );
  const sectionsFound = presenceResults.reduce(
    (acc, r) => acc + (r.found ?? 0),
    0
  );
  const missingRequired = presenceResults.flatMap((r) => r.missing ?? []);
  const outOfOrder = orderResults.flatMap(
    (r) => r.outOfOrder?.map((o) => o.id) ?? []
  );

  // Behavioural
  const templateVerdicts = behaviouralVerdicts.filter(
    (v) => v.template === templateId
  );
  const behaviouralMapped = templateVerdicts.map((v) => ({
    ruleId: v.ruleId,
    status: v.status,
    severity: v.severity,
    detail: v.detail,
  }));
  const sameCount = templateVerdicts.filter((v) => v.status === "same").length;
  const differentCount = templateVerdicts.filter(
    (v) => v.status === "different"
  ).length;
  const missingCount = templateVerdicts.filter(
    (v) => v.status === "missing"
  ).length;

  // Visual
  const regionTemplateMap: Record<string, string> = {
    header: "homepage",
    "usp-bar": "homepage",
    "hero-carousel": "homepage",
    "shop-deals": "homepage",
    footer: "homepage",
    "filter-sidebar": "plp",
    "product-card-plp": "plp",
    "sort-bar": "plp",
    "buy-box": "pdp",
    "product-gallery": "pdp",
    "basket-item": "basket",
    "order-summary": "basket",
  };

  const templateVisual = visualResults.filter(
    (vr) => (regionTemplateMap[vr.regionId] ?? "unknown") === templateId
  );
  const visualRegions = templateVisual.map((vr) => ({
    regionId: vr.regionId,
    mismatchPercent: vr.mismatchPercent ?? 0,
    threshold: vr.threshold,
    passed: vr.passed,
    dimensionMismatch: vr.dimensionMismatch,
    electrizScreenshot: `artifacts/parity/screenshots/electriz/${vr.regionId}-${vr.viewport}.png`,
    currysBaseline: `tests/parity/baselines/currys/${vr.regionId}-${vr.viewport}.png`,
    diffImage: vr.diffPath ?? "",
  }));

  // Collect all severity issues for this template
  const allIssues = [
    ...classifyStructuralIssues(templateId, structuralResults),
    ...classifyBehaviouralIssues(templateId, behaviouralVerdicts),
    ...classifyVisualIssues(templateId, visualResults),
  ];

  const blockers = allIssues
    .filter((i) => i.severity === "P0")
    .map((i) => i.description);

  // Template verdict
  const hasP0 = allIssues.some((i) => i.severity === "P0");
  const materialP1 =
    CRITICAL_TEMPLATES.includes(templateId) &&
    allIssues.some((i) => i.severity === "P1");

  let verdict: "PASS" | "REVIEW" | "FAIL";
  if (hasP0 || materialP1) {
    verdict = "FAIL";
  } else {
    // Calculate pass rate
    const totalChecks =
      sectionsExpected + templateVerdicts.length + templateVisual.length;
    const passedChecks =
      sectionsFound +
      sameCount +
      templateVisual.filter((v) => v.passed).length;
    const score = totalChecks > 0 ? passedChecks / totalChecks : 1;
    if (score >= 0.85) verdict = "PASS";
    else if (score >= 0.7) verdict = "REVIEW";
    else verdict = "FAIL";
  }

  return {
    templateId,
    structural: {
      sectionsExpected,
      sectionsFound,
      missingRequired,
      outOfOrder,
    },
    behavioural: {
      verdicts: behaviouralMapped,
      sameCount,
      differentCount,
      missingCount,
    },
    visual: { regions: visualRegions },
    verdict,
    blockers,
  };
}

// ─── Markdown report builder ─────────────────────────────────────────────────

function buildMarkdownReport(
  scorecard: ParityScorecard,
  issues: SeverityIssue[]
): string {
  const lines: string[] = [];
  const { summary, templates, verdict, timestamp } = scorecard;

  lines.push(`# Parity Audit Report — ${timestamp}`);
  lines.push("");
  lines.push(`## Verdict: ${verdict}`);
  lines.push("");

  // Blockers
  lines.push("### Blockers (fix before shipping)");
  if (summary.blockers.length === 0) {
    lines.push("None.");
  } else {
    for (const b of summary.blockers) {
      lines.push(`- [P0] ${b}`);
    }
  }
  lines.push("");

  // Template summary table
  lines.push("### Template Summary");
  lines.push(
    "| Template | Structural | Behavioural | Visual | Verdict |"
  );
  lines.push("|----------|-----------|-------------|--------|---------|");
  for (const t of templates) {
    const structLabel = `${t.structural.sectionsFound}/${t.structural.sectionsExpected} sections`;
    const behLabel =
      t.behavioural.verdicts.length > 0
        ? `${t.behavioural.sameCount}/${t.behavioural.verdicts.length} same`
        : "No rules";
    const visLabel =
      t.visual.regions.length > 0
        ? `${t.visual.regions.filter((r) => r.passed).length}/${t.visual.regions.length} pass`
        : "No baselines";
    lines.push(
      `| ${t.templateId} | ${structLabel} | ${behLabel} | ${visLabel} | ${t.verdict} |`
    );
  }
  lines.push("");

  const allIssues = issues;

  // Mismatches by severity
  lines.push("### Mismatches by Severity");
  lines.push("");

  const p0 = allIssues.filter((i) => i.severity === "P0");
  const p1 = allIssues.filter((i) => i.severity === "P1");
  const p2 = allIssues.filter((i) => i.severity === "P2");
  const p3 = allIssues.filter((i) => i.severity === "P3");

  lines.push("#### P0 — Missing critical blocks");
  if (p0.length === 0) lines.push("None.");
  else for (const i of p0) lines.push(`- **${i.templateId}**: ${i.description}`);
  lines.push("");

  lines.push("#### P1 — Major layout/behaviour mismatch");
  if (p1.length === 0) lines.push("None.");
  else for (const i of p1) lines.push(`- **${i.templateId}**: ${i.description}`);
  lines.push("");

  lines.push("#### P2 — Noticeable visual mismatch");
  if (p2.length === 0) lines.push("None.");
  else for (const i of p2) lines.push(`- **${i.templateId}**: ${i.description}`);
  lines.push("");

  lines.push("#### P3 — Minor polish");
  if (p3.length === 0) lines.push("None.");
  else for (const i of p3) lines.push(`- **${i.templateId}**: ${i.description}`);
  lines.push("");

  // Recommended fixes
  lines.push("### Recommended Fixes (priority order)");
  lines.push("");
  const prioritised = [...p0, ...p1, ...p2, ...p3];
  if (prioritised.length === 0) {
    lines.push("No issues found.");
  } else {
    for (let i = 0; i < prioritised.length; i++) {
      lines.push(
        `${i + 1}. [${prioritised[i].severity}] **${prioritised[i].templateId}** — ${prioritised[i].description}`
      );
    }
  }
  lines.push("");

  // Evidence
  lines.push("### Evidence");
  lines.push("- Screenshots: artifacts/parity/screenshots/electriz/");
  lines.push("- Currys baselines: tests/parity/baselines/currys/");
  lines.push("- Diffs: artifacts/parity/diffs/");
  lines.push("");

  return lines.join("\n");
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateParityReport(
  projectRoot?: string
): Promise<ParityScorecard> {
  const root = projectRoot ?? process.cwd();

  // Read input files — structural results are per-template files
  const reportsDir = path.join(root, "artifacts/parity/reports");
  const structuralResults: StructuralResult[] = [];
  const structuralManifests: string[] = [];
  if (existsSync(reportsDir)) {
    const files = readdirSync(reportsDir).filter(
      (f) => f.startsWith("structural-results-") && f.endsWith(".json")
    );
    for (const file of files) {
      const data = readJsonSafe<{
        templateId: string;
        results: StructuralResult[];
      }>(path.join(reportsDir, file), { templateId: "", results: [] });
      if (data.templateId) structuralManifests.push(data.templateId);
      structuralResults.push(...data.results);
    }
  }
  const structuralReport: StructuralReport = {
    generatedAt: new Date().toISOString(),
    manifests: structuralManifests,
    results: structuralResults,
  };

  const behaviouralPath = path.join(
    root,
    "artifacts/parity/reports/behavioural-verdicts.json"
  );
  const visualPath = path.join(
    root,
    "artifacts/parity/reports/visual-results.json"
  );

  const behaviouralVerdicts = readJsonSafe<BehaviouralVerdict[]>(
    behaviouralPath,
    []
  );

  const visualResults = readJsonSafe<VisualResult[]>(visualPath, []);

  // Determine all template IDs from inputs
  const templateIds = new Set<string>();
  for (const id of structuralReport.manifests) templateIds.add(id);
  for (const v of behaviouralVerdicts) templateIds.add(v.template);
  // Visual results use region IDs — map back to template
  const regionTemplateMap: Record<string, string> = {
    header: "homepage",
    "usp-bar": "homepage",
    "hero-carousel": "homepage",
    "shop-deals": "homepage",
    footer: "homepage",
    "filter-sidebar": "plp",
    "product-card-plp": "plp",
    "sort-bar": "plp",
    "buy-box": "pdp",
    "product-gallery": "pdp",
    "basket-item": "basket",
    "order-summary": "basket",
  };
  for (const vr of visualResults) {
    const mapped = regionTemplateMap[vr.regionId];
    if (mapped) templateIds.add(mapped);
  }

  // Build per-template scores
  const templateIdList = Array.from(templateIds);
  const templates: TemplateScore[] = [];
  for (const templateId of templateIdList) {
    templates.push(
      buildTemplateScore(
        templateId,
        structuralReport.results,
        behaviouralVerdicts,
        visualResults
      )
    );
  }

  // Aggregate summary
  const allIssues: SeverityIssue[] = [];
  for (const templateId of templateIdList) {
    allIssues.push(
      ...classifyStructuralIssues(templateId, structuralReport.results),
      ...classifyBehaviouralIssues(templateId, behaviouralVerdicts),
      ...classifyVisualIssues(templateId, visualResults)
    );
  }

  const p0Count = allIssues.filter((i) => i.severity === "P0").length;
  const p1Count = allIssues.filter((i) => i.severity === "P1").length;
  const p2Count = allIssues.filter((i) => i.severity === "P2").length;
  const p3Count = allIssues.filter((i) => i.severity === "P3").length;
  const blockers = allIssues
    .filter((i) => i.severity === "P0")
    .map((i) => `[${i.templateId}] ${i.description}`);

  const totalChecks = templates.reduce((acc, t) => {
    return (
      acc +
      t.structural.sectionsExpected +
      t.behavioural.verdicts.length +
      t.visual.regions.length
    );
  }, 0);

  const passedChecks = templates.reduce((acc, t) => {
    return (
      acc +
      t.structural.sectionsFound +
      t.behavioural.sameCount +
      t.visual.regions.filter((r) => r.passed).length
    );
  }, 0);

  const failedChecks = totalChecks - passedChecks;

  // Overall verdict — blocker-first
  let verdict: "PASS" | "REVIEW" | "FAIL";
  if (p0Count > 0) {
    verdict = "FAIL";
  } else {
    const materialP1OnCritical = allIssues.some(
      (i) =>
        i.severity === "P1" && CRITICAL_TEMPLATES.includes(i.templateId)
    );
    if (materialP1OnCritical) {
      verdict = "FAIL";
    } else if (p1Count >= 3) {
      verdict = "FAIL";
    } else {
      const score = totalChecks > 0 ? passedChecks / totalChecks : 1;
      if (score >= 0.85) verdict = "PASS";
      else if (score >= 0.7) verdict = "REVIEW";
      else verdict = "FAIL";
    }
  }

  const timestamp = new Date().toISOString();

  const scorecard: ParityScorecard = {
    timestamp,
    templates,
    summary: {
      totalChecks,
      passed: passedChecks,
      failed: failedChecks,
      p0Count,
      p1Count,
      p2Count,
      p3Count,
      blockers,
    },
    verdict,
  };

  // Write outputs
  const reportDir = path.join(root, "artifacts/parity/reports");
  mkdirSync(reportDir, { recursive: true });

  writeFileSync(
    path.join(reportDir, "parity-scorecard.json"),
    JSON.stringify(scorecard, null, 2),
    "utf-8"
  );

  const markdown = buildMarkdownReport(scorecard, allIssues);
  writeFileSync(
    path.join(reportDir, "parity-report.md"),
    markdown,
    "utf-8"
  );

  return scorecard;
}
