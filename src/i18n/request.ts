import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }

  // Load main translations (pages, header, footer, etc.)
  const mainMessages = (await import(`../../messages/${locale}.json`)).default;

  // Load tool-specific SEO translations (ToolCommon, ToolSeoDefaults, ToolInfo, ToolFaq)
  let toolMessages = {};
  try {
    toolMessages = (await import(`../../messages/tools/${locale}.json`)).default;
  } catch {
    console.warn(`No tools translations found for locale: ${locale}`);
  }

  return {
    locale,
    messages: {
      ...mainMessages,
      ...toolMessages,
    },
  };
});
