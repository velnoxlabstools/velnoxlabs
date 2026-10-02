import Link from 'next/link';
import { GlobalContainer } from '@/components/layout';
import { tools } from '@/data/tools';

const categoryInfo: Record<string, { name: string; description: string; emoji: string }> = {
  'cat-dev': { name: 'Developer Tools', description: 'Formatters, converters, and utilities for daily coding.', emoji: '🛠️' },
  'cat-security': { name: 'Security & Privacy', description: 'Hashing, encoding, and privacy-first tools.', emoji: '🔒' },
  'cat-text': { name: 'Text & Content', description: 'Text manipulation, counting, and generation tools.', emoji: '📝' },
  'cat-converters': { name: 'Converters', description: 'Format and unit conversion utilities.', emoji: '🔄' },
  'cat-image': { name: 'Media', description: 'Image and media processing tools.', emoji: '🖼️' },
  'cat-utility': { name: 'Utility', description: 'Everyday calculators and helpers.', emoji: '🧰' },
  'cat-finance': { name: 'Finance', description: 'Loans, interest, and salary calculators.', emoji: '💰' },
  'cat-education': { name: 'Education', description: 'Grade and GPA calculators.', emoji: '🎓' },
  'cat-business': { name: 'Business & Finance', description: 'Invoicing and business utilities.', emoji: '💼' },
  'cat-health': { name: 'Health', description: 'Health and fitness calculators.', emoji: '❤️' },
  'cat-shopping': { name: 'Shopping', description: 'Discount and price calculators.', emoji: '🛒' },
};

export default function CategoriesPage() {
  const publishedTools = tools.filter((t) => t.status === 'published');

  // Group tools by category
  const grouped = publishedTools.reduce((acc, tool) => {
    if (!acc[tool.categoryId]) acc[tool.categoryId] = [];
    acc[tool.categoryId].push(tool);
    return acc;
  }, {} as Record<string, typeof publishedTools>);

  // Sort categories alphabetically by name
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const nameA = categoryInfo[a]?.name || a;
    const nameB = categoryInfo[b]?.name || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            BROWSE BY CATEGORY
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            All Categories
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Explore {publishedTools.length} tools organized across {sortedCategories.length} categories.
          </p>
        </div>

        {/* CATEGORY SECTIONS */}
        {sortedCategories.map((catId) => {
          const cat = categoryInfo[catId] || { name: catId, description: '', emoji: '📦' };
          const catTools = grouped[catId];

          return (
            <div key={catId} style={{ marginBottom: 'var(--space-16)' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  {cat.emoji} {cat.name} <span style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: 600 }}>({catTools.length})</span>
                </h2>
                {cat.description && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {cat.description}
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
                      Open tool →
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