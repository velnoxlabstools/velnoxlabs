export type ToolStatus = 'published' | 'draft' | 'archived';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  tags: string[];
  status: ToolStatus;
  featured: boolean;
  trending: boolean;
  popular: boolean;
  isNew: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  featured: boolean;
  popular: boolean;
  toolCount: number;
  order: number;
  icon?: string;
}

export interface ToolCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  toolIds: string[];
}

export interface HomepageStats {
  toolCount: number;
  categoryCount: number;
  monthlyUsersLabel: string;
}

export interface HomepageFaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

export interface HomepageCta {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export type HomepageSectionId =
  | 'hero'
  | 'featuredTools'
  | 'popularCategories'
  | 'trendingTools'
  | 'newTools'
  | 'recentlyUpdated'
  | 'collections'
  | 'whyChoose'
  | 'features'
  | 'benefits'
  | 'howItWorks'
  | 'categoriesPreview'
  | 'newsletter'
  | 'faq'
  | 'ctaBanner';

export interface HomepageSectionConfig {
  id: HomepageSectionId;
  enabled: boolean;
  order: number;
}

export interface HomepageConfig {
  sections: HomepageSectionConfig[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  cta: HomepageCta;
  limits: {
    featuredTools: number;
    trendingTools: number;
    newTools: number;
    recentlyUpdated: number;
    popularCategories: number;
    collections: number;
    faq: number;
  };
}

export interface HomepageData {
  stats: HomepageStats;
  featuredTools: Tool[];
  trendingTools: Tool[];
  popularTools: Tool[];
  newTools: Tool[];
  recentlyUpdatedTools: Tool[];
  recommendedTools: Tool[];
  popularCategories: Category[];
  featuredCategories: Category[];
  collections: ToolCollection[];
  faqs: HomepageFaqItem[];
  config: HomepageConfig;
}
