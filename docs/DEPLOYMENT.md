# Deployment

## Build

```bash
npm run build
```

This creates a production-optimized build in `.next/`. Most pages are statically pre-rendered at build time.

### Build Output

- Static pages: Homepage, category listings, help pages, footer pages
- Dynamic pages: Product detail (generated on-demand via `[slug]` route), search
- API routes: `/api/search` (server-side)
- Shared JS: ~87 KB (First Load)

## Run Production

```bash
npm start
```

Starts the production server on port 3000.

## Environment Variables

See `.env.example` for the template. No variables are required for local development.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_GA_ID` | No | (none) | Google Analytics measurement ID |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical site URL for SEO meta tags, JSON-LD |

## Production Considerations

### Static Assets

All product images (37K files, ~1.7 GB) are in `public/images/`. In production, these should be served via a CDN or object storage with appropriate caching headers.

### Image Optimization

`next/image` is used with `unoptimized: true` throughout the project (images are pre-optimized WebP). To enable Next.js image optimization in production, remove the `unoptimized` prop and configure the image loader.

### Caching

The data layer is static JSON imported at build time. Product data does not change at runtime. Consider:

- Long cache TTLs for `/images/` assets (immutable content)
- Standard cache headers for HTML pages
- No API caching needed (search runs against in-memory data)

### No External Dependencies

The application makes zero external HTTP requests at runtime:

- No database connections
- No third-party API calls
- No CDN image fetching
- No analytics (unless `NEXT_PUBLIC_GA_ID` is set)

This means the app runs entirely self-contained. Deployment requires only a Node.js runtime.

## Docker (Not Yet Configured)

A Dockerfile is not included. A basic setup would be:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Note: The `public/images/` directory is ~1.7 GB. Consider mounting it as a volume or serving from external storage.

## CI/CD (Not Yet Configured)

Recommended pipeline steps:

1. `npm ci` — Install dependencies
2. `npm run lint` — ESLint check
3. `npm run build` — Production build (catches TypeScript errors)
4. (Optional) `npm test` — Run tests (test framework not yet installed)
5. Deploy build artifacts
