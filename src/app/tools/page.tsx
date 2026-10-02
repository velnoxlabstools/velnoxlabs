import Link from 'next/link';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

const categoryNames: Record<string, string> = {
  'cat-dev': 'Developer Tools',
  'cat-security': 'Security & Privacy',
  'cat-text': 'Text & Content',
  'cat-converters': 'Converters',
  'cat-image': 'Media',
  'cat-utility': 'Utility',
  'cat-finance': 'Finance',
  'cat-education': 'Education',
  'cat-business': 'Business & Finance',
  'cat-health': 'Health',
  'cat-shopping': 'Shopping',
};

export default function ToolsPage() {
  const publishedTools = tools.filter((t) => t.status === 'published');

  // A to Z sorted
  const sortedTools = [...publishedTools].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            ALL TOOLS
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            Browse All Tools
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Explore {publishedTools.length} free, browser-based tools — sorted A to Z.
          </p>
        </div>

        {/* TOOLS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {sortedTools.map((tool) => (
            <div key={tool.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    {categoryNames[tool.categoryId] || 'Tool'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                  {tool.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  {tool.description}
                </p>
              </div>
              <Link href={`/tools/${tool.slug}`} style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                Open tool →
              </Link>
            </div>
          ))}
        </div>

      </div>
    </GlobalContainer>
  );
}