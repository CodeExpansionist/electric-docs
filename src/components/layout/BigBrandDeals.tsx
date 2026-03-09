"use client";

import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/ui/Carousel";


const deals = [
  {
    title: "Incredible Xbox bundle deals",
    description: "Console, controller and Game Pass bundle deals",
    url: "/deals-on-gaming/deals-on-xbox-and-microsoft",
    image: "/images/banners/wk43-block-XBOX-Console-Game-Pass-v2.webp",
  },
  {
    title: "Shop Galaxy Watch8 Series or Watch Ultra",
    description: "Claim 12 free months of Strava worth \u00a354.99!",
    url: "/deals-on-smart-tech/deals-on-samsung-strava",
    image: "/images/banners/wk39-block-Samsung-Strava.webp",
  },
  {
    title: "Save on spotless!",
    description: "Get up to \u00a3250 off selected Shark vacuums",
    url: "/deals-on-appliances/deals-on-all-shark-vacuum-cleaners",
    image: "/images/banners/wk43-block-Shark-Floorcare.webp",
  },
  {
    title: "Save up to \u00a3400 on MacBook Air",
    description: "When you trade in your current Mac",
    url: "/computing/laptops/laptops/apple",
    image: "/images/banners/wk43-block-Mac-Trade-In-Top-up.webp",
  },
  {
    title: "Shop selected iPhone models",
    description: "Save up to \u00a3150 now!",
    url: "/phones/mobile-phones/mobile-phones/apple",
    image: "/images/banners/wk37-apple-iphone-17-air-BNPL-9.webp",
  },
  {
    title: "Deals on Dyson!",
    description: "Save up to \u00a3150 on selected products now",
    url: "/deals-on-appliances/deals-on-dyson-appliances",
    image: "/images/banners/wk43-block-Dyson-ASOTV-v2.webp",
  },
  {
    title: "Save big on selected LG TVs",
    description: "Great deals on selected LG TVs",
    url: "/deals-on-tv-and-audio/lg-tv-savings",
    image: "/images/banners/wk43-block-LG-IFC24-v2.webp",
  },
  {
    title: "Shop selected hair & beauty tech",
    description: "Save up to 50%!",
    url: "/deals-on-appliances/great-savings-on-hair-and-beauty",
    image: "/images/banners/wk43-block-Save-up-to-50-on-HB.webp",
  },
  {
    title: "\u00a334.99 off the HP M110W? Copy that!",
    description: "Was \u00a3109.99, now just \u00a375. As seen on TV",
    url: "/products/hp-laserjet-m110w-monochrome-wireless-laser-printer",
    image: "/images/banners/wk43-block-HP-M110W.webp",
  },
];

export default function BigBrandDeals() {
  return (
    <section aria-labelledby="big-brand-deals-heading" className="py-8">
      <div className="container-main">
        <h2 id="big-brand-deals-heading" className="text-base md:text-2xl font-bold text-text-primary text-center mb-6">
          Big brand deals
        </h2>
        <Carousel visibleCount={4} mobileCount={1} tabletCount={2}>
          {deals.map((deal) => (
            <Link
              key={deal.title}
              href={deal.url}
              className="flex flex-col rounded-lg overflow-hidden no-underline group bg-white shadow-card hover:shadow-md transition-shadow h-full"
            >
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-1 min-h-[40px]">
                  {deal.title}
                </h3>
                <p className="text-xs text-text-secondary leading-snug line-clamp-2 min-h-[32px]">
                  {deal.description}
                </p>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
