import type { ConfigurationValidationResult, ToolConfiguration } from '../types';
import { isValidSlug } from '../utils';

export class ConfigurationValidator {
  validate(config: Partial<ToolConfiguration>): ConfigurationValidationResult {
    const errors: string[] = [];
    if (!config.id?.trim()) errors.push('id is required');
    if (!config.name?.trim()) errors.push('name is required');
    if (!config.slug?.trim()) errors.push('slug is required');
    else if (!isValidSlug(config.slug)) errors.push('slug must be lowercase kebab-case');
    if (!config.description?.trim()) errors.push('description is required');
    if (!config.categoryId?.trim()) errors.push('categoryId is required');
    if (config.inputFields && !Array.isArray(config.inputFields)) {
      errors.push('inputFields must be an array');
    }
    if (config.version && typeof config.version !== 'string') {
      errors.push('version must be a string');
    }
    return { valid: errors.length === 0, errors };
  }
}

export const configurationValidator = new ConfigurationValidator();
