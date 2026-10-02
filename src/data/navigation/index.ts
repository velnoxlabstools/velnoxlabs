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
          id: 'all-tools',
          title: 'Browse',
          items: [
            { id: 'all-tools', label: 'All Tools', href: '/tools', description: 'Browse all 51+ tools' },
            { id: 'all-categories', label: 'All Categories', href: '/categories', description: 'Browse tools by category' },
          ],
        },
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
      id: 'company',
      title: 'Company',
      links: [
        { id: 'f-about', label: 'About', href: '/about' },
        { id: 'f-contact', label: 'Contact', href: '/contact' },
      ],
    },
  ],
  legal: [
    { id: 'privacy', label: 'Privacy Policy', href: '/privacy-policy' },
    { id: 'terms', label: 'Terms of Service', href: '/terms-of-service' },
    { id: 'cookies', label: 'Cookie Policy', href: '/cookie-policy' },
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