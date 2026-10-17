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
  const tTools = useTranslations('Tools');
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
            title={
              tTools.has('salary-to-hourly-calculator.name')
                ? tTools('salary-to-hourly-calculator.name')
                : 'Salary to Hourly Calculator'
            }
            subtitle={
              tTools.has('salary-to-hourly-calculator.description')
                ? tTools('salary-to-hourly-calculator.description')
                : 'Convert between annual salary and hourly rate — see your pay broken down by hour, day, week, month, and year.'
            }
          />

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
                💼 Salary → Hourly
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
                ⏰ Hourly → Salary
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {mode === 'salaryToHourly' ? (
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                    Annual Salary
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
                    Hourly Rate
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
                  Hours per Week:
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
                  Weeks per Year:
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
                {mode === 'salaryToHourly' ? 'Your Hourly Rate' : 'Your Annual Salary'}
              </div>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-[var(--text-main)] leading-none my-2">
                {mode === 'salaryToHourly'
                  ? formatCurrency(result.hourly)
                  : formatCurrency(result.annual)}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-2">
                Based on {hoursPerWeek} hrs/week × {weeksPerYear} weeks (
                {parseFloat(hoursPerWeek) * parseFloat(weeksPerYear)} hrs/year)
              </div>
            </div>

            {/* Full Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                  Hourly
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.hourly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                  Daily
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.daily)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  Weekly
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.weekly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1.5">
                  Biweekly
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.biweekly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
                  Monthly
                </div>
                <div className="text-lg md:text-xl font-bold font-mono text-[var(--text-main)]">
                  {formatCurrency(result.monthly)}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                  Annual
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
              {copied ? '✓ Copied!' : '📋 Copy Full Breakdown'}
            </button>
          </div>

          <ToolSeoContent
            toolSlug="salary-to-hourly-calculator"
            toolName={
              tTools.has('salary-to-hourly-calculator.name')
                ? tTools('salary-to-hourly-calculator.name')
                : 'Salary to Hourly Calculator'
            }
          />
        </div>
      </GlobalContainer>
    </>
  );
}
