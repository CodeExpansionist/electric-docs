"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    alt: "Trade in & save. Get up to £250 off selected TVs when you trade-in any old TV",
    url: "/deals-on-tv-and-audio/trade-in-tv-offers",
    desktopSlug: "wk44-hp-hero-CE-trade-in-hisense-desktop",
    mobileSlug: "wk44-hp-hero-CE-trade-in-hisense-mobile",
  },
  {
    alt: "Trade in & save. Save £50 on selected appliances when you trade-in any old tech",
    url: "/deals-on-appliances/trade-in",
    desktopSlug: "wk44-hp-hero-WG-trade-in-appliances-desktop",
    mobileSlug: "wk44-hp-hero-WG-trade-in-appliances-mobile",
  },
  {
    alt: "Recycling's on us! Get free recycling on selected efficient appliances",
    url: "/deals-on-appliances/mda-efficiency-campaign",
    desktopSlug: "wk40-hp-hero-WG-efficiency-campaign-desktop",
    mobileSlug: "wk40-hp-hero-WG-efficiency-campaign-mobile",
  },
  {
    alt: "Samsung Galaxy S26 Ultra. Pre-order now and double your storage on us!",
    url: "/deals-on-phones/samsung-galaxy-s26-ultra-deals",
    desktopSlug: "wk43-hp-hero-mob-samsung-S26-Ultra-desktop",
    mobileSlug: "wk43-hp-hero-mob-samsung-S26-Ultra-mobile",
  },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, paused, reducedMotion]);

  // Build visible slides with wrapping
  const getSlide = (offset: number) => slides[(current + offset) % slides.length];

  return (
    <section
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!regionRef.current?.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      className="relative"
    >
      <div className="container-main">
        <div aria-live="polite" aria-atomic="true">
          {/* Mobile + Tablet (<md): 2 cards */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {[0, 1].map((offset) => {
              const slide = getSlide(offset);
              return (
                <Link
                  key={`${current}-${offset}`}
                  href={slide.url}
                  className="relative rounded-lg overflow-hidden no-underline block aspect-[4/5]"
                >
                  <Image
                    src={`/images/banners/${slide.desktopSlug}.webp`}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    priority={offset === 0}
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop (md+): 3 cards */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {[0, 1, 2].map((offset) => {
              const slide = getSlide(offset);
              return (
                <Link
                  key={`${current}-${offset}`}
                  href={slide.url}
                  className="relative rounded-lg overflow-hidden no-underline block aspect-[4/5]"
                >
                  <Image
                    src={`/images/banners/${slide.desktopSlug}.webp`}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="33vw"
                    priority={offset === 0}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-icon rounded-full text-white
                     flex items-center justify-center hover:bg-icon/90 transition-colors z-10"
          aria-label="Previous slide"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-icon rounded-full text-white
                     flex items-center justify-center hover:bg-icon/90 transition-colors z-10"
          aria-label="Next slide"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

      </div>
    </section>
  );
}
