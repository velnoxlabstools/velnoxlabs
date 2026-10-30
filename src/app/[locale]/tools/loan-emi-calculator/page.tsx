'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/format';

export default function LoanEmiCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.loanEmiCalculator');
  const [loanAmount, setLoanAmount] = useState('250000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    payoffDate: '',
    schedule: [] as { year: number; principal: number; interest: number; balance: number }[],
  });

  useEffect(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const r = annualRate / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;

    if (P <= 0 || n <= 0) {
      setResults({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        payoffDate: '',
        schedule: [],
      });
      return;
    }

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    // Build yearly schedule
    const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    let balance = P;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      yearPrincipal += principalPayment;
      yearInterest += interestPayment;

      if (month % 12 === 0) {
        schedule.push({
          year: month / 12,
          principal: yearPrincipal,
          interest: yearInterest,
          balance: Math.max(0, balance),
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    // Payoff date
    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + n);
    const payoffDate = payoff.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      payoffDate,
      schedule,
    });
  }, [loanAmount, rate, years, locale]);

  const formatCurrency = (n: number) => {
    return formatCurrencyUtil(n, locale);
  };

  const handleCopy = () => {
    const text = `${tUI('copyLoanAmount', { amount: formatCurrency(parseFloat(loanAmount) || 0) })}
${tUI('copyInterestRate', { rate })}
${tUI('copyTerm', { years })}

${tUI('copyMonthlyPayment', { amount: formatCurrency(results.monthlyPayment) })}
${tUI('copyTotalInterest', { amount: formatCurrency(results.totalInterest) })}
${tUI('copyTotalPaid', { amount: formatCurrency(results.totalPayment) })}
${tUI('copyPayoffDate', { date: results.payoffDate })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

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
                  {tUI('loanAmount')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      pointerEvents: 'none',
                    }}
                  >
                    {getCurrencySymbol(locale)}
                  </span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="250000"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '14px 14px 14px 34px',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
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
                  {tUI('annualInterestRate')}
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="6.5"
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
                  {tUI('loanTerm')}
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="30"
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

            {/* Main Result - Monthly Payment */}
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
                {tUI('monthlyPayment')}
              </div>
              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '3rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  marginBottom: '8px',
                  lineHeight: 1,
                }}
              >
                {formatCurrency(results.monthlyPayment)}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {tUI('payoffBy', { date: results.payoffDate })}
              </div>
            </div>

            {/* Secondary Results */}
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
                  {tUI('totalPrincipal')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(parseFloat(loanAmount) || 0)}
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
                  {tUI('totalInterest')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(results.totalInterest)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#fcd34d',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('totalPaid')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(results.totalPayment)}
                </div>
              </div>
            </div>

            {/* Breakdown Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                {tUI('principalVsInterest')}
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
                    flex: parseFloat(loanAmount) || 1,
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {results.totalPayment > 0
                    ? Math.round(((parseFloat(loanAmount) || 0) / results.totalPayment) * 100) + '%'
                    : ''}
                </div>
                <div
                  style={{
                    flex: results.totalInterest || 1,
                    backgroundColor: '#a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {results.totalPayment > 0
                    ? Math.round((results.totalInterest / results.totalPayment) * 100) + '%'
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
                  <span style={{ color: '#3b82f6' }}>■</span> {tUI('principal')}
                </span>
                <span>
                  <span style={{ color: '#a855f7' }}>■</span> {tUI('interest')}
                </span>
              </div>
            </div>

            {/* Amortization Schedule */}
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
                  {tUI('yearlySchedule')}
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
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#93c5fd',
                      textTransform: 'uppercase',
                    }}
                  >
                    <div>{tUI('year')}</div>
                    <div style={{ textAlign: 'right' }}>{tUI('principal')}</div>
                    <div style={{ textAlign: 'right' }}>{tUI('interest')}</div>
                    <div style={{ textAlign: 'right' }}>{tUI('balance')}</div>
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {results.schedule.map((row, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '60px 1fr 1fr 1fr',
                          gap: '4px',
                          padding: '8px 14px',
                          borderTop: '1px solid rgba(255,255,255,0.04)',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        <div style={{ color: '#60a5fa', fontWeight: 700 }}>{row.year}</div>
                        <div style={{ textAlign: 'right', color: '#93c5fd' }}>
                          {formatCurrency(row.principal)}
                        </div>
                        <div style={{ textAlign: 'right', color: '#c4b5fd' }}>
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
              {copied ? tUI('copied') : tUI('copySummary')}
            </button>
          </div>

          <ToolSeoContent
            toolSlug="loan-emi-calculator"
            toolName={tUI('title')}
            description={tUI('subtitle')}
            customAbout={tUI('aboutText')}
            customFeatures={[tUI('feature1'), tUI('feature2'), tUI('feature3'), tUI('feature4')]}
            customSteps={[
              { title: tUI('step1Title'), body: tUI('step1Body') },
              { title: tUI('step2Title'), body: tUI('step2Body') },
              { title: tUI('step3Title'), body: tUI('step3Body') },
            ]}
            customFaqs={[
              { q: tUI('faq1Q'), a: tUI('faq1A') },
              { q: tUI('faq2Q'), a: tUI('faq2A') },
              { q: tUI('faq3Q'), a: tUI('faq3A') },
              { q: tUI('faq4Q'), a: tUI('faq4A') },
            ]}
          />
        </div>
      </GlobalContainer>
    </>
  );
}
