"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { Product, Basket, BasketItem } from "./types";

type BasketAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "APPLY_PROMO"; code: string; discount: number }
  | { type: "CLEAR_BASKET" }
  | { type: "HYDRATE"; basket: Basket };

const initialBasket: Basket = {
  items: [],
  subtotal: 0,
  deliveryCost: 0,
  total: 0,
};

function calculateTotals(items: BasketItem[]): Pick<Basket, "subtotal" | "total" | "deliveryCost"> {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price.current * item.quantity,
    0
  );
  const deliveryCost = subtotal >= 40 ? 0 : 5;
  return { subtotal, deliveryCost, total: subtotal + deliveryCost };
}

function basketReducer(state: Basket, action: BasketAction): Basket {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item.product.id === action.product.id
      );
      const items = existing
        ? state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { product: action.product, quantity: 1 }];
      return { ...state, items, ...calculateTotals(items) };
    }
    case "REMOVE_ITEM": {
      const items = state.items.filter(
        (item) => item.product.id !== action.productId
      );
      return { ...state, items, ...calculateTotals(items) };
    }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        const items = state.items.filter(
          (item) => item.product.id !== action.productId
        );
        return { ...state, items, ...calculateTotals(items) };
      }
      const items = state.items.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return { ...state, items, ...calculateTotals(items) };
    }
    case "APPLY_PROMO": {
      const discount = action.discount;
      return {
        ...state,
        promoCode: action.code,
        promoDiscount: discount,
        total: state.subtotal + state.deliveryCost - discount,
      };
    }
    case "CLEAR_BASKET":
      return initialBasket;
    case "HYDRATE":
      return action.basket;
    default:
      return state;
  }
}

interface BasketContextValue {
  basket: Basket;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyPromo: (code: string, discount: number) => void;
  clearBasket: () => void;
  itemCount: number;
}

const BasketContext = createContext<BasketContextValue | null>(null);

/* ── Default basket so the header badge shows a count on first visit ── */
const defaultBasket: Basket = {
  items: [
    {
      product: {
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
        specs: { "Screen Size": '50"', Resolution: "4K Ultra HD" },
        keySpecs: ['50"', "4K Ultra HD", "LED"],
        description: "Samsung Crystal UHD 4K Smart TV",
        deliveryInfo: { freeDelivery: true, estimatedDate: "4 Mar 2026" },
        badges: [],
        tags: [],
        offers: [],
        inStock: true,
      },
      quantity: 1,
    },
    {
      product: {
        id: "10282800",
        slug: "samsung-s90f-65-oled",
        title: 'SAMSUNG S90F 65" OLED 4K Vision AI Smart TV 2025 – QE65S90F',
        brand: "Samsung",
        category: "TV & Audio",
        subcategory: "Televisions",
        price: { current: 1399 },
        images: {
          main: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
          gallery: [],
          thumbnail: "https://brain-images-ssl.cdn.dixons.com/0/3/10282830/u_10282830.jpg",
        },
        rating: { average: 4.7, count: 42 },
        specs: { "Screen Size": '65"', Resolution: "4K Ultra HD" },
        keySpecs: ['65"', "4K Ultra HD", "OLED"],
        description: "Samsung S90F OLED 4K Smart TV",
        deliveryInfo: { freeDelivery: true, estimatedDate: "5 Mar 2026" },
        badges: [],
        tags: [],
        offers: [],
        inStock: true,
      },
      quantity: 1,
    },
  ],
  subtotal: 1698,
  deliveryCost: 0,
  total: 1698,
};

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, dispatch] = useReducer(basketReducer, initialBasket);

  useEffect(() => {
    const saved = localStorage.getItem("electric-basket");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.items && parsed.items.length > 0) {
          dispatch({ type: "HYDRATE", basket: parsed });
        } else {
          dispatch({ type: "HYDRATE", basket: defaultBasket });
        }
      } catch {
        dispatch({ type: "HYDRATE", basket: defaultBasket });
      }
    } else {
      dispatch({ type: "HYDRATE", basket: defaultBasket });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("electric-basket", JSON.stringify(basket));
  }, [basket]);

  const itemCount = basket.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BasketContext.Provider
      value={{
        basket,
        addItem: (product) => dispatch({ type: "ADD_ITEM", product }),
        removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
        updateQuantity: (productId, quantity) =>
          dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
        applyPromo: (code, discount) =>
          dispatch({ type: "APPLY_PROMO", code, discount }),
        clearBasket: () => dispatch({ type: "CLEAR_BASKET" }),
        itemCount,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
