"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { WallBracket, SizeVariant } from "@/lib/product-data";

interface PricePanelProps {
  price: number;
  wasPrice?: number | null;
  savings?: number | null;
  offers: string[];
  sizeVariants?: SizeVariant[];
  energyRating?: string | null;
  wallBracket?: WallBracket;
  onAddToBasket?: () => void;
}

function WallBracketImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="object-contain"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export default function PricePanel({
  price,
  wasPrice,
  savings,
  offers,
  sizeVariants = [],
  energyRating,
  wallBracket,
  onAddToBasket,
}: PricePanelProps) {
  const router = useRouter();
  const [showAllOffers, setShowAllOffers] = useState(false);
  const visibleOffers = showAllOffers ? offers : offers.slice(0, 2);

  return (
    <div>
      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[24px] font-bold text-text-primary leading-8">
            £{price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
          {typeof savings === "number" && savings > 0 && (
            <span className="text-sm text-sale font-bold">
              Save £{savings.toFixed(2)}
            </span>
          )}
        </div>
        {typeof wasPrice === "number" && wasPrice > 0 && (
          <p className="text-sm text-text-muted mt-1 line-through">
            Was £
            {wasPrice.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* Energy rating */}
      {energyRating && (
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#E2001A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {energyRating}
          </span>
          <Link
            href="#"
            className="text-xs text-primary no-underline hover:underline"
          >
            Product fiche
          </Link>
        </div>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <div className="mb-4">
          {visibleOffers.map((offer, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4C12A1"
                strokeWidth="2"
                className="mt-0.5 flex-shrink-0"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-xs text-text-primary">{offer}</span>
            </div>
          ))}
          {offers.length > 2 && !showAllOffers && (
            <button
              onClick={() => setShowAllOffers(true)}
              className="text-xs text-primary hover:underline"
            >
              +{offers.length - 2} more offers
            </button>
          )}
        </div>
      )}

      {/* Size selector */}
      {sizeVariants.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">
            Screen Size:{" "}
            <span>{sizeVariants.find((s) => s.selected)?.size}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((variant) => {
              const isAvailable = Boolean(variant.slug && variant.productId);
              return (
                <button
                  key={variant.size}
                  disabled={!isAvailable && !variant.selected}
                  onClick={() => {
                    if (!variant.selected && isAvailable) {
                      router.push(`/products/${variant.slug}`);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                    variant.selected
                      ? "border-primary border-2 bg-primary/5 text-primary font-semibold"
                      : isAvailable
                        ? "border-border text-text-primary hover:border-primary cursor-pointer"
                        : "border-border/50 text-text-muted cursor-not-allowed opacity-50"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Wall bracket upsell */}
      {wallBracket && (
        <div className="border border-border rounded-[5px] p-4 mb-4">
          <p className="text-xs text-text-primary mb-2">
            {wallBracket.text.split("Save")[0]}
            {wallBracket.product.savings > 0 && (
              <span className="text-sale font-semibold">
                save £{wallBracket.product.savings.toFixed(2)}
              </span>
            )}
          </p>
          <div className="flex items-center gap-3">
            {wallBracket.product.image && (
              <WallBracketImage
                src={wallBracket.product.image}
                alt={wallBracket.product.title}
              />
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold">
                {wallBracket.product.title}
              </p>
              <p className="text-xs">
                <span className="font-bold">
                  £{wallBracket.product.price.toFixed(2)}
                </span>
                {wallBracket.product.separatePrice > 0 && (
                  <span className="text-text-muted line-through ml-1.5">
                    £{wallBracket.product.separatePrice.toFixed(2)}
                  </span>
                )}
              </p>
            </div>
            <Link href="#" className="text-xs text-primary">
              Select alternative
            </Link>
          </div>
        </div>
      )}

      {/* Add to basket */}
      <button
        onClick={onAddToBasket}
        className="btn-primary w-full text-base py-3.5 flex items-center justify-center gap-2"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        Add to basket
      </button>
    </div>
  );
}
