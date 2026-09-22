import type { ValidationResult } from '../types';
import { routeValidator } from './RouteValidator';

export class RequestValidator {
  validateMethod(method: string, allowed: string[]): ValidationResult {
    if (!allowed.includes(method.toUpperCase())) {
      return { valid: false, errors: [`Method ${method} not allowed`] };
    }
    return { valid: true, errors: [] };
  }

  validatePath(path: string): ValidationResult {
    return routeValidator.validate(path);
  }
}

export const requestValidator = new RequestValidator();
