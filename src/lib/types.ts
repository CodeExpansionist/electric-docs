/**
 * Canonical product type used by UI components (basket, saved items, cards).
 *
 * Note: This differs from `CategoryProduct` in `category-data.ts`:
 *   - `specs` here is `Record<string, string>` (key-value); CategoryProduct uses `string[]`
 *   - `offers` here is `Array<{text, moreOffersCount}>`;  CategoryProduct uses `string[]`
 *   - Name field here is `title`; CategoryProduct uses `name`
 *
 * See docs/DATA_SCHEMA.md for the full comparison.
 */
export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  /** Normalized price object. `was`/`savings` are present when product is on sale. */
  price: {
    current: number;
    was?: number;
    savings?: number;
    savingsPercent?: number;
  };
  /** Local image paths (not CDN URLs). See src/lib/images.ts for path conventions. */
  images: {
    main: string;
    gallery: string[];
    thumbnail: string;
  };
  /** Star rating. `average` is 0–5 (one decimal). `count` is total reviews. */
  rating: {
    average: number;
    count: number;
  };
  /** Key-value specification pairs (e.g., {"Screen Size": "65\""}). */
  specs: Record<string, string>;
  /** Bullet-point spec highlights shown on product cards. */
  keySpecs: string[];
  description: string;
  /** Free delivery applies when basket total >= £40. */
  deliveryInfo: {
    freeDelivery: boolean;
    estimatedDate: string;
  };
  /** Badge labels (e.g., "Best Seller", "New"). */
  badges: string[];
  /**
   * Promotional tags with color-coded types:
   *   - "epic-deal": Red sale badge
   *   - "trade-in": Green trade-in badge
   *   - "free-gift": Pink free gift badge
   */
  tags: Array<{
    label: string;
    type:
      | "epic-deal"
      | "trade-in"
      | "free-gift";
  }>;
  offers: Array<{
    text: string;
    moreOffersCount?: number;
  }>;
  /** EU energy label class (e.g., "A", "B", "C", "G"). */
  energyRating?: string;
  energyLabelUrl?: string;
  inStock: boolean;
}

/** Category metadata for navigation and hub pages. */
export interface Category {
  id: string;
  /** URL slug — must match a key in categoryMap (src/lib/category-data.ts). */
  slug: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  productCount: number;
  subcategories: Category[];
  filters: FilterGroup[];
}

/**
 * Product filter group displayed in the category sidebar.
 * Canonical definition lives in category-data.ts; this mirrors it for the Category interface.
 */
export interface FilterGroup {
  name: string;
  type: "checkbox" | "range" | "rating" | "toggle";
  isExpanded: boolean;
  options: Array<{ label: string; count: number }>;
}

export interface BasketItem {
  product: Product;
  quantity: number;
}

export type DeliveryMethod = "standard" | "next-day" | "next-day-weekday-slot" | "next-day-weekend" | "next-day-weekend-slot";

/**
 * Shopping basket state.
 * `deliveryCost` depends on deliveryMethod and subtotal.
 * Standard: FREE over £40, £3.99 under £40.
 * Next-day options: £5.99 / £9.99 / £6.99 / £10.99.
 */
export interface Basket {
  items: BasketItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  promoCode?: string;
  promoDiscount?: number;
}

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  children?: NavItem[];
}

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}
