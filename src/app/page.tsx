import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroCarousel from "@/components/layout/HeroCarousel";
import { SITE_URL } from "@/lib/constants";

const ShopDeals = dynamic(() => import("@/components/layout/ShopDeals"));
const DiscoverOffers = dynamic(() => import("@/components/layout/DiscoverOffers"));
const BigBrandDeals = dynamic(() => import("@/components/layout/BigBrandDeals"));
const SponsoredProducts = dynamic(() => import("@/components/layout/SponsoredProducts"));
const ElectrizPerks = dynamic(() => import("@/components/layout/ElectrizPerks"));

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Electriz",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Electriz",
      url: SITE_URL,
      logo: `${SITE_URL}/images/brand-electriz-logo.svg`,
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <HeroCarousel />
      <Suspense>
        <ShopDeals />
      </Suspense>
      <Suspense>
        <DiscoverOffers />
      </Suspense>
      <Suspense>
        <BigBrandDeals />
      </Suspense>
      <Suspense>
        <SponsoredProducts />
      </Suspense>
      <Suspense>
        <ElectrizPerks />
      </Suspense>
    </>
  );
}
