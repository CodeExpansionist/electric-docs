"use client";

import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/ui/Carousel";

const deals = [
  {
    title: "Incredible Xbox bundle deals",
    description: "Console, controller and Game Pass bundle deals",
    url: "/deals-on-gaming/deals-on-xbox-and-microsoft",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-XBOX-Console-Game-Pass-v2?fmt=auto&$q-large$",
  },
  {
    title: "Shop Galaxy Watch8 Series or Watch Ultra",
    description: "Claim 12 free months of Strava worth \u00a354.99!",
    url: "/deals-on-smart-tech/deals-on-samsung-strava",
    image:
      "https://media.currys.biz/i/currysprod/wk39-block-Samsung-Strava?fmt=auto&$q-large$",
  },
  {
    title: "Save on spotless!",
    description: "Get up to \u00a3250 off selected Shark vacuums",
    url: "/deals-on-appliances/deals-on-all-shark-vacuum-cleaners",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-Shark-Floorcare?fmt=auto&$q-large$",
  },
  {
    title: "Save up to \u00a3400 on MacBook Air",
    description: "When you trade in your current Mac",
    url: "/computing/laptops/laptops/apple",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-Mac-Trade-In-Top-up?fmt=auto&$q-large$",
  },
  {
    title: "Shop selected iPhone models",
    description: "Save up to \u00a3150 now!",
    url: "/phones/mobile-phones/mobile-phones/apple",
    image:
      "https://media.currys.biz/i/currysprod/wk37-apple-iphone-17-air-BNPL-9?fmt=auto&$q-large$",
  },
  {
    title: "Deals on Dyson!",
    description: "Save up to \u00a3150 on selected products now",
    url: "/deals-on-appliances/deals-on-dyson-appliances",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-Dyson-ASOTV-v2?fmt=auto&$q-large$",
  },
  {
    title: "Save big on selected LG TVs",
    description: "Great deals on selected LG TVs",
    url: "/deals-on-tv-and-audio/lg-tv-savings",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-LG-IFC24-v2?fmt=auto&$q-large$",
  },
  {
    title: "Shop selected hair & beauty tech",
    description: "Save up to 50%!",
    url: "/deals-on-appliances/great-savings-on-hair-and-beauty",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-Save-up-to-50-on-HB?fmt=auto&$q-large$",
  },
  {
    title: "\u00a334.99 off the HP M110W? Copy that!",
    description: "Was \u00a3109.99, now just \u00a375. As seen on TV",
    url: "/products/hp-laserjet-m110w-monochrome-wireless-laser-printer",
    image:
      "https://media.currys.biz/i/currysprod/wk43-block-HP-M110W?fmt=auto&$q-large$",
  },
];

export default function BigBrandDeals() {
  return (
    <section className="py-8">
      <div className="container-main">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Big brand deals
        </h2>
        <Carousel visibleCount={4} mobileCount={1} tabletCount={2}>
          {deals.map((deal) => (
            <Link
              key={deal.title}
              href={deal.url}
              className="flex flex-col rounded-lg overflow-hidden no-underline group bg-white shadow-card hover:shadow-md transition-shadow h-full"
            >
              <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover"
                  unoptimized
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
