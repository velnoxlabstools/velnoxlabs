# Developer Setup Guide

## Prerequisites
- Node.js 22+
- pnpm 9+
- Git

## Install
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```
Open http://localhost:3000

## Common scripts
| Command | Purpose |
|---------|---------|
| pnpm dev | Local server |
| pnpm build | Production build |
| pnpm typecheck | TypeScript |
| pnpm lint | ESLint |
| pnpm test:unit | Unit tests |
| pnpm test:e2e | Playwright |
| pnpm quality | Local quality gate |
