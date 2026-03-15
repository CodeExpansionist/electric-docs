"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getSizeVariants, type ProductDetail } from "@/lib/product-data";
import { useBasket } from "@/lib/basket-context";
import { useSaved } from "@/lib/saved-context";
import { SITE_URL } from "@/lib/constants";
import type { Product } from "@/lib/types";
import ProductGallery from "@/components/product/ProductGallery";
import PricePanel from "@/components/product/PricePanel";
import ProductSpecs from "@/components/product/ProductSpecs";
import EssentialServices from "@/components/product/EssentialServices";
import CrossSellProducts from "@/components/product/CrossSellProducts";
import BuyTogetherBundle from "@/components/product/BuyTogetherBundle";
import StickyProductHeader from "@/components/product/StickyProductHeader";
import ViewTracker from "@/components/product/ViewTracker";

// ---- Helpers ----

function extractProductId(slug: string): string {
  const match = slug.match(/(\d{6,})\.html$/);
  return match ? match[1] : slug.replace(".html", "");
}

function toProduct(detail: ProductDetail, slug: string): Product {
  const id = extractProductId(slug);
  return {
    id,
    slug,
    title: detail.name,
    brand: detail.brand,
    category: detail.category,
    subcategory: "",
    price: {
      current: detail.price.current,
      was: detail.price.was ?? undefined,
      savings: detail.price.savings ?? undefined,
    },
    images: {
      main: detail.images?.gallery?.[0] || detail.imageLarge || detail.imageUrl || "",
      gallery: detail.images?.gallery || (detail.imageLarge ? [detail.imageLarge] : []),
      thumbnail: detail.images?.thumbnails?.[0] || detail.imageUrl || "",
    },
    rating: detail.rating,
    specs: {},
    keySpecs: detail.specs,
    description: detail.description?.main || "",
    deliveryInfo: {
      freeDelivery: detail.deliveryFree,
      estimatedDate: "Within 3-5 working days",
    },
    badges: detail.badges,
    tags: detail.badges
      .filter((b) => typeof b === "string" && b.toLowerCase().includes("epic deal"))
      .map(() => ({ label: "Epic Deal", type: "epic-deal" as const })),
    offers: detail.offers.map((o) => ({ text: o })),
    energyRating: detail.energyRating ?? undefined,
    energyLabelUrl: detail.energyLabelUrl ?? undefined,
    inStock: true,
  };
}

// ---- Sub-components ----

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
          return (
            <svg key={star} width="16" height="16" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`star-grad-${star}`}>
                  <stop offset={`${fill * 100}%`} stopColor="#E8A317" />
                  <stop offset={`${fill * 100}%`} stopColor="#E0E0E0" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#star-grad-${star})`}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-text-primary">
        {rating}/5
      </span>
      <Link
        href="#reviews"
        className="text-sm text-text-primary underline"
      >
        {count} reviews
      </Link>
    </div>
  );
}

function ShareButton({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(productName);

  const shareOptions = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=Check out this product: ${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 4L12 13 2 4" />
        </svg>
      ),
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E60023">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      label: "Copy link",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
  ];

  const [copied, setCopied] = useState(false);

  const handleClick = (option: typeof shareOptions[0]) => {
    if (option.label === "Copy link") {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    if (option.label === "Email") {
      window.location.href = option.href;
    } else {
      window.open(option.href, "_blank", "noopener,noreferrer,width=600,height=400");
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 py-2.5 text-sm text-primary hover:underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 bg-white rounded-md shadow-lg border border-border py-2 w-48 z-50">
          {shareOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleClick(option)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors text-left"
            >
              {option.icon}
              {option.label === "Copy link" && copied ? "Copied!" : option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4"
      >
        <span className="text-lg font-bold text-text-primary">{title}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function getBreadcrumbs(product: ProductDetail) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "TV & Audio", href: "/tv-and-audio" },
  ];

  const catMap: Record<string, { label: string; href: string }> = {
    TVs: { label: "Televisions", href: "/tv-and-audio/televisions/tvs" },
    "Sound Bars": {
      label: "Sound Bars",
      href: "/tv-and-audio/dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
    },
    "DVD, Blu-ray & Home Cinema": {
      label: "DVD, Blu-ray & Home Cinema",
      href: "/tv-and-audio/dvd-blu-ray-and-home-cinema",
    },
    "HiFi & Speakers": {
      label: "HiFi & Speakers",
      href: "/tv-and-audio/speakers-and-hi-fi-systems",
    },
    "TV Accessories": {
      label: "TV Accessories",
      href: "/tv-and-audio/tv-accessories",
    },
    "Digital & Smart TV": {
      label: "Digital & Smart TV",
      href: "/tv-and-audio/digital-and-smart-tv",
    },
    Headphones: {
      label: "Headphones",
      href: "/tv-and-audio/headphones/headphones",
    },
  };

  if (catMap[product.category]) {
    crumbs.push(catMap[product.category]);
  }

  crumbs.push({ label: product.name, href: "#" });
  return crumbs;
}

function ProductImage({
  src,
  fallbackSrc,
  alt,
}: {
  src: string | null;
  fallbackSrc: string | null;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  if (!imgSrc || failed) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-contain p-6"
      priority
      unoptimized
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

function KeySpecIcon({ icon, index }: { icon: string; index: number }) {
  // Map icon names to SVG paths
  const icons: Record<string, React.ReactNode> = {
    "icon-resolution": (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    "icon-refresh-rate": (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    "icon-hdmi": (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </>
    ),
    "icon-warranty": (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    processor: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      </>
    ),
    display: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    "refresh-rate": (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    hdmi: (
      <>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </>
    ),
    guarantee: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    "smart-tv": (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  };

  // Fallback icons based on index
  const fallbacks = [
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>,
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </>,
    <>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>,
  ];

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4C12A1"
      strokeWidth="1.5"
    >
      {icons[icon] || fallbacks[index % fallbacks.length]}
    </svg>
  );
}

// ---- Main Component ----

function ProductPageContent({
  product,
  slug,
}: {
  product: ProductDetail;
  slug: string;
}) {
  const { addItem } = useBasket();
  const { addSaved, removeSaved, isSaved } = useSaved();
  const [showToast, setShowToast] = useState(false);
  const breadcrumbs = getBreadcrumbs(product);
  const productId = extractProductId(slug);
  const productData = toProduct(product, slug);
  const saved = isSaved(productId);

  const hasGallery =
    product.images?.gallery && product.images.gallery.length > 1;
  const mainImage = product.imageLarge || product.imageUrl;
  const fallbackImage = product.imageUrl;
  // Get size variants from the mapping (with real URLs for navigation)
  const sizeVariants = productId ? getSizeVariants(productId) : [];

  const handleAddToBasket = () => {
    addItem(productData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleSaved = () => {
    if (saved) {
      removeSaved(productId);
    } else {
      addSaved(productData);
    }
  };

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.main || product.name,
    brand: { "@type": "Brand", name: product.brand },
    image: mainImage || undefined,
    sku: productId,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${slug}`,
      priceCurrency: "GBP",
      price: product.price.current,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Electriz" },
    },
    ...(product.rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Add to basket toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-text-primary">Added to basket</p>
            <Link href="/basket" className="text-xs text-primary hover:underline">View basket</Link>
          </div>
        </div>
      )}
    <div className="container-main py-4">
      <ViewTracker productId={productId} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Sticky header */}
      <StickyProductHeader
        title={product.name}
        price={product.price.current}
        onAddToBasket={handleAddToBasket}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-2.5 flex-wrap">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>&gt;</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="hover:text-primary no-underline text-text-secondary"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-text-primary line-clamp-1">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* ═══ Two-column layout: Left (60%) + Price panel (40%) ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-5 mb-8">
        {/* ── LEFT COLUMN: Title, Rating, Badges, Gallery + Key Specs (60%) ── */}
        <div className="w-full lg:w-[60%] min-w-0">
          {/* Product title */}
          <h1 className="text-2xl font-bold text-text-primary mb-3 leading-7">
            {product.name}
          </h1>

          {/* Star rating */}
          <div className="mb-3">
            <StarRating
              rating={product.rating.average}
              count={product.rating.count}
            />
          </div>

          {/* Badges row */}
          {(product.badgeImages?.length || product.badges.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.badgeImages?.filter(b => !/loved by/i.test(b.type || "")).map((badge, i) => {
                const badgeType = badge.type || "";
                const isEpicDeal = badgeType.toLowerCase().includes("epic deal");
                if (badge.image && badge.image.startsWith("/")) {
                  return (
                    <Image
                      key={i}
                      src={badge.image}
                      alt={badgeType}
                      width={100}
                      height={30}
                      className="h-[30px] w-auto object-contain"
                      unoptimized
                    />
                  );
                }
                return (
                  <span
                    key={i}
                    className={`text-[11px] px-2.5 py-1 rounded-sm font-medium ${
                      isEpicDeal
                        ? "bg-sale text-white"
                        : "border border-border text-text-primary"
                    }`}
                  >
                    {badgeType}
                  </span>
                );
              })}
              {!product.badgeImages &&
                product.badges.filter(b => !/loved by/i.test(typeof b === "string" ? b : String(b))).map((badge, i) => {
                  const badgeText =
                    typeof badge === "string" ? badge : String(badge);
                  const isEpicDeal = badgeText.toLowerCase().includes("epic deal");
                  return (
                    <span
                      key={i}
                      className={`text-[11px] px-2.5 py-1 rounded-sm font-medium ${
                        isEpicDeal
                          ? "bg-sale text-white"
                          : "border border-border text-text-primary"
                      }`}
                    >
                      {badgeText}
                    </span>
                  );
                })}
            </div>
          )}

          {/* Awards row */}
          {product.awards && product.awards.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {product.awards
                .filter((a) => a.name)
                .map((award, i) =>
                  award.image && award.image.startsWith("/") ? (
                    <Image
                      key={i}
                      src={award.image}
                      alt={award.name}
                      width={60}
                      height={40}
                      className="h-8 w-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-sm font-medium border border-border text-text-primary"
                    >
                      {award.name}
                    </span>
                  )
                )}
            </div>
          )}
          {/* Product image / Gallery */}
          <div className="lg:sticky lg:top-4 lg:self-start">
          {hasGallery ? (
            <ProductGallery
              images={product.images!.gallery}
              thumbnails={
                product.images!.thumbnails.length > 0
                  ? product.images!.thumbnails
                  : product.images!.gallery
              }
              alt={product.name}
            />
          ) : (
            <div className="relative aspect-[4/3] bg-white border border-border rounded-[5px] overflow-hidden mb-3">
              <ProductImage
                src={mainImage}
                fallbackSrc={fallbackImage}
                alt={product.name}
              />
            </div>
          )}
          </div>

          {/* Product highlights / features */}
          {product.description && (
            <div className="mt-5 pt-5 border-t border-border">
              {product.description.features && product.description.features.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {product.description.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C2D91" strokeWidth="2.5" className="flex-shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              {product.description.goodToKnow && product.description.goodToKnow.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-primary">Good to know</h4>
                  {product.description.goodToKnow.slice(0, 4).map((item, i) => (
                    <p key={i} className="text-[11px] text-text-secondary leading-relaxed">
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Price panel (40%) ── */}
        <div className="w-full lg:w-[40%] min-w-0 bg-[#f9f9f9] rounded-lg p-5">
          <PricePanel
            price={product.price.current}
            wasPrice={product.price.was}
            savings={product.price.savings}
            offers={product.offers}
            sizeVariants={sizeVariants.length > 0 ? sizeVariants : (product.sizeOptions || []).map(s => ({
              size: s.size,
              productId: "",
              slug: "",
              price: product.price.current,
              selected: s.selected,
              available: false,
            }))}
            energyRating={product.energyRating}
            energyLabelUrl={product.energyLabelUrl}
            wallBracket={product.wallBracket}
            onAddToBasket={handleAddToBasket}
          />

          {/* Save for later + Share */}
          <div className="flex items-center justify-between mt-3 pb-2">
            <button
              onClick={handleToggleSaved}
              className="flex items-center gap-2 py-2.5 text-sm text-primary hover:underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {saved ? "Saved" : "Save for later"}
            </button>
            <ShareButton productName={product.name} />
          </div>

          {/* Delivery card */}
          <div className="bg-white rounded-[7px] p-4 mt-4">
            <div className="flex items-start gap-4">
              {/* Van icon column */}
              <div className="flex-shrink-0 mt-0.5">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M19.2 5.333c.957 0 1.733.776 1.733 1.733V8H25.6a5.067 5.067 0 0 1 5.06 4.806l.006.26V21.6c0 .957-.776 1.733-1.733 1.733H28a3.333 3.333 0 0 1-6.667 0H10.4a3.333 3.333 0 0 1-6.667 0h-.667A1.733 1.733 0 0 1 1.333 21.6V10.4A5.067 5.067 0 0 1 6.4 5.333h12.8zm5.489 16a1.997 1.997 0 0 1 1.977 2 2 2 0 1 1-2.022-2h.045zm4.244.667h-1.21a3.334 3.334 0 0 0-6.113 0H10.122a3.334 3.334 0 0 0-6.112 0h-.944a.4.4 0 0 1-.4-.4V10.4A3.733 3.733 0 0 1 6.4 6.666h12.8c.22 0 .4.18.4.4V19.466a.667.667 0 1 0 1.333 0V9.333H25.6a3.733 3.733 0 0 1 3.733 3.733V21.6a.4.4 0 0 1-.4.4zm-22.801-.436a2 2 0 1 0 .957-.23l-.023-.001h-.022a1.997 1.997 0 0 0-.912.231z" fill="#328636"/>
                  <path opacity=".25" fillRule="evenodd" clipRule="evenodd" d="M20.933 7.066c0-.957-.776-1.733-1.733-1.733H6.4A5.067 5.067 0 0 0 1.333 10.4v11.2c0 .957.776 1.733 1.733 1.733h.667a3.333 3.333 0 0 0 6.667 0h10.933a3.333 3.333 0 0 0 6.667 0h.933c.957 0 1.733-.776 1.733-1.733v-8.534l-.006-.26A5.067 5.067 0 0 0 25.6 8h-4.667v-.934z" fill="#328636"/>
                </svg>
              </div>
              {/* Text column */}
              <div className="flex-1 min-w-0">
                {product.deliveryInfo ? (
                  <>
                    <p className="text-sm text-[#213038]">
                      <span className="font-bold">Next day delivery</span>{" "}
                      from £{product.deliveryInfo.nextDayDeliveryPrice || 30} (order by 7pm)
                    </p>
                    <p className="text-sm text-[#213038] mt-1">
                      Standard delivery:{" "}
                      {product.deliveryInfo.freeDelivery ? (
                        <span className="font-bold">FREE</span>
                      ) : (
                        `£${product.deliveryInfo.standardDeliveryPrice || 20}`
                      )}
                    </p>
                    <p className="text-sm text-[#213038] mt-1.5 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#328636" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                      Choose your delivery day (Monday-Sunday)
                    </p>
                    <p className="text-sm text-[#213038] mt-1 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#328636" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                      Morning, afternoon and evening slots
                    </p>
                  </>
                ) : product.deliveryFree ? (
                  <>
                    <p className="text-sm text-[#213038]">
                      <span className="font-bold">Next day delivery</span>{" "}
                      from £30 (order by 7pm)
                    </p>
                    <p className="text-sm text-[#213038] mt-1">
                      Standard delivery: <span className="font-bold">FREE</span>
                    </p>
                    <p className="text-sm text-[#213038] mt-1.5 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#328636" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                      Choose your delivery day (Monday-Sunday)
                    </p>
                    <p className="text-sm text-[#213038] mt-1 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#328636" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                      Morning, afternoon and evening slots
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-[#213038]">
                      <span className="font-bold">Next day delivery</span> from £30 (order by 7pm)
                    </p>
                    <p className="text-sm text-[#213038] mt-1">Standard delivery: £20</p>
                  </>
                )}
                <p className="text-sm text-[#213038] underline mt-2 cursor-pointer">Check delivery for your area</p>
              </div>
            </div>
          </div>

          {/* Essential Services */}
          {product.essentialServices && product.essentialServices.length > 0 && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <EssentialServices services={product.essentialServices} />
            </div>
          )}

          {/* Cross-sell products */}
          {product.crossSellProducts && product.crossSellProducts.length > 0 && (
            <div className="bg-light-purple rounded-[10px] p-5 mt-4 -mx-5 -mb-5">
              <CrossSellProducts products={product.crossSellProducts} />
            </div>
          )}
        </div>
      </div>

      {/* Buy together bundle */}
      {product.crossSellProducts && product.crossSellProducts.length > 0 && (
        <BuyTogetherBundle
          currentProduct={{
            title: product.name,
            price: product.price.current,
            image: product.images?.gallery?.[0] || product.imageLarge,
          }}
          bundleProducts={product.crossSellProducts}
          bundleDeal={product.bundleDeals?.[0]}
        />
      )}

      {/* Collapsible sections */}
      <div className="mb-10">
        <CollapsibleSection title="Product information" defaultOpen>
          <div className="text-sm text-text-secondary leading-relaxed space-y-3">
            {/* Product code */}
            {product.modelNumber && (
              <p className="text-xs text-text-muted">
                Product code: {product.modelNumber}
              </p>
            )}

            {product.description?.main ? (
              <>
                <p>{product.description.main}</p>
                {product.description.goodToKnow &&
                  product.description.goodToKnow.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">
                        Good to know
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.description.goodToKnow.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {product.description.additionalInformation &&
                  product.description.additionalInformation.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">
                        Please note:
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        {product.description.additionalInformation.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {product.description.whyWeLoveIt && (
                  <div className="bg-surface p-4 rounded-lg mt-3">
                    <p className="text-sm italic text-text-primary mb-1">
                      &ldquo;{product.description.whyWeLoveIt.quote}&rdquo;
                    </p>
                    <p className="text-xs text-text-secondary">
                      — {product.description.whyWeLoveIt.author}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>
                  Discover the {product.name} from {product.brand}. Built with
                  cutting-edge technology to deliver outstanding performance and
                  quality.
                </p>
                {product.specs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Key features
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {product.specs.map((spec, i) => (
                        <li key={i}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Specifications">
          {product.specifications &&
          Object.keys(product.specifications).length > 0 ? (
            <ProductSpecs specifications={product.specifications} />
          ) : (
            <div className="space-y-1">
              <div className="flex text-xs py-2 border-b border-border">
                <span className="w-2/5 text-text-secondary font-medium">
                  Brand
                </span>
                <span className="w-3/5 text-text-primary">
                  {product.brand}
                </span>
              </div>
              {product.energyRating && (
                <div className="flex text-xs py-2 border-b border-border">
                  <span className="w-2/5 text-text-secondary font-medium">
                    Energy Rating
                  </span>
                  <span className="w-3/5 text-text-primary">
                    {product.energyRating}
                  </span>
                </div>
              )}
              {product.specs.map((spec, i) => {
                const parts = spec.split(":");
                if (parts.length === 2) {
                  return (
                    <div
                      key={i}
                      className="flex text-xs py-2 border-b border-border"
                    >
                      <span className="w-2/5 text-text-secondary font-medium">
                        {parts[0].trim()}
                      </span>
                      <span className="w-3/5 text-text-primary">
                        {parts[1].trim()}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="flex text-xs py-2 border-b border-border"
                  >
                    <span className="w-2/5 text-text-secondary font-medium">
                      Feature
                    </span>
                    <span className="w-3/5 text-text-primary">{spec}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Reviews">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold">
              {product.rating.average}
            </span>
            <div>
              <StarRating
                rating={product.rating.average}
                count={product.rating.count}
              />
              <p className="text-xs text-text-secondary mt-1">
                Based on {product.rating.count} reviews
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Delivery & returns">
          <div className="space-y-2 text-xs text-text-secondary">
            {product.deliveryInfo ? (
              <>
                {product.deliveryInfo.standardDeliveryPrice !== undefined && (
                  <p>
                    Standard delivery: £
                    {product.deliveryInfo.standardDeliveryPrice}.00 (within{" "}
                    {product.deliveryInfo.standardDeliveryDays || "3-5"} working
                    days)
                  </p>
                )}
                {product.deliveryInfo.nextDayDeliveryPrice !== undefined && (
                  <p>
                    Next day delivery: £
                    {product.deliveryInfo.nextDayDeliveryPrice}.00
                  </p>
                )}
                {product.deliveryInfo.freeDelivery && (
                  <p>
                    <span className="font-semibold text-text-primary">
                      FREE standard delivery
                    </span>
                  </p>
                )}
              </>
            ) : product.deliveryFree ? (
              <p>
                <span className="font-semibold text-text-primary">
                  FREE standard delivery
                </span>{" "}
                within 3-5 working days
              </p>
            ) : (
              <>
                <p>Standard delivery: from £20.00 (within 3-5 working days)</p>
                <p>Next day delivery: from £30.00</p>
              </>
            )}
            <p>Free delivery on orders over £40</p>
            <p className="mt-2">
              Changed your mind? You can return most products within 30 days of
              purchase for a full refund.
            </p>
          </div>
        </CollapsibleSection>
      </div>
    </div>
    </div>
  );
}

export default function ProductsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="container-main py-12 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Product not found
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          We couldn&apos;t find the product you&apos;re looking for.
        </p>
        <Link href="/tv-and-audio" className="btn-primary">
          Browse TV &amp; Audio
        </Link>
      </div>
    );
  }

  return <ProductPageContent product={product} slug={slug} />;
}
