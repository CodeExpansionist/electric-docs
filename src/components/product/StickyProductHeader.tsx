"use client";

import { useEffect, useState } from "react";

interface StickyProductHeaderProps {
  title: string;
  price: number;
  onAddToBasket: () => void;
}

export default function StickyProductHeader({
  title,
  price,
  onAddToBasket,
}: StickyProductHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past 400px
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="container-main flex items-center justify-between py-2.5">
        <div className="flex-1 min-w-0 mr-4">
          <h2 className="text-sm font-bold text-text-primary truncate">
            {title}
          </h2>
          <span className="text-sm font-bold text-text-primary">
            £{price.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={onAddToBasket}
          className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Add to basket
        </button>
      </div>
    </div>
  );
}
