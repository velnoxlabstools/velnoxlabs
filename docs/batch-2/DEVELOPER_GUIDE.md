# Developer Guide — Adding a Tool

## Minimum path (metadata only)

```ts
import { registerToolIntegrated } from '@/platform';

registerToolIntegrated({
  id: 'tool-word-counter',
  slug: 'word-counter',
  name: 'Word Counter',
  description: 'Count words and characters',
  categoryId: 'cat-text', // existing category id
  kind: 'analyzer',
  tags: ['text', 'count'],
  visibility: 'public',
});
```

This automatically:
- Registers metadata for homepage/categories/routes
- Assigns category membership
- Rebuilds search index (via platform hooks)
- Clears SEO/performance caches

## With runtime logic

```ts
registerToolIntegrated({
  id: 'tool-word-counter',
  slug: 'word-counter',
  name: 'Word Counter',
  description: 'Count words and characters',
  categoryId: 'cat-text',
  kind: 'analyzer',
  execute: async (input) => {
    const text = String(input.input ?? '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { output: String(words), stats: { words, chars: text.length } };
  },
});
```

## UI

Tool pages use the shared template + Universal Tool Interface / Form Engine.  
Pass a form schema when wiring tool-specific fields (Part 12–13).

## Code standards

- Strict TypeScript
- Design tokens only (no hardcoded colors/spacing in new UI)
- Validate via `@/security` ValidationManager
- Log via `@/security` logger (never log secrets)
- Prefer registry/config over new pages
