export interface SEOPageInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'tool' | 'category' | 'collection';
  image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: { name: string; path: string }[];
  faqs?: { question: string; answer: string }[];
  tool?: {
    name: string;
    description: string;
    category?: string;
    version?: string;
  };
  category?: {
    name: string;
    description: string;
    toolCount?: number;
  };
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: string;
    siteName: string;
    images?: { url: string }[];
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    images?: string[];
  };
}

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': Record<string, unknown>[];
}
