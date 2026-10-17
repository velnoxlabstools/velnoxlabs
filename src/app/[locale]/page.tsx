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
              color: '#ffffff',
              marginTop: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t('heroTitle')}
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsTools')}
            </div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>
              {publishedTools.length}
            </div>
          </div>
          <div>
            <div
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsCategories')}
            </div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>11</div>
          </div>
          <div>
            <div
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '4px',
              }}
            >
              {t('statsPrivacy')}
            </div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>100%</div>
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
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                {t('popularTitle')}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                {t('popularSubtitle')}
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {popularTools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#60a5fa',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {getCategoryName(tool.categoryId)}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: '8px',
                      }}
                    >
                      {getToolName(tool.slug, tool.name)}
                    </h3>
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                      }}
                    >
                      {getToolDesc(tool.slug, tool.description)}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    style={{
                      color: '#34d399',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
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
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                {t('latestTitle')}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                {t('latestSubtitle')}
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {latestTools.map((tool) => (
                <div
                  key={tool.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#60a5fa',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {getCategoryName(tool.categoryId)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#34d399',
                          backgroundColor: 'rgba(52, 211, 153, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        NEW
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: '8px',
                      }}
                    >
                      {getToolName(tool.slug, tool.name)}
                    </h3>
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        marginBottom: '20px',
                      }}
                    >
                      {getToolDesc(tool.slug, tool.description)}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${tool.slug}`}
                    style={{
                      color: '#34d399',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {t('openTool')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL TOOLS SECTION */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}
          >
            {t('allToolsTitle')} ({publishedTools.length})
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {t('allToolsSubtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {publishedTools.map((tool) => (
            <div
              key={tool.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#60a5fa',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {getCategoryName(tool.categoryId)}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '8px',
                  }}
                >
                  {getToolName(tool.slug, tool.name)}
                </h3>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                  }}
                >
                  {getToolDesc(tool.slug, tool.description)}
                </p>
              </div>
              <Link
                href={`/tools/${tool.slug}`}
                style={{
                  color: '#34d399',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
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
