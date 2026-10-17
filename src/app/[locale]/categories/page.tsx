import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

export default async function CategoriesPage() {
  const t = await getTranslations('Categories');
  const tTools = await getTranslations('Tools');
  const publishedTools = tools.filter((t) => t.status === 'published');

  // Group tools by category
  const grouped = publishedTools.reduce(
    (acc, tool) => {
      if (!acc[tool.categoryId]) acc[tool.categoryId] = [];
      acc[tool.categoryId].push(tool);
      return acc;
    },
    {} as Record<string, typeof publishedTools>
  );

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return t(`categories.${key}.name` as any);
    } catch {
      return catId;
    }
  };

  const getCategoryDesc = (catId: string) => {
    const key = catId.replace('cat-', '');
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return t(`categories.${key}.description` as any);
    } catch {
      return '';
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

  // Sort categories alphabetically by translated name
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    return getCategoryName(a).localeCompare(getCategoryName(b));
  });

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO */}
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-500/20 mb-4">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-main)] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            {t('subtitle', {
              count: publishedTools.length,
              categoryCount: sortedCategories.length,
            })}
          </p>
        </div>

        {/* CATEGORY SECTIONS */}
        {sortedCategories.map((catId) => {
          const catName = getCategoryName(catId);
          const catDesc = getCategoryDesc(catId);
          const catEmoji = categoryEmojis[catId] || '📦';
          const catTools = grouped[catId];

          return (
            <div key={catId} className="mb-16">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
                  <span>{catEmoji}</span>
                  <span>{catName}</span>
                  <span className="text-blue-500 text-base font-semibold">({catTools.length})</span>
                </h2>
                {catDesc && <p className="text-sm text-[var(--text-muted)]">{catDesc}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col justify-between shadow-sm hover:border-cyan-500/50 transition-all"
                  >
                    <div>
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
          );
        })}
      </div>
    </GlobalContainer>
  );
}
