'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FeedbackForm } from '@/components/ui';
import { siteConfig } from '@/config';

const ALL_LOCALES = ['en', 'zh', 'es', 'pt', 'de', 'fr', 'it', 'ja', 'ru', 'ko'] as const;

export interface ToolSeoContentProps {
  toolSlug?: string;
  toolId?: string;
  toolName?: string;
  name?: string;
  description?: string;
  categorySlug?: string;
  categoryId?: string;
  version?: string;
  tool?: {
    slug?: string;
    name?: string;
    categoryId?: string;
    version?: { version: string } | string;
  };
  customAbout?: string;
  customFeatures?: string[];
  customSteps?: Array<{ title: string; body: string }>;
  customFaqs?: Array<{ q: string; a: string }>;
  faqs?: Array<{ q: string; a: string }>;
}

export function ToolSeoContent({
  toolSlug: propSlug,
  toolId: propId,
  toolName: propName,
  name: propNameDirect,
  description: propDescription,
  categorySlug: _propCatSlug,
  categoryId: _propCatId,
  version: _propVersion,
  tool,
  customAbout,
  customFeatures,
  customSteps,
  customFaqs: propCustomFaqs,
  faqs: propFaqs,
}: ToolSeoContentProps) {
  const locale = useLocale();
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

  const rawSlug = propSlug || propId || tool?.slug || '';
  const slug = rawSlug.replace(/^tool-/, '');

  let name = propName || propNameDirect || tool?.name || slug;
  let toolDictDesc = '';

  if (tTools && slug) {
    try {
      if (tTools.has(`${slug}.name`)) {
        name = tTools(`${slug}.name`);
      } else if (tTools.has(`${slug}.title`)) {
        name = tTools(`${slug}.title`);
      }
      if (tTools.has(`${slug}.description`)) {
        toolDictDesc = tTools(`${slug}.description`);
      }
    } catch {
      // fallback to name
    }
  }

  const isUserAgent = slug === 'user-agent-parser' || slug === 'user-agent';

  const faqs =
    propCustomFaqs && propCustomFaqs.length > 0
      ? propCustomFaqs
      : propFaqs && propFaqs.length > 0
        ? propFaqs
        : isUserAgent
          ? [
              { q: tFaq('userAgentParser.q1'), a: tFaq('userAgentParser.a1') },
              { q: tFaq('userAgentParser.q2'), a: tFaq('userAgentParser.a2') },
              { q: tFaq('userAgentParser.q3'), a: tFaq('userAgentParser.a3') },
              { q: tFaq('userAgentParser.q4'), a: tFaq('userAgentParser.a4') },
            ]
          : [{ q: tFaq('generic.q1'), a: tFaq('generic.a1') }];

  const metaDescription = propDescription || toolDictDesc || customAbout || t('about', { name });
  const aboutText = customAbout || toolDictDesc || t('about', { name });

  // URL resolution for hreflang and canonical tags
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://velnoxlabs.com').replace(/\/$/, '');

  const getLocaleUrl = (loc: string) => {
    if (!slug) return baseUrl;
    return loc === 'en' ? `${baseUrl}/tools/${slug}` : `${baseUrl}/${loc}/tools/${slug}`;
  };

  const canonicalUrl = getLocaleUrl(locale);

  // Dynamic Localized JSON-LD Structured Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemaGraph: any[] = [
    {
      '@type': 'WebApplication',
      name: `${name} - ${siteConfig.name}`,
      description: metaDescription,
      url: canonicalUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      inLanguage: locale,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  ];

  if (faqs && faqs.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      inLanguage: locale,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': schemaGraph,
  };

  return (
    <>
      {/* 1. Dynamic Localized Title & Meta Description (Hoisted by React 19 / Next.js to <head>) */}
      <title>{`${name} | ${siteConfig.name}`}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* 2. Hreflang Tags for all 10 Locales + x-default */}
      {slug && (
        <>
          {ALL_LOCALES.map((loc) => (
            <link key={loc} rel="alternate" hrefLang={loc} href={getLocaleUrl(loc)} />
          ))}
          <link rel="alternate" hrefLang="x-default" href={getLocaleUrl('en')} />
        </>
      )}

      {/* 3. Dynamic Localized JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 4. Visible SEO Content Container */}
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
          {aboutText}
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
          {customFeatures && customFeatures.length > 0 ? (
            customFeatures.map((feat, i) => <li key={i}>{feat}</li>)
          ) : (
            <>
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
            </>
          )}
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
          {customSteps && customSteps.length > 0 ? (
            customSteps.map((step, i) => (
              <li key={i}>
                <strong style={{ color: 'var(--text-main)' }}>{step.title}:</strong> {step.body}
              </li>
            ))
          ) : (
            <>
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
            </>
          )}
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
