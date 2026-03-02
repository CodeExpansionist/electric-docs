"use client";

import Link from "next/link";

const navLinks = [
  { text: "Televisions", url: "/tv-and-audio/televisions/tvs" },
  { text: "DVD, Blu-ray & Home Cinema", url: "/tv-and-audio/dvd-blu-ray-and-home-cinema" },
  { text: "Soundbars", url: "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars" },
  { text: "Hi-Fi & Speakers", url: "/tv-and-audio/speakers-and-hi-fi-systems" },
  { text: "TV Accessories", url: "/tv-and-audio/tv-accessories" },
  { text: "Digital & Smart TV", url: "/tv-and-audio/digital-and-smart-tv" },
  { text: "Headphones", url: "/tv-and-audio/headphones/headphones" },
];

export default function MainNav() {
  return (
    <nav className="bg-white border-b border-border">
      <div className="container-main">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.text}
              href={link.url}
              className="px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-text-primary
                         hover:text-primary no-underline whitespace-nowrap transition-colors"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
