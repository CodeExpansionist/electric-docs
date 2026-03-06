"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts, type ProductDetail } from "@/lib/product-data";
import { searchProducts } from "@/lib/admin-utils";
import DataTable, { type Column } from "@/components/admin/DataTable";
import SearchInput from "@/components/admin/SearchInput";
import StarRating from "@/components/ui/StarRating";
import ProductImage from "@/components/admin/ProductImage";

const allProducts = getAllProducts();

const categories = Array.from(new Set(allProducts.map((p) => p.category))).sort();

export default function AdminProductsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => {
    let result = searchProducts(allProducts, query);
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    switch (sortBy) {
      case "name-asc": result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc": result = [...result].sort((a, b) => a.price.current - b.price.current); break;
      case "price-desc": result = [...result].sort((a, b) => b.price.current - a.price.current); break;
      case "rating": result = [...result].sort((a, b) => b.rating.average - a.rating.average); break;
    }
    return result;
  }, [query, categoryFilter, sortBy]);

  const getSlug = (p: ProductDetail) => p.url.replace("/products/", "");

  const columns: Column<ProductDetail>[] = [
    {
      key: "image",
      label: "",
      className: "w-12",
      render: (p) => (
        <div className="w-10 h-10 bg-white border border-border rounded flex items-center justify-center overflow-hidden">
          <ProductImage src={p.imageUrl} alt="" width={32} height={32} />
        </div>
      ),
    },
    {
      key: "name",
      label: "Product",
      render: (p) => (
        <div>
          <p className="text-sm font-semibold text-text-primary line-clamp-1">{p.name}</p>
          <p className="text-xs text-text-secondary">{p.brand}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => <span className="text-xs text-text-secondary">{p.category}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (p) => (
        <div>
          <span className="font-bold">£{p.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
          {p.price.savings && (
            <span className="text-xs text-sale ml-1">-£{p.price.savings}</span>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (p) => <StarRating rating={p.rating.average} count={p.rating.count} size={12} />,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-secondary">{allProducts.length} products in catalog</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search products..."
          className="w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-input-border rounded-md px-3 py-2 text-sm bg-white focus:border-primary focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-input-border rounded-md px-3 py-2 text-sm bg-white focus:border-primary focus:outline-none"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price: Low-High</option>
          <option value="price-desc">Price: High-Low</option>
          <option value="rating">Rating: High-Low</option>
        </select>
        <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-xs ${view === "table" ? "bg-primary text-white" : "bg-white hover:bg-surface"}`}
          >
            Table
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-xs ${view === "grid" ? "bg-primary text-white" : "bg-white hover:bg-surface"}`}
          >
            Grid
          </button>
        </div>
      </div>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(p) => p.url}
          onRowClick={(p) => router.push(`/admin/products/${encodeURIComponent(getSlug(p))}`)}
          emptyMessage="No products match your filters."
          pageSize={15}
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.slice(0, 30).map((p) => (
              <div
                key={p.url}
                className="card p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/admin/products/${encodeURIComponent(getSlug(p))}`)}
              >
                <div className="w-full h-28 bg-white border border-border rounded flex items-center justify-center mb-2 overflow-hidden">
                  <ProductImage src={p.imageUrl} alt="" width={80} height={80} />
                </div>
                <p className="text-xs font-semibold text-text-primary line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-text-secondary mb-1">{p.brand}</p>
                <p className="text-sm font-bold">£{p.price.current.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
                <StarRating rating={p.rating.average} count={p.rating.count} size={12} />
              </div>
            ))}
          </div>
          {filtered.length > 30 && (
            <p className="text-xs text-text-secondary text-center mt-4">
              Showing 30 of {filtered.length} products. Use table view for full pagination.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
