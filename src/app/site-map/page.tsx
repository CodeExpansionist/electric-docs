import Link from "next/link";

interface SitemapSection {
  heading: string;
  links: { text: string; href: string }[];
}

const sections: SitemapSection[] = [
  {
    heading: "Shop",
    links: [{ text: "TV & Audio", href: "/tv-and-audio" }],
  },
  {
    heading: "Services",
    links: [
      { text: "Track my order", href: "/track-your-order" },
      { text: "Delivery options", href: "/services/delivery" },
      { text: "Returns & cancellations", href: "/services/returns" },
      { text: "Gift cards", href: "/services/gift-cards" },
      { text: "ShopLive", href: "/services/shoplive" },
      { text: "Price Promise", href: "/services/price-promise" },
    ],
  },
  {
    heading: "Care Services",
    links: [
      { text: "Instant Replacement", href: "/services/instant-replacement" },
      { text: "Tablet Insurance", href: "/services/tablet-insurance" },
    ],
  },
  {
    heading: "Help",
    links: [
      { text: "Help & Support", href: "/help-and-support" },
      { text: "Contact us", href: "/contact-us" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { text: "Privacy & cookies", href: "/privacy-cookies-policy" },
      { text: "Terms & conditions", href: "/terms-and-conditions" },
      { text: "Product recalls", href: "/product-recalls" },
    ],
  },
  {
    heading: "Other",
    links: [
      { text: "TechTalk", href: "/techtalk" },
      { text: "Product reviews", href: "/product-reviews" },
      { text: "Search", href: "/search" },
    ],
  },
];

export default function SiteMapPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <div className="container-main py-4">
        <nav className="flex items-center gap-2 text-xs text-text-secondary">
          <Link
            href="/"
            className="hover:text-primary no-underline text-text-secondary"
          >
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-text-primary">Sitemap</span>
        </nav>
      </div>

      {/* Hero banner */}
      <div className="bg-announcement w-full">
        <div className="container-main py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Sitemap
          </h1>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div
              key={section.heading}
              className="bg-white rounded-lg border border-border p-6"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">
                {section.heading}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary no-underline hover:underline flex items-center gap-2"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="flex-shrink-0"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="border-t border-border pt-6 mt-10 mb-8">
          <Link
            href="/"
            className="text-sm text-primary no-underline hover:underline"
          >
            &larr; Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
