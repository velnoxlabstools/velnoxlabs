'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

function explainCron(minute: string, hour: string, day: string, month: string, weekday: string) {
  const parts: string[] = [];

  // Minute explanation
  if (minute === '*') parts.push('every minute');
  else if (minute.startsWith('*/')) parts.push(`every ${minute.slice(2)} minutes`);
  else parts.push(`at minute ${minute}`);

  // Hour explanation
  if (hour === '*') parts.push('of every hour');
  else if (hour.startsWith('*/')) parts.push(`every ${hour.slice(2)} hours`);
  else if (hour.includes(',')) parts.push(`at hours ${hour}`);
  else parts.push(`at ${hour.padStart(2, '0')}:00`);

  // Day of month
  if (day !== '*') parts.push(`on day ${day} of the month`);

  // Month
  if (month !== '*') {
    const monthNames = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthList = month
      .split(',')
      .map((m) => monthNames[parseInt(m)] || m)
      .join(', ');
    parts.push(`in ${monthList}`);
  }

  // Weekday
  if (weekday !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayList = weekday
      .split(',')
      .map((d) => days[parseInt(d)] || d)
      .join(', ');
    parts.push(`on ${dayList}`);
  }

  return parts.join(' ');
}

export default function CronExpressionGeneratorPage() {
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('9');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [copied, setCopied] = useState(false);
  const cronExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;
  const explanation = explainCron(minute, hour, day, month, weekday);

  const presets = [
    { label: '⏰ Every Minute', value: ['*', '*', '*', '*', '*'] },
    { label: '🕐 Every Hour', value: ['0', '*', '*', '*', '*'] },
    { label: '🌅 Daily at 9 AM', value: ['0', '9', '*', '*', '*'] },
    { label: '🌙 Daily at Midnight', value: ['0', '0', '*', '*', '*'] },
    { label: '📅 Every Monday', value: ['0', '9', '*', '*', '1'] },
    { label: '📆 First of Month', value: ['0', '0', '1', '*', '*'] },
    { label: '🎉 Every 15 Minutes', value: ['*/15', '*', '*', '*', '*'] },
    { label: '📊 Weekdays at 8 AM', value: ['0', '8', '*', '*', '1-5'] },
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
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
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
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Minute
                </label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="0-59, *, */5"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Hour
                </label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="0-23, *, */2"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Day (Month)
                </label>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="1-31, *"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Month
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="1-12, *"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Weekday
                </label>
                <input
                  type="text"
                  value={weekday}
                  onChange={(e) => setWeekday(e.target.value)}
                  placeholder="0-6 (Sun-Sat), *"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
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
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Cron Expression:
              </label>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
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
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label
                style={{
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                📖 Human-Readable:
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
                Runs <strong style={{ color: '#60a5fa' }}>{explanation}</strong>
              </div>
            </div>
          </div>

          {/* Cron Format Table */}
          <div
            style={{
              marginTop: '24px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              Cron Format Reference
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { field: 'Minute', range: '0-59', special: '* , - /' },
                { field: 'Hour', range: '0-23', special: '* , - /' },
                { field: 'Day (Month)', range: '1-31', special: '* , - /' },
                { field: 'Month', range: '1-12', special: '* , - /' },
                { field: 'Weekday', range: '0-6 (Sun-Sat)', special: '* , - /' },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
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
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Range: {row.range}</div>
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
