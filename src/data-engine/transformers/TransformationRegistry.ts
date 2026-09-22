import type { TransformerFn } from '../types';
import { builtinTransformers } from './builtin';

const registry = new Map<string, TransformerFn>(Object.entries(builtinTransformers));

export class TransformationRegistry {
  register(id: string, fn: TransformerFn): void {
    registry.set(id, fn);
  }

  get(id: string): TransformerFn | undefined {
    return registry.get(id);
  }

  has(id: string): boolean {
    return registry.has(id);
  }

  list(): string[] {
    return [...registry.keys()];
  }
}

export const transformationRegistry = new TransformationRegistry();
