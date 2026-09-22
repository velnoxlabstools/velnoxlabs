import type { ToolRuntimeDefinition } from '../types';
import { toolRuntimeRegistry } from './ToolRegistryConnector';

export class ToolResolver {
  resolve(idOrSlug: string): ToolRuntimeDefinition {
    const def = toolRuntimeRegistry.resolve(idOrSlug);
    if (!def) {
      throw new Error(`Tool runtime not registered: ${idOrSlug}`);
    }
    return def;
  }

  tryResolve(idOrSlug: string): ToolRuntimeDefinition | null {
    return toolRuntimeRegistry.resolve(idOrSlug) ?? null;
  }
}

export const toolResolver = new ToolResolver();
