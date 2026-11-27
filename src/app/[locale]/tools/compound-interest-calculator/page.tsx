'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, TrendingUp, Calculator, Download } from 'lucide-react';

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
type ContributionFreq = 'monthly' | 'annually';

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  INR: { symbol: '₹', locale: 'en-IN' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
};

function formatMoney(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  return `${config.symbol}${Math.round(amount).toLocaleString(config.locale)}`;
}

const FREQUENCIES = [
  { value: 1, key: 'annually' as const },
  { value: 2, key: 'semiannually' as const },
  { value: 4, key: 'quarterly' as const },
  { value: 12, key: 'monthly' as const },
  { value: 365, key: 'daily' as const },
];

export default function CompoundInterestCalculatorPage() {
  const tUI = useTranslations('ToolUI.compoundInterestCalculator');

  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [principal, setPrincipal] = useState('100000');
  const [contribution, setContribution] = useState('5000');
  const [contributionFreq, setContributionFreq] = useState<ContributionFreq>('monthly');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState(12);
  const [stepUpPct, setStepUpPct] = useState('0');
  const [inflationRate, setInflationRate] = useState('6.0');
  const [copied, setCopied] = useState(false);

  // Math calculation
  const results = useMemo(() => {
    const P = Math.max(0, parseFloat(principal) || 0);
    const r = Math.max(0, parseFloat(rate) || 0) / 100;
    const t = Math.max(1, Math.min(50, parseInt(years, 10) || 1));
    const n = frequency;
    const baseContr = Math.max(0, parseFloat(contribution) || 0);
    const stepUp = Math.max(0, parseFloat(stepUpPct) || 0) / 100;
    const infl = Math.max(0, parseFloat(inflationRate) || 0) / 100;

    let balance = P;
    let totalContributed = P;
    let currentAnnualContr = contributionFreq === 'monthly' ? baseContr * 12 : baseContr;

    const schedule: {
      year: number;
      depositThisYear: number;
      balance: number;
      interest: number;
      contributed: number;
    }[] = [];

    for (let yr = 1; yr <= t; yr++) {
      let yearDeposit = 0;

      if (contributionFreq === 'monthly') {
        const monthlyAmt = currentAnnualContr / 12;
        for (let m = 1; m <= 12; m++) {
          balance = balance * Math.pow(1 + r / n, n / 12);
          balance += monthlyAmt;
          totalContributed += monthlyAmt;
          yearDeposit += monthlyAmt;
        }
      } else {
        // Annual contribution at end of year
        balance = balance * Math.pow(1 + r / n, n);
        balance += currentAnnualContr;
        totalContributed += currentAnnualContr;
        yearDeposit += currentAnnualContr;
      }

      schedule.push({
        year: yr,
        depositThisYear: yearDeposit,
        balance,
        interest: Math.max(0, balance - totalContributed),
        contributed: totalContributed,
      });

      if (stepUp > 0) {
        currentAnnualContr = currentAnnualContr * (1 + stepUp);
      }
    }

    const realValue = infl > 0 ? balance / Math.pow(1 + infl, t) : balance;

    return {
      finalAmount: balance,
      totalInterest: Math.max(0, balance - totalContributed),
      totalContributions: totalContributed,
      realValue,
      schedule,
    };
  }, [principal, rate, years, frequency, contribution, contributionFreq, stepUpPct, inflationRate]);

  // Preset applies
  const applyPreset = (
    curr: CurrencyCode,
    p: string,
    r: string,
    y: string,
    freq: number,
    contr: string,
    cFreq: ContributionFreq,
    infl: string
  ) => {
    setCurrency(curr);
    setPrincipal(p);
    setRate(r);
    setYears(y);
    setFrequency(freq);
    setContribution(contr);
    setContributionFreq(cFreq);
    setInflationRate(infl);
  };

  const handleCopy = () => {
    const freqKey = FREQUENCIES.find((f) => f.value === frequency)?.key || 'monthly';
    const text = `--- ${tUI('title')} ---
${tUI('initialPrincipal')}: ${formatMoney(parseFloat(principal) || 0, currency)}
${tUI('annualRate')}: ${rate}% APR (${years} ${tUI('yearsLabel')})
${tUI('compoundingFrequency')}: ${tUI(freqKey)}
${tUI('recurringContribution')}: ${formatMoney(parseFloat(contribution) || 0, currency)} (${tUI(contributionFreq)})
${tUI('stepUpLabel')}: ${stepUpPct}%
${tUI('inflationRateLabel')}: ${inflationRate}%

${tUI('finalBalance')}: ${formatMoney(results.finalAmount, currency)}
${tUI('interestEarned')}: ${formatMoney(results.totalInterest, currency)}
${tUI('totalContributions')}: ${formatMoney(results.totalContributions, currency)}
${tUI('inflationAdjustedLabel')}: ${formatMoney(results.realValue, currency)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (results.schedule.length === 0) return;
    const header = [
      'Year',
      'Annual Deposit',
      'Total Contributed',
      'Interest Earned',
      'Year-End Balance',
    ];
    const rows = results.schedule.map((r) => [
      r.year,
      r.depositThisYear.toFixed(2),
      r.contributed.toFixed(2),
      r.interest.toFixed(2),
      r.balance.toFixed(2),
    ]);
    const csvContent = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compound-interest-schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxScheduleBalance =
    results.schedule.length > 0 ? results.schedule[results.schedule.length - 1].balance : 1;

  const presetsList = [
    {
      label: tUI('presetSbiFd'),
      onClick: () => applyPreset('INR', '100000', '7.0', '5', 4, '0', 'monthly', '6.0'),
    },
    {
      label: tUI('presetSip'),
      onClick: () => applyPreset('INR', '0', '12.0', '15', 12, '10000', 'monthly', '6.0'),
    },
    {
      label: tUI('presetPpf'),
      onClick: () => applyPreset('INR', '50000', '7.1', '15', 1, '150000', 'annually', '6.0'),
    },
    {
      label: tUI('presetNifty'),
      onClick: () => applyPreset('INR', '100000', '13.5', '15', 12, '15000', 'monthly', '6.0'),
    },
    {
      label: tUI('presetSp500'),
      onClick: () => applyPreset('USD', '5000', '10.0', '20', 12, '500', 'monthly', '3.5'),
    },
  ];

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="compound-interest-calculator"
        />

        {/* 1-Click Strategy Presets & Currency Selector Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginTop: 'var(--space-6)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {presetsList.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={p.onClick}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Currency Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {tUI('currencyLabel')}:
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                padding: '6px 10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
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
          {/* Inputs Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
              marginBottom: '22px',
            }}
          >
            {/* Initial Principal */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="principal-input"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {tUI('initialPrincipal')}
                </label>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#60a5fa',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(parseFloat(principal) || 0, currency)}
                </span>
              </div>
              <input
                id="principal-input"
                type="number"
                min="0"
                step="500"
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
                  marginBottom: '6px',
                }}
              />
              <input
                type="range"
                min={0}
                max={currency === 'INR' ? 5000000 : 500000}
                step={currency === 'INR' ? 10000 : 1000}
                value={parseFloat(principal) || 0}
                onChange={(e) => setPrincipal(e.target.value)}
                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            {/* Recurring Contribution */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="contribution-input"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {tUI('recurringContribution')}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['monthly', 'annually'] as const).map((cf) => (
                    <button
                      key={cf}
                      type="button"
                      onClick={() => setContributionFreq(cf)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        border:
                          contributionFreq === cf
                            ? '1px solid #10b981'
                            : '1px solid var(--border-color)',
                        backgroundColor:
                          contributionFreq === cf ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                        color: contributionFreq === cf ? '#34d399' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI(cf)}
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="contribution-input"
                type="number"
                min="0"
                step="100"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
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
                  marginBottom: '6px',
                }}
              />
              <input
                type="range"
                min={0}
                max={currency === 'INR' ? 200000 : 10000}
                step={currency === 'INR' ? 1000 : 50}
                value={parseFloat(contribution) || 0}
                onChange={(e) => setContribution(e.target.value)}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
            </div>

            {/* Interest Rate */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="rate-input"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {tUI('annualRate')}
                </label>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                    fontFamily: 'monospace',
                  }}
                >
                  {rate}%
                </span>
              </div>
              <input
                id="rate-input"
                type="number"
                step="0.1"
                min="0.1"
                max="40"
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
                  marginBottom: '6px',
                }}
              />
              <input
                type="range"
                min={1}
                max={30}
                step={0.1}
                value={parseFloat(rate) || 1}
                onChange={(e) => setRate(e.target.value)}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
            </div>

            {/* Years */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="years-input"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {tUI('yearsLabel')}
                </label>
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#a855f7',
                    fontFamily: 'monospace',
                  }}
                >
                  {years} {tUI('yearsWord')}
                </span>
              </div>
              <input
                id="years-input"
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
                  marginBottom: '6px',
                }}
              />
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={parseInt(years, 10) || 1}
                onChange={(e) => setYears(e.target.value)}
                style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Secondary Controls Strip: Frequency, Step-Up, and Inflation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '22px',
            }}
          >
            {/* Frequency */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {tUI('compoundingFrequency')}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
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

            {/* Step-Up */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {tUI('stepUpLabel')} ({stepUpPct}%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={stepUpPct}
                onChange={(e) => setStepUpPct(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Inflation */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {tUI('inflationRateLabel')} ({inflationRate}%)
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={20}
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Primary Summary Cards */}
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
                borderRadius: '12px',
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
                {formatMoney(results.finalAmount, currency)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
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
                {formatMoney(results.totalInterest, currency)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
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
                {formatMoney(results.totalContributions, currency)}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>
                {tUI('inflationAdjustedLabel')} ({inflationRate}%)
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#c4b5fd',
                  fontFamily: 'monospace',
                  marginTop: '4px',
                }}
              >
                {formatMoney(results.realValue, currency)}
              </div>
            </div>
          </div>

          {/* Visual Growth Progress Bars */}
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
                          width: '110px',
                          textAlign: 'right',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-main)',
                          fontWeight: 600,
                        }}
                      >
                        {formatMoney(row.balance, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Year-by-Year Growth Table */}
          {results.schedule.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span style={{ color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 700 }}>
                  {tUI('yearByYearGrowth')}
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>{tUI('downloadCsv')}</span>
                </button>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.82rem',
                      textAlign: 'right',
                    }}
                  >
                    <thead
                      style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        zIndex: 1,
                      }}
                    >
                      <tr
                        style={{ color: '#93c5fd', borderBottom: '1px solid var(--border-color)' }}
                      >
                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{tUI('year')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('annualDeposit')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('contributed')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('interestEarned')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('balance')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.schedule.map((r) => (
                        <tr
                          key={r.year}
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                        >
                          <td
                            style={{
                              padding: '8px 12px',
                              textAlign: 'left',
                              color: '#60a5fa',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                            }}
                          >
                            Y{r.year}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: 'var(--text-muted)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(r.depositThisYear, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: 'var(--text-main)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(r.contributed, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: '#34d399',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(r.interest, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: '#60a5fa',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(r.balance, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <code style={{ fontSize: '0.82rem', color: 'var(--text-main)', display: 'block' }}>
              A = P(1 + r/n)<sup>nt</sup> + PMT × [((1 + r/n)<sup>nt</sup> - 1) / (r/n)]
            </code>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              P={formatMoney(parseFloat(principal) || 0, currency)}, r={rate}%, n={frequency}, t=
              {years} {tUI('yearsWord')}
            </div>
          </div>

          {/* Action Button: Copy Summary */}
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
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? tUI('copied') : tUI('copyResult')}</span>
          </button>
        </div>

        {/* Clean Comparison Table */}
        <div
          style={{
            marginTop: 'var(--space-8)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            overflowX: 'auto',
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {tUI('compareTitle')}
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.86rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 700 }}>
                  {tUI('compareColFeature')}
                </th>
                <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>VelnoxLabs</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Bank Sites (SBI / HDFC)
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Basic Spreadsheets
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow1Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow1Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow1Bank')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow1Excel')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow2Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow2Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow2Bank')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow2Excel')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow3Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow3Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow3Bank')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow3Excel')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow4Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow4Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow4Bank')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow4Excel')}
                </td>
              </tr>
            </tbody>
          </table>
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
