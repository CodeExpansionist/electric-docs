export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: {
    current: number;
    was?: number;
    savings?: number;
    savingsPercent?: number;
  };
  images: {
    main: string;
    gallery: string[];
    thumbnail: string;
  };
  rating: {
    average: number;
    count: number;
  };
  specs: Record<string, string>;
  keySpecs: string[];
  description: string;
  deliveryInfo: {
    freeDelivery: boolean;
    estimatedDate: string;
  };
  badges: string[];
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
  energyRating?: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  productCount: number;
  subcategories: Category[];
  filters: FilterGroup[];
}

export interface FilterGroup {
  name: string;
  type: "checkbox" | "range" | "rating" | "toggle";
  collapsed: boolean;
  hasTooltip: boolean;
  options: FilterOption[];
}

export interface FilterOption {
  label: string;
  value: string;
  count: number;
  hasTooltip?: boolean;
}

export interface BasketItem {
  product: Product;
  quantity: number;
}

export interface Basket {
  items: BasketItem[];
  subtotal: number;
  deliveryCost: number;
  total: number;
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
