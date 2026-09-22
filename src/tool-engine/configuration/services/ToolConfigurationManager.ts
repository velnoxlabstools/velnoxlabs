import type { ToolConfiguration } from '../types';
import { configurationValidator } from '../validators';
import { configurationRegistry } from '../registry';
import { toolBuilder } from '../builders';
import { normalizeConfigSlug } from '../utils';
import { toolRegistrar } from '../../registry/ToolRegistrar';
import { toolLogicManager } from '../../logic/ToolLogicManager';
import { logicRegistry } from '../../logic/LogicRegistry';

export interface RegisterFromConfigResult {
  ok: boolean;
  config?: ToolConfiguration;
  errors: string[];
  actions: string[];
}

/**
 * End-to-end: validate config → build → registry → platform registration → optional logic bridge.
 */
export class ToolConfigurationManager {
  register(
    partial: Partial<ToolConfiguration> & Pick<ToolConfiguration, 'id' | 'name' | 'slug' | 'description' | 'categoryId'>
  ): RegisterFromConfigResult {
    const actions: string[] = [];
    const built = toolBuilder.build({
      ...partial,
      slug: normalizeConfigSlug(partial.slug),
    });

    const validation = configurationValidator.validate(built);
    if (!validation.valid) {
      return { ok: false, errors: validation.errors, actions };
    }

    // Duplicate checks
    const bySlug = configurationRegistry.get(built.slug);
    if (bySlug && bySlug.id !== built.id) {
      return { ok: false, errors: [`Duplicate slug: ${built.slug}`], actions };
    }
    const byId = configurationRegistry.get(built.id);
    if (byId && byId.slug !== built.slug && configurationRegistry.has(built.slug)) {
      return { ok: false, errors: [`Duplicate id: ${built.id}`], actions };
    }

    configurationRegistry.set(built);
    actions.push('configuration-stored');

    const manifest = toolBuilder.toManifest(built);
    // Attach logic handler if logic module exists
    if (built.logicModuleId) {
      const logic = logicRegistry.resolve(built.logicModuleId);
      if (logic) {
        manifest.execute = async (input) => {
          const result = await toolLogicManager.execute(built.logicModuleId!, input);
          if (!result.ok) throw new Error(result.error ?? 'Logic failed');
          return result.output ?? {};
        };
        actions.push('logic-bound');
      }
    }

    const reg = toolRegistrar.register(manifest);
    actions.push(...reg.actions);
    if (!reg.ok) {
      return { ok: false, errors: reg.errors, actions, config: built };
    }

    return { ok: true, config: built, errors: [], actions };
  }

  unregister(idOrSlug: string): boolean {
    const config = configurationRegistry.get(idOrSlug);
    if (!config) return false;
    configurationRegistry.delete(config.id);
    toolRegistrar.unregister(config.slug);
    return true;
  }

  getInterfaceSchema(idOrSlug: string) {
    const config = configurationRegistry.get(idOrSlug);
    if (!config) return null;
    return toolBuilder.toInterfaceSchema(config);
  }

  get(idOrSlug: string) {
    return configurationRegistry.get(idOrSlug) ?? null;
  }

  list() {
    return configurationRegistry.list();
  }
}

export const toolConfigurationManager = new ToolConfigurationManager();
