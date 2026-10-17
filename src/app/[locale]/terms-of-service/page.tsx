import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('TermsPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function TermsOfService() {
  const t = await getTranslations('TermsPage');

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-main)]">
            {t('title')}
          </h1>
          <p className="mt-4 text-sm text-[var(--text-muted)]">{t('lastUpdated')}</p>
        </div>

        <div className="space-y-6 text-[var(--text-muted)] leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-3">
              {t('section1Title')}
            </h2>
            <p>{t('section1Text')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-3">
              {t('section2Title')}
            </h2>
            <p>{t('section2Text')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-3">
              {t('section3Title')}
            </h2>
            <p>{t('section3Text')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-3">
              {t('section4Title')}
            </h2>
            <p>{t('section4Text')}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-3">
              {t('section5Title')}
            </h2>
            <p>
              {t('section5Text')}{' '}
              <a href="mailto:velnoxlabss@gmail.com" className="text-cyan-500 hover:text-cyan-400">
                velnoxlabss@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
