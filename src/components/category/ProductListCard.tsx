import Link from "next/link";
import Image from "next/image";

interface ProductListCardProps {
  title: string;
  image?: string | null;
  price: number;
  wasPrice?: number | null;
  savings?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  specs: string[];
  badges: string[];
  offers: string[];
  deliveryFree: boolean;
  url: string;
  energyRating?: string | null;
  onAddToBasket?: () => void;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
          return (
            <svg key={star} width="14" height="14" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`star-grad-${star}-${count}`}>
                  <stop offset={`${fill * 100}%`} stopColor="#E8A317" />
                  <stop offset={`${fill * 100}%`} stopColor="#E0E0E0" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={fill === 1 ? "#E8A317" : fill === 0 ? "#E0E0E0" : `url(#star-grad-${star}-${count})`}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-xs text-text-secondary font-medium">{rating}/5</span>
      <span className="text-xs text-text-secondary">
        {count.toLocaleString()} reviews
      </span>
    </div>
  );
}

function BadgeTag({ badge }: { badge: string }) {
  // "Epic Deal" gets a red pill style
  if (badge.toLowerCase().includes("epic deal")) {
    return (
      <span className="bg-epic-deal text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
        {badge}
      </span>
    );
  }
  // "Loved by Currys" gets a purple heart style
  if (badge.toLowerCase().includes("loved by currys")) {
    return (
      <span className="inline-flex items-center gap-1 border border-primary rounded-full px-2.5 py-1 text-[10px] font-semibold text-primary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#5C2D91" stroke="none">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        {badge}
      </span>
    );
  }
  // "Trade in & save" and other tags get outlined style
  if (badge.toLowerCase().includes("trade in")) {
    return (
      <span className="border border-primary text-primary text-[10px] font-semibold px-2.5 py-1 rounded-full">
        Trade in &amp; save
      </span>
    );
  }
  // Award badges
  if (badge.toLowerCase().includes("award")) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-secondary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8A317" strokeWidth="2">
          <circle cx="12" cy="8" r="7" />
          <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
        </svg>
        {badge.replace("Award: ", "")}
      </span>
    );
  }
  // Dolby or tech badges
  if (badge.toLowerCase().includes("dolby")) {
    return (
      <span className="inline-flex items-center gap-1 border border-border rounded px-2 py-0.5 text-[10px] font-bold text-text-primary bg-white">
        {badge}
      </span>
    );
  }
  // Default badge style
  return (
    <span className="bg-surface text-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded">
      {badge}
    </span>
  );
}

export default function ProductListCard({
  title,
  image,
  price,
  wasPrice,
  savings,
  rating,
  reviewCount,
  specs,
  badges,
  offers,
  deliveryFree,
  url,
  energyRating,
  onAddToBasket,
}: ProductListCardProps) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image zone */}
        <div className="w-full sm:w-[180px] md:w-[200px] flex-shrink-0">
          <Link href={url} className="no-underline">
            <div className="aspect-square bg-white border border-border rounded-md flex items-center justify-center overflow-hidden">
              {image ? (
                <Image src={image} alt={title} width={200} height={200} className="object-contain p-2" unoptimized />
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CDD8DF" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              )}
            </div>
          </Link>
          {/* Badges below image */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {badges.map((badge) => (
                <BadgeTag key={badge} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {/* Specs zone */}
        <div className="flex-1 min-w-0">
          <Link href={url} className="no-underline">
            <h3 className="text-sm md:text-base font-bold text-text-primary hover:text-primary transition-colors mb-1.5 leading-snug">
              {title}
            </h3>
          </Link>

          {rating != null && reviewCount != null && (
            <div className="mb-2.5">
              <StarRating rating={rating} count={reviewCount} />
            </div>
          )}

          <ul className="space-y-1.5 mb-3">
            {specs.map((spec, i) => (
              <li key={i} className="text-xs md:text-sm text-text-primary flex items-start gap-2">
                <span className="text-text-muted mt-0.5 text-sm">•</span>
                <span className="font-semibold">{spec}</span>
              </li>
            ))}
          </ul>

          {/* Offers */}
          {offers.length > 0 && (
            <div className="border border-border rounded-md p-2.5 mt-2">
              {offers.map((offer, i) => {
                // Split "+X more offers" from main text
                const parts = offer.split(/(\+\d+ more offers?)/);
                return (
                  <p key={i} className="text-xs text-text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C2D91" strokeWidth="2" className="inline-block mr-1 -mt-0.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h4m0 0h4m-4 0V8m0 4v4" />
                    </svg>
                    {parts[0]}
                    {parts[1] && (
                      <span className="text-primary font-medium ml-1">{parts[1]}</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Price + actions zone */}
        <div className="w-full sm:w-[200px] md:w-[220px] flex-shrink-0 flex flex-col">
          <div className="mb-2">
            <span className="text-2xl font-bold text-text-primary">
              £{price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
            {savings != null && savings > 0 && (
              <span className="text-sm text-sale font-bold ml-2">
                Save £{savings.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {wasPrice != null && wasPrice > price && (
            <p className="text-xs text-text-muted line-through mb-1">
              Was £{wasPrice.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </p>
          )}

          {/* Energy rating */}
          {energyRating && (
            <div className="flex items-center gap-1.5 mb-2.5 mt-1">
              <div className="flex items-center border border-border rounded overflow-hidden text-[10px]">
                <span className="bg-white px-1.5 py-0.5 font-bold text-text-primary border-r border-border">
                  <svg width="10" height="10" viewBox="0 0 16 16" className="inline -mt-0.5 mr-0.5">
                    <text x="0" y="12" fontSize="11" fontWeight="bold" fill="#333">A</text>
                    <text x="7" y="7" fontSize="6" fill="#333">↑</text>
                    <text x="7" y="14" fontSize="6" fill="#333">G</text>
                  </svg>
                </span>
                <span className={`px-2 py-0.5 font-bold text-white ${
                  energyRating === "A" ? "bg-green-600" :
                  energyRating === "B" ? "bg-green-500" :
                  energyRating === "C" ? "bg-lime-500" :
                  energyRating === "D" ? "bg-yellow-500" :
                  energyRating === "E" ? "bg-orange-500" :
                  energyRating === "F" ? "bg-orange-600" :
                  "bg-red-600"
                }`}>
                  {energyRating}
                </span>
              </div>
              <span className="text-[10px] text-text-secondary">Product fiche</span>
            </div>
          )}

          {/* Delivery info */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 bg-surface rounded-md px-2.5 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007D8A" strokeWidth="2" className="flex-shrink-0">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span className="text-xs font-semibold text-text-primary">
                {deliveryFree ? "Free delivery" : "Delivery available"}
              </span>
            </div>
          </div>

          {/* View product button */}
          <Link
            href={url}
            className="btn-outline w-full text-sm text-center mb-2 no-underline block"
          >
            View product
          </Link>

          {/* Add to basket button */}
          <button
            onClick={onAddToBasket}
            className="btn-primary w-full text-sm flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Add to basket
          </button>
        </div>
      </div>

      {/* Bottom row: Compare + Save for later */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <label className="flex items-center gap-2 text-xs text-primary cursor-pointer">
          <input type="checkbox" className="accent-primary w-4 h-4 rounded" />
          Compare
        </label>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          Save for later
        </button>
      </div>
    </div>
  );
}
