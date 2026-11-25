'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Clock, Copy, Check, Calendar, Code2 } from 'lucide-react';

type TimestampUnit =
  'auto' | 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds' | 'webkit17' | 'filetime18';

// Exact milliseconds between 1601-01-01T00:00:00Z and 1970-01-01T00:00:00Z
const EPOCH_1601_TO_1970_MS = 11644473600000;

function formatRelativeTime(targetMs: number, nowMs: number, locale: string): string {
  const diffSec = Math.round((targetMs - nowMs) / 1000);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const abs = Math.abs(diffSec);
    if (abs < 60) return rtf.format(diffSec, 'second');
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day');
    if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
    return rtf.format(Math.round(diffSec / 31536000), 'year');
  } catch {
    return `${diffSec}s`;
  }
}

export default function UnixTimestampConverterPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.unixTimestampConverter');

  const [timestampInput, setTimestampInput] = useState<string>(() =>
    String(Math.floor(Date.now() / 1000))
  );
  const [unit, setUnit] = useState<TimestampUnit>('auto');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [datePickerVal, setDatePickerVal] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const unitLabels = useMemo(
    () => ({
      auto: tUI('unitAuto'),
      seconds: tUI('unitSec'),
      milliseconds: tUI('unitMs'),
      microseconds: tUI('unitUs'),
      nanoseconds: tUI('unitNs'),
      webkit17: tUI('unitWebkit17'),
      filetime18: tUI('unitFiletime18'),
    }),
    [tUI]
  );

  // Convert input string + unit into safe UTC milliseconds since 1970
  const { parsedMs, resolvedUnit, isValid, date } = useMemo(() => {
    const raw = timestampInput.trim();
    if (!raw) {
      return { parsedMs: 0, resolvedUnit: 'seconds' as TimestampUnit, isValid: false, date: null };
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      return { parsedMs: 0, resolvedUnit: 'seconds' as TimestampUnit, isValid: false, date: null };
    }

    let effUnit: Exclude<TimestampUnit, 'auto'>;
    if (unit === 'auto') {
      const abs = Math.abs(num);
      if (abs >= 1e18) effUnit = 'nanoseconds';
      else if (abs >= 1e17) effUnit = 'filetime18';
      else if (abs >= 1e16) effUnit = 'webkit17';
      else if (abs >= 1e14) effUnit = 'microseconds';
      else if (abs >= 1e11) effUnit = 'milliseconds';
      else effUnit = 'seconds';
    } else {
      effUnit = unit;
    }

    let ms = 0;
    if (effUnit === 'seconds') ms = num * 1000;
    else if (effUnit === 'milliseconds') ms = num;
    else if (effUnit === 'microseconds') ms = num / 1000;
    else if (effUnit === 'nanoseconds') ms = num / 1e6;
    else if (effUnit === 'webkit17') ms = num / 1000 - EPOCH_1601_TO_1970_MS;
    else if (effUnit === 'filetime18') ms = num / 10000 - EPOCH_1601_TO_1970_MS;

    if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) {
      return { parsedMs: ms, resolvedUnit: effUnit, isValid: false, date: null };
    }

    const d = new Date(ms);
    if (isNaN(d.getTime())) {
      return { parsedMs: ms, resolvedUnit: effUnit, isValid: false, date: null };
    }

    return { parsedMs: ms, resolvedUnit: effUnit, isValid: true, date: d };
  }, [timestampInput, unit]);

  const handleDatePickerChange = (val: string) => {
    setDatePickerVal(val);
    if (!val) return;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setUnit('seconds');
      setTimestampInput(String(Math.floor(d.getTime() / 1000)));
    }
  };

  const applySample = (val: string, targetUnit: TimestampUnit) => {
    setUnit(targetUnit);
    setTimestampInput(val);
  };

  const handleCopy = (key: string, val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const liveSeconds = Math.floor(nowMs / 1000);

  const epochOutputs = useMemo(() => {
    if (!isValid) return null;
    const sec = Math.floor(parsedMs / 1000);
    const ms = Math.round(parsedMs);
    const us = Math.round(parsedMs * 1000);
    const webkit17 = Math.round((parsedMs + EPOCH_1601_TO_1970_MS) * 1000);
    const filetime18 = Math.round((parsedMs + EPOCH_1601_TO_1970_MS) * 10000);

    return [
      { key: 'sec', label: tUI('rowSeconds'), val: String(sec) },
      { key: 'ms', label: tUI('rowMillis'), val: String(ms) },
      { key: 'us', label: tUI('rowMicros'), val: String(us) },
      { key: 'wk17', label: tUI('rowWebkit17'), val: String(webkit17) },
      { key: 'ft18', label: tUI('rowFiletime18'), val: String(filetime18) },
    ];
  }, [isValid, parsedMs, tUI]);

  const snippets = [
    { key: 'ex1', label: tUI('exExcelToDateLabel'), val: tUI('exExcelToDateVal') },
    { key: 'ex2', label: tUI('exExcelToUnixLabel'), val: tUI('exExcelToUnixVal') },
    { key: 'ex3', label: tUI('exPythonLabel'), val: tUI('exPythonVal') },
    { key: 'ex4', label: tUI('exSqlLabel'), val: tUI('exSqlVal') },
  ];

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= LIVE CLOCK & SAMPLE PRESETS ================= */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '8px 14px',
              flexWrap: 'wrap',
            }}
          >
            <Clock size={16} style={{ color: '#3b82f6' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
              {tUI('currentUnixTime')}
            </span>
            <code
              style={{
                color: '#34d399',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              {liveSeconds} {tUI('secondsUnit')}
            </code>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              ({nowMs} {tUI('millisUnit')})
            </span>
            <button
              onClick={() => applySample(String(liveSeconds), 'auto')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tUI('useNow')}
            </button>
          </div>

          {/* Sample Presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => applySample('13380000000000000', 'auto')}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tUI('presetChrome17')}
            </button>
            <button
              onClick={() => applySample('133800000000000000', 'auto')}
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                color: '#c4b5fd',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tUI('presetWin18')}
            </button>
            <button
              onClick={() => applySample('0', 'seconds')}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tUI('presetZero')}
            </button>
          </div>
        </div>

        {/* ================= MAIN CONVERTER CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Unit Switcher */}
          <div style={{ marginBottom: '18px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <label style={{ color: 'var(--text-main)', fontSize: '0.825rem', fontWeight: 600 }}>
                {tUI('unitLabel')}
              </label>
              {isValid && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#34d399',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {tUI('detectedBadge', { unit: unitLabels[resolvedUnit] })}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(Object.keys(unitLabels) as TimestampUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: unit === u ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor: unit === u ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    color: unit === u ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {unitLabels[u]}
                </button>
              ))}
            </div>
          </div>

          {/* Input & Reverse Picker Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '22px',
            }}
          >
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
                {tUI('unixTimestamp')}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder={tUI('placeholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}
              >
                <Calendar size={14} style={{ color: '#3b82f6' }} />
                {tUI('pickDate')}
              </label>
              <input
                type="datetime-local"
                value={datePickerVal}
                onChange={(e) => handleDatePickerChange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Parsed Outputs */}
          {!isValid || !date ? (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '14px',
                color: '#f87171',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {tUI('invalidTimestamp')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  key: 'local',
                  label: tUI('humanReadable'),
                  val: date.toString(),
                  color: '#34d399',
                },
                {
                  key: 'utc',
                  label: tUI('utcDateLabel'),
                  val: date.toUTCString(),
                  color: '#60a5fa',
                },
                {
                  key: 'iso',
                  label: tUI('isoDateLabel'),
                  val: date.toISOString(),
                  color: '#c4b5fd',
                },
                {
                  key: 'rel',
                  label: tUI('relativeLabel'),
                  val: formatRelativeTime(parsedMs, nowMs, locale),
                  color: '#fbbf24',
                },
              ].map((row) => (
                <div
                  key={row.key}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.9rem',
                        color: row.color,
                        marginTop: '3px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {row.val}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(row.key, row.val)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor:
                        copiedKey === row.key ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                      color: copiedKey === row.key ? '#ffffff' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedKey === row.key ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === row.key ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              ))}

              {/* All Equivalent Epoch Numeric Representations */}
              {epochOutputs && (
                <div
                  style={{
                    marginTop: '8px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '10px',
                    }}
                  >
                    {tUI('allEpochsTitle')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {epochOutputs.map((eo) => (
                      <div
                        key={eo.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {eo.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code
                            style={{
                              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                              fontSize: '0.85rem',
                              color: '#34d399',
                            }}
                          >
                            {eo.val}
                          </code>
                          <button
                            onClick={() => handleCopy(eo.key, eo.val)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: copiedKey === eo.key ? '#34d399' : 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px 4px',
                            }}
                            aria-label={tUI('copy')}
                          >
                            {copiedKey === eo.key ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= PYTHON, EXCEL & SQL EPOCH SNIPPETS ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Code2 size={18} style={{ color: '#3b82f6' }} />
              {tUI('codeTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tUI('codeSubtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {snippets.map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.825rem',
                      color: '#60a5fa',
                      marginTop: '4px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {s.val}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(s.key, s.val)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: copiedKey === s.key ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedKey === s.key ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedKey === s.key ? <Check size={13} /> : <Copy size={13} />}
                  {copiedKey === s.key ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="unix-timestamp-converter"
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
