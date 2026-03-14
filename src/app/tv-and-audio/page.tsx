import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { stripDomain } from "@/lib/constants";
import HubSidebar from "@/components/category/HubSidebar";
import HubPromoBanners from "@/components/category/HubPromoBanners";
import TvSizeFinder from "@/components/category/TvSizeFinder";
import tvAudioHub from "../../../data/scrape/tv-audio-hub.json";

export const metadata: Metadata = {
  title: "TV & Audio | TVs, Soundbars, Headphones & More",
  description:
    "Shop the latest TVs, soundbars, speakers, headphones and home cinema from top brands like Samsung, LG and Sony. Free delivery available on orders over £40.",
  alternates: { canonical: "/tv-and-audio" },
  openGraph: {
    title: "TV & Audio | TVs, Soundbars, Headphones & More | Electriz",
    description:
      "Shop the latest TVs, soundbars, speakers, headphones and home cinema from top brands.",
  },
};

const sidebarSections = [
  { title: "Top categories", links: tvAudioHub.sidebar.topCategories },
  { title: "Popular links", links: tvAudioHub.sidebar.popularLinks },
  { title: "Buying guides", links: tvAudioHub.sidebar.buyingGuides },
  { title: "News and reviews", links: tvAudioHub.sidebar.newsAndReviews },
];

export default function TvAndAudioHub() {
  return (
    <div className="bg-white min-h-screen">
    <div className="container-main py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        <Link href="/" className="hover:text-primary no-underline text-text-secondary">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-text-primary">TV &amp; Audio</span>
      </nav>

      {/* Page title */}
      <h1 className="text-2xl font-bold text-text-primary mb-6">TV &amp; Audio</h1>

      {/* Subcategory icons */}
      <div className="flex items-center gap-4 md:gap-8 mb-8 pb-6 border-b border-border overflow-x-auto scrollbar-hide">
        {tvAudioHub.subcategoryIcons.map((cat) => (
          <Link
            key={cat.name}
            href={stripDomain(cat.url)}
            className="flex flex-col items-center gap-2 no-underline group flex-shrink-0"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <Image
                src={cat.iconUrl}
                alt={cat.name}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <span className="text-[10px] md:text-xs text-text-primary text-center group-hover:text-primary transition-colors whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="hidden md:block">
          <HubSidebar sections={sidebarSections} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Top Deals */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Top deals</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tvAudioHub.topDeals.map((deal) => (
                <Link
                  key={deal.title}
                  href={stripDomain(deal.url)}
                  className="card overflow-hidden no-underline group"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {deal.imageUrl ? (
                      <Image
                        src={deal.imageUrl}
                        alt={deal.imageAlt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-primary mt-1 font-semibold">
                      {deal.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* AI on TV */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-center">{tvAudioHub.aiOnTv.heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvAudioHub.aiOnTv.cards.map((card) => (
                <Link
                  key={card.title}
                  href={stripDomain(card.url)}
                  className="card overflow-hidden no-underline group"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={card.imageUrl}
                      alt={card.imageAlt || card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 rounded-b-md" style={{ backgroundColor: card.bgColor }}>
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Filmmaker Mode */}
          <section className="mb-10">
            <div className="rounded-md overflow-hidden" style={{ backgroundColor: "#FDF6E3" }}>
              <div className="px-6 pt-8 pb-6 md:px-12 md:pt-10 md:pb-8 text-center">
                <h2 className="text-lg md:text-xl font-bold mb-3">{tvAudioHub.filmmakerMode.heading}</h2>
                <p className="text-sm text-text-secondary mb-5 max-w-2xl mx-auto">
                  This is movie night done right. Filmmaker Mode turns off all the added effects, so you see the film exactly as the director meant it to be seen.
                  <br />
                  Legendary film critic{" "}
                  <span className="font-bold text-[#E91E63]">Mark Kermode</span>{" "}
                  breaks it down in this short video. If anyone knows what makes a film truly cinematic, it&apos;s him.
                </p>
                <Link
                  href={stripDomain(tvAudioHub.filmmakerMode.ctaUrl)}
                  className="btn-outline no-underline text-sm"
                >
                  {tvAudioHub.filmmakerMode.ctaText}
                </Link>
              </div>
              <div className="px-6 pb-8 md:px-12 md:pb-10">
                <video
                  className="w-full rounded-md"
                  controls
                  preload="metadata"
                  poster={tvAudioHub.filmmakerMode.imageUrl}
                >
                  <source src="/videos/filmmaker-mode.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </section>

          {/* Buying Guides Visual */}
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvAudioHub.buyingGuidesVisual.map((guide) => (
                <Link
                  key={guide.title}
                  href={stripDomain(guide.url)}
                  className="relative rounded-[10px] overflow-hidden no-underline group min-h-[200px] md:min-h-[370px] flex"
                >
                  {/* Full-bleed background image */}
                  <Image
                    src={guide.imageUrl}
                    alt={guide.imageAlt || guide.title}
                    fill
                    className="object-cover rounded-[10px]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Content overlay — centered, bottom half */}
                  <div className="relative z-10 w-full px-6 py-6 flex flex-col items-center justify-end text-center">
                    <h4 className="text-base font-medium text-text-primary group-hover:text-primary transition-colors mb-2">
                      {guide.title}
                    </h4>
                    <p className="text-sm text-black mb-3 line-clamp-3">
                      {guide.description}
                    </p>
                    <span className="text-sm text-primary">
                      Learn more &gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* TV Size Finder — hidden pending layout fix */}
          {/* <TvSizeFinder
            heading={tvAudioHub.tvSizeFinder.heading}
            description={tvAudioHub.tvSizeFinder.description}
            sizeOptions={tvAudioHub.tvSizeFinder.sizeOptions}
            assets={tvAudioHub.tvSizeFinder.assets}
            learnMoreUrl={tvAudioHub.tvSizeFinder.learnMoreUrl}
          /> */}

          {/* Promo Banners — hidden pending layout fix */}
          {/* <HubPromoBanners banners={tvAudioHub.promoBanners} /> */}

          {/* Brand Row */}
          <section className="mb-10">
            <div className="border-y border-border py-6">
              <div className="flex items-start gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
                {tvAudioHub.brandRow.map((brand) => {
                  const brandHref = brand.shopNowUrl ? stripDomain(brand.shopNowUrl) : "#";
                  return (
                  <div key={brand.brand} className="flex flex-col items-center gap-3 flex-shrink-0 min-w-[120px]">
                    <Link href={brandHref} className="h-[40px] flex items-center justify-center">
                      {brand.logoUrl ? (
                        <Image
                          src={brand.logoUrl}
                          alt={brand.brand}
                          width={120}
                          height={40}
                          className="object-contain max-h-[40px]"
                          unoptimized
                        />
                      ) : (
                        <span className="text-sm font-bold text-text-primary">{brand.brand}</span>
                      )}
                    </Link>
                    <Link
                      href={brandHref}
                      className="btn-outline text-xs px-4 py-1.5 no-underline"
                    >
                      Shop now
                    </Link>
                    <Link
                      href={brandHref}
                      className="text-xs text-text-secondary hover:text-primary no-underline"
                    >
                      Learn more
                    </Link>
                  </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
    </div>
  );
}
