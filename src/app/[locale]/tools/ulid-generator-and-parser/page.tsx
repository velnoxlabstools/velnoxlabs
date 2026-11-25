'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Zap,
  Search,
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

type UlidTabMode = 'generator' | 'decoder' | 'converter';

const CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

interface UlidParseResult {
  valid: boolean;
  clean: string;
  timestamp: number;
  date: string;
  isoDate: string;
  randomness: string;
  timestampPart: string;
  uuid: string;
  hex: string;
}

function encodeTime(ms: number): string {
  let t = Math.max(0, Math.min(281474976710655, Math.floor(ms)));
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = CHARS[t % 32] + out;
    t = Math.floor(t / 32);
  }
  return out;
}

function ulidToHex(cleanUlid: string): string {
  let bits130 = '';
  for (let i = 0; i < 26; i++) {
    const idx = CHARS.indexOf(cleanUlid[i]);
    bits130 += idx.toString(2).padStart(5, '0');
  }
  const bits128 = bits130.slice(2);
  let hex = '';
  for (let i = 0; i < 128; i += 4) {
    hex += parseInt(bits128.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

function formatHexToUuid(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function uuidToUlid(uuidInput: string): string | null {
  const cleanHex = uuidInput.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length !== 32) return null;
  let bits128 = '';
  for (let i = 0; i < 32; i++) {
    bits128 += parseInt(cleanHex[i], 16).toString(2).padStart(4, '0');
  }
  const bits130 = '00' + bits128;
  let ulid = '';
  for (let i = 0; i < 130; i += 5) {
    ulid += CHARS[parseInt(bits130.slice(i, i + 5), 2)];
  }
  return ulid;
}

function incrementBase32Digits(digits: number[]): boolean {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 31) {
      digits[i] += 1;
      return true;
    }
    digits[i] = 0;
  }
  return false; // Overflow
}

export default function UlidGeneratorParserPage() {
  const tUI = useTranslations('ToolUI.ulidGenerator');

  const [mode, setMode] = useState<UlidTabMode>('generator');

  // Mode 1: Generator
  const [count, setCount] = useState(5);
  const [seedMode, setSeedMode] = useState<'now' | 'custom'>('now');
  const [customMs, setCustomMs] = useState('1764000000000');
  const [monotonic, setMonotonic] = useState(true);
  const [lowercase, setLowercase] = useState(false);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [copiedGen, setCopiedGen] = useState(false);

  // Mode 2: Decoder & Validator
  const [parseInput, setParseInput] = useState('01ARZ3NDEKTSV4RRFFQ69G5FAV');

  // Mode 3: Converter (ULID <-> UUID)
  const [convUlid, setConvUlid] = useState('01ARZ3NDEKTSV4RRFFQ69G5FAV');
  const [convUuid, setConvUuid] = useState('01563e3a-b5d3-d676-4c61-efb99302bd5b');
  const [convError, setConvError] = useState('');
  const [copiedExIdx, setCopiedExIdx] = useState<number | null>(null);

  const generateUlids = useCallback(() => {
    const qty = Math.min(100, Math.max(1, count || 1));
    const baseMs =
      seedMode === 'custom' ? Math.max(0, parseInt(customMs, 10) || Date.now()) : Date.now();
    const out: string[] = [];

    let lastTime = baseMs;
    const randDigits = new Array<number>(16).fill(0);
    const seedArr = new Uint32Array(16);

    for (let i = 0; i < qty; i++) {
      const currentMs = seedMode === 'custom' ? lastTime : Math.max(lastTime, Date.now());
      if (i === 0 || (!monotonic && currentMs > lastTime) || (!monotonic && seedMode === 'now')) {
        crypto.getRandomValues(seedArr);
        for (let j = 0; j < 16; j++) randDigits[j] = seedArr[j] % 32;
        lastTime = currentMs;
      } else {
        // Strict monotonic increment within same millisecond
        if (currentMs > lastTime) {
          crypto.getRandomValues(seedArr);
          for (let j = 0; j < 16; j++) randDigits[j] = seedArr[j] % 32;
          lastTime = currentMs;
        } else {
          const ok = incrementBase32Digits(randDigits);
          if (!ok) {
            lastTime += 1;
            crypto.getRandomValues(seedArr);
            for (let j = 0; j < 16; j++) randDigits[j] = seedArr[j] % 32;
          }
        }
      }

      const timeStr = encodeTime(lastTime);
      const randStr = randDigits.map((d) => CHARS[d]).join('');
      const full = timeStr + randStr;
      out.push(lowercase ? full.toLowerCase() : full);
    }

    setGeneratedList(out);
  }, [count, seedMode, customMs, monotonic, lowercase]);

  useEffect(() => {
    generateUlids();
  }, [generateUlids]);

  // Decoder & Spec Validator logic
  const { parseResult, parseError } = useMemo<{
    parseResult: UlidParseResult | null;
    parseError: string;
  }>(() => {
    if (!parseInput.trim()) return { parseResult: null, parseError: '' };
    const clean = parseInput.trim().toUpperCase();

    if (clean.length !== 26) {
      return { parseResult: null, parseError: tUI('invalidLength', { length: clean.length }) };
    }
    if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(clean)) {
      return { parseResult: null, parseError: tUI('invalidChars') };
    }
    if (!/^[0-7]/.test(clean)) {
      return { parseResult: null, parseError: tUI('invalidOverflow') };
    }

    let time = 0;
    for (let i = 0; i < 10; i++) {
      time = time * 32 + CHARS.indexOf(clean[i]);
    }
    const date = new Date(time);
    const hex = ulidToHex(clean);

    return {
      parseResult: {
        valid: true,
        clean,
        timestamp: time,
        date: date.toString(),
        isoDate: date.toISOString(),
        randomness: clean.substring(10),
        timestampPart: clean.substring(0, 10),
        uuid: formatHexToUuid(hex),
        hex,
      },
      parseError: '',
    };
  }, [parseInput, tUI]);

  // Converter Handlers
  const handleConvertUlidToUuid = () => {
    setConvError('');
    const clean = convUlid.trim().toUpperCase();
    if (clean.length !== 26) {
      setConvError(tUI('invalidLength', { length: clean.length }));
      return;
    }
    if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(clean)) {
      setConvError(tUI('invalidChars'));
      return;
    }
    if (!/^[0-7]/.test(clean)) {
      setConvError(tUI('invalidOverflow'));
      return;
    }
    const hex = ulidToHex(clean);
    setConvUuid(formatHexToUuid(hex));
  };

  const handleConvertUuidToUlid = () => {
    setConvError('');
    const res = uuidToUlid(convUuid);
    if (!res) {
      setConvError(tUI('invalidUuid'));
      return;
    }
    setConvUlid(lowercase ? res.toLowerCase() : res);
  };

  const handleCopyList = () => {
    if (generatedList.length === 0) return;
    navigator.clipboard.writeText(generatedList.join('\n'));
    setCopiedGen(true);
    setTimeout(() => setCopiedGen(false), 2000);
  };

  const handleExport = (fmt: 'txt' | 'json') => {
    if (generatedList.length === 0) return;
    const content =
      fmt === 'json' ? JSON.stringify(generatedList, null, 2) : generatedList.join('\n');
    const mime = fmt === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulids.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const snippets = [
    { label: tUI('exCanonicalLabel'), val: tUI('exCanonicalVal') },
    { label: tUI('exNpmLabel'), val: tUI('exNpmVal') },
    { label: tUI('exJavaLabel'), val: tUI('exJavaVal') },
    { label: tUI('exPythonLabel'), val: tUI('exPythonVal') },
  ];

  const handleCopySnippet = (val: string, idx: number) => {
    navigator.clipboard.writeText(val);
    setCopiedExIdx(idx);
    setTimeout(() => setCopiedExIdx(null), 2000);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= MODE NAVIGATION TABS ================= */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <button
            onClick={() => setMode('generator')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'generator' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'generator' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'generator' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <Zap size={16} />
            {tUI('modeGenerator')}
          </button>

          <button
            onClick={() => setMode('decoder')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'decoder' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'decoder' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'decoder' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <Search size={16} />
            {tUI('modeDecoder')}
          </button>

          <button
            onClick={() => setMode('converter')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'converter' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'converter' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'converter' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <ArrowLeftRight size={16} />
            {tUI('modeConverter')}
          </button>
        </div>

        {/* ================= MAIN WORKSPACE CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* MODE 1: ULID GENERATOR */}
          {mode === 'generator' && (
            <div>
              {/* Controls Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '18px',
                }}
              >
                {/* Quantity */}
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('countLabel')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    {[1, 5, 10, 25, 50].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCount(c)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: count === c ? '#3b82f6' : 'var(--border-color)',
                          backgroundColor:
                            count === c ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                          color: count === c ? '#60a5fa' : 'var(--text-muted)',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) =>
                      setCount(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '8px 10px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                {/* Timestamp Seed */}
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('timestampSeedLabel')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <button
                      onClick={() => setSeedMode('now')}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: seedMode === 'now' ? '#3b82f6' : 'var(--border-color)',
                        backgroundColor:
                          seedMode === 'now' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: seedMode === 'now' ? '#60a5fa' : 'var(--text-muted)',
                      }}
                    >
                      {tUI('seedNow')}
                    </button>
                    <button
                      onClick={() => setSeedMode('custom')}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: seedMode === 'custom' ? '#3b82f6' : 'var(--border-color)',
                        backgroundColor:
                          seedMode === 'custom' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: seedMode === 'custom' ? '#60a5fa' : 'var(--text-muted)',
                      }}
                    >
                      {tUI('seedCustom')}
                    </button>
                  </div>
                  {seedMode === 'custom' && (
                    <input
                      type="number"
                      value={customMs}
                      onChange={(e) => setCustomMs(e.target.value)}
                      placeholder={tUI('customMsPlaceholder')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={monotonic}
                    onChange={(e) => setMonotonic(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('monotonicLabel')}
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('lowercaseLabel')}
                </label>
              </div>

              {/* Action Bar & Output */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <label
                    style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {tUI('generatedUlids')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={generateUlids}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={12} />
                      {tUI('regenerateBtn')}
                    </button>
                    <button
                      onClick={() => handleExport('txt')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={12} />
                      {tUI('exportTxt')}
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={12} />
                      {tUI('exportJson')}
                    </button>
                    <button
                      onClick={handleCopyList}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: copiedGen ? '#059669' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedGen ? <Check size={12} /> : <Copy size={12} />}
                      {copiedGen ? tUI('copied') : tUI('copy')}
                    </button>
                  </div>
                </div>

                <textarea
                  value={generatedList.join('\n')}
                  readOnly
                  rows={8}
                  placeholder={tUI('outputPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#34d399',
                    padding: '14px',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* MODE 2: DECODER & STRICT VALIDATOR */}
          {mode === 'decoder' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {tUI('parseHeading')}
                </h3>
                <button
                  onClick={() => setParseInput('01ARZ3NDEKTSV4RRFFQ69G5FAV')}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tUI('loadSampleBtn')}
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('parseInputLabel')}
                </label>
                <input
                  type="text"
                  value={parseInput}
                  onChange={(e) => setParseInput(e.target.value)}
                  placeholder={tUI('parsePlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 14px',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: '1rem',
                    letterSpacing: '0.06em',
                    outline: 'none',
                  }}
                />
                {parseError && (
                  <p
                    style={{
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginTop: '8px',
                    }}
                  >
                    {parseError}
                  </p>
                )}
              </div>

              {parseResult ? (
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '18px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '14px' }}>
                    ✓ {tUI('validUlid')}
                  </div>

                  {/* Color-coded ULID Anatomy */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'monospace',
                      fontSize: '1.15rem',
                      letterSpacing: '0.08em',
                      marginBottom: '16px',
                      wordBreak: 'break-all',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                      {parseResult.timestampPart}
                    </span>
                    <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
                      {parseResult.randomness}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('timestampPart')} </span>
                      <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                        {parseResult.timestampPart}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('randomnessPart')} </span>
                      <strong style={{ color: '#c4b5fd', fontFamily: 'monospace' }}>
                        {parseResult.randomness}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('unixTimestamp')} </span>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {parseResult.timestamp}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('iso8601')} </span>
                      <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {parseResult.isoDate}
                      </strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('generatedOn')} </span>
                      <span style={{ color: 'var(--text-main)' }}>{parseResult.date}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('equivalentUuid')} </span>
                      <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>
                        {parseResult.uuid}
                      </strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tUI('equivalentHex')} </span>
                      <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {parseResult.hex}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                !parseError && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '20px',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    {tUI('pasteUlidPrompt')}
                  </div>
                )
              )}
            </div>
          )}

          {/* MODE 3: 128-BIT LOSSLESS ULID <-> UUID CONVERTER */}
          {mode === 'converter' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('convUlidLabel')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={convUlid}
                    onChange={(e) => setConvUlid(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                    }}
                  />
                  <button
                    onClick={handleConvertUlidToUuid}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('convUlidToUuid')}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('convUuidLabel')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={convUuid}
                    onChange={(e) => setConvUuid(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#34d399',
                      padding: '10px 12px',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                    }}
                  />
                  <button
                    onClick={handleConvertUuidToUlid}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('convUuidToUlid')}
                  </button>
                </div>
              </div>

              {convError && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                  {convError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= ULID VS UUID COMPARISON & CODE SNIPPETS ================= */}
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
              <BookOpen size={18} style={{ color: '#3b82f6' }} />
              {tUI('vsTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tUI('vsSubtitle')}</p>
          </div>

          {/* Comparison Table */}
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.825rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px', color: 'var(--text-muted)' }}>
                    {tUI('colMetric')}
                  </th>
                  <th style={{ padding: '10px', color: '#60a5fa' }}>{tUI('colUlid')}</th>
                  <th style={{ padding: '10px', color: '#c4b5fd' }}>{tUI('colUuid')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: tUI('rowSize'), ulid: tUI('val128'), uuid: tUI('val128') },
                  { metric: tUI('rowLen'), ulid: tUI('rowLenUlid'), uuid: tUI('rowLenUuid') },
                  { metric: tUI('rowSort'), ulid: tUI('rowSortUlid'), uuid: tUI('rowSortUuid') },
                  { metric: tUI('rowDb'), ulid: tUI('rowDbUlid'), uuid: tUI('rowDbUuid') },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {r.metric}
                    </td>
                    <td style={{ padding: '10px', color: '#34d399' }}>{r.ulid}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{r.uuid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Code Snippets & Canonical Example */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {snippets.map((ex, idx) => (
              <div
                key={idx}
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
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ex.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.825rem',
                      color: '#34d399',
                      marginTop: '4px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {ex.val}
                  </div>
                </div>
                <button
                  onClick={() => handleCopySnippet(ex.val, idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: copiedExIdx === idx ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedExIdx === idx ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedExIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                  {copiedExIdx === idx ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="ulid-generator-and-parser"
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
