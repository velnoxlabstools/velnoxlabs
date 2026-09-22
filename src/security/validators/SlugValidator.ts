import type { ValidationResult } from '../types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class SlugValidator {
  validate(slug: unknown): ValidationResult {
    if (typeof slug !== 'string' || !slug.trim()) {
      return { valid: false, errors: ['Slug is required'] };
    }
    if (slug.length > 80) {
      return { valid: false, errors: ['Slug is too long'] };
    }
    if (!SLUG_RE.test(slug)) {
      return { valid: false, errors: ['Slug must be lowercase kebab-case'] };
    }
    return { valid: true, errors: [] };
  }
}

export const slugValidator = new SlugValidator();
