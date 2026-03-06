"use client";

import Link from "next/link";
import { getProductBySlug } from "@/lib/product-data";
import StarRating from "@/components/ui/StarRating";
import ProductImage from "@/components/admin/ProductImage";

export default function AdminProductDetailPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div>
        <Link href="/admin/products" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to products
        </Link>
        <div className="card p-8 text-center">
          <p className="text-sm text-text-secondary">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-primary hover:underline no-underline flex items-center gap-1 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{product.name}</h1>
          <p className="text-sm text-text-secondary">{product.brand} &middot; {product.category}</p>
        </div>
        <Link
          href={`/products/${slug}`}
          className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-surface transition-colors no-underline text-text-primary"
        >
          View on store
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Image */}
        <div className="card p-4">
          <div className="w-full aspect-square bg-white border border-border rounded flex items-center justify-center overflow-hidden">
            <ProductImage
              src={product.imageLarge || product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
            />
          </div>
        </div>

        {/* Key Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">Pricing</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">
                £{product.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
              {product.price.was && (
                <span className="text-sm text-text-secondary line-through">
                  £{product.price.was.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </span>
              )}
              {product.price.savings && (
                <span className="text-sm font-semibold text-sale">
                  Save £{product.price.savings}
                </span>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-secondary">Rating</span>
                <div className="mt-0.5">
                  <StarRating rating={product.rating.average} count={product.rating.count} size={12} />
                </div>
              </div>
              <div>
                <span className="text-text-secondary">Delivery</span>
                <p className="font-medium text-text-primary mt-0.5">
                  {product.deliveryFree ? "Free delivery" : "Standard delivery"}
                </p>
              </div>
              {product.energyRating && (
                <div>
                  <span className="text-text-secondary">Energy Rating</span>
                  <p className="font-medium text-text-primary mt-0.5">{product.energyRating}</p>
                </div>
              )}
              {product.productId && (
                <div>
                  <span className="text-text-secondary">Product ID</span>
                  <p className="font-mono text-xs text-text-primary mt-0.5">{product.productId}</p>
                </div>
              )}
            </div>
          </div>

          {product.badges.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-text-primary mb-3">Badges & Offers</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {product.badges.map((b, i) => (
                  <span key={i} className="text-xs bg-sale/10 text-sale font-semibold px-2 py-0.5 rounded">{b}</span>
                ))}
              </div>
              {product.offers.length > 0 && (
                <ul className="text-xs text-text-secondary space-y-1 mt-2">
                  {product.offers.map((o, i) => (
                    <li key={i}>{typeof o === "string" ? o : String(o)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      {product.specs.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-text-primary mb-3">Key Specifications</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-text-secondary">
            {product.specs.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">&#8226;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-bold text-text-primary mb-3">Full Specifications</h3>
          {Object.entries(product.specifications).map(([group, specs]) => (
            <div key={group} className="mb-4 last:mb-0">
              <h4 className="text-xs font-bold text-text-primary mb-2 uppercase tracking-wide">{group}</h4>
              <div className="border border-border rounded overflow-hidden">
                {Object.entries(specs).map(([key, val], i) => (
                  <div key={key} className={`flex text-sm ${i % 2 === 0 ? "bg-surface" : "bg-white"}`}>
                    <span className="w-1/3 px-3 py-2 text-text-secondary font-medium">{key}</span>
                    <span className="flex-1 px-3 py-2 text-text-primary">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="card p-5 bg-surface border border-border">
        <h3 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Admin Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-text-secondary">Category</span>
            <p className="text-text-primary font-mono mt-0.5">{product.category}</p>
          </div>
          <div>
            <span className="text-text-secondary">Category Slug</span>
            <p className="text-text-primary font-mono mt-0.5">{product.categorySlug}</p>
          </div>
          <div>
            <span className="text-text-secondary">Product ID</span>
            <p className="text-text-primary font-mono mt-0.5">{product.productId || "N/A"}</p>
          </div>
          <div>
            <span className="text-text-secondary">URL</span>
            <p className="text-text-primary font-mono mt-0.5 break-all">{product.url}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
