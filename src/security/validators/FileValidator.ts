import type { ValidationResult } from '../types';

export class FileValidator {
  validate(
    file: { name?: string; size?: number; type?: string } | null | undefined,
    options?: { maxBytes?: number; allowedTypes?: string[] }
  ): ValidationResult {
    if (!file) return { valid: false, errors: ['File is required'] };
    const errors: string[] = [];
    const max = options?.maxBytes ?? 5 * 1024 * 1024;
    if (typeof file.size === 'number' && file.size > max) {
      errors.push(`File exceeds ${Math.round(max / 1024)}KB limit`);
    }
    if (options?.allowedTypes?.length && file.type) {
      const ok = options.allowedTypes.some(
        (t) => file.type === t || file.type?.startsWith(t.replace('*', ''))
      );
      if (!ok) errors.push('File type not allowed');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const fileValidator = new FileValidator();
