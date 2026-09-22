import type { ValidationResult } from '../types';

export class RouteValidator {
  validate(path: unknown): ValidationResult {
    if (typeof path !== 'string' || !path.startsWith('/')) {
      return { valid: false, errors: ['Path must start with /'] };
    }
    if (path.includes('://') || path.includes('//')) {
      return { valid: false, errors: ['Path must be relative and safe'] };
    }
    if (path.length > 2048) {
      return { valid: false, errors: ['Path is too long'] };
    }
    return { valid: true, errors: [] };
  }
}

export const routeValidator = new RouteValidator();
