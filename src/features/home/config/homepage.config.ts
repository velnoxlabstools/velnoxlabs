import type { HomepageConfig } from '@/types/tools';

export const homepageConfig: HomepageConfig = {
  sections: [
    { id: 'hero', enabled: true, order: 1 },
    { id: 'featuredTools', enabled: true, order: 2 },
    { id: 'popularCategories', enabled: true, order: 3 },
    { id: 'trendingTools', enabled: true, order: 4 },
    { id: 'newTools', enabled: true, order: 5 },
    { id: 'recentlyUpdated', enabled: true, order: 6 },
    { id: 'collections', enabled: true, order: 7 },
    { id: 'whyChoose', enabled: true, order: 8 },
    { id: 'features', enabled: true, order: 9 },
    { id: 'benefits', enabled: true, order: 10 },
    { id: 'howItWorks', enabled: true, order: 11 },
    { id: 'categoriesPreview', enabled: true, order: 12 },
    { id: 'newsletter', enabled: true, order: 13 },
    { id: 'faq', enabled: true, order: 14 },
    { id: 'ctaBanner', enabled: true, order: 15 },
  ],
  hero: {
    eyebrow: 'Free online tools',
    title: 'Powerful tools for everyday work',
    description:
      'VelnoxLabs gives you fast, private, browser-based utilities. No sign-up required. Use what you need, when you need it.',
    primaryCta: { label: 'Explore tools', href: '/tools' },
    secondaryCta: { label: 'Browse categories', href: '/categories' },
  },
  cta: {
    title: 'Ready to get started?',
    description: 'Open any tool and start working in seconds.',
    primaryLabel: 'Browse all tools',
    primaryHref: '/tools',
  },
  limits: {
    featuredTools: 6,
    trendingTools: 6,
    newTools: 6,
    recentlyUpdated: 6,
    popularCategories: 8,
    collections: 4,
    faq: 5,
  },
};

export const homepageFaqs = [
  {
    id: 'faq-free',
    question: 'Are the tools free?',
    answer: 'Yes. Core tools are free to use in your browser.',
    order: 1,
    published: true,
  },
  {
    id: 'faq-store',
    question: 'Do you store my files?',
    answer: 'Most tools process data locally. We only store what you explicitly save.',
    order: 2,
    published: true,
  },
  {
    id: 'faq-suggest',
    question: 'Can I suggest a tool?',
    answer: 'Yes — use the contact page to send ideas.',
    order: 3,
    published: true,
  },
];
