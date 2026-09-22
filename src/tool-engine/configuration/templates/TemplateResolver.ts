import type { ToolConfiguration, ToolFieldConfig, ToolTemplateKind } from '../types';
import type { ToolKind } from '../../types';

const TEMPLATE_DEFAULTS: Record<ToolTemplateKind, { kind: ToolKind; inputFields: ToolFieldConfig[]; outputType: ToolConfiguration['outputType'] }> = {
  calculator: {
    kind: 'calculator',
    outputType: 'stats',
    inputFields: [
      { name: 'a', type: 'number', label: 'A', required: true },
      { name: 'b', type: 'number', label: 'B', required: true },
      { name: 'op', type: 'select', label: 'Operation', options: [
        { label: 'Add', value: 'add' },
        { label: 'Subtract', value: 'sub' },
        { label: 'Multiply', value: 'mul' },
        { label: 'Divide', value: 'div' },
      ]},
    ],
  },
  converter: {
    kind: 'converter',
    outputType: 'text',
    inputFields: [
      { name: 'value', type: 'number', label: 'Value', required: true },
      { name: 'from', type: 'string', label: 'From', required: true },
      { name: 'to', type: 'string', label: 'To', required: true },
    ],
  },
  generator: {
    kind: 'generator',
    outputType: 'text',
    inputFields: [{ name: 'length', type: 'number', label: 'Length', defaultValue: 12 }],
  },
  formatter: {
    kind: 'formatter',
    outputType: 'text',
    inputFields: [
      { name: 'text', type: 'textarea', label: 'Text', required: true },
      { name: 'mode', type: 'select', label: 'Mode', options: [
        { label: 'Trim', value: 'trim' },
        { label: 'Uppercase', value: 'upper' },
        { label: 'Lowercase', value: 'lower' },
        { label: 'Title', value: 'title' },
      ]},
    ],
  },
  validator: {
    kind: 'validator',
    outputType: 'json',
    inputFields: [
      { name: 'text', type: 'string', label: 'Value', required: true },
      { name: 'type', type: 'select', label: 'Type', options: [
        { label: 'Email', value: 'email' },
        { label: 'URL', value: 'url' },
      ]},
    ],
  },
  encoder: {
    kind: 'encoder',
    outputType: 'text',
    inputFields: [
      { name: 'text', type: 'textarea', label: 'Text', required: true },
      { name: 'mode', type: 'select', label: 'Mode', options: [
        { label: 'Base64', value: 'base64' },
        { label: 'URI', value: 'uri' },
      ]},
    ],
  },
  decoder: {
    kind: 'decoder',
    outputType: 'text',
    inputFields: [
      { name: 'text', type: 'textarea', label: 'Encoded', required: true },
      { name: 'mode', type: 'select', label: 'Mode', options: [
        { label: 'Base64', value: 'base64' },
        { label: 'URI', value: 'uri' },
      ]},
    ],
  },
  parser: {
    kind: 'parser',
    outputType: 'json',
    inputFields: [
      { name: 'text', type: 'textarea', label: 'Content', required: true },
      { name: 'format', type: 'select', label: 'Format', options: [
        { label: 'JSON', value: 'json' },
        { label: 'Lines', value: 'lines' },
      ]},
    ],
  },
  editor: {
    kind: 'editor',
    outputType: 'text',
    inputFields: [{ name: 'text', type: 'textarea', label: 'Content', required: true }],
  },
  analyzer: {
    kind: 'analyzer',
    outputType: 'stats',
    inputFields: [{ name: 'text', type: 'textarea', label: 'Text', required: true }],
  },
  custom: {
    kind: 'custom',
    outputType: 'text',
    inputFields: [{ name: 'input', type: 'textarea', label: 'Input', required: true }],
  },
};

export class TemplateResolver {
  resolve(template: ToolTemplateKind = 'custom') {
    return TEMPLATE_DEFAULTS[template] ?? TEMPLATE_DEFAULTS.custom;
  }

  applyTemplate(config: Partial<ToolConfiguration>): Partial<ToolConfiguration> {
    const t = this.resolve(config.template ?? 'custom');
    return {
      kind: config.kind ?? t.kind,
      inputFields: config.inputFields ?? t.inputFields,
      outputType: config.outputType ?? t.outputType,
      logicModuleId: config.logicModuleId,
    };
  }
}

export const templateResolver = new TemplateResolver();
