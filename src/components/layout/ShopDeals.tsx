import Link from "next/link";
import Image from "next/image";

const subcategories = [
  {
    name: "Mobile phones",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-mobile-phones-new?fmt=auto&$q-large$",
  },
  {
    name: "TVs",
    url: "/tv-and-audio/televisions/tvs",
    image: "https://media.currys.biz/i/currysprod/top-cat-tvs-all-new?fmt=auto&$q-large$",
  },
  {
    name: "Laptops",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-laptops?fmt=auto&$q-large$",
  },
  {
    name: "Laundry",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-laundry?fmt=auto&$q-large$",
  },
  {
    name: "Console gaming",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-console-gaming?fmt=auto&$q-large$",
  },
  {
    name: "Health & beauty",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-health-beauty?fmt=auto&$q-large$",
  },
  {
    name: "Headphones",
    url: "/tv-and-audio/headphones/headphones",
    image: "https://media.currys.biz/i/currysprod/top-cat-headphones?fmt=auto&$q-large$",
  },
  {
    name: "Vacuum cleaners",
    url: "/tv-and-audio",
    image: "https://media.currys.biz/i/currysprod/top-cat-vacuum-cleaners?fmt=auto&$q-large$",
  },
];

export default function ShopDeals() {
  return (
    <section className="py-6 md:py-8">
      <div className="container-main">
        {/* Flexpay credit line */}
        <p className="text-[10px] text-text-muted text-center mb-5 leading-tight">
          *Representative example based on the use of your ongoing credit account: 29.9% APR Representative (variable). 29.9% interest rate (variable). Assumed credit limit: £1,200.
        </p>

        <h2 className="text-xl md:text-2xl font-bold text-text-primary text-center mb-6">Shop deals</h2>

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
