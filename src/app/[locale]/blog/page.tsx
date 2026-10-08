import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('BlogPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function BlogPage() {
  const t = await getTranslations('BlogPage');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">{t('title')}</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="mt-12 p-12 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <p className="text-2xl font-semibold text-cyan-400 mb-2">{t('comingSoon')}</p>
          <p className="text-slate-400">
            {t('comingSoonText')}
          </p>
        </div>

      </div>
    </div>
  );
}