import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.currys.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tv-and-audio`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tv-and-audio/televisions/tvs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/help-and-support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/track-your-order`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/services/delivery`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/services/returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/services/gift-cards`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic product pages — load from category data
  let productPages: MetadataRoute.Sitemap = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tvsData = require("@/../data/scrape/category-tvs.json");
    const products = (tvsData.products || []) as Array<{ url?: string }>;
    productPages = products
      .filter((p) => p.url)
      .slice(0, 200) // Limit to first 200 for sitemap manageability
      .map((p) => {
        const slug = (p.url as string)
          .replace("https://www.currys.co.uk/products/", "")
          .replace(/^\/products\//, "");
        return {
          url: `${BASE_URL}/products/${slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      });
  } catch {
    // Category data not available — skip product URLs
  }

  return [...staticPages, ...productPages];
}
