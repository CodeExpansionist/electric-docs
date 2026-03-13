"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { stripDomain } from "@/lib/constants";
import type { BrandCarouselItem } from "@/lib/category-data";

interface HubBrandCarouselProps {
  brands: BrandCarouselItem[];
  heading?: string;
}

export default function HubBrandCarousel({ brands, heading }: HubBrandCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 520; // ~3 cards
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-8">
      {heading && <h2 className="text-lg font-bold text-text-primary mb-4">{heading}</h2>}

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-border shadow-sm hover:shadow-md flex items-center justify-center transition-shadow"
          aria-label="Scroll left"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Scrollable brand cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {brands.map((brand) => (
            <div
              key={brand.brand}
              className="flex-shrink-0 w-[160px] border border-border rounded-lg bg-white p-4 flex flex-col items-center gap-3"
              style={{ scrollSnapAlign: "start" }}
            >
              <Link href={stripDomain(brand.url)} className="block w-full">
                <div className="w-full h-[60px] flex items-center justify-center">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.brand}
                    width={120}
                    height={48}
                    className="object-contain max-h-[48px]"
                    unoptimized
                  />
                </div>
              </Link>
              <div className="flex flex-col gap-1.5 w-full">
                {brand.subcategoryLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={stripDomain(link.url)}
                    className="flex items-center justify-between text-[11px] text-text-secondary hover:text-primary no-underline px-2 py-1 rounded border border-border hover:border-primary/30 transition-colors"
                  >
                    <span className="truncate">{link.text}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 ml-1">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-border shadow-sm hover:shadow-md flex items-center justify-center transition-shadow"
          aria-label="Scroll right"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
