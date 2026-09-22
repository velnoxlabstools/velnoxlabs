/**
 * RC bootstrap: bind seed tools to configuration + logic so registry/runtime are not empty.
 * Idempotent — safe to call multiple times.
 */
import { toolConfigurationManager } from '@/tool-engine/configuration';
import { toolLogicManager } from '@/tool-engine/logic';
import { dataEngine } from '@/data-engine';
import type { ToolLogicModule } from '@/tool-engine/logic/types';

let bootstrapped = false;

const jsonFormatterLogic: ToolLogicModule = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  category: 'dev',
  kind: 'formatter',
  inputSchema: [{ name: 'text', type: 'string', required: true }],
  outputSchema: [{ name: 'result', type: 'string' }],
  validate: (input) => {
    if (!input.text && input.text !== '') return 'text is required';
    return null;
  },
  process: async (input) => {
    const res = await dataEngine.run(String(input.text ?? ''), 'beautify', 'json');
    if (!res.ok) throw new Error(res.error ?? 'JSON format failed');
    return { result: res.output ?? '' };
  },
};

const base64Logic: ToolLogicModule = {
  id: 'base64-encoder',
  name: 'Base64 Encoder',
  category: 'dev',
  kind: 'encoder',
  inputSchema: [
    { name: 'text', type: 'string', required: true },
    { name: 'mode', type: 'string' },
  ],
  outputSchema: [{ name: 'result', type: 'string' }],
  validate: () => null,
  process: async (input) => {
    const mode = String(input.mode ?? 'encode');
    const text = String(input.text ?? '');
    const res =
      mode === 'decode'
        ? await dataEngine.run(text, 'decode', 'text', 'base64')
        : await dataEngine.run(text, 'encode', 'text', 'base64');
    if (!res.ok) throw new Error(res.error ?? 'Base64 failed');
    return { result: res.output ?? '' };
  },
};

export function bootstrapSeedTools(): { ok: boolean; registered: string[] } {
  if (bootstrapped) {
    return { ok: true, registered: ['json-formatter', 'base64-encoder'] };
  }

  const registered: string[] = [];

  try {
    toolLogicManager.register(jsonFormatterLogic);
    toolConfigurationManager.register({
      id: 'tool-json-formatter',
      name: 'JSON Formatter',
      slug: 'json-formatter',
      description: 'Format and validate JSON in your browser.',
      categoryId: 'cat-dev',
      template: 'formatter',
      tags: ['json', 'format', 'developer'],
      featured: true,
      popular: true,
      trending: true,
      logicModuleId: 'json-formatter',
    });
    registered.push('json-formatter');
  } catch {
    /* already registered */
  }

  try {
    toolLogicManager.register(base64Logic);
    toolConfigurationManager.register({
      id: 'tool-base64',
      name: 'Base64 Encoder',
      slug: 'base64-encoder',
      description: 'Encode and decode Base64 strings.',
      categoryId: 'cat-dev',
      template: 'encoder',
      tags: ['base64', 'encode'],
      featured: true,
      popular: true,
      logicModuleId: 'base64-encoder',
    });
    registered.push('base64-encoder');
  } catch {
    /* already registered */
  }

  bootstrapped = true;
  return { ok: true, registered };
}
