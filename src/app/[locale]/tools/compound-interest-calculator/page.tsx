'use client';

import React, { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, TrendingUp, Calculator } from 'lucide-react';

const FREQUENCIES = [
  { value: 1, key: 'annually' as const },
  { value: 2, key: 'semiannually' as const },
  { value: 4, key: 'quarterly' as const },
  { value: 12, key: 'monthly' as const },
  { value: 365, key: 'daily' as const },
];

export default function CompoundInterestCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.compoundInterestCalculator');

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState('5000');
  const [stepUpPct, setStepUpPct] = useState('0');
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const P = Math.max(0, parseFloat(principal) || 0);
    const r = Math.max(0, parseFloat(rate) || 0) / 100;
    const t = Math.max(1, Math.min(50, parseInt(years, 10) || 1));
    const n = frequency;
    const baseMonthly = Math.max(0, parseFloat(monthlyContribution) || 0);
    const stepUp = Math.max(0, parseFloat(stepUpPct) || 0) / 100;

    let balance = P;
    let totalContributed = P;
    let currentMonthly = baseMonthly;
    const schedule: { year: number; balance: number; interest: number; contributed: number }[] = [];

    for (let yr = 1; yr <= t; yr++) {
      for (let m = 1; m <= 12; m++) {
        balance = balance * Math.pow(1 + r / n, n / 12);
        balance += currentMonthly;
        totalContributed += currentMonthly;
      }
      schedule.push({
        year: yr,
        balance,
        interest: Math.max(0, balance - totalContributed),
        contributed: totalContributed,
      });
      if (stepUp > 0) {
        currentMonthly = currentMonthly * (1 + stepUp);
      }
    }

    // Inflation-adjusted real value at 6%
    const realValue = balance / Math.pow(1.06, t);

    return {
      finalAmount: balance,
      totalInterest: Math.max(0, balance - totalContributed),
      totalContributions: totalContributed,
      realValue,
      schedule,
    };
  }, [principal, rate, years, frequency, monthlyContribution, stepUpPct]);

  const formatMoney = (val: number) => {
    try {
      return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `${currency === 'INR' ? '₹' : '$'}${Math.round(val).toLocaleString()}`;
    }
  };

  const applyPreset = (p: string, r: string, y: string, freq: number, sip: string) => {
    setPrincipal(p);
    setRate(r);
    setYears(y);
    setFrequency(freq);
    setMonthlyContribution(sip);
  };

  const handleCopy = () => {
    const freqKey = FREQUENCIES.find((f) => f.value === frequency)?.key || 'monthly';
    const text = `${tUI('initialPrincipal')}: ${formatMoney(parseFloat(principal) || 0)}
${tUI('annualRate')} ${rate}% (${years} ${tUI('yearsLabel')})
${tUI('compoundingFrequency')} ${tUI(freqKey)}
${tUI('monthlyContribution')}: ${formatMoney(parseFloat(monthlyContribution) || 0)}

${tUI('finalBalance')}: ${formatMoney(results.finalAmount)}
${tUI('interestEarned')}: ${formatMoney(results.totalInterest)}
${tUI('totalContributions')}: ${formatMoney(results.totalContributions)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxScheduleBalance =
    results.schedule.length > 0 ? results.schedule[results.schedule.length - 1].balance : 1;

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="compound-interest-calculator"
        />

        {/* 1-Click India Presets & Currency Toggle */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            marginTop: 'var(--space-6)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { label: tUI('presetSbiFd'), args: ['100000', '7.0', '5', 4, '0'] as const },
              { label: tUI('presetSip'), args: ['0', '12', '10', 12, '10000'] as const },
              { label: tUI('presetPpf'), args: ['50000', '7.1', '15', 1, '5000'] as const },
              { label: tUI('presetNifty'), args: ['100000', '14', '15', 12, '10000'] as const },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.args[0], p.args[1], p.args[2], p.args[3], p.args[4])}
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

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['INR', 'USD'] as const).map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setCurrency(cur)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border:
                    currency === cur
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--border-color)',
                  backgroundColor: currency === cur ? 'rgba(16, 185, 129, 0.18)' : 'var(--bg-card)',
                  color: currency === cur ? '#34d399' : 'var(--text-muted)',
                }}
              >
                {cur === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Calculator Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '22px',
            }}
          >
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('initialPrincipal')}
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('monthlyContribution')}
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('annualRate')}
              </label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('yearsLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={years}
                onChange={(e) => setYears(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('compoundingFrequency')}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {tUI(f.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('stepUpLabel')}
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={stepUpPct}
                onChange={(e) => setStepUpPct(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('finalBalance')}
              </div>
              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#34d399',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {formatMoney(results.finalAmount)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('interestEarned')}
              </div>
              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {formatMoney(results.totalInterest)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('totalContributions')}
              </div>
              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {formatMoney(results.totalContributions)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.28)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>
                {tUI('inflationAdjustedLabel')}
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#a78bfa',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {formatMoney(results.realValue)}
              </div>
            </div>
          </div>

          {/* Interactive Visual Growth Chart */}
          {results.schedule.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  <TrendingUp size={15} style={{ color: '#34d399' }} />
                  {tUI('growthChartTitle')}
                </span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                    ■ {tUI('totalContributions')}
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>
                    ■ {tUI('interestEarned')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.schedule.slice(0, 15).map((row) => {
                  const contribPct = (row.contributed / maxScheduleBalance) * 100;
                  const intPct = (row.interest / maxScheduleBalance) * 100;
                  return (
                    <div
                      key={row.year}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <span
                        style={{
                          width: '48px',
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        Y{row.year}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '14px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          display: 'flex',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ width: `${contribPct}%`, backgroundColor: '#3b82f6' }} />
                        <div style={{ width: `${intPct}%`, backgroundColor: '#10b981' }} />
                      </div>
                      <span
                        style={{
                          width: '105px',
                          textAlign: 'right',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                        }}
                      >
                        {formatMoney(row.balance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Compound Interest Formula Card */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.07)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#a78bfa',
                marginBottom: '6px',
              }}
            >
              <Calculator size={14} />
              <span>{tUI('formulaTitle')}</span>
            </div>
            <code style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
              A = P(1 + r/n)<sup>nt</sup> → P={formatMoney(parseFloat(principal) || 0)}, r={rate}%,
              n={frequency}, t={years}
            </code>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)',
              color: copied ? '#34d399' : '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? tUI('copied') : tUI('copyResult')}
          </button>
        </div>

        <ToolSeoContent
          toolSlug="compound-interest-calculator"
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
  );
}
