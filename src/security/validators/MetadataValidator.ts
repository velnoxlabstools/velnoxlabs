import type { ValidationResult } from '../types';

export class MetadataValidator {
  validate(meta: { title?: string; description?: string }): ValidationResult {
    const errors: string[] = [];
    if (meta.title != null && meta.title.length > 70) {
      errors.push('Title should be under 70 characters');
    }
    if (meta.description != null && meta.description.length > 200) {
      errors.push('Description should be under 200 characters');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const metadataValidator = new MetadataValidator();
