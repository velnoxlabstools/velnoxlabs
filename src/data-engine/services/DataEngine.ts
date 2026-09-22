import type { DataFormat, TransformOp, TransformRequest, TransformResult, TransformerFn } from '../types';
import { transformationManager } from '../processors';
import { adapterManager } from '../adapters';
import type { LogicInput } from '@/tool-engine/logic/types';

/**
 * Universal data transformation entry point for text/data tools.
 */
export class DataEngine {
  registerTransformer(id: string, fn: TransformerFn): void {
    transformationManager.register(id, fn);
  }

  transform(req: TransformRequest): Promise<TransformResult> {
    return transformationManager.execute(req);
  }

  async run(
    input: string,
    operation: TransformOp,
    format?: DataFormat,
    targetFormat?: DataFormat,
    options?: Record<string, unknown>
  ): Promise<TransformResult> {
    return this.transform({ input, operation, format, targetFormat, options });
  }

  fromToolInput(
    input: LogicInput,
    operation: TransformOp,
    format?: DataFormat
  ): Promise<TransformResult> {
    return this.transform(adapterManager.fromLogicInput(input, operation, format));
  }

  listTransformers(): string[] {
    return transformationManager.list();
  }
}

export const dataEngine = new DataEngine();
