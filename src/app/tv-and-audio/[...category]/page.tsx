"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import FilterSidebar from "@/components/category/FilterSidebar";
import ProductListCard from "@/components/category/ProductListCard";
import { getCategoryData } from "@/lib/category-data";

export default function CategoryListing() {
  const params = useParams();
  const slugSegments = Array.isArray(params.category)
    ? params.category
    : [params.category as string];

  const categoryData = getCategoryData(slugSegments);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState("popular");

  const products = categoryData?.products || [];
  const filters = categoryData?.filters || [];

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Brand filter
    const brandFilters = activeFilters["Brand"] || [];
    if (brandFilters.length > 0) {
      result = result.filter((p) => brandFilters.includes(p.brand));
    }

    // Price filter
    const priceFilters = activeFilters["Price"] || [];
    if (priceFilters.length > 0) {
      result = result.filter((p) => {
        return priceFilters.some((range) => {
          if (range.startsWith("Up to")) {
            const max = parseFloat(range.replace(/[^0-9.]/g, ""));
            return p.price.current <= max;
          }
          if (range.includes("and above") || range.includes("and over")) {
            const min = parseFloat(range.replace(/[^0-9.]/g, ""));
            return p.price.current >= min;
          }
          const parts = range.match(/£([\d,.]+)\s*to\s*£([\d,.]+)/);
          if (parts) {
            const min = parseFloat(parts[1].replace(",", ""));
            const max = parseFloat(parts[2].replace(",", ""));
            return p.price.current >= min && p.price.current <= max;
          }
          return true;
        });
      });
    }

    // Customer Rating filter
    const ratingFilters = activeFilters["Customer Rating"] || [];
    if (ratingFilters.length > 0) {
      const minRating = Math.min(
        ...ratingFilters.map((r) => parseInt(r))
      );
      result = result.filter((p) => p.rating.average >= minRating);
    }

    // Type filter
    const typeFilters = activeFilters["Type"] || [];
    if (typeFilters.length > 0) {
      result = result.filter((p) => {
        const productName = p.name.toLowerCase();
        return typeFilters.some((type) => {
          const typeLower = type.toLowerCase();
          return productName.includes(typeLower) || p.specs.some((s) => s.toLowerCase().includes(typeLower));
        });
      });
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price.current - b.price.current);
        break;
      case "price-desc":
        result.sort((a, b) => b.price.current - a.price.current);
        break;
      case "rating":
        result.sort((a, b) => b.rating.average - a.rating.average);
        break;
      default:
        break;
    }

    return result;
  }, [products, activeFilters, sortBy]);

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
    <div className="container-main py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>&gt;</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={i === 0 ? "/" : "/tv-and-audio"}
                className="hover:text-primary no-underline text-text-secondary"
              >
                {crumb}
              </Link>
            ) : (
              <span className="text-text-primary">{crumb}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Category title */}
      <h1 className="text-2xl font-bold text-text-primary mb-4">{categoryName}</h1>

      {/* Promo banner */}
      {bannerImage && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <Image
            src={bannerImage}
            alt={bannerAlt || categoryName}
            width={1200}
            height={200}
            className="w-full object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Sort bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-input-border rounded-md px-3 py-1.5 text-xs bg-white"
            >
              <option value="popular">Most popular</option>
              <option value="price-asc">Price low - high</option>
              <option value="price-desc">Price high - low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
          <span className="text-xs text-text-secondary hidden sm:inline">
            Show: {filteredProducts.length} of {totalProducts} products
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">{totalProducts} Items</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            <button className="px-3 py-1.5 text-xs bg-primary text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </button>
            <button className="px-3 py-1.5 text-xs bg-white text-text-secondary border-l border-border">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
            onClick={() => setActiveFilters({})}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="hidden md:block">
          <FilterSidebar
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
        </div>

        <div className="flex-1 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-text-secondary mb-2">No products match your filters.</p>
              <button
                onClick={() => setActiveFilters({})}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredProducts.map((product, idx) => (
              <ProductListCard
                key={`${product.url}-${idx}`}
                title={product.name}
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
