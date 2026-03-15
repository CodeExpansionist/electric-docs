import { stripDomain } from "@/lib/constants";
import tvsData from "@/../data/scrape/category-tvs.json";
import dvdBluRayData from "@/../data/scrape/dvd-blu-ray.json";
import soundbarsData from "@/../data/scrape/soundbars.json";
import speakersHifiData from "@/../data/scrape/speakers-hifi.json";
import tvAccessoriesData from "@/../data/scrape/tv-accessories.json";
import digitalSmartTvData from "@/../data/scrape/digital-smart-tv.json";
import headphonesData from "@/../data/scrape/headphones.json";
import tvWallBracketsData from "@/../data/scrape/tv-wall-brackets.json";
import cablesAccessoriesData from "@/../data/scrape/cables-accessories.json";
import remoteControlsData from "@/../data/scrape/remote-controls.json";
import tvAerialsData from "@/../data/scrape/tv-aerials.json";
import radiosData from "@/../data/scrape/radios.json";
import bluRayDvdPlayersData from "@/../data/scrape/blu-ray-dvd-players.json";
import homeCinemaSystemsData from "@/../data/scrape/home-cinema-systems.json";
import hubTvAccessories from "@/../data/scrape/hub-tv-accessories.json";
import hubDvdBluray from "@/../data/scrape/hub-dvd-blu-ray.json";
import hubSpeakersHifi from "@/../data/scrape/hub-speakers-hifi.json";
import { getListingImage } from "./images";
import { doesProductMatchFilter } from "./filter-utils";

/**
 * Filter groups where doesProductMatchFilter() has reliable explicit handlers.
 * For sub-category pages, only these groups have 0-count options removed.
 * Groups NOT in this set keep all parent options (generic text fallback is
 * too unreliable with our incomplete spec data).
 */
const RELIABLE_FILTER_GROUPS = new Set([
  "Brand", "Price", "Customer Rating", "Type", "Screen Size",
  "Screen technology", "TV Technology", "Resolution",
  "Refresh rate", "Refresh Rate", "Number of HDMI Ports",
  "Year", "Year of Release", "Smart platform", "Smart TV Platform",
  "Energy rating", "Loved by Electriz", "Popular screen sizes",
  "Guarantee", "VESA", "Max. weight",
]);

export interface CategoryProduct {
  name: string;
  brand: string;
  price: { current: number; was: number | null; savings: number | null };
  rating: { average: number; count: number };
  url: string;
  imageUrl: string | null;
  productId?: string;
  specs: string[];
  badges: string[];
  offers: string[];
  deliveryFree: boolean;
  energyRating?: string | null;
  energyLabelUrl?: string | null;
}

export interface FilterGroup {
  name: string;
  isExpanded: boolean;
  type: "checkbox" | "range" | "toggle" | "rating";
  options: Array<{ label: string; count: number }>;
}

export interface CategoryData {
  categoryName: string;
  categorySlug: string;
  breadcrumbs: { label: string; href: string }[];
  totalProducts: number;
  bannerImage?: string;
  bannerUrl?: string;
  bannerAlt?: string;
  filters: FilterGroup[];
  products: CategoryProduct[];
  /** Pre-applied filters from URL (e.g., brand from /tvs/sony). */
  preSelectedFilters?: Record<string, string[]>;
  /** Full parent product set before URL-based filtering (for cross-count recalculation). */
  unfilteredProducts?: CategoryProduct[];
  /** Full parent filters before 0-count option removal (for cross-count recalculation). */
  unfilteredFilters?: FilterGroup[];
}

/** Raw shape of scraped category JSON before normalization. */
interface RawCategoryJSON {
  categoryName?: string;
  categorySlug?: string;
  breadcrumbs?: { label: string; href: string }[];
  filters?: Array<{ name: string; isExpanded?: boolean; type?: string; options?: Array<{ label: string; count: number }> }>;
  products?: Array<Record<string, unknown>>;
  bannerImage?: string;
  bannerUrl?: string;
  bannerAlt?: string;
}

function mapScrapedData(data: RawCategoryJSON): CategoryData {
  const filters = (data.filters || [])
    .filter((f) => {
      // Remove delivery/collection filter group (not applicable to this site)
      if (f.name === "Delivery & Collection" || f.name === "Delivery and Collection") return false;
      return true;
    })
    .map((f) => ({
      ...f,
      // Rename "By Price" to "Price" and "By Brand" to "Brand" for consistency
      name: f.name.replace(/^By\s+/i, ""),
      options: (f.options || []).filter((o) => {
        if (o.label.toLowerCase().includes("collect from store")) return false;
        // Remove 5-star rating option (not shown on reference site)
        if (f.name === "Customer Rating" && /^5\b/.test(o.label)) return false;
        // Hide options with zero count
        if (o.count <= 0) return false;
        return true;
      }),
    })) as FilterGroup[];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const products = (data.products || []).map((p: any) => {
    const productId = p.productId || "";
    return {
      name: (p.name || p.title || "").replace(/\\"/g, '"'),
      brand: p.brand || "",
      price: {
        current: p.price?.current ?? (typeof p.price === "number" ? p.price : 0),
        was: p.price?.was ?? p.wasPrice ?? null,
        savings: p.price?.savings ?? p.savings ?? null,
      },
      rating: {
        average: p.rating?.average ?? (typeof p.rating === "number" ? p.rating : 0),
        count: p.rating?.count ?? p.reviewCount ?? 0,
      },
      url: stripDomain(p.url || p.productUrl || "#"),
      imageUrl: productId ? getListingImage(productId) : (p.imageUrl || null),
      productId,
      specs: (p.specs || []).map((s: string) => s.replace(/\\"/g, '"')),
      badges: (p.badges || []).map((b: string) => b.replace(/\\"/g, '"')),
      offers: (p.offers || []).map((o: string) => o.replace(/\\"/g, '"')),
      deliveryFree: p.deliveryFree ?? true,
      energyRating: p.energyRating || null,
      energyLabelUrl: null,
    };
  }) as CategoryProduct[];

  // Use scraped filter counts as-is — they come directly from the reference
  // site and represent the ground-truth options. The matching logic in
  // filter-utils.ts handles actual product filtering when users click;
  // counts here are display-only.

  return {
    categoryName: data.categoryName || "",
    categorySlug: data.categorySlug || "",
    breadcrumbs: data.breadcrumbs || [],
    totalProducts: products.length,
    filters,
    products,
  };
}

function countMatchingProducts(products: CategoryProduct[], groupName: string, label: string): number {
  return products.filter((p) => doesProductMatchFilter(p, groupName, label)).length;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Banner images for each category
const categoryBanners: Record<string, { image: string; url: string; alt: string }> = {
  tvs: {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/tv-and-audio/televisions/tvs",
    alt: "Shop selected Samsung TVs and claim up to £1000 of Samsung tech",
  },
  "dvd-blu-ray": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/tv-and-audio/televisions/dvd-blu-ray",
    alt: "Shop selected Samsung sound bars and save",
  },
  soundbars: {
    image: "/images/banners/wk43-Banner-CE-Samsung-Tech-Desktop.webp",
    url: "/tv-and-audio/audio/soundbars",
    alt: "Shop selected Samsung soundbars now & claim up to £400 of Samsung tech of your choice! T&Cs apply",
  },
  "speakers-hifi": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/tv-and-audio/audio/speakers-hifi",
    alt: "Great deals on speakers & hi-fi",
  },
  "tv-accessories": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/tv-and-audio/televisions/tv-accessories",
    alt: "Free delivery on selected TV accessories",
  },
  "digital-smart-tv": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/tv-and-audio/televisions/digital-smart-tv",
    alt: "Great deals on Digital & Smart TV",
  },
  headphones: {
    image: "/images/banners/wk43-banner-samsung-buds4-pro-FAT-CAT-desktop.webp",
    url: "/tv-and-audio/audio/headphones",
    alt: "Samsung Galaxy Buds4 Pro.",
  },
  "tv-wall-brackets": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/tv-and-audio/televisions/tv-wall-brackets",
    alt: "Free delivery on selected TV wall brackets",
  },
  "cables-accessories": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/tv-and-audio/televisions/cables-accessories",
    alt: "It pays to trade-in",
  },
  "remote-controls": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/tv-and-audio/televisions/remote-controls",
    alt: "It pays to trade-in",
  },
  "tv-aerials": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/tv-and-audio/televisions/tv-aerials",
    alt: "It pays to trade-in",
  },
  radios: {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/tv-and-audio/audio/radios",
    alt: "Great deals on radios",
  },
  "blu-ray-dvd-players": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/tv-and-audio/televisions/blu-ray-dvd-players",
    alt: "It pays to trade-in",
  },
  "home-cinema-systems": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/tv-and-audio/audio/home-cinema-systems",
    alt: "Amazing deals on home cinema systems",
  },
};

// Map subcategory URL segments to their data
const categoryMap: Record<string, () => CategoryData> = {
  "televisions/tvs": () => {
    const data = mapScrapedData(tvsData);
    const banner = categoryBanners.tvs;
    return {
      ...data,
      categoryName: "Televisions",
      categorySlug: "televisions/tvs",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "All Televisions", href: "" },
      ],
      totalProducts: data.products.length,
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "dvd-blu-ray-and-home-cinema": () => {
    const data = mapScrapedData(dvdBluRayData);
    const banner = categoryBanners["dvd-blu-ray"];
    return {
      ...data,
      categoryName: "DVD, Blu-ray & Home Cinema",
      categorySlug: "dvd-blu-ray-and-home-cinema",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "DVD, Blu-ray & Home Cinema", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars": () => {
    const data = mapScrapedData(soundbarsData);
    const banner = categoryBanners.soundbars;
    return {
      ...data,
      categoryName: "Sound Bars",
      categorySlug: "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "DVD, Blu-ray & Home Cinema", href: "/tv-and-audio/dvd-blu-ray-and-home-cinema" },
        { label: "Sound Bars", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "speakers-and-hi-fi-systems": () => {
    const data = mapScrapedData(speakersHifiData);
    const banner = categoryBanners["speakers-hifi"];
    return {
      ...data,
      categoryName: "HiFi & Speakers",
      categorySlug: "speakers-and-hi-fi-systems",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "HiFi & Speakers", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "tv-accessories": () => {
    const data = mapScrapedData(tvAccessoriesData);
    const banner = categoryBanners["tv-accessories"];
    return {
      ...data,
      categoryName: "TV Accessories",
      categorySlug: "tv-accessories",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "TV Accessories", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "digital-and-smart-tv": () => {
    const data = mapScrapedData(digitalSmartTvData);
    const banner = categoryBanners["digital-smart-tv"];
    return {
      ...data,
      categoryName: "Digital & Smart TV",
      categorySlug: "digital-and-smart-tv",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "Digital & Smart TV", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "headphones/headphones": () => {
    const data = mapScrapedData(headphonesData);
    const banner = categoryBanners.headphones;
    return {
      ...data,
      categoryName: "Headphones",
      categorySlug: "headphones/headphones",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "Headphones", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets": () => {
    const data = mapScrapedData(tvWallBracketsData);
    const banner = categoryBanners["tv-wall-brackets"];
    return {
      ...data,
      categoryName: "TV Wall Brackets",
      categorySlug: "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "TV Accessories", href: "/tv-and-audio/tv-accessories" },
        { label: "TV Wall Brackets", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "tv-accessories/cables-and-accessories": () => {
    const data = mapScrapedData(cablesAccessoriesData);
    const banner = categoryBanners["cables-accessories"];
    return {
      ...data,
      categoryName: "Cables & Accessories",
      categorySlug: "tv-accessories/cables-and-accessories",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "TV Accessories", href: "/tv-and-audio/tv-accessories" },
        { label: "Cables & Accessories", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "tv-accessories/remote-controls": () => {
    const data = mapScrapedData(remoteControlsData);
    const banner = categoryBanners["remote-controls"];
    return {
      ...data,
      categoryName: "Remote Controls",
      categorySlug: "tv-accessories/remote-controls",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "TV Accessories", href: "/tv-and-audio/tv-accessories" },
        { label: "Remote Controls", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "tv-accessories/tv-aerials": () => {
    const data = mapScrapedData(tvAerialsData);
    const banner = categoryBanners["tv-aerials"];
    return {
      ...data,
      categoryName: "TV Aerials",
      categorySlug: "tv-accessories/tv-aerials",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "TV Accessories", href: "/tv-and-audio/tv-accessories" },
        { label: "TV Aerials", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "radios": () => {
    const data = mapScrapedData(radiosData);
    const banner = categoryBanners.radios;
    return {
      ...data,
      categoryName: "Radios",
      categorySlug: "radios",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "Radios", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players": () => {
    const data = mapScrapedData(bluRayDvdPlayersData);
    const banner = categoryBanners["blu-ray-dvd-players"];
    return {
      ...data,
      categoryName: "Blu-ray & DVD Players",
      categorySlug: "dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "DVD, Blu-ray & Home Cinema", href: "/tv-and-audio/dvd-blu-ray-and-home-cinema" },
        { label: "Blu-ray & DVD Players", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },

  "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems": () => {
    const data = mapScrapedData(homeCinemaSystemsData);
    const banner = categoryBanners["home-cinema-systems"];
    return {
      ...data,
      categoryName: "Home Cinema Systems",
      categorySlug: "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "TV & Audio", href: "/tv-and-audio" },
        { label: "DVD, Blu-ray & Home Cinema", href: "/tv-and-audio/dvd-blu-ray-and-home-cinema" },
        { label: "Home Cinema Systems", href: "" },
      ],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },
};

// Slug → proper display name for meta titles
export const categoryDisplayNames: Record<string, string> = {
  "televisions/tvs": "Televisions",
  "dvd-blu-ray-and-home-cinema": "DVD, Blu-ray & Home Cinema",
  "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars": "Sound Bars",
  "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems": "Home Cinema Systems",
  "dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players": "Blu-ray & DVD Players",
  "speakers-and-hi-fi-systems": "HiFi & Speakers",
  "tv-accessories": "TV Accessories",
  "tv-accessories/cables-and-accessories": "Cables & Accessories",
  "tv-accessories/remote-controls": "Remote Controls",
  "tv-accessories/tv-aerials": "TV Aerials",
  "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets": "TV Wall Brackets",
  "digital-and-smart-tv": "Digital & Smart TV",
  "headphones/headphones": "Headphones",
  "radios": "Radios",
};

// URL aliases — map alternate URL paths to existing categoryMap keys
const categoryAliases: Record<string, string> = {
  "tv-accessories/tv-wall-brackets": "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
  "speakers-and-hi-fi-systems/speakers": "speakers-and-hi-fi-systems",
};

// Subcategory type keyword map — maps slug segments to product-name filter keywords
const subcategoryKeywords: Record<string, string[]> = {
  "tv-stands": ["stand"],
  "standard-tv-stands": ["standard", "stand"],
  "corner-tv-stands": ["corner"],
  "tv-stands-with-mounts": ["mount"],
  "tv-wall-brackets": ["bracket"],
  "tilt-and-swivel-tv-brackets": ["tilt", "swivel"],
  "fixed-tv-brackets": ["fixed", "bracket"],
  "full-motion-tv-brackets": ["full motion", "bracket"],
  "remote-controls": ["remote"],
  "sky-remotes": ["sky"],
  "universal-remotes": ["universal"],
  "tv-aerials": ["aerial"],
  "indoor-tv-aerials": ["indoor"],
  "cables-and-accessories": ["cable", "adapter"],
  "hdmi-cables": ["hdmi"],
  "scart-cables": ["scart"],
  "adapters-and-splitters": ["adapter", "splitter"],
  "aerial-cables": ["aerial cable", "aerial"],
  "portable-bluetooth-speakers": ["portable"],
  "wireless-and-bluetooth-speakers": ["wireless"],
  "megasound-party-speakers": ["megasound", "party speaker"],
  "multi-room-speakers": ["multi-room", "multi room", "multiroom"],
  "hifi-systems": ["hi-fi", "hifi", "turntable"],
  "traditional-hifis": ["hi-fi", "hifi"],
  "speakers": ["speaker"],
  "sound-bars": ["soundbar", "sound bar"],
  "home-cinema-systems": ["home cinema", "surround"],
  "home-cinema-systems-and-soundbars": ["soundbar", "sound bar", "home cinema", "surround"],
  "portable-dvd-players": ["portable"],
  "blu-ray-players": ["blu-ray", "bluray"],
  "4k-ultra-hd-blu-ray-players": ["4k", "uhd"],
  "dvd-players": ["dvd"],
  "dvd-recorders": ["recorder"],
  "dolby-atmos-soundbars": ["dolby atmos", "atmos"],
  "soundbar-subwoofers": ["subwoofer"],
};

// Cache results so expensive filter counting only runs once per category
const categoryCache: Record<string, CategoryData> = {};

/**
 * Phase 1 of category resolution: direct lookup against categoryMap.
 * Tries exact match → alias match → suffix match (for partial URL segments).
 * See docs/CATEGORY_ROUTING.md for the full algorithm.
 */
function lookupCategory(slug: string): CategoryData | null {
  // Exact match
  if (categoryMap[slug]) return categoryMap[slug]();
  // Alias match
  const aliased = categoryAliases[slug];
  if (aliased && categoryMap[aliased]) return categoryMap[aliased]();
  // Suffix match
  for (const [key, getter] of Object.entries(categoryMap)) {
    if (key.endsWith(slug) || slug.endsWith(key)) return getter();
  }
  return null;
}

/**
 * Phase 2 of category resolution: parent + filter fallback.
 *
 * When Phase 1 (lookupCategory) finds no direct match, this function walks
 * backwards through URL slug segments to find the nearest parent category,
 * then filters its products by the remaining segment(s).
 *
 * The last URL segment is checked as:
 *   1. A brand name (e.g., "sony" → filter by brand "Sony")
 *   2. A subcategory keyword (e.g., "portable-bluetooth-speakers" → filter by "portable")
 *
 * Returns a synthetic CategoryData with filtered products and recalculated filter counts.
 * See docs/CATEGORY_ROUTING.md for examples.
 */
function findParentAndFilter(slugSegments: string[]): CategoryData | null {
  for (let i = slugSegments.length - 1; i >= 1; i--) {
    const parentSlug = slugSegments.slice(0, i).join("/");
    const remaining = slugSegments.slice(i);
    const lastSegment = remaining[remaining.length - 1];

    let parentData = lookupCategory(parentSlug);

    // If parent is a hub category, look up the broadest listing for that hub
    if (!parentData && isHubCategory(slugSegments.slice(0, i))) {
      // e.g., speakers-and-hi-fi-systems → speakers-hifi listing
      parentData = lookupCategory(parentSlug);
      // Also try: hub slug + first remaining segment as a full key
      if (!parentData) {
        const extendedSlug = parentSlug + "/" + remaining[0];
        parentData = lookupCategory(extendedSlug);
      }
    }

    if (!parentData) continue;

    // Check if last segment matches a brand
    const brandSlug = lastSegment.toLowerCase();
    const matchingBrandProduct = parentData.products.find((p) => {
      const normalizedBrand = p.brand.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      return normalizedBrand === brandSlug || p.brand.toLowerCase() === brandSlug.replace(/-/g, " ");
    });

    let filtered: CategoryProduct[];
    let categoryName: string;

    // Check if last segment is a screen size range (e.g., "24-31", "55-64", "90-and-more")
    const sizeRangeMatch = lastSegment.match(/^(\d+)-(\d+)$/);
    const sizeOrMoreMatch = lastSegment.match(/^(\d+)-and-more$/);

    if (sizeRangeMatch || sizeOrMoreMatch) {
      const minSize = parseInt(sizeRangeMatch ? sizeRangeMatch[1] : sizeOrMoreMatch![1]);
      const maxSize = sizeRangeMatch ? parseInt(sizeRangeMatch[2]) : Infinity;
      filtered = parentData.products.filter((p) => {
        const sizeMatches = Array.from(p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g));
        const size = sizeMatches.map((m) => parseInt(m[1])).find((n) => n >= 20 && n <= 120);
        if (!size) return false;
        return size >= minSize && size <= maxSize;
      });
      categoryName = sizeOrMoreMatch
        ? `${minSize}" or More TVs`
        : `${minSize}" - ${maxSize}" TVs`;
    } else if (matchingBrandProduct) {
      // Brand filtering
      const brand = matchingBrandProduct.brand;
      filtered = parentData.products.filter((p) => p.brand === brand);
      categoryName = `${brand} ${parentData.categoryName}`;
    } else {
      // Type/subcategory filtering using keywords
      const keywords = subcategoryKeywords[lastSegment] || [lastSegment.replace(/-/g, " ")];
      filtered = parentData.products.filter((p) => {
        const text = (p.name + " " + p.specs.join(" ")).toLowerCase();
        return keywords.some((kw) => text.includes(kw.toLowerCase()));
      });
      categoryName = lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    if (filtered.length > 0) {
      // Use parent's scraped filters with selective 0-count hiding.
      // Reliable groups (Brand, Price, Type, etc.) — hide options with 0 matches.
      // Unreliable groups (Colour, Voice control, etc.) — keep all parent options
      // because our spec data is too incomplete for accurate matching.
      const parentFilters = parentData.filters.map((group) => ({
        ...group,
        options: RELIABLE_FILTER_GROUPS.has(group.name)
          ? group.options.filter(
              (opt) => countMatchingProducts(filtered, group.name, opt.label) > 0
            )
          : group.options,
      }));

      // Build pre-selected filters from URL-based filtering
      const preSelectedFilters: Record<string, string[]> = {};
      if (matchingBrandProduct) {
        preSelectedFilters.Brand = [matchingBrandProduct.brand];
      }

      return {
        ...parentData,
        categoryName,
        categorySlug: slugSegments.join("/"),
        breadcrumbs: [...parentData.breadcrumbs, { label: categoryName, href: "" }],
        products: filtered,
        totalProducts: filtered.length,
        filters: parentFilters,
        preSelectedFilters: Object.keys(preSelectedFilters).length > 0 ? preSelectedFilters : undefined,
        unfilteredProducts: parentData.products,
        unfilteredFilters: parentData.filters,
      };
    }
  }

  return null;
}

/**
 * Main category resolution entry point.
 *
 * Uses a 2-phase algorithm:
 *   Phase 1 (lookupCategory): Direct match against categoryMap (exact → alias → suffix)
 *   Phase 2 (findParentAndFilter): Walk up slug segments, find parent, filter by brand/keyword
 *
 * Results are cached per slug for the server lifecycle.
 * See docs/CATEGORY_ROUTING.md for the full algorithm and examples.
 *
 * @param slugSegments - URL path segments (e.g., ["speakers-and-hi-fi-systems", "portable-bluetooth-speakers"])
 */
export function getCategoryData(slugSegments: string[]): CategoryData | null {
  const fullSlug = slugSegments.join("/");

  if (categoryCache[fullSlug]) return categoryCache[fullSlug];

  // 1. Direct lookup (exact, alias, or suffix match)
  let result = lookupCategory(fullSlug);

  // 2. Smart parent+filter fallback
  if (!result) {
    result = findParentAndFilter(slugSegments);
  }

  if (result) categoryCache[fullSlug] = result;
  return result;
}

// --- Hub (parent category) types and functions ---

export interface HubBanner {
  imageAlt: string;
  imageUrl?: string;
  backgroundColor?: string;
  url: string;
  buttons: { text: string; url: string }[];
}

export interface SubcategoryIcon {
  name: string;
  url: string;
  iconUrl: string;
}

export interface BrandCarouselItem {
  brand: string;
  logoUrl: string;
  url: string;
  subcategoryLinks: { text: string; url: string }[];
}

export interface ContentCard {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export interface CategoryHubData {
  categoryName: string;
  categorySlug: string;
  breadcrumbs: { label: string; href: string }[];
  carouselBanners: HubBanner[];
  subcategoryIcons: SubcategoryIcon[];
  sidebar: {
    topCategories: { text: string; url: string }[];
    popularLinks: { text: string; url: string }[];
    buyingGuides?: { text: string; url: string }[];
  };
  brandCarousel: BrandCarouselItem[];
  helpCards: ContentCard[];
  helpCardsHeading: string;
  helpCardsCta: { text: string; url: string };
  serviceCards: ContentCard[];
  serviceCardsHeading: string;
  seoContent: {
    heading: string;
    columns: { heading: string; text: string }[];
  };
}

const hubMap: Record<string, CategoryHubData> = {
  "tv-accessories": hubTvAccessories as unknown as CategoryHubData,
  "dvd-blu-ray-and-home-cinema": hubDvdBluray as unknown as CategoryHubData,
  "speakers-and-hi-fi-systems": hubSpeakersHifi as unknown as CategoryHubData,
};

export function isHubCategory(slugSegments: string[]): boolean {
  const fullSlug = slugSegments.join("/");
  return fullSlug in hubMap;
}

export function getCategoryHubData(slugSegments: string[]): CategoryHubData | null {
  const fullSlug = slugSegments.join("/");
  return hubMap[fullSlug] || null;
}
