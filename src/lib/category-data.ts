import tvsData from "@/../data/scrape/category-tvs.json";
import dvdBluRayData from "@/../data/scrape/dvd-blu-ray.json";
import soundbarsData from "@/../data/scrape/soundbars.json";
import speakersHifiData from "@/../data/scrape/speakers-hifi.json";
import tvAccessoriesData from "@/../data/scrape/tv-accessories.json";
import digitalSmartTvData from "@/../data/scrape/digital-smart-tv.json";
import headphonesData from "@/../data/scrape/headphones.json";

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

  const products = (data.products || []).map((p: any) => ({
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
    url: (p.url || p.productUrl || "#").replace("https://www.currys.co.uk", ""),
    imageUrl: p.imageUrl || null,
    productId: p.productId,
    specs: p.specs || [],
    badges: p.badges || [],
    offers: p.offers || [],
    deliveryFree: p.deliveryFree ?? true,
    energyRating: p.energyRating || null,
  })) as CategoryProduct[];

  return {
    categoryName: data.categoryName || "",
    categorySlug: data.categorySlug || "",
    breadcrumbs: data.breadcrumbs || [],
    totalProducts: data.totalProducts || products.length,
    filters,
    products,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Banner images for each category
const categoryBanners: Record<string, { image: string; url: string; alt: string }> = {
  tvs: {
    image: "https://media.currys.biz/i/currysprod/wk43-Banner-CE-Samsung-Your-Gift-Desktop?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    alt: "Shop selected Samsung TVs and claim up to £1000 of Samsung tech",
  },
  "dvd-blu-ray": {
    image: "https://media.currys.biz/i/currysprod/wk43-Banner-CE-Samsung-Your-Gift-Desktop?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    alt: "Shop selected Samsung sound bars and save",
  },
  soundbars: {
    image: "https://media.currys.biz/i/currysprod/wk43-Banner-CE-Samsung-Your-Gift-Desktop?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/deals-on-selected-samsung-tvs",
    alt: "Amazing deals on soundbars",
  },
  "speakers-hifi": {
    image: "https://media.currys.biz/i/currysprod/wk42-block-Free-Delivery-v1?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/deals-on-speakers",
    alt: "Great deals on speakers & hi-fi",
  },
  "tv-accessories": {
    image: "https://media.currys.biz/i/currysprod/wk42-block-Free-Delivery-v1?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/free-delivery",
    alt: "Free delivery on selected TV accessories",
  },
  "digital-smart-tv": {
    image: "https://media.currys.biz/i/currysprod/wk43-Banner-CE-Samsung-Your-Gift-Desktop?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/deals-on-streaming",
    alt: "Great deals on Digital & Smart TV",
  },
  headphones: {
    image: "https://media.currys.biz/i/currysprod/wk43-block-samsung-buds4-pro?fmt=auto&$q-large$",
    url: "/deals-on-tv-and-audio/samsung-galaxy-buds4-offers",
    alt: "Pre-order the new Galaxy Buds4 Pro now",
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
      totalProducts: tvsData.totalProducts || 420,
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
};

export function getCategoryData(slugSegments: string[]): CategoryData | null {
  // Join the slug segments to match against our map
  const fullSlug = slugSegments.join("/");

  // Try exact match first
  if (categoryMap[fullSlug]) {
    return categoryMap[fullSlug]();
  }

  // Try matching just the last segment if nested
  for (const [key, getter] of Object.entries(categoryMap)) {
    if (key.endsWith(fullSlug) || fullSlug.endsWith(key)) {
      return getter();
    }
  }

  return null;
}
