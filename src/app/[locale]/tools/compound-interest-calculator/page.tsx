'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const FREQUENCIES = [
  { value: 1, label: 'Annually (1×/year)' },
  { value: 2, label: 'Semi-annually (2×/year)' },
  { value: 4, label: 'Quarterly (4×/year)' },
  { value: 12, label: 'Monthly (12×/year)' },
  { value: 365, label: 'Daily (365×/year)' },
];

export default function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState('0');
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState({
    finalAmount: 0,
    totalInterest: 0,
    totalContributions: 0,
    schedule: [] as { year: number; balance: number; interest: number; contributed: number }[],
  });

  useEffect(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = frequency;
    const monthly = parseFloat(monthlyContribution) || 0;

    // Compound interest with monthly contributions
    const totalMonths = t * 12;
    let balance = P;
    let totalContributed = P;
    const schedule: { year: number; balance: number; interest: number; contributed: number }[] = [];

    for (let month = 1; month <= totalMonths; month++) {
      // Apply compound interest (approximation: divide annual rate over periods)
      balance = balance * Math.pow(1 + r / n, n / 12);
      balance += monthly;
      totalContributed += monthly;

      if (month % 12 === 0) {
        const yearNum = month / 12;
        schedule.push({
          year: yearNum,
          balance: balance,
          interest: balance - totalContributed,
          contributed: totalContributed,
        });
      }
    }

    setResults({
      finalAmount: balance,
      totalInterest: balance - totalContributed,
      totalContributions: totalContributed,
      schedule,
    });
  }, [principal, rate, years, frequency, monthlyContribution]);

  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    const text = `Principal: ${formatCurrency(parseFloat(principal) || 0)}
Rate: ${rate}% for ${years} years
Compound: ${FREQUENCIES.find((f) => f.value === frequency)?.label}
Monthly Contribution: ${formatCurrency(parseFloat(monthlyContribution) || 0)}

Final Balance: ${formatCurrency(results.finalAmount)}
Total Interest Earned: ${formatCurrency(results.totalInterest)}
Total Contributed: ${formatCurrency(results.totalContributions)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Compound Interest Calculator',
        operatingSystem: 'All',
        applicationCategory: 'FinanceApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free compound interest calculator — see how your investment grows over time with monthly contributions, daily/monthly/annual compounding, and detailed year-by-year breakdown.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is compound interest?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Compound interest is interest earned on both your original principal and on interest you have already earned. This creates exponential growth over time — Albert Einstein reportedly called it "the eighth wonder of the world."',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the compound interest formula?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The formula is A = P(1 + r/n)^(nt), where A is final amount, P is principal, r is annual rate, n is compounding frequency per year, and t is time in years.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does compound frequency matter?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. The more frequently interest is compounded (daily > monthly > annually), the more interest you earn over time. Daily compounding yields the highest returns.',
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
            title="Compound Interest Calculator"
            subtitle="See how your investment grows with the power of compounding — including monthly contributions and detailed yearly breakdown."
          />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Inputs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
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
                  Initial Principal ($):
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="10000"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
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
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Annual Interest Rate (%):
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="7"
                  step="0.1"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
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
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Years:
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="10"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
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
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Monthly Contribution ($):
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Frequency */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Compounding Frequency:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    style={{
                      backgroundColor:
                        frequency === f.value ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                      color: frequency === f.value ? '#60a5fa' : '#94a3b8',
                      border:
                        frequency === f.value
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Results */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#6ee7b7',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Final Balance
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(results.finalAmount)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Total Contributions
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(results.totalContributions)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  Interest Earned
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(results.totalInterest)}
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Breakdown:
              </div>
              <div
                style={{
                  display: 'flex',
                  height: '20px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '6px',
                }}
              >
                <div
                  style={{
                    flex: results.totalContributions || 1,
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {results.totalContributions > 0
                    ? Math.round((results.totalContributions / results.finalAmount) * 100) + '%'
                    : ''}
                </div>
                <div
                  style={{
                    flex: results.totalInterest || 1,
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {results.totalInterest > 0
                    ? Math.round((results.totalInterest / results.finalAmount) * 100) + '%'
                    : ''}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>
                  <span style={{ color: '#3b82f6' }}>■</span> Contributions
                </span>
                <span>
                  <span style={{ color: '#10b981' }}>■</span> Interest
                </span>
              </div>
            </div>

            {/* Year-by-Year Table */}
            {results.schedule.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '10px',
                  }}
                >
                  📈 Year-by-Year Growth
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 1fr 1fr',
                      gap: '4px',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#93c5fd',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div>Year</div>
                    <div style={{ textAlign: 'right' }}>Contributed</div>
                    <div style={{ textAlign: 'right' }}>Interest</div>
                    <div style={{ textAlign: 'right' }}>Balance</div>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {results.schedule.map((row, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '60px 1fr 1fr 1fr',
                          gap: '4px',
                          padding: '8px 14px',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        <div style={{ color: '#60a5fa', fontWeight: 700 }}>{row.year}</div>
                        <div style={{ textAlign: 'right' }}>{formatCurrency(row.contributed)}</div>
                        <div style={{ textAlign: 'right', color: '#34d399' }}>
                          {formatCurrency(row.interest)}
                        </div>
                        <div
                          style={{ textAlign: 'right', color: 'var(--text-main)', fontWeight: 700 }}
                        >
                          {formatCurrency(row.balance)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
              {copied ? '✓ Copied!' : '📋 Copy Breakdown'}
            </button>
          </div>

          <ToolSeoContent
            toolSlug="compound-interest-calculator"
            toolName="Compound Interest Calculator"
          />
        </div>
      </GlobalContainer>
    </>
  );
}
