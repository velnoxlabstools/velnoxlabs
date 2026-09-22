# VelnoxLabs Batch 2 — Architecture Overview

## Final Architecture Diagram

```
                    ┌─────────────────────────┐
                    │   Next.js App Router    │
                    │  (public) routes + SEO  │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Features    │     │  Tool Engine    │     │ Category Engine │
│ home/tools/   │◄───►│ runtime+registry│◄───►│ map+relations   │
│ categories/   │     │ form interface  │     │                 │
│ search        │     └────────┬────────┘     └────────┬────────┘
└───────┬───────┘              │                       │
        │                      ▼                       │
        │             ┌─────────────────┐              │
        └────────────►│ Platform Services│◄─────────────┘
                      │ home/tools/cats  │
                      │ search/routing   │
                      └────────┬─────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   ┌──────────┐          ┌──────────┐          ┌──────────┐
   │   SEO    │          │Performance│         │ Security │
   │ metadata │          │ cache/CWV │         │ errors/  │
   │ schema   │          │ lazy/perf │         │ validate │
   └──────────┘          └──────────┘          └──────────┘
```

## Integration Flow

1. **Register tool** → `registerToolIntegrated(manifest)`  
   → ToolRegistrar → runtime handler + metadata registry + category map  
   → cache clear + search reindex + SEO cache clear  

2. **Page request** `/tools/[slug]`  
   → ToolPage template → Universal interface → Runtime execute on Run  
   → SEO via generateMetadata / seoService.forTool  

3. **Category page**  
   → Category engine relations + tool lists from mapper  

4. **Homepage**  
   → Homepage service engines (featured/trending/new) from tool registry  

5. **Search**  
   → Index rebuilt from tools + categories + static pages  

6. **Errors**  
   → ErrorBoundary + GlobalErrorHandler + Logger (no stack to users)  

## Module Dependency Graph

```
platform/integration
  ├── tool-engine (registry, runtime)
  ├── category-engine (mapper, relations)
  ├── services/platform (bootstrap, onToolRegistryChange)
  ├── seo
  ├── performance
  └── security

features/* → services/* → data/*
tool pages → tool-engine + form-engine + security
app layout → theme + security + performance + layout + search
```
