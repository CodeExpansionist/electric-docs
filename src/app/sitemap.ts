import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Category data files and their URL slugs
const categoryFiles = [
  { file: "category-tvs.json", slug: "televisions/tvs" },
  {
    file: "dvd-blu-ray.json",
    slug: "dvd-blu-ray-and-home-cinema",
  },
  {
    file: "soundbars.json",
    slug: "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/sound-bars",
  },
  { file: "speakers-hifi.json", slug: "speakers-and-hi-fi-systems" },
  { file: "tv-accessories.json", slug: "tv-accessories" },
  { file: "digital-smart-tv.json", slug: "digital-and-smart-tv" },
  { file: "headphones.json", slug: "headphones/headphones" },
  {
    file: "tv-wall-brackets.json",
    slug: "tv-accessories/tv-wall-brackets-and-stands/tv-wall-brackets",
  },
  { file: "cables-accessories.json", slug: "tv-accessories/cables-and-accessories" },
  { file: "remote-controls.json", slug: "tv-accessories/remote-controls" },
  { file: "tv-aerials.json", slug: "tv-accessories/tv-aerials" },
  { file: "radios.json", slug: "radios" },
  {
    file: "blu-ray-dvd-players.json",
    slug: "dvd-blu-ray-and-home-cinema/blu-ray-and-dvd-players",
  },
  {
    file: "home-cinema-systems.json",
    slug: "dvd-blu-ray-and-home-cinema/home-cinema-systems-and-soundbars/home-cinema-systems",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // ---- Static pages ----
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tv-and-audio`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/help-and-support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/track-your-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/services/delivery`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/services/returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/services/gift-cards`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // ---- Category listing pages ----
  const categoryPages: MetadataRoute.Sitemap = categoryFiles.map((cat) => ({
    url: `${SITE_URL}/tv-and-audio/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // ---- Product pages from all categories ----
  const seenUrls = new Set<string>();
  const productPages: MetadataRoute.Sitemap = [];

  for (const cat of categoryFiles) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const data = require(`@/../data/scrape/${cat.file}`);
      const products = (data.products || []) as Array<{
        url?: string;
        productUrl?: string;
      }>;

      for (const p of products) {
        const rawUrl = p.productUrl || p.url;
        if (!rawUrl) continue;

        // Extract the slug from the full URL
        const slug = rawUrl
          .replace(/^https?:\/\/[^/]+\/products\//, "")
          .replace(/^\/products\//, "");

        const fullUrl = `${SITE_URL}/products/${slug}`;

        // Deduplicate (some products appear in multiple categories)
        if (seenUrls.has(fullUrl)) continue;
        seenUrls.add(fullUrl);

        productPages.push({
          url: fullUrl,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } catch {
      // Category data file not available — skip
    }
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
