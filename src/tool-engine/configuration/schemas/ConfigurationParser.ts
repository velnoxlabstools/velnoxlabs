import type { ToolConfiguration } from '../types';
import { normalizeConfigSlug } from '../utils';

export class ConfigurationParser {
  parse(raw: unknown): Partial<ToolConfiguration> {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Configuration must be an object');
    }
    const data = raw as Record<string, unknown>;
    const slug = data.slug != null ? normalizeConfigSlug(String(data.slug)) : undefined;
    return {
      ...(data as Partial<ToolConfiguration>),
      ...(slug ? { slug } : {}),
    };
  }

  parseJson(json: string): Partial<ToolConfiguration> {
    return this.parse(JSON.parse(json));
  }
}

export const configurationParser = new ConfigurationParser();
