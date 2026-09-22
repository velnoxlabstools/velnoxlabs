import type { TransformRequest, TransformResult, TransformerFn } from '../types';
import { transformationPipeline } from '../pipeline';
import { transformationRegistry } from '../transformers';

export class TransformationManager {
  register(id: string, fn: TransformerFn): void {
    transformationRegistry.register(id, fn);
  }

  execute(req: TransformRequest): Promise<TransformResult> {
    return transformationPipeline.run(req);
  }

  list(): string[] {
    return transformationRegistry.list();
  }
}

export const transformationManager = new TransformationManager();
