"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { stripDomain } from "@/lib/constants";

interface PromoBanner {
  imageAlt: string;
  imageUrl: string;
  url: string;
}

interface HubPromoBannersProps {
  banners: PromoBanner[];
}

const VISIBLE = 3;

export default function HubPromoBanners({ banners }: HubPromoBannersProps) {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  if (banners.length === 0) return null;

  // Get visible banners with wrapping
  const visible = [];
  for (let i = 0; i < Math.min(VISIBLE, banners.length); i++) {
    visible.push(banners[(current + i) % banners.length]);
  }

  return (
    <section className="mb-10">
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((banner, i) => (
            <Link
              key={`${current}-${i}`}
              href={stripDomain(banner.url)}
              className="relative rounded-lg overflow-hidden no-underline block aspect-[7/5]"
            >
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.imageAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-700 to-indigo-600 flex items-center justify-center p-6">
                  <p className="text-white text-sm font-bold text-center leading-tight">
                    {banner.imageAlt}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Arrows */}
        {banners.length > VISIBLE && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Previous banners"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Next banners"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
