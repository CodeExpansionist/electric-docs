"use client";

import Link from "next/link";
import Image from "next/image";
import { useSaved } from "@/lib/saved-context";
import { useBasket } from "@/lib/basket-context";
import type { Product } from "@/lib/types";

function SavedProductCard({
  product,
  onRemove,
  onAddToBasket,
}: {
  product: Product;
  onRemove: () => void;
  onAddToBasket: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-sm transition-shadow">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block no-underline">
        <div className="aspect-square bg-white flex items-center justify-center p-4 border-b border-border">
          <Image
            src={product.images.main}
            alt={product.title}
            width={200}
            height={200}
            className="object-contain max-h-[180px]"
            unoptimized
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="flex gap-1 mb-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold text-white bg-epic-deal px-2 py-0.5 rounded-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-text-primary no-underline hover:text-primary line-clamp-2 block mb-2"
        >
          {product.title}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={star <= Math.round(product.rating.average) ? "#E8A317" : "none"}
                stroke="#E8A317"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-text-secondary">({product.rating.count})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold text-text-primary">
            £{product.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
          {product.price.was && (
            <span className="text-xs text-text-muted line-through ml-2">
              Was £{product.price.was.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          )}
          {product.price.savings && product.price.savings > 0 && (
            <p className="text-xs text-sale font-semibold mt-0.5">
              Save £{product.price.savings.toFixed(2)}
            </p>
          )}
        </div>

        {/* Key specs */}
        {product.keySpecs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.keySpecs.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-[10px] text-text-secondary bg-surface px-2 py-0.5 rounded-sm"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Delivery info */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mb-3">
          {product.deliveryInfo.freeDelivery && (
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#008A00" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Free delivery</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onAddToBasket}
            className="btn-primary w-full text-xs py-2.5"
          >
            Add to basket
          </button>
          <button
            onClick={onRemove}
            className="w-full text-xs text-primary hover:underline py-1"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavedPage() {
  const { savedItems, removeSaved } = useSaved();
  const { addItem } = useBasket();

  const handleAddToBasket = (product: Product) => {
    addItem(product);
  };

  return (
    <div className="container-main py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary no-underline text-text-secondary">Home</Link>
        <span>&gt;</span>
        <span className="text-text-primary">Saved items</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">
          Saved items ({savedItems.length})
        </h1>
      </div>

      {savedItems.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 text-text-muted">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">
            No saved items yet
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
            Save items you love by clicking the heart icon on any product. They&apos;ll appear here so you can find them easily.
          </p>
          <Link href="/tv-and-audio" className="btn-primary text-sm no-underline">
            Browse products
          </Link>
        </div>
      ) : (
        /* Product grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {savedItems.map((product) => (
            <SavedProductCard
              key={product.id}
              product={product}
              onRemove={() => removeSaved(product.id)}
              onAddToBasket={() => handleAddToBasket(product)}
            />
          ))}
        </div>
      )}

      {/* Continue shopping link */}
      {savedItems.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <Link href="/tv-and-audio" className="text-sm text-primary no-underline hover:underline">
            &larr; Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
}
