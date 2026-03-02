"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CDN = "https://media.currys.biz/i/currysprod";

// Amplience CDN crop: w=width, h=height, sm=c (crop), poi={x,y} (point of interest)
function cropImg(slug: string, w: number, h: number, poiY = 0.2) {
  return `${CDN}/${slug}?fmt=auto&w=${w}&h=${h}&sm=c&poi={0.5,${poiY}}`;
}

/* ── Main carousel slides (left side, rotating) ── */
const carouselSlides = [
  {
    alt: "Epic Deals. Images of vacuum, TV, washing machine and e-scooter",
    url: "/epic-deals",
    desktopSlug: "wk42-hp-hero-feb-epic-deals-desktop",
    mobileSlug: "wk42-hp-hero-feb-epic-deals-mobile",
  },
  {
    alt: "Image of Sony TV. Get up to £250 off when you trade-in any old TV",
    url: "/deals-on-tv-and-audio/trade-in-tv-offers",
    desktopSlug: "wk43-hp-hero-CE-trade-in-sony-desktop-v2",
    mobileSlug: "wk43-hp-hero-CE-trade-in-sony-mobile-v2",
  },
  {
    alt: "Image of LEGO Botanicals, Shark FacialPro and Sandstorm digital photo frame",
    url: "/gifting/gifts-by-occasion/mothers-day-gifts",
    desktopSlug: "wk43-hp-hero-mothers-day-26-desktop",
    mobileSlug: "wk43-hp-hero-mothers-day-26-mobile",
  },
  {
    alt: "Image of Lenovo laptop. Logos of Lenovo + Intel Processors",
    url: "/deals-on-computing/deals-on-ai-laptops",
    desktopSlug: "wk43-hp-hero-CG-lenovo-refresh-your-PC-desktop",
    mobileSlug: "wk43-hp-hero-CG-lenovo-refresh-your-PC-mobile",
  },
];

/* ── Right-side static promo cards (use mobile slugs — they have landscape ratio) ── */
const promoCards = [
  {
    alt: "Images of Samsung fridge freezer and LG washing machine. Recycling's on us!",
    url: "/deals-on-appliances/mda-efficiency-campaign",
    slug: "wk40-hp-hero-WG-efficiency-campaign-mobile",
    mobileSlug: "wk40-hp-hero-WG-efficiency-campaign-mobile",
  },
  {
    alt: "Image of Samsung Galaxy S26 Ultra plus Samsung logo",
    url: "/deals-on-phones/samsung-galaxy-s26-ultra-deals",
    slug: "wk43-hp-hero-mob-samsung-S26-Ultra-mobile",
    mobileSlug: "wk43-hp-hero-mob-samsung-S26-Ultra-mobile",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % carouselSlides.length);
  }, []);

  const goPrev = () => {
    setCurrent((c) => (c - 1 + carouselSlides.length) % carouselSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext]);

  return (
    <section className="relative">
      <div className="container-main">
        {/* Desktop: grid layout — carousel left, 2 promo cards right */}
        <div className="hidden md:grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_380px] gap-3 lg:gap-4 h-[380px] lg:h-[420px]">
          {/* ── Left: Main carousel ── */}
          <div className="relative rounded-lg overflow-hidden h-full">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {carouselSlides.map((slide) => (
                <Link
                  key={slide.url}
                  href={slide.url}
                  className="flex-shrink-0 w-full h-full relative no-underline block"
                >
                  <img
                    src={cropImg(slide.desktopSlug, 920, 420, 0.2)}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>

            {/* Carousel arrows */}
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Previous slide"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Next slide"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carouselSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Two stacked promo cards ── */}
          <div className="flex flex-col gap-3 lg:gap-4 h-full overflow-hidden">
            {promoCards.map((card) => (
              <Link
                key={card.url}
                href={card.url}
                className="relative flex-1 rounded-lg overflow-hidden no-underline block"
              >
                <img
                  src={`${CDN}/${card.slug}?fmt=auto&w=500`}
                  alt={card.alt}
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile: Full-width stacked carousel */}
        <div className="md:hidden">
          <div className="relative rounded-lg overflow-hidden h-[220px] sm:h-[260px]">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {[...carouselSlides, ...promoCards].map((slide) => (
                <Link
                  key={slide.url}
                  href={slide.url}
                  className="flex-shrink-0 w-full h-full relative no-underline block"
                >
                  <img
                    src={cropImg(slide.mobileSlug, 800, 520, 0.25)}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>

            {/* Mobile arrows */}
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Previous slide"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full
                         flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"
              aria-label="Next slide"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#213038" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Mobile dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {[...carouselSlides, ...promoCards].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
