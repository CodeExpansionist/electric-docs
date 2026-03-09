"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CrossSellProduct } from "@/lib/product-data";

interface CrossSellProductsProps {
  products: CrossSellProduct[];
}

function ProductImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src || src.startsWith("http")) {
    return (
      <div className="w-16 h-16 bg-surface rounded flex items-center justify-center flex-shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#999"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 flex-shrink-0 relative">
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        className="object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function StarRatingSmall({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "#E8A317" : "#E0E0E0"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-text-secondary">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function CrossSellProducts({
  products,
}: CrossSellProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-primary mb-4">
        What you&apos;ll need to make it even better
      </h3>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.title} className="border border-border rounded-lg p-4">
            {/* Category header with checkbox */}
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
              <span className="text-xs font-semibold text-text-primary">
                {product.category}
              </span>
            </div>

            {/* Product details */}
            <div className="flex gap-3 ml-6">
              <ProductImage src={product.image} alt={product.title} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary font-medium line-clamp-2 mb-1">
                  {product.title}
                </p>
                {typeof product.rating === "number" && product.rating > 0 && (
                  <div className="flex items-center gap-1 mb-1">
                    <StarRatingSmall rating={product.rating} />
                    {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                      <span className="text-[10px] text-text-secondary">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">
                    £{(product.price ?? 0).toFixed(2)}
                  </span>
                  {typeof product.wasPrice === "number" && product.wasPrice > 0 && (
                    <span className="text-[10px] text-text-muted line-through">
                      £{product.wasPrice.toFixed(2)}
                    </span>
                  )}
                  {typeof product.savings === "number" && product.savings > 0 && (
                    <span className="text-[10px] text-sale font-semibold">
                      Save £{product.savings.toFixed(2)}
                    </span>
                  )}
                </div>
                <Link
                  href="#"
                  className="text-xs text-primary mt-1 inline-block"
                >
                  Select alternative
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
