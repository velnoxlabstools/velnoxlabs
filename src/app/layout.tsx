import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/theme';
import { LayoutProvider } from '@/providers';
import { SearchProvider } from '@/features/search';
import { SecurityProvider } from '@/security';
import { PerformanceProvider } from '@/performance';
import { PreferenceProvider } from '@/preferences';
import { siteConfig } from '@/config';
import { organizationSchema } from '@/seo/schema/OrganizationSchema';
import { websiteSchema } from '@/seo/schema/WebsiteSchema';
import '@/styles/globals.css';

const origin = siteConfig.url.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: `${siteConfig.name} — Free Developer Tools`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: origin }],
  generator: 'Next.js',
  keywords: [...siteConfig.keywords],
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: origin },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: origin,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Free Developer Tools`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Free Developer Tools`,
    description: siteConfig.description,
    ...(siteConfig.twitterHandle
      ? { creator: siteConfig.twitterHandle, site: siteConfig.twitterHandle }
      : {}),
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema()],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <JsonLd />
      </head>
      <body className="bg-white text-slate-900 dark:bg-[#030712] dark:text-slate-100 transition-colors" >
        <ThemeProvider>
          <PreferenceProvider>
            <SecurityProvider>
              <PerformanceProvider>
                <LayoutProvider>
                  <SearchProvider><div className="min-h-screen flex flex-col"><Header /><main className="flex-1">{children}</main><Footer /></div></SearchProvider>
                </LayoutProvider>
              </PerformanceProvider>
            </SecurityProvider>
          </PreferenceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


