'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type Mode = 'salaryToHourly' | 'hourlyToSalary';

export default function SalaryToHourlyCalculatorPage() {
  const [mode, setMode] = useState<Mode>('salaryToHourly');
  const [annualSalary, setAnnualSalary] = useState('60000');
  const [hourlyRate, setHourlyRate] = useState('28.85');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState({
    hourly: 0,
    daily: 0,
    weekly: 0,
    biweekly: 0,
    monthly: 0,
    annual: 0,
  });

  useEffect(() => {
    const hpw = parseFloat(hoursPerWeek) || 40;
    const wpy = parseFloat(weeksPerYear) || 52;
    const totalHours = hpw * wpy;

    if (mode === 'salaryToHourly') {
      const salary = parseFloat(annualSalary) || 0;
      const hourly = totalHours > 0 ? salary / totalHours : 0;
      setResult({
        hourly,
        daily: hourly * (hpw / 5),
        weekly: hourly * hpw,
        biweekly: hourly * hpw * 2,
        monthly: salary / 12,
        annual: salary,
      });
    } else {
      const rate = parseFloat(hourlyRate) || 0;
      const annual = rate * totalHours;
      setResult({
        hourly: rate,
        daily: rate * (hpw / 5),
        weekly: rate * hpw,
        biweekly: rate * hpw * 2,
        monthly: annual / 12,
        annual,
      });
    }
  }, [mode, annualSalary, hourlyRate, hoursPerWeek, weeksPerYear]);

  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    const text = `Annual: ${formatCurrency(result.annual)}
Monthly: ${formatCurrency(result.monthly)}
Biweekly: ${formatCurrency(result.biweekly)}
Weekly: ${formatCurrency(result.weekly)}
Daily: ${formatCurrency(result.daily)}
Hourly: ${formatCurrency(result.hourly)}

Based on ${hoursPerWeek} hrs/week × ${weeksPerYear} weeks/year`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Salary to Hourly Calculator',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free salary to hourly calculator — convert annual salary to hourly, daily, weekly, biweekly, and monthly pay. Also convert hourly rate to annual salary.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I convert salary to hourly?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Divide your annual salary by the total hours you work per year. For a standard 40-hour workweek with 52 weeks, that's 2,080 hours. Example: $60,000 ÷ 2,080 = $28.85/hour.",
            },
          },
          {
            '@type': 'Question',
            name: 'How many work hours are in a year?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "A standard full-time year is 2,080 hours (40 hours/week × 52 weeks). If you get 2 weeks paid vacation, it's still 2,080 because vacation is paid. If you work 50 weeks (2 unpaid weeks off), it's 2,000 hours.",
            },
          },
          {
            '@type': 'Question',
            name: 'Is this Salary to Hourly Calculator free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Salary to Hourly Calculator is 100% free with no sign-up required. All calculations happen in your browser.',
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
            title="Salary to Hourly Calculator"
            subtitle="Convert between annual salary and hourly rate — see your pay broken down by hour, day, week, month, and year."
          />

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => setMode('salaryToHourly')}
                style={{
                  flex: 1,
                  backgroundColor:
                    mode === 'salaryToHourly' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                  color: mode === 'salaryToHourly' ? '#60a5fa' : '#94a3b8',
                  border:
                    mode === 'salaryToHourly'
                      ? '1px solid rgba(59, 130, 246, 0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                💼 Salary → Hourly
              </button>
              <button
                onClick={() => setMode('hourlyToSalary')}
                style={{
                  flex: 1,
                  backgroundColor:
                    mode === 'hourlyToSalary' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                  color: mode === 'hourlyToSalary' ? '#60a5fa' : '#94a3b8',
                  border:
                    mode === 'hourlyToSalary'
                      ? '1px solid rgba(59, 130, 246, 0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ⏰ Hourly → Salary
              </button>
            </div>

            {/* Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {mode === 'salaryToHourly' ? (
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
                    Annual Salary ($):
                  </label>
                  <input
                    type="number"
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(e.target.value)}
                    placeholder="60000"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '14px',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              ) : (
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
                    Hourly Rate ($):
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="28.85"
                    step="0.01"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      padding: '14px',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              )}
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
                  Hours per Week:
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="40"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
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
                  Weeks per Year:
                </label>
                <input
                  type="number"
                  value={weeksPerYear}
                  onChange={(e) => setWeeksPerYear(e.target.value)}
                  placeholder="52"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Main Result */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  color: '#6ee7b7',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {mode === 'salaryToHourly' ? 'Your Hourly Rate' : 'Your Annual Salary'}
              </div>
              <div
                style={{
                  color: '#fff',
                  fontSize: '3rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  lineHeight: 1,
                }}
              >
                {mode === 'salaryToHourly'
                  ? formatCurrency(result.hourly)
                  : formatCurrency(result.annual)}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>
                Based on {hoursPerWeek} hrs/week × {weeksPerYear} weeks (
                {parseFloat(hoursPerWeek) * parseFloat(weeksPerYear)} hrs/year)
              </div>
            </div>

            {/* Full Breakdown Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Hourly
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.hourly)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Daily
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.daily)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Weekly
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.weekly)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Biweekly
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.biweekly)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#fcd34d',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Monthly
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.monthly)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#6ee7b7',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Annual
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(result.annual)}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)',
                color: copied ? '#34d399' : '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Full Breakdown'}
            </button>
          </div>

          <ToolSeoContent
            toolSlug="salary-to-hourly-calculator"
            toolName="Salary to Hourly Calculator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
