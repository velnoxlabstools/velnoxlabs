import type { ValidationResult } from '../types';
import { slugValidator } from './SlugValidator';
import { metadataValidator } from './MetadataValidator';
import { routeValidator } from './RouteValidator';
import { fileValidator } from './FileValidator';
import { requestValidator } from './RequestValidator';
import { securityLogger } from '../logging';

export class ValidationManager {
  slug = slugValidator;
  metadata = metadataValidator;
  route = routeValidator;
  file = fileValidator;
  request = requestValidator;

  assert(result: ValidationResult, context?: string): void {
    if (!result.valid) {
      securityLogger.invalidInput(context ?? 'unknown', { errors: result.errors });
      throw new Error(result.errors.join('; '));
    }
  }

  combine(...results: ValidationResult[]): ValidationResult {
    const errors = results.flatMap((r) => r.errors);
    return { valid: errors.length === 0, errors };
  }
}

export const validationManager = new ValidationManager();
