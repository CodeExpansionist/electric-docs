"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductListCard from "@/components/category/ProductListCard";
import { searchProducts } from "@/lib/search-data";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("popular");

  const results = useMemo(() => {
    const found = searchProducts(query);
    switch (sortBy) {
      case "price-asc":
        return [...found].sort((a, b) => a.price.current - b.price.current);
      case "price-desc":
        return [...found].sort((a, b) => b.price.current - a.price.current);
      case "rating":
        return [...found].sort((a, b) => b.rating.average - a.rating.average);
      default:
        return found;
    }
  }, [query, sortBy]);

  return (
    <div className="container-main py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        <Link href="/" className="hover:text-primary no-underline text-text-secondary">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-text-primary">Search results</span>
      </nav>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        {results.length} {results.length === 1 ? "result" : "results"} found
      </p>

      {results.length > 0 && (
        <>
          {/* Sort bar */}
          <div className="flex items-center justify-between gap-2 mb-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-input-border rounded-md px-3 py-1.5 text-xs bg-white"
              >
                <option value="popular">Most relevant</option>
                <option value="price-asc">Price low - high</option>
                <option value="price-desc">Price high - low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
            <span className="text-xs text-text-secondary">{results.length} Items</span>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {results.map((product, idx) => (
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
            ))}
          </div>
        </>
      )}

      {query && results.length === 0 && (
        <div className="card p-8 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CDD8DF"
            strokeWidth="1.5"
            className="mx-auto mb-4"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-text-primary font-semibold mb-2">
            No results found for &quot;{query}&quot;
          </p>
          <p className="text-xs text-text-secondary mb-4">
            Try checking your spelling or using different keywords.
          </p>
          <Link href="/tv-and-audio" className="text-sm text-primary hover:underline">
            Browse TV &amp; Audio
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-12 text-center">
          <p className="text-sm text-text-secondary">Loading search results...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
