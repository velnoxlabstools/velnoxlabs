import type { ToolConfiguration } from '../types';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeConfigSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function mergeConfig(
  base: Partial<ToolConfiguration>,
  override: Partial<ToolConfiguration>
): Partial<ToolConfiguration> {
  return {
    ...base,
    ...override,
    tags: override.tags ?? base.tags,
    keywords: override.keywords ?? base.keywords,
    inputFields: override.inputFields ?? base.inputFields,
    buttons: override.buttons ?? base.buttons,
    seo: { ...base.seo, ...override.seo },
    faqs: override.faqs ?? base.faqs,
  };
}
