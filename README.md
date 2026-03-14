# Electric — Electriz TV & Audio Clone

A pixel-perfect clone of the [Electriz](https://www.electriz.co.uk) TV & Audio section, built with Next.js 15, TypeScript, and Tailwind CSS. All data and assets are fully self-contained — zero external requests at runtime.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** React Context (basket, saved items, orders)
- **Persistence:** localStorage for basket and order data

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the app.

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

### Workflow

```bash
npm run preflight  # Regenerate repo-facts.json + audit docs for drift
npm run facts      # Regenerate data/repo-facts.json only
npm run audit      # Run doc audit only
```

A pre-commit hook runs preflight automatically when docs or scripts change. See [docs/GIT_HOOKS.md](docs/GIT_HOOKS.md).

## Project Structure

```
src/
├── app/            # Next.js App Router pages & API routes
├── components/     # React components by feature area
├── lib/            # Contexts, data loaders, types, utilities
data/
├── design-tokens.json  # Design system tokens (drives Tailwind config)
├── scrape/              # Scraped product & category data (JSON)
public/
└── images/         # All product, banner, and icon images (local)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero carousel, offers, deals |
| `/tv-and-audio` | TV & Audio hub with categories, guides |
| `/tv-and-audio/televisions` | Category listing with filters, sort, list/grid view |
| `/products/[slug]` | Product detail with gallery, specs, bundles |
| `/basket` | Shopping basket with upsells |
| `/checkout` | Multi-step checkout (delivery, customer, payment) |
| `/checkout/confirmation` | Order confirmation |
| `/account` | Account overview and order history |
| `/help-and-support` | Help centre with FAQs |
| `/[...slug]` | Footer content pages (returns, delivery, etc.) |

## Design System

Design tokens extracted from the reference site drive the Tailwind configuration. See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for the full token reference.

## Data

Product data is scraped from the reference site and stored as static JSON. All images are downloaded locally — no CDN calls at runtime. See [docs/DATA_PIPELINE.md](docs/DATA_PIPELINE.md) for the full scraping and build pipeline.

## Checkout Flow

The checkout implements a multi-step flow:

1. **Welcome** — Sign in or continue as guest
2. **Delivery** — Address form with UK postcode lookup
3. **Customer** — Email, billing, marketing preferences
4. **Payment** — Card/Apple Pay or PayPal selection
5. **Confirmation** — Order number and summary

All payment and checkout flows are simulated — no real transactions or external API calls.

Form validation includes UK postcode format, phone number format, email validation, and card number Luhn check. Mock submission shows a spinner then redirects to confirmation with a generated order number.

## Documentation

Detailed documentation lives in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System architecture, data flow, key decisions |
| [Data Pipeline](docs/DATA_PIPELINE.md) | Multi-step pipeline: scrape → normalize → build → verify |
| [Data Schema](docs/DATA_SCHEMA.md) | Product, Category, Basket types with field explanations |
| [Image System](docs/IMAGE_SYSTEM.md) | CDN URL parsing, local image storage, path resolution |
| [API Reference](docs/API_REFERENCE.md) | `/api/search` endpoint: params, response shapes, scoring |
| [Category Routing](docs/CATEGORY_ROUTING.md) | Multi-phase routing algorithm, category keys, aliases |
| [Checkout Flow](docs/CHECKOUT_FLOW.md) | Multi-step checkout, validation rules, mock submission |
| [Design System](docs/DESIGN_SYSTEM.md) | Tokens, colors, typography, spacing reference |
| [Component Guide](docs/COMPONENT_GUIDE.md) | Key components, props, usage patterns |
| [Deployment](docs/DEPLOYMENT.md) | Build, deploy, environment configuration |
| [Known Issues](docs/KNOWN_ISSUES.md) | Current bugs and limitations |

Additional project files:

| File | Purpose |
|------|---------|
| [PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Screenshot references and page inventory |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development setup, code standards, PR checklist |

## Reference Screenshots

Annotated screenshots in `reference-screenshots/` serve as the visual source of truth. See [PROJECT_SPEC.md](docs/PROJECT_SPEC.md) for the full screenshot-to-page mapping.

## License

See [LICENSE](LICENSE).
