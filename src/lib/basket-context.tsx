"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product, Basket, BasketItem } from "./types";
import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "./constants";

type BasketAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "APPLY_PROMO"; code: string; discount: number }
  | { type: "REMOVE_PROMO" }
  | { type: "CLEAR_BASKET" }
  | { type: "HYDRATE"; basket: Basket };

const initialBasket: Basket = {
  items: [],
  subtotal: 0,
  deliveryCost: 0,
  total: 0,
};

function calculateTotals(items: BasketItem[], promoDiscount?: number): Pick<Basket, "subtotal" | "total" | "deliveryCost"> {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price.current * item.quantity,
    0
  );
  const deliveryCost = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const discount = promoDiscount || 0;
  return { subtotal, deliveryCost, total: Math.max(0, subtotal + deliveryCost - discount) };
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
      return { ...state, items, ...calculateTotals(items, state.promoDiscount) };
    }
    case "REMOVE_ITEM": {
      const items = state.items.filter(
        (item) => item.product.id !== action.productId
      );
      return { ...state, items, ...calculateTotals(items, state.promoDiscount) };
    }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        const items = state.items.filter(
          (item) => item.product.id !== action.productId
        );
        return { ...state, items, ...calculateTotals(items, state.promoDiscount) };
      }
      const items = state.items.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return { ...state, items, ...calculateTotals(items, state.promoDiscount) };
    }
    case "APPLY_PROMO": {
      const discount = action.discount;
      return {
        ...state,
        promoCode: action.code,
        promoDiscount: discount,
        ...calculateTotals(state.items, discount),
      };
    }
    case "REMOVE_PROMO": {
      return {
        ...state,
        promoCode: undefined,
        promoDiscount: undefined,
        ...calculateTotals(state.items),
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
  removePromo: () => void;
  clearBasket: () => void;
  itemCount: number;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, dispatch] = useReducer(basketReducer, initialBasket);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("electric-basket");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.items) {
          dispatch({ type: "HYDRATE", basket: parsed });
        }
      } catch {
        // Invalid localStorage data — start with empty basket
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("electric-basket", JSON.stringify(basket));
    }
  }, [basket, isHydrated]);

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
        removePromo: () => dispatch({ type: "REMOVE_PROMO" }),
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
