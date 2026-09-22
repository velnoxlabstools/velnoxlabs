# Batch 3 — Architecture Diagram

```
Next.js App Router
├── Providers: Theme → Preferences → Security → Performance → Layout → Search
├── Features: home · tools · categories · search UI
├── Services: home · tools · categories · search · routing · platform
└── Engines (Batch 2–3)
    ├── tool-engine (runtime · registry · logic · configuration)
    ├── category-engine
    ├── content
    ├── seo · performance · security
    ├── analytics · search (enterprise)
    ├── file-engine · data-engine · exchange-engine
    └── preferences
```

## Integration Flow

1. Config → `toolConfigurationManager.register` → registry + runtime + category map  
2. Tool page → Universal UI → logic/data/file engines → exchange export/share  
3. Search → `src/search` engine (index/rank/filter) + existing `/search` feature  
4. Preferences → theme/layout/export defaults applied globally  
5. Security ErrorBoundary wraps tree; performance cache/CWV available  

## Dependency Graph (high level)

```
features → services → data
tool-engine → services/tools + runtime
configuration → toolRegistrar + logic
data-engine ← adapters ← tool logic / file text
exchange-engine ← tool outputs
file-engine ← upload UI
search ← data seeds
analytics ← events from UI
preferences ← storage (client)
seo ← tools/categories routes
```
