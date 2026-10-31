import { Link } from '@/i18n/navigation';
import type { Tool } from '@/types/tools';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const tTools = useTranslations('Tools');
  const tToolUI = useTranslations('ToolUI');
  const href = `/tools/${tool.slug}`;

  let name = tool.name;
  let description = tool.description;

  try {
    if (tTools.has(`${tool.slug}.name` as any)) {
      name = tTools(`${tool.slug}.name` as any);
    } else if (tTools.has(`${tool.slug}.title` as any)) {
      name = tTools(`${tool.slug}.title` as any);
    } else {
      const camelSlug = tool.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (tToolUI.has(`${camelSlug}.title` as any)) {
        name = tToolUI(`${camelSlug}.title` as any);
      }
    }
  } catch {
    // fallback to tool.name
  }

  try {
    if (tTools.has(`${tool.slug}.description` as any)) {
      description = tTools(`${tool.slug}.description` as any);
    } else if (tTools.has(`${tool.slug}.subtitle` as any)) {
      description = tTools(`${tool.slug}.subtitle` as any);
    } else {
      const camelSlug = tool.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (tToolUI.has(`${camelSlug}.subtitle` as any)) {
        description = tToolUI(`${camelSlug}.subtitle` as any);
      }
    }
  } catch {
    // fallback to tool.description
  }

  return (
    <Link
      href={href}
      className="ui-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        minHeight: '9rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text-main)',
            lineHeight: 1.35,
          }}
        >
          {name}
        </h3>
        {tool.featured ? <Badge variant="brand">Featured</Badge> : null}
        {!tool.featured && tool.isNew ? <Badge variant="success">New</Badge> : null}
      </div>
      <p
        style={{
          margin: 0,
          flex: 1,
          fontSize: 'var(--font-size-sm)',
          lineHeight: 1.55,
          color: 'var(--text-muted)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </p>
      <span
        style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 500,
          color: 'var(--color-brand-600)',
          marginTop: 'auto',
        }}
      >
        Open tool →
      </span>
    </Link>
  );
}
