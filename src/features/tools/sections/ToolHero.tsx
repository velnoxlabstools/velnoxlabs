import Link from 'next/link';
import type { ToolConfig } from '@/types/tool-engine';
import type { Category } from '@/types/tools';
import { ToolBreadcrumb } from '../components/ToolBreadcrumb';
import { ToolStatusBadge } from '../components/ToolStatusBadge';

interface ToolHeroProps {
  tool: ToolConfig;
  category: Category | null;
}

export function ToolHero({ tool, category }: ToolHeroProps) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--muted)',
        paddingTop: 'var(--space-6)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-2xl)',
          margin: '0 auto',
          paddingLeft: 'var(--space-4)',
          paddingRight: 'var(--space-4)',
        }}
      >
        <ToolBreadcrumb tool={tool} category={category} />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <ToolStatusBadge tool={tool} />
          <h1
            style={{
              margin: 'var(--space-3) 0 0',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--foreground)',
            }}
          >
            {tool.name}
          </h1>
          <p
            style={{
              marginTop: 'var(--space-2)',
              marginBottom: 0,
              fontSize: 'var(--font-size-lg)',
              color: 'var(--muted-foreground)',
              maxWidth: '40rem',
              lineHeight: 'var(--line-height-relaxed)',
            }}
          >
            {tool.description}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              alignItems: 'center',
              marginTop: 'var(--space-4)',
            }}
          >
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {category.name}
              </Link>
            )}
            {tool.version && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>
                v{tool.version.version}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}