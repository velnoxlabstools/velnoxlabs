# Developer Handbook v1.0

## Setup
pnpm install && cp .env.example .env.local && pnpm dev

## Add a tool
toolLogicManager.register(...) optional
toolConfigurationManager.register({ id, name, slug, description, categoryId, ... })

## Scripts
pnpm typecheck | lint | test:unit | test:e2e | build | quality | readiness
