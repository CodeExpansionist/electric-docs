import { getCategoryData, type CategoryProduct } from "./category-data";

export interface SearchResult extends CategoryProduct {
  category: string;
  categorySlug: string;
}

const allCategorySlugs = [
  { slugs: ["televisions", "tvs"], name: "Televisions" },
  { slugs: ["dvd-blu-ray-and-home-cinema"], name: "DVD, Blu-ray & Home Cinema" },
  {
    slugs: ["dvd-blu-ray-and-home-cinema", "home-cinema-systems-and-soundbars", "sound-bars"],
    name: "Sound Bars",
  },
  { slugs: ["speakers-and-hi-fi-systems"], name: "HiFi & Speakers" },
  { slugs: ["tv-accessories"], name: "TV Accessories" },
  { slugs: ["digital-and-smart-tv"], name: "Digital & Smart TV" },
  { slugs: ["headphones", "headphones"], name: "Headphones" },
  {
    slugs: ["tv-accessories", "tv-wall-brackets-and-stands", "tv-wall-brackets"],
    name: "TV Wall Brackets",
  },
  { slugs: ["tv-accessories", "cables-and-accessories"], name: "Cables & Accessories" },
  { slugs: ["tv-accessories", "remote-controls"], name: "Remote Controls" },
  { slugs: ["tv-accessories", "tv-aerials"], name: "TV Aerials" },
  { slugs: ["radios"], name: "Radios" },
  {
    slugs: ["dvd-blu-ray-and-home-cinema", "blu-ray-and-dvd-players"],
    name: "Blu-ray & DVD Players",
  },
  {
    slugs: ["dvd-blu-ray-and-home-cinema", "home-cinema-systems-and-soundbars", "home-cinema-systems"],
    name: "Home Cinema Systems",
  },
];

let cachedProducts: SearchResult[] | null = null;

function getAllSearchProducts(): SearchResult[] {
  if (cachedProducts) return cachedProducts;

  const allProducts: SearchResult[] = [];
  const seen = new Set<string>();

  for (const cat of allCategorySlugs) {
    const data = getCategoryData(cat.slugs);
    if (data) {
      for (const product of data.products) {
        const key = product.productId || product.name;
        if (!seen.has(key)) {
          seen.add(key);
          allProducts.push({
            ...product,
            name: product.name,
            category: cat.name,
            categorySlug: cat.slugs.join("/"),
          });
        }
      }
    }
  }

  cachedProducts = allProducts;
  return allProducts;
}

/**
 * Score a product against search terms for relevance ranking.
 * Higher score = more relevant.
 */
function scoreProduct(product: SearchResult, terms: string[]): number {
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const category = product.category.toLowerCase();
  const specs = product.specs.join(" ").toLowerCase();

  let score = 0;

  for (const term of terms) {
    // Exact brand match is very high value
    if (brand === term) score += 50;
    else if (brand.includes(term)) score += 30;

    // Name matches
    if (name.includes(term)) score += 20;

    // Category matches
    if (category.includes(term)) score += 15;

    // Spec matches
    if (specs.includes(term)) score += 5;
  }

  // Boost products with ratings
  if (product.rating.count > 0) score += 2;
  if (product.rating.average >= 4) score += 3;

  // Boost products with savings (deals)
  if (product.price.savings && product.price.savings > 0) score += 2;

  return score;
}

/**
 * Search all products across 14 categories by query string.
 *
 * Requires ALL query terms to appear in the product's searchable text
 * (name, brand, category, specs, badges, offers). Results are ranked
 * by relevance score. See docs/API_REFERENCE.md for scoring weights.
 *
 * @param query - Space-separated search terms (e.g., "samsung 65 oled")
 * @returns Matching products sorted by relevance score (highest first)
 */
export function searchProducts(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const all = getAllSearchProducts();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  // Filter: ALL terms must appear somewhere in the product's searchable text
  const filtered = all.filter((product) => {
    const searchable = [
      product.name,
      product.brand,
      product.category,
      product.categorySlug.replace(/[-/]/g, " "),
      ...product.specs,
      ...product.badges,
      ...product.offers,
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });

  // Then score for relevance ranking
  const scored = filtered
    .map((product) => ({ product, score: scoreProduct(product, terms) }))
    .sort((a, b) => b.score - a.score);

  return scored.map(({ product }) => product);
}

export interface Suggestion {
  type: "product" | "category" | "brand";
  text: string;
  url: string;
  image?: string | null;
  price?: number;
  category?: string;
}

/**
 * Get autocomplete suggestions for the search bar dropdown.
 *
 * Returns a mixed list of:
 *   1. Category matches (max 2) — matching category names
 *   2. Brand matches (max 2) — matching brands sorted by product count
 *   3. Product matches — individual products scored by relevance
 *
 * Used by the Header search bar via `/api/search?mode=suggest`.
 *
 * @param query - Partial search text
 * @param limit - Max total suggestions (default 8)
 */
export function getSuggestions(query: string, limit: number = 8): Suggestion[] {
  if (!query.trim()) return [];

  const all = getAllSearchProducts();
  const q = query.toLowerCase().trim();
  const suggestions: Suggestion[] = [];

  // 1. Category suggestions
  const categoryMatches = allCategorySlugs.filter((cat) =>
    cat.name.toLowerCase().includes(q)
  );
  for (const cat of categoryMatches.slice(0, 2)) {
    const data = getCategoryData(cat.slugs);
    suggestions.push({
      type: "category",
      text: cat.name,
      url: `/tv-and-audio/${cat.slugs.join("/")}`,
      category: `${data?.products.length || 0} products`,
    });
  }

  // 2. Brand suggestions
  const brandCounts = new Map<string, number>();
  for (const p of all) {
    if (p.brand.toLowerCase().includes(q)) {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
    }
  }
  const topBrands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  for (const [brand, count] of topBrands) {
    suggestions.push({
      type: "brand",
      text: brand,
      url: `/search?q=${encodeURIComponent(brand)}`,
      category: `${count} products`,
    });
  }

  // 3. Product suggestions — match by name
  const terms = q.split(/\s+/).filter(Boolean);
  const productMatches = all
    .map((p) => ({ product: p, score: scoreProduct(p, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit - suggestions.length);

  for (const { product } of productMatches) {
    suggestions.push({
      type: "product",
      text: product.name,
      url: product.url,
      image: product.imageUrl,
      price: product.price.current,
      category: product.category,
    });
  }

  return suggestions.slice(0, limit);
}
