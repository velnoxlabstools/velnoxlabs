import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'pt', 'de', 'fr', 'it'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});