import type { CategoryNode, CategoryRegistrationInput, CategoryVisibility } from '../types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCategorySlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function validateCategoryInput(input: Partial<CategoryRegistrationInput>): string[] {
  const errors: string[] = [];
  if (!input.id?.trim()) errors.push('id is required');
  if (!input.slug?.trim()) errors.push('slug is required');
  else if (!SLUG_RE.test(input.slug)) errors.push('slug must be lowercase kebab-case');
  if (!input.name?.trim()) errors.push('name is required');
  if (!input.description?.trim()) errors.push('description is required');
  return errors;
}

export function isCategoryPublic(visibility: CategoryVisibility = 'public'): boolean {
  return visibility === 'public' || visibility === 'featured';
}

export function toCategoryNode(input: CategoryRegistrationInput): CategoryNode {
  return {
    id: input.id,
    slug: normalizeCategorySlug(input.slug),
    name: input.name,
    description: input.description,
    parentId: input.parentId ?? null,
    visibility: input.visibility ?? 'public',
    order: input.order ?? 0,
    icon: input.icon,
    toolIds: [],
    metadata: input.metadata,
  };
}
