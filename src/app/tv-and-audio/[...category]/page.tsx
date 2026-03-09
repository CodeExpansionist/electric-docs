"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import FilterSidebar from "@/components/category/FilterSidebar";
import ProductListCard from "@/components/category/ProductListCard";
import CategoryHub from "@/components/category/CategoryHub";
import { getCategoryData, isHubCategory, getCategoryHubData } from "@/lib/category-data";

export default function CategoryPage() {
  const params = useParams();
  const slugSegments = Array.isArray(params.category)
    ? params.category
    : [params.category as string];

  // Check if this is a hub (parent) category
  if (isHubCategory(slugSegments)) {
    const hubData = getCategoryHubData(slugSegments);
    if (hubData) {
      return <CategoryHub data={hubData} />;
    }
  }

  // Otherwise render listing
  return <CategoryListingInner />;
}

function CategoryListingInner() {
  const params = useParams();
  const slugSegments = Array.isArray(params.category)
    ? params.category
    : [params.category as string];

  const categoryData = getCategoryData(slugSegments);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const products = categoryData?.products || [];
  const filters = categoryData?.filters || [];

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    Object.entries(activeFilters).forEach(([group, values]) => {
      if (values.length === 0) return;
      // Skip non-product filters
      if (group === "_hideOutOfStock" || group === "Hide out of stock" || group === "Availability") return;

      // Brand — case-insensitive match (filter labels are title case, product data is uppercase)
      if (group === "Brand") {
        const lowerVals = values.map((v) => v.toLowerCase());
        result = result.filter((p) => lowerVals.includes(p.brand.toLowerCase()));
        return;
      }

      // Price — range parsing
      if (group === "Price") {
        result = result.filter((p) =>
          values.some((range) => {
            if (range.startsWith("Up to")) {
              const max = parseFloat(range.replace(/[^0-9.]/g, ""));
              return p.price.current <= max;
            }
            if (range.includes("and above") || range.includes("and over")) {
              const min = parseFloat(range.replace(/[^0-9.]/g, ""));
              return p.price.current >= min;
            }
            const parts = range.match(/£([\d,.]+)\s*(?:to|-)\s*£([\d,.]+)/);
            if (parts) {
              const min = parseFloat(parts[1].replace(",", ""));
              const max = parseFloat(parts[2].replace(",", ""));
              return p.price.current >= min && p.price.current <= max;
            }
            return true;
          })
        );
        return;
      }

      // Customer Rating — minimum threshold
      if (group === "Customer Rating") {
        const minRating = Math.min(...values.map((r) => parseInt(r)));
        result = result.filter((p) => p.rating.average >= minRating);
        return;
      }

      // Screen Size — extract inches from product name, check against range
      if (group === "Screen Size") {
        result = result.filter((p) => {
          // Match standalone screen size: number followed by " or space, excluding model numbers
          const sizeMatches = Array.from(p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g));
          const size = sizeMatches.map((m) => parseInt(m[1])).find((n) => n >= 20 && n <= 120);
          if (!size) return false;
          return values.some((range) => {
            if (range.includes("or more")) {
              const min = parseInt(range.match(/(\d+)/)?.[1] || "0");
              return size >= min;
            }
            const rangeParts = range.match(/(\d+)[\s"]*\s*[-–]\s*(\d+)/);
            if (rangeParts) {
              return size >= parseInt(rangeParts[1]) && size <= parseInt(rangeParts[2]);
            }
            return false;
          });
        });
        return;
      }

      // Screen technology — word-boundary matching to distinguish LED/OLED/QLED
      if (group === "Screen technology" || group === "TV Technology") {
        result = result.filter((p) => {
          const name = p.name;
          return values.some((tech) => {
            if (tech === "LED") {
              return /\bLED\b/.test(name) && !/(OLED|QLED|Mini\s*LED)/i.test(name);
            }
            if (tech === "QLED") {
              return /QLED/i.test(name) && !/Neo\s*QLED/i.test(name);
            }
            if (tech === "Mini LED") {
              return /Mini\s*LED|Miniled/i.test(name);
            }
            return name.toLowerCase().includes(tech.toLowerCase());
          });
        });
        return;
      }

      // Resolution — normalize partial matches (e.g. "4K Ultra HD" matches "4K")
      if (group === "Resolution") {
        result = result.filter((p) => {
          const name = p.name.toLowerCase();
          return values.some((res) => {
            if (res.includes("4K")) return name.includes("4k");
            if (res.includes("Full HD") || res.includes("1080")) return name.includes("full hd") || name.includes("1080");
            if (res.includes("HD Ready")) return name.includes("hd ready") || name.includes("720");
            return name.includes(res.toLowerCase());
          });
        });
        return;
      }

      // Refresh rate — extract Hz value from specs
      if (group === "Refresh rate" || group === "Refresh Rate") {
        result = result.filter((p) => {
          const text = p.specs.join(" ") + " " + p.name;
          return values.some((rate) => {
            const hzMatch = rate.match(/(\d+)\s*Hz/i);
            if (!hzMatch) return false;
            const hz = hzMatch[1];
            return text.includes(hz + " Hz") || text.includes(hz + "Hz");
          });
        });
        return;
      }

      // Number of HDMI Ports — parse "HDMI x N" from specs
      if (group === "Number of HDMI Ports") {
        result = result.filter((p) => {
          const specsText = p.specs.join(" ");
          const hdmiMatch = specsText.match(/HDMI\s*\d*\.?\d*\s*x\s*(\d)/i);
          if (!hdmiMatch) return false;
          const count = parseInt(hdmiMatch[1]);
          return values.some((v) => {
            const fc = parseInt(v.match(/(\d)/)?.[1] || "0");
            return count === fc;
          });
        });
        return;
      }

      // Year — match year string in product name
      if (group === "Year" || group === "Year of Release") {
        result = result.filter((p) => values.some((year) => p.name.includes(year)));
        return;
      }

      // Smart platform — match in name + specs
      if (group === "Smart platform" || group === "Smart TV Platform") {
        result = result.filter((p) => {
          const text = (p.name + " " + p.specs.join(" ")).toLowerCase();
          return values.some((platform) => text.includes(platform.toLowerCase()));
        });
        return;
      }

      // Energy rating — match exact rating letter from product data
      if (group === "Energy rating") {
        result = result.filter((p) => {
          if (!p.energyRating) return false;
          return values.some((val) => p.energyRating!.toUpperCase() === val.toUpperCase());
        });
        return;
      }

      // Loved by Electriz — check badges array
      if (group === "Loved by Electriz") {
        result = result.filter((p) =>
          p.badges.some((b) => b.toLowerCase().includes("loved by"))
        );
        return;
      }

      // Popular screen sizes — range matching for wall brackets
      if (group === "Popular screen sizes") {
        result = result.filter((p) => {
          const sizeMatches = Array.from(p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g));
          const size = sizeMatches.map((m) => parseInt(m[1])).find((n) => n >= 20 && n <= 120);
          if (!size) return false;
          return values.some((range) => {
            if (range.includes("or more") || range.includes("and above")) {
              const min = parseInt(range.match(/(\d+)/)?.[1] || "0");
              return size >= min;
            }
            const rangeParts = range.match(/(\d+)[\s"]*\s*[-–]\s*(\d+)/);
            if (rangeParts) return size >= parseInt(rangeParts[1]) && size <= parseInt(rangeParts[2]);
            const exact = parseInt(range.match(/(\d+)/)?.[1] || "0");
            if (exact) return size === exact;
            return false;
          });
        });
        return;
      }

      // Guarantee — match in specs text
      if (group === "Guarantee") {
        result = result.filter((p) => {
          const specsText = p.specs.join(" ").toLowerCase();
          return values.some((val) => specsText.includes(val.toLowerCase()));
        });
        return;
      }

      // Generic text filter — covers Type, Colour, Connections, Design, Features,
      // Voice control, Sound enhancement, Tuner, Gaming, VESA, etc.
      result = result.filter((p) => {
        const searchText = (p.name + " " + p.specs.join(" ") + " " + p.badges.join(" ")).toLowerCase();
        return values.some((val) => searchText.includes(val.toLowerCase()));
      });
    });

    // Sort — always push zero-price products to the bottom
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => {
          if (a.price.current === 0 && b.price.current > 0) return 1;
          if (b.price.current === 0 && a.price.current > 0) return -1;
          return a.price.current - b.price.current;
        });
        break;
      case "price-desc":
        result.sort((a, b) => {
          if (a.price.current === 0 && b.price.current > 0) return 1;
          if (b.price.current === 0 && a.price.current > 0) return -1;
          return b.price.current - a.price.current;
        });
        break;
      case "rating":
        result.sort((a, b) => b.rating.average - a.rating.average);
        break;
      default:
        // Default "popular" — products with data first
        result.sort((a, b) => {
          const aHasData = a.price.current > 0 ? 1 : 0;
          const bHasData = b.price.current > 0 ? 1 : 0;
          return bHasData - aHasData;
        });
        break;
    }

    return result;
  }, [products, activeFilters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const safePage = Math.min(page, totalPages || 1);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * perPage, safePage * perPage);

  if (!categoryData) {
    return (
      <div className="container-main py-12 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Category not found</h1>
        <p className="text-sm text-text-secondary mb-6">
          We couldn&apos;t find the category you&apos;re looking for.
        </p>
        <Link href="/tv-and-audio" className="btn-primary">
          Back to TV &amp; Audio
        </Link>
      </div>
    );
  }

  const { categoryName, breadcrumbs, totalProducts, bannerImage, bannerAlt } = categoryData;

  return (
    <div className="bg-surface min-h-screen">
    {/* White breadcrumb strip */}
    <div className="bg-white border-b border-border">
      <div className="container-main py-2">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>&gt;</span>}
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="hover:text-primary no-underline text-text-secondary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-primary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>

    <div className="container-main py-4">
      {/* Category title */}
      <h1 className="text-2xl font-bold text-text-primary mb-4">{categoryName}</h1>

      {/* Promo banner */}
      {bannerImage && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <Image
            src={bannerImage}
            alt={bannerAlt || categoryName}
            width={1566}
            height={110}
            className="w-full h-auto"
            unoptimized
          />
        </div>
      )}

      {/* Active filters */}
      {Object.entries(activeFilters).some(([key, vals]) => key !== "_hideOutOfStock" && vals.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([group, values]) =>
            group !== "_hideOutOfStock" &&
            values.map((val) => (
              <button
                key={`${group}-${val}`}
                onClick={() => {
                  setActiveFilters((prev) => ({
                    ...prev,
                    [group]: prev[group].filter((v) => v !== val),
                  }));
                  setPage(1);
                }}
                className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full"
              >
                {val}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            ))
          )}
          <button
            onClick={() => { setActiveFilters({}); setPage(1); }}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-[240px] flex-shrink-0 sticky top-4 max-h-[calc(100vh-1rem)] overflow-y-auto">
          <FilterSidebar
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={(f) => { setActiveFilters(f); setPage(1); }}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          {/* Sort bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 border-b border-border">
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="border border-input-border rounded px-3 py-2 text-sm bg-white h-10"
              >
                <option value="popular">Sort By: Most popular</option>
                <option value="price-asc">Sort By: Price low - high</option>
                <option value="price-desc">Sort By: Price high - low</option>
                <option value="rating">Sort By: Customer rating</option>
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  className="border border-input-border rounded px-3 py-2 text-sm bg-white h-10"
                >
                  <option value={20}>Show: 20</option>
                  <option value={40}>Show: 40</option>
                  <option value={60}>Show: 60</option>
                </select>
                <span className="text-sm text-text-secondary hidden sm:inline">products per page</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-sm text-text-secondary">{totalProducts} Items</span>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-text-secondary mb-2">No products match your filters.</p>
              <button
                onClick={() => { setActiveFilters({}); setPage(1); }}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {paginatedProducts.map((product, idx) => (
                <ProductListCard
                  key={`${product.url}-${idx}`}
                  productId={product.productId}
                  title={product.name}
                  brand={product.brand}
                  image={product.imageUrl}
                  price={product.price.current}
                  wasPrice={product.price.was}
                  savings={product.price.savings}
                  rating={product.rating.average}
                  reviewCount={product.rating.count}
                  specs={product.specs}
                  badges={product.badges}
                  offers={product.offers}
                  deliveryFree={product.deliveryFree}
                  url={product.url}
                  energyRating={product.energyRating}
                  energyLabelUrl={product.energyLabelUrl}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="px-3 py-1.5 text-xs border border-border rounded-md disabled:opacity-40 hover:bg-surface"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                    .reduce<number[]>((acc, p) => {
                      if (acc.length > 0 && p - acc[acc.length - 1] > 1) acc.push(-1);
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === -1 ? (
                        <span key={`gap-${i}`} className="text-xs text-text-secondary px-1">...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-xs rounded-md ${
                            p === safePage
                              ? "bg-primary text-white"
                              : "border border-border hover:bg-surface"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="px-3 py-1.5 text-xs border border-border rounded-md disabled:opacity-40 hover:bg-surface"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
