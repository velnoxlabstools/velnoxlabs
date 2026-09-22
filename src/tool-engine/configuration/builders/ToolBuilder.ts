import type { ToolConfiguration } from '../types';
import type { ToolManifest } from '../../types/registration';
import type { ToolInterfaceSchema } from '@/types/tool-interface';
import { defaultConfigurationProvider } from '../defaults';
import { templateResolver } from '../templates';
import { normalizeConfigSlug } from '../utils';

export class ToolBuilder {
  /** Expand partial config with defaults + template */
  build(
    partial: Partial<ToolConfiguration> & Pick<ToolConfiguration, 'id' | 'name' | 'slug' | 'description' | 'categoryId'>
  ): ToolConfiguration {
    const withTemplate = {
      ...partial,
      slug: normalizeConfigSlug(partial.slug),
      ...templateResolver.applyTemplate(partial),
    };
    return defaultConfigurationProvider.apply(withTemplate);
  }

  /** Map configuration → registration manifest */
  toManifest(config: ToolConfiguration): ToolManifest {
    return {
      id: config.id,
      slug: config.slug,
      name: config.name,
      description: config.shortDescription ?? config.description,
      categoryId: config.categoryId,
      kind: config.kind ?? 'custom',
      tags: config.tags ?? [],
      visibility: config.visibility ?? 'public',
      version: config.version,
      icon: config.icon,
      featured: config.featured,
      popular: config.popular,
      trending: config.trending,
      isNew: config.isNew,
      relatedToolIds: config.relatedToolIds,
      metadata: {
        title: config.seo?.title,
        description: config.seo?.description ?? config.description,
        keywords: config.seo?.keywords ?? config.keywords,
        noIndex: config.seo?.noIndex,
      },
    };
  }

  /** Map configuration → universal tool interface schema */
  toInterfaceSchema(config: ToolConfiguration): ToolInterfaceSchema {
    const inputs = (config.inputFields ?? []).map((f) => ({
      id: f.name,
      type: (f.type === 'textarea'
        ? 'textarea'
        : f.type === 'select'
          ? 'select'
          : f.type === 'checkbox'
            ? 'checkbox'
            : f.type === 'number'
              ? 'number'
              : 'text') as 'text' | 'textarea' | 'number' | 'select' | 'checkbox',
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      defaultValue: f.defaultValue,
      options: f.options,
    }));

    return {
      layout: 'split',
      inputs,
      outputs: [
        {
          id: 'result',
          type: config.outputType === 'json' ? 'json' : config.outputType === 'stats' ? 'stats' : config.outputType === 'html' ? 'html' : config.outputType === 'table' ? 'table' : 'text',
          label: 'Result',
        },
      ],
      actions: (config.buttons ?? []).map((b) => ({
        id: b.id,
        label: b.label,
        variant: b.variant,
        role: b.role,
      })),
    };
  }
}

export const toolBuilder = new ToolBuilder();
