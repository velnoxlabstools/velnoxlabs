# Project Overview

**VelnoxLabs** is a modular Next.js 15 platform for free online tools (formatters, converters, generators, analyzers).

## Goals
- Configuration-driven tools (no hardcoded pages per tool)
- Shared runtime, form UI, SEO, search, analytics
- Enterprise folder architecture and CI quality gates

## Stack
- Next.js 15 App Router, TypeScript (strict)
- Design tokens / theme, pnpm
- Vitest + Playwright, GitHub Actions

## Key modules
- src/tool-engine — runtime, registry, logic, configuration
- src/category-engine, src/content, src/seo, src/search
- src/file-engine, src/data-engine, src/exchange-engine
- src/analytics, src/preferences, src/monitoring, src/recovery
- src/environment — multi-env configuration
