import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString, asNumber } from '../utils';
import { SharedLogicUtilities } from '../shared';

export const ConverterEngine: ToolLogicModule = {
  id: 'converter-base',
  name: 'ConverterEngine',
  category: 'general',
  kind: 'converter',
  inputSchema: [{ name: 'value', type: 'number', required: true }, { name: 'from', type: 'string', required: true }, { name: 'to', type: 'string', required: true }],
  outputSchema: [{ name: 'result', type: 'number' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const value = asNumber(input.value);
    const from = asString(input.from, 'm');
    const to = asString(input.to, 'km');
    const result = SharedLogicUtilities.convertLength(value, from, to);
    return { result: SharedLogicUtilities.round(result, 6), from, to };

  },
};
