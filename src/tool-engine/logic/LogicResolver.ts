import type { ToolLogicModule } from './types';
import { logicRegistry } from './LogicRegistry';

export class LogicResolver {
  resolve(idOrSlug: string): ToolLogicModule {
    const mod = logicRegistry.resolve(idOrSlug);
    if (!mod) throw new Error('Logic module not found: ' + idOrSlug);
    return mod;
  }

  tryResolve(idOrSlug: string): ToolLogicModule | null {
    return logicRegistry.resolve(idOrSlug) ?? null;
  }
}

export const logicResolver = new LogicResolver();
