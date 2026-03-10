/**
 * audit-docs.js — documentation drift checker
 *
 * Scans documentation markdown files in the repo for:
 *   1. Markdown links [text](path) pointing to non-existent local files
 *   2. Backtick paths `src/lib/foo.ts` pointing to non-existent repo paths
 *   3. Version mismatches: framework versions in prose vs data/repo-facts.json
 *   4. Staleness: warns if data/repo-facts.json is older than 7 days
 *
 * Skips:
 *   - .claude/commands/ and .claude/skills/ (skill blueprints, not repo docs)
 *   - External URLs, anchors, mailto links
 *   - Template patterns ({placeholder}, <name>), globs, code fences
 *   - Dynamic route patterns containing [ ] brackets
 *   - Known-absent gitignored files (.env.local)
 *
 * Exit codes:
 *   0 = pass (may include warnings)
 *   1 = fail (dead refs, version mismatches, or missing/invalid repo-facts)
 *
 * Usage: node scripts/audit-docs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// Directories to skip — skill blueprints describe files to CREATE, not current state
const SKIP_DIRS = ['.claude/commands', '.claude/skills'];

// Backtick strings must start with one of these to be treated as a repo path
const REPO_PREFIXES = ['src/', 'data/', 'docs/', 'scripts/', 'public/', '.claude/'];

// Known root-level files worth checking when referenced in backticks
const ROOT_FILES = [
  'package.json', 'package-lock.json',
  '.env.example',
  '.eslintrc.json', '.gitignore',
  'tsconfig.json', 'next.config.mjs',
  'tailwind.config.ts', 'postcss.config.mjs',
  'next-env.d.ts',
  'README.md', 'CLAUDE.md', 'CONTRIBUTING.md',
  'PROJECT_SPEC.md', 'CHANGELOG.md', 'LICENSE',
];

// Files that are intentionally absent from the repo
const KNOWN_ABSENT = [
  '.env.local',                       // gitignored — user creates from .env.example
  'data/scrape/missing-products.json', // transient pipeline output from find-missing-products.js
];

// --- Find all markdown files ---

function findMarkdownFiles() {
  const cmd = [
    `find "${ROOT}"`,
    '-name "*.md"',
    '-not -path "*/node_modules/*"',
    '-not -path "*/.next/*"',
    '-not -path "*/.git/*"',
  ].join(' ');
  const output = execSync(cmd, { encoding: 'utf8' });
  return output
    .trim()
    .split('\n')
    .filter((f) => {
      if (!f) return false;
      const rel = path.relative(ROOT, f);
      return !SKIP_DIRS.some((d) => rel.startsWith(d + '/') || rel.startsWith(d + path.sep));
    })
    .sort();
}

// --- Check a single markdown file ---

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(ROOT, filePath);
  const fileDir = path.dirname(filePath);
  const issues = [];

  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track fenced code blocks — skip content inside them
    if (line.trimStart().startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    // 1. Markdown links: [text](target)
    const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRe.exec(line)) !== null) {
      const target = m[2].trim();
      const deadLink = checkMarkdownLink(target, fileDir);
      if (deadLink) {
        issues.push({ file: relPath, line: lineNum, ref: target, type: 'link' });
      }
    }

    // 2. Backtick paths: `some/repo/path`
    //    Skip backtick content inside ~~strikethrough~~ (resolved issues reference deleted files)
    const lineNoStrike = line.replace(/~~[^~]+~~/g, '');
    const btRe = /`([^`]+)`/g;
    while ((m = btRe.exec(lineNoStrike)) !== null) {
      const ref = m[1].trim();
      if (isRepoPath(ref) && !existsInRepo(ref)) {
        issues.push({ file: relPath, line: lineNum, ref, type: 'path' });
      }
    }
  }

  return issues;
}

// --- Markdown link checking ---

function checkMarkdownLink(target, fileDir) {
  // Skip external URLs
  if (/^https?:\/\//.test(target)) return false;
  if (target.startsWith('mailto:')) return false;
  // Skip pure anchors
  if (target.startsWith('#')) return false;

  // Strip anchor suffix: ARCHITECTURE.md#section → ARCHITECTURE.md
  const pathPart = target.split('#')[0];
  if (!pathPart) return false;

  // Skip dynamic route patterns: [slug], [...category]
  if (pathPart.includes('[')) return false;

  // Resolve relative to the file that contains the link
  const resolved = path.resolve(fileDir, pathPart);
  return !fs.existsSync(resolved);
}

// --- Backtick path checking ---

function isRepoPath(ref) {
  // Skip known-absent files (gitignored by design)
  if (KNOWN_ABSENT.includes(ref)) return false;

  const hasPrefix = REPO_PREFIXES.some((p) => ref.startsWith(p));
  const isRoot = ROOT_FILES.includes(ref);
  if (!hasPrefix && !isRoot) return false;

  // Skip template patterns: {placeholder}, <name>
  if (ref.includes('{') || ref.includes('<')) return false;
  // Skip globs: *.md, commands/*
  if (ref.includes('*') || ref.includes('?')) return false;
  // Skip dynamic route patterns: [slug], [...category]
  if (ref.includes('[')) return false;
  // Skip function-like: someFunc(), module.method()
  if (/\(\)/.test(ref)) return false;
  // Skip things with spaces (likely prose, not a path)
  if (ref.includes(' ')) return false;

  return true;
}

function existsInRepo(ref) {
  const resolved = path.resolve(ROOT, ref);
  return fs.existsSync(resolved);
}

// --- Version mismatch checking ---

// Patterns that match explicit version mentions in prose.
// Each entry: [regex, repo-facts key, display name]
// The regex captures the major version (and optional minor/patch).
const VERSION_PATTERNS = [
  { re: /Next\.js\s+(\d+(?:\.\d+)*)/gi,            key: 'next',        name: 'Next.js' },
  { re: /Next\s+(\d+(?:\.\d+)*)/g,                 key: 'next',        name: 'Next.js' },
  { re: /React\s+(\d+(?:\.\d+)*)/g,                key: 'react',       name: 'React' },
  { re: /Tailwind(?:\s+CSS)?\s+(\d+(?:\.\d+)*)/gi, key: 'tailwindcss', name: 'Tailwind CSS' },
  { re: /TypeScript\s+(\d+(?:\.\d+)*)/gi,          key: 'typescript',  name: 'TypeScript' },
];

const STALE_DAYS = 7;

function loadRepoFacts() {
  const factsPath = path.join(ROOT, 'data', 'repo-facts.json');

  if (!fs.existsSync(factsPath)) {
    return { status: 'missing', data: null };
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(factsPath, 'utf8'));
  } catch {
    return { status: 'invalid', data: null };
  }

  if (!data.generated) {
    return { status: 'no-timestamp', data };
  }

  const generatedAt = new Date(data.generated);
  const ageMs = Date.now() - generatedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > STALE_DAYS) {
    return { status: 'stale', data, ageDays: Math.floor(ageDays) };
  }

  return { status: 'fresh', data, ageDays: Math.round(ageDays * 10) / 10 };
}

function checkVersions(filePath, facts) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(ROOT, filePath);
  const issues = [];

  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.trimStart().startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    for (const pat of VERSION_PATTERNS) {
      // Reset regex lastIndex for each line (they use /g flag)
      pat.re.lastIndex = 0;
      let m;
      while ((m = pat.re.exec(line)) !== null) {
        const docVersion = m[1];
        const expected = facts.versions[pat.key];
        if (!expected) continue;

        // Compare major version at minimum. A doc saying "Next.js 15" is fine
        // when repo-facts says "15.5.12" — the major matches. But "Next.js 14"
        // against "15.5.12" is a mismatch.
        if (!versionsCompatible(docVersion, expected)) {
          issues.push({
            file: relPath,
            line: lineNum,
            ref: `${pat.name} ${docVersion}`,
            expected: `${pat.name} ${expected}`,
            type: 'version',
          });
        }
      }
    }
  }

  return issues;
}

function versionsCompatible(docVer, repoVer) {
  // Split both into segments: "14" → ["14"], "15.5.12" → ["15","5","12"]
  const docParts = docVer.split('.');
  const repoParts = repoVer.split('.');

  // The doc version must match the repo version for every segment the doc specifies.
  // "15" matches "15.5.12" (major matches).
  // "15.5" matches "15.5.12" (major+minor match).
  // "14" does NOT match "15.5.12" (major differs).
  for (let i = 0; i < docParts.length; i++) {
    if (i >= repoParts.length) return false;
    if (docParts[i] !== repoParts[i]) return false;
  }
  return true;
}

// --- Main ---

const factsResult = loadRepoFacts();
const files = findMarkdownFiles();
let allIssues = [];
const warnings = [];
let hasFail = false;

// Check repo-facts status
if (factsResult.status === 'missing') {
  hasFail = true;
  allIssues.push({ type: 'facts', ref: 'data/repo-facts.json is missing — run: npm run facts' });
} else if (factsResult.status === 'invalid') {
  hasFail = true;
  allIssues.push({ type: 'facts', ref: 'data/repo-facts.json contains invalid JSON — run: npm run facts' });
} else if (factsResult.status === 'stale') {
  warnings.push(`repo-facts.json is ${factsResult.ageDays} days old — run: npm run facts`);
} else if (factsResult.status === 'no-timestamp') {
  warnings.push('repo-facts.json has no "generated" timestamp — run: npm run facts');
}

// Run file checks
for (const f of files) {
  allIssues.push(...checkFile(f));
  if (factsResult.data) {
    allIssues.push(...checkVersions(f, factsResult.data));
  }
}

// Group by type
const refIssues = allIssues.filter((i) => i.type === 'link' || i.type === 'path');
const verIssues = allIssues.filter((i) => i.type === 'version');
const factsIssues = allIssues.filter((i) => i.type === 'facts');

// Report
console.log(`Scanned ${files.length} markdown files.\n`);

if (factsIssues.length > 0) {
  for (const issue of factsIssues) {
    console.log(`  FAIL  ${issue.ref}`);
  }
  console.log('');
}

if (refIssues.length > 0) {
  console.log(`Dead references (${refIssues.length}):\n`);
  for (const issue of refIssues) {
    const tag = issue.type === 'link' ? 'LINK' : 'PATH';
    console.log(`  ${issue.file}:${issue.line}  [${tag}]  ${issue.ref}`);
  }
  console.log('');
}

if (verIssues.length > 0) {
  console.log(`Version mismatches (${verIssues.length}):\n`);
  for (const issue of verIssues) {
    console.log(`  ${issue.file}:${issue.line}  says "${issue.ref}"  expected "${issue.expected}"`);
  }
  console.log('');
}

if (warnings.length > 0) {
  for (const w of warnings) {
    console.log(`  WARN  ${w}`);
  }
  console.log('');
}

// Exit code: fail for hard issues, pass (with warnings) for staleness only
const failCount = refIssues.length + verIssues.length + factsIssues.length;

if (failCount > 0) {
  console.log(`FAIL — ${failCount} issue(s) found.`);
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`PASS (with ${warnings.length} warning(s)).`);
  process.exit(0);
} else {
  console.log('PASS — all checks passed.');
  process.exit(0);
}
