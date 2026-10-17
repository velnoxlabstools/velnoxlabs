'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FeedbackForm } from '@/components/ui';

export interface ToolSeoContentProps {
  toolSlug: string;
  toolName?: string;
  categorySlug?: string;
  categoryId?: string;
  version?: string;
  tool?: {
    slug?: string;
    name?: string;
    categoryId?: string;
    version?: { version: string } | string;
  };
}

export function ToolSeoContent({
  toolSlug: propSlug,
  toolName: propName,
  categorySlug: _propCatSlug,
  categoryId: _propCatId,
  version: _propVersion,
  tool,
}: ToolSeoContentProps) {
  const t = useTranslations('ToolSeoDefaults');
  const tFaq = useTranslations('ToolFaq');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tTools: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTools = useTranslations('Tools');
  } catch {
    // outside provider
  }

  const slug = propSlug || tool?.slug || '';
  let name = propName || tool?.name || slug;
  if (tTools && slug) {
    try {
      if (tTools.has(`${slug}.name`)) {
        name = tTools(`${slug}.name`);
      } else if (tTools.has(`${slug}.title`)) {
        name = tTools(`${slug}.title`);
      }
    } catch {
      // fallback to name
    }
  }

  const isUserAgent = slug === 'user-agent-parser';

  const faqs = isUserAgent
    ? [
        { q: tFaq('userAgentParser.q1'), a: tFaq('userAgentParser.a1') },
        { q: tFaq('userAgentParser.q2'), a: tFaq('userAgentParser.a2') },
        { q: tFaq('userAgentParser.q3'), a: tFaq('userAgentParser.a3') },
        { q: tFaq('userAgentParser.q4'), a: tFaq('userAgentParser.a4') },
      ]
    : [{ q: tFaq('generic.q1'), a: tFaq('generic.a1') }];

  return (
    <>
      {/* SEO Content Container */}
      <div
        style={{
          marginTop: '48px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '32px',
        }}
      >
        {/* About Section */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '16px',
          }}
        >
          {t('about', { name })}
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
          {t('about', { name })}
        </p>

        {/* Key Features */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '12px',
            marginTop: '24px',
          }}
        >
          {t('keyFeatures')}
        </h3>
        <ul
          style={{
            color: 'var(--text-muted)',
            lineHeight: 1.9,
            paddingLeft: '20px',
            marginBottom: '24px',
          }}
        >
          <li>{t('feature1')}</li>
          <li>{t('feature2')}</li>
          <li>{t('feature3')}</li>
        </ul>

        {/* How To Use Steps */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '12px',
            marginTop: '24px',
          }}
        >
          {t('howToUse')}
        </h3>
        <ul
          style={{
            color: 'var(--text-muted)',
            lineHeight: 1.9,
            paddingLeft: '20px',
            marginBottom: '24px',
          }}
        >
          <li>
            <strong style={{ color: 'var(--text-main)' }}>{t('step1Title')}:</strong>{' '}
            {t('step1Body')}
          </li>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>{t('step2Title')}:</strong>{' '}
            {t('step2Body')}
          </li>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>{t('step3Title')}:</strong>{' '}
            {t('step3Body')}
          </li>
        </ul>

        {/* FAQ Section */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '16px',
            marginTop: '24px',
          }}
        >
          {t('faqTitle')}
        </h3>

        {faqs.map((faq, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#2563eb',
                marginBottom: '6px',
              }}
            >
              {faq.q}
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      <FeedbackForm />
    </>
  );
}
