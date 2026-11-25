'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { Calendar, Copy, Check, Sparkles, Users, Clock, Globe, Award } from 'lucide-react';

const getZodiacSign = (month: number, day: number): string => {
  const signs = [
    { sign: 'Capricorn', endDate: 19 },
    { sign: 'Aquarius', endDate: 18 },
    { sign: 'Pisces', endDate: 20 },
    { sign: 'Aries', endDate: 19 },
    { sign: 'Taurus', endDate: 20 },
    { sign: 'Gemini', endDate: 20 },
    { sign: 'Cancer', endDate: 22 },
    { sign: 'Leo', endDate: 22 },
    { sign: 'Virgo', endDate: 22 },
    { sign: 'Libra', endDate: 22 },
    { sign: 'Scorpio', endDate: 21 },
    { sign: 'Sagittarius', endDate: 21 },
  ];
  if (month === 1) return day <= 19 ? 'Capricorn' : 'Aquarius';
  const signIndex = month - 1;
  return day <= signs[signIndex].endDate ? signs[signIndex].sign : signs[(signIndex + 1) % 12].sign;
};

const getChineseZodiacKey = (year: number): string => {
  const animals = [
    'czMonkey',
    'czRooster',
    'czDog',
    'czPig',
    'czRat',
    'czOx',
    'czTiger',
    'czRabbit',
    'czDragon',
    'czSnake',
    'czHorse',
    'czGoat',
  ];
  return animals[year % 12];
};

const getGenerationKey = (year: number): string => {
  if (year >= 2013) return 'genAlpha';
  if (year >= 1997) return 'genZ';
  if (year >= 1981) return 'genMillennial';
  if (year >= 1965) return 'genX';
  if (year >= 1946) return 'genBoomer';
  return 'genSilent';
};

function computeExactDiff(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += lastMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diffTime / (1000 * 60));
  const totalSeconds = Math.floor(diffTime / 1000);
  const decimalAge = (totalDays / 365.2425).toFixed(2);

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    decimalAge,
  };
}

function getTodayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  decimalAge: string;
  dayOfWeek: string;
  zodiac: string;
  chineseZodiacKey: string;
  generationKey: string;
  daysToBirthday: number;
  halfBirthdayDate: string;
  tenThousandDaysDate: string;
  tenThousandReached: boolean;
  oneBillionSecDate: string;
  oneBillionReached: boolean;
  nextMilestoneAge: number;
  daysToNextMilestone: number;
}

export default function AgeCalculatorPage() {
  const t = useTranslations('Tools.age-calculator');
  const tUI = useTranslations('ToolUI.ageCalculator');
  const locale = useLocale();
  const toolsT = useTranslations('Tools');

  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(getTodayString);
  const [error, setError] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  // Compare two ages state
  const [person1Date, setPerson1Date] = useState('');
  const [person2Date, setPerson2Date] = useState('');

  // Live seconds tick when targetDate is today
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const isTargetToday = targetDate === getTodayString();

  useEffect(() => {
    if (!birthDate || !isTargetToday || mode !== 'single') return;
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [birthDate, isTargetToday, mode]);

  const zodiacTranslations: Record<string, string> = useMemo(
    () => ({
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
    }),
    [t]
  );

  const result: AgeResult | null = useMemo(() => {
    if (!birthDate || !targetDate) {
      return null;
    }

    const dob = new Date(`${birthDate}T00:00:00`);
    const target = isTargetToday ? new Date(nowTick) : new Date(`${targetDate}T00:00:00`);

    if (Number.isNaN(dob.getTime()) || Number.isNaN(target.getTime())) {
      return null;
    }

    const dobDayStart = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
    const targetDayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    if (dobDayStart > targetDayStart) {
      return null;
    }

    const diff = computeExactDiff(dobDayStart, targetDayStart);
    const liveSeconds = isTargetToday
      ? Math.max(0, Math.floor((target.getTime() - dob.getTime()) / 1000))
      : diff.totalSeconds;

    // Next Birthday relative to target date
    const nextBirthday = new Date(targetDayStart.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < targetDayStart) {
      nextBirthday.setFullYear(targetDayStart.getFullYear() + 1);
    }
    const nextBirthdayDiff = Math.abs(nextBirthday.getTime() - targetDayStart.getTime());
    const daysToBirthday = Math.ceil(nextBirthdayDiff / (1000 * 60 * 60 * 24));

    // Half Birthday (6 months after birthday)
    const halfBday = new Date(dob.getFullYear(), dob.getMonth() + 6, dob.getDate());
    const nextHalfBday = new Date(
      targetDayStart.getFullYear(),
      halfBday.getMonth(),
      halfBday.getDate()
    );
    if (nextHalfBday < targetDayStart) {
      nextHalfBday.setFullYear(targetDayStart.getFullYear() + 1);
    }

    // 10,000 Days Old
    const tenK = new Date(dobDayStart.getTime() + 10000 * 86400000);
    // 1 Billion Seconds Old (1,000,000,000 * 1000 ms)
    const oneBillion = new Date(dobDayStart.getTime() + 1000000000 * 1000);

    // Next Milestone Birthday
    const milestones = [18, 21, 25, 30, 40, 50, 60, 75, 100];
    const nextMilestoneAge = milestones.find((m) => m > diff.years) ?? diff.years + 10;
    const nextMilestoneDate = new Date(
      dob.getFullYear() + nextMilestoneAge,
      dob.getMonth(),
      dob.getDate()
    );
    const daysToNextMilestone = Math.max(
      0,
      Math.ceil((nextMilestoneDate.getTime() - targetDayStart.getTime()) / 86400000)
    );

    const fmtOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return {
      ...diff,
      totalSeconds: liveSeconds,
      dayOfWeek: dobDayStart.toLocaleDateString(locale, { weekday: 'long' }),
      zodiac: getZodiacSign(dob.getMonth() + 1, dob.getDate()),
      chineseZodiacKey: getChineseZodiacKey(dob.getFullYear()),
      generationKey: getGenerationKey(dob.getFullYear()),
      daysToBirthday,
      halfBirthdayDate: nextHalfBday.toLocaleDateString(locale, fmtOptions),
      tenThousandDaysDate: tenK.toLocaleDateString(locale, fmtOptions),
      tenThousandReached: tenK <= targetDayStart,
      oneBillionSecDate: oneBillion.toLocaleDateString(locale, fmtOptions),
      oneBillionReached: oneBillion <= targetDayStart,
      nextMilestoneAge,
      daysToNextMilestone,
    };
  }, [birthDate, targetDate, isTargetToday, nowTick, locale]);

  useEffect(() => {
    if (!birthDate || !targetDate) {
      setError('');
      return;
    }
    const dob = new Date(`${birthDate}T00:00:00`);
    const target = new Date(`${targetDate}T00:00:00`);
    if (dob > target) {
      setError(tUI('birthDateFutureError'));
    } else {
      setError('');
    }
  }, [birthDate, targetDate, tUI]);

  const compareResult = useMemo(() => {
    if (!person1Date || !person2Date) return null;
    const d1 = new Date(`${person1Date}T00:00:00`);
    const d2 = new Date(`${person2Date}T00:00:00`);
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null;

    const older = d1 <= d2 ? d1 : d2;
    const younger = d1 <= d2 ? d2 : d1;
    const olderPerson = d1.getTime() === d2.getTime() ? 'same' : d1 < d2 ? 'person1' : 'person2';
    const diff = computeExactDiff(older, younger);
    return { ...diff, olderPerson };
  }, [person1Date, person2Date]);

  const copyReport = async () => {
    if (!result) return;

    const yearUnit = result.years === 1 ? tUI('year') : tUI('years');
    const monthUnit = result.months === 1 ? tUI('month') : tUI('months');
    const dayUnit = result.days === 1 ? tUI('day') : tUI('days');

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
      `${tUI('decimalAgeLabel')}: ${result.decimalAge} ${tUI('years')}`,
      t('bornOnReport', { day: result.dayOfWeek }),
      t('zodiacReport', {
        sign: zodiacTranslations[result.zodiac] ?? result.zodiac,
      }),
      birthdayReport,
      t('totalMonthsReport', { value: result.totalMonths.toLocaleString(locale) }),
      t('totalWeeksReport', { value: result.totalWeeks.toLocaleString(locale) }),
      t('totalDaysReport', { value: result.totalDays.toLocaleString(locale) }),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const setPresetTarget = (preset: 'today' | 'jan1' | 'aug1') => {
    const now = new Date();
    if (preset === 'today') {
      setTargetDate(getTodayString());
    } else if (preset === 'jan1') {
      const yr =
        now.getMonth() === 0 && now.getDate() === 1 ? now.getFullYear() : now.getFullYear() + 1;
      setTargetDate(`${yr}-01-01`);
    } else {
      const yr = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
      setTargetDate(`${yr}-08-01`);
    }
  };

  const planetaryAges = useMemo(() => {
    if (!result) return [];
    const earthYears = result.totalDays / 365.2425;
    return [
      { nameKey: 'planetMercury', icon: '☿️', years: (earthYears / 0.2408467).toFixed(1) },
      { nameKey: 'planetVenus', icon: '♀️', years: (earthYears / 0.61519726).toFixed(1) },
      { nameKey: 'planetMars', icon: '♂️', years: (earthYears / 1.8808158).toFixed(1) },
      { nameKey: 'planetJupiter', icon: '♃', years: (earthYears / 11.862615).toFixed(2) },
      { nameKey: 'planetSaturn', icon: '♄', years: (earthYears / 29.447498).toFixed(2) },
    ];
  }, [result]);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          toolSlug="age-calculator"
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          align="center"
        />

        {/* Mode Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('single')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: mode === 'single' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              backgroundColor: mode === 'single' ? '#3b82f6' : 'var(--bg-card)',
              color: mode === 'single' ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.2s ease',
            }}
          >
            <Calendar size={16} />
            <span>{tUI('tabSingle')}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('compare')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: mode === 'compare' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
              backgroundColor: mode === 'compare' ? '#3b82f6' : 'var(--bg-card)',
              color: mode === 'compare' ? '#ffffff' : 'var(--text-main)',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={16} />
            <span>{tUI('tabCompare')}</span>
          </button>
        </div>

        {/* SINGLE AGE CALCULATOR MODE */}
        {mode === 'single' && (
          <>
            {/* Input Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="dob"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('dateOfBirth')}
                  </label>
                  <input
                    type="date"
                    id="dob"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      color: 'var(--text-main)',
                      fontSize: '1.05rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-date"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('targetDateLabel')}
                  </label>
                  <input
                    type="date"
                    id="target-date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      color: 'var(--text-main)',
                      fontSize: '1.05rem',
                      outline: 'none',
                    }}
                  />
                  {/* Target Date Quick Presets */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setPresetTarget('today')}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetToday')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetTarget('jan1')}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetJan1')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetTarget('aug1')}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetAug1')}
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 mt-3 text-sm font-medium">{error}</p>}
            </div>

            {/* Results Dashboard */}
            {result && (
              <div className="space-y-6">
                {/* Exact Age Card */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                  }}
                >
                  <h2 className="text-sm uppercase tracking-widest font-bold text-emerald-500 mb-4">
                    {tUI('yourExactAge')}
                  </h2>
                  <div className="flex flex-wrap justify-center items-baseline gap-2 md:gap-4">
                    <span
                      className="text-5xl md:text-7xl font-extrabold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {result.years}
                    </span>
                    <span
                      className="text-xl md:text-2xl font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {result.years === 1 ? tUI('year') : tUI('years')}
                    </span>
                    <span
                      className="text-5xl md:text-7xl font-extrabold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {result.months}
                    </span>
                    <span
                      className="text-xl md:text-2xl font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {result.months === 1 ? tUI('month') : tUI('months')}
                    </span>
                    <span
                      className="text-5xl md:text-7xl font-extrabold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {result.days}
                    </span>
                    <span
                      className="text-xl md:text-2xl font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {result.days === 1 ? tUI('day') : tUI('days')}
                    </span>
                  </div>

                  {/* Decimal Age Badge */}
                  <div style={{ marginTop: '14px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '5px 14px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                      }}
                    >
                      {tUI('decimalAgeLabel')}: {result.decimalAge} {tUI('years')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={copyReport}
                    style={{
                      marginTop: '24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: copiedReport ? '#10b981' : '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      padding: '12px 24px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {copiedReport ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedReport ? tUI('reportCopiedBtn') : tUI('copyFullReport')}</span>
                  </button>
                </div>

                {/* 6-Stat Chronological Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: tUI('totalMonths'), value: result.totalMonths.toLocaleString(locale) },
                    { label: tUI('totalWeeks'), value: result.totalWeeks.toLocaleString(locale) },
                    { label: tUI('totalDays'), value: result.totalDays.toLocaleString(locale) },
                    { label: tUI('totalHours'), value: result.totalHours.toLocaleString(locale) },
                    {
                      label: tUI('totalMinutes'),
                      value: result.totalMinutes.toLocaleString(locale),
                    },
                    {
                      label: tUI('totalSeconds'),
                      value: result.totalSeconds.toLocaleString(locale),
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        {stat.label}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-emerald-500">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Cultural, Zodiac & Birthday Insights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      🎂 {tUI('bornOn')}
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                      {result.dayOfWeek}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      ♊ {tUI('zodiacSign')}
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                      {zodiacTranslations[result.zodiac] ?? result.zodiac}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      🐉 {tUI('chineseZodiacLabel')}
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                      {tUI(result.chineseZodiacKey)}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      📅 {tUI('nextBirthday')}
                    </p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                      {tUI(
                        result.daysToBirthday === 1 ? 'nextBirthdaySingular' : 'nextBirthdayPlural',
                        { days: result.daysToBirthday.toLocaleString(locale) }
                      )}
                    </p>
                  </div>
                </div>

                {/* AI Insights: Generation, Life Milestones & India/Global Eligibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Milestones & Generation */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '22px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          margin: 0,
                          color: 'var(--text-main)',
                        }}
                      >
                        {tUI('milestonesTitle')}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {tUI('generationLabel')}
                        </span>
                        <span
                          style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}
                        >
                          {tUI(result.generationKey)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {tUI('halfBirthdayLabel')}
                        </span>
                        <span
                          style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}
                        >
                          {result.halfBirthdayDate}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {tUI('tenThousandDaysLabel')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: result.tenThousandReached ? '#10b981' : '#3b82f6',
                          }}
                        >
                          {result.tenThousandDaysDate}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {tUI('oneBillionSecLabel')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: result.oneBillionReached ? '#10b981' : '#3b82f6',
                          }}
                        >
                          {result.oneBillionSecDate}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          borderRadius: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          {tUI('nextMilestoneLabel', { age: result.nextMilestoneAge })}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#eab308' }}>
                          {tUI('inDaysCount', {
                            days: result.daysToNextMilestone.toLocaleString(locale),
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* India & Global Eligibility + Planetary Ages */}
                  <div className="space-y-6">
                    {/* Eligibility Card */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '22px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '14px',
                        }}
                      >
                        <Award size={18} style={{ color: '#10b981' }} />
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--text-main)',
                          }}
                        >
                          {tUI('eligibilityTitle')}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {[
                          { label: tUI('eligAdult'), ok: result.years >= 18 },
                          { label: tUI('eligExams'), ok: result.years >= 21 },
                          { label: tUI('eligSenior'), ok: result.years >= 60 },
                        ].map((row, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(0,0,0,0.02)',
                            }}
                          >
                            <span style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                              {row.label}
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '2px 10px',
                                borderRadius: '12px',
                                backgroundColor: row.ok
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(100, 116, 139, 0.15)',
                                color: row.ok ? '#10b981' : 'var(--text-muted)',
                              }}
                            >
                              {row.ok ? tUI('statusEligible') : tUI('statusNotYet')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Planetary Ages */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '22px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '14px',
                        }}
                      >
                        <Globe size={18} style={{ color: '#3b82f6' }} />
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--text-main)',
                          }}
                        >
                          {tUI('planetaryTitle')}
                        </h3>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {planetaryAges.map((p) => (
                          <div
                            key={p.nameKey}
                            style={{
                              padding: '10px 4px',
                              backgroundColor: 'rgba(0,0,0,0.02)',
                              borderRadius: '10px',
                            }}
                          >
                            <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{p.icon}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {tUI(p.nameKey)}
                            </div>
                            <div
                              style={{
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                              }}
                            >
                              {p.years}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* COMPARE TWO AGES MODE */}
        {mode === 'compare' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '28px',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="p1-dob"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('person1Dob')}
                </label>
                <input
                  type="date"
                  id="p1-dob"
                  value={person1Date}
                  onChange={(e) => setPerson1Date(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    color: 'var(--text-main)',
                    fontSize: '1.05rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="p2-dob"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('person2Dob')}
                </label>
                <input
                  type="date"
                  id="p2-dob"
                  value={person2Date}
                  onChange={(e) => setPerson2Date(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    color: 'var(--text-main)',
                    fontSize: '1.05rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {compareResult ? (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(59, 130, 246, 0.06)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#3b82f6',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('ageDifferenceTitle')}
                </p>
                <p
                  className="text-3xl md:text-4xl font-extrabold"
                  style={{ color: 'var(--text-main)' }}
                >
                  {compareResult.years} {compareResult.years === 1 ? tUI('year') : tUI('years')},{' '}
                  {compareResult.months} {compareResult.months === 1 ? tUI('month') : tUI('months')}
                  , {compareResult.days} {compareResult.days === 1 ? tUI('day') : tUI('days')}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  {compareResult.olderPerson === 'same'
                    ? tUI('sameAgeText')
                    : compareResult.olderPerson === 'person1'
                      ? tUI('person1Older')
                      : tUI('person2Older')}{' '}
                  ({compareResult.totalDays.toLocaleString(locale)} {tUI('days')})
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{tUI('comparePlaceholder')}</p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Tools */}
        <section aria-labelledby="suggested-tools-heading" className="mt-14 space-y-6">
          <div>
            <h2
              id="suggested-tools-heading"
              className="text-2xl font-bold mb-3"
              style={{ color: 'var(--text-main)' }}
            >
              {t('suggestedToolsHeading')}
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {t('suggestedToolsDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/tools/bmi-calculator"
              className="block rounded-xl p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                {toolsT('bmi-calculator.name')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {toolsT('bmi-calculator.description')}
              </p>
            </Link>

            <Link
              href="/tools/percentage-calculator"
              className="block rounded-xl p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                {toolsT('percentage-calculator.name')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {toolsT('percentage-calculator.description')}
              </p>
            </Link>

            <Link
              href="/tools/discount-calculator"
              className="block rounded-xl p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                {toolsT('discount-calculator.name')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {toolsT('discount-calculator.description')}
              </p>
            </Link>

            <Link
              href="/tools/loan-emi-calculator"
              className="block rounded-xl p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                {toolsT('loan-emi-calculator.name')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {toolsT('loan-emi-calculator.description')}
              </p>
            </Link>
          </div>
        </section>

        {/* SEO Content Section */}
        <ToolSeoContent
          toolSlug="age-calculator"
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
            { q: tUI('faq5Q'), a: tUI('faq5A') },
            { q: tUI('faq6Q'), a: tUI('faq6A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
