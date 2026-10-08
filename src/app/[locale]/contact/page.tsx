import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ContactPage');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('ContactPage');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        
        <h1 className="text-4xl font-bold tracking-tight text-white">{t('title')}</h1>
        
        <p className="text-lg text-slate-400 leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="mt-12 p-8 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">{t('emailTitle')}</h2>
          <a 
            href="mailto:velnoxlabss@gmail.com" 
            className="text-cyan-400 hover:text-cyan-300 font-medium text-lg break-all"
          >
            velnoxlabss@gmail.com
          </a>
          <p className="mt-4 text-sm text-slate-500">
            {t('replyTime')}
          </p>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>{t('suggestionNote')}</p>
        </div>

      </div>
    </div>
  );
}