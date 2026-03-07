"use client";

import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/ui/Carousel";


const offers = [
  {
    title: "Shop Microsoft Surface Laptops from \u00a3699",
    description: "Running on Snapdragon\u00ae X Series processors",
    url: "/deals-on-computing/copilot-plus-pcs-powered-by-snapdragon-x-series",
    image: "/images/banners/wk41-block-QC-RYPC-v1.webp",
  },
  {
    title: "Shop selected Samsung TVs & soundbars",
    description: "Claim up to \u00a31000 of Samsung tech. T&Cs apply",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    image: "/images/banners/wk43-block-Samsung-Your-Gift-v1.webp",
  },
  {
    title: "Save \u00a3200 on ASUS Chromebook Plus CX34!",
    description: "With an Intel\u00ae Core\u2122 i5 & Google AI built-in",
    url: "/products/asus-cx34-14-chromebook-plus",
    image: "/images/banners/wk43-block-Chromebook-TV-v1.webp",
  },
  {
    title: "Shop selected 75\"+ TVs now",
    description: "Get free delivery. You\u2019re welcome!",
    url: "/deals-on-tv-and-audio/free-delivery-on-selected-tvs",
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
  },
  {
    title: "Pre-order the Samsung Galaxy S26|S26+ now!",
    description: "Get double the storage on us. T&Cs apply\u2021",
    url: "/deals-on-phones/samsung-galaxy-s26-and-s26-plus-deals",
    image: "/images/banners/wk43-block-samsung-S26-Base.webp",
  },
  {
    title: "Pre-order the new Galaxy Book6 Pro",
    description: "Powered by Intel\u00ae Core\u2122 Ultra 7. Intro offer applied!",
    url: "/deals-on-computing/samsung-galaxy-book6",
    image: "/images/banners/wk43-block-samsung-book6-pro-laptop.webp",
  },
  {
    title: "Shop selected Samsung efficient appliances",
    description: "Free recycling & up to \u00a350 off marked prices!",
    url: "/deals-on-appliances/mda-efficiency-campaign/samsung",
    image: "/images/banners/wk40-block-Efficiency-campaign-Samsung-Generic.webp",
  },
  {
    title: "Pre-order the new Galaxy Buds4 Pro now!",
    description: "You\u2019ve got 100 days to return. T&Cs apply.",
    url: "/deals-on-tv-and-audio/samsung-galaxy-buds4-offers",
    image: "/images/banners/wk43-block-samsung-buds4-pro.webp",
  },
  {
    title: "Shop selected Hoover efficient appliances",
    description: "Get free recycling & up to \u00a350 off marked prices!",
    url: "/deals-on-appliances/mda-efficiency-campaign/hoover",
    image: "/images/banners/wk42-block-Efficiency-campaign-Hoover.webp",
  },
];

export default function DiscoverOffers() {
  return (
    <section aria-labelledby="discover-offers-heading" className="py-8">
      <div className="container-main">
        <h2 id="discover-offers-heading" className="text-xl font-bold text-text-primary mb-6">
          Discover our amazing offers
        </h2>
        <Carousel visibleCount={4} mobileCount={1} tabletCount={2}>
          {offers.map((offer) => (
            <Link
              key={offer.title}
              href={offer.url}
              className="flex flex-col rounded-lg overflow-hidden no-underline group bg-white shadow-card hover:shadow-md transition-shadow h-full"
            >
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-1 min-h-[40px]">
                  {offer.title}
                </h3>
                <p className="text-xs text-text-secondary leading-snug line-clamp-2 min-h-[32px]">
                  {offer.description}
                </p>
              </div>
            </Link>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
