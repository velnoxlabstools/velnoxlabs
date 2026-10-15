import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config';
import { routing } from '@/i18n/routing';
import JsonFormatterClient from './JsonFormatterClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('Tools.json-formatter');

  const title = t('title');
  const description = t('subtitle');

  const pagePath =
    locale === routing.defaultLocale ? '/tools/json-formatter' : `/${locale}/tools/json-formatter`;

  const canonicalUrl = new URL(pagePath, siteConfig.url).toString();

  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((supportedLocale) => {
      const localizedPath =
        supportedLocale === routing.defaultLocale
          ? '/tools/json-formatter'
          : `/${supportedLocale}/tools/json-formatter`;

      return [supportedLocale, new URL(localizedPath, siteConfig.url).toString()];
    })
  );

  languages['x-default'] = languages[routing.defaultLocale];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function JsonFormatterRoute() {
  return <JsonFormatterClient />;
}
