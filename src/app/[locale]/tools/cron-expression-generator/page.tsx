'use client';

import React, { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import cronstrue from 'cronstrue/i18n';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Sparkles,
  Copy,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Globe,
} from 'lucide-react';

const CRONSTRUE_LOCALE_MAP: Record<string, string> = {
  en: 'en',
  zh: 'zh_CN',
  es: 'es',
  pt: 'pt_BR',
  de: 'de',
  fr: 'fr',
  it: 'it',
  ja: 'ja',
  ru: 'ru',
  ko: 'ko',
};

type CronDialect = 'linux' | 'spring' | 'quartz' | 'aws';

// Deterministic AI Natural Language to 5-field Cron Parser
function parseNaturalLanguageToCron(
  prompt: string
): [string, string, string, string, string] | null {
  const text = prompt.toLowerCase().trim();
  if (!text) return null;

  let min = '0';
  let hour = '*';
  let dom = '*';
  const mon = '*';
  let dow = '*';
  let matched = false;

  // 1. Interval minutes
  const everyMinMatch = text.match(/every\s+(\d+)\s*(?:min|minute|minutes|mins)\b/);
  if (everyMinMatch) {
    const n = Math.max(1, Math.min(59, parseInt(everyMinMatch[1], 10)));
    min = n === 1 ? '*' : `*/${n}`;
    hour = '*';
    matched = true;
  } else if (/\bevery\s+minute\b|\bper\s+minute\b/.test(text)) {
    min = '*';
    hour = '*';
    matched = true;
  }

  // 2. Interval hours
  const everyHrMatch = text.match(/every\s+(\d+)\s*(?:hr|hrs|hour|hours)\b/);
  if (everyHrMatch) {
    const n = Math.max(1, Math.min(23, parseInt(everyHrMatch[1], 10)));
    min = '0';
    hour = n === 1 ? '*' : `*/${n}`;
    matched = true;
  } else if (/\bevery\s+hour\b|\bhourly\b/.test(text)) {
    min = '0';
    hour = '*';
    matched = true;
  }

  // 3. Days of week
  const dayMap: [RegExp, string][] = [
    [/\b(?:sun|sunday|sundays)\b/, '0'],
    [/\b(?:mon|monday|mondays)\b/, '1'],
    [/\b(?:tue|tues|tuesday|tuesdays)\b/, '2'],
    [/\b(?:wed|wednesday|wednesdays)\b/, '3'],
    [/\b(?:thu|thur|thurs|thursday|thursdays)\b/, '4'],
    [/\b(?:fri|friday|fridays)\b/, '5'],
    [/\b(?:sat|saturday|saturdays)\b/, '6'],
  ];

  if (/\bweekdays?\b|\bmon(?:day)?\s*(?:to|through|-)\s*fri(?:day)?\b/.test(text)) {
    dow = '1-5';
    matched = true;
  } else if (/\bweekends?\b/.test(text)) {
    dow = '0,6';
    matched = true;
  } else {
    const foundDays: string[] = [];
    for (const [re, num] of dayMap) {
      if (re.test(text)) foundDays.push(num);
    }
    if (foundDays.length > 0) {
      dow = Array.from(new Set(foundDays)).join(',');
      matched = true;
    }
  }

  // 4. Day of month / monthly
  if (/\b(?:1st|first)\s+(?:day\s+)?of\s+(?:every\s+)?month\b|\bmonthly\b/.test(text)) {
    dom = '1';
    matched = true;
  } else {
    const domMatch = text.match(
      /\bon\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(?:every\s+)?month\b/
    );
    if (domMatch) {
      const d = Math.max(1, Math.min(31, parseInt(domMatch[1], 10)));
      dom = String(d);
      matched = true;
    }
  }

  // 5. Daily
  if (/\bevery\s+day\b|\bdaily\b|\btwice\s+a\s+day\b/.test(text)) {
    if (hour === '*') hour = '0';
    matched = true;
  }

  // 6. Specific times: "midnight", "noon", "at 9am", "at 9:30 pm", "8am and 8pm", "14:30"
  if (/\bmidnight\b/.test(text)) {
    min = '0';
    hour = '0';
    matched = true;
  } else if (/\bnoon\b/.test(text)) {
    min = '0';
    hour = '12';
    matched = true;
  } else {
    const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b/g;
    const hoursFound: number[] = [];
    let firstMin: number | null = null;
    let m: RegExpExecArray | null;
    while ((m = timeRegex.exec(text)) !== null) {
      if (m[1] !== undefined) {
        let h = parseInt(m[1], 10);
        const mm = m[2] ? parseInt(m[2], 10) : 0;
        const ap = m[3];
        if (ap === 'pm' && h < 12) h += 12;
        if (ap === 'am' && h === 12) h = 0;
        if (h >= 0 && h <= 23 && mm >= 0 && mm <= 59) {
          hoursFound.push(h);
          if (firstMin === null) firstMin = mm;
        }
      } else if (m[4] !== undefined) {
        const h = parseInt(m[4], 10);
        const mm = parseInt(m[5], 10);
        hoursFound.push(h);
        if (firstMin === null) firstMin = mm;
      }
    }
    if (hoursFound.length > 0) {
      hour = Array.from(new Set(hoursFound)).join(',');
      min = String(firstMin ?? 0);
      matched = true;
    }
  }

  if (!matched) return null;
  return [min, hour, dom, mon, dow];
}

// Validate a single cron field
function isValidCronField(value: string, min: number, max: number, allowQuestion = false): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v === '*') return true;
  if (allowQuestion && v === '?') return true;

  const parts = v.split(',');
  for (const part of parts) {
    if (!part) return false;
    const stepSplit = part.split('/');
    if (stepSplit.length > 2) return false;
    const [base, stepStr] = stepSplit;

    if (stepStr !== undefined) {
      if (!/^\d+$/.test(stepStr)) return false;
      const step = parseInt(stepStr, 10);
      if (step < 1 || step > max) return false;
    }

    if (base === '*') continue;

    const rangeSplit = base.split('-');
    if (rangeSplit.length > 2) return false;
    for (const numStr of rangeSplit) {
      if (!/^\d+$/.test(numStr)) return false;
      const num = parseInt(numStr, 10);
      if (num < min || num > max) return false;
    }
    if (rangeSplit.length === 2 && parseInt(rangeSplit[0], 10) > parseInt(rangeSplit[1], 10)) {
      return false;
    }
  }
  return true;
}

// Match a numeric value against a cron field expression
function matchCronField(val: number, expr: string): boolean {
  const v = expr.trim();
  if (v === '*' || v === '?') return true;
  const parts = v.split(',');
  for (const part of parts) {
    const [base, stepStr] = part.split('/');
    const step = stepStr ? parseInt(stepStr, 10) : 1;
    if (base === '*') {
      if (val % step === 0) return true;
      continue;
    }
    if (base.includes('-')) {
      const [s, e] = base.split('-').map(Number);
      if (val >= s && val <= e && (val - s) % step === 0) return true;
    } else {
      const n = parseInt(base, 10);
      if (val === n) return true;
    }
  }
  return false;
}

// Compute next 5 execution dates for a valid 5-field cron
function getNextRunDates(
  minExpr: string,
  hourExpr: string,
  domExpr: string,
  monExpr: string,
  dowExpr: string,
  count = 5
): Date[] {
  const results: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 525600; // Up to 1 year of minutes
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const m = cursor.getMonth() + 1;
    if (!matchCronField(m, monExpr)) {
      cursor.setMonth(cursor.getMonth() + 1, 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }
    const d = cursor.getDate();
    const w = cursor.getDay();
    const domMatch = matchCronField(d, domExpr);
    const dowMatch = matchCronField(w, dowExpr);
    const dayOk =
      domExpr === '*' || domExpr === '?'
        ? dowMatch
        : dowExpr === '*' || dowExpr === '?'
          ? domMatch
          : domMatch || dowMatch;

    if (!dayOk) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
      continue;
    }

    const hr = cursor.getHours();
    if (!matchCronField(hr, hourExpr)) {
      cursor.setHours(cursor.getHours() + 1, 0, 0, 0);
      continue;
    }

    const mn = cursor.getMinutes();
    if (matchCronField(mn, minExpr)) {
      results.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

export default function CronExpressionGeneratorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.cronExpressionGenerator');

  const [dialect, setDialect] = useState<CronDialect>('linux');
  const [second, setSecond] = useState('0');
  const [minute, setMinute] = useState('0');
  const [hour, setHour] = useState('9');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [year, setYear] = useState('*');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'ok' | 'unrecognized'>('idle');
  const [pasteInput, setPasteInput] = useState('');
  const [pasteError, setPasteError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timezone, setTimezone] = useState<string>('local');
  const [exportTarget, setExportTarget] = useState<
    'crontab' | 'github' | 'k8s' | 'vercel' | 'python'
  >('crontab');
  const [copiedConfig, setCopiedConfig] = useState(false);

  // Formatted expression according to dialect
  const cronExpression = useMemo(() => {
    if (dialect === 'spring') {
      return `${second} ${minute} ${hour} ${day} ${month} ${weekday}`;
    }
    if (dialect === 'quartz') {
      const qDom = day === '*' && weekday !== '*' ? '?' : day;
      const qDow = qDom !== '?' && weekday === '*' ? '?' : weekday;
      return `${second} ${minute} ${hour} ${qDom} ${month} ${qDow}${year !== '*' ? ` ${year}` : ''}`;
    }
    if (dialect === 'aws') {
      const awsDom = day === '*' && weekday !== '*' ? '?' : day;
      const awsDow = awsDom !== '?' && weekday === '*' ? '?' : weekday === '0' ? '1' : weekday;
      return `cron(${minute} ${hour} ${awsDom} ${month} ${awsDow} ${year})`;
    }
    return `${minute} ${hour} ${day} ${month} ${weekday}`;
  }, [dialect, second, minute, hour, day, month, weekday, year]);

  // Validation
  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if ((dialect === 'spring' || dialect === 'quartz') && !isValidCronField(second, 0, 59))
      errs.push(tUI('second'));
    if (!isValidCronField(minute, 0, 59)) errs.push(tUI('minute'));
    if (!isValidCronField(hour, 0, 23)) errs.push(tUI('hour'));
    if (!isValidCronField(day, 1, 31, dialect !== 'linux')) errs.push(tUI('dayMonth'));
    if (!isValidCronField(month, 1, 12)) errs.push(tUI('month'));
    if (!isValidCronField(weekday, 0, 7, dialect !== 'linux')) errs.push(tUI('weekday'));
    if (
      (dialect === 'aws' || dialect === 'quartz') &&
      year !== '*' &&
      !isValidCronField(year, 1970, 2099)
    )
      errs.push(tUI('yearLabel'));
    return errs;
  }, [dialect, second, minute, hour, day, month, weekday, year, tUI]);

  const isValid = validationErrors.length === 0;

  const explanation = useMemo(() => {
    if (!isValid) return '';
    try {
      const cronLocale = CRONSTRUE_LOCALE_MAP[locale] || 'en';
      const fiveField = `${minute} ${hour} ${day === '?' ? '*' : day} ${month} ${weekday === '?' ? '*' : weekday}`;
      return cronstrue.toString(fiveField, { locale: cronLocale });
    } catch {
      return cronExpression;
    }
  }, [isValid, minute, hour, day, month, weekday, cronExpression, locale]);

  const nextRuns = useMemo(() => {
    if (!isValid) return [];
    return getNextRunDates(minute, hour, day, month, weekday, 5);
  }, [isValid, minute, hour, day, month, weekday]);

  const presets = [
    { label: tUI('presetEveryMinute'), value: ['*', '*', '*', '*', '*'] },
    { label: tUI('presetEveryHour'), value: ['0', '*', '*', '*', '*'] },
    { label: tUI('presetDaily9AM'), value: ['0', '9', '*', '*', '*'] },
    { label: tUI('presetDailyMidnight'), value: ['0', '0', '*', '*', '*'] },
    { label: tUI('presetEveryMonday'), value: ['0', '9', '*', '*', '1'] },
    { label: tUI('presetFirstOfMonth'), value: ['0', '0', '1', '*', '*'] },
    { label: tUI('presetEvery15Minutes'), value: ['*/15', '*', '*', '*', '*'] },
    { label: tUI('presetWeekdays8AM'), value: ['0', '8', '*', '*', '1-5'] },
  ];

  const applyPreset = (preset: string[]) => {
    setSecond('0');
    setMinute(preset[0]);
    setHour(preset[1]);
    setDay(preset[2]);
    setMonth(preset[3]);
    setWeekday(preset[4]);
    setAiStatus('idle');
  };

  const handleAiGenerate = (promptOverride?: string) => {
    const query = promptOverride ?? aiPrompt;
    if (promptOverride !== undefined) setAiPrompt(promptOverride);
    const parsed = parseNaturalLanguageToCron(query);
    if (parsed) {
      setSecond('0');
      setMinute(parsed[0]);
      setHour(parsed[1]);
      setDay(parsed[2]);
      setMonth(parsed[3]);
      setWeekday(parsed[4]);
      setAiStatus('ok');
    } else {
      setAiStatus('unrecognized');
    }
  };

  const handlePasteParse = (raw: string) => {
    setPasteInput(raw);
    setPasteError(false);
    const cleaned = raw
      .trim()
      .replace(/^cron\(/i, '')
      .replace(/\)$/, '')
      .trim();
    if (!cleaned) return;
    const parts = cleaned.split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDay(parts[2]);
      setMonth(parts[3]);
      setWeekday(parts[4]);
    } else if (parts.length === 6) {
      if (dialect === 'aws') {
        setMinute(parts[0]);
        setHour(parts[1]);
        setDay(parts[2]);
        setMonth(parts[3]);
        setWeekday(parts[4]);
        setYear(parts[5]);
      } else if (dialect === 'quartz') {
        setSecond(parts[0]);
        setMinute(parts[1]);
        setHour(parts[2]);
        setDay(parts[3]);
        setMonth(parts[4]);
        setWeekday(parts[5]);
      } else {
        setDialect('spring');
        setSecond(parts[0]);
        setMinute(parts[1]);
        setHour(parts[2]);
        setDay(parts[3]);
        setMonth(parts[4]);
        setWeekday(parts[5]);
      }
    } else if (parts.length === 7) {
      setDialect('quartz');
      setSecond(parts[0]);
      setMinute(parts[1]);
      setHour(parts[2]);
      setDay(parts[3]);
      setMonth(parts[4]);
      setWeekday(parts[5]);
      setYear(parts[6]);
    } else {
      setPasteError(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const fiveFieldForExport = useMemo(
    () =>
      `${minute} ${hour} ${day === '?' ? '*' : day} ${month} ${weekday === '?' ? '*' : weekday}`,
    [minute, hour, day, month, weekday]
  );

  const exportConfigSnippet = useMemo(() => {
    if (exportTarget === 'github') {
      return `on:\n  schedule:\n    - cron: '${fiveFieldForExport}'`;
    }
    if (exportTarget === 'k8s') {
      return `apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: scheduled-job\nspec:\n  schedule: "${fiveFieldForExport}"`;
    }
    if (exportTarget === 'vercel') {
      return `{\n  "crons": [\n    {\n      "path": "/api/cron",\n      "schedule": "${fiveFieldForExport}"\n    }\n  ]\n}`;
    }
    if (exportTarget === 'python') {
      return `from apscheduler.schedulers.blocking import BlockingScheduler\n\nsched = BlockingScheduler()\n\n@sched.scheduled_job('cron', minute='${minute}', hour='${hour}', day='${day === '?' ? '*' : day}', month='${month}', day_of_week='${weekday === '?' ? '*' : weekday}')\ndef scheduled_job():\n    print("Executing scheduled task...")\n\nsched.start()`;
    }
    return `${fiveFieldForExport} /usr/local/bin/run-job.sh`;
  }, [exportTarget, fiveFieldForExport, minute, hour, day, month, weekday]);

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(exportConfigSnippet);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="cron-expression-generator"
        />

        {/* AI NATURAL LANGUAGE TO CRON PROMPT */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '14px',
            padding: '18px 20px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {tUI('aiPromptTitle')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => {
                setAiPrompt(e.target.value);
                if (aiStatus !== 'idle') setAiStatus('idle');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAiGenerate();
              }}
              placeholder={tUI('aiPromptPlaceholder')}
              style={{
                flex: 1,
                minWidth: '220px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleAiGenerate()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={15} />
              {tUI('aiGenerateBtn')}
            </button>
          </div>

          {/* Example AI Prompts */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
            {[
              'Every 5 minutes',
              'Every weekday at 9:30 AM',
              'Every Monday at 8 AM',
              'First day of month at midnight',
            ].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => handleAiGenerate(ex)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  color: '#8b5cf6',
                  cursor: 'pointer',
                }}
              >
                {ex}
              </button>
            ))}
          </div>

          {aiStatus === 'unrecognized' && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#f59e0b' }}>
              {tUI('aiUnrecognizedHint')}
            </p>
          )}
        </div>

        {/* Presets */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(p.value)}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
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

        {/* Main Builder */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          {/* Dialect Switcher & Paste-to-Validate */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['linux', 'spring', 'quartz', 'aws'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDialect(d)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    backgroundColor: dialect === d ? '#3b82f6' : 'var(--bg-page)',
                    color: dialect === d ? '#ffffff' : 'var(--text-main)',
                  }}
                >
                  {d === 'linux'
                    ? tUI('dialectLinux')
                    : d === 'spring'
                      ? tUI('dialectSpring')
                      : d === 'quartz'
                        ? tUI('dialectQuartz')
                        : tUI('dialectAws')}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                maxWidth: '340px',
              }}
            >
              <Terminal size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={pasteInput}
                onChange={(e) => handlePasteParse(e.target.value)}
                placeholder={tUI('pasteCronPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: pasteError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Field Inputs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {(dialect === 'spring' || dialect === 'quartz') && (
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('second')}
                </label>
                <input
                  type="text"
                  value={second}
                  onChange={(e) => setSecond(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            )}

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('minute')}
              </label>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder={tUI('minutePlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('hour')}
              </label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder={tUI('hourPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('dayMonth')}
              </label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder={tUI('dayPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('month')}
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder={tUI('monthPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('weekday')}
              </label>
              <input
                type="text"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                placeholder={tUI('weekdayPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {(dialect === 'aws' || dialect === 'quartz') && (
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('yearLabel')}
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            )}
          </div>

          {/* Validation Status Badge */}
          <div style={{ marginBottom: '16px' }}>
            {isValid ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10b981',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} />
                <span>{tUI('validSyntaxBadge')}</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={15} />
                <span>{tUI('invalidFieldsError', { fields: validationErrors.join(', ') })}</span>
              </div>
            )}
          </div>

          {/* Output */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {tUI('cronExpression')}
            </label>
            <div
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                paddingRight: '120px',
                display: 'flex',
                alignItems: 'center',
                minHeight: '60px',
              }}
            >
              <code
                style={{
                  color: '#10b981',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  wordBreak: 'break-all',
                }}
              >
                {cronExpression}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: copied ? '#10b981' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? tUI('copied') : tUI('copy')}
              </button>
            </div>
          </div>

          {/* Field-by-Field Visual Breakdown */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {[
              { label: tUI('minute'), val: minute },
              { label: tUI('hour'), val: hour },
              { label: tUI('dayMonth'), val: day },
              { label: tUI('month'), val: month },
              { label: tUI('weekday'), val: weekday },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.78rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}:</span>
                <code style={{ color: '#3b82f6', fontWeight: 700 }}>{item.val || '*'}</code>
              </div>
            ))}
          </div>

          {/* Explanation & Next 5 Execution Timestamps */}
          {isValid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('humanReadable')}
                </label>
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#3b82f6',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                  }}
                >
                  {tUI('runs', { explanation })}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '8px',
                  }}
                >
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock size={15} style={{ color: '#10b981' }} />
                    {tUI('nextRunsTitle')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={13} style={{ color: 'var(--text-muted)' }} />
                    <select
                      aria-label={tUI('timezoneLabel')}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        color: 'var(--text-main)',
                        outline: 'none',
                      }}
                    >
                      <option value="local">{tUI('tzLocal')}</option>
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="America/Los_Angeles">PST (Los Angeles)</option>
                      <option value="Europe/London">GMT (London)</option>
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-main)',
                  }}
                >
                  {nextRuns.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.7 }}>
                      {nextRuns.map((dt, idx) => (
                        <li key={idx}>
                          {dt.toLocaleString(locale, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            ...(timezone !== 'local' ? { timeZone: timezone } : {}),
                          })}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>{tUI('noUpcomingRuns')}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 1-Click Deployable Config Export */}
          {isValid && (
            <div
              style={{
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {tUI('exportConfigTitle')}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'crontab', label: 'Crontab' },
                      { id: 'github', label: 'GitHub Actions' },
                      { id: 'k8s', label: 'Kubernetes' },
                      { id: 'vercel', label: 'Vercel JSON' },
                      { id: 'python', label: 'Python (APScheduler)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExportTarget(item.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)',
                        backgroundColor: exportTarget === item.id ? '#3b82f6' : 'var(--bg-page)',
                        color: exportTarget === item.id ? '#ffffff' : 'var(--text-main)',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  paddingRight: '100px',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: '#10b981',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {exportConfigSnippet}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyConfig}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: copiedConfig ? '#10b981' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedConfig ? <Check size={12} /> : <Copy size={12} />}
                  {copiedConfig ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cron Format Table */}
        <div
          style={{
            marginTop: '24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <h3
            style={{
              color: 'var(--text-main)',
              fontSize: '1rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            {tUI('formatReference')}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { field: tUI('minute'), range: '0-59', special: '* , - /' },
              { field: tUI('hour'), range: '0-23', special: '* , - /' },
              { field: tUI('dayMonth'), range: '1-31', special: '* , - / ?' },
              { field: tUI('month'), range: '1-12', special: '* , - /' },
              { field: tUI('weekday'), range: tUI('rangeSunSat'), special: '* , - / ?' },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    color: '#3b82f6',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                  }}
                >
                  {row.field}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {tUI('range', { range: row.range })}
                </div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    marginTop: '2px',
                  }}
                >
                  {row.special}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ToolSeoContent
          toolSlug="cron-expression-generator"
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
