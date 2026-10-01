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

export default function Home() {
  const publishedTools = tools.filter((t) => t.status === 'published');

  const popularTools = publishedTools
    .filter((t) => t.popular)
    .slice(0, 6);

  const latestTools = [...publishedTools]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>

        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            FREE ONLINE TOOLS
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            Powerful tools for everyday work
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            VelnoxLabs gives you fast, private, browser-based utilities. No sign-up required.
          </p>
        </div>

        {/* STATS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: 'var(--space-16)', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>TOOLS</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>{publishedTools.length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>CATEGORIES</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>{Object.keys(categoryNames).length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>PRIVACY</div>
            <div style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 700 }}>100%</div>
          </div>
        </div>

        {/* POPULAR TOOLS SECTION */}
        {popularTools.length > 0 && (
          <div style={{ marginBottom: 'var(--space-16)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                🔥 Popular Tools
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Most-used tools by our community.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {popularTools.map((tool) => (
                <div key={tool.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        {categoryNames[tool.categoryId] || 'Tool'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{tool.name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>{tool.description}</p>
                  </div>
                  <Link href={`/tools/${tool.slug}`} style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Open tool →
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
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                🆕 Latest Tools
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Freshly added tools — try them out!
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {latestTools.map((tool) => (
                <div key={tool.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        {categoryNames[tool.categoryId] || 'Tool'}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>NEW</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{tool.name}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>{tool.description}</p>
                  </div>
                  <Link href={`/tools/${tool.slug}`} style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Open tool →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALL TOOLS SECTION */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            All Tools ({publishedTools.length})
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Explore all fully implemented developer tools ready for immediate use.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {publishedTools.map((tool) => (
            <div key={tool.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    {categoryNames[tool.categoryId] || 'Tool'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{tool.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>{tool.description}</p>
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