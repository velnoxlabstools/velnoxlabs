# How to Add a Tool

```ts
import { toolConfigurationManager } from '@/tool-engine/configuration';
import { toolLogicManager } from '@/tool-engine/logic';

// 1) Optional: register logic
toolLogicManager.register({
  id: 'json-formatter',
  name: 'JSON Formatter',
  category: 'text',
  kind: 'formatter',
  inputSchema: [{ name: 'text', type: 'string', required: true }],
  outputSchema: [{ name: 'result', type: 'string' }],
  validate: () => null,
  process: (input) => ({ result: JSON.stringify(JSON.parse(String(input.text)), null, 2) }),
});

// 2) Register configuration (creates registry + platform hooks)
toolConfigurationManager.register({
  id: 'tool-json-formatter',
  name: 'JSON Formatter',
  slug: 'json-formatter',
  description: 'Format JSON',
  categoryId: 'cat-text',
  template: 'formatter',
  logicModuleId: 'json-formatter',
});
```

No new page file is required if dynamic tool routes are wired.
