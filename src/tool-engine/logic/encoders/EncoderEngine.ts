import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString } from '../utils';

function toBase64(text: string): string {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(text)));
  return Buffer.from(text, 'utf8').toString('base64');
}

export const EncoderEngine: ToolLogicModule = {
  id: 'encoder-base',
  name: 'EncoderEngine',
  category: 'general',
  kind: 'encoder',
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
      if (mode === 'uri' || mode === 'url' || mode === 'uri-component') {
        return { result: encodeURIComponent(text) };
      }
      return { result: toBase64(text) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Encode failed', result: '' };
    }
  },
};
