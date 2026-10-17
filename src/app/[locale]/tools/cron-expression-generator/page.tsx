'use client';

import React, { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import cronstrue from 'cronstrue/i18n';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const CRONSTRUE_LOCALE_MAP: Record<string, string> = {
  en: 'en',
  zh: 'zh_CN',
  es: 'es',
  pt: 'pt_BR',
  de: 'de',
  fr: 'fr',
  it: 'it',
  ja: 'ja',
  ru: 'ru',
  ko: 'ko',
};

export default function CronExpressionGeneratorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.cronExpressionGenerator');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('9');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [copied, setCopied] = useState(false);
  const cronExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;

  const explanation = useMemo(() => {
    try {
      const cronLocale = CRONSTRUE_LOCALE_MAP[locale] || 'en';
      return cronstrue.toString(cronExpression, { locale: cronLocale });
    } catch {
      return cronExpression;
    }
  }, [cronExpression, locale]);

  const presets = [
    { label: tUI('presetEveryMinute'), value: ['*', '*', '*', '*', '*'] },
    { label: tUI('presetEveryHour'), value: ['0', '*', '*', '*', '*'] },
    { label: tUI('presetDaily9AM'), value: ['0', '9', '*', '*', '*'] },
    { label: tUI('presetDailyMidnight'), value: ['0', '0', '*', '*', '*'] },
    { label: tUI('presetEveryMonday'), value: ['0', '9', '*', '*', '1'] },
    { label: tUI('presetFirstOfMonth'), value: ['0', '0', '1', '*', '*'] },
    { label: tUI('presetEvery15Minutes'), value: ['*/15', '*', '*', '*', '*'] },
    { label: tUI('presetWeekdays8AM'), value: ['0', '8', '*', '*', '1-5'] },
  ];

  const applyPreset = (preset: string[]) => {
    setMinute(preset[0]);
    setHour(preset[1]);
    setDay(preset[2]);
    setMonth(preset[3]);
    setWeekday(preset[4]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Cron Expression Generator',
        operatingSystem: 'All',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free cron expression generator with visual builder, human-readable explanation, and common presets. Perfect for Linux crontab, Kubernetes, and CI/CD schedules.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is a cron expression?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A cron expression is a string of 5 fields (minute, hour, day of month, month, day of week) used to schedule recurring tasks in Linux crontab, Kubernetes CronJobs, and CI/CD pipelines.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I use the cron generator?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Select your values or use a preset, and the cron expression is generated instantly along with a human-readable explanation.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is this cron generator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Cron Expression Generator is 100% free with no sign-up required.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Cron Expression Generator"
            subtitle="Build cron expressions visually with human-readable explanations and common presets."
            toolSlug="cron-expression-generator"
          />

          {/* Presets */}
          <div
            style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p.value)}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Main Builder */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('minute')}
                </label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder={tUI('minutePlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('hour')}
                </label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder={tUI('hourPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('dayMonth')}
                </label>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder={tUI('dayPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('month')}
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder={tUI('monthPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('weekday')}
                </label>
                <input
                  type="text"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value)}
                  placeholder={tUI('weekdayPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Output */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('cronExpression')}
              </label>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  paddingRight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '60px',
                }}
              >
                <code
                  style={{
                    color: '#34d399',
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    wordBreak: 'break-all',
                  }}
                >
                  {cronExpression}
                </code>
                <button
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: copied
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copied ? '#34d399' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('humanReadable')}
              </label>
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#93c5fd',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                <strong style={{ color: '#60a5fa' }}>{tUI('runs', { explanation })}</strong>
              </div>
            </div>
          </div>

          {/* Cron Format Table */}
          <div
            style={{
              marginTop: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <h3
              style={{
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              {tUI('formatReference')}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { field: tUI('minute'), range: '0-59', special: '* , - /' },
                { field: tUI('hour'), range: '0-23', special: '* , - /' },
                { field: tUI('dayMonth'), range: '1-31', special: '* , - /' },
                { field: tUI('month'), range: '1-12', special: '* , - /' },
                { field: tUI('weekday'), range: tUI('rangeSunSat'), special: '* , - /' },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      color: '#60a5fa',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    {row.field}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {tUI('range', { range: row.range })}
                  </div>
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      marginTop: '2px',
                    }}
                  >
                    {row.special}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ToolSeoContent
            toolSlug="cron-expression-generator"
            toolName="Cron Expression Generator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
