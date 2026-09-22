# Architecture Overview

```
App Router (src/app)
  -> Providers (theme, preferences, security, performance, layout, search)
  -> Features (home, tools, categories, search UI)
  -> Services
  -> Engines (tool, category, content, seo, search, file, data, exchange, analytics, monitoring, recovery, environment)
  -> Data seeds
```

## Principles
- Registry-driven: tools/categories register once; routes/search/SEO update via services
- One tool template: metadata + config + optional logic module
- Client-first processing for tools; only NEXT_PUBLIC_* in the browser

See Batch 2-3 reports under docs/batch-*.
