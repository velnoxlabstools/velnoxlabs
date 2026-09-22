import type { ToolButtonConfig, ToolConfiguration } from '../types';

export const DEFAULT_BUTTONS: ToolButtonConfig[] = [
  { id: 'run', label: 'Run', role: 'submit', variant: 'primary' },
  { id: 'copy', label: 'Copy', role: 'copy', variant: 'secondary' },
  { id: 'reset', label: 'Reset', role: 'reset', variant: 'ghost' },
];

export class DefaultConfigurationProvider {
  apply(partial: Partial<ToolConfiguration> & Pick<ToolConfiguration, 'id' | 'name' | 'slug' | 'description' | 'categoryId'>): ToolConfiguration {
    return {
      status: 'published',
      visibility: 'public',
      version: '1.0.0',
      featured: false,
      popular: false,
      trending: false,
      isNew: false,
      tags: [],
      keywords: [],
      template: 'custom',
      kind: 'custom',
      inputFields: [
        {
          name: 'input',
          type: 'textarea',
          label: 'Input',
          required: true,
        },
      ],
      outputType: 'text',
      buttons: DEFAULT_BUTTONS,
      adsPlaceholder: false,
      analyticsEvents: [],
      permissions: [],
      ...partial,
    };
  }
}

export const defaultConfigurationProvider = new DefaultConfigurationProvider();
