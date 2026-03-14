"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WallBracket, SizeVariant } from "@/lib/product-data";
import EnergyRatingBadge from "@/components/ui/EnergyRatingBadge";

interface PricePanelProps {
  price: number;
  wasPrice?: number | null;
  savings?: number | null;
  offers: string[];
  sizeVariants?: SizeVariant[];
  energyRating?: string | null;
  energyLabelUrl?: string | null;
  wallBracket?: WallBracket;
  onAddToBasket?: () => void;
}

function AddToBasketButton({ onAddToBasket }: { onAddToBasket?: () => void }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    onAddToBasket?.();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-lg py-3.5 flex items-center justify-center gap-2 rounded-lg font-bold transition-colors ${
        added
          ? "bg-green-600 text-white"
          : "btn-primary"
      }`}
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
          Add to basket
        </>
      )}
    </button>
  );
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
  energyLabelUrl,
  wallBracket,
  onAddToBasket,
}: PricePanelProps) {
  const [showAllOffers, setShowAllOffers] = useState(false);
  const visibleOffers = showAllOffers ? offers : offers.slice(0, 2);

  return (
    <div>
      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-text-primary leading-8">
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
          <EnergyRatingBadge rating={energyRating} labelUrl={energyLabelUrl} />
          <Link
            href={energyLabelUrl || "#"}
            target={energyLabelUrl ? "_blank" : undefined}
            rel={energyLabelUrl ? "noopener noreferrer" : undefined}
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

      {/* Size selector — circular TV-icon selectors (Currys parity) */}
      {sizeVariants.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">
            Screen Size:{" "}
            <span>{sizeVariants.find((s) => s.selected)?.size}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {sizeVariants.map((variant) => {
              const isAvailable = variant.available ?? Boolean(variant.slug && variant.productId);
              const isSelected = variant.selected;

              const circle = (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-[3px] border-primary bg-light-purple"
                        : isAvailable
                          ? "border border-border bg-white hover:border-primary"
                          : "border border-border/50 bg-white opacity-50"
                    }`}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isSelected ? "#4C12A1" : isAvailable ? "#213038" : "#696969"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="13" rx="1.5" />
                      <line x1="12" y1="16" x2="12" y2="19" />
                      <line x1="8" y1="19" x2="16" y2="19" />
                    </svg>
                  </div>
                  <span
                    className={`text-[13px] ${
                      isSelected
                        ? "font-semibold text-primary"
                        : isAvailable
                          ? "text-text-primary"
                          : "text-text-muted"
                    }`}
                  >
                    {variant.size}
                  </span>
                </div>
              );

              if (isSelected) {
                return (
                  <span key={variant.size} aria-current="true">
                    {circle}
                  </span>
                );
              }

              if (!isAvailable) {
                return (
                  <span key={variant.size} className="cursor-not-allowed" aria-disabled="true">
                    {circle}
                  </span>
                );
              }

              return (
                <Link
                  key={variant.size}
                  href={`/products/${variant.slug}`}
                  className="no-underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
                >
                  {circle}
                </Link>
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
            <div className="flex-1 min-w-0">
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
      <AddToBasketButton onAddToBasket={onAddToBasket} />
    </div>
  );
}
