"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts, type ProductDetail } from "@/lib/product-data";

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${rating} out of 5 stars, ${count} reviews`}>
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "#E8A317" : "#E0E0E0"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-text-secondary" aria-hidden="true">{rating}</span>
      <span className="text-xs text-primary" aria-hidden="true">
        ({count})
      </span>
    </div>
  );
}

function getTopProducts(viewCounts: Record<string, number>): ProductDetail[] {
  const all = getAllProducts().filter((p) => p.productId);
  const hasViews = Object.keys(viewCounts).length > 0;

  if (hasViews) {
    // Sort by page views descending
    all.sort((a, b) => (viewCounts[b.productId!] || 0) - (viewCounts[a.productId!] || 0));
    // Only include products that have been viewed
    const viewed = all.filter((p) => (viewCounts[p.productId!] || 0) > 0);
    if (viewed.length >= 6) return viewed.slice(0, 6);
    // If fewer than 6 have views, pad with most-reviewed unviewed products
    const unviewed = all.filter((p) => !viewCounts[p.productId!]);
    unviewed.sort((a, b) => b.rating.count - a.rating.count);
    return [...viewed, ...unviewed].slice(0, 6);
  }

  // No views yet — fall back to most-reviewed, 1 per brand for variety
  all.sort((a, b) => b.rating.count - a.rating.count);
  const seen = new Set<string>();
  const result: ProductDetail[] = [];
  for (const p of all) {
    const brand = p.brand.toLowerCase();
    if (seen.has(brand)) continue;
    seen.add(brand);
    result.push(p);
    if (result.length >= 6) break;
  }
  return result;
}

export default function SponsoredProducts() {
  const [products, setProducts] = useState<ProductDetail[]>(() => getTopProducts({}));

  useEffect(() => {
    fetch("/api/track-view")
      .then((res) => res.json())
      .then((views: Record<string, number>) => {
        setProducts(getTopProducts(views));
      })
      .catch(() => {});
  }, []);

  return (
    <section aria-labelledby="sponsored-products-heading" className="py-8">
      <div className="container-main">
        <h2 id="sponsored-products-heading" className="text-xs uppercase tracking-wider text-text-muted mb-4 font-semibold">Sponsored products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product) => (
            <Link
              key={product.productId}
              href={product.url}
              className="card p-3 flex flex-col no-underline group"
            >
              {/* Product image */}
              <div className="bg-white border border-border rounded-md mb-3 aspect-square flex items-center justify-center overflow-hidden">
                <Image
                  src={`/images/products/${product.productId}/main.webp`}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="object-contain p-2"
                />
              </div>

              {/* Rating */}
              {product.rating.average > 0 && product.rating.count > 0 && (
                <StarRating rating={product.rating.average} count={product.rating.count} />
              )}

              {/* Title */}
              <h3 className="text-xs text-text-primary font-normal mt-1.5 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {product.name}
              </h3>

              {/* Price */}
              <div className="mt-auto">
                <span className="text-lg font-bold text-text-primary">
                  £{product.price.current.toFixed(2)}
                </span>
                {product.price.was && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted line-through">
                      £{product.price.was.toFixed(2)}
                    </span>
                    {product.price.savings && (
                      <span className="text-xs text-sale font-semibold">
                        Save £{product.price.savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
