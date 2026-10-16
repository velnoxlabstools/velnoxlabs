import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'pt', 'de', 'fr', 'it', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});
