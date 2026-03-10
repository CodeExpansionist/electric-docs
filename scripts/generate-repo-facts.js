/**
 * generate-repo-facts.js
 *
 * Generates data/repo-facts.json from repo truth (filesystem + package.json + .env.example).
 * Does NOT parse markdown or TypeScript source files for facts.
 *
 * Usage: node scripts/generate-repo-facts.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// --- Helpers ---

function countFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return 0;
  try {
    // Use find for recursive counting — handles large directories efficiently
    const cmd = pattern
      ? `find "${dir}" -type f -name "${pattern}" | wc -l`
      : `find "${dir}" -type f | wc -l`;
    return parseInt(execSync(cmd, { encoding: 'utf8' }).trim(), 10) || 0;
  } catch {
    return 0;
  }
}

function countDirEntries(dir) {
  if (!fs.existsSync(dir)) return 0;
  try {
    return fs.readdirSync(dir).length;
  } catch {
    return 0;
  }
}

function stripCaret(version) {
  if (!version) return null;
  return version.replace(/^[\^~>=<]+/, '');
}

// --- Versions (from package.json) ---

function getVersions() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  return {
    next: stripCaret(deps.next),
    react: stripCaret(deps.react),
    tailwindcss: stripCaret(devDeps.tailwindcss),
    typescript: stripCaret(devDeps.typescript),
  };
}

// --- Counts (from filesystem) ---

function getCounts() {
  return {
    products: countDirEntries(path.join(ROOT, 'data', 'scrape', 'products')),
    images: countFiles(path.join(ROOT, 'public', 'images')),
    categories: countCategories(),
    scripts: countScripts(),
    components: countFiles(path.join(ROOT, 'src', 'components'), '*.tsx'),
    routes: countFiles(path.join(ROOT, 'src', 'app'), 'page.tsx'),
  };
}

function countScripts() {
  const dir = path.join(ROOT, 'scripts');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js')).length;
}

function countCategories() {
  // Category files = JSON files in data/scrape/ (not subdirectories) that contain
  // a "products" array with at least one item. This is data-driven detection —
  // no source code parsing needed.
  const dir = path.join(ROOT, 'data', 'scrape');
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(dir, file);
    if (!fs.statSync(filePath).isFile()) continue;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data.products) && data.products.length > 0) {
        count++;
      }
    } catch {
      // Skip files that fail to parse
    }
  }
  return count;
}

// --- Package scripts (from package.json) ---

function getPackageScripts() {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.scripts || {};
}

// --- Env vars (from .env.example + source grep) ---

function getEnvVars() {
  const documented = parseEnvExample();
  const usedInCode = grepEnvUsage();
  return { documented, usedInCode };
}

function parseEnvExample() {
  const envPath = path.join(ROOT, '.env.example');
  if (!fs.existsSync(envPath)) return [];
  const content = fs.readFileSync(envPath, 'utf8');
  const vars = [];
  for (const line of content.split('\n')) {
    // Match both active (VAR=value) and commented (# VAR=value) variable declarations
    const match = line.match(/^#?\s*([A-Z][A-Z0-9_]+=)/);
    if (match) {
      vars.push(match[1].replace('=', ''));
    }
  }
  return [...new Set(vars)].sort();
}

function grepEnvUsage() {
  const srcDir = path.join(ROOT, 'src');
  if (!fs.existsSync(srcDir)) return [];
  try {
    const output = execSync(
      `grep -roh 'process\\.env\\.[A-Z_]*' "${srcDir}" | sort -u`,
      { encoding: 'utf8' }
    );
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((v) => v.replace('process.env.', ''));
  } catch {
    return [];
  }
}

// --- Generate ---

const facts = {
  generated: new Date().toISOString(),
  versions: getVersions(),
  counts: getCounts(),
  packageScripts: getPackageScripts(),
  envVars: getEnvVars(),
};

const outPath = path.join(ROOT, 'data', 'repo-facts.json');
fs.writeFileSync(outPath, JSON.stringify(facts, null, 2) + '\n');

console.log('repo-facts.json generated:');
console.log(JSON.stringify(facts, null, 2));
