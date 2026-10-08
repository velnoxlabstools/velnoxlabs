import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/theme';
import { LayoutProvider } from '@/providers';
import { SearchProvider } from '@/features/search';
import { SecurityProvider } from '@/security';
import { PerformanceProvider } from '@/performance';
import { PreferenceProvider } from '@/preferences';
import '@/styles/globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body className="bg-white text-slate-900 dark:bg-[#030712] dark:text-slate-100 transition-colors">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <PreferenceProvider>
              <SecurityProvider>
                <PerformanceProvider>
                  <LayoutProvider>
                    <SearchProvider>
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
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