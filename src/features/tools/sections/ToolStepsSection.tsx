'use client';

import { useTranslations } from 'next-intl';

interface ToolStepsSectionProps {
  steps?: { title: string; body: string }[];
}

export function ToolStepsSection({ steps }: ToolStepsSectionProps) {
  const t = useTranslations('ToolSeoDefaults');

  const defaultSteps = [
    { title: t('step1Title'), body: t('step1Body') },
    { title: t('step2Title'), body: t('step2Body') },
    { title: t('step3Title'), body: t('step3Body') },
  ];

  const currentSteps = steps ?? defaultSteps;

  return (
    <section aria-labelledby="tool-steps-heading">
      <h2
        id="tool-steps-heading"
        style={{
          margin: '0 0 var(--space-4)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
        }}
      >
        {t('howToUse')}
      </h2>
      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {currentSteps.map((s, i) => (
          <li key={s.title} style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {i + 1}
            </span>
            <div>
              <div
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {s.title}
              </div>
              <p
                style={{
                  margin: 'var(--space-1) 0 0',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
