'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  Download,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type UuidVersion = 'v4' | 'v7';
type OutputStyle = 'standard' | 'short' | 'braces' | 'urn';
type ActiveTab = 'generator' | 'validator';

function generateUuidBytes(version: UuidVersion): Uint8Array {
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  }
  if (version === 'v7') {
    const ms = BigInt(Date.now());
    bytes[0] = Number((ms >> BigInt(40)) & BigInt(0xff));
    bytes[1] = Number((ms >> BigInt(32)) & BigInt(0xff));
    bytes[2] = Number((ms >> BigInt(24)) & BigInt(0xff));
    bytes[3] = Number((ms >> BigInt(16)) & BigInt(0xff));
    bytes[4] = Number((ms >> BigInt(8)) & BigInt(0xff));
    bytes[5] = Number(ms & BigInt(0xff));
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
  } else {
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
  }
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToCanonical(bytes: Uint8Array): string {
  const h = bytesToHex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function bytesToShortUuid(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function shortUuidToBytes(shortStr: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]{22}$/.test(shortStr)) return null;
  try {
    const base64 = shortStr.replace(/-/g, '+').replace(/_/g, '/') + '==';
    const binary = atob(base64);
    if (binary.length !== 16) return null;
    const out = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

function formatUuidOutput(
  bytes: Uint8Array,
  style: OutputStyle,
  uppercase: boolean,
  hyphens: boolean
): string {
  if (style === 'short') {
    return bytesToShortUuid(bytes);
  }
  const hex = bytesToHex(bytes);
  let body = hyphens
    ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    : hex;
  if (uppercase) {
    body = body.toUpperCase();
  }
  if (style === 'braces') return `{${body}}`;
  if (style === 'urn') return `urn:uuid:${body}`;
  return body;
}

interface InspectedUuid {
  valid: boolean;
  canonical: string;
  shortUuid: string;
  version: number | null;
  variant: string;
  timestampIso: string | null;
}

function inspectUuidInput(raw: string): InspectedUuid {
  let cleaned = raw.trim();
  if (!cleaned) {
    return {
      valid: false,
      canonical: '',
      shortUuid: '',
      version: null,
      variant: '',
      timestampIso: null,
    };
  }
  if (cleaned.toLowerCase().startsWith('urn:uuid:')) {
    cleaned = cleaned.slice(9);
  }
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    cleaned = cleaned.slice(1, -1);
  }

  let bytes: Uint8Array | null = shortUuidToBytes(cleaned);
  if (!bytes) {
    const hexOnly = cleaned.replace(/-/g, '');
    if (/^[0-9a-fA-F]{32}$/.test(hexOnly)) {
      const hasValidHyphens =
        !cleaned.includes('-') ||
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          cleaned
        );
      if (hasValidHyphens) {
        bytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
          bytes[i] = parseInt(hexOnly.slice(i * 2, i * 2 + 2), 16);
        }
      }
    }
  }

  if (!bytes) {
    return {
      valid: false,
      canonical: '',
      shortUuid: '',
      version: null,
      variant: '',
      timestampIso: null,
    };
  }

  const version = (bytes[6] >> 4) & 0x0f;
  const varByte = bytes[8];
  let variant = 'RFC 4122 / 9562';
  if ((varByte & 0x80) === 0) {
    variant = 'NCS (Reserved)';
  } else if ((varByte & 0xc0) === 0x80) {
    variant = 'RFC 4122 / 9562';
  } else if ((varByte & 0xe0) === 0xc0) {
    variant = 'Microsoft GUID';
  } else {
    variant = 'Reserved (Future)';
  }

  let timestampIso: string | null = null;
  if (version === 7) {
    const ms =
      (BigInt(bytes[0]) << BigInt(40)) |
      (BigInt(bytes[1]) << BigInt(32)) |
      (BigInt(bytes[2]) << BigInt(24)) |
      (BigInt(bytes[3]) << BigInt(16)) |
      (BigInt(bytes[4]) << BigInt(8)) |
      BigInt(bytes[5]);
    const date = new Date(Number(ms));
    if (!Number.isNaN(date.getTime())) {
      timestampIso = date.toISOString();
    }
  }

  return {
    valid: true,
    canonical: bytesToCanonical(bytes),
    shortUuid: bytesToShortUuid(bytes),
    version,
    variant,
    timestampIso,
  };
}

export default function UuidGeneratorPage() {
  const tUI = useTranslations('ToolUI.uuidGenerator');
  const tTools = useTranslations('Tools');

  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [style, setStyle] = useState<OutputStyle>('standard');
  const [rawList, setRawList] = useState<Uint8Array[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [validatorInput, setValidatorInput] = useState('550e8400-e29b-41d4-a716-446655440000');

  const generateUuids = useCallback(() => {
    const safeCount = Math.min(1000, Math.max(1, count));
    const list: Uint8Array[] = [];
    for (let i = 0; i < safeCount; i++) {
      list.push(generateUuidBytes(version));
    }
    setRawList(list);
  }, [count, version]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const formattedUuids = useMemo(
    () => rawList.map((b) => formatUuidOutput(b, style, uppercase, hyphens)),
    [rawList, style, uppercase, hyphens]
  );

  const inspected = useMemo(() => inspectUuidInput(validatorInput), [validatorInput]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = (ext: 'txt' | 'json') => {
    if (formattedUuids.length === 0) return;
    const content =
      ext === 'json' ? JSON.stringify(formattedUuids, null, 2) : formattedUuids.join('\n');
    const mime = ext === 'json' ? 'application/json' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <GlobalContainer maxWidth="2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Fingerprint size={24} />
          </div>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tUI('tabGenerator')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('validator')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'validator'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tUI('tabValidator')}
          </button>
        </div>

        {activeTab === 'generator' ? (
          <>
            {/* Controls Card */}
            <div
              className="rounded-xl border p-5 mb-6"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* Version + Quantity + Quick Counts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div className="lg:col-span-5">
                  <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                    {tUI('versionLabel')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setVersion('v4')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        version === 'v4'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tUI('versionV4')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVersion('v7')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        version === 'v7'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tUI('versionV7')}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <label
                    htmlFor="uuid-count"
                    className="block text-xs font-semibold text-[var(--text-secondary)] mb-2"
                  >
                    {tUI('howMany')}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id="uuid-count"
                      type="number"
                      min={1}
                      max={1000}
                      value={count}
                      onChange={(e) =>
                        setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-28 px-3 py-2 rounded-lg border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    {[1, 5, 10, 50, 100, 500].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                          count === n
                            ? 'bg-blue-500 text-white'
                            : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style & Case Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1">
                    {tUI('styleLabel')}
                  </span>
                  {(
                    [
                      ['standard', tUI('styleStandard')],
                      ['short', tUI('styleShort')],
                      ['braces', tUI('styleBraces')],
                      ['urn', tUI('styleUrn')],
                    ] as Array<[OutputStyle, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStyle(key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        style === key
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label
                    className={`inline-flex items-center gap-2 text-xs font-medium select-none ${
                      style === 'short'
                        ? 'opacity-40 cursor-not-allowed text-[var(--text-secondary)]'
                        : 'cursor-pointer text-[var(--text-secondary)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={uppercase}
                      disabled={style === 'short'}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    {tUI('uppercaseLabel')}
                  </label>
                  <label
                    className={`inline-flex items-center gap-2 text-xs font-medium select-none ${
                      style === 'short'
                        ? 'opacity-40 cursor-not-allowed text-[var(--text-secondary)]'
                        : 'cursor-pointer text-[var(--text-secondary)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={hyphens}
                      disabled={style === 'short'}
                      onChange={(e) => setHyphens(e.target.checked)}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    {tUI('hyphensLabel')}
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={generateUuids}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors"
                >
                  <RefreshCw size={15} />
                  {tUI('generateBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('all', formattedUuids.join('\n'))}
                  disabled={formattedUuids.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  {copiedKey === 'all' ? <Check size={15} /> : <Copy size={15} />}
                  {copiedKey === 'all' ? tUI('allCopied') : tUI('copyAll')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('txt')}
                  disabled={formattedUuids.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  {tUI('downloadTxt')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('json')}
                  disabled={formattedUuids.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  {tUI('downloadJson')}
                </button>
              </div>
            </div>

            {/* Generated List */}
            <div
              className="rounded-xl border p-4 mb-6 max-h-[480px] overflow-y-auto space-y-2"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {formattedUuids.map((uuid, idx) => (
                <div
                  key={`${idx}-${uuid}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <span className="font-mono text-sm text-emerald-400 break-all">{uuid}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`item-${idx}`, uuid)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] shrink-0 cursor-pointer"
                  >
                    {copiedKey === `item-${idx}` ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedKey === `item-${idx}` ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              ))}
            </div>

            {/* Quick v4 vs v7 Comparison Box */}
            <div
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-[var(--text-secondary)]">
                <div className="font-semibold text-[var(--text-primary)]">
                  {tUI('compareTitle')}
                </div>
                <p>{tUI('compareV4')}</p>
                <p>{tUI('compareV7')}</p>
              </div>
            </div>
          </>
        ) : (
          /* Validator & Inspector Tab */
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <label
              htmlFor="uuid-validator-input"
              className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
            >
              {tUI('validatorLabel')}
            </label>
            <input
              id="uuid-validator-input"
              type="text"
              value={validatorInput}
              onChange={(e) => setValidatorInput(e.target.value)}
              placeholder={tUI('validatorPlaceholder')}
              className="w-full p-3.5 rounded-xl border font-mono text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: inspected.valid ? '#10b981' : '#ef4444',
                color: 'var(--text-primary)',
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--text-secondary)] mb-1.5">
                  {tUI('valStatusLabel')}
                </div>
                <div className="flex items-center gap-2">
                  {inspected.valid ? (
                    <ShieldCheck size={18} className="text-emerald-400" />
                  ) : (
                    <ShieldAlert size={18} className="text-red-400" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      inspected.valid ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {inspected.valid ? tUI('valValidBadge') : tUI('valInvalidBadge')}
                  </span>
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--text-secondary)] mb-1.5">
                  {tUI('valVersionLabel')}
                </div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {inspected.valid && inspected.version !== null
                    ? `UUID v${inspected.version}`
                    : '—'}
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--text-secondary)] mb-1.5">
                  {tUI('valVariantLabel')}
                </div>
                <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
                  {inspected.valid ? inspected.variant : '—'}
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="text-xs text-[var(--text-secondary)] mb-1.5">
                  {tUI('valTimestampLabel')}
                </div>
                <div className="text-xs font-mono text-emerald-400 break-all">
                  {inspected.valid ? inspected.timestampIso || tUI('valNoTimestamp') : '—'}
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {tUI('valCanonicalLabel')}
                  </span>
                  {inspected.valid && (
                    <button
                      type="button"
                      onClick={() => handleCopy('val-canon', inspected.canonical)}
                      className="text-xs text-blue-400 cursor-pointer"
                    >
                      {copiedKey === 'val-canon' ? tUI('copied') : tUI('copy')}
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono text-[var(--text-primary)] break-all">
                  {inspected.valid ? inspected.canonical : '—'}
                </div>
              </div>

              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {tUI('valShortLabel')}
                  </span>
                  {inspected.valid && (
                    <button
                      type="button"
                      onClick={() => handleCopy('val-short', inspected.shortUuid)}
                      className="text-xs text-blue-400 cursor-pointer"
                    >
                      {copiedKey === 'val-short' ? tUI('copied') : tUI('copy')}
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono text-[var(--text-primary)] break-all">
                  {inspected.valid ? inspected.shortUuid : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        <ToolSeoContent
          toolSlug="uuid-generator"
          toolName={tTools('uuid-generator.name')}
          description={tTools('uuid-generator.description')}
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
      </GlobalContainer>
    </div>
  );
}
