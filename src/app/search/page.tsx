"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductListCard from "@/components/category/ProductListCard";

interface SearchProduct {
  name: string;
  brand: string;
  price: { current: number; was: number | null; savings: number | null };
  rating: { average: number; count: number };
  url: string;
  imageUrl: string | null;
  productId?: string;
  specs: string[];
  badges: string[];
  offers: string[];
  deliveryFree: boolean;
  energyRating?: string | null;
  category: string;
  categorySlug: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [sortBy, setSortBy] = useState("relevant");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&sort=${sortBy}&page=${page}&limit=20`
      );
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch {
      setResults([]);
      setTotal(0);
    }
    setLoading(false);
  }, [query, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/search?${params.toString()}`);
  };

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

      <h1 className="text-2xl font-bold text-text-primary mb-1">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        {total} {total === 1 ? "result" : "results"} found
      </p>

      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary mt-3">Searching...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          {/* Sort bar */}
          <div className="flex items-center justify-between gap-2 mb-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs text-text-secondary">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-input-border rounded-md px-3 py-1.5 text-xs bg-white"
              >
                <option value="relevant">Most relevant</option>
                <option value="best-sellers">Best sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
            <span className="text-xs text-text-secondary">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total} items
            </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 text-sm border border-border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-sm rounded-md transition-colors ${
                      pageNum === page
                        ? "bg-primary text-white font-bold"
                        : "border border-border hover:bg-surface"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-2 text-sm border border-border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!loading && query && results.length === 0 && (
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
          <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary mt-3">Loading search results...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
