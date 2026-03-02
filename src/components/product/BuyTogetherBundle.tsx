"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CrossSellProduct, BundleDeal } from "@/lib/product-data";

interface BuyTogetherBundleProps {
  currentProduct: {
    title: string;
    price: number;
    image: string | null;
  };
  bundleProducts: CrossSellProduct[];
  bundleDeal?: BundleDeal;
}

function BundleImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="w-full aspect-square bg-surface rounded flex items-center justify-center">
        <svg
          width="32"
          height="32"
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
    <div className="relative aspect-square bg-white">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function BuyTogetherBundle({
  currentProduct,
  bundleProducts,
  bundleDeal,
}: BuyTogetherBundleProps) {
  if (bundleProducts.length === 0) return null;

  // Use bundleDeal data if available (more accurate), otherwise calculate from products
  const bundleTotal = bundleDeal?.totalPrice ??
    (currentProduct.price + bundleProducts.reduce((sum, p) => sum + p.price, 0));
  const totalSavings = bundleDeal?.savings ??
    (currentProduct.price + bundleProducts.reduce((sum, p) => sum + (p.wasPrice || p.price), 0) - bundleTotal);
  const separateTotal = bundleTotal + totalSavings;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">
          Buy together and save
        </h3>
        <Link
          href="#"
          className="text-xs text-sale font-semibold flex items-center gap-1"
        >
          See all bundles
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* Bundle products grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Current product */}
        <div className="border border-primary rounded-lg p-2 relative">
          <span className="absolute top-1 left-1 text-[9px] bg-surface text-text-secondary px-1 rounded">
            Currently viewing
          </span>
          <BundleImage src={currentProduct.image} alt={currentProduct.title} />
          <p className="text-[10px] text-text-primary line-clamp-2 mt-1 font-medium">
            {currentProduct.title}
          </p>
        </div>

        {/* Bundle products */}
        {bundleProducts.slice(0, 2).map((product, i) => (
          <div key={i} className="border border-border rounded-lg p-2">
            <BundleImage src={product.image} alt={product.title} />
            <p className="text-[10px] text-text-primary line-clamp-2 mt-1">
              {product.title}
            </p>
            {typeof product.rating === "number" && product.rating > 0 && (
              <div className="flex items-center gap-0.5 mt-0.5">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="#E8A317"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-[9px] text-text-secondary">
                  {product.rating.toFixed(1)}
                </span>
                {typeof product.reviewCount === "number" && product.reviewCount > 0 && (
                  <span className="text-[9px] text-text-secondary">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}
            <p className="text-xs font-bold mt-1">
              £{product.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Bundle total */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs text-text-secondary">Total:</span>
            <span className="text-lg font-bold text-text-primary">
              £{bundleTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-secondary">
              Buy together &amp; save
            </span>
            <span className="font-bold text-text-primary">
              £{separateTotal.toFixed(2)}
            </span>
          </div>
          {totalSavings > 0 && (
            <p className="text-xs text-sale font-semibold mt-0.5">
              Total savings: £{totalSavings.toFixed(2)}
            </p>
          )}
          <p className="text-[10px] text-text-muted mt-0.5">
            Separate selling price £{separateTotal.toFixed(2)}
          </p>
        </div>
        <button className="btn-outline text-sm px-5 py-2.5">
          Add bundle to basket
        </button>
      </div>
    </div>
  );
}
