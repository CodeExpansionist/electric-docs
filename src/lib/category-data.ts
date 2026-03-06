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
  breadcrumbs: string[];
  totalProducts: number;
  bannerImage?: string;
  bannerUrl?: string;
  bannerAlt?: string;
  filters: FilterGroup[];
  products: CategoryProduct[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapScrapedData(data: any): CategoryData {
  const filters = (data.filters || [])
    .filter((f: any) => {
      // Remove delivery/collection filter group (not applicable to this site)
      if (f.name === "Delivery & Collection" || f.name === "Delivery and Collection") return false;
      return true;
    })
    .map((f: any) => ({
      ...f,
      // Rename "By Price" to "Price" and "By Brand" to "Brand" for consistency
      name: f.name.replace(/^By\s+/i, ""),
      options: (f.options || []).filter(
        (o: any) => !o.label.toLowerCase().includes("collect from store")
      ),
    })) as FilterGroup[];

  const products = (data.products || []).map((p: any) => {
    const productId = p.productId || "";
    return {
      name: p.name || p.title || "",
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
      specs: p.specs || [],
      badges: p.badges || [],
      offers: p.offers || [],
      deliveryFree: p.deliveryFree ?? true,
      energyRating: p.energyRating || null,
    };
  }) as CategoryProduct[];

  // Recalculate filter option counts from actual product data
  const correctedFilters = filters.map((group) => ({
    ...group,
    options: group.options.map((opt) => ({
      ...opt,
      count: countMatchingProducts(products, group.name, opt.label),
    })).filter((opt) => opt.count > 0),
  }));

  return {
    categoryName: data.categoryName || "",
    categorySlug: data.categorySlug || "",
    breadcrumbs: data.breadcrumbs || [],
    totalProducts: products.length,
    filters: correctedFilters,
    products,
  };
}

function countMatchingProducts(products: CategoryProduct[], groupName: string, label: string): number {
  return products.filter((p) => {
    if (groupName === "Brand") return p.brand.toLowerCase() === label.toLowerCase();

    if (groupName === "Price") {
      if (label.startsWith("Up to")) {
        const max = parseFloat(label.replace(/[^0-9.]/g, ""));
        return p.price.current > 0 && p.price.current <= max;
      }
      if (label.includes("and above") || label.includes("and over")) {
        const min = parseFloat(label.replace(/[^0-9.]/g, ""));
        return p.price.current >= min;
      }
      const parts = label.match(/£([\d,.]+)\s*(?:to|-)\s*£([\d,.]+)/);
      if (parts) {
        const min = parseFloat(parts[1].replace(",", ""));
        const max = parseFloat(parts[2].replace(",", ""));
        return p.price.current >= min && p.price.current <= max;
      }
      return false;
    }

    if (groupName === "Customer Rating") {
      const stars = parseInt(label);
      return p.rating.average >= stars;
    }

    if (groupName === "Screen Size") {
      const sizeMatches = Array.from(p.name.matchAll(/\b(\d{2,3})(?:"|″|\s)/g));
      const size = sizeMatches.map((m) => parseInt(m[1])).find((n) => n >= 20 && n <= 120);
      if (!size) return false;
      if (label.includes("or more")) {
        const min = parseInt(label.match(/(\d+)/)?.[1] || "0");
        return size >= min;
      }
      const rangeParts = label.match(/(\d+)[\s"]*\s*[-–]\s*(\d+)/);
      if (rangeParts) return size >= parseInt(rangeParts[1]) && size <= parseInt(rangeParts[2]);
      return false;
    }

    if (groupName === "TV Technology") {
      if (label === "LED") return /\bLED\b/.test(p.name) && !/(OLED|QLED|Mini\s*LED)/i.test(p.name);
      if (label === "QLED") return /QLED/i.test(p.name) && !/Neo\s*QLED/i.test(p.name);
      if (label === "Mini LED") return /Mini\s*LED|Miniled/i.test(p.name);
      return p.name.toLowerCase().includes(label.toLowerCase());
    }

    if (groupName === "Resolution") {
      const name = p.name.toLowerCase();
      if (label.includes("4K")) return name.includes("4k");
      if (label.includes("Full HD") || label.includes("1080")) return name.includes("full hd") || name.includes("1080");
      if (label.includes("HD Ready")) return name.includes("hd ready") || name.includes("720");
      return name.includes(label.toLowerCase());
    }

    if (groupName === "Refresh Rate") {
      const text = p.specs.join(" ") + " " + p.name;
      const hzMatch = label.match(/(\d+)\s*Hz/i);
      if (!hzMatch) return false;
      const hz = hzMatch[1];
      return text.includes(hz + " Hz") || text.includes(hz + "Hz");
    }

    if (groupName === "Number of HDMI Ports") {
      const specsText = p.specs.join(" ");
      const hdmiMatch = specsText.match(/HDMI\s*\d*\.?\d*\s*x\s*(\d)/i);
      if (!hdmiMatch) return false;
      const fc = parseInt(label.match(/(\d)/)?.[1] || "0");
      return parseInt(hdmiMatch[1]) === fc;
    }

    if (groupName === "Year of Release") return p.name.includes(label);

    if (groupName === "Smart TV Platform") {
      return (p.name + " " + p.specs.join(" ")).toLowerCase().includes(label.toLowerCase());
    }

    // Generic text match for Type, Connectivity, Surround Sound, Water Resistance, etc.
    const searchText = (p.name + " " + p.specs.join(" ")).toLowerCase();
    return searchText.includes(label.toLowerCase());
  }).length;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Banner images for each category
const categoryBanners: Record<string, { image: string; url: string; alt: string }> = {
  tvs: {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    alt: "Shop selected Samsung TVs and claim up to £1000 of Samsung tech",
  },
  "dvd-blu-ray": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    alt: "Shop selected Samsung sound bars and save",
  },
  soundbars: {
    image: "/images/banners/wk43-Banner-CE-Samsung-Tech-Desktop.webp",
    url: "/deals-on-tv-and-audio/samsung-dolby-soundbars-offers",
    alt: "Shop selected Samsung soundbars now & claim up to £400 of Samsung tech of your choice! T&Cs apply",
  },
  "speakers-hifi": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/deals-on-tv-and-audio/deals-on-speakers",
    alt: "Great deals on speakers & hi-fi",
  },
  "tv-accessories": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/deals-on-tv-and-audio/free-delivery",
    alt: "Free delivery on selected TV accessories",
  },
  "digital-smart-tv": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/deals-on-tv-and-audio/deals-on-streaming",
    alt: "Great deals on Digital & Smart TV",
  },
  headphones: {
    image: "/images/banners/wk43-banner-samsung-buds4-pro-FAT-CAT-desktop.webp",
    url: "/deals-on-tv-and-audio/samsung-galaxy-buds4-offers",
    alt: "Samsung Galaxy Buds4 Pro.",
  },
  "tv-wall-brackets": {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/deals-on-tv-and-audio/free-delivery",
    alt: "Free delivery on selected TV wall brackets",
  },
  "cables-accessories": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/services/ways-to-pay/trade-in.html",
    alt: "It pays to trade-in",
  },
  "remote-controls": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/services/ways-to-pay/trade-in.html",
    alt: "It pays to trade-in",
  },
  "tv-aerials": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/services/ways-to-pay/trade-in.html",
    alt: "It pays to trade-in",
  },
  radios: {
    image: "/images/banners/wk42-block-Free-Delivery-v1.webp",
    url: "/deals-on-tv-and-audio/deals-on-radios",
    alt: "Great deals on radios",
  },
  "blu-ray-dvd-players": {
    image: "/images/banners/pdp-trade-in-header-desktop.webp",
    url: "/services/ways-to-pay/trade-in.html",
    alt: "It pays to trade-in",
  },
  "home-cinema-systems": {
    image: "/images/banners/wk43-Banner-CE-Samsung-Your-Gift-Desktop.webp",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
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
      categoryName: "TVs",
      categorySlug: "televisions/tvs",
      breadcrumbs: ["Home", "TV & Audio", "Televisions", "All TVs"],
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
      breadcrumbs: ["Home", "TV & Audio", "DVD, Blu-ray & Home Cinema"],
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
      breadcrumbs: ["Home", "TV & Audio", "DVD, Blu-ray & Home Cinema", "Home Cinema & Soundbars", "Sound Bars"],
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
      breadcrumbs: ["Home", "TV & Audio", "Speakers & Hi-Fi Systems"],
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
      breadcrumbs: ["Home", "TV & Audio", "TV Accessories"],
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
      breadcrumbs: ["Home", "TV & Audio", "Digital & Smart TV"],
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
      breadcrumbs: ["Home", "TV & Audio", "Headphones", "Headphones"],
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
      breadcrumbs: ["Home", "TV & Audio", "TV Accessories", "Wall Brackets & Stands", "TV Wall Brackets"],
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
      breadcrumbs: ["Home", "TV & Audio", "TV Accessories", "Cables & Accessories"],
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
      breadcrumbs: ["Home", "TV & Audio", "TV Accessories", "Remote Controls"],
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
      breadcrumbs: ["Home", "TV & Audio", "TV Accessories", "TV Aerials"],
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
      breadcrumbs: ["Home", "TV & Audio", "Radios"],
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
      breadcrumbs: ["Home", "TV & Audio", "DVD, Blu-ray & Home Cinema", "Blu-ray & DVD Players"],
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
      breadcrumbs: ["Home", "TV & Audio", "DVD, Blu-ray & Home Cinema", "Home Cinema & Soundbars", "Home Cinema Systems"],
      bannerImage: banner.image,
      bannerUrl: banner.url,
      bannerAlt: banner.alt,
    };
  },
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

    if (matchingBrandProduct) {
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
      const recalcFilters = parentData.filters.map((group) => ({
        ...group,
        options: group.options
          .map((opt) => ({
            ...opt,
            count: countMatchingProducts(filtered, group.name, opt.label),
          }))
          .filter((opt) => opt.count > 0),
      }));

      return {
        ...parentData,
        categoryName,
        categorySlug: slugSegments.join("/"),
        breadcrumbs: [...parentData.breadcrumbs, categoryName],
        products: filtered,
        totalProducts: filtered.length,
        filters: recalcFilters,
      };
    }
  }

  return null;
}

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
  breadcrumbs: string[];
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
