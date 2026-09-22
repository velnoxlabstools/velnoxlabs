# VelnoxLabs Testing

## Commands
- `pnpm test:unit` — unit tests (Vitest)
- `pnpm test:integration` — integration tests
- `pnpm test:coverage` — coverage report → `tests/coverage`
- `pnpm test:e2e` — Playwright E2E

## Layout
```
tests/
  unit/ integration/ e2e/
  fixtures/ mocks/ helpers/
  vitest/ playwright/
  reports/ coverage/
```

## Strategy
Critical engines (data, search, security, configuration, exchange, preferences, platform) have unit coverage first.
E2E covers homepage, search route, tools index smoke paths.
