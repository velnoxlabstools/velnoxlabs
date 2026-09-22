# Deployment Report

## Model
Platform-agnostic: configure via env (`src/environment`), build with `pnpm build`.

## CI/CD
- PR: lint, types, unit/coverage, build, e2e
- Tag: release validation workflow

## Rollback
1. Revert to previous git tag / deployment
2. `recoveryManager.rollback('full')` for config/registry snapshots if used
3. Disable traffic via maintenance flag `NEXT_PUBLIC_FLAG_MAINTENANCE=true`

## Commands
```bash
pnpm quality
pnpm build
node scripts/production/readiness-check.mjs
READINESS_FULL=1 node scripts/production/readiness-check.mjs
```
