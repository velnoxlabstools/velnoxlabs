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

  const slug = propSlug || tool?.slug || '';
  const name = propName || tool?.name || slug;

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
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '32px',
        }}
      >
        {/* About Section */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '16px',
          }}
        >
          {t('about', { name })}
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
          {t('about', { name })}
        </p>

        {/* Key Features */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '12px',
            marginTop: '24px',
          }}
        >
          {t('keyFeatures')}
        </h3>
        <ul
          style={{
            color: '#94a3b8',
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
            color: '#ffffff',
            marginBottom: '12px',
            marginTop: '24px',
          }}
        >
          {t('howToUse')}
        </h3>
        <ul
          style={{
            color: '#94a3b8',
            lineHeight: 1.9,
            paddingLeft: '20px',
            marginBottom: '24px',
          }}
        >
          <li>
            <strong style={{ color: '#ffffff' }}>{t('step1Title')}:</strong> {t('step1Body')}
          </li>
          <li>
            <strong style={{ color: '#ffffff' }}>{t('step2Title')}:</strong> {t('step2Body')}
          </li>
          <li>
            <strong style={{ color: '#ffffff' }}>{t('step3Title')}:</strong> {t('step3Body')}
          </li>
        </ul>

        {/* FAQ Section */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
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
                color: '#60a5fa',
                marginBottom: '6px',
              }}
            >
              {faq.q}
            </h4>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      <FeedbackForm />
    </>
  );
}
