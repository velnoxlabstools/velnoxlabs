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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-main)]">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            {t('heroText')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 mt-12">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">
              {t('features.privateTitle')}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t('features.privateDesc')}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">
              {t('features.frictionTitle')}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t('features.frictionDesc')}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">
              {t('features.devTitle')}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t('features.devDesc')}</p>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">
              {t('features.freeTitle')}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t('features.freeDesc')}</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-4">{t('storyTitle')}</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">{t('storyText')}</p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-center">
          <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-4">
            {t('contactTitle')}
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{t('contactText')}</p>
          <a
            href="mailto:velnoxlabss@gmail.com"
            className="text-cyan-500 hover:text-cyan-400 font-medium text-lg"
          >
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
