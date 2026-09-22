import type { ToolKind, ToolHandler } from './index';

export type ToolVisibility =
  | 'draft'
  | 'private'
  | 'public'
  | 'featured'
  | 'popular'
  | 'hidden'
  | 'deprecated'
  | 'archived';

export interface ToolManifest {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  kind: ToolKind;
  tags?: string[];
  visibility?: ToolVisibility;
  version?: string;
  icon?: string;
  /** Runtime handler — optional at metadata-only registration */
  execute?: ToolHandler;
  validate?: (input: Record<string, unknown>) => string | null;
  timeoutMs?: number;
  relatedToolIds?: string[];
  featured?: boolean;
  trending?: boolean;
  popular?: boolean;
  isNew?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    noIndex?: boolean;
  };
}

export interface RegistrationResult {
  ok: boolean;
  slug: string;
  id: string;
  errors: string[];
  actions: string[];
}

export interface UnregisterResult {
  ok: boolean;
  slug: string;
  actions: string[];
}
