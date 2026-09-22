import type { TransformRequest } from '../types';
import type { LogicInput } from '@/tool-engine/logic/types';

/** Bridge tool logic / file engine payloads into TransformRequest */
export class AdapterManager {
  fromLogicInput(input: LogicInput, operation: TransformRequest['operation'], format?: TransformRequest['format']): TransformRequest {
    const text = String(input.input ?? input.text ?? input.value ?? '');
    return {
      input: text,
      operation,
      format: format ?? 'text',
      options: input,
    };
  }

  fromFileText(text: string, operation: TransformRequest['operation'], format?: TransformRequest['format']): TransformRequest {
    return { input: text, operation, format: format ?? 'text' };
  }
}

export const adapterManager = new AdapterManager();
