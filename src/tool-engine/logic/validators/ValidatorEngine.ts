import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString } from '../utils';

export const ValidatorEngine: ToolLogicModule = {
  id: 'validator-base',
  name: 'ValidatorEngine',
  category: 'general',
  kind: 'validator',
  inputSchema: [
    { name: 'text', type: 'string', required: true },
    { name: 'type', type: 'string' },
  ],
  outputSchema: [{ name: 'valid', type: 'boolean' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const text = asString(input.text);
    const type = asString(input.type, 'json');
    if (type === 'json') {
      try {
        JSON.parse(text);
        return { valid: true, result: 'Valid JSON' };
      } catch (e) {
        return {
          valid: false,
          result: 'Invalid JSON',
          error: e instanceof Error ? e.message : 'Parse error',
        };
      }
    }
    if (type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      return { valid: ok, result: ok ? 'Valid email' : 'Invalid email' };
    }
    if (type === 'url') {
      try {
        void new URL(text);
        return { valid: true, result: 'Valid URL' };
      } catch {
        return { valid: false, result: 'Invalid URL' };
      }
    }
    if (type === 'regex') {
      try {
        void new RegExp(text);
        return { valid: true, result: 'Valid regular expression' };
      } catch (e) {
        return {
          valid: false,
          result: 'Invalid regular expression',
          error: e instanceof Error ? e.message : 'Invalid pattern',
        };
      }
    }
    return { valid: text.length > 0, result: text.length > 0 ? 'OK' : 'Empty' };
  },
};
