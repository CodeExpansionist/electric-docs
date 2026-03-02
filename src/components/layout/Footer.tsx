import Link from "next/link";

const columns = [
  {
    heading: "Help & support",
    links: [
      { text: "Contact us", url: "/help-and-support/contact-us" },
      { text: "TechTalk", url: "/techtalk" },
      { text: "Price Promise", url: "/services/price-promise" },
      { text: "Product reviews", url: "/product-reviews" },
    ],
  },
  {
    heading: "Services",
    links: [
      { text: "Track my order", url: "/track-your-order" },
      { text: "Delivery options", url: "/services/delivery" },
      { text: "Returns & cancellations", url: "/services/returns" },
      { text: "ShopLive", url: "/services/shoplive" },
    ],
  },
  {
    heading: "Care Services",
    links: [
      { text: "Care & Repair", url: "/services/care-and-repair" },
      { text: "Instant Replacement", url: "/services/instant-replacement" },
      { text: "Mobile Insurance", url: "/services/mobile-insurance" },
      { text: "Tablet Insurance", url: "/services/tablet-insurance" },
    ],
  },
  {
    heading: "Our websites",
    links: [
      { text: "Currys Business", url: "/business" },
      { text: "Currys Ireland", url: "/ireland" },
      { text: "Partmaster", url: "/partmaster" },
      { text: "Carphone Warehouse", url: "/carphone-warehouse" },
    ],
  },
  {
    heading: "About us",
    links: [
      { text: "Leave review on Trustpilot", url: "/trustpilot" },
      { text: "Corporate site", url: "/corporate" },
      { text: "Careers", url: "/careers" },
      { text: "PR & media", url: "/pr-media" },
      { text: "Modern slavery statement", url: "/modern-slavery-statement" },
      { text: "Corporate social responsibility", url: "/csr" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-white">
      <div className="container-main py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold mb-4">{col.heading}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.text}>
                    <Link
                      href={link.url}
                      className="text-xs text-gray-300 hover:text-white no-underline transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
