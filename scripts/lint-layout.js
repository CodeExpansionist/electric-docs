/**
 * Lint layout patterns in TSX files to catch common CSS overflow bugs.
 * Checks for flex-1 without min-w-0 and fixed-width flex children that exceed budgets.
 *
 * Usage: node scripts/lint-layout.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'src');
let warnings = 0;
let errors = 0;

// Find all .tsx files
const files = execFileSync('find', [SRC_DIR, '-name', '*.tsx', '-type', 'f'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log('Layout Lint Results');
console.log('===================\n');

// --- Check 1: flex-1 without min-w-0 ---
console.log('Check 1: flex-1 without min-w-0');
console.log('-------------------------------');

const SKIP_PATTERNS = [
  /\bw-full\b/,       // Already full-width constrained
  /\bmax-w-/,         // Has a max-width
  /\boverflow-/,      // Has overflow handling
  /<hr\b/,            // Decorative dividers
  /border-border/,    // Decorative dividers (hr-like)
  /\bh-\d/,           // Height-only usage (decorative lines)
  /\bpy-\d+\b.*\btext-xs\b/, // Small UI elements like tabs
  /\bbtn-/,           // Buttons using flex-1 for equal sizing
  /\binput-border\b/, // Form inputs with border styling
  /\btext-center\b.*\bno-underline\b/, // Link buttons
];

let check1Found = 0;

for (const filePath of files) {
  // Skip admin pages (not public-facing, low overflow risk)
  if (filePath.includes('/admin/')) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for className containing flex-1 but not min-w-0
    if (line.includes('flex-1') && !line.includes('min-w-0')) {
      // Extract the className value for inspection
      const classMatch = line.match(/className="([^"]+)"/);
      if (!classMatch) continue;

      const classes = classMatch[1];
      if (!classes.includes('flex-1')) continue;
      if (classes.includes('min-w-0')) continue;

      // Skip known safe patterns
      const shouldSkip = SKIP_PATTERNS.some(p => p.test(line));
      if (shouldSkip) continue;

      // Skip if this is inside a flex-col only container (no horizontal overflow risk)
      if (classes.includes('flex-col') && !classes.includes('flex-row')) continue;

      // Check if parent line has flex-row (look back up to 5 lines)
      let hasFlexRowParent = false;
      for (let j = Math.max(0, i - 5); j < i; j++) {
        if (lines[j].includes('flex-row') || lines[j].includes('flex ') || lines[j].match(/\bflex\b.*\bgap/)) {
          hasFlexRowParent = true;
          break;
        }
      }

      // Only warn if in a flex-row context
      if (hasFlexRowParent) {
        console.log(`  WARN  ${relPath}:${i + 1}`);
        console.log(`        flex-1 without min-w-0 in flex-row context`);
        console.log(`        classes: "${classes}"\n`);
        warnings++;
        check1Found++;
      }
    }
  }
}

if (check1Found === 0) {
  console.log('  OK    All flex-1 items in flex-row contexts have min-w-0\n');
}

// --- Check 2: Fixed-width flex children budget ---
console.log('Check 2: Fixed-width flex children budget');
console.log('-----------------------------------------');

let check2Found = 0;
const CONTAINER_MAX = 1280;
const CONTAINER_PADDING = 32; // px-4 = 16px each side
const MAX_CONTENT = CONTAINER_MAX - CONTAINER_PADDING;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  // Find flex-row containers and sum their fixed-width children
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('flex-row') && !line.match(/\bflex\b.*\bgap/)) continue;

    // Look ahead for w-[Npx] children within the next 30 lines
    const fixedWidths = [];
    let gapPx = 0;
    const gapMatch = line.match(/gap-(\d+)/);
    if (gapMatch) gapPx = parseInt(gapMatch[1]) * 4;

    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      const childLine = lines[j];
      const widthMatch = childLine.match(/w-\[(\d+)px\]/);
      if (widthMatch) {
        fixedWidths.push({ width: parseInt(widthMatch[1]), line: j + 1 });
      }
      // Stop at closing div that likely ends this container
      if (childLine.trim() === '</div>' && fixedWidths.length > 0) break;
    }

    if (fixedWidths.length >= 2) {
      const totalFixed = fixedWidths.reduce((sum, w) => sum + w.width, 0);
      const totalGaps = (fixedWidths.length - 1) * gapPx;
      const total = totalFixed + totalGaps;

      if (total > MAX_CONTENT) {
        console.log(`  ERROR ${relPath}:${i + 1}`);
        console.log(`        Fixed widths (${fixedWidths.map(w => w.width + 'px').join(' + ')}) + gaps (${totalGaps}px) = ${total}px`);
        console.log(`        Exceeds container budget of ${MAX_CONTENT}px\n`);
        errors++;
        check2Found++;
      }
    }
  }
}

if (check2Found === 0) {
  console.log('  OK    No fixed-width budget violations found\n');
}

// --- Summary ---
console.log('-------------------');
console.log(`${warnings} warning(s), ${errors} error(s)`);

if (errors > 0) {
  process.exit(1);
} else if (warnings > 0) {
  process.exit(0); // Warnings don't fail the build
}
