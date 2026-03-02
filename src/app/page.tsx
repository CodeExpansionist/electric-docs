import HeroCarousel from "@/components/layout/HeroCarousel";
import ShopDeals from "@/components/layout/ShopDeals";
import DiscoverOffers from "@/components/layout/DiscoverOffers";
import BigBrandDeals from "@/components/layout/BigBrandDeals";
import SponsoredProducts from "@/components/layout/SponsoredProducts";
import CurrysPerks from "@/components/layout/CurrysPerks";

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <ShopDeals />
      <DiscoverOffers />
      <BigBrandDeals />
      <SponsoredProducts />
      <CurrysPerks />
    </>
  );
}
