import type { ToolManifest, ToolVisibility } from '../types/registration';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function validateManifest(manifest: Partial<ToolManifest>): string[] {
  const errors: string[] = [];
  if (!manifest.id?.trim()) errors.push('id is required');
  if (!manifest.slug?.trim()) errors.push('slug is required');
  else if (!SLUG_RE.test(manifest.slug)) errors.push('slug must be lowercase kebab-case');
  if (!manifest.name?.trim()) errors.push('name is required');
  if (!manifest.description?.trim()) errors.push('description is required');
  if (!manifest.categoryId?.trim()) errors.push('categoryId is required');
  if (!manifest.kind) errors.push('kind is required');
  return errors;
}

export function isPubliclyVisible(visibility: ToolVisibility = 'public'): boolean {
  return visibility === 'public' || visibility === 'featured' || visibility === 'popular';
}

export function visibilityToFlags(visibility: ToolVisibility = 'public') {
  return {
    featured: visibility === 'featured',
    popular: visibility === 'popular' || visibility === 'featured',
    status:
      visibility === 'draft'
        ? ('draft' as const)
        : visibility === 'archived' || visibility === 'deprecated' || visibility === 'hidden' || visibility === 'private'
          ? ('archived' as const)
          : ('published' as const),
  };
}
