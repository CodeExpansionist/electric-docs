"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
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

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, dispatch] = useReducer(savedReducer, []);
  const hydrated = useRef(false);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const stored = localStorage.getItem("electric-saved");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      } catch {
        // Invalid localStorage data — start with empty saved list
      }
    }
    hydrated.current = true;
  }, []);

  /* Persist to localStorage on change */
  useEffect(() => {
    if (hydrated.current) {
      localStorage.setItem("electric-saved", JSON.stringify(savedItems));
    }
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
