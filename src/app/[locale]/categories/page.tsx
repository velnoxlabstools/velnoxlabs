import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

export default async function CategoriesPage() {
  const t = await getTranslations('Categories');
  const publishedTools = tools.filter((t) => t.status === 'published');

  // Group tools by category
  const grouped = publishedTools.reduce((acc, tool) => {
    if (!acc[tool.categoryId]) acc[tool.categoryId] = [];
    acc[tool.categoryId].push(tool);
    return acc;
  }, {} as Record<string, typeof publishedTools>);

  // Category emoji map
  const categoryEmojis: Record<string, string> = {
    'cat-dev': '🛠️',
    'cat-security': '🔒',
    'cat-text': '📝',
    'cat-converters': '🔄',
    'cat-image': '🖼️',
    'cat-utility': '🧰',
    'cat-finance': '💰',
    'cat-education': '🎓',
    'cat-business': '💼',
    'cat-health': '❤️',
    'cat-shopping': '🛒',
  };

  const getCategoryName = (catId: string) => {
    const key = catId.replace('cat-', '');
    try {
      return t(`categories.${key}.name` as any);
    } catch {
      return catId;
    }
  };

  const getCategoryDesc = (catId: string) => {
    const key = catId.replace('cat-', '');
    try {
      return t(`categories.${key}.description` as any);
    } catch {
      return '';
    }
  };

  // Sort categories alphabetically by translated name
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    return getCategoryName(a).localeCompare(getCategoryName(b));
  });

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            {t('badge')}
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {t('title')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            {t('subtitle', { count: publishedTools.length, categoryCount: sortedCategories.length })}
          </p>
        </div>

        {/* CATEGORY SECTIONS */}
        {sortedCategories.map((catId) => {
          const catName = getCategoryName(catId);
          const catDesc = getCategoryDesc(catId);
          const catEmoji = categoryEmojis[catId] || '📦';
          const catTools = grouped[catId];

          return (
            <div key={catId} style={{ marginBottom: 'var(--space-16)' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  {catEmoji} {catName} <span style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 600 }}>({catTools.length})</span>
                </h2>
                {catDesc && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {catDesc}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {catTools.map((tool) => (
                  <div key={tool.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                        {tool.name}
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>
                        {tool.description}
                      </p>
                    </div>
                    <Link href={`/tools/${tool.slug}`} style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                      {t('openTool')}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </GlobalContainer>
  );
}