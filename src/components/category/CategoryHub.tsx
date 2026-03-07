import Link from "next/link";
import Image from "next/image";
import HubSidebar from "./HubSidebar";
import HubBannerCarousel from "./HubBannerCarousel";
import HubBrandCarousel from "./HubBrandCarousel";
import HubContentGrid from "./HubContentGrid";
import type { CategoryHubData } from "@/lib/category-data";

interface CategoryHubProps {
  data: CategoryHubData;
}

export default function CategoryHub({ data }: CategoryHubProps) {
  // Build sidebar sections
  const sidebarSections = [
    { title: "Top categories", links: data.sidebar.topCategories },
    { title: "Popular links", links: data.sidebar.popularLinks },
  ];
  if (data.sidebar.buyingGuides && data.sidebar.buyingGuides.length > 0) {
    sidebarSections.push({ title: "Buying guides", links: data.sidebar.buyingGuides });
  }

  return (
    <div className="bg-surface min-h-screen">
    <div className="container-main py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-4">
        {data.breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>&gt;</span>}
            {i < data.breadcrumbs.length - 1 ? (
              <Link
                href={i === 0 ? "/" : "/tv-and-audio"}
                className="hover:text-primary no-underline text-text-secondary"
              >
                {crumb}
              </Link>
            ) : (
              <span className="text-text-primary">{crumb}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Page title */}
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {data.categoryName}
      </h1>

      {/* Banner carousel */}
      <HubBannerCarousel banners={data.carouselBanners} />

      {/* Subcategory icons */}
      <div className="flex items-center gap-4 md:gap-8 mb-8 pb-6 border-b border-border overflow-x-auto scrollbar-hide">
        {data.subcategoryIcons.map((cat) => (
          <Link
            key={cat.name}
            href={cat.url}
            className="flex flex-col items-center gap-2 no-underline group flex-shrink-0"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <Image
                src={cat.iconUrl}
                alt={cat.name}
                width={56}
                height={56}
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-[10px] md:text-xs text-text-primary text-center group-hover:text-primary transition-colors whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Two-column layout: sidebar + main content */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="hidden md:block">
          <HubSidebar sections={sidebarSections} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Brand carousel */}
          <HubBrandCarousel brands={data.brandCarousel} heading="Shop by brand" />

          {/* Help cards */}
          <HubContentGrid
            cards={data.helpCards}
            heading={data.helpCardsHeading}
            columns={4}
            cta={data.helpCardsCta}
          />

          {/* Service cards */}
          <HubContentGrid
            cards={data.serviceCards}
            heading={data.serviceCardsHeading}
            columns={3}
          />

          {/* SEO content */}
          {data.seoContent && data.seoContent.columns.length > 0 && (
            <section className="mb-8">
              {data.seoContent.heading && (
                <h2 className="text-lg font-bold text-text-primary mb-4">
                  {data.seoContent.heading}
                </h2>
              )}
              <div className={`grid grid-cols-1 ${data.seoContent.columns.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"} gap-6`}>
                {data.seoContent.columns.map((col) => (
                  <div key={col.heading}>
                    <h3 className="text-sm font-bold text-text-primary mb-2">
                      {col.heading}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {col.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
