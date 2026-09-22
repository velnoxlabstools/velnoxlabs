import type { ToolRuntimeDefinition } from '../types';

export class ToolValidator {
  validateDefinition(def: Partial<ToolRuntimeDefinition>): string[] {
    const errors: string[] = [];
    if (!def.id?.trim()) errors.push('id is required');
    if (!def.slug?.trim()) errors.push('slug is required');
    if (!def.kind) errors.push('kind is required');
    if (typeof def.execute !== 'function') errors.push('execute handler is required');
    return errors;
  }

  assertValid(def: ToolRuntimeDefinition): void {
    const errors = this.validateDefinition(def);
    if (errors.length) {
      throw new Error(`Invalid tool runtime: ${errors.join('; ')}`);
    }
  }
}

export const toolValidator = new ToolValidator();
