import type { RuntimeInput, ToolRuntimeDefinition } from '../../types';
import { sanitizeInput } from '../../utils';

export class InputProcessor {
  process(input: RuntimeInput, definition: ToolRuntimeDefinition): RuntimeInput {
    const cleaned = sanitizeInput(input);

    if (definition.validate) {
      const error = definition.validate(cleaned);
      if (error) {
        throw new Error(error);
      }
    }

    return cleaned;
  }
}
