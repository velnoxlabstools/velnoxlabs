'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const getZodiacSign = (month: number, day: number): string => {
  const signs = [
    { sign: 'Capricorn', endDate: 19 }, // Jan
    { sign: 'Aquarius', endDate: 18 }, // Feb
    { sign: 'Pisces', endDate: 20 }, // Mar
    { sign: 'Aries', endDate: 19 }, // Apr
    { sign: 'Taurus', endDate: 20 }, // May
    { sign: 'Gemini', endDate: 20 }, // Jun
    { sign: 'Cancer', endDate: 22 }, // Jul
    { sign: 'Leo', endDate: 22 }, // Aug
    { sign: 'Virgo', endDate: 22 }, // Sep
    { sign: 'Libra', endDate: 22 }, // Oct
    { sign: 'Scorpio', endDate: 21 }, // Nov
    { sign: 'Sagittarius', endDate: 21 }, // Dec
  ];
  if (month === 1) return day <= 19 ? 'Capricorn' : 'Aquarius';
  const signIndex = month - 1;
  return day <= signs[signIndex].endDate ? signs[signIndex].sign : signs[(signIndex + 1) % 12].sign;
};

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  dayOfWeek: string;
  zodiac: string;
  daysToBirthday: number;
}

export default function AgeCalculatorPage() {
  const t = useTranslations('Tools.age-calculator');
  const locale = useLocale();
  const toolsT = useTranslations('Tools');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState('');

  const zodiacTranslations: Record<string, string> = {
    Capricorn: t('zodiacCapricorn'),
    Aquarius: t('zodiacAquarius'),
    Pisces: t('zodiacPisces'),
    Aries: t('zodiacAries'),
    Taurus: t('zodiacTaurus'),
    Gemini: t('zodiacGemini'),
    Cancer: t('zodiacCancer'),
    Leo: t('zodiacLeo'),
    Virgo: t('zodiacVirgo'),
    Libra: t('zodiacLibra'),
    Scorpio: t('zodiacScorpio'),
    Sagittarius: t('zodiacSagittarius'),
  };

  const faqItems = [
    { name: t('faq1Question'), acceptedAnswer: { text: t('faq1Answer') } },
    { name: t('faq2Question'), acceptedAnswer: { text: t('faq2Answer') } },
    { name: t('faq3Question'), acceptedAnswer: { text: t('faq3Answer') } },
    { name: t('faq4Question'), acceptedAnswer: { text: t('faq4Answer') } },
  ];

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `VelnoxLabs ${t('name')}`,
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: t('seoDescription'),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqItems.map((faq) => ({
          '@type': 'Question',
          name: faq.name,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.acceptedAnswer.text,
          },
        })),
      },
    ],
  };

  useEffect(() => {
    if (!birthDate) {
      setResult(null);
      return;
    }

    const dob = new Date(birthDate);
    const today = new Date();

    if (dob > today) {
      setError(t('birthDateFutureError'));
      setResult(null);
      return;
    }
    setError('');

    // Exact Age Calculation (Y/M/D)
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    // Total Stats Calculation
    const diffTime = Math.abs(today.getTime() - dob.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));

    // Next Birthday
    const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const nextBirthdayDiff = Math.abs(nextBirthday.getTime() - today.getTime());
    const daysToBirthday = Math.ceil(nextBirthdayDiff / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      dayOfWeek: dob.toLocaleDateString(locale, { weekday: 'long' }),
      zodiac: getZodiacSign(dob.getMonth() + 1, dob.getDate()),
      daysToBirthday,
    });
  }, [birthDate, locale, t]);

  const copyReport = () => {
    if (!result) return;

    const yearUnit = result.years === 1 ? t('year') : t('years');
    const monthUnit = result.months === 1 ? t('month') : t('months');
    const dayUnit = result.days === 1 ? t('day') : t('days');

    const birthdayReport =
      result.daysToBirthday === 1
        ? t('nextBirthdayReportSingular', { days: result.daysToBirthday })
        : t('nextBirthdayReportPlural', { days: result.daysToBirthday });

    const text = [
      t('reportTitle'),
      t('exactAgeReport', {
        years: result.years,
        yearsUnit: yearUnit,
        months: result.months,
        monthsUnit: monthUnit,
        days: result.days,
        daysUnit: dayUnit,
      }),
      t('bornOnReport', { day: result.dayOfWeek }),
      t('zodiacReport', {
        sign: zodiacTranslations[result.zodiac] ?? result.zodiac,
      }),
      birthdayReport,
      t('totalMonthsReport', { value: result.totalMonths.toLocaleString(locale) }),
      t('totalWeeksReport', { value: result.totalWeeks.toLocaleString(locale) }),
      t('totalDaysReport', { value: result.totalDays.toLocaleString(locale) }),
    ].join('\n');

    navigator.clipboard.writeText(text);
    alert(t('reportCopied'));
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('name')}</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">{t('pageSubtitle')}</p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
            <label htmlFor="dob" className="block text-sm font-semibold text-slate-300 mb-2">
              {t('dateOfBirth')}
            </label>
            <input
              type="date"
              id="dob"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
            />
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Exact Age Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                <h2 className="text-sm uppercase tracking-widest font-bold text-emerald-400 mb-4">
                  {t('yourExactAge')}
                </h2>
                <div className="flex flex-wrap justify-center items-baseline gap-2 md:gap-4 text-white">
                  <span className="text-6xl md:text-7xl font-extrabold">{result.years}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">
                    {result.years === 1 ? t('year') : t('years')}
                  </span>
                  <span className="text-6xl md:text-7xl font-extrabold">{result.months}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">
                    {result.months === 1 ? t('month') : t('months')}
                  </span>
                  <span className="text-6xl md:text-7xl font-extrabold">{result.days}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">
                    {result.days === 1 ? t('day') : t('days')}
                  </span>
                </div>
                <button
                  onClick={copyReport}
                  className="mt-8 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium py-3 px-6 rounded-lg transition-colors border border-slate-700"
                >
                  {t('copyFullReport')}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: t('totalMonths'), value: result.totalMonths.toLocaleString(locale) },
                  { label: t('totalWeeks'), value: result.totalWeeks.toLocaleString(locale) },
                  { label: t('totalDays'), value: result.totalDays.toLocaleString(locale) },
                  { label: t('totalHours'), value: result.totalHours.toLocaleString(locale) },
                  { label: t('totalMinutes'), value: result.totalMinutes.toLocaleString(locale) },
                  {
                    label: t('daysToBirthday'),
                    value: result.daysToBirthday.toLocaleString(locale),
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-emerald-400">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Secondary Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">🎂 {t('bornOn')}</p>
                  <p className="text-2xl font-bold text-white">{result.dayOfWeek}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">♊ {t('zodiacSign')}</p>
                  <p className="text-2xl font-bold text-white">
                    {zodiacTranslations[result.zodiac] ?? result.zodiac}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">📅 {t('nextBirthday')}</p>
                  <p className="text-2xl font-bold text-white">
                    {t(
                      result.daysToBirthday === 1 ? 'nextBirthdaySingular' : 'nextBirthdayPlural',
                      { days: result.daysToBirthday.toLocaleString(locale) }
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEO & Info Section */}
          <div className="mt-16 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('seoHeading')}</h2>
              <p className="text-slate-400 leading-relaxed">{t('seoDescription')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">{t('howToHeading')}</h2>
              <ol className="list-decimal pl-6 text-slate-400 space-y-2">
                <li>{t('howToStep1')}</li>
                <li>{t('howToStep2')}</li>
                <li>{t('howToStep3')}</li>
                <li>{t('howToStep4')}</li>
                <li>{t('howToStep5')}</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">{t('faqHeading')}</h2>
              <div className="space-y-6">
                {faqItems.map((faq, index) => (
                  <div key={index} className="border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">{faq.name}</h3>
                    <p className="text-slate-400 leading-relaxed">{faq.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Suggested Tools */}
            <section aria-labelledby="suggested-tools-heading" className="space-y-6">
              <div>
                <h2 id="suggested-tools-heading" className="text-2xl font-bold text-white mb-3">
                  {t('suggestedToolsHeading')}
                </h2>
                <p className="text-slate-400 leading-relaxed">{t('suggestedToolsDescription')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/tools/bmi-calculator"
                  className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {toolsT('bmi-calculator.name')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {toolsT('bmi-calculator.description')}
                  </p>
                </Link>

                <Link
                  href="/tools/percentage-calculator"
                  className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {toolsT('percentage-calculator.name')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {toolsT('percentage-calculator.description')}
                  </p>
                </Link>

                <Link
                  href="/tools/discount-calculator"
                  className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {toolsT('discount-calculator.name')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {toolsT('discount-calculator.description')}
                  </p>
                </Link>

                <Link
                  href="/tools/loan-emi-calculator"
                  className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {toolsT('loan-emi-calculator.name')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {toolsT('loan-emi-calculator.description')}
                  </p>
                </Link>
              </div>
            </section>
            {/* Feedback Section */}
            <section
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px',
                marginTop: '48px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '8px',
                }}
              >
                {t('feedbackHeading')}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
                {t('feedbackDescription')}
              </p>
              <textarea
                rows={4}
                placeholder={t('feedbackPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  resize: 'none',
                  outline: 'none',
                  marginBottom: '16px',
                }}
              ></textarea>
              <div>
                <button
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {t('submitSuggestion')}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
