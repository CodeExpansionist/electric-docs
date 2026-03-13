/**
 * Smoke Test — checks every page on the site renders without crashing.
 *
 * What it does:
 *   1. Starts the Next.js dev server automatically
 *   2. Hits every known route and checks for HTTP 200
 *   3. Scans each page's HTML for internal links
 *   4. Checks those links too (broken link detection)
 *   5. Reports all failures at the end
 *
 * Run:
 *   1. Start the dev server first:  npm run dev
 *   2. In another terminal:         node tests/smoke-test.mjs
 *   Or with a custom port:          PORT=3001 node tests/smoke-test.mjs
 *
 * The script will auto-detect if the server is already running.
 * If not, it will try to start one automatically.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;
const TIMEOUT_MS = 60000; // 60s per request (first hit compiles the page in dev mode)
const CONCURRENCY = 1; // sequential to avoid overwhelming dev server

// ─── Route definitions ──────────────────────────────────────────────

// Static pages
const STATIC_ROUTES = [
  "/",
  "/basket",
  "/saved",
  "/search",
  "/checkout",
  "/checkout/payment",
  "/checkout/confirmation",
  "/account",
  "/track-your-order",
  "/site-map",
  "/tv-and-audio",
  "/help-and-support",
  "/contact-us",
  "/product-recalls",
  "/product-reviews",
  "/privacy-cookies-policy",
  "/terms-and-conditions",
  "/techtalk",
  "/admin",
];

// TV & Audio category routes (from categoryMap)
const CATEGORY_ROUTES = [
  "/tv-and-audio/televisions/tvs",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems",
  "/tv-and-audio/dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players",
  "/tv-and-audio/speakers-and-hi-fi-systems",
  "/tv-and-audio/tv-accessories",
  "/tv-and-audio/tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
  "/tv-and-audio/tv-accessories/cables-and-accessories",
  "/tv-and-audio/tv-accessories/remote-controls",
  "/tv-and-audio/tv-accessories/tv-aerials",
  "/tv-and-audio/digital-and-smart-tv",
  "/tv-and-audio/headphones/headphones",
  "/tv-and-audio/radios",
];

// Services & footer pages (from data/scrape/pages/)
const FOOTER_ROUTES = [
  "/business",
  "/careers",
  "/corporate",
  "/csr",
  "/ireland",
  "/modern-slavery-statement",
  "/partmaster",
  "/pr-media",
  "/trustpilot",
  "/services/delivery",
  "/services/gift-cards",
  "/services/instant-replacement",
  "/services/price-promise",
  "/services/returns",
  "/services/shoplive",
  "/services/tablet-insurance",
];

// Sample product pages (grab a few from data/scrape/products/)
function getProductRoutes() {
  const productsDir = path.join(PROJECT_ROOT, "data/scrape/products");
  try {
    const files = fs.readdirSync(productsDir);
    // Take first 5 + last 5 + 5 random from the middle for coverage
    const ids = files.map(f => f.replace(".json", ""));
    const sample = [
      ...ids.slice(0, 5),
      ...ids.slice(-5),
      ...ids.filter((_, i) => i % Math.ceil(ids.length / 5) === 0).slice(0, 5),
    ];
    const unique = [...new Set(sample)];
    return unique.map(id => `/products/${id}.html`);
  } catch {
    return [];
  }
}

// Filter routes (brand + size range)
const FILTER_ROUTES = [
  "/tv-and-audio/televisions/tvs/samsung",
  "/tv-and-audio/televisions/tvs/lg",
  "/tv-and-audio/televisions/tvs/55-64",
  "/tv-and-audio/televisions/tvs/90-and-more",
];

// ─── HTTP helper ─────────────────────────────────────────────────────

function fetchPage(urlPath) {
  return new Promise((resolve) => {
    const url = BASE + urlPath;
    const startTime = Date.now();
    const req = http.get(url, { timeout: TIMEOUT_MS }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        resolve({
          path: urlPath,
          status: res.statusCode,
          duration: Date.now() - startTime,
          body,
          ok: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });
    req.on("error", (err) => {
      resolve({
        path: urlPath,
        status: 0,
        duration: Date.now() - startTime,
        body: "",
        ok: false,
        error: err.message,
      });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({
        path: urlPath,
        status: 0,
        duration: TIMEOUT_MS,
        body: "",
        ok: false,
        error: "TIMEOUT",
      });
    });
  });
}

// ─── Link extraction ────────────────────────────────────────────────

function extractInternalLinks(html) {
  const links = new Set();
  // Match href="/..." (internal links only)
  const regex = /href="(\/[^"]*?)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let href = match[1];
    // Strip query params and hash for deduplication
    href = href.split("?")[0].split("#")[0];
    // Skip static assets, API routes, and anchors
    if (href.startsWith("/images/") || href.startsWith("/api/") ||
        href.startsWith("/_next/") || href.startsWith("/fonts/") ||
        href === "/") continue;
    links.add(href);
  }
  return [...links];
}

// ─── Server management ──────────────────────────────────────────────

async function waitForServer(maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const result = await fetchPage("/");
      if (result.status > 0) return true;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

async function isServerRunning() {
  try {
    const result = await fetchPage("/");
    return result.status > 0;
  } catch {
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Electriz Smoke Test & Broken Link Checker\n");

  // Check if server is already running, start it if not
  let serverProcess = null;
  const running = await isServerRunning();
  if (!running) {
    console.log("Starting dev server...");
    serverProcess = spawn("npx", ["next", "dev", "-p", String(PORT)], {
      cwd: PROJECT_ROOT,
      stdio: "ignore",
      detached: true,
    });
    const ready = await waitForServer();
    if (!ready) {
      console.error("❌ Dev server failed to start within 2 minutes");
      process.exit(1);
    }
    console.log("✅ Dev server ready\n");
  } else {
    console.log("✅ Dev server already running\n");
  }

  const productRoutes = getProductRoutes();

  // All known routes to test
  const knownRoutes = [
    ...STATIC_ROUTES,
    ...CATEGORY_ROUTES,
    ...FOOTER_ROUTES,
    ...productRoutes,
    ...FILTER_ROUTES,
  ];

  console.log(`📋 Testing ${knownRoutes.length} known routes...\n`);

  // Phase 1: Test all known routes
  const results = [];
  const discoveredLinks = new Set();

  for (const route of knownRoutes) {
    const result = await fetchPage(route);
    results.push(result);

    const icon = result.ok ? "✅" : "❌";
    const statusStr = result.error ? result.error : result.status;
    const timeStr = `${result.duration}ms`;
    console.log(`  ${icon} [${statusStr}] ${route} (${timeStr})`);

    // Extract internal links from successful pages
    if (result.ok && result.body) {
      const links = extractInternalLinks(result.body);
      links.forEach(l => discoveredLinks.add(l));
    }
  }

  // Phase 2: Check discovered links that aren't in our known routes
  const knownSet = new Set(knownRoutes);
  const newLinks = [...discoveredLinks].filter(l => !knownSet.has(l));

  console.log(`\n📋 Checking ${newLinks.length} discovered links...\n`);

  const linkResults = [];
  for (const link of newLinks) {
    const result = await fetchPage(link);
    linkResults.push(result);

    const icon = result.ok ? "✅" : "❌";
    const statusStr = result.error ? result.error : result.status;
    console.log(`  ${icon} [${statusStr}] ${link} (${result.duration}ms)`);
  }

  // ─── Report ─────────────────────────────────────────────────────

  const allResults = [...results, ...linkResults];
  const passed = allResults.filter(r => r.ok);
  const failed = allResults.filter(r => !r.ok);

  console.log("\n" + "═".repeat(60));
  console.log("📊 RESULTS SUMMARY");
  console.log("═".repeat(60));
  console.log(`  Total pages tested: ${allResults.length}`);
  console.log(`  ✅ Passed: ${passed.length}`);
  console.log(`  ❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\n🚨 FAILURES:");
    for (const f of failed) {
      console.log(`  ❌ [${f.error || f.status}] ${f.path}`);
    }
  }

  // Slow pages (>5s)
  const slow = allResults.filter(r => r.ok && r.duration > 5000);
  if (slow.length > 0) {
    console.log("\n🐌 SLOW PAGES (>5s):");
    for (const s of slow) {
      console.log(`  ⚠️  ${s.path} — ${(s.duration / 1000).toFixed(1)}s`);
    }
  }

  console.log("\n" + "═".repeat(60));

  // Clean up server if we started it
  if (serverProcess) {
    try { process.kill(-serverProcess.pid); } catch {}
  }

  // Exit with error code if failures
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(console.error);
