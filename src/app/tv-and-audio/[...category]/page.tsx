"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import FilterSidebar from "@/components/category/FilterSidebar";
import ProductListCard from "@/components/category/ProductListCard";
import CategoryHub from "@/components/category/CategoryHub";
import { getCategoryData, isHubCategory, getCategoryHubData } from "@/lib/category-data";
import { filterProducts, recalculateFilterCounts } from "@/lib/filter-utils";

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
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    categoryData?.preSelectedFilters || {}
  );
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Use unfiltered parent data when available (brand/size-filtered pages),
  // so unchecking a pre-selected filter restores the full product set
  const filters = categoryData?.unfilteredFilters ?? categoryData?.filters ?? [];
  const allProducts = categoryData?.unfilteredProducts ?? categoryData?.products ?? [];

  // Filter products based on active filters — uses shared logic from filter-utils.ts
  const filteredProducts = useMemo(() => {
    const result = filterProducts(allProducts, activeFilters);

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
  }, [allProducts, activeFilters, sortBy]);

  // Recalculate filter counts using cross-count pattern
  const dynamicFilters = useMemo(() => {
    return recalculateFilterCounts(filters, allProducts, activeFilters);
  }, [filters, allProducts, activeFilters]);

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

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block w-[240px] flex-shrink-0 sticky top-4 max-h-[calc(100vh-1rem)] overflow-y-auto">
          <FilterSidebar
            filters={dynamicFilters}
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
            <span className="text-sm text-text-secondary">{filteredProducts.length} Items</span>
          </div>

          {/* Active filter chips */}
          {Object.entries(activeFilters).some(([key, vals]) => key !== "_hideOutOfStock" && vals.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 mb-4">
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
                    className="flex items-center gap-1.5 bg-white border border-border text-text-primary text-sm px-3 py-1 rounded-full hover:border-primary"
                  >
                    {val}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                ))
              )}
              <button
                onClick={() => { setActiveFilters({}); setPage(1); }}
                className="ml-auto text-sm text-primary hover:underline whitespace-nowrap"
              >
                Clear all
              </button>
            </div>
          )}

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
