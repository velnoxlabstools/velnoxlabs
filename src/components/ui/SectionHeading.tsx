'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  toolSlug?: string;
}

export function SectionHeading({
  title,
  subtitle,
  description,
  align = 'center',
  as: Tag = 'h2',
  id,
  toolSlug,
}: SectionHeadingProps) {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tTools: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTools = useTranslations('Tools');
  } catch {
    // Outside next-intl provider
  }

  let displayTitle = title;
  let displaySubtitle = subtitle || description;

  if (tTools) {
    let slug = toolSlug;
    if (!slug && pathname) {
      const match = pathname.match(/\/tools\/([a-zA-Z0-9_\-]+)/);
      if (match && match[1]) {
        slug = match[1];
      }
    }

    if (slug) {
      try {
        if (tTools.has(`${slug}.title`)) {
          displayTitle = tTools(`${slug}.title`);
        } else if (tTools.has(`${slug}.name`)) {
          displayTitle = tTools(`${slug}.name`);
        }
        if (tTools.has(`${slug}.subtitle`)) {
          displaySubtitle = tTools(`${slug}.subtitle`);
        } else if (tTools.has(`${slug}.description`)) {
          displaySubtitle = tTools(`${slug}.description`);
        }
      } catch {
        // fallback to original props
      }
    }
  }

  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 'var(--space-8)',
        maxWidth: align === 'center' ? '40rem' : undefined,
        marginLeft: align === 'center' ? 'auto' : undefined,
        marginRight: align === 'center' ? 'auto' : undefined,
      }}
    >
      <Tag
        id={id}
        style={{
          margin: 0,
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--text-main)',
        }}
      >
        {displayTitle}
      </Tag>
      {displaySubtitle && (
        <p
          style={{
            marginTop: 'var(--space-3)',
            marginBottom: 0,
            fontSize: 'var(--font-size-lg)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--text-muted)',
          }}
        >
          {displaySubtitle}
        </p>
      )}
    </div>
  );
}
