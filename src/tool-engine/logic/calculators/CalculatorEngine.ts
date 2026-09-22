import type { ToolLogicModule, LogicInput, LogicOutput } from '../types';
import { validateAgainstSchema, asString, asNumber } from '../utils';
import { SharedLogicUtilities } from '../shared';

export const CalculatorEngine: ToolLogicModule = {
  id: 'calculator-base',
  name: 'CalculatorEngine',
  category: 'general',
  kind: 'calculator',
  inputSchema: [{ name: 'a', type: 'number', required: true }, { name: 'b', type: 'number', required: true }, { name: 'op', type: 'string' }],
  outputSchema: [{ name: 'result', type: 'number' }],
  validate(input: LogicInput) {
    return validateAgainstSchema(input, this.inputSchema);
  },
  process(input: LogicInput): LogicOutput {
    const a = asNumber(input.a);
    const b = asNumber(input.b);
    const op = asString(input.op, 'add');
    let result = 0;
    switch (op) {
      case 'sub': result = a - b; break;
      case 'mul': result = a * b; break;
      case 'div': result = b === 0 ? NaN : a / b; break;
      default: result = a + b;
    }
    return { result: SharedLogicUtilities.round(result, 6) };

  },
};
