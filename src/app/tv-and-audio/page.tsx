import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { stripDomain } from "@/lib/constants";
import HubSidebar from "@/components/category/HubSidebar";
import HubPromoBanners from "@/components/category/HubPromoBanners";
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
    <div className="bg-surface min-h-screen">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tvAudioHub.topDeals.map((deal) => (
                <Link
                  key={deal.title}
                  href={stripDomain(deal.url)}
                  className="card overflow-hidden no-underline group"
                >
                  <div className="aspect-[2/1] bg-surface flex items-center justify-center relative">
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
                    <p className="text-xs text-text-secondary mt-1">
                      {deal.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* AI on TV */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">{tvAudioHub.aiOnTv.heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvAudioHub.aiOnTv.cards.map((card, idx) => (
                <Link
                  key={card.title}
                  href={stripDomain(card.url)}
                  className="card overflow-hidden no-underline group"
                >
                  <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden relative">
                    <Image
                      src={`/images/products/${["10282706","10115697","10132171","10004693","10119436"][idx % 5]}/main.webp`}
                      alt={card.title}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
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
            <div className="card overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="aspect-video bg-white flex items-center justify-center overflow-hidden relative">
                  <Image
                    src="/images/products/10282706/main.webp"
                    alt={tvAudioHub.filmmakerMode.heading}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 md:p-6 flex flex-col justify-center">
                  <h2 className="text-lg md:text-xl font-bold mb-3">{tvAudioHub.filmmakerMode.heading}</h2>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-4">
                    {tvAudioHub.filmmakerMode.description}
                  </p>
                  <Link
                    href={stripDomain(tvAudioHub.filmmakerMode.ctaUrl)}
                    className="btn-outline self-start no-underline text-sm"
                  >
                    {tvAudioHub.filmmakerMode.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Buying Guides Visual */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Buying guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tvAudioHub.buyingGuidesVisual.map((guide) => (
                <Link
                  key={guide.title}
                  href={stripDomain(guide.url)}
                  className="card p-5 no-underline group text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-surface rounded-full flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4C12A1" strokeWidth="1.5">
                      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {guide.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Promo Banners */}
          <HubPromoBanners banners={tvAudioHub.promoBanners} />

          {/* Brand Row */}
          <section className="mb-10">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 md:gap-6 py-6 border-y border-border">
              {tvAudioHub.brandRow.map((brand) => (
                <Link
                  key={brand.brand}
                  href={brand.shopNowUrl ? stripDomain(brand.shopNowUrl) : "#"}
                  className="text-sm font-bold text-text-secondary hover:text-primary no-underline transition-colors"
                >
                  {brand.brand}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tvAudioHub.seoContent.columns.map((col: { heading: string; text: string }) => (
                <div key={col.heading}>
                  <h3 className="text-sm font-bold text-text-primary mb-2">{col.heading}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-6">
                    {col.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
}
