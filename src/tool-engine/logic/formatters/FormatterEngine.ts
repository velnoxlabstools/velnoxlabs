import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString } from '../utils';

function formatJson(text: string, indent = 2): LogicOutput {
  try {
    const parsed = JSON.parse(text);
    return { result: JSON.stringify(parsed, null, indent), valid: true };
  } catch (e) {
    return {
      result: text,
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    };
  }
}

export const FormatterEngine: ToolLogicModule = {
  id: 'formatter-base',
  name: 'FormatterEngine',
  category: 'general',
  kind: 'formatter',
  inputSchema: [
    { name: 'text', type: 'string', required: true },
    { name: 'mode', type: 'string' },
  ],
  outputSchema: [{ name: 'result', type: 'string' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const text = asString(input.text);
    const mode = asString(input.mode, 'trim');
    if (mode === 'json' || mode === 'json-format' || mode === 'pretty') return formatJson(text, 2);
    if (mode === 'json-minify' || mode === 'minify') {
      try {
        return { result: JSON.stringify(JSON.parse(text)), valid: true };
      } catch (e) {
        return {
          result: text,
          valid: false,
          error: e instanceof Error ? e.message : 'Invalid JSON',
        };
      }
    }
    if (mode === 'upper') return { result: text.toUpperCase() };
    if (mode === 'lower') return { result: text.toLowerCase() };
    if (mode === 'title') {
      return {
        result: text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
      };
    }
    return { result: text.trim() };
  },
};
