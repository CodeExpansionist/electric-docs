import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getSuggestions } from "@/lib/search-data";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "results"; // "results" | "suggest"
  const sort = searchParams.get("sort") || "relevant";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, suggestions: [] });
  }

  if (mode === "suggest") {
    const suggestions = getSuggestions(query, 8);
    return NextResponse.json({ suggestions });
  }

  // Full search
  let results = searchProducts(query);

  // Sort
  switch (sort) {
    case "price-asc":
      results = [...results].sort((a, b) => a.price.current - b.price.current);
      break;
    case "price-desc":
      results = [...results].sort((a, b) => b.price.current - a.price.current);
      break;
    case "rating":
      results = [...results].sort((a, b) => b.rating.average - a.rating.average);
      break;
    case "best-sellers":
      results = [...results].sort((a, b) => b.rating.count - a.rating.count);
      break;
  }

  const total = results.length;
  const offset = (page - 1) * limit;
  const paged = results.slice(offset, offset + limit);

  return NextResponse.json({
    results: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
