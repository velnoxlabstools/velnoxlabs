import type { Category } from '@/types/tools';
import { tools } from '@/data/tools';

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  featured: boolean;
  popular: boolean;
}

export const categoryDefinitions: CategoryDefinition[] = [
  {
    id: 'cat-dev',
    slug: 'dev',
    name: 'Developer Tools',
    description: 'Formatters, converters, and utilities for daily coding.',
    icon: 'Terminal',
    order: 1,
    featured: true,
    popular: true,
  },
  {
    id: 'cat-security',
    slug: 'security',
    name: 'Security & Crypto',
    description: 'Hashing, encoding, and privacy-first tools.',
    icon: 'Shield',
    order: 2,
    featured: true,
    popular: true,
  },
  {
    id: 'cat-text',
    slug: 'text',
    name: 'Text & Content',
    description: 'Text manipulation, counting, and generation tools.',
    icon: 'Type',
    order: 3,
    featured: false,
    popular: true,
  },
  {
    id: 'cat-converters',
    slug: 'converters',
    name: 'Converters',
    description: 'Format and unit conversion utilities.',
    icon: 'RefreshCw',
    order: 4,
    featured: true,
    popular: false,
  },
  {
    id: 'cat-utility',
    slug: 'utility',
    name: 'Utilities',
    description: 'Everyday calculators and helpers.',
    icon: 'Wrench',
    order: 5,
    featured: false,
    popular: true,
  },
  {
    id: 'cat-finance',
    slug: 'finance',
    name: 'Finance',
    description: 'Loans, interest, and salary calculators.',
    icon: 'DollarSign',
    order: 6,
    featured: true,
    popular: true,
  },
  {
    id: 'cat-image',
    slug: 'image',
    name: 'Image & Media',
    description: 'In-browser image optimization, format converting, and dimension resizing.',
    icon: 'Image',
    order: 7,
    featured: true,
    popular: true,
  },
  {
    id: 'cat-business',
    slug: 'business',
    name: 'Business',
    description: 'Invoicing and business utilities.',
    icon: 'Briefcase',
    order: 8,
    featured: true,
    popular: true,
  },
  {
    id: 'cat-health',
    slug: 'health',
    name: 'Health & Fitness',
    description: 'Health and fitness calculators.',
    icon: 'Heart',
    order: 9,
    featured: false,
    popular: false,
  },
  {
    id: 'cat-shopping',
    slug: 'shopping',
    name: 'Shopping',
    description: 'Discount and price calculators.',
    icon: 'ShoppingCart',
    order: 10,
    featured: false,
    popular: false,
  },
  {
    id: 'cat-education',
    slug: 'education',
    name: 'Education',
    description: 'Grade and GPA calculators.',
    icon: 'GraduationCap',
    order: 11,
    featured: false,
    popular: false,
  },
];

/**
 * Computes published tool count for a category ID dynamically from the tools array.
 */
export function getCategoryToolCount(categoryId: string): number {
  const normalized = categoryId.startsWith('cat-') ? categoryId : `cat-${categoryId}`;
  return tools.filter(
    (t) => (t.categoryId === categoryId || t.categoryId === normalized) && t.status === 'published'
  ).length;
}

export const categories: Category[] = categoryDefinitions.map((cat) => ({
  ...cat,
  get toolCount() {
    return getCategoryToolCount(cat.id);
  },
}));
