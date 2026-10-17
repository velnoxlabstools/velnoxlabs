import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('PricingPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PricingPage() {
  const t = await getTranslations('PricingPage');

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-main)]">{t('title')}</h1>

        <p className="text-lg text-[var(--text-muted)] leading-relaxed">{t('subtitle')}</p>

        <div className="mt-12 p-12 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-sm">
          <p className="text-2xl font-semibold text-cyan-500 mb-2">{t('freeForever')}</p>
          <p className="text-[var(--text-muted)]">{t('freeForeverText')}</p>
        </div>

        <div className="mt-8 text-sm text-[var(--text-muted)]">
          <p>{t('belief')}</p>
        </div>
      </div>
    </div>
  );
}
