"use client";

import Image from "next/image";
import { useState } from "react";
import type { CrossSellProduct, BundleDeal } from "@/lib/product-data";
import { useBasket } from "@/lib/basket-context";

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
      <div className="w-20 h-20 flex-shrink-0 bg-surface rounded flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 flex-shrink-0 relative">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function StarRatingSmall({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? "#E8A317" : "#E0E0E0"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-[#213038]">{rating.toFixed(1)}/5</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-xs text-[#213038]">{count} reviews</span>
      )}
    </div>
  );
}

export default function BuyTogetherBundle({
  currentProduct,
  bundleProducts,
  bundleDeal,
}: BuyTogetherBundleProps) {
  const { addItem } = useBasket();
  const [added, setAdded] = useState(false);

  if (bundleProducts.length === 0) return null;

  const bundleTotal = bundleDeal?.totalPrice ??
    (currentProduct.price + bundleProducts.reduce((sum, p) => sum + p.price, 0));
  const totalSavings = bundleDeal?.savings ??
    (currentProduct.price + bundleProducts.reduce((sum, p) => sum + (p.wasPrice || p.price), 0) - bundleTotal);
  const separateTotal = bundleTotal + totalSavings;
  const bundleSave = totalSavings > 0 ? totalSavings : (separateTotal - bundleTotal);

  const handleAddBundle = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-surface py-8 -mx-4 px-4 md:-mx-6 md:px-6 mb-6">
      <div className="max-w-container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#213038]">
            Buy together and save
          </h3>
          <button className="flex items-center gap-2 text-sm text-[#213038] hover:underline">
            <span className="w-7 h-7 rounded-full border-2 border-[#e5006d] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e5006d" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            See all bundles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Cards row */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {/* Current product card */}
          <div className="bg-white rounded-lg p-4 flex-1 min-w-0">
            <div className="flex gap-4">
              <BundleImage src={currentProduct.image} alt={currentProduct.title} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted mb-1">Currently viewing</p>
                <p className="text-sm text-[#213038] font-medium line-clamp-2 mb-1.5">
                  {currentProduct.title}
                </p>
                <p className="text-base font-bold text-[#213038]">
                  £{currentProduct.price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Plus icon between cards */}
          <div className="flex items-center justify-center px-3 py-2 lg:py-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>

          {/* Add-on products card */}
          <div className="bg-white rounded-lg p-4 flex-1 min-w-0">
            <div className="space-y-3">
              {bundleProducts.slice(0, 2).map((product, i) => (
                <div key={product.title} className={`flex gap-4 ${i > 0 ? "pt-3 border-t border-border" : ""}`}>
                  <BundleImage src={product.image} alt={product.title} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#213038] font-medium line-clamp-2 mb-1">
                      {product.title}
                    </p>
                    {typeof product.rating === "number" && product.rating > 0 && (
                      <div className="mb-1">
                        <StarRatingSmall rating={product.rating} count={product.reviewCount} />
                      </div>
                    )}
                    <p className="text-base font-bold text-[#213038]">
                      £{(product.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 gap-4">
          <div>
            <div className="flex items-baseline gap-6">
              <span className="text-base font-bold text-[#213038]">Total:</span>
              <span className="text-xl font-bold text-[#213038]">
                £{bundleTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-baseline gap-6 mt-0.5">
              <span className="text-sm text-[#213038]">Buy together &amp; save</span>
              <span className="text-sm font-bold text-[#213038]">
                £{bundleSave.toFixed(2)}
              </span>
            </div>
            {totalSavings > 0 && (
              <p className="text-sm text-[#e5006d] font-bold mt-0.5">
                Total saving: £{totalSavings.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-text-muted mt-0.5">
              Separate selling price £{separateTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={handleAddBundle}
            className={`btn-outline text-base font-bold px-6 py-3 flex items-center gap-2 ${added ? "bg-green-600 text-white border-green-600" : ""}`}
          >
            {added ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Add bundle to basket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
