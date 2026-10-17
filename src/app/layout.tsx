import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/theme';
import { LayoutProvider } from '@/providers';
import { SearchProvider } from '@/features/search';
import { SecurityProvider } from '@/security';
import { PerformanceProvider } from '@/performance';
import { PreferenceProvider } from '@/preferences';
import { siteConfig } from '@/config';
import '@/styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('HomePage');
  const title = `${siteConfig.name} | ${t('heroTitle')}`;
  const description = t('heroSubtitle');

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: [...siteConfig.keywords],
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||localStorage.getItem('velnox-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-200">
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <ThemeProvider>
            <PreferenceProvider>
              <SecurityProvider>
                <PerformanceProvider>
                  <LayoutProvider>
                    <SearchProvider>
                      <div
                        key={locale}
                        className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-main)]"
                      >
                        <Header />
                        <main className="flex-1 bg-[var(--bg-page)] text-[var(--text-main)]">
                          {children}
                        </main>
                        <Footer />
                      </div>
                    </SearchProvider>
                  </LayoutProvider>
                </PerformanceProvider>
              </SecurityProvider>
            </PreferenceProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
