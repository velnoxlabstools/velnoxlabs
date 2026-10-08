import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AboutPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('AboutPage');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">{t('title')}</h1>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {t('heroText')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mt-12">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">{t('features.privateTitle')}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('features.privateDesc')}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">{t('features.frictionTitle')}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('features.frictionDesc')}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">{t('features.devTitle')}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('features.devDesc')}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white">{t('features.freeTitle')}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {t('features.freeDesc')}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('storyTitle')}</h2>
          <p className="text-slate-400 leading-relaxed">
            {t('storyText')}
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">{t('contactTitle')}</h2>
          <p className="text-slate-400 mb-4">
            {t('contactText')}
          </p>
          <a href="mailto:velnoxlabss@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-medium text-lg">
            velnoxlabss@gmail.com
          </a>
        </div>

        {/* CTA Button */}
        <div className="pt-8 text-center">
          <Link 
            href="/tools" 
            className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-sm"
          >
            {t('ctaButton')}
          </Link>
        </div>

      </div>
    </div>
  );
}