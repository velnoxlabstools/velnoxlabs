import type { ToolKind } from '../../types';
import type { ToolVisibility } from '../../types/registration';
import type { LogicSchemaField } from '../../logic/types';

export type ToolTemplateKind =
  | 'calculator'
  | 'converter'
  | 'generator'
  | 'formatter'
  | 'validator'
  | 'encoder'
  | 'decoder'
  | 'parser'
  | 'editor'
  | 'analyzer'
  | 'custom';

export interface ToolFieldConfig {
  name: string;
  type: LogicSchemaField['type'] | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
}

export interface ToolButtonConfig {
  id: string;
  label: string;
  role?: 'submit' | 'reset' | 'copy' | 'download' | 'share';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface ToolSeoConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export interface ToolFaqItem {
  question: string;
  answer: string;
}

/** Single source of truth for defining a tool */
export interface ToolConfiguration {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  subcategory?: string;
  version?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  visibility?: ToolVisibility;
  featured?: boolean;
  popular?: boolean;
  trending?: boolean;
  isNew?: boolean;
  tags?: string[];
  keywords?: string[];
  template?: ToolTemplateKind;
  kind?: ToolKind;
  inputFields?: ToolFieldConfig[];
  outputType?: 'text' | 'json' | 'html' | 'stats' | 'table';
  buttons?: ToolButtonConfig[];
  icon?: string;
  theme?: string;
  seo?: ToolSeoConfig;
  breadcrumbs?: { name: string; path: string }[];
  faqs?: ToolFaqItem[];
  relatedToolIds?: string[];
  relatedCategoryIds?: string[];
  adsPlaceholder?: boolean;
  analyticsEvents?: string[];
  permissions?: string[];
  /** Optional pure logic reference id (logic module) */
  logicModuleId?: string;
}

export interface ConfigurationValidationResult {
  valid: boolean;
  errors: string[];
}
