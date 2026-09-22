export type ContentBlockType =
  | 'introduction'
  | 'shortDescription'
  | 'longDescription'
  | 'keyFeatures'
  | 'benefits'
  | 'useCases'
  | 'howToUse'
  | 'stepByStep'
  | 'tips'
  | 'warnings'
  | 'limitations'
  | 'faqs'
  | 'relatedTools'
  | 'relatedCategories'
  | 'versionNotes'
  | 'changelog'
  | 'seoContent'
  | 'disclaimer';

export interface ContentBlock {
  type: ContentBlockType;
  title?: string;
  body?: string;
  items?: string[];
  steps?: { title: string; body: string }[];
  faqs?: { question: string; answer: string }[];
  links?: { label: string; href: string }[];
  order?: number;
  enabled?: boolean;
}

export interface ToolContentDocument {
  toolId: string;
  slug: string;
  locale?: string;
  blocks: ContentBlock[];
  markdown?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface GuideDocument {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  steps: { title: string; body: string }[];
  relatedToolIds?: string[];
}
