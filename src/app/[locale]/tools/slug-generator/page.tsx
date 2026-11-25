'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Link2,
  List,
  Shuffle,
  Copy,
  Check,
  Download,
  RefreshCw,
  Trash2,
  BookOpen,
  Globe,
} from 'lucide-react';

type SlugMode = 'single' | 'bulk' | 'random';

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
]);

const ADJECTIVES = [
  'amber',
  'bright',
  'calm',
  'clever',
  'cosmic',
  'crisp',
  'cyan',
  'dynamic',
  'electric',
  'emerald',
  'epic',
  'fast',
  'fierce',
  'golden',
  'grand',
  'happy',
  'hyper',
  'iron',
  'keen',
  'lunar',
  'magic',
  'mighty',
  'modern',
  'neon',
  'noble',
  'prime',
  'pure',
  'quantum',
  'quick',
  'quiet',
  'rapid',
  'royal',
  'sharp',
  'silent',
  'silver',
  'smart',
  'solar',
  'solid',
  'sonic',
  'stellar',
  'swift',
  'turbo',
  'ultra',
  'velvet',
  'vibrant',
  'vivid',
  'wild',
  'zen',
];

const NOUNS = [
  'anchor',
  'aurora',
  'beacon',
  'blaze',
  'breeze',
  'bridge',
  'canyon',
  'cascade',
  'cipher',
  'cloud',
  'comet',
  'compass',
  'coral',
  'crest',
  'crystal',
  'delta',
  'eagle',
  'echo',
  'eclipse',
  'ember',
  'falcon',
  'flame',
  'forest',
  'galaxy',
  'glacier',
  'harbor',
  'horizon',
  'island',
  'lantern',
  'meteor',
  'mirage',
  'mountain',
  'nebula',
  'nexus',
  'oasis',
  'ocean',
  'orbit',
  'phoenix',
  'pioneer',
  'planet',
  'prism',
  'pulsar',
  'quartz',
  'river',
  'rocket',
  'sapphire',
  'spark',
  'summit',
  'thunder',
  'titan',
  'trail',
  'valley',
  'velocity',
  'vortex',
  'zenith',
  'zephyr',
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function randomShortId(len = 5): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[getSecureRandomInt(chars.length)];
  }
  return out;
}

function generateSlug(
  text: string,
  separator: string,
  caseType: string,
  removeStopWords: boolean,
  removeNumbers: boolean,
  maxLength: number,
  suffix?: string
): string {
  const sepEsc = escapeRegex(separator);
  let slug = text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_.-]+/g, separator);

  if (removeNumbers) {
    slug = slug.replace(/[0-9]/g, '');
  }

  let parts = slug.split(separator).filter(Boolean);

  if (removeStopWords) {
    parts = parts.filter((p) => !STOP_WORDS.has(p.toLowerCase()));
  }

  slug = parts.join(separator);
  slug = slug.replace(new RegExp(`^${sepEsc}+|${sepEsc}+$`, 'g'), '');

  // Clean word-boundary truncation if maxLength > 0
  if (maxLength > 0 && slug.length > maxLength) {
    const sliced = slug.slice(0, maxLength);
    const lastSep = sliced.lastIndexOf(separator);
    slug = lastSep > 0 ? sliced.slice(0, lastSep) : sliced;
  }

  if (suffix) {
    slug = slug ? `${slug}${separator}${suffix}` : suffix;
  }

  if (caseType === 'upper') {
    slug = slug.toUpperCase();
  } else if (caseType === 'title') {
    slug = slug
      .split(separator)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(separator);
  } else {
    slug = slug.toLowerCase();
  }

  return slug;
}

export default function SlugGeneratorPage() {
  const tUI = useTranslations('ToolUI.slugGenerator');

  const [mode, setMode] = useState<SlugMode>('single');

  // Shared Options
  const [separator, setSeparator] = useState('-');
  const [caseType, setCaseType] = useState('lower');
  const [maxLength, setMaxLength] = useState(0);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [addRandomSuffix, setAddRandomSuffix] = useState(false);
  const [suffixSeed, setSuffixSeed] = useState('');

  // Single Mode
  const [text, setText] = useState('Hello World! This is VelnoxLabs 2026 Blog Post');
  const [baseUrl, setBaseUrl] = useState('https://example.com/blog/');
  const [copied, setCopied] = useState(false);

  // Bulk Mode
  const [bulkText, setBulkText] = useState(
    'How to Build an App in 2026\nBest Wireless Headphones Under $100\nComplete Guide to Next.js SEO'
  );
  const [bulkCopied, setBulkCopied] = useState(false);

  // Random Mode
  const [randomCount, setRandomCount] = useState(5);
  const [randomPrefix, setRandomPrefix] = useState('');
  const [randomIncludeNum, setRandomIncludeNum] = useState(true);
  const [randomSlugs, setRandomSlugs] = useState<string[]>([]);
  const [randomCopiedAll, setRandomCopiedAll] = useState(false);

  // Reference Examples copy state
  const [copiedExIdx, setCopiedExIdx] = useState<number | null>(null);

  useEffect(() => {
    setSuffixSeed(randomShortId(5));
  }, []);

  const refreshSuffix = () => setSuffixSeed(randomShortId(5));

  // Generate Random Slugs
  const handleGenerateRandom = useCallback(() => {
    const out: string[] = [];
    const cleanPrefix = randomPrefix
      ? generateSlug(randomPrefix, separator, 'lower', false, false, 0)
      : '';
    for (let i = 0; i < randomCount; i++) {
      const adj = ADJECTIVES[getSecureRandomInt(ADJECTIVES.length)];
      const noun = NOUNS[getSecureRandomInt(NOUNS.length)];
      const tokens = cleanPrefix ? [cleanPrefix, adj, noun] : [adj, noun];
      if (randomIncludeNum) {
        tokens.push((getSecureRandomInt(900) + 100).toString());
      }
      let s = tokens.join(separator);
      if (caseType === 'upper') s = s.toUpperCase();
      else if (caseType === 'title') {
        s = s
          .split(separator)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(separator);
      }
      out.push(s);
    }
    setRandomSlugs(out);
  }, [randomCount, randomPrefix, randomIncludeNum, separator, caseType]);

  useEffect(() => {
    handleGenerateRandom();
  }, [handleGenerateRandom]);

  // Single Computed Slug
  const singleSlug = useMemo(() => {
    return generateSlug(
      text,
      separator,
      caseType,
      removeStopWords,
      removeNumbers,
      maxLength,
      addRandomSuffix ? suffixSeed : undefined
    );
  }, [
    text,
    separator,
    caseType,
    removeStopWords,
    removeNumbers,
    maxLength,
    addRandomSuffix,
    suffixSeed,
  ]);

  // Full Live Preview URL
  const fullPreviewUrl = useMemo(() => {
    const cleanBase = baseUrl.trim().replace(/\/+$/, '');
    if (!cleanBase) return `/${singleSlug}`;
    return `${cleanBase}/${singleSlug}`;
  }, [baseUrl, singleSlug]);

  // Bulk Computed Slugs
  const bulkPairs = useMemo(() => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((line, i) => ({
      source: line,
      slug: generateSlug(
        line,
        separator,
        caseType,
        removeStopWords,
        removeNumbers,
        maxLength,
        addRandomSuffix ? `${suffixSeed}${i + 1}` : undefined
      ),
    }));
  }, [
    bulkText,
    separator,
    caseType,
    removeStopWords,
    removeNumbers,
    maxLength,
    addRandomSuffix,
    suffixSeed,
  ]);

  // SEO Length Status
  const seoStatus = useMemo(() => {
    const len = singleSlug.length;
    if (len === 0) return null;
    if (len <= 60)
      return { label: tUI('seoOptimal'), color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    if (len <= 75)
      return { label: tUI('seoGood'), color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' };
    return { label: tUI('seoLong'), color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
  }, [singleSlug, tUI]);

  const handleCopySingle = () => {
    if (!singleSlug) return;
    navigator.clipboard.writeText(singleSlug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBulkAll = () => {
    if (bulkPairs.length === 0) return;
    navigator.clipboard.writeText(bulkPairs.map((p) => p.slug).join('\n'));
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  };

  const handleExportBulk = (format: 'txt' | 'csv') => {
    if (bulkPairs.length === 0) return;
    let content = '';
    let mime = 'text/plain;charset=utf-8';
    if (format === 'csv') {
      const rows = bulkPairs.map(
        (p) => `"${p.source.replace(/"/g, '""')}","${p.slug.replace(/"/g, '""')}"`
      );
      content = `"Source","Slug"\n${rows.join('\n')}`;
      mime = 'text/csv;charset=utf-8';
    } else {
      content = bulkPairs.map((p) => p.slug).join('\n');
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slugs-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRandomAll = () => {
    if (randomSlugs.length === 0) return;
    navigator.clipboard.writeText(randomSlugs.join('\n'));
    setRandomCopiedAll(true);
    setTimeout(() => setRandomCopiedAll(false), 2000);
  };

  const presets = [
    'Hello World! This is VelnoxLabs 2026 Blog Post',
    'Top 10 Best Coffee Shops in New York',
    'How to Build a Website from Scratch',
    'The Ultimate Guide to SEO & Café Recipes',
  ];

  const examplesList = [
    { label: tUI('exGoodBlogLabel'), val: tUI('exGoodBlogVal'), good: true },
    { label: tUI('exBadBlogLabel'), val: tUI('exBadBlogVal'), good: false },
    { label: tUI('exEcomLabel'), val: tUI('exEcomVal'), good: true },
    { label: tUI('exNpmLabel'), val: tUI('exNpmVal'), good: true },
    { label: tUI('exJsLabel'), val: tUI('exJsVal'), good: true },
  ];

  const handleCopyExample = (val: string, idx: number) => {
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
            onClick={() => setMode('single')}
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
              borderColor: mode === 'single' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'single' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'single' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <Link2 size={16} />
            {tUI('modeSingle')}
          </button>

          <button
            onClick={() => setMode('bulk')}
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
              borderColor: mode === 'bulk' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'bulk' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'bulk' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <List size={16} />
            {tUI('modeBulk')}
          </button>

          <button
            onClick={() => setMode('random')}
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
              borderColor: mode === 'random' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'random' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'random' ? '#60a5fa' : 'var(--text-muted)',
            }}
          >
            <Shuffle size={16} />
            {tUI('modeRandom')}
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
          {/* MODE 1: TEXT TO SLUG */}
          {mode === 'single' && (
            <div>
              {/* Quick Sample Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setText(p)}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Input Textarea + Base URL */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '16px',
                  marginBottom: '18px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {tUI('textInput')}
                    </label>
                    <button
                      onClick={() => setText('')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={11} />
                      {tUI('clear')}
                    </button>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={tUI('placeholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontSize: '0.925rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
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
                    {tUI('baseUrlLabel')}
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: BULK SLUG GENERATOR */}
          {mode === 'bulk' && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {tUI('bulkInputLabel')}
                </label>
                <button
                  onClick={() => setBulkText('')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={11} />
                  {tUI('clear')}
                </button>
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={5}
                placeholder={tUI('bulkPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* MODE 3: RANDOM SLUG GENERATOR CONTROLS */}
          {mode === 'random' && (
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
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('randomCountLabel')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 5, 10, 20].map((c) => (
                    <button
                      key={c}
                      onClick={() => setRandomCount(c)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          randomCount === c ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                        color: randomCount === c ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
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
                  {tUI('randomPrefixLabel')}
                </label>
                <input
                  type="text"
                  value={randomPrefix}
                  onChange={(e) => setRandomPrefix(e.target.value)}
                  placeholder={tUI('randomPrefixPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    paddingBottom: '6px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={randomIncludeNum}
                    onChange={(e) => setRandomIncludeNum(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('randomIncludeNum')}
                </label>
              </div>
            </div>
          )}

          {/* ================= SHARED CONFIGURATION OPTIONS ================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
            {/* Separator */}
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
                {tUI('separator')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { v: '-', l: tUI('hyphen') },
                  { v: '_', l: tUI('underscore') },
                  { v: '.', l: tUI('dot') },
                ].map((s) => (
                  <button
                    key={s.v}
                    onClick={() => setSeparator(s.v)}
                    style={{
                      flex: 1,
                      backgroundColor:
                        separator === s.v ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                      color: separator === s.v ? '#60a5fa' : 'var(--text-muted)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '7px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Case */}
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
                {tUI('case')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { v: 'lower', l: tUI('lower') },
                  { v: 'upper', l: tUI('upper') },
                  { v: 'title', l: tUI('titleCase') },
                ].map((c) => (
                  <button
                    key={c.v}
                    onClick={() => setCaseType(c.v)}
                    style={{
                      flex: 1,
                      backgroundColor:
                        caseType === c.v ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                      color: caseType === c.v ? '#60a5fa' : 'var(--text-muted)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '7px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {c.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Length Trim (for single/bulk) */}
            {mode !== 'random' && (
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
                  {tUI('maxLengthLabel')}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { v: 0, l: tUI('maxNone') },
                    { v: 50, l: tUI('max50') },
                    { v: 60, l: tUI('max60') },
                    { v: 75, l: tUI('max75') },
                  ].map((m) => (
                    <button
                      key={m.v}
                      onClick={() => setMaxLength(m.v)}
                      style={{
                        flex: 1,
                        backgroundColor:
                          maxLength === m.v ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                        color: maxLength === m.v ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes (for single/bulk) */}
          {mode !== 'random' && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '20px' }}>
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
                  checked={removeStopWords}
                  onChange={(e) => setRemoveStopWords(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                {tUI('removeStopWords')}
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
                  checked={removeNumbers}
                  onChange={(e) => setRemoveNumbers(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                {tUI('removeNumbers')}
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
                  checked={addRandomSuffix}
                  onChange={(e) => {
                    setAddRandomSuffix(e.target.checked);
                    if (e.target.checked) refreshSuffix();
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                />
                {tUI('addRandomSuffix')}
              </label>
            </div>
          )}

          {/* ================= OUTPUT DISPLAY ================= */}
          {/* SINGLE OUTPUT */}
          {mode === 'single' && (
            <div>
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
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {tUI('generatedSlug')}
                </label>
                {seoStatus && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: seoStatus.color,
                      backgroundColor: seoStatus.bg,
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {tUI('slugLength')} {singleSlug.length} {tUI('characters')} • {seoStatus.label}
                  </span>
                )}
              </div>

              <div
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '60px',
                }}
              >
                <code
                  style={{
                    color: '#34d399',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    fontSize: '1.05rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {singleSlug || (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      {tUI('slugPlaceholder')}
                    </span>
                  )}
                </code>
                <button
                  onClick={handleCopySingle}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: copied ? '#059669' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? tUI('copied') : tUI('copy')}
                </button>
              </div>

              {/* Live Full URL Preview */}
              {singleSlug && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.825rem',
                    wordBreak: 'break-all',
                  }}
                >
                  <Globe size={15} style={{ color: '#60a5fa', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tUI('urlPreviewLabel')}
                  </span>
                  <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>
                    {fullPreviewUrl}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* BULK OUTPUT */}
          {mode === 'bulk' && (
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
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('bulkOutputLabel', { count: bulkPairs.length })}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleExportBulk('txt')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    {tUI('downloadTxt')}
                  </button>
                  <button
                    onClick={() => handleExportBulk('csv')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    {tUI('downloadCsv')}
                  </button>
                  <button
                    onClick={handleCopyBulkAll}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: bulkCopied ? '#059669' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {bulkCopied ? <Check size={13} /> : <Copy size={13} />}
                    {bulkCopied ? tUI('copiedAll') : tUI('copyAll')}
                  </button>
                </div>
              </div>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {bulkPairs.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      gap: '10px',
                    }}
                  >
                    <code
                      style={{
                        color: '#34d399',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.875rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {item.slug}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.slug)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                      aria-label={tUI('copy')}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RANDOM OUTPUT */}
          {mode === 'random' && (
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
                <button
                  onClick={handleGenerateRandom}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={15} />
                  {tUI('regenerateRandom')}
                </button>
                <button
                  onClick={handleCopyRandomAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: randomCopiedAll ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: randomCopiedAll ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {randomCopiedAll ? <Check size={14} /> : <Copy size={14} />}
                  {randomCopiedAll ? tUI('copiedAll') : tUI('copyAll')}
                </button>
              </div>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {randomSlugs.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                    }}
                  >
                    <code
                      style={{
                        color: '#34d399',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.9rem',
                      }}
                    >
                      {s}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(s)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                      aria-label={tUI('copy')}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= URL SLUG EXAMPLES & DEVELOPER SLUGIFY SNIPPETS ================= */}
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
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BookOpen size={18} style={{ color: '#3b82f6' }} />
              {tUI('examplesTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tUI('examplesSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {examplesList.map((ex, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ex.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.85rem',
                      color: ex.good ? '#34d399' : '#f87171',
                      marginTop: '4px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {ex.val}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyExample(ex.val, idx)}
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
          toolSlug="slug-generator"
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
