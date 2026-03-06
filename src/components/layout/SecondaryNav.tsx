import Link from "next/link";

const links = [
  { text: "Help & Support", url: "/help-and-support" },
  { text: "Track my order", url: "/track-your-order" },
  { text: "Delivery", url: "/services/delivery" },
  { text: "Returns", url: "/services/returns" },
  { text: "Gift cards", url: "/services/gift-cards" },
];

export default function SecondaryNav() {
  return (
    <div className="hidden lg:block bg-surface border-b border-border">
      <div className="container-main flex justify-end">
        <nav aria-label="Utility links" className="flex items-center gap-4 py-1">
          {links.map((link) => (
            <Link
              key={link.text}
              href={link.url}
              className="text-text-primary text-xs hover:text-primary no-underline whitespace-nowrap"
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
