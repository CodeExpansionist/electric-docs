"use client";

import { useState, useEffect, type ReactNode } from "react";

interface CarouselProps {
  children: ReactNode[];
  visibleCount?: number;
  mobileCount?: number;
  tabletCount?: number;
  className?: string;
}

function useResponsiveCount(desktop: number, tablet: number, mobile: number) {
  const [count, setCount] = useState(desktop);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function update() {
      if (window.innerWidth < 640) setCount(mobile);
      else if (window.innerWidth < 1024) setCount(tablet);
      else setCount(desktop);
    }
    function debouncedUpdate() {
      clearTimeout(timeout);
      timeout = setTimeout(update, 150);
    }
    update();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeout);
    };
  }, [desktop, tablet, mobile]);

  return count;
}

export default function Carousel({
  children,
  visibleCount = 4,
  mobileCount = 2,
  tabletCount,
  className = "",
}: CarouselProps) {
  const effectiveTablet = tabletCount ?? Math.min(visibleCount, 3);
  const count = useResponsiveCount(visibleCount, effectiveTablet, mobileCount);
  const [offset, setOffset] = useState(0);
  const total = children.length;
  const maxOffset = Math.max(0, total - count);

  // Clamp offset when count changes
  useEffect(() => {
    setOffset((o) => Math.min(o, maxOffset));
  }, [maxOffset]);

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  return (
    <div className={`relative group ${className}`}>
      {/* Left arrow */}
      {offset > 0 && (
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10
                     w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md flex items-center justify-center
                     hover:bg-gray-50 transition-colors border border-border"
          aria-label="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Items */}
      <div className="overflow-hidden">
        <div
          className="flex items-stretch transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${offset * (100 / count)}%)`,
          }}
        >
          {children.map((child, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-1.5 md:px-2"
              style={{ width: `${100 / count}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Right arrow */}
      {offset < maxOffset && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10
                     w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md flex items-center justify-center
                     hover:bg-gray-50 transition-colors border border-border"
          aria-label="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
