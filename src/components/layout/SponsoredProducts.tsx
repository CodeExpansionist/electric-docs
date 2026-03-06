import Link from "next/link";
import Image from "next/image";

const productImages = [
  "/images/products/10282706/main.webp",
  "/images/products/10115697/main.webp",
  "/images/products/10132171/main.webp",
  "/images/products/10004693/main.webp",
  "/images/products/10119436/main.webp",
  "/images/products/10138707/main.webp",
];

const products = [
  {
    name: "TURTLE BEACH Stealth 700 Gen 3 Xbox Wireless Gaming Headset",
    price: 129.99,
    originalPrice: 179.0,
    savings: 49.01,
    rating: 4.8,
    reviewCount: 27,
    url: "/products/turtle-beach-stealth-700-gen-3-xbox",
  },
  {
    name: "TURTLE BEACH Recon 70 Gaming Headset - Black & Green",
    price: 22.99,
    originalPrice: 29.99,
    savings: 7.0,
    rating: 4.4,
    reviewCount: 570,
    url: "/products/turtle-beach-recon-70",
  },
  {
    name: "FITBIT Charge 6 Fitness Tracker - Coral / Wireless",
    price: 139.99,
    originalPrice: null,
    savings: null,
    rating: 4.5,
    reviewCount: 169,
    url: "/products/fitbit-charge-6",
  },
  {
    name: "TURTLE BEACH Ear Force Recon 50X Gaming Headset - Black & Green",
    price: 14.99,
    originalPrice: 19.99,
    savings: 5.0,
    rating: 4.4,
    reviewCount: 183,
    url: "/products/turtle-beach-ear-force-recon-50x",
  },
  {
    name: "TURTLE BEACH Recon 4 Pro Wireless Gaming Headset - Black",
    price: 79.99,
    originalPrice: 89.01,
    savings: 9.02,
    rating: null,
    reviewCount: null,
    url: "/products/turtle-beach-recon-4-pro",
  },
  {
    name: "TURTLE BEACH Atlas 200 PlayStation Gaming Headset",
    price: 39.99,
    originalPrice: 49.99,
    savings: 10.0,
    rating: null,
    reviewCount: null,
    url: "/products/turtle-beach-atlas-200-playstation",
  },
];

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${rating} out of 5 stars, ${count} reviews`}>
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "#E8A317" : "#E0E0E0"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-text-secondary" aria-hidden="true">{rating}</span>
      <span className="text-xs text-primary" aria-hidden="true">
        ({count})
      </span>
    </div>
  );
}

export default function SponsoredProducts() {
  return (
    <section aria-labelledby="sponsored-products-heading" className="py-8">
      <div className="container-main">
        <h2 id="sponsored-products-heading" className="text-xs uppercase tracking-wider text-text-muted mb-4 font-semibold">Sponsored products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product, idx) => (
            <Link
              key={product.name}
              href={product.url}
              className="card p-3 flex flex-col no-underline group"
            >
              {/* Product image */}
              <div className="bg-white border border-border rounded-md mb-3 aspect-square flex items-center justify-center overflow-hidden">
                <Image
                  src={productImages[idx % productImages.length]}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="object-contain p-2"
                />
              </div>

              {/* Rating */}
              {product.rating && product.reviewCount && (
                <StarRating rating={product.rating} count={product.reviewCount} />
              )}

              {/* Title */}
              <h3 className="text-xs text-text-primary font-normal mt-1.5 mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {product.name}
              </h3>

              {/* Price */}
              <div className="mt-auto">
                <span className="text-lg font-bold text-text-primary">
                  £{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted line-through">
                      £{product.originalPrice.toFixed(2)}
                    </span>
                    {product.savings && (
                      <span className="text-xs text-sale font-semibold">
                        Save £{product.savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
