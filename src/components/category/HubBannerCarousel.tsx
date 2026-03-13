"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { stripDomain } from "@/lib/constants";
import type { HubBanner } from "@/lib/category-data";

interface HubBannerCarouselProps {
  banners: HubBanner[];
}

const fallbackGradients = [
  "from-purple-900 via-purple-700 to-indigo-600",
  "from-blue-900 via-blue-700 to-cyan-600",
  "from-teal-800 via-teal-600 to-emerald-500",
  "from-rose-900 via-rose-700 to-pink-500",
  "from-amber-800 via-orange-600 to-yellow-500",
];

export default function HubBannerCarousel({ banners }: HubBannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div
      className="relative mb-6 rounded-lg overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Banner slide */}
      <div
        className={`relative w-full aspect-[16/9] md:aspect-[6/1] ${!banner.backgroundColor ? `bg-gradient-to-r ${fallbackGradients[current % fallbackGradients.length]}` : ""}`}
        style={banner.backgroundColor ? { backgroundColor: banner.backgroundColor } : undefined}
      >
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt={banner.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white text-lg md:text-2xl font-bold max-w-2xl leading-tight drop-shadow-lg mb-4">
            {banner.imageAlt}
          </p>
          <div className="flex gap-3">
            {banner.buttons.map((btn, i) => (
              <Link
                key={i}
                href={stripDomain(btn.url)}
                className={`no-underline text-sm font-semibold px-5 py-2 rounded-full transition-colors ${
                  i === 0
                    ? "bg-white text-purple-900 hover:bg-gray-100"
                    : "border-2 border-white text-white hover:bg-white/20"
                }`}
              >
                {btn.text}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Previous banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            aria-label="Next banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
