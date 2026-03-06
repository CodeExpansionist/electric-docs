Prepare the cloned site for production deployment — verify the build, generate Docker and CI/CD configs, bundle analysis, and production smoke test. Produces a deployment-ready package with zero manual configuration needed.

**Pipeline position:** 31/32 — depends on: `/build-component`, `/build-admin`, `/smoke-test`, `/strip-external`, `/security-audit`, `/generate-tests` | feeds into: none (deployment endpoint)

**Usage:** `/deploy` — runs full deployment preparation

Optionally: `/deploy <scope>` where `$ARGUMENTS` is `build`, `docker`, `ci`, `vercel`, or `bundle`. Omit to run all steps.

---

## Golden Rule

**The deployment package must work with a single command.** `docker compose up` or `vercel deploy` — that's it. No environment debugging, no missing files, no build failures in production that passed in dev. Every config file is generated, every dependency is pinned, every environment variable is documented.

---

## Prerequisites

- Production build passes (`npm run build` exits 0)
- All images are local (run `/strip-external` first — `remotePatterns: []` in `next.config.mjs`)
- Dev server smoke test passes (run `/smoke-test` first)
- `src/lib/constants.ts` exists (exports SITE_URL and stripDomain)

---

## Steps

### 1. Verify the production build

Run the full production build and capture every detail:

```bash
npm run build 2>&1
```

**Check for:**

- Exit code 0 (build must succeed)
- Zero TypeScript errors
- Zero ESLint errors (warnings are acceptable)
- All pages listed in build output (static + dynamic)
- No "missing module" or "cannot resolve" warnings

**Record from build output:**

- Total build time
- Per-route First Load JS sizes
- Shared chunks total
- Static pages count vs dynamic pages count

If the build fails, STOP. Fix the build errors before proceeding. A deployment package with a broken build is worthless.

### 2. Configure standalone output

Read `next.config.mjs` and add `output: "standalone"` if not already present:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  // ... existing config
};
```

After adding, re-run `npm run build` to verify standalone output generates correctly.

**Verify standalone output:**

- `.next/standalone/` directory exists after build
- `.next/standalone/server.js` exists (the production entry point)
- `.next/standalone/node_modules/` contains only production dependencies (smaller than root `node_modules/`)

**Important:** Standalone mode copies only the files needed for production. But it does NOT copy `public/` or `.next/static/` — those must be handled separately in Docker or deployment config.

### 3. Generate Dockerfile

Create a multi-stage `Dockerfile` in the project root:

```dockerfile
# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 3: Production ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

**Key design decisions:**

- **Multi-stage** — deps, build, and production are separate stages for optimal layer caching. Changing source code doesn't re-install dependencies.
- **Node 20 Alpine** — smallest secure base image for Node.js LTS.
- **Non-root user** — `nextjs` user with UID 1001 for security. Never run as root.
- **Standalone output** — only production-necessary files copied, not the full `node_modules/`.
- **Health check** — Docker and orchestrators can detect unhealthy containers and restart them.

### 4. Generate .dockerignore

Create `.dockerignore` in the project root:

```
node_modules
.next
.git
.github
.claude
reference-screenshots
comparison-screenshots
data/scrape/products
*.md
!README.md
.env.local
.env.*.local
```

**Rationale:**

- `data/scrape/products/` — individual JSON files used only for data generation, not runtime. The merged index is what the app uses.
- `reference-screenshots/` and `comparison-screenshots/` — development reference only.
- `.claude/` — development tooling.
- `.git/` — not needed in container.

### 5. Generate docker-compose.yml

Create `docker-compose.yml` in the project root:

```yaml
version: "3.8"

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

The image directory (`public/images/`) is baked into the Docker image at build time via `COPY --from=builder /app/public ./public`. No runtime volume mount needed — the deployment is self-contained and immutable.

### 6. Generate environment configuration

Create `.env.production.example` as a template:

```bash
# Production Environment Variables
# Copy to .env.production.local and fill in real values

# Required
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional — Analytics (leave empty to disable)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GTM_ID=
```

Read `src/lib/constants.ts` for SITE_URL to auto-fill the brand name ("Electriz") and section URL in comments.

### 7. Generate GitHub Actions CI/CD pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Check bundle sizes
        run: |
          echo "## Bundle Size Report" >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY
          du -sh .next/static/chunks/*.js | sort -rh | head -20 >> $GITHUB_STEP_SUMMARY
          echo '```' >> $GITHUB_STEP_SUMMARY

  docker:
    needs: lint-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t ${{ github.repository }}:${{ github.sha }} .

      - name: Test Docker container starts
        run: |
          docker run -d -p 3000:3000 --name test-container ${{ github.repository }}:${{ github.sha }}
          curl --retry 5 --retry-delay 3 --retry-all-errors -f http://localhost:3000/ || exit 1
          docker stop test-container
```

**Pipeline stages:**

1. **Lint + Build** — runs on both Node 20 and 22 to verify compatibility. Caches npm dependencies for speed.
2. **Docker** — only runs on `main` branch pushes, after lint/build passes. Builds the image and verifies the container starts and serves the homepage.
3. **Manual trigger** — `workflow_dispatch` allows manual deploys from GitHub UI.

### 8. Generate Vercel configuration (alternative)

Create `vercel.json` for one-click Vercel deployment:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["lhr1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Region `lhr1`** — London, for UK-audience sites (electriz.co.uk targets UK). US sites should use `iad1` (Washington DC) or `sfo1` (San Francisco).

### 9. Production smoke test

Start the production server and verify key pages load:

```bash
npm run build && npm start &
sleep 15
```

**Pages to hit:**

| Page | URL | Expected |
|------|-----|----------|
| Homepage | `/` | HTTP 200, contains site brand name |
| Section hub | `/{section-slug}` | HTTP 200, contains category links |
| Category listing | `/{section-slug}/{first-category-slug}` | HTTP 200, contains product cards |
| Product detail | `/products/{any-product-slug}` | HTTP 200, contains price |
| Basket | `/basket` | HTTP 200, renders basket UI |
| Checkout | `/checkout/payment` | HTTP 200, renders payment form |
| Search | `/search?q={search-term}` | HTTP 200, renders results |
| Admin | `/admin` | HTTP 200, renders dashboard |

The section slug is `tv-and-audio`. Read `src/lib/category-data.ts` to pick a real category slug and product slug.

**For each page, verify:**

- Response status 200
- Response time < 3 seconds
- No `500 Internal Server Error` in body
- Content-Type is `text/html`

If Docker is available, repeat this test against the Docker container instead of `npm start`.

### 10. Bundle analysis

Parse the build output to generate a detailed bundle report.

**Per-page analysis:**

| Route | First Load JS | Status |
|-------|---------------|--------|
| `/` | X kB | OK / REVIEW / WARNING |
| `/{section-slug}` | X kB | OK / REVIEW / WARNING |
| `/{section-slug}/[...category]` | X kB | OK / REVIEW / WARNING |
| `/products/[slug]` | X kB | OK / REVIEW / WARNING |
| `/basket` | X kB | OK / REVIEW / WARNING |
| `/checkout/payment` | X kB | OK / REVIEW / WARNING |
| `/search` | X kB | OK / REVIEW / WARNING |
| `/admin` | X kB | OK / REVIEW / WARNING |

**Thresholds:**

- OK: < 170 kB
- REVIEW: 170–200 kB (investigate but not blocking)
- WARNING: > 200 kB (must fix before deploy)

**Check for:**

- Any route importing raw category JSON that inflates the client bundle (data should be server-side only or statically imported for tree-shaking)
- Any `'use client'` component that pulls in unnecessary server-only code
- Image optimization status (all `.webp`, all have explicit dimensions)
- Largest shared chunks and what they contain (React, Tailwind, data files)

### 11. Output deployment report

```markdown
## Deployment Preparation Report

Preparation date: [timestamp]
Project: Electriz TV & Audio

### Build Verification

| Check | Status |
|-------|--------|
| npm run build | PASS (exit 0) |
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Build time | Xs |
| Static pages | X |
| Dynamic pages | X |

### Bundle Sizes

| Route | First Load JS | Status |
|-------|---------------|--------|
| / | X kB | OK |
| /{section-slug} | X kB | OK |
| /{section-slug}/[...category] | X kB | OK / REVIEW / WARNING |
| /products/[slug] | X kB | OK / REVIEW / WARNING |
| /basket | X kB | OK |
| /checkout/payment | X kB | OK |
| /search | X kB | OK |
| /admin | X kB | OK |

Shared chunks: X kB
Total build output: X MB

### Docker

| Check | Status |
|-------|--------|
| Dockerfile generated | YES |
| .dockerignore generated | YES |
| docker-compose.yml generated | YES |
| Standalone output works | YES / NO |
| Docker image builds | YES / NO / SKIPPED |
| Container starts | YES / NO / SKIPPED |
| Docker image size | X MB |

### CI/CD

| File | Generated |
|------|-----------|
| .github/workflows/deploy.yml | YES |
| vercel.json | YES |
| .env.production.example | YES |

### Production Smoke Test

| Page | Status | Response Time |
|------|--------|---------------|
| Homepage | 200 | Xms |
| Section hub | 200 | Xms |
| Category | 200 | Xms |
| Product | 200 | Xms |
| Basket | 200 | Xms |
| Checkout | 200 | Xms |
| Search | 200 | Xms |
| Admin | 200 | Xms |

### Environment Checklist

| Variable | Status |
|----------|--------|
| NEXT_PUBLIC_SITE_URL | Set in .env.production.example |
| NODE_ENV | Set to production |
| output: standalone | Configured in next.config.mjs |
| remotePatterns: [] | Confirmed (fully self-contained) |

### Deployment Commands

Docker:
  docker compose up -d

Vercel:
  vercel deploy --prod

Local production:
  npm run build && npm start

Verdict: [PASS: deployment-ready / FAIL: X issues need fixing]
```

---

## Critical Rules

- **Build must pass before anything else.** If `npm run build` fails, stop and fix. Every subsequent step depends on a successful build.
- **Standalone output is mandatory for Docker.** Without `output: "standalone"`, the Docker image includes the entire `node_modules/` — bloating the image from ~200MB to 1GB+.
- **Non-root Docker user is non-negotiable.** Running as root in a container is a security risk. The `nextjs` user with UID 1001 is standard practice.
- **`public/` and `.next/static/` must be explicitly copied.** Standalone mode does NOT copy these directories automatically. Missing them means no images, no CSS, no client JS.
- **Pin the Node.js version.** Use `node:20-alpine`, not `node:latest` or `node:lts`. Unpinned versions break builds silently when a new major version is released.
- **Health checks prevent zombie containers.** Without `HEALTHCHECK`, Docker and orchestrators cannot detect if the app has crashed but the process is still running.
- **Test the Docker image, not just the build.** A successful `docker build` does not mean the container runs correctly. Always start it and hit at least one page.
- **Region matches reference site locale.** If deploying to Vercel or a CDN, use the region closest to the reference site's audience (electriz.co.uk targets UK — use `lhr1`).
- **Never commit `.env.production.local`.** Only `.env.production.example` (the template) goes in version control. Real secrets stay out of git.
