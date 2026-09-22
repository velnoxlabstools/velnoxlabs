import type { NavigationConfig } from '@/types/navigation';

/**
 * Central navigation config.
 * Add categories, tools, pages here — Header/Footer update automatically.
 */
export const navigationConfig: NavigationConfig = {
  primary: [
    {
      id: 'tools',
      label: 'Tools',
      type: 'mega',
      columns: [
        {
          id: 'popular',
          title: 'Popular',
          items: [
            { id: 'tool-1', label: 'Tool Placeholder', href: '/tools/placeholder', description: 'Coming soon' },
          ],
        },
        {
          id: 'categories',
          title: 'Categories',
          items: [
            { id: 'cat-all', label: 'All Categories', href: '/categories' },
          ],
        },
      ],
    },
    {
      id: 'categories',
      label: 'Categories',
      href: '/categories',
      items: [
        { id: 'cat-all', label: 'All Categories', href: '/categories' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      href: '/resources',
      items: [
        { id: 'blog', label: 'Blog', href: '/blog' },
        { id: 'docs', label: 'Documentation', href: '/docs' },
      ],
    },
    {
      id: 'about',
      label: 'About',
      href: '/about',
    },
  ],
  secondary: [
    { id: 'pricing', label: 'Pricing', href: '/pricing' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ],
  footer: [
    {
      id: 'product',
      title: 'Product',
      links: [
        { id: 'f-tools', label: 'Tools', href: '/tools' },
        { id: 'f-categories', label: 'Categories', href: '/categories' },
        { id: 'f-pricing', label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      links: [
        { id: 'f-blog', label: 'Blog', href: '/blog' },
        { id: 'f-docs', label: 'Documentation', href: '/docs' },
        { id: 'f-guides', label: 'Guides', href: '/guides' },
      ],
    },
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: 'f-about', label: 'About', href: '/about' },
        { id: 'f-contact', label: 'Contact', href: '/contact' },
      ],
    },
  ],
  legal: [
    { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
    { id: 'terms', label: 'Terms of Service', href: '/terms' },
    { id: 'cookies', label: 'Cookie Policy', href: '/cookies' },
  ],
  social: [
    { id: 'twitter', label: 'X (Twitter)', href: 'https://x.com', icon: 'twitter' },
    { id: 'github', label: 'GitHub', href: 'https://github.com', icon: 'github' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
  ],
  cta: {
    id: 'cta-get-started',
    label: 'Get Started',
    href: '/tools',
  },
};
