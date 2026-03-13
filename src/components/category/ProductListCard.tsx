"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EnergyRatingBadge from "@/components/ui/EnergyRatingBadge";
import { useSaved } from "@/lib/saved-context";
import { PLACEHOLDER_IMAGE } from "@/lib/images";
import type { Product } from "@/lib/types";

interface ProductListCardProps {
  productId?: string;
  title: string;
  brand?: string;
  image?: string | null;
  price: number;
  wasPrice?: number | null;
  savings?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  specs: string[];
  badges: string[];
  offers: string[];
  deliveryFree: boolean;
  url: string;
  energyRating?: string | null;
  energyLabelUrl?: string | null;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
          return (
            <svg key={star} width="14" height="14" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`star-grad-${star}-${count}`}>
                  <stop offset={`${fill * 100}%`} stopColor="#E8A317" />
                  <stop offset={`${fill * 100}%`} stopColor="#E0E0E0" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={fill === 1 ? "#E8A317" : fill === 0 ? "#E0E0E0" : `url(#star-grad-${star}-${count})`}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-text-secondary font-medium">{rating}/5</span>
      <span className="text-xs text-text-secondary">
        {count.toLocaleString()} reviews
      </span>
    </div>
  );
}

const BADGE_IMAGES: Record<string, { src: string; width: number; height: number }> = {
  "epic deal": { src: "/images/badges/epic-deal.png", width: 146, height: 48 },
  "trade in": { src: "/images/badges/trade-in.png", width: 206, height: 48 },
  "dolby vision atmos": { src: "/images/badges/dolby-vision-atmos.jpg", width: 88, height: 60 },
  "dolby vision": { src: "/images/badges/dolby-vision.jpg", width: 88, height: 60 },
  "dolby atmos": { src: "/images/badges/dolby-vision-atmos.jpg", width: 88, height: 60 },
  "freely tv": { src: "/images/badges/freely-tv.jpg", width: 88, height: 60 },
  "freely tv badge": { src: "/images/badges/freely-tv.jpg", width: 88, height: 60 },
  "what hifi": { src: "/images/badges/what-hifi-5-star.jpg", width: 88, height: 34 },
  "trusted reviews": { src: "/images/badges/trusted-reviews.jpg", width: 60, height: 60 },
  "online only": { src: "/images/badges/online-only.png", width: 164, height: 48 },
};

function getBadgeImage(badge: string): { src: string; width: number; height: number } | null {
  const lower = badge.toLowerCase();
  for (const [key, value] of Object.entries(BADGE_IMAGES)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

function BadgeTag({ badge }: { badge: string }) {
  const img = getBadgeImage(badge);
  if (img) {
    return (
      <Image
        src={img.src}
        alt={badge}
        width={img.width}
        height={img.height}
        className="h-6 w-auto object-contain"
      />
    );
  }
  return (
    <span className="bg-surface text-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded">
      {badge}
    </span>
  );
}

export default function ProductListCard({
  productId,
  title,
  brand,
  image,
  price,
  wasPrice,
  savings,
  rating,
  reviewCount,
  specs,
  badges,
  offers,
  deliveryFree,
  url,
  energyRating,
  energyLabelUrl,
}: ProductListCardProps) {
  const { addSaved, removeSaved, isSaved } = useSaved();
  const saved = productId ? isSaved(productId) : false;
  const [imgSrc, setImgSrc] = useState(image || PLACEHOLDER_IMAGE);

  const handleSaveToggle = () => {
    if (!productId) return;
    if (saved) {
      removeSaved(productId);
    } else {
      addSaved({
        id: productId,
        slug: url.replace(/^\//, ""),
        title,
        brand: brand || "",
        category: "",
        subcategory: "",
        price: { current: price, was: wasPrice ?? undefined, savings: savings ?? undefined },
        images: { main: image || "", gallery: [], thumbnail: "" },
        specs: {},
        keySpecs: specs,
        description: "",
        rating: { average: rating ?? 0, count: reviewCount ?? 0 },
        deliveryInfo: { freeDelivery: deliveryFree, estimatedDate: "" },
        badges: badges,
        tags: [],
        offers: offers.map((o) => ({ text: o })),
        inStock: true,
      } as Product);
    }
  };

  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image zone */}
        <div className="w-full sm:w-[140px] md:w-[160px] flex-shrink-0">
          <Link href={url} className="no-underline">
            <div className="aspect-square bg-white rounded-md flex items-center justify-center overflow-hidden">
              <Image
                src={imgSrc}
                alt={title}
                width={160}
                height={160}
                className="object-contain p-2"
                unoptimized
                onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
              />
            </div>
          </Link>
          {/* Badges below image */}
          {badges.filter((b) => !b.toLowerCase().includes("loved by")).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {badges.filter((b) => !b.toLowerCase().includes("loved by")).map((badge) => (
                <BadgeTag key={badge} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {/* Specs zone */}
        <div className="flex-1 min-w-0">
          <Link href={url} className="no-underline">
            <h3 className="text-base font-bold text-text-primary hover:text-primary transition-colors mb-1.5 leading-snug">
              {title}
            </h3>
          </Link>

          {rating != null && reviewCount != null && (
            <div className="mb-2.5">
              <StarRating rating={rating} count={reviewCount} />
            </div>
          )}

          <ul className="space-y-1.5 mb-3">
            {specs.map((spec, i) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-text-muted mt-0.5 text-sm">•</span>
                <span>{spec}</span>
              </li>
            ))}
          </ul>

          {/* Offers */}
          {offers.length > 0 && (
            <div className="border border-border rounded-md p-2.5 mt-2">
              {offers.map((offer, i) => {
                const parts = offer.split(/(\+\d+ more offers?)/);
                return (
                  <p key={i} className="text-xs text-text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C2D91" strokeWidth="2" className="inline-block mr-1 -mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h4m0 0h4m-4 0V8m0 4v4" />
                    </svg>
                    {parts[0]}
                    {parts[1] && (
                      <span className="text-primary font-medium ml-1">{parts[1]}</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Price + actions zone */}
        <div className="w-full sm:w-[180px] md:w-[190px] flex-shrink-0 flex flex-col">
          <div className="mb-2">
            <span className="text-2xl text-text-primary">
              £{price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
            {savings != null && savings > 0 && (
              <span className="text-sm text-sale font-bold ml-2">
                Save £{savings.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {wasPrice != null && wasPrice > price && (
            <p className="text-xs text-text-muted line-through mb-1">
              Was £{wasPrice.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
          )}

          {/* Energy rating */}
          {energyRating && (
            <div className="flex items-center gap-1.5 mb-2.5 mt-1">
              <EnergyRatingBadge rating={energyRating} labelUrl={energyLabelUrl} />
              <span className="text-[10px] text-text-secondary">Product fiche</span>
            </div>
          )}

          {/* Delivery info */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2.5" className="flex-shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-text-secondary">
                {deliveryFree ? "Delivery available" : "Delivery available"}
              </span>
            </div>
          </div>

          {/* View product button */}
          <Link
            href={url}
            className="btn-outline w-full text-base font-bold text-center no-underline block"
          >
            View product
          </Link>
        </div>
      </div>

      {/* Bottom row: Save for later */}
      <div className="flex items-center justify-end mt-3 pt-3 border-t border-border">
        <button
          onClick={handleSaveToggle}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21C12 21 4 15 4 8.5C4 6 6 4 8.5 4C10 4 11.5 5 12 6C12.5 5 14 4 15.5 4C18 4 20 6 20 8.5C20 15 12 21 12 21Z" />
          </svg>
          {saved ? "Saved" : "Save for later"}
        </button>
      </div>
    </div>
  );
}
