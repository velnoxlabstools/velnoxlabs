import type { ToolConfig, ToolLifecycleStatus } from '@/types/tool-engine';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_STATUS: ToolLifecycleStatus[] = [
  'published',
  'draft',
  'archived',
  'hidden',
  'deprecated',
];

export interface ToolValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateToolConfig(tool: Partial<ToolConfig>): ToolValidationResult {
  const errors: string[] = [];

  if (!tool.id?.trim()) errors.push('id is required');
  if (!tool.slug?.trim()) errors.push('slug is required');
  else if (!SLUG_RE.test(tool.slug)) errors.push('slug must be lowercase kebab-case');
  if (!tool.name?.trim()) errors.push('name is required');
  if (!tool.description?.trim()) errors.push('description is required');
  if (!tool.categoryId?.trim()) errors.push('categoryId is required');
  if (tool.status && !VALID_STATUS.includes(tool.status)) {
    errors.push(`status must be one of: ${VALID_STATUS.join(', ')}`);
  }
  if (tool.tags && !Array.isArray(tool.tags)) errors.push('tags must be an array');
  if (tool.usageCount != null && (typeof tool.usageCount !== 'number' || tool.usageCount < 0)) {
    errors.push('usageCount must be a non-negative number');
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidTool(tool: ToolConfig): void {
  const result = validateToolConfig(tool);
  if (!result.valid) {
    throw new Error(`Invalid tool "${tool.slug ?? tool.id}": ${result.errors.join('; ')}`);
  }
}

export function isPublicStatus(status: ToolLifecycleStatus): boolean {
  return status === 'published';
}
