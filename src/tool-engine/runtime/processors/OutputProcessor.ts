import type { RuntimeOutput } from '../../types';

export class OutputProcessor {
  process(output: RuntimeOutput | null | undefined): RuntimeOutput {
    if (output == null) return {};
    if (typeof output !== 'object' || Array.isArray(output)) {
      return { result: output as unknown };
    }
    return { ...output };
  }
}
