'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  TrendingUp,
  Calculator,
  Download,
  Sparkles,
  Zap,
  ShieldCheck,
  Flame,
} from 'lucide-react';

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
type ContributionFreq = 'monthly' | 'annually';
type DurationUnit = 'years' | 'months' | 'days';
type ScheduleMode = 'yearly' | 'monthly';

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

function formatWordNotation(amount: number, currency: CurrencyCode): string {
  if (currency === 'INR') {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${Math.round(amount)}`;
  }
  const sym = CURRENCY_CONFIG[currency]?.symbol || '$';
  if (amount >= 1000000) {
    return `${sym}${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${sym}${(amount / 1000).toFixed(1)}K`;
  }
  return `${sym}${Math.round(amount)}`;
}

const FREQUENCIES = [
  { value: 1, key: 'annually' as const, label: 'Annually (1x/yr)' },
  { value: 2, key: 'semiannually' as const, label: 'Semi-Annually (2x/yr)' },
  { value: 4, key: 'quarterly' as const, label: 'Quarterly (4x/yr - SBI FD)' },
  { value: 12, key: 'monthly' as const, label: 'Monthly (12x/yr - SIP)' },
  { value: 365, key: 'daily' as const, label: 'Daily (365x/yr - Staking)' },
];

export default function CompoundInterestCalculatorPage() {
  const tUI = useTranslations('ToolUI.compoundInterestCalculator');

  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [principal, setPrincipal] = useState('100000');
  const [contribution, setContribution] = useState('5000');
  const [contributionFreq, setContributionFreq] = useState<ContributionFreq>('monthly');
  const [rate, setRate] = useState('12');
  const [durationValue, setDurationValue] = useState('10');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('years');
  const [frequency, setFrequency] = useState(12);
  const [stepUpPct, setStepUpPct] = useState('5');
  const [inflationRate, setInflationRate] = useState('6.0');
  const [applyLtcgTax, setApplyLtcgTax] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('yearly');
  const [copied, setCopied] = useState(false);

  // Time in years for continuous / periodic compounding
  const totalYears = useMemo(() => {
    const val = parseFloat(durationValue) || 1;
    if (durationUnit === 'days') return Math.max(1 / 365, val / 365);
    if (durationUnit === 'months') return Math.max(1 / 12, val / 12);
    return Math.max(0.1, Math.min(60, val));
  }, [durationValue, durationUnit]);

  // Math calculation engine
  const results = useMemo(() => {
    const P = Math.max(0, parseFloat(principal) || 0);
    const r = Math.max(0, parseFloat(rate) || 0) / 100;
    const n = frequency;
    const baseContr = Math.max(0, parseFloat(contribution) || 0);
    const stepUp = Math.max(0, parseFloat(stepUpPct) || 0) / 100;
    const infl = Math.max(0, parseFloat(inflationRate) || 0) / 100;

    let balance = P;
    let totalContributed = P;
    let currentAnnualContr = contributionFreq === 'monthly' ? baseContr * 12 : baseContr;

    // Determine total periods
    const isShortTerm = durationUnit === 'days';
    const totalDays = durationUnit === 'days' ? Math.max(1, parseInt(durationValue, 10) || 1) : 0;
    const totalMonthsCount =
      durationUnit === 'months'
        ? Math.max(1, parseInt(durationValue, 10) || 1)
        : Math.round(totalYears * 12);
    const totalYearsInt = Math.max(1, Math.ceil(totalYears));

    // Milestones tracking (in currency units)
    const milestoneTargets =
      currency === 'INR'
        ? [
            { target: 1000000, label: '₹10 Lakhs' },
            { target: 2500000, label: '₹25 Lakhs' },
            { target: 5000000, label: '₹50 Lakhs' },
            { target: 10000000, label: '₹1 Crore' },
            { target: 50000000, label: '₹5 Crores' },
          ]
        : [
            { target: 50000, label: '$50K' },
            { target: 100000, label: '$100K' },
            { target: 250000, label: '$250K' },
            { target: 500000, label: '$500K' },
            { target: 1000000, label: '$1M' },
          ];

    const reachedMilestones: { label: string; yearMonth: string }[] = [];
    const milestoneTracker = new Set<number>();

    // Detailed Monthly Amortization Schedule
    const monthlySchedule: {
      month: number;
      depositThisMonth: number;
      balance: number;
      interest: number;
      contributed: number;
    }[] = [];

    // Yearly Schedule
    const yearlySchedule: {
      year: number;
      depositThisYear: number;
      balance: number;
      interest: number;
      contributed: number;
    }[] = [];

    if (isShortTerm) {
      // Daily loop for short-term daily compounding
      const dailyRate = r / 365;
      for (let day = 1; day <= totalDays; day++) {
        balance = balance * (1 + dailyRate);
      }
      yearlySchedule.push({
        year: 1,
        depositThisYear: 0,
        balance,
        interest: Math.max(0, balance - totalContributed),
        contributed: totalContributed,
      });
    } else {
      // Month-by-month accurate progression
      for (let m = 1; m <= totalMonthsCount; m++) {
        // Compounding growth for 1 month
        balance = balance * Math.pow(1 + r / n, n / 12);

        // Contribution addition
        let addedThisMonth = 0;
        if (contributionFreq === 'monthly') {
          addedThisMonth = currentAnnualContr / 12;
          balance += addedThisMonth;
          totalContributed += addedThisMonth;
        } else if (m % 12 === 0) {
          addedThisMonth = currentAnnualContr;
          balance += addedThisMonth;
          totalContributed += addedThisMonth;
        }

        monthlySchedule.push({
          month: m,
          depositThisMonth: addedThisMonth,
          balance,
          interest: Math.max(0, balance - totalContributed),
          contributed: totalContributed,
        });

        // Milestone detection
        for (const ms of milestoneTargets) {
          if (!milestoneTracker.has(ms.target) && balance >= ms.target) {
            milestoneTracker.add(ms.target);
            const y = Math.floor(m / 12);
            const remM = m % 12;
            const timeStr = y > 0 ? `${y}y ${remM}m` : `${remM}m`;
            reachedMilestones.push({ label: ms.label, yearMonth: timeStr });
          }
        }

        // Year boundary
        if (m % 12 === 0 || m === totalMonthsCount) {
          const yr = Math.ceil(m / 12);
          const depositsInThisYear = monthlySchedule
            .slice(Math.max(0, m - 12), m)
            .reduce((acc, cur) => acc + cur.depositThisMonth, 0);

          yearlySchedule.push({
            year: yr,
            depositThisYear: depositsInThisYear,
            balance,
            interest: Math.max(0, balance - totalContributed),
            contributed: totalContributed,
          });

          // Annual Step-Up applied at end of each full year
          if (stepUp > 0 && m % 12 === 0) {
            currentAnnualContr = currentAnnualContr * (1 + stepUp);
          }
        }
      }
    }

    // Rule of 72 Doubling Time
    const doublingYears = r > 0 ? (72 / (r * 100)).toFixed(1) : '∞';

    // Inflation adjustment
    const realValue = infl > 0 ? balance / Math.pow(1 + infl, totalYears) : balance;

    // 12.5% LTCG Tax Estimation (Indian Finance Act 2024 for Mutual Funds)
    const grossProfit = Math.max(0, balance - totalContributed);
    const ltcgExemption = currency === 'INR' ? 125000 : 0;
    const taxableProfit = Math.max(0, grossProfit - ltcgExemption);
    const ltcgTax = taxableProfit * 0.125;
    const postTaxBalance = Math.max(totalContributed, balance - ltcgTax);

    return {
      finalAmount: balance,
      totalInterest: grossProfit,
      totalContributions: totalContributed,
      realValue,
      doublingYears,
      ltcgTax,
      postTaxBalance,
      reachedMilestones,
      yearlySchedule,
      monthlySchedule: monthlySchedule.slice(0, 60), // Up to 5 years monthly preview
      totalYearsInt,
    };
  }, [
    principal,
    rate,
    frequency,
    contribution,
    contributionFreq,
    stepUpPct,
    inflationRate,
    durationValue,
    durationUnit,
    totalYears,
    currency,
  ]);

  // Presets
  const applyPreset = (
    curr: CurrencyCode,
    p: string,
    r: string,
    dVal: string,
    dUnit: DurationUnit,
    freq: number,
    contr: string,
    cFreq: ContributionFreq,
    sUp: string,
    infl: string,
    tax: boolean
  ) => {
    setCurrency(curr);
    setPrincipal(p);
    setRate(r);
    setDurationValue(dVal);
    setDurationUnit(dUnit);
    setFrequency(freq);
    setContribution(contr);
    setContributionFreq(cFreq);
    setStepUpPct(sUp);
    setInflationRate(infl);
    setApplyLtcgTax(tax);
  };

  const handleCopy = () => {
    const freqObj = FREQUENCIES.find((f) => f.value === frequency);
    const text = `--- ${tUI('title')} ---
${tUI('initialPrincipal')}: ${formatMoney(parseFloat(principal) || 0, currency)} (${formatWordNotation(parseFloat(principal) || 0, currency)})
${tUI('annualRate')}: ${rate}% APR (${durationValue} ${durationUnit})
${tUI('compoundingFrequency')}: ${freqObj?.label || 'Monthly'}
${tUI('recurringContribution')}: ${formatMoney(parseFloat(contribution) || 0, currency)} (${contributionFreq})
${tUI('stepUpLabel')}: ${stepUpPct}%
${tUI('doublingTitle')}: ${results.doublingYears} ${tUI('yearsWord')} (Rule of 72)

${tUI('finalBalance')}: ${formatMoney(results.finalAmount, currency)} (${formatWordNotation(results.finalAmount, currency)})
${tUI('interestEarned')}: ${formatMoney(results.totalInterest, currency)}
${tUI('totalContributions')}: ${formatMoney(results.totalContributions, currency)}
${tUI('inflationAdjustedLabel')}: ${formatMoney(results.realValue, currency)}
${applyLtcgTax ? `Post-Tax Wealth (In-Hand): ${formatMoney(results.postTaxBalance, currency)} (LTCG Tax: ${formatMoney(results.ltcgTax, currency)})` : ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (scheduleMode === 'yearly' && results.yearlySchedule.length > 0) {
      const header = [
        'Year',
        'Annual Deposit',
        'Total Contributed',
        'Interest Earned',
        'Year-End Balance',
      ];
      const rows = results.yearlySchedule.map((r) => [
        r.year,
        r.depositThisYear.toFixed(2),
        r.contributed.toFixed(2),
        r.interest.toFixed(2),
        r.balance.toFixed(2),
      ]);
      const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compound-interest-yearly-${durationValue}${durationUnit}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (results.monthlySchedule.length > 0) {
      const header = [
        'Month',
        'Monthly Deposit',
        'Total Contributed',
        'Interest Earned',
        'Month-End Balance',
      ];
      const rows = results.monthlySchedule.map((r) => [
        r.month,
        r.depositThisMonth.toFixed(2),
        r.contributed.toFixed(2),
        r.interest.toFixed(2),
        r.balance.toFixed(2),
      ]);
      const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compound-interest-monthly-${durationValue}${durationUnit}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Donut chart calculations
  const totalWealth = results.finalAmount > 0 ? results.finalAmount : 1;
  const contribPct = Math.min(100, (results.totalContributions / totalWealth) * 100);
  const interestPct = Math.max(0, 100 - contribPct);
  const wealthMultiplier =
    results.totalContributions > 0
      ? (results.finalAmount / results.totalContributions).toFixed(1)
      : '1.0';

  // SVG Circumference for radius 65: 2 * PI * 65 = 408.4
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const contribOffset = (contribPct / 100) * circumference;
  const interestOffset = (interestPct / 100) * circumference;

  const presetsList = [
    {
      label: 'Mutual Fund SIP (12.5%)',
      badge: 'Popular',
      onClick: () =>
        applyPreset(
          'INR',
          '25000',
          '12.5',
          '15',
          'years',
          12,
          '10000',
          'monthly',
          '10',
          '6.0',
          true
        ),
    },
    {
      label: 'SBI Bank FD (7.0% Quarterly)',
      badge: 'Guaranteed',
      onClick: () =>
        applyPreset('INR', '200000', '7.0', '5', 'years', 4, '0', 'monthly', '0', '6.0', false),
    },
    {
      label: 'PPF Scheme (7.1% Annual)',
      badge: 'Tax Free',
      onClick: () =>
        applyPreset(
          'INR',
          '50000',
          '7.1',
          '15',
          'years',
          1,
          '150000',
          'annually',
          '0',
          '6.0',
          false
        ),
    },
    {
      label: 'Daily Staking (90 Days)',
      badge: 'Daily',
      onClick: () =>
        applyPreset('INR', '100000', '8.5', '90', 'days', 365, '0', 'monthly', '0', '6.0', false),
    },
    {
      label: 'Nifty 50 Index (13.5%)',
      badge: 'Equity',
      onClick: () =>
        applyPreset(
          'INR',
          '50000',
          '13.5',
          '20',
          'years',
          12,
          '15000',
          'monthly',
          '5',
          '6.0',
          true
        ),
    },
    {
      label: 'S&P 500 Index ($)',
      badge: 'Global',
      onClick: () =>
        applyPreset('USD', '5000', '10.0', '20', 'years', 12, '500', 'monthly', '5', '3.5', false),
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

        {/* 1-Click Strategy Presets Bar */}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{p.label}</span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.25)',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {p.badge}
                </span>
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
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '6px 10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none',
              }}
            >
              <option value="INR">INR (₹ India)</option>
              <option value="USD">USD ($ US)</option>
              <option value="EUR">EUR (€ Europe)</option>
              <option value="GBP">GBP (£ UK)</option>
              <option value="CAD">CAD (CA$ Canada)</option>
              <option value="AUD">AUD (A$ Australia)</option>
            </select>
          </div>
        </div>

        {/* Main Calculator Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Inputs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    {formatWordNotation(parseFloat(principal) || 0, currency)}
                  </span>
                </div>
              </div>
              <input
                id="principal-input"
                type="number"
                min="0"
                step="5000"
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
                      {cf === 'monthly' ? 'Monthly (SIP)' : 'Annually'}
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="contribution-input"
                type="number"
                min="0"
                step="500"
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

            {/* Annual Interest Rate */}
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

            {/* Flexible Investment Duration (Years, Months, Days) */}
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
                  htmlFor="duration-input"
                  style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                >
                  {tUI('tenureLabel') || 'Investment Period'}
                </label>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['years', 'months', 'days'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setDurationUnit(unit)}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border:
                          durationUnit === unit
                            ? '1px solid #a855f7'
                            : '1px solid var(--border-color)',
                        backgroundColor:
                          durationUnit === unit ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-page)',
                        color: durationUnit === unit ? '#c084fc' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="duration-input"
                type="number"
                min="1"
                max={durationUnit === 'days' ? 1825 : durationUnit === 'months' ? 600 : 50}
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
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
                max={durationUnit === 'days' ? 365 : durationUnit === 'months' ? 120 : 40}
                step={1}
                value={parseInt(durationValue, 10) || 1}
                onChange={(e) => setDurationValue(e.target.value)}
                style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Secondary Controls Bar: Frequency, Step-Up SIP, Inflation & Tax Toggle */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '14px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
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
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Step-Up SIP % */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('stepUpLabel')} ({stepUpPct}%/yr)
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
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Inflation Rate */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
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
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '8px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Indian Mutual Fund LTCG 12.5% Tax Toggle */}
            <div>
              <label
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('ltcgTaxToggle') || 'Mutual Fund LTCG (12.5%)'}
              </label>
              <button
                type="button"
                onClick={() => setApplyLtcgTax((t) => !t)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: applyLtcgTax ? '1px solid #10b981' : '1px solid var(--border-color)',
                  backgroundColor: applyLtcgTax ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                  color: applyLtcgTax ? '#34d399' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={14} />
                <span>{applyLtcgTax ? 'Tax Deducted (Net)' : 'Pre-Tax Wealth'}</span>
              </button>
            </div>
          </div>

          {/* Primary Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            {/* Final Balance */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('finalBalance')}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    color: '#34d399',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {formatWordNotation(results.finalAmount, currency)}
                </span>
              </div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#34d399',
                  fontFamily: 'monospace',
                  marginTop: '6px',
                }}
              >
                {formatMoney(results.finalAmount, currency)}
              </div>
              {applyLtcgTax && (
                <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '6px' }}>
                  Post-Tax In-Hand: <strong>{formatMoney(results.postTaxBalance, currency)}</strong>
                </div>
              )}
            </div>

            {/* Interest Earned */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('interestEarned')}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {interestPct.toFixed(1)}% of total
                </span>
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                  marginTop: '6px',
                }}
              >
                {formatMoney(results.totalInterest, currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {formatWordNotation(results.totalInterest, currency)}
              </div>
            </div>

            {/* Total Contributions */}
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('totalContributions')}
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {contribPct.toFixed(1)}% of total
                </span>
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  marginTop: '6px',
                }}
              >
                {formatMoney(results.totalContributions, currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {formatWordNotation(results.totalContributions, currency)}
              </div>
            </div>

            {/* Purchasing Power (Inflation-Adjusted) */}
            <div
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.28)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: 600 }}>
                {tUI('inflationAdjustedLabel')} ({inflationRate}%)
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#c4b5fd',
                  fontFamily: 'monospace',
                  marginTop: '6px',
                }}
              >
                {formatMoney(results.realValue, currency)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginTop: '6px' }}>
                Real Purchasing Power in Today&apos;s Money
              </div>
            </div>
          </div>

          {/* Interactive Visual Donut Chart & Wealth Multiplier */}
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '22px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '20px',
            }}
          >
            {/* SVG Donut Ring */}
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg
                width="150"
                height="150"
                viewBox="0 0 160 160"
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="18"
                />
                {/* Total Contributed Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="18"
                  strokeDasharray={`${contribOffset} ${circumference}`}
                  strokeLinecap="round"
                />
                {/* Interest Earned Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${interestOffset} ${circumference}`}
                  strokeDashoffset={-contribOffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Multiplier Text */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#34d399',
                    fontFamily: 'monospace',
                  }}
                >
                  {wealthMultiplier}x
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Wealth Growth
                </span>
              </div>
            </div>

            {/* Donut Legend & Stats */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      backgroundColor: '#3b82f6',
                    }}
                  />
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {tUI('totalContributions')}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatMoney(results.totalContributions, currency)}
                  </span>
                  <span
                    style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}
                  >
                    ({contribPct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      backgroundColor: '#10b981',
                    }}
                  />
                  <span style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 600 }}>
                    {tUI('interestEarned')}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatMoney(results.totalInterest, currency)}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', marginLeft: '6px' }}>
                    ({interestPct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Rule of 72 Doubling Time Pill */}
              <div
                style={{
                  marginTop: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#f59e0b', fontWeight: 600 }}>
                  <strong>Rule of 72:</strong> Your money doubles every{' '}
                  <span style={{ textDecoration: 'underline' }}>{results.doublingYears} years</span>{' '}
                  at {rate}% APR.
                </span>
              </div>
            </div>
          </div>

          {/* AI Wealth Milestones Timeline */}
          {results.reachedMilestones.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.07)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#a78bfa',
                  marginBottom: '12px',
                }}
              >
                <Sparkles size={16} />
                <span>{tUI('milestoneTitle') || 'AI Wealth Milestone Timeline'}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {results.reachedMilestones.map((ms, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  >
                    <Flame size={14} style={{ color: '#f59e0b' }} />
                    <div>
                      <div
                        style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        {ms.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                        Reached in {ms.yearMonth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth Table & Mode Toggle */}
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              {/* Yearly vs Monthly Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-main)', fontSize: '0.92rem', fontWeight: 700 }}>
                  <TrendingUp
                    size={15}
                    style={{ display: 'inline', marginRight: '6px', color: '#60a5fa' }}
                  />
                  {scheduleMode === 'yearly'
                    ? tUI('yearByYearGrowth')
                    : 'Month-by-Month Amortization'}
                </span>
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '2px',
                    marginLeft: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setScheduleMode('yearly')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: scheduleMode === 'yearly' ? '#3b82f6' : 'transparent',
                      color: scheduleMode === 'yearly' ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode('monthly')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: scheduleMode === 'monthly' ? '#3b82f6' : 'transparent',
                      color: scheduleMode === 'monthly' ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    Monthly (SIP)
                  </button>
                </div>
              </div>

              {/* Download CSV */}
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

            {/* Growth Table */}
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
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
                      backgroundColor: 'rgba(59, 130, 246, 0.14)',
                      zIndex: 1,
                    }}
                  >
                    <tr style={{ color: '#93c5fd', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>
                        {scheduleMode === 'yearly' ? tUI('year') : 'Month'}
                      </th>
                      <th style={{ padding: '10px 12px' }}>
                        {scheduleMode === 'yearly' ? tUI('annualDeposit') : 'Monthly Deposit'}
                      </th>
                      <th style={{ padding: '10px 12px' }}>{tUI('contributed')}</th>
                      <th style={{ padding: '10px 12px' }}>{tUI('interestEarned')}</th>
                      <th style={{ padding: '10px 12px' }}>{tUI('balance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleMode === 'yearly'
                      ? results.yearlySchedule.map((r) => (
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
                              Year {r.year}
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
                        ))
                      : results.monthlySchedule.map((m) => (
                          <tr
                            key={m.month}
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
                              Month {m.month}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {formatMoney(m.depositThisMonth, currency)}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                color: 'var(--text-main)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {formatMoney(m.contributed, currency)}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                color: '#34d399',
                                fontFamily: 'monospace',
                              }}
                            >
                              {formatMoney(m.interest, currency)}
                            </td>
                            <td
                              style={{
                                padding: '8px 12px',
                                color: '#60a5fa',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                              }}
                            >
                              {formatMoney(m.balance, currency)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive Compound Interest Formula Deep Dive */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.07)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#a78bfa',
                marginBottom: '8px',
              }}
            >
              <Calculator size={15} />
              <span>{tUI('formulaTitle')}</span>
            </div>

            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                backgroundColor: 'var(--bg-page)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '8px',
                overflowX: 'auto',
              }}
            >
              A = P(1 + r/n)<sup>nt</sup> + PMT × [((1 + r/n)<sup>nt</sup> - 1) / (r/n)]
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
              }}
            >
              <div>
                <strong>P (Principal):</strong> {formatMoney(parseFloat(principal) || 0, currency)}
              </div>
              <div>
                <strong>r (Rate):</strong> {(parseFloat(rate) / 100).toFixed(4)} ({rate}%)
              </div>
              <div>
                <strong>n (Frequency):</strong> {frequency}x/yr
              </div>
              <div>
                <strong>t (Tenure):</strong> {totalYears.toFixed(2)} yrs
              </div>
              <div>
                <strong>PMT (Deposit):</strong>{' '}
                {formatMoney(parseFloat(contribution) || 0, currency)}
              </div>
            </div>
          </div>

          {/* Action Button: Copy Breakdown */}
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
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? tUI('copied') : tUI('copyResult')}</span>
          </button>
        </div>

        {/* Clean Comparison Table Section for Technical SEO */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
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
                <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>
                  VelnoxLabs AI
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Bank Sites (SBI / HDFC)
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Standard Spreadsheets
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feat: 'Compounding Intervals',
                  v: 'Daily, Monthly, Quarterly, Yearly',
                  b: 'Fixed Quarterly / Annual',
                  e: 'Manual Math Required',
                },
                {
                  feat: 'Step-Up SIP & Inflation Adjust',
                  v: 'Included (0-50% Step-Up + Real Value)',
                  b: 'Missing on most portals',
                  e: 'Complex formulas needed',
                },
                {
                  feat: 'AI Milestones & Rule of 72',
                  v: 'Automated (₹10L, ₹50L, ₹1Cr timeline)',
                  b: 'Not Available',
                  e: 'Not Available',
                },
                {
                  feat: 'Mutual Fund LTCG Tax Estimator',
                  v: 'Included (12.5% Section 112A)',
                  b: 'Gross pre-tax only',
                  e: 'Manual deduction required',
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {row.feat}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>{row.v}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.b}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{row.e}</td>
                </tr>
              ))}
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
