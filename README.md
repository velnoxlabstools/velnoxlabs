# VelnoxLabs v1.0.0

Free, private, browser-based tools platform built with **Next.js 15** (App Router) and **TypeScript**.

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

```bash
npm install -g pnpm
```

## Setup

```bash
# extract archive, then:
cd velnoxlabs
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm test:unit` | Unit tests (Vitest) |
| `pnpm test:e2e` | E2E tests (Playwright) |
| `pnpm quality` | Local quality gate |
| `pnpm readiness` | Production readiness check |

## Architecture

Configuration-driven tools platform:

- `src/tool-engine` — runtime, registry, logic, configuration
- `src/category-engine`, `src/content`, `src/seo`, `src/search`
- `src/data-engine`, `src/file-engine`, `src/exchange-engine`
- `src/analytics`, `src/monitoring`, `src/recovery`, `src/preferences`, `src/environment`
- `src/security` — headers, validation, sanitization

Documentation: `docs/` (setup, architecture, deployment, security, v1.0 freeze).

## Environment

Copy `.env.example` to `.env.local`. Key variables:

- `NEXT_PUBLIC_APP_ENV` — `local` \| `staging` \| `production`
- `NEXT_PUBLIC_APP_URL` — public site URL
- Feature flags: `NEXT_PUBLIC_FLAG_*`

## License

Private / proprietary unless otherwise stated.
