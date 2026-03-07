# API Reference

## Search API

### `GET /api/search`

Search across all products with relevance ranking, sorting, and pagination.

**File:** `src/app/api/search/route.ts`

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | (required) | Search query. If empty, returns `{ results: [], total: 0, suggestions: [] }` |
| `mode` | string | `"results"` | `"results"` for full search, `"suggest"` for autocomplete suggestions |
| `sort` | string | `"relevant"` | Sort order (see valid values below) |
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `20` | Results per page |

### Sort Values

| Value | Behavior |
|-------|----------|
| `relevant` | Relevance score (default) — weighted by brand match (50), name match (20), category match (15), spec match (5), rating boost, deal boost |
| `price-asc` | Price: low to high |
| `price-desc` | Price: high to low |
| `rating` | Rating: highest first (by `rating.average`) |
| `best-sellers` | Most reviewed first (by `rating.count`) |

### Response: Results Mode

```json
{
  "results": [
    {
      "name": "SAMSUNG QE65QN85D 65\" Smart 4K Neo QLED TV",
      "brand": "Samsung",
      "price": { "current": 1299, "was": 1499, "savings": 200 },
      "rating": { "average": 4.7, "count": 123 },
      "url": "/products/samsung-qe65qn85d-65-smart-4k-neo-qled-tv-10282094.html",
      "imageUrl": "/images/products/10282094/main.webp",
      "productId": "10282094",
      "specs": ["65 inch", "4K Ultra HD", "Neo QLED"],
      "badges": ["Best Seller"],
      "offers": ["Save £200"],
      "deliveryFree": true,
      "energyRating": "G",
      "category": "TVs",
      "categorySlug": "televisions/tvs"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

### Response: Suggest Mode

```json
{
  "suggestions": [
    {
      "type": "category",
      "text": "TVs",
      "url": "/tv-and-audio/televisions/tvs",
      "category": "245 products"
    },
    {
      "type": "brand",
      "text": "Samsung",
      "url": "/search?q=Samsung",
      "category": "312 products"
    },
    {
      "type": "product",
      "text": "SAMSUNG QE65QN85D 65\" Smart 4K Neo QLED TV",
      "url": "/products/samsung-qe65qn85d-65-smart-4k-neo-qled-tv-10282094.html",
      "image": "/images/products/10282094/main.webp",
      "price": 1299,
      "category": "TVs"
    }
  ]
}
```

### Suggestion Types

| Type | Priority | Max Count | Description |
|------|----------|-----------|-------------|
| `category` | 1st | 2 | Category names matching the query |
| `brand` | 2nd | 2 | Brand names matching the query, sorted by product count |
| `product` | 3rd | Fills remaining | Individual products, scored by relevance |

Total suggestions capped at the `limit` parameter (default 8).

### Relevance Scoring

The `scoreProduct()` function in `src/lib/search-data.ts` assigns weighted scores:

| Match Type | Points |
|-----------|--------|
| Exact brand match | 50 |
| Partial brand match | 30 |
| Name contains term | 20 |
| Category contains term | 15 |
| Spec contains term | 5 |
| Has reviews (count > 0) | +2 bonus |
| Rating >= 4 stars | +3 bonus |
| Has savings/deal | +2 bonus |

Search requires **all** query terms to appear somewhere in the product's searchable text (name, brand, category, specs, badges, offers). Then results are ranked by score.
