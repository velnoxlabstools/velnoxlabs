'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Calculator,
  Percent,
  Clock,
  Scale,
  Copy,
  Check,
  Briefcase,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

type TabMode = 'converter' | 'afterTax' | 'overtime' | 'compare' | 'freelance';
type PeriodType = 'annual' | 'monthly' | 'semiMonthly' | 'biweekly' | 'weekly' | 'daily' | 'hourly';
type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

const REFERENCE_SALARIES = [
  30000, 40000, 50000, 52000, 55000, 60000, 75000, 85000, 100000, 120000, 150000,
];

function formatMoney(amount: number, currency: CurrencyType): string {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${sym}${amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLpaNotation(amount: number, currency: CurrencyType): string {
  if (currency === 'INR') {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} LPA`;
    }
    return `₹${Math.round(amount)}`;
  }
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  if (amount >= 1000000) {
    return `${sym}${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${sym}${(amount / 1000).toFixed(0)}k`;
  }
  return `${sym}${Math.round(amount)}`;
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

  // PTO / Vacation adjustments
  const [adjustPto, setAdjustPto] = useState(false);
  const [ptoDays, setPtoDays] = useState('15');
  const [paidHolidays, setPaidHolidays] = useState('10');
  const [unpaidDays, setUnpaidDays] = useState('0');

  // ================= TAB 1: CONVERTER =================
  const [inputPeriod, setInputPeriod] = useState<PeriodType>('annual');
  const [inputAmount, setInputAmount] = useState('60000');
  const [copiedBreakdown, setCopiedBreakdown] = useState(false);

  // Derived base annual earnings and PTO adjusted hours
  const {
    annual,
    monthly,
    semiMonthly,
    biweekly,
    weekly,
    daily,
    hourly,
    effectiveHourlyWithPto,
    totalAnnualHours,
    actualWorkedHours,
    ptoHoursTotal,
  } = useMemo(() => {
    const hpw = Math.max(1, parseFloat(hoursPerWeek) || 40);
    const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);
    const hoursPerDay = hpw / 5;
    const totalStandardH = hpw * wpy;
    const val = Math.max(0, parseFloat(inputAmount) || 0);

    let baseAnnual = 0;
    if (inputPeriod === 'annual') baseAnnual = val;
    else if (inputPeriod === 'monthly') baseAnnual = val * 12;
    else if (inputPeriod === 'semiMonthly') baseAnnual = val * 24;
    else if (inputPeriod === 'biweekly') baseAnnual = val * (wpy / 2);
    else if (inputPeriod === 'weekly') baseAnnual = val * wpy;
    else if (inputPeriod === 'daily') baseAnnual = (val / hoursPerDay) * totalStandardH;
    else if (inputPeriod === 'hourly') baseAnnual = val * totalStandardH;

    const baseHourly = totalStandardH > 0 ? baseAnnual / totalStandardH : 0;

    // PTO Calculations
    const pDays = Math.max(0, parseFloat(ptoDays) || 0);
    const hDays = Math.max(0, parseFloat(paidHolidays) || 0);
    const uDays = Math.max(0, parseFloat(unpaidDays) || 0);
    const totalOffDays = pDays + hDays + uDays;
    const ptoHours = totalOffDays * hoursPerDay;
    const workedHours = Math.max(100, totalStandardH - ptoHours);
    const effHourly = workedHours > 0 ? baseAnnual / workedHours : baseHourly;

    return {
      annual: baseAnnual,
      monthly: baseAnnual / 12,
      semiMonthly: baseAnnual / 24,
      biweekly: (baseAnnual / wpy) * 2,
      weekly: baseAnnual / wpy,
      daily: baseHourly * hoursPerDay,
      hourly: baseHourly,
      effectiveHourlyWithPto: effHourly,
      totalAnnualHours: totalStandardH,
      actualWorkedHours: workedHours,
      ptoHoursTotal: ptoHours,
    };
  }, [inputPeriod, inputAmount, hoursPerWeek, weeksPerYear, ptoDays, paidHolidays, unpaidDays]);

  // Copy full breakdown handler
  const handleCopyBreakdown = () => {
    const text = `--- ${tUI('title')} ---
${tUI('annual')}: ${formatMoney(annual, currency)} (${formatLpaNotation(annual, currency)})
${tUI('monthly')}: ${formatMoney(monthly, currency)}
${tUI('semiMonthly')}: ${formatMoney(semiMonthly, currency)}
${tUI('biweekly')}: ${formatMoney(biweekly, currency)}
${tUI('weekly')}: ${formatMoney(weekly, currency)}
${tUI('daily')}: ${formatMoney(daily, currency)}
${tUI('hourly')}: ${formatMoney(hourly, currency)}/hr
${adjustPto ? `Effective Hourly (Adjusted for ${ptoDays}d PTO & ${paidHolidays}d Holidays): ${formatMoney(effectiveHourlyWithPto, currency)}/hr` : ''}

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
  const applyPreset = (amount: number, period: PeriodType = 'annual') => {
    setInputPeriod(period);
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
      netPercent: 100 - taxRate,
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

    const totalHoursA = hrsA * wpy;
    const totalHoursB = hrsB * wpy;
    const effectiveA = totalHoursA > 0 ? salA / totalHoursA : 0;
    const effectiveB = totalHoursB > 0 ? salB / totalHoursB : 0;

    const hoursSavedPerYear = Math.abs(totalHoursA - totalHoursB);

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
      hoursSavedPerYear,
    };
  }, [offerASalary, offerAHours, offerBSalary, offerBHours, weeksPerYear, tUI]);

  // ================= TAB 5: AI FREELANCER / 1099 ADVISOR =================
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState('30');
  const [overheadMultiplier, setOverheadMultiplier] = useState('1.4'); // 1.4x for taxes, healthcare, non-billable time

  const freelanceCalc = useMemo(() => {
    const bHpw = Math.max(1, parseFloat(billableHoursPerWeek) || 30);
    const mult = Math.max(1.1, parseFloat(overheadMultiplier) || 1.4);
    const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);

    // Billable hours per year (accounting for 3-4 weeks off)
    const annualBillableHours = bHpw * (wpy - 4);
    const minFreelanceRate = annualBillableHours > 0 ? (annual * mult) / annualBillableHours : 0;

    return {
      recommendedRate: minFreelanceRate,
      annualBillableHours,
      dayRate: minFreelanceRate * 7.5,
    };
  }, [annual, billableHoursPerWeek, overheadMultiplier, weeksPerYear]);

  // Frequently Searched Instant Conversion Snippets
  const instantSalarySnippets = [
    { sal: 30000, label: '$30k/yr', hr: '$14.42/hr' },
    { sal: 50000, label: '$50,000/yr', hr: '$24.04/hr' },
    { sal: 60000, label: '$60,000/yr', hr: '$28.85/hr' },
    { sal: 75000, label: '$75k/yr', hr: '$36.06/hr' },
    { sal: 80000, label: '$80k/yr', hr: '$38.46/hr' },
    { sal: 100000, label: '$100,000/yr', hr: '$48.08/hr' },
    { sal: 120000, label: '$120k/yr', hr: '$57.69/hr' },
  ];

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
              {
                id: 'freelance',
                label: tUI('tabFreelance') || 'AI Freelance Rate',
                icon: Briefcase,
              },
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
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
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
                borderRadius: '10px',
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
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹ India)</option>
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
                    fontWeight: 700,
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
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {/* PTO / Vacation Adjuster Toggle */}
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
                  {tUI('ptoToggleLabel') || 'PTO & Vacation'}
                </label>
                <button
                  type="button"
                  onClick={() => setAdjustPto((p) => !p)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: adjustPto ? '1px solid #10b981' : '1px solid var(--border-color)',
                    backgroundColor: adjustPto ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    color: adjustPto ? '#34d399' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Calendar size={13} />
                  <span>{adjustPto ? 'PTO Included' : 'Standard (52 Wks)'}</span>
                </button>
              </div>
            </div>

            {/* PTO Settings Bar (When Active) */}
            {adjustPto && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Paid Vacation (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={ptoDays}
                    onChange={(e) => setPtoDays(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Paid Holidays (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={paidHolidays}
                    onChange={(e) => setPaidHolidays(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    Unpaid Leave (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={unpaidDays}
                    onChange={(e) => setUnpaidDays(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Actual Worked Hours:
                  </span>
                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: '#34d399',
                      fontFamily: 'monospace',
                    }}
                  >
                    {actualWorkedHours.toFixed(0)} hrs ({ptoHoursTotal.toFixed(0)} hrs paid leave)
                  </span>
                </div>
              </div>
            )}

            {/* ================= TAB 1: CONVERTER ================= */}
            {activeTab === 'converter' && (
              <div>
                {/* Popular Salary Presets */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
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
                    {currency === 'INR'
                      ? [
                          { label: '₹3 LPA', amount: 300000 },
                          { label: '₹6 LPA', amount: 600000 },
                          { label: '₹10 LPA', amount: 1000000 },
                          { label: '₹15 LPA', amount: 1500000 },
                          { label: '₹25 LPA', amount: 2500000 },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applyPreset(p.amount, 'annual')}
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
                            {p.label}
                          </button>
                        ))
                      : instantSalarySnippets.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => applyPreset(p.sal, 'annual')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              backgroundColor:
                                inputPeriod === 'annual' && inputAmount === String(p.sal)
                                  ? 'rgba(59, 130, 246, 0.2)'
                                  : 'var(--bg-page)',
                              border:
                                inputPeriod === 'annual' && inputAmount === String(p.sal)
                                  ? '1px solid #3b82f6'
                                  : '1px solid var(--border-color)',
                              color:
                                inputPeriod === 'annual' && inputAmount === String(p.sal)
                                  ? '#60a5fa'
                                  : 'var(--text-main)',
                              cursor: 'pointer',
                            }}
                          >
                            {p.label} ({p.hr})
                          </button>
                        ))}
                  </div>

                  {/* Hourly-to-Salary Reverse Presets */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      {tUI('hourlyPresetsLabel')}:
                    </span>
                    {[20, 25, 30, 40, 50, 75].map((hr) => (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => applyPreset(hr, 'hourly')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor:
                            inputPeriod === 'hourly' && inputAmount === String(hr)
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'var(--bg-page)',
                          border:
                            inputPeriod === 'hourly' && inputAmount === String(hr)
                              ? '1px solid #10b981'
                              : '1px solid var(--border-color)',
                          color:
                            inputPeriod === 'hourly' && inputAmount === String(hr)
                              ? '#34d399'
                              : 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {CURRENCY_SYMBOLS[currency]}
                        {hr}/hr
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
                      <option value="semiMonthly">{tUI('periodSemiMonthly')}</option>
                      <option value="biweekly">{tUI('periodBiweekly')}</option>
                      <option value="weekly">{tUI('periodWeekly')}</option>
                      <option value="daily">{tUI('periodDaily')}</option>
                      <option value="hourly">{tUI('periodHourly')}</option>
                    </select>
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <label
                        style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        {tUI('amountLabel')}
                      </label>
                      <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700 }}>
                        {formatLpaNotation(parseFloat(inputAmount) || 0, currency)}
                      </span>
                    </div>
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

                {/* Hero Equivalent Hourly Rate Badge */}
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span
                      style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}
                    >
                      Effective Base Hourly Wage:
                    </span>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        marginTop: '2px',
                      }}
                    >
                      {formatMoney(hourly, currency)}
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/hour</span>
                    </div>
                  </div>

                  {adjustPto && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                        Adjusted for PTO ({actualWorkedHours.toFixed(0)} hrs worked):
                      </span>
                      <div
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: '#34d399',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(effectiveHourlyWithPto, currency)}/hr
                      </div>
                    </div>
                  )}
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
                      type="button"
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
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
                      {
                        label: tUI('semiMonthly'),
                        val: semiMonthly,
                        highlight: inputPeriod === 'semiMonthly',
                      },
                      { label: tUI('monthly'), val: monthly, highlight: inputPeriod === 'monthly' },
                      { label: tUI('annual'), val: annual, highlight: inputPeriod === 'annual' },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          backgroundColor: row.highlight
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'var(--bg-page)',
                          border: row.highlight
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                          borderRadius: '10px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            fontWeight: 600,
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

                {/* Instant Calculation Formulas Card */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(139, 92, 246, 0.07)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 700 }}>
                      Bi-Weekly to Hourly:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        marginTop: '2px',
                      }}
                    >
                      Rate = Bi-Weekly ÷ {parseFloat(hoursPerWeek) * 2} hrs
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 700 }}>
                      Weekly to Hourly:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        marginTop: '2px',
                      }}
                    >
                      Rate = Weekly Pay ÷ {hoursPerWeek} hrs
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#a78bfa', fontWeight: 700 }}>
                      Monthly to Hourly:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        marginTop: '2px',
                      }}
                    >
                      Rate = (Monthly × 12) ÷ {totalAnnualHours} hrs
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: AFTER-TAX ESTIMATOR ================= */}
            {activeTab === 'afterTax' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {tUI('taxRateLabel')} {taxRate}%
                    </label>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                      Take-Home: {afterTaxSchedule.netPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      accentColor: '#10b981',
                    }}
                  />

                  {/* Visual Paycheck Distribution Bar */}
                  <div
                    style={{
                      height: '14px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      display: 'flex',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: `${afterTaxSchedule.netPercent}%`,
                        backgroundColor: '#10b981',
                      }}
                    />
                    <div style={{ width: `${taxRate}%`, backgroundColor: '#ef4444' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[10, 15, 20, 25, 30, 35].map((rate) => (
                      <button
                        key={rate}
                        type="button"
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
                    borderRadius: '8px',
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                        gap: '6px',
                      }}
                    >
                      <label
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                      >
                        {tUI('regularRateLabel')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtBaseHourlyRate(hourly.toFixed(2))}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          color: '#60a5fa',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('syncHourlyBtn')}
                      </button>
                    </div>
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
                      {tUI('overtimeHoursLabel')} (1.5x)
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
                      {tUI('doubleTimeHoursLabel')} (2.0x)
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
                      {tUI('overtimePay')} (1.5x)
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
                      {tUI('doubleTimePay')} (2.0x)
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

                {/* Winner Comparison Verdict & Reclaimed Hours */}
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
                  <div
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
                  </div>
                  {compareResult.hoursSavedPerYear > 0 && (
                    <div
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}
                    >
                      Work time difference:{' '}
                      <strong>{compareResult.hoursSavedPerYear.toFixed(0)} hours/year</strong>{' '}
                      (nearly {(compareResult.hoursSavedPerYear / 40).toFixed(1)} full work weeks of
                      reclaimed life!).
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 5: AI FREELANCER / CONTRACTOR ADVISOR ================= */}
            {activeTab === 'freelance' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: '#a855f7' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      AI Freelance & 1099 Contractor Rate Advisor
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Convert your full-time salary into a profitable freelance billing rate
                    accounting for self-employment tax, unbilled admin hours, health insurance, and
                    unpaid vacations.
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Target Full-Time Annual Salary:
                    </label>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-page)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {formatMoney(annual, currency)}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Estimated Billable Hours/Week (e.g. 25-35):
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={billableHoursPerWeek}
                      onChange={(e) => setBillableHoursPerWeek(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 12px',
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
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      Overhead Multiplier (Taxes & Risk):
                    </label>
                    <select
                      value={overheadMultiplier}
                      onChange={(e) => setOverheadMultiplier(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      <option value="1.3">1.3x (Lean Remote Freelancer)</option>
                      <option value="1.4">1.4x (Standard Contractor / LLC)</option>
                      <option value="1.5">1.5x (Agency / Specialized Consultant)</option>
                    </select>
                  </div>
                </div>

                {/* Freelance Rate Verdict Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
                      Minimum Billable Hourly Rate:
                    </span>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#c084fc',
                        fontFamily: 'monospace',
                        marginTop: '4px',
                      }}
                    >
                      {formatMoney(freelanceCalc.recommendedRate, currency)}/hr
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                      Estimated Day Rate (7.5 hrs):
                    </span>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#34d399',
                        fontFamily: 'monospace',
                        marginTop: '4px',
                      }}
                    >
                      {formatMoney(freelanceCalc.dayRate, currency)}/day
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Zap
                    size={14}
                    style={{ display: 'inline', color: '#f59e0b', marginRight: '6px' }}
                  />
                  <strong>Why charge higher?</strong> Full-time employers cover Medicare, FICA,
                  healthcare benefits, and paid leaves. Freelancers typically spend 20-30% of work
                  hours on administrative tasks, client acquisition, and invoicing.
                </div>
              </div>
            )}
          </div>

          {/* Quick Reference Salary-to-Hourly Conversion Chart ($30k - $150k) */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              overflowX: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '6px',
              }}
            >
              {tUI('chartTitle')}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {tUI('chartSubtitle')}
            </p>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                textAlign: 'right',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th
                    style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-main)' }}
                  >
                    {tUI('annual')}
                  </th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>
                    {tUI('monthly')}
                  </th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>
                    {tUI('biweekly')}
                  </th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>
                    {tUI('weekly')}
                  </th>
                  <th style={{ padding: '10px 12px', color: '#34d399' }}>{tUI('hourly')}</th>
                </tr>
              </thead>
              <tbody>
                {REFERENCE_SALARIES.map((sal) => {
                  const hpw = Math.max(1, parseFloat(hoursPerWeek) || 40);
                  const wpy = Math.max(1, parseFloat(weeksPerYear) || 52);
                  const hr = sal / (hpw * wpy);
                  return (
                    <tr
                      key={sal}
                      onClick={() => {
                        applyPreset(sal, 'annual');
                        setActiveTab('converter');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 12px',
                          textAlign: 'left',
                          fontWeight: 700,
                          color: '#60a5fa',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(sal, currency)}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(sal / 12, currency)}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney((sal / wpy) * 2, currency)}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(sal / wpy, currency)}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontWeight: 700,
                          color: '#34d399',
                          fontFamily: 'monospace',
                        }}
                      >
                        {formatMoney(hr, currency)}/hr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clean Comparison Table */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
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
              {tUI('compareTableTitle')}
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
                    Talent.com
                  </th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ADP / CalculatorSoup
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
                    {tUI('compareRow1Talent')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Adp')}
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
                    {tUI('compareRow2Talent')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Adp')}
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
                    {tUI('compareRow3Talent')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Adp')}
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
                    {tUI('compareRow4Talent')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Adp')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

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
