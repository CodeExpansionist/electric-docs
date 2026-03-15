"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllProducts } from "@/lib/product-data";

/* ---------- Types ---------- */

interface BrandInfo {
  name: string;
  slug: string;
  productCount: number;
  categories: string[];
}

/* ---------- Build brand index (runs once) ---------- */

function buildBrandIndex(): BrandInfo[] {
  const products = getAllProducts();
  const brandMap = new Map<
    string,
    { name: string; count: number; categories: Set<string> }
  >();

  for (const p of products) {
    const brand = (p.brand || "").trim();
    if (!brand) continue;
    const key = brand.toLowerCase();
    const existing = brandMap.get(key);
    if (existing) {
      existing.count++;
      if (p.categorySlug) existing.categories.add(p.categorySlug);
    } else {
      brandMap.set(key, {
        name: brand,
        count: 1,
        categories: new Set(p.categorySlug ? [p.categorySlug] : []),
      });
    }
  }

  return Array.from(brandMap.values())
    .map((b) => ({
      name: b.name,
      slug: b.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
      productCount: b.count,
      categories: Array.from(b.categories),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* ---------- Component ---------- */

export default function BrandsPage() {
  const allBrands = useMemo(() => buildBrandIndex(), []);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Group brands by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, BrandInfo[]> = {};
    for (const letter of LETTERS) {
      groups[letter] = [];
    }
    groups["#"] = [];

    for (const brand of allBrands) {
      const first = brand.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(first)) {
        groups[first].push(brand);
      } else {
        groups["#"].push(brand);
      }
    }
    return groups;
  }, [allBrands]);

  // Which letters actually have brands
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    for (const [letter, brands] of Object.entries(grouped)) {
      if (brands.length > 0) set.add(letter);
    }
    return set;
  }, [grouped]);

  // Filter display
  const displayLetters =
    activeLetter === null
      ? [...LETTERS, "#"]
      : [activeLetter];

  // Build the brand link — use the broadest category the brand has products in
  function getBrandHref(brand: BrandInfo): string {
    // Prefer "televisions/tvs" if the brand has TV products, otherwise first category
    const preferredCategory =
      brand.categories.find((c) => c.includes("tvs")) ||
      brand.categories[0] ||
      "televisions/tvs";
    return `/tv-and-audio/${preferredCategory}/${brand.slug}`;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-text-primary">Brands</span>
        </nav>
      </div>

      {/* Page heading */}
      <div className="container-main pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-2">
          Brands A&ndash;Z
        </h1>
        <p className="text-sm text-text-secondary text-center max-w-xl mx-auto">
          Browse all {allBrands.length} brands available at Electriz. From
          premium audio to the latest in TV technology, find your favourite brand
          below.
        </p>
      </div>

      <div className="container-main pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — letter filter */}
          <aside className="md:w-56 flex-shrink-0">
            <div className="md:sticky md:top-24">
              <h2 className="text-sm font-bold text-text-primary mb-3">
                Filter by letter
              </h2>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  onClick={() => setActiveLetter(null)}
                  className={`w-9 h-9 rounded-md text-xs font-bold transition-colors ${
                    activeLetter === null
                      ? "bg-primary text-white"
                      : "bg-surface text-text-primary hover:bg-primary/10"
                  }`}
                >
                  All
                </button>
                {LETTERS.map((letter) => {
                  const hasItems = availableLetters.has(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => hasItems && setActiveLetter(letter)}
                      disabled={!hasItems}
                      className={`w-9 h-9 rounded-md text-xs font-bold transition-colors ${
                        activeLetter === letter
                          ? "bg-primary text-white"
                          : hasItems
                          ? "bg-surface text-text-primary hover:bg-primary/10"
                          : "bg-surface text-text-secondary/40 cursor-not-allowed"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
                {availableLetters.has("#") && (
                  <button
                    onClick={() => setActiveLetter("#")}
                    className={`w-9 h-9 rounded-md text-xs font-bold transition-colors ${
                      activeLetter === "#"
                        ? "bg-primary text-white"
                        : "bg-surface text-text-primary hover:bg-primary/10"
                    }`}
                  >
                    #
                  </button>
                )}
              </div>

              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-text-secondary">
                  <span className="font-bold text-text-primary">
                    {allBrands.length}
                  </span>{" "}
                  brands across TVs, soundbars, speakers, headphones and audio
                  accessories.
                </p>
              </div>
            </div>
          </aside>

          {/* Main content — brand listing */}
          <main className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary mb-6">
              {activeLetter ? `Brands starting with "${activeLetter}"` : "All brands"}
            </h2>

            {displayLetters.map((letter) => {
              const brands = grouped[letter];
              if (!brands || brands.length === 0) return null;
              return (
                <section key={letter} id={`letter-${letter}`} className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-bold text-primary border-b border-border pb-2 mb-4">
                    {letter}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-1">
                    {brands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={getBrandHref(brand)}
                        className="text-sm text-text-primary no-underline hover:text-primary py-1.5 transition-colors truncate"
                        title={`${brand.name} (${brand.productCount} products)`}
                      >
                        {brand.name}
                        <span className="text-text-secondary text-xs ml-1">
                          ({brand.productCount})
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            {activeLetter && grouped[activeLetter]?.length === 0 && (
              <p className="text-sm text-text-secondary">
                No brands found starting with &ldquo;{activeLetter}&rdquo;.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
