import Link from "next/link";
import Image from "next/image";

const subcategories = [
  {
    name: "Televisions",
    url: "/tv-and-audio/televisions/tvs",
    image: "/images/categories/tvs.png",
  },
  {
    name: "DVD & Blu-ray",
    url: "/tv-and-audio/dvd-blu-ray-and-home-cinema",
    image: "/images/categories/dvd-blu-ray.png",
  },
  {
    name: "Soundbars",
    url: "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
    image: "/images/categories/soundbars.png",
  },
  {
    name: "Speakers & Hi-Fi",
    url: "/tv-and-audio/speakers-and-hi-fi-systems",
    image: "/images/categories/speakers.png",
  },
  {
    name: "TV Accessories",
    url: "/tv-and-audio/tv-accessories",
    image: "/images/categories/tv-accessories.png",
  },
  {
    name: "Digital & Smart TV",
    url: "/tv-and-audio/digital-and-smart-tv",
    image: "/images/categories/digital-smart-tv.png",
  },
  {
    name: "Headphones",
    url: "/tv-and-audio/headphones/headphones",
    image: "/images/categories/headphones.png",
  },
];

export default function ShopDeals() {
  return (
    <section aria-labelledby="shop-deals-heading" className="py-6 md:py-8">
      <div className="container-main">
        <h2 id="shop-deals-heading" className="text-base md:text-2xl font-bold text-text-primary text-center mb-6">Shop deals</h2>

        {/* Mobile: horizontal scroll showing ~4.5 items. Desktop: all items fit in a row */}
        <div
          className="flex items-start gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide
                     md:overflow-visible md:justify-between px-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          tabIndex={0}
          role="list"
          aria-label="Deal categories"
        >
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
