"use client";

import Link from "next/link";

interface NavLink {
  text: string;
  url: string;
  active?: boolean;
  badge?: boolean;
}

export const navLinks: NavLink[] = [
  { text: "Televisions", url: "/tv-and-audio/televisions/tvs" },
  { text: "DVD & Blu-ray", url: "/tv-and-audio/dvd-blu-ray-and-home-cinema" },
  { text: "Soundbars", url: "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars" },
  { text: "Speakers & Hi-Fi", url: "/tv-and-audio/speakers-and-hi-fi-systems" },
  { text: "TV Accessories", url: "/tv-and-audio/tv-accessories" },
  { text: "Digital & Smart TV", url: "/tv-and-audio/digital-and-smart-tv" },
  { text: "Headphones", url: "/tv-and-audio/headphones/headphones" },
];

export default function MainNav() {
  return (
    <nav aria-label="Main categories" className="hidden lg:block bg-white border-b border-border">
      <div className="container-main">
        <div
          className="flex items-center gap-0 py-0 overflow-x-auto scrollbar-hide focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          tabIndex={0}
        >
          {navLinks.map((link) => (
            <Link
              key={link.text}
              href={link.url}
              className={`px-2.5 md:px-3.5 pt-4 pb-1.5 text-base font-normal no-underline whitespace-nowrap transition-colors relative
                ${link.active
                  ? "text-primary border-b-[3px] border-primary"
                  : "text-text-primary hover:text-primary"}`}
            >
              {link.text}
              {link.badge && (
                <span className="ml-1 bg-sale text-white text-[9px] font-bold rounded-full px-1.5 py-px leading-none align-middle" aria-label="On sale">
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
