import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

export default async function ToolsPage() {
  const t = await getTranslations('ToolsPage');
  const tTools = await getTranslations('Tools');
  const tToolUI = await getTranslations('ToolUI');
  const publishedTools = tools.filter((tool) => tool.status === 'published');

  // Helper: get translated tool name
  const getToolName = (slug: string, fallback: string) => {
    try {
      if (tTools.has(`${slug}.name` as any)) {
        return tTools(`${slug}.name` as any);
      }
      if (tTools.has(`${slug}.title` as any)) {
        return tTools(`${slug}.title` as any);
      }
      const camelSlug = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (tToolUI.has(`${camelSlug}.title` as any)) {
        return tToolUI(`${camelSlug}.title` as any);
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  // Helper: get translated tool description
  const getToolDesc = (slug: string, fallback: string) => {
    try {
      if (tTools.has(`${slug}.description` as any)) {
        return tTools(`${slug}.description` as any);
      }
      if (tTools.has(`${slug}.subtitle` as any)) {
        return tTools(`${slug}.subtitle` as any);
      }
      const camelSlug = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (tToolUI.has(`${camelSlug}.subtitle` as any)) {
        return tToolUI(`${camelSlug}.subtitle` as any);
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  // A to Z sorted (using translated names)
  const sortedTools = [...publishedTools].sort((a, b) =>
    getToolName(a.slug, a.name).localeCompare(getToolName(b.slug, b.name))
  );

  const getCategoryName = (catId: string) => {
    let key = catId.replace('cat-', '');
    if (key === 'media') key = 'image';
    try {
      if (t.has(`categories.${key}` as any)) {
        return t(`categories.${key}` as any);
      }
      const rawKey = catId.replace('cat-', '');
      if (t.has(`categories.${rawKey}` as any)) {
        return t(`categories.${rawKey}` as any);
      }
      return key.charAt(0).toUpperCase() + key.slice(1);
    } catch {
      return catId;
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO */}
        {/* HERO */}
        <div className="text-center mb-16">
          <span className="inline-block bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-500/20 mb-4">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-main)] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            {t('subtitle', { count: publishedTools.length })}
          </p>
        </div>

        {/* TOOLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTools.map((tool) => (
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
