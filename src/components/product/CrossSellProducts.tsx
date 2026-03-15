"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import type { CrossSellProduct } from "@/lib/product-data";
import { useBasket } from "@/lib/basket-context";
import type { Product } from "@/lib/types";

interface CrossSellProductsProps {
  products: CrossSellProduct[];
}

/** Convert a CrossSellProduct to a basket-compatible Product. */
function toBasketProduct(cp: CrossSellProduct): Product {
  const id = `cross-sell-${cp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  return {
    id,
    slug: id,
    title: cp.title,
    brand: "",
    category: cp.category,
    subcategory: "",
    price: {
      current: cp.price,
      was: cp.wasPrice ?? undefined,
      savings: cp.savings ?? undefined,
    },
    images: {
      main: cp.image || "",
      gallery: [],
      thumbnail: cp.image || "",
    },
    rating: {
      average: cp.rating ?? 0,
      count: cp.reviewCount ?? 0,
    },
    specs: {},
    keySpecs: [],
    description: "",
    deliveryInfo: { freeDelivery: false, estimatedDate: "" },
    badges: cp.badge ? [cp.badge] : [],
    tags: [],
    offers: [],
    inStock: true,
  };
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
            width="13"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "#E8A317" : "#E0E0E0"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-[#e5006d] font-normal">
        {rating.toFixed(1)}/5
      </span>
    </div>
  );
}

export default function CrossSellProducts({
  products,
}: CrossSellProductsProps) {
  const { basket, addItem, removeItem } = useBasket();

  // Determine which cross-sell products are currently in the basket
  const isInBasket = useCallback(
    (cp: CrossSellProduct) => {
      const id = toBasketProduct(cp).id;
      return basket.items.some((item) => item.product.id === id);
    },
    [basket.items]
  );

  const handleToggle = useCallback(
    (cp: CrossSellProduct) => {
      const bp = toBasketProduct(cp);
      if (basket.items.some((item) => item.product.id === bp.id)) {
        removeItem(bp.id);
      } else {
        addItem(bp);
      }
    },
    [basket.items, addItem, removeItem]
  );

  if (products.length === 0) return null;

  return (
    <div className="mb-2">
      <h3 className="text-[20px] font-normal text-primary text-center mb-4 leading-[22px]">
        What you&apos;ll need to make it{" "}
        <span className="text-[#e5006d]">even better</span>
      </h3>
      <div className="space-y-4">
        {products.map((product) => {
          const checked = isInBasket(product);
          return (
            <div key={product.title} className="bg-white rounded-lg p-4">
              {/* Category header with checkbox */}
              <div
                className="flex items-center gap-2 mb-3 cursor-pointer select-none"
                onClick={() => handleToggle(product)}
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    handleToggle(product);
                  }
                }}
              >
                <div
                  className={`w-6 h-6 flex-shrink-0 border rounded-[6px] flex items-center justify-center transition-colors ${
                    checked
                      ? "bg-[#7B2D8E] border-[#7B2D8E]"
                      : "bg-white border-[#56707a]"
                  }`}
                >
                  {checked && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-normal text-[#213038]">
                  {product.category}
                </span>
              </div>

              {/* Product details */}
              <div className="flex gap-3 ml-8">
                <ProductImage src={product.image} alt={product.title} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#213038] font-normal line-clamp-2 mb-1">
                    {product.title}
                  </p>
                  {typeof product.rating === "number" && product.rating > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <StarRatingSmall rating={product.rating} />
                      {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                        <span className="text-xs text-[#213038]">
                          {product.reviewCount} reviews
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#213038]">
                      £{(product.price ?? 0).toFixed(2)}
                    </span>
                    {typeof product.wasPrice === "number" && product.wasPrice > 0 && (
                      <span className="text-xs text-text-muted line-through">
                        £{product.wasPrice.toFixed(2)}
                      </span>
                    )}
                    {typeof product.savings === "number" && product.savings > 0 && (
                      <span className="text-xs text-sale font-semibold">
                        Save £{product.savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button className="text-xs text-[#222] underline mt-1">
                    Select alternative
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
