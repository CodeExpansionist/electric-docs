"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { Product } from "./types";

type SavedAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "HYDRATE"; items: Product[] };

function savedReducer(state: Product[], action: SavedAction): Product[] {
  switch (action.type) {
    case "ADD_ITEM": {
      if (state.some((p) => p.id === action.product.id)) return state;
      return [...state, action.product];
    }
    case "REMOVE_ITEM":
      return state.filter((p) => p.id !== action.productId);
    case "HYDRATE":
      return action.items;
    default:
      return state;
  }
}

interface SavedContextValue {
  savedItems: Product[];
  addSaved: (product: Product) => void;
  removeSaved: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  savedCount: number;
}

const SavedContext = createContext<SavedContextValue | null>(null);

/* ── Default saved items so the page isn't empty on first visit ── */
const defaultSaved: Product[] = [
  {
    id: "10282800",
    slug: "samsung-s90f-65-oled",
    title: 'SAMSUNG S90F 65" OLED 4K Vision AI Smart TV 2025 – QE65S90F',
    brand: "Samsung",
    category: "TV & Audio",
    subcategory: "Televisions",
    price: { current: 1399, was: 1599, savings: 200, savingsPercent: 13 },
    images: {
      main: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
      gallery: [],
      thumbnail: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
    },
    rating: { average: 4.7, count: 42 },
    specs: { "Screen Size": '65"', Resolution: "4K Ultra HD", "Panel Type": "OLED" },
    keySpecs: ['65"', "4K Ultra HD", "OLED", "120Hz"],
    description: "Samsung S90F OLED 4K Smart TV",
    deliveryInfo: { freeDelivery: true, estimatedDate: "5 Mar 2026" },
    badges: [],
    tags: [],
    offers: [],
    inStock: true,
  },
  {
    id: "10282706",
    slug: "samsung-ub00f-50-crystal-uhd",
    title: 'SAMSUNG UB00F 50" Crystal UHD 4K HDR Smart TV 2025 – UE50UB00F',
    brand: "Samsung",
    category: "TV & Audio",
    subcategory: "Televisions",
    price: { current: 299, was: 349, savings: 50, savingsPercent: 14 },
    images: {
      main: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
      gallery: [],
      thumbnail: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
    },
    rating: { average: 4.4, count: 128 },
    specs: { "Screen Size": '50"', Resolution: "4K Ultra HD", "Panel Type": "LED" },
    keySpecs: ['50"', "4K Ultra HD", "LED", "60Hz"],
    description: "Samsung Crystal UHD 4K Smart TV",
    deliveryInfo: { freeDelivery: true, estimatedDate: "4 Mar 2026" },
    badges: ["Epic Deal"],
    tags: [{ label: "Epic Deal", type: "epic-deal" }],
    offers: [{ text: "Save £50" }],
    inStock: true,
  },
  {
    id: "10280123",
    slug: "sony-bravia-7-55-mini-led",
    title: 'SONY BRAVIA 7 55" Smart 4K Ultra HD HDR Mini LED TV with Google TV – K55XR70',
    brand: "Sony",
    category: "TV & Audio",
    subcategory: "Televisions",
    price: { current: 1099, was: 1299, savings: 200, savingsPercent: 15 },
    images: {
      main: "https://brain-images-ssl.cdn.dixons.com/7/0/10280807/u_10280807.jpg",
      gallery: [],
      thumbnail: "https://brain-images-ssl.cdn.dixons.com/7/0/10280807/u_10280807.jpg",
    },
    rating: { average: 4.8, count: 67 },
    specs: { "Screen Size": '55"', Resolution: "4K Ultra HD", "Panel Type": "Mini LED" },
    keySpecs: ['55"', "4K Ultra HD", "Mini LED", "120Hz"],
    description: "Sony BRAVIA 7 Mini LED 4K Smart TV",
    deliveryInfo: { freeDelivery: true, estimatedDate: "5 Mar 2026" },
    badges: [],
    tags: [],
    offers: [{ text: "Save £200" }],
    inStock: true,
  },
];

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, dispatch] = useReducer(savedReducer, []);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem("electric-saved");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "HYDRATE", items: parsed });
        } else {
          dispatch({ type: "HYDRATE", items: defaultSaved });
        }
      } catch {
        dispatch({ type: "HYDRATE", items: defaultSaved });
      }
    } else {
      dispatch({ type: "HYDRATE", items: defaultSaved });
    }
  }, []);

  /* Persist to localStorage on change */
  useEffect(() => {
    localStorage.setItem("electric-saved", JSON.stringify(savedItems));
  }, [savedItems]);

  const savedCount = savedItems.length;

  return (
    <SavedContext.Provider
      value={{
        savedItems,
        addSaved: (product) => dispatch({ type: "ADD_ITEM", product }),
        removeSaved: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
        isSaved: (productId) => savedItems.some((p) => p.id === productId),
        savedCount,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
}
