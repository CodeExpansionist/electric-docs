"use client";

import Link from "next/link";

interface NavLink {
  text: string;
  url: string;
  active?: boolean;
  badge?: boolean;
}

const navLinks: NavLink[] = [
  { text: "Appliances", url: "/tv-and-audio" },
  { text: "TV & Audio", url: "/tv-and-audio", active: true },
  { text: "Computing", url: "/tv-and-audio" },
  { text: "Phones & tablets", url: "/tv-and-audio" },
  { text: "Health & Beauty", url: "/tv-and-audio" },
  { text: "Smart Tech", url: "/tv-and-audio" },
  { text: "Gaming", url: "/tv-and-audio" },
  { text: "Deals", url: "/tv-and-audio", badge: true },
];

export default function MainNav() {
  return (
    <nav className="bg-white border-b border-border">
      <div className="container-main">
        <div className="flex items-center gap-0 py-0 overflow-x-auto scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.text}
              href={link.url}
              className={`px-2.5 md:px-3.5 py-3 text-xs md:text-sm font-medium no-underline whitespace-nowrap transition-colors relative
                ${link.active
                  ? "text-primary border-b-[3px] border-primary"
                  : "text-text-primary hover:text-primary"}`}
            >
              {link.text}
              {link.badge && (
                <span className="ml-1 bg-sale text-white text-[9px] font-bold rounded-full px-1.5 py-px leading-none align-middle">
                  %
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
