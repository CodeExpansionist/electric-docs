import HeroCarousel from "@/components/layout/HeroCarousel";
import ShopDeals from "@/components/layout/ShopDeals";
import DiscoverOffers from "@/components/layout/DiscoverOffers";
import BigBrandDeals from "@/components/layout/BigBrandDeals";
import SponsoredProducts from "@/components/layout/SponsoredProducts";
import CurrysPerks from "@/components/layout/CurrysPerks";

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Currys",
      url: "https://www.currys.co.uk",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.currys.co.uk/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Currys",
      url: "https://www.currys.co.uk",
      logo: "https://www.currys.co.uk/on/demandware.static/Sites-curryspcworlduk-Site/-/default/dw2dbb4f18/images/favicons/favicon.ico",
      sameAs: [
        "https://www.facebook.com/currys",
        "https://twitter.com/curraborations",
        "https://www.instagram.com/currys",
        "https://www.youtube.com/currys",
      ],
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
      <ShopDeals />
      <DiscoverOffers />
      <BigBrandDeals />
      <SponsoredProducts />
      <CurrysPerks />
    </>
  );
}
