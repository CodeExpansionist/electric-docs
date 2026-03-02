import Link from "next/link";

const uspItems = [
  {
    icon: "delivery",
    text: "Free delivery on orders over £40",
    url: "/services/delivery",
  },
  {
    icon: "price-promise",
    text: "Found it cheaper? We'll match it.",
    url: "/services/price-promise",
  },
  {
    icon: "recycling",
    text: "Recycle your old tech & save 8% on new",
    url: "/services/recycling",
  },
];

function USPIcon({ type }: { type: string }) {
  switch (type) {
    case "delivery":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "price-promise":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "recycling":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7.5 7.5l4.5-5 4.5 5" />
          <path d="M12 2.5V15" />
          <path d="M19.5 16l-4.5 5.5-4.5-5.5" />
          <path d="M15 21.5V9" />
          <path d="M4.5 8.5L9 14l-4.5 5.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    default:
      return null;
  }
}

export default function USPBar() {
  return (
    <div className="bg-surface border-b border-border">
      <div className="container-main">
        <div className="flex items-center gap-4 md:gap-0 md:justify-between py-2.5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            {uspItems.map((item) => (
              <Link
                key={item.icon}
                href={item.url}
                className="flex items-center gap-2 text-text-primary no-underline hover:text-primary transition-colors flex-shrink-0"
              >
                <span className="text-primary flex-shrink-0">
                  <USPIcon type={item.icon} />
                </span>
                <span className="text-xs whitespace-nowrap">{item.text}</span>
              </Link>
            ))}
          </div>
          <Link
            href="#"
            className="hidden lg:flex items-center gap-2 text-text-primary no-underline hover:text-primary transition-colors flex-shrink-0"
          >
            <span className="text-primary flex-shrink-0">
              <USPIcon type="calendar" />
            </span>
            <span className="text-xs whitespace-nowrap">Pay at your pace with Currys flexpay 29.9% APR</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
