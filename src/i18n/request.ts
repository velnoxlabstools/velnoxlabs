import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    try {
      const headerList = await headers();
      const headerLocale = headerList.get('x-next-intl-locale');
      if (headerLocale && (routing.locales as readonly string[]).includes(headerLocale)) {
        locale = headerLocale;
      } else {
        locale = routing.defaultLocale;
      }
    } catch {
      locale = routing.defaultLocale;
    }
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
