import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString } from '../utils';

function fromBase64(text: string): string {
  const cleaned = text.replace(/\s/g, '');
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(cleaned)));
  return Buffer.from(cleaned, 'base64').toString('utf8');
}

export const DecoderEngine: ToolLogicModule = {
  id: 'decoder-base',
  name: 'DecoderEngine',
  category: 'general',
  kind: 'decoder',
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
    const mode = asString(input.mode, 'base64');
    try {
      if (mode === 'uri' || mode === 'url') return { result: decodeURIComponent(text) };
      return { result: fromBase64(text) };
    } catch (e) {
      return {
        result: '',
        error: e instanceof Error ? e.message : 'Decode failed — check input format',
      };
    }
  },
};
