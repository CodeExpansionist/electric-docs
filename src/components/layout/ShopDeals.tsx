import Link from "next/link";
import Image from "next/image";

const subcategories = [
  {
    name: "Televisions",
    url: "/tv-and-audio/televisions/tvs",
    image: "https://media.currys.biz/i/currysprod/top-cat-tvs-all-new?fmt=auto&$q-large$",
  },
  {
    name: "DVD, Blu-ray & home cinema",
    url: "/tv-and-audio/dvd-blu-ray-and-home-cinema",
    image: "https://media.currys.biz/i/currysprod/top-cat-dvd-bluray-cinema?fmt=auto&$q-large$",
  },
  {
    name: "Soundbars",
    url: "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
    image: "https://media.currys.biz/i/currysprod/top-uni-sound-bars?fmt=auto&$q-large$",
  },
  {
    name: "HiFi & Speakers",
    url: "/tv-and-audio/speakers-and-hi-fi-systems",
    image: "https://media.currys.biz/i/currysprod/top-cat-hifi-speakers?fmt=auto&$q-large$",
  },
  {
    name: "TV accessories",
    url: "/tv-and-audio/tv-accessories",
    image: "https://media.currys.biz/i/currysprod/top-cat-tv-acc?fmt=auto&$q-large$",
  },
  {
    name: "Digital & smart TV",
    url: "/tv-and-audio/digital-and-smart-tv",
    image: "https://media.currys.biz/i/currysprod/top-cat-digital-smart-tv?fmt=auto&$q-large$",
  },
  {
    name: "Headphones",
    url: "/tv-and-audio/headphones/headphones",
    image: "https://media.currys.biz/i/currysprod/top-cat-headphones?fmt=auto&$q-large$",
  },
];

export default function ShopDeals() {
  return (
    <section className="py-6 md:py-8 border-b border-border">
      <div className="container-main">
        {/* Mobile: horizontal scroll showing ~4.5 items. Desktop: all items fit in a row */}
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide
                        md:overflow-visible md:justify-between px-1">
          {subcategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.url}
              className="flex flex-col items-center gap-2 no-underline group
                         flex-shrink-0 w-[72px] sm:w-[80px]
                         md:flex-shrink md:flex-1 md:w-auto md:max-w-[130px]"
            >
              <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] md:w-[96px] md:h-[96px] lg:w-[110px] lg:h-[110px] flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={110}
                  height={110}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm text-text-primary text-center group-hover:text-primary transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
