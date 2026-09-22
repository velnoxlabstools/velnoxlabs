import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString } from '../utils';
import { SharedLogicUtilities } from '../shared';

export const ParserEngine: ToolLogicModule = {
  id: 'parser-base',
  name: 'ParserEngine',
  category: 'general',
  kind: 'parser',
  inputSchema: [
    { name: 'text', type: 'string', required: true },
    { name: 'mode', type: 'string' },
  ],
  outputSchema: [{ name: 'result', type: 'object' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const text = asString(input.text);
    const mode = asString(input.mode, 'stats');
    if (mode === 'stats' || mode === 'word-count') {
      const words = SharedLogicUtilities.wordCount(text);
      const chars = SharedLogicUtilities.charCount(text, true);
      const charsNoSpace = SharedLogicUtilities.charCount(text, false);
      const lines = SharedLogicUtilities.splitLines(text).length;
      return {
        result: { words, characters: chars, charactersNoSpaces: charsNoSpace, lines },
        words,
        characters: chars,
        lines,
      };
    }
    if (mode === 'lines') return { result: SharedLogicUtilities.splitLines(text) };
    return { result: text };
  },
};
