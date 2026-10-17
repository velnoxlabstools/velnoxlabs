import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

export default async function Home() {
  const t = await getTranslations('HomePage');
  const tTools = await getTranslations('Tools');
  const tCategories = await getTranslations('Categories');
  const publishedTools = tools.filter((tool) => tool.status === 'published');

  const popularTools = publishedTools.filter((tool) => tool.popular).slice(0, 6);

  const latestTools = [...publishedTools]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Helper: get translated category name
  const getCategoryName = (catId: string) => {
    const key = catId.replace('cat-', '');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tCategories(`categories.${key}.name` as any);
    } catch {
      return catId;
    }
  };

  // Helper: get translated tool name
  const getToolName = (slug: string, fallback: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tTools(`${slug}.name` as any);
    } catch {
      return fallback;
    }
  };

  // Helper: get translated tool description
  const getToolDesc = (slug: string, fallback: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tTools(`${slug}.description` as any);
    } catch {
      return fallback;
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            {t('badge')}
          </span>
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t('heroTitle')}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            {t('heroSubtitle')}
          </p>
        </div>

        {/* STATS SECTION */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: 'var(--space-16)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsTools')}
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700 }}>
              {publishedTools.length}
            </div>
          </div>
          <div>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsCategories')}
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700 }}>11</div>
          </div>
          <div>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsPrivacy')}
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 700 }}>100%</div>
          </div>
        </div>

        {/* POPULAR TOOLS SECTION */}
        {popularTools.length > 0 && (
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '8px',
                }}
              >
                {t('popularTitle')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {t('popularSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between shadow-sm hover:border-cyan-500/50 transition-all"
                >
                  <div>
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md">
                        {getCategoryName(tool.categoryId)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                      {getToolName(tool.slug, tool.name)}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
                      {getToolDesc(tool.slug, tool.description)}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 mt-auto transition-colors"
                  >
                    {t('openTool')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LATEST TOOLS SECTION */}
        {latestTools.length > 0 && (
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h2
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '8px',
                }}
              >
                {t('latestTitle')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {t('latestSubtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between shadow-sm hover:border-cyan-500/50 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md">
                        {getCategoryName(tool.categoryId)}
                      </span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        NEW
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                      {getToolName(tool.slug, tool.name)}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
                      {getToolDesc(tool.slug, tool.description)}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 mt-auto transition-colors"
                  >
                    {t('openTool')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL TOOLS SECTION */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">
            {t('allToolsTitle')} ({publishedTools.length})
          </h2>
          <p className="text-base text-[var(--text-muted)]">{t('allToolsSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedTools.map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between shadow-sm hover:border-cyan-500/50 transition-all"
            >
              <div>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    {getCategoryName(tool.categoryId)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                  {getToolName(tool.slug, tool.name)}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
                  {getToolDesc(tool.slug, tool.description)}
                </p>
              </div>
              <Link
                href={`/tools/${tool.slug}`}
                className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 mt-auto transition-colors"
              >
                {t('openTool')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </GlobalContainer>
  );
}
