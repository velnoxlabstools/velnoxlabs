'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Home,
  Car,
  UserCheck,
  GraduationCap,
  Download,
  Copy,
  Check,
  TrendingDown,
} from 'lucide-react';

type LoanType = 'home' | 'car' | 'personal' | 'education';
type TenureUnit = 'years' | 'months';
type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
type PrepayMode = 'monthly' | 'yearly';

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  USD: { symbol: '$', locale: 'en-US' },
  INR: { symbol: '₹', locale: 'en-IN' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
};

function formatMoney(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  return `${config.symbol}${amount.toLocaleString(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatMoneyDec(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  return `${config.symbol}${amount.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface LoanPreset {
  defaultAmountUSD: number;
  defaultAmountINR: number;
  defaultRate: number;
  defaultTenureYears: number;
}

const LOAN_PRESETS: Record<LoanType, LoanPreset> = {
  home: {
    defaultAmountUSD: 250000,
    defaultAmountINR: 3500000,
    defaultRate: 8.5,
    defaultTenureYears: 20,
  },
  car: {
    defaultAmountUSD: 35000,
    defaultAmountINR: 800000,
    defaultRate: 8.9,
    defaultTenureYears: 5,
  },
  personal: {
    defaultAmountUSD: 15000,
    defaultAmountINR: 300000,
    defaultRate: 11.5,
    defaultTenureYears: 3,
  },
  education: {
    defaultAmountUSD: 40000,
    defaultAmountINR: 1000000,
    defaultRate: 9.5,
    defaultTenureYears: 7,
  },
};

export default function LoanEmiCalculatorPage() {
  const tUI = useTranslations('ToolUI.loanEmiCalculator');

  // Controls & Settings
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [loanAmount, setLoanAmount] = useState('250000');
  const [rate, setRate] = useState('8.5');
  const [tenureValue, setTenureValue] = useState('20');
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');

  // Prepayment Simulation
  const [prepayEnabled, setPrepayEnabled] = useState(false);
  const [prepayMode, setPrepayMode] = useState<PrepayMode>('monthly');
  const [prepayAmount, setPrepayAmount] = useState('200');

  const [copied, setCopied] = useState(false);

  // Switch Loan Preset
  const handleSelectLoanType = (type: LoanType) => {
    setLoanType(type);
    const p = LOAN_PRESETS[type];
    const newAmount = currency === 'INR' ? p.defaultAmountINR : p.defaultAmountUSD;
    setLoanAmount(String(newAmount));
    setRate(String(p.defaultRate));
    setTenureValue(
      tenureUnit === 'years' ? String(p.defaultTenureYears) : String(p.defaultTenureYears * 12)
    );
  };

  // Switch Currency
  const handleSelectCurrency = (curr: CurrencyCode) => {
    setCurrency(curr);
    const p = LOAN_PRESETS[loanType];
    const newAmount = curr === 'INR' ? p.defaultAmountINR : p.defaultAmountUSD;
    setLoanAmount(String(newAmount));
    setPrepayAmount(curr === 'INR' ? '5000' : '200');
  };

  // Calculation Results
  const calcResults = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const r = annualRate > 0 ? annualRate / 100 / 12 : 0;

    const rawTenure = parseFloat(tenureValue) || 0;
    const totalMonths = Math.max(
      1,
      Math.round(tenureUnit === 'years' ? rawTenure * 12 : rawTenure)
    );

    if (P <= 0 || totalMonths <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        payoffDate: '',
        schedule: [],
        savedInterest: 0,
        monthsSaved: 0,
        actualMonths: 0,
      };
    }

    // Standard Monthly Payment (EMI)
    let baseMonthlyPayment = 0;
    if (r === 0) {
      baseMonthlyPayment = P / totalMonths;
    } else {
      baseMonthlyPayment =
        (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    }

    const standardTotalPayment = baseMonthlyPayment * totalMonths;
    const standardTotalInterest = standardTotalPayment - P;

    // Prepayment simulation & Amortization
    const extraVal = prepayEnabled ? Math.max(0, parseFloat(prepayAmount) || 0) : 0;
    let balance = P;
    let actualMonths = 0;
    let cumulativeInterest = 0;
    let cumulativePayment = 0;

    const yearlySchedule: {
      year: number;
      principal: number;
      interest: number;
      totalPaid: number;
      balance: number;
    }[] = [];

    let currentYearPrincipal = 0;
    let currentYearInterest = 0;
    let currentYearPayment = 0;

    for (let m = 1; m <= totalMonths && balance > 0.01; m++) {
      actualMonths = m;
      const interestPayment = balance * r;
      cumulativeInterest += interestPayment;

      const regularPrincipal = Math.min(balance, baseMonthlyPayment - interestPayment);
      let extraPrincipal = 0;

      if (extraVal > 0) {
        if (prepayMode === 'monthly') {
          extraPrincipal = Math.min(balance - regularPrincipal, extraVal);
        } else if (prepayMode === 'yearly' && m % 12 === 0) {
          extraPrincipal = Math.min(balance - regularPrincipal, extraVal);
        }
      }

      const totalPrincipalPaid = regularPrincipal + extraPrincipal;
      const totalMonthPaid = interestPayment + totalPrincipalPaid;

      balance = Math.max(0, balance - totalPrincipalPaid);
      cumulativePayment += totalMonthPaid;

      currentYearPrincipal += totalPrincipalPaid;
      currentYearInterest += interestPayment;
      currentYearPayment += totalMonthPaid;

      if (m % 12 === 0 || balance <= 0.01 || m === totalMonths) {
        yearlySchedule.push({
          year: Math.ceil(m / 12),
          principal: currentYearPrincipal,
          interest: currentYearInterest,
          totalPaid: currentYearPayment,
          balance: Math.max(0, balance),
        });
        currentYearPrincipal = 0;
        currentYearInterest = 0;
        currentYearPayment = 0;
      }
    }

    const savedInterest = Math.max(0, standardTotalInterest - cumulativeInterest);
    const monthsSaved = Math.max(0, totalMonths - actualMonths);

    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + actualMonths);
    const payoffDate = payoff.toLocaleDateString(CURRENCY_CONFIG[currency].locale, {
      month: 'long',
      year: 'numeric',
    });

    return {
      monthlyPayment: baseMonthlyPayment,
      totalPayment: cumulativePayment,
      totalInterest: cumulativeInterest,
      payoffDate,
      schedule: yearlySchedule,
      savedInterest,
      monthsSaved,
      actualMonths,
    };
  }, [
    loanAmount,
    rate,
    tenureValue,
    tenureUnit,
    prepayEnabled,
    prepayMode,
    prepayAmount,
    currency,
  ]);

  // Copy loan breakdown handler
  const handleCopy = () => {
    const text = `--- ${tUI('title')} ---
${tUI('loanTypeLabel')}: ${tUI(loanType)}
${tUI('loanAmount')}: ${formatMoney(parseFloat(loanAmount) || 0, currency)}
${tUI('annualInterestRate')}: ${rate}% APR
${tUI('loanTerm')}: ${tenureValue} ${tenureUnit}

${tUI('monthlyPayment')}: ${formatMoneyDec(calcResults.monthlyPayment, currency)}
${tUI('totalInterest')}: ${formatMoney(calcResults.totalInterest, currency)}
${tUI('totalPaid')}: ${formatMoney(calcResults.totalPayment, currency)}
${tUI('payoffBy', { date: calcResults.payoffDate })}
${
  prepayEnabled && calcResults.savedInterest > 0
    ? `\n${tUI('prepaymentSavingsNotice', {
        savedInterest: formatMoney(calcResults.savedInterest, currency),
        months: calcResults.monthsSaved,
      })}`
    : ''
}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Amortization Schedule as CSV
  const handleDownloadCsv = () => {
    if (calcResults.schedule.length === 0) return;
    const header = ['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Remaining Balance'];
    const rows = calcResults.schedule.map((r) => [
      r.year,
      r.principal.toFixed(2),
      r.interest.toFixed(2),
      r.totalPaid.toFixed(2),
      r.balance.toFixed(2),
    ]);
    const csvContent = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization-schedule-${loanType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loanTypesList: { id: LoanType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: tUI('homeLoan'), icon: <Home size={16} /> },
    { id: 'car', label: tUI('carLoan'), icon: <Car size={16} /> },
    { id: 'personal', label: tUI('personalLoan'), icon: <UserCheck size={16} /> },
    { id: 'education', label: tUI('educationLoan'), icon: <GraduationCap size={16} /> },
  ];

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Loan Category Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            {loanTypesList.map((item) => {
              const active = loanType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectLoanType(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: active ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: active ? '#60a5fa' : 'var(--text-main)',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Container */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '24px',
            }}
          >
            {/* Top Toolbar: Currency and Tenure Unit Switchers */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {/* Currency selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tUI('currencyLabel')}:
                </span>
                <select
                  value={currency}
                  onChange={(e) => handleSelectCurrency(e.target.value as CurrencyCode)}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              {/* Tenure Unit Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tUI('tenureFormatLabel')}:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['years', 'months'] as const).map((unit) => {
                    const active = tenureUnit === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          if (unit !== tenureUnit) {
                            const val = parseFloat(tenureValue) || 1;
                            setTenureUnit(unit);
                            setTenureValue(
                              unit === 'months'
                                ? String(Math.round(val * 12))
                                : String(Math.max(1, Math.round(val / 12)))
                            );
                          }
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                          backgroundColor: active ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                          color: active ? '#60a5fa' : 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI(unit)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inputs: Amount, Interest Rate, Tenure with Sliders */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              {/* Loan Amount */}
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
                    htmlFor="loan-amount-input"
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {tUI('loanAmount')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}
                    >
                      {CURRENCY_CONFIG[currency].symbol}
                    </span>
                    <input
                      id="loan-amount-input"
                      type="number"
                      value={loanAmount}
                      min="100"
                      step="500"
                      onChange={(e) => setLoanAmount(e.target.value)}
                      style={{
                        width: '140px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: '#60a5fa',
                        padding: '6px 8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 50000 : 1000}
                  max={currency === 'INR' ? 20000000 : 1500000}
                  step={currency === 'INR' ? 10000 : 1000}
                  value={parseFloat(loanAmount) || 0}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
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
                    htmlFor="interest-rate-input"
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {tUI('annualInterestRate')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      id="interest-rate-input"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="35"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      style={{
                        width: '90px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: '#34d399',
                        padding: '6px 8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={0.1}
                  value={parseFloat(rate) || 1}
                  onChange={(e) => setRate(e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>

              {/* Loan Tenure */}
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
                    htmlFor="loan-tenure-input"
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {tUI('loanTerm')} ({tenureUnit})
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      id="loan-tenure-input"
                      type="number"
                      min="1"
                      max={tenureUnit === 'years' ? 40 : 480}
                      value={tenureValue}
                      onChange={(e) => setTenureValue(e.target.value)}
                      style={{
                        width: '90px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: '#a855f7',
                        padding: '6px 8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      {tenureUnit}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={tenureUnit === 'years' ? 30 : 360}
                  step={1}
                  value={parseFloat(tenureValue) || 1}
                  onChange={(e) => setTenureValue(e.target.value)}
                  style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Optional Prepayment & Part-Payment Simulator */}
            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={prepayEnabled}
                    onChange={(e) => setPrepayEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ✨ {tUI('prepaymentOptionTitle')}
                  </span>
                </label>

                {prepayEnabled && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['monthly', 'yearly'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPrepayMode(m)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border:
                            prepayMode === m
                              ? '1px solid #10b981'
                              : '1px solid var(--border-color)',
                          backgroundColor:
                            prepayMode === m ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                          color: prepayMode === m ? '#34d399' : 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI(m === 'monthly' ? 'extraMonthly' : 'lumpSumYearly')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {prepayEnabled && (
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {tUI('prepaymentAmountLabel')}:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem' }}
                    >
                      {CURRENCY_CONFIG[currency].symbol}
                    </span>
                    <input
                      type="number"
                      value={prepayAmount}
                      min="1"
                      step="50"
                      onChange={(e) => setPrepayAmount(e.target.value)}
                      style={{
                        width: '120px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '6px 8px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Result Hero: Monthly Payment (EMI) */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  color: '#6ee7b7',
                  fontSize: '0.82rem',
                  fontWeight: 700,
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
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  marginBottom: '8px',
                  lineHeight: 1,
                }}
              >
                {formatMoneyDec(calcResults.monthlyPayment, currency)}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {tUI('payoffBy', { date: calcResults.payoffDate })}
              </div>
            </div>

            {/* Prepayment Savings Highlight Banner */}
            {prepayEnabled && calcResults.savedInterest > 0 && (
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <TrendingDown size={22} color="#60a5fa" />
                <div
                  style={{
                    flex: '1 1 240px',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: '#60a5fa' }}>{tUI('prepaymentSuccessTitle')}: </strong>
                  {tUI('prepaymentSavingsNotice', {
                    savedInterest: formatMoney(calcResults.savedInterest, currency),
                    months: calcResults.monthsSaved,
                  })}
                </div>
              </div>
            )}

            {/* Secondary Results Summary */}
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
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('totalPrincipal')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(parseFloat(loanAmount) || 0, currency)}
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
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('totalInterest')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(calcResults.totalInterest, currency)}
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
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('totalPaid')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(calcResults.totalPayment, currency)}
                </div>
              </div>
            </div>

            {/* Breakdown Progress Bar: Principal vs Interest */}
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
                  height: '18px',
                  borderRadius: '9px',
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
                    color: '#ffffff',
                  }}
                >
                  {calcResults.totalPayment > 0
                    ? Math.round(((parseFloat(loanAmount) || 0) / calcResults.totalPayment) * 100) +
                      '%'
                    : ''}
                </div>
                <div
                  style={{
                    flex: calcResults.totalInterest || 1,
                    backgroundColor: '#a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {calcResults.totalPayment > 0
                    ? Math.round((calcResults.totalInterest / calcResults.totalPayment) * 100) + '%'
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

            {/* Action Bar: Copy Summary + Download Amortization CSV */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: '1 1 180px',
                  backgroundColor: copied ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.15)',
                  color: copied ? '#34d399' : '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? tUI('copied') : tUI('copySummary')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                style={{
                  flex: '1 1 180px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download size={16} />
                <span>{tUI('downloadCsv')}</span>
              </button>
            </div>

            {/* Amortization Schedule Table */}
            {calcResults.schedule.length > 0 && (
              <div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
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
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.82rem',
                      textAlign: 'right',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#93c5fd',
                          borderBottom: '1px solid var(--border-color)',
                        }}
                      >
                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{tUI('year')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('principal')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('interest')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('totalPaid')}</th>
                        <th style={{ padding: '10px 12px' }}>{tUI('balance')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcResults.schedule.map((row) => (
                        <tr
                          key={row.year}
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
                            {row.year}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: '#93c5fd',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(row.principal, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: '#c4b5fd',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(row.interest, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: '#fcd34d',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(row.totalPaid, currency)}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              color: 'var(--text-main)',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(row.balance, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                    Bank Portals (SBI / HDFC)
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

          {/* Centralized SEO & Structured Content */}
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
