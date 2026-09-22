import type { ToolConfiguration } from '../types';
import { configurationParser } from '../schemas';
import { configurationRegistry } from '../registry';

export class ConfigurationLoader {
  load(idOrSlug: string): ToolConfiguration | null {
    return configurationRegistry.get(idOrSlug) ?? null;
  }

  loadAll(): ToolConfiguration[] {
    return configurationRegistry.list();
  }

  fromJson(json: string): Partial<ToolConfiguration> {
    return configurationParser.parseJson(json);
  }

  fromObject(raw: unknown): Partial<ToolConfiguration> {
    return configurationParser.parse(raw);
  }
}

export const configurationLoader = new ConfigurationLoader();
