'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/format';

type Mode = 'salaryToHourly' | 'hourlyToSalary';

export default function SalaryToHourlyCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.salaryToHourlyCalculator');
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
    return formatCurrencyUtil(n, locale);
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

  return (
    <>
<GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div className="p-6 md:p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] mt-6 shadow-sm">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode('salaryToHourly')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  mode === 'salaryToHourly'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-main)]'
                }`}
              >
                {tUI('modeSalaryToHourly')}
              </button>
              <button
                type="button"
                onClick={() => setMode('hourlyToSalary')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  mode === 'hourlyToSalary'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-[var(--bg-page)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-main)]'
                }`}
              >
                {tUI('modeHourlyToSalary')}
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {mode === 'salaryToHourly' ? (
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                    {tUI('annualSalaryLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono font-bold text-base pointer-events-none">
                      {getCurrencySymbol(locale)}
                    </span>
                    <input
                      type="number"
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(e.target.value)}
                      placeholder="60000"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-base font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                    {tUI('hourlyRateLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono font-bold text-base pointer-events-none">
                      {getCurrencySymbol(locale)}
                    </span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="28.85"
                      step="0.01"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-base font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  {tUI('hoursPerWeekLabel')}
                </label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="40"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-base font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                  {tUI('weeksPerYearLabel')}
                </label>
                <input
                  type="number"
                  value={weeksPerYear}
                  onChange={(e) => setWeeksPerYear(e.target.value)}
                  placeholder="52"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-base font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Main Result */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-8 text-center mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                {mode === 'salaryToHourly' ? tUI('yourHourlyRate') : tUI('yourAnnualSalary')}
              </div>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-[var(--text-main)] leading-none my-2">
                {mode === 'salaryToHourly'
                  ? formatCurrency(result.hourly)
                  : formatCurrency(result.annual)}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-2">
                {tUI('basedOnCalculation', {
                  hpw: hoursPerWeek,
                  wpy: weeksPerYear,
                  total: (
                    (parseFloat(hoursPerWeek) || 0) * (parseFloat(weeksPerYear) || 0)
                  ).toString(),
                })}
              </div>
            </div>

            {/* Full Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                  {tUI('breakdownHourly')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.hourly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                  {tUI('breakdownDaily')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.daily)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  {tUI('breakdownWeekly')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.weekly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  {tUI('breakdownBiweekly')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.biweekly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                  {tUI('breakdownMonthly')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.monthly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                  {tUI('breakdownAnnual')}
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.annual)}
                </div>
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-sm'
              }`}
            >
              {copied ? tUI('copied') : tUI('copyBreakdown')}
            </button>
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
