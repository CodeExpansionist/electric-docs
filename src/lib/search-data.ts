import { getCategoryData, type CategoryProduct } from "./category-data";

export interface SearchResult extends CategoryProduct {
  category: string;
  categorySlug: string;
}

const allCategorySlugs = [
  { slugs: ["televisions", "tvs"], name: "TVs" },
  { slugs: ["dvd-blu-ray-and-home-cinema"], name: "DVD, Blu-ray & Home Cinema" },
  {
    slugs: ["dvd-blu-ray-and-home-cinema", "home-cinema-systems-and-soundbars", "sound-bars"],
    name: "Sound Bars",
  },
  { slugs: ["speakers-and-hi-fi-systems"], name: "HiFi & Speakers" },
  { slugs: ["tv-accessories"], name: "TV Accessories" },
  { slugs: ["digital-and-smart-tv"], name: "Digital & Smart TV" },
  { slugs: ["headphones", "headphones"], name: "Headphones" },
];

let cachedProducts: SearchResult[] | null = null;

export function getAllProducts(): SearchResult[] {
  if (cachedProducts) return cachedProducts;

  const allProducts: SearchResult[] = [];

  for (const cat of allCategorySlugs) {
    const data = getCategoryData(cat.slugs);
    if (data) {
      for (const product of data.products) {
        // Avoid duplicates by checking product name
        if (!allProducts.some((p) => p.name === product.name)) {
          allProducts.push({
            ...product,
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

export function searchProducts(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const all = getAllProducts();
  const terms = query.toLowerCase().split(/\s+/);

  return all.filter((product) => {
    const searchable = [
      product.name,
      product.brand,
      product.category,
      ...product.specs,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchable.includes(term));
  });
}
