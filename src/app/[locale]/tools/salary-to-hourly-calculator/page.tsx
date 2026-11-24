'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Calculator, Percent, Clock, Scale, Copy, Check } from 'lucide-react';

type TabMode = 'converter' | 'afterTax' | 'overtime' | 'compare';
type PeriodType = 'annual' | 'monthly' | 'biweekly' | 'weekly' | 'daily' | 'hourly';
type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

function formatMoney(amount: number, currency: CurrencyType): string {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  return `${sym}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SalaryToHourlyCalculatorPage() {
  const tUI = useTranslations('ToolUI.salaryToHourlyCalculator');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabMode>('converter');

  // Currency
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  // Work hours settings
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');

  // ================= TAB 1: CONVERTER =================
  const [inputPeriod, setInputPeriod] = useState<PeriodType>('annual');
  const [inputAmount, setInputAmount] = useState('60000');
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);

  // Derived base annual earnings
  const { annual, monthly, biweekly, weekly, daily, hourly, totalAnnualHours } = useMemo(() => {
    const hpw = Math.max(1, parseFloat(hoursPerWeek) || 40);
    const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);
    const totalH = hpw * wpy;
    const val = Math.max(0, parseFloat(inputAmount) || 0);

    let baseAnnual = 0;
    if (inputPeriod === 'annual') baseAnnual = val;
    else if (inputPeriod === 'monthly') baseAnnual = val * 12;
    else if (inputPeriod === 'biweekly') baseAnnual = val * (wpy / 2);
    else if (inputPeriod === 'weekly') baseAnnual = val * wpy;
    else if (inputPeriod === 'daily') baseAnnual = (val / (hpw / 5)) * totalH;
    else if (inputPeriod === 'hourly') baseAnnual = val * totalH;

    const baseHourly = totalH > 0 ? baseAnnual / totalH : 0;

    return {
      annual: baseAnnual,
      monthly: baseAnnual / 12,
      biweekly: (baseAnnual / wpy) * 2,
      weekly: baseAnnual / wpy,
      daily: baseHourly * (hpw / 5),
      hourly: baseHourly,
      totalAnnualHours: totalH,
    };
  }, [inputPeriod, inputAmount, hoursPerWeek, weeksPerYear]);

  // Copy full breakdown handler
  const handleCopyBreakdown = () => {
    const text = `--- ${tUI('title')} ---
${tUI('annual')}: ${formatMoney(annual, currency)}
${tUI('monthly')}: ${formatMoney(monthly, currency)}
${tUI('biweekly')}: ${formatMoney(biweekly, currency)}
${tUI('weekly')}: ${formatMoney(weekly, currency)}
${tUI('daily')}: ${formatMoney(daily, currency)}
${tUI('hourly')}: ${formatMoney(hourly, currency)}

${tUI('basedOnCalculation', {
  hpw: hoursPerWeek,
  wpy: weeksPerYear,
  total: totalAnnualHours.toLocaleString(),
})}`;
    navigator.clipboard.writeText(text);
    setCopiedBreakdown(true);
    setTimeout(() => setCopiedBreakdown(false), 2000);
  };

  // Quick preset apply
  const applyPreset = (amount: number) => {
    setInputPeriod('annual');
    setInputAmount(String(amount));
  };

  // ================= TAB 2: AFTER-TAX ESTIMATOR =================
  const [taxRate, setTaxRate] = useState<number>(20);

  const afterTaxSchedule = useMemo(() => {
    const rateFactor = Math.max(0, Math.min(100, taxRate)) / 100;
    const calcRow = (grossVal: number) => {
      const taxVal = grossVal * rateFactor;
      const netVal = grossVal - taxVal;
      return { gross: grossVal, tax: taxVal, net: netVal };
    };

    return {
      hourly: calcRow(hourly),
      weekly: calcRow(weekly),
      biweekly: calcRow(biweekly),
      monthly: calcRow(monthly),
      annual: calcRow(annual),
      totalAnnualDeduction: annual * rateFactor,
      monthlyDeduction: (annual * rateFactor) / 12,
    };
  }, [hourly, weekly, biweekly, monthly, annual, taxRate]);

  // ================= TAB 3: OVERTIME SIMULATOR =================
  const [otBaseHourlyRate, setOtBaseHourlyRate] = useState('28.85');
  const [otStandardHours, setOtStandardHours] = useState('40');
  const [otHours15x, setOtHours15x] = useState('5');
  const [otHours20x, setOtHours20x] = useState('0');

  const overtimeCalc = useMemo(() => {
    const baseRate = Math.max(0, parseFloat(otBaseHourlyRate) || 0);
    const stdH = Math.max(0, parseFloat(otStandardHours) || 0);
    const ot15H = Math.max(0, parseFloat(otHours15x) || 0);
    const ot20H = Math.max(0, parseFloat(otHours20x) || 0);
    const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);

    const regPayWeekly = baseRate * stdH;
    const ot15PayWeekly = baseRate * 1.5 * ot15H;
    const ot20PayWeekly = baseRate * 2.0 * ot20H;
    const totalWeekly = regPayWeekly + ot15PayWeekly + ot20PayWeekly;
    const totalAnnual = totalWeekly * wpy;

    return {
      regPayWeekly,
      ot15PayWeekly,
      ot20PayWeekly,
      totalWeekly,
      totalAnnual,
    };
  }, [otBaseHourlyRate, otStandardHours, otHours15x, otHours20x, weeksPerYear]);

  // ================= TAB 4: JOB OFFER COMPARATOR =================
  const [offerASalary, setOfferASalary] = useState('75000');
  const [offerAHours, setOfferAHours] = useState('45');
  const [offerBSalary, setOfferBSalary] = useState('65000');
  const [offerBHours, setOfferBHours] = useState('37.5');

  const compareResult = useMemo(() => {
    const salA = Math.max(0, parseFloat(offerASalary) || 0);
    const hrsA = Math.max(1, parseFloat(offerAHours) || 40);
    const salB = Math.max(0, parseFloat(offerBSalary) || 0);
    const hrsB = Math.max(1, parseFloat(offerBHours) || 40);
    const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);

    const effectiveA = salA / (hrsA * wpy);
    const effectiveB = salB / (hrsB * wpy);

    let winner = '';
    let diff = 0;
    let diffPercent = '0.0';

    if (Math.abs(effectiveA - effectiveB) < 0.01) {
      winner = 'equal';
    } else if (effectiveA > effectiveB) {
      winner = tUI('offerA');
      diff = effectiveA - effectiveB;
      diffPercent = ((diff / effectiveB) * 100).toFixed(1);
    } else {
      winner = tUI('offerB');
      diff = effectiveB - effectiveA;
      diffPercent = ((diff / effectiveA) * 100).toFixed(1);
    }

    return {
      effectiveA,
      effectiveB,
      winner,
      diff,
      diffPercent,
    };
  }, [offerASalary, offerAHours, offerBSalary, offerBHours, weeksPerYear, tUI]);

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            {[
              { id: 'converter', label: tUI('tabConverter'), icon: Calculator },
              { id: 'afterTax', label: tUI('tabAfterTax'), icon: Percent },
              { id: 'overtime', label: tUI('tabOvertime'), icon: Clock },
              { id: 'compare', label: tUI('tabCompare'), icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabMode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: isActive ? '#60a5fa' : 'var(--text-main)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Container */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            {/* Global Currency & Work Hours Config Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
                padding: '14px',
                backgroundColor: 'var(--bg-page)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {tUI('currencyLabel')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {tUI('hoursPerWeekLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {tUI('weeksPerYearLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={weeksPerYear}
                  onChange={(e) => setWeeksPerYear(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* ================= TAB 1: CONVERTER ================= */}
            {activeTab === 'converter' && (
              <div>
                {/* Popular Salary Presets */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tUI('quickPresets')}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'preset50k' as const, amount: 50000 },
                      { key: 'preset52k' as const, amount: 52000 },
                      { key: 'preset55k' as const, amount: 55000 },
                      { key: 'preset60k' as const, amount: 60000 },
                      { key: 'preset75k' as const, amount: 75000 },
                      { key: 'preset100k' as const, amount: 100000 },
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => applyPreset(p.amount)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor:
                            inputPeriod === 'annual' && inputAmount === String(p.amount)
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'var(--bg-page)',
                          border:
                            inputPeriod === 'annual' && inputAmount === String(p.amount)
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border-color)',
                          color:
                            inputPeriod === 'annual' && inputAmount === String(p.amount)
                              ? '#60a5fa'
                              : 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI(p.key)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Inputs: Period & Amount */}
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
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('inputPeriodLabel')}
                    </label>
                    <select
                      value={inputPeriod}
                      onChange={(e) => setInputPeriod(e.target.value as PeriodType)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      <option value="annual">{tUI('periodAnnual')}</option>
                      <option value="monthly">{tUI('periodMonthly')}</option>
                      <option value="biweekly">{tUI('periodBiweekly')}</option>
                      <option value="weekly">{tUI('periodWeekly')}</option>
                      <option value="daily">{tUI('periodDaily')}</option>
                      <option value="hourly">{tUI('periodHourly')}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('amountLabel')}
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '0 12px',
                      }}
                    >
                      <span
                        style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}
                      >
                        {CURRENCY_SYMBOLS[currency]}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-main)',
                          padding: '12px 8px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Equivalent Earnings Schedule Cards */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}
                    >
                      {tUI('resultsTitle')}
                    </span>
                    <button
                      onClick={handleCopyBreakdown}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: copiedBreakdown
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'var(--bg-page)',
                        color: copiedBreakdown ? '#34d399' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {copiedBreakdown ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedBreakdown ? tUI('copied') : tUI('copyBreakdown')}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    {[
                      { label: tUI('hourly'), val: hourly, highlight: inputPeriod === 'hourly' },
                      { label: tUI('daily'), val: daily, highlight: inputPeriod === 'daily' },
                      { label: tUI('weekly'), val: weekly, highlight: inputPeriod === 'weekly' },
                      {
                        label: tUI('biweekly'),
                        val: biweekly,
                        highlight: inputPeriod === 'biweekly',
                      },
                      { label: tUI('monthly'), val: monthly, highlight: inputPeriod === 'monthly' },
                      { label: tUI('annual'), val: annual, highlight: inputPeriod === 'annual' },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          backgroundColor: row.highlight
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'var(--bg-page)',
                          border: row.highlight
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                          }}
                        >
                          {row.label}
                        </div>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            color: row.highlight ? '#60a5fa' : '#34d399',
                            fontFamily: 'monospace',
                          }}
                        >
                          {formatMoney(row.val, currency)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}
                  >
                    {tUI('basedOnCalculation', {
                      hpw: hoursPerWeek,
                      wpy: weeksPerYear,
                      total: totalAnnualHours.toLocaleString(),
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: AFTER-TAX ESTIMATOR ================= */}
            {activeTab === 'afterTax' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('taxRateLabel')} {taxRate}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
                    style={{ width: '100%', cursor: 'pointer', marginBottom: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[10, 15, 20, 25, 30, 35].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setTaxRate(rate)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor:
                            taxRate === rate ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                          border:
                            taxRate === rate
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border-color)',
                          color: taxRate === rate ? '#60a5fa' : 'var(--text-main)',
                        }}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#60a5fa',
                    marginBottom: '18px',
                  }}
                >
                  ℹ️ {tUI('taxDisclaimer')}
                </div>

                {/* Table comparing Gross vs Net */}
                <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      fontSize: '0.85rem',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <th
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Period
                        </th>
                        <th
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {tUI('grossPay')}
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171' }}>
                          {tUI('estimatedTax')} ({taxRate}%)
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399' }}>
                          {tUI('netPay')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: tUI('hourly'), data: afterTaxSchedule.hourly },
                        { name: tUI('weekly'), data: afterTaxSchedule.weekly },
                        { name: tUI('biweekly'), data: afterTaxSchedule.biweekly },
                        { name: tUI('monthly'), data: afterTaxSchedule.monthly },
                        { name: tUI('annual'), data: afterTaxSchedule.annual },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td
                            style={{
                              padding: '10px 14px',
                              fontWeight: 600,
                              color: 'var(--text-main)',
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatMoney(row.data.gross, currency)}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                              color: '#f87171',
                            }}
                          >
                            -{formatMoney(row.data.tax, currency)}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#34d399',
                            }}
                          >
                            {formatMoney(row.data.net, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'center' }}
                >
                  {tUI('taxDeductionSummary', {
                    rate: taxRate,
                    deduction: formatMoney(afterTaxSchedule.totalAnnualDeduction, currency),
                    monthlyDeduction: formatMoney(afterTaxSchedule.monthlyDeduction, currency),
                  })}
                </div>
              </div>
            )}

            {/* ================= TAB 3: OVERTIME SIMULATOR ================= */}
            {activeTab === 'overtime' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('overtimeTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('overtimeSubtitle')}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '14px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('regularRateLabel')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={otBaseHourlyRate}
                      onChange={(e) => setOtBaseHourlyRate(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('standardHoursLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={otStandardHours}
                      onChange={(e) => setOtStandardHours(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('overtimeHoursLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={otHours15x}
                      onChange={(e) => setOtHours15x(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('doubleTimeHoursLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={otHours20x}
                      onChange={(e) => setOtHours20x(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Overtime Results Breakdown */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('regularPay')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatMoney(overtimeCalc.regPayWeekly, currency)} / wk
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#60a5fa', marginBottom: '4px' }}>
                      {tUI('overtimePay')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      +{formatMoney(overtimeCalc.ot15PayWeekly, currency)} / wk
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: '4px' }}>
                      {tUI('doubleTimePay')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#f59e0b',
                        fontFamily: 'monospace',
                      }}
                    >
                      +{formatMoney(overtimeCalc.ot20PayWeekly, currency)} / wk
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#34d399', marginBottom: '4px' }}>
                      {tUI('totalWeeklyWithOt')}
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#34d399',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatMoney(overtimeCalc.totalWeekly, currency)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {tUI('totalAnnualWithOt')}:
                  </span>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#34d399',
                      fontFamily: 'monospace',
                      marginTop: '4px',
                    }}
                  >
                    {formatMoney(overtimeCalc.totalAnnual, currency)} / year
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: JOB OFFER COMPARATOR ================= */}
            {activeTab === 'compare' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('compareTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('compareSubtitle')}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Offer A */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <h4 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '12px' }}>
                      {tUI('offerA')}
                    </h4>
                    <div style={{ marginBottom: '10px' }}>
                      <label
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('offerSalaryLabel')}
                      </label>
                      <input
                        type="number"
                        value={offerASalary}
                        onChange={(e) => setOfferASalary(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('offerHoursLabel')}
                      </label>
                      <input
                        type="number"
                        value={offerAHours}
                        onChange={(e) => setOfferAHours(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {tUI('effectiveHourly')}
                      </span>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: '#38bdf8',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(compareResult.effectiveA, currency)}/hr
                      </div>
                    </div>
                  </div>

                  {/* Offer B */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <h4 style={{ color: '#34d399', fontWeight: 700, marginBottom: '12px' }}>
                      {tUI('offerB')}
                    </h4>
                    <div style={{ marginBottom: '10px' }}>
                      <label
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('offerSalaryLabel')}
                      </label>
                      <input
                        type="number"
                        value={offerBSalary}
                        onChange={(e) => setOfferBSalary(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('offerHoursLabel')}
                      </label>
                      <input
                        type="number"
                        value={offerBHours}
                        onChange={(e) => setOfferBHours(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '8px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {tUI('effectiveHourly')}
                      </span>
                      <div
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: '#34d399',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(compareResult.effectiveB, currency)}/hr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winner Comparison Verdict */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor:
                      compareResult.winner === 'equal'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                    border:
                      compareResult.winner === 'equal'
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : '1px solid rgba(16, 185, 129, 0.4)',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: compareResult.winner === 'equal' ? '#60a5fa' : '#34d399',
                    }}
                  >
                    {compareResult.winner === 'equal'
                      ? tUI('equalOffers')
                      : tUI('winnerOffer', {
                          winner: compareResult.winner,
                          diff: formatMoney(compareResult.diff, currency),
                          diffPercent: compareResult.diffPercent,
                        })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Centralized SEO & Structured Schema - Zero Duplicate Inline JSON-LD */}
          <ToolSeoContent
            toolSlug="salary-to-hourly-calculator"
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
