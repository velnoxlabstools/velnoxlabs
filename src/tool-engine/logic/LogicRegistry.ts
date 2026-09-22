import type { ToolLogicModule } from './types';

const modules = new Map<string, ToolLogicModule>();

export class LogicRegistry {
  register(module: ToolLogicModule): void {
    if (!module.id || !module.process) {
      throw new Error('Invalid logic module');
    }
    modules.set(module.id, module);
    modules.set(module.name.toLowerCase().replace(/\s+/g, '-'), module);
  }

  unregister(id: string): boolean {
    const m = modules.get(id);
    if (!m) return false;
    modules.delete(m.id);
    modules.delete(m.name.toLowerCase().replace(/\s+/g, '-'));
    return true;
  }

  resolve(idOrSlug: string): ToolLogicModule | undefined {
    return modules.get(idOrSlug);
  }

  list(): ToolLogicModule[] {
    const seen = new Set<string>();
    const out: ToolLogicModule[] = [];
    for (const m of modules.values()) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m);
    }
    return out;
  }

  clear(): void {
    modules.clear();
  }
}

export const logicRegistry = new LogicRegistry();
