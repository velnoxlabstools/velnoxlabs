'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Code2,
  Sliders,
  Scale,
  Download,
  Sparkles,
  Zap,
  Search,
  Database,
  Tag,
} from 'lucide-react';

const ALPHABET_PRESETS = {
  urlSafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  numbers: '0123456789',
  lower: 'abcdefghijklmnopqrstuvwxyz0123456789',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  noLookalikes: '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz',
  voucherSafe: '23456789BCDFGHJKLMNPQRSTVWXYZ', // No lookalikes 0,1,O,I and no vowels A,E,I,O,U
};

type PresetKey =
  'urlSafe' | 'numbers' | 'lower' | 'upper' | 'noLookalikes' | 'voucherSafe' | 'custom';
type PrefixPreset = 'none' | 'usr_' | 'ord_' | 'txn_' | 'inv_' | 'key_' | 'custom';
type CodeLang = 'npm' | 'typescript' | 'python' | 'rust' | 'csharp' | 'go' | 'php';
type TabMode = 'generator' | 'validator';

const COLLISION_RATES = [
  { label: '100 / hour', value: 100 / 3600 },
  { label: '1,000 / sec (Standard)', value: 1000 },
  { label: '10,000 / sec (High Traffic)', value: 10000 },
  { label: '100,000 / sec (Distributed)', value: 100000 },
  { label: '1,000,000 / day', value: 1000000 / 86400 },
];

/**
 * Official Bitmask Rejection Sampling Generator (zero modulo bias)
 */
function generateNanoId(size: number, alphabet: string): string {
  if (!alphabet || alphabet.length === 0) return '';
  const len = alphabet.length;
  const mask = (2 << (31 - Math.clz32((len - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * size) / len);
  let id = '';
  while (id.length < size) {
    const bytes = new Uint8Array(step);
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < step; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    for (let i = 0; i < step; i++) {
      const byte = bytes[i] & mask;
      if (byte < len) {
        id += alphabet[byte];
        if (id.length === size) return id;
      }
    }
  }
  return id;
}

/**
 * Birthday problem collision probability timeline
 */
function calculateCollisionTime(
  alphabetLength: number,
  idLength: number,
  ratePerSecond: number = 1000
): string {
  if (alphabetLength <= 1 || idLength <= 0) return '< 1 second';

  const log2N = idLength * Math.log2(alphabetLength);
  const log2k = 0.5 * (Math.log2(0.02010067) + log2N);
  const log2Seconds = log2k - Math.log2(Math.max(1e-5, ratePerSecond));

  const secondsPerMinute = 60;
  const secondsPerHour = 3600;
  const secondsPerDay = 86400;
  const secondsPerYear = 31536000;

  const log2Year = Math.log2(secondsPerYear);
  const yearsExp = log2Seconds - log2Year;

  if (yearsExp > 53) {
    return '> 1 billion years';
  } else if (yearsExp >= 6) {
    const years = Math.pow(2, yearsExp);
    if (years >= 1e9) return `~${Math.round(years / 1e9)} billion years`;
    if (years >= 1e6) return `~${Math.round(years / 1e6)} million years`;
    if (years >= 1e3) return `~${Math.round(years / 1e3)} thousand years`;
    return `~${Math.round(years).toLocaleString()} years`;
  } else if (yearsExp >= 0) {
    const years = Math.round(Math.pow(2, yearsExp));
    return `~${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    const daysExp = log2Seconds - Math.log2(secondsPerDay);
    if (daysExp >= 0) {
      const days = Math.round(Math.pow(2, daysExp));
      return `~${days} ${days === 1 ? 'day' : 'days'}`;
    }
    const hoursExp = log2Seconds - Math.log2(secondsPerHour);
    if (hoursExp >= 0) {
      const hours = Math.round(Math.pow(2, hoursExp));
      return `~${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    const minExp = log2Seconds - Math.log2(secondsPerMinute);
    if (minExp >= 0) {
      const mins = Math.round(Math.pow(2, minExp));
      return `~${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
    return '< 1 minute';
  }
}

/**
 * AI Scale & Length Optimizer
 */
function calculateOptimalLength(
  targetCount: number,
  alphabetLength: number,
  maxProbability: number = 0.0001
): number {
  if (alphabetLength <= 1 || targetCount <= 1) return 10;
  const log2k = Math.log2(targetCount);
  const log2p = Math.log2(maxProbability);
  const log2NNeeded = 2 * log2k - log2p - 1;
  const optimal = Math.ceil(log2NNeeded / Math.log2(alphabetLength));
  return Math.min(64, Math.max(6, optimal));
}

/**
 * Shannon Entropy Calculator
 */
function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const freq: Record<string, number> = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  let entropy = 0;
  const len = str.length;
  for (const ch in freq) {
    const p = freq[ch] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

function downloadFile(content: string, filename: string, type: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Page() {
  const tUI = useTranslations('ToolUI.nanoidGenerator');

  // Active top-level Tab
  const [activeTab, setActiveTab] = useState<TabMode>('generator');

  // Generator Settings
  const [length, setLength] = useState<number>(21);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [preset, setPreset] = useState<PresetKey>('urlSafe');
  const [customAlphabet, setCustomAlphabet] = useState<string>('0123456789abcdef');
  const [prefixMode, setPrefixMode] = useState<PrefixPreset>('none');
  const [customPrefix, setCustomPrefix] = useState<string>('api_');
  const [collisionSpeed, setCollisionSpeed] = useState<number>(1000);

  // Generated outputs
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<CodeLang>('npm');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // AI Length Optimizer state
  const [aiTargetScale, setAiTargetScale] = useState<number>(1000000);
  const [aiOptimizerOpen, setAiOptimizerOpen] = useState<boolean>(false);

  // Validator Tab state
  const [validatorInput, setValidatorInput] = useState<string>('V1StGXR8_Z5jdHi6B-myT');

  // Compute active alphabet
  const activeAlphabet = useMemo(() => {
    if (preset === 'custom') {
      const unique = Array.from(new Set(customAlphabet.split(''))).join('');
      return unique.length > 0 ? unique : 'A-Za-z0-9';
    }
    return ALPHABET_PRESETS[preset];
  }, [preset, customAlphabet]);

  // Compute effective prefix
  const effectivePrefix = useMemo(() => {
    if (prefixMode === 'none') return '';
    if (prefixMode === 'custom') return customPrefix.trim();
    return prefixMode;
  }, [prefixMode, customPrefix]);

  // Entropy in bits = length * log2(alphabetLength)
  const entropyBits = useMemo(() => {
    if (activeAlphabet.length <= 1) return 0;
    return Math.round(length * Math.log2(activeAlphabet.length));
  }, [length, activeAlphabet]);

  // Collision timeline string based on selected speed
  const collisionEstimate = useMemo(() => {
    return calculateCollisionTime(activeAlphabet.length, length, collisionSpeed);
  }, [activeAlphabet, length, collisionSpeed]);

  // Recommended AI optimal length for target scale
  const recommendedAiLength = useMemo(() => {
    return calculateOptimalLength(aiTargetScale, activeAlphabet.length, 0.0001);
  }, [aiTargetScale, activeAlphabet.length]);

  // Storage savings calculation
  const storageSavedPercent = useMemo(() => {
    if (length <= recommendedAiLength) return 0;
    return Math.round(((length - recommendedAiLength) / length) * 100);
  }, [length, recommendedAiLength]);

  // Generation function
  const handleGenerate = useCallback(() => {
    const list: string[] = [];
    const count = Math.min(500, Math.max(1, batchCount));
    const safeLength = Math.min(64, Math.max(4, length));
    for (let i = 0; i < count; i++) {
      const raw = generateNanoId(safeLength, activeAlphabet);
      list.push(`${effectivePrefix}${raw}`);
    }
    setGeneratedIds(list);
  }, [batchCount, length, activeAlphabet, effectivePrefix]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopyOne = (id: string, index: number) => {
    navigator.clipboard.writeText(id);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (generatedIds.length === 0) return;
    navigator.clipboard.writeText(generatedIds.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export handlers
  const handleDownloadTxt = () => {
    downloadFile(generatedIds.join('\n'), 'nanoids.txt', 'text/plain');
  };

  const handleDownloadJson = () => {
    downloadFile(JSON.stringify(generatedIds, null, 2), 'nanoids.json', 'application/json');
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'id,prefix,core_id,length,entropy_bits\n' +
      generatedIds
        .map((fullId) => {
          const core = fullId.startsWith(effectivePrefix)
            ? fullId.slice(effectivePrefix.length)
            : fullId;
          return `"${fullId}","${effectivePrefix}","${core}",${core.length},${entropyBits}`;
        })
        .join('\n');
    downloadFile(csvContent, 'nanoids.csv', 'text/csv');
  };

  // Validator calculations
  const validatorAnalysis = useMemo(() => {
    const trimmed = validatorInput.trim();
    if (!trimmed) return null;
    const isUrlSafe = /^[A-Za-z0-9_-]+$/.test(trimmed);
    const uniqueChars = new Set(trimmed).size;
    const shannon = calculateShannonEntropy(trimmed);
    const maxShannon = Math.round(Math.log2(trimmed.length) * 100) / 100;
    const estBits = isUrlSafe
      ? Math.round(trimmed.length * Math.log2(64))
      : Math.round(trimmed.length * Math.log2(Math.max(2, uniqueChars)));

    return {
      length: trimmed.length,
      isUrlSafe,
      uniqueChars,
      shannon,
      maxShannon,
      estBits,
      isStrong: trimmed.length >= 16 && isUrlSafe,
    };
  }, [validatorInput]);

  // Integration snippets
  const codeSnippets: Record<CodeLang, string> = {
    npm: `// Install via npm:
// npm install nanoid

import { nanoid, customAlphabet } from 'nanoid';

// Standard ${length}-character NanoID:
const id = '${effectivePrefix}' + nanoid(${length});

// Custom alphabet:
const generateCustom = customAlphabet('${activeAlphabet}', ${length});
const customId = '${effectivePrefix}' + generateCustom();`,

    typescript: `// TypeScript Branded Type for Type-Safe Identifiers
import { customAlphabet } from 'nanoid';

export type NanoId = string & { readonly __brand: unique symbol };

const generator = customAlphabet('${activeAlphabet}', ${length});

export function createId(): NanoId {
  return ('${effectivePrefix}' + generator()) as NanoId;
}`,

    python: `# Install via pip:
# pip install nanoid

from nanoid import generate

# Standard NanoID:
id = "${effectivePrefix}" + generate(size=${length})

# Custom alphabet:
custom_id = "${effectivePrefix}" + generate(alphabet="${activeAlphabet}", size=${length})`,

    rust: `// Cargo.toml:
// nanoid = "0.4"

use nanoid::nanoid;

fn main() {
    // Standard NanoID
    let id = format!("{}{}", "${effectivePrefix}", nanoid!(${length}));

    // Custom alphabet
    let alphabet: [char; ${activeAlphabet.length}] = [
        ${activeAlphabet
          .split('')
          .map((c) => `'${c}'`)
          .join(', ')}
    ];
    let custom_id = format!("{}{}", "${effectivePrefix}", nanoid!(${length}, &alphabet));
}`,

    csharp: `// Install via NuGet:
// dotnet add package Nanoid

using NanoidDotNet;

// Standard NanoID:
var id = "${effectivePrefix}" + Nanoid.Generate(size: ${length});

// Custom alphabet:
var customId = "${effectivePrefix}" + Nanoid.Generate(alphabet: "${activeAlphabet}", size: ${length});`,

    go: `// Install via Go:
// go get github.com/matoous/go-nanoid/v2

package main

import (
    "fmt"
    gonanoid "github.com/matoous/go-nanoid/v2"
)

func main() {
    // Custom alphabet NanoID
    id, _ := gonanoid.Generate("${activeAlphabet}", ${length})
    fmt.Println("${effectivePrefix}" + id)
}`,

    php: `// Install via Composer:
// composer require hidehalo/nanoid-php

use Hidehalo\Nanoid\Client;

$client = new Client();
$id = "${effectivePrefix}" . $client->formatedId('${activeAlphabet}', ${length});
echo $id;`,
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Section Heading */}
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Top-Level Tabs Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: 'var(--space-6)',
              marginBottom: '20px',
            }}
          >
            <button
              onClick={() => setActiveTab('generator')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                border:
                  activeTab === 'generator' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor:
                  activeTab === 'generator' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'generator' ? '#60a5fa' : 'var(--text-main)',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={16} />
              <span>Generator & Collision Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab('validator')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                border:
                  activeTab === 'validator' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor:
                  activeTab === 'validator' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'validator' ? '#60a5fa' : 'var(--text-main)',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={16} />
              <span>NanoID Validator & Inspector</span>
            </button>
          </div>

          {activeTab === 'generator' && (
            <>
              {/* MAIN GENERATOR CONTROLS CARD */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '28px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Row 1: Length, Batch Quantity, and Prefix */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Length Control */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sliders size={15} />
                        {tUI('length')}
                      </label>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {length} chars
                      </span>
                    </div>

                    <input
                      type="range"
                      min={6}
                      max={64}
                      value={length}
                      onChange={(e) => setLength(parseInt(e.target.value, 10))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      <span>6</span>
                      <span>10</span>
                      <span>16</span>
                      <span>21 (Default)</span>
                      <span>32</span>
                      <span>64</span>
                    </div>
                  </div>

                  {/* Batch Count Selector */}
                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('batchCount')}
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[1, 5, 10, 50, 100, 250].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setBatchCount(num)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border:
                              batchCount === num
                                ? '1px solid #3b82f6'
                                : '1px solid var(--border-color)',
                            backgroundColor:
                              batchCount === num ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                            color: batchCount === num ? '#60a5fa' : 'var(--text-main)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stripe-Style Prefix Selector */}
                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <Tag size={14} />
                      Type-Safe Prefix (Stripe-Style):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['none', 'usr_', 'ord_', 'txn_', 'inv_', 'custom'] as PrefixPreset[]).map(
                        (pfx) => (
                          <button
                            key={pfx}
                            type="button"
                            onClick={() => setPrefixMode(pfx)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border:
                                prefixMode === pfx
                                  ? '1px solid #10b981'
                                  : '1px solid var(--border-color)',
                              backgroundColor:
                                prefixMode === pfx ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                              color: prefixMode === pfx ? '#34d399' : 'var(--text-main)',
                              fontSize: '0.78rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {pfx === 'none' ? 'None' : pfx}
                          </button>
                        )
                      )}
                    </div>
                    {prefixMode === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. key_ or doc_"
                        value={customPrefix}
                        onChange={(e) => setCustomPrefix(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.82rem',
                          fontFamily: 'monospace',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Alphabet Preset Pills */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  >
                    {tUI('alphabet')}
                  </label>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'urlSafe', label: 'URL-Safe (64 symbols)' },
                      { key: 'numbers', label: 'Numbers Only (0-9)' },
                      { key: 'lower', label: 'Lowercase (a-z, 0-9)' },
                      { key: 'upper', label: 'Uppercase (A-Z, 0-9)' },
                      { key: 'noLookalikes', label: 'No Lookalikes (No 0,O,1,I,l)' },
                      { key: 'voucherSafe', label: '⚡ Voucher Safe (No Vowels/Bad Words)' },
                      { key: 'custom', label: 'Custom Alphabet...' },
                    ].map((item) => {
                      const isSelected = preset === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setPreset(item.key as PresetKey)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: isSelected
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border-color)',
                            backgroundColor: isSelected
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'var(--bg-page)',
                            color: isSelected ? '#60a5fa' : 'var(--text-main)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Alphabet Field (conditional) */}
                {preset === 'custom' && (
                  <div style={{ marginBottom: '20px' }}>
                    <input
                      type="text"
                      value={customAlphabet}
                      onChange={(e) => setCustomAlphabet(e.target.value)}
                      placeholder={tUI('customAlphabetPlaceholder')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        display: 'block',
                      }}
                    >
                      Unique symbols detected: {activeAlphabet.length}
                    </span>
                  </div>
                )}

                {/* Collision Risk & Entropy Banner with Generation Speed Selector */}
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} color="#34d399" />
                    <div>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>1% Collision Probability Horizon:</span>
                        <select
                          value={collisionSpeed}
                          onChange={(e) => setCollisionSpeed(parseFloat(e.target.value))}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                          }}
                        >
                          {COLLISION_RATES.map((r) => (
                            <option key={r.label} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#34d399',
                          marginTop: '2px',
                        }}
                      >
                        {collisionEstimate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {tUI('entropyBits')}
                      </div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#60a5fa',
                          fontFamily: 'monospace',
                        }}
                      >
                        ~{entropyBits} bits
                      </div>
                    </div>

                    <button
                      onClick={() => setAiOptimizerOpen(!aiOptimizerOpen)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#a78bfa',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{aiOptimizerOpen ? 'Close AI Optimizer' : 'AI Length Optimizer'}</span>
                    </button>
                  </div>
                </div>

                {/* AI Scale & Length Optimizer Card (Expandable) */}
                {aiOptimizerOpen && (
                  <div
                    style={{
                      padding: '16px 18px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <Sparkles size={16} color="#a78bfa" />
                      <span
                        style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        AI Database Scale & Length Optimizer
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: '12px',
                      }}
                    >
                      Instead of wasting database storage with oversized 21-character IDs, specify
                      your projected database records. AI computes the exact mathematically safe
                      minimum length with &lt; 0.0001% collision risk:
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span
                        style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}
                      >
                        Projected Total Records:
                      </span>
                      {[
                        { label: '100k', val: 100000 },
                        { label: '1 Million', val: 1000000 },
                        { label: '10 Million', val: 10000000 },
                        { label: '100 Million', val: 100000000 },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setAiTargetScale(s.val)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border:
                              aiTargetScale === s.val
                                ? '1px solid #8b5cf6'
                                : '1px solid var(--border-color)',
                            backgroundColor:
                              aiTargetScale === s.val
                                ? 'rgba(139, 92, 246, 0.25)'
                                : 'var(--bg-card)',
                            color: aiTargetScale === s.val ? '#a78bfa' : 'var(--text-main)',
                          }}
                        >
                          {s.label}
                        </button>
                      ))}

                      <div
                        style={{
                          marginLeft: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Recommended Safe Length:{' '}
                          <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                            {recommendedAiLength} chars
                          </strong>{' '}
                          {storageSavedPercent > 0 && (
                            <span style={{ color: '#60a5fa' }}>
                              ({storageSavedPercent}% storage saved)
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLength(recommendedAiLength)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#8b5cf6',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Apply {recommendedAiLength} Chars
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Row: Generate & Export Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <button
                    onClick={handleGenerate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    <RefreshCw size={17} />
                    <span>{tUI('regenerate')}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleCopyAll}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        backgroundColor: copiedAll ? '#059669' : 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: copiedAll ? '#ffffff' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copiedAll ? <Check size={15} /> : <Copy size={15} />}
                      <span>{copiedAll ? tUI('allCopied') : tUI('copyAll')}</span>
                    </button>

                    <button
                      onClick={handleDownloadTxt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={14} />
                      <span>TXT</span>
                    </button>

                    <button
                      onClick={handleDownloadJson}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={14} />
                      <span>JSON</span>
                    </button>

                    <button
                      onClick={handleDownloadCsv}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={14} />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GENERATED IDS OUTPUT DISPLAY */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                    }}
                  >
                    {tUI('generatedId', { count: generatedIds.length })}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                    }}
                  >
                    Bitmask Rejection Sampling • Zero Modulo Bias
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxHeight: '440px',
                    overflowY: 'auto',
                    paddingRight: '6px',
                  }}
                >
                  {generatedIds.map((id, index) => {
                    const isCopied = copiedIndex === index;
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          fontFamily: 'monospace',
                          fontSize: '0.96rem',
                          color: '#60a5fa',
                          fontWeight: 700,
                          wordBreak: 'break-all',
                        }}
                      >
                        <span>
                          {effectivePrefix && (
                            <span style={{ color: '#34d399' }}>{effectivePrefix}</span>
                          )}
                          {effectivePrefix ? id.slice(effectivePrefix.length) : id}
                        </span>

                        <button
                          onClick={() => handleCopyOne(id, index)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isCopied ? '#059669' : 'rgba(37, 99, 235, 0.12)',
                            color: isCopied ? '#ffffff' : '#60a5fa',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginLeft: '12px',
                            flexShrink: 0,
                          }}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{isCopied ? tUI('copied') : tUI('copy')}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ARCHITECTURAL ADVICE: NANOID VS PRIMARY KEYS CARD */}
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  <Database size={18} color="#60a5fa" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Engineering Best Practice: NanoID in Databases & B-Tree Indexes
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  <strong>Why NanoID is perfect for Public APIs & URLs:</strong> Standard 21-char
                  NanoIDs are URL-safe, compact, and prevent enumeration attacks. However, because
                  purely random strings lack chronological order, inserting millions of random
                  NanoIDs as <em>Clustered Primary Keys</em> in PostgreSQL or MySQL InnoDB causes
                  frequent B-Tree page splits and index fragmentation. For massive tables, use an
                  auto-incrementing BigInt or time-ordered UUID v7 / ULID internally, while exposing
                  NanoID as an indexed public external slug!
                </p>
              </div>

              {/* NANOID VS UUID V4 COMPARISON CARD */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '28px',
                  overflowX: 'auto',
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
                  <Scale size={18} color="#3b82f6" />
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      margin: 0,
                    }}
                  >
                    {tUI('comparisonTitle')}
                  </h3>
                </div>

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
                      <th
                        style={{ padding: '10px 12px', color: 'var(--text-main)', fontWeight: 700 }}
                      >
                        Metric / Feature
                      </th>
                      <th style={{ padding: '10px 12px', color: '#60a5fa', fontWeight: 700 }}>
                        NanoID (Modern)
                      </th>
                      <th
                        style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        UUID v4 (Legacy RFC 4122)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>String Length</td>
                      <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                        21 characters (~40% shorter)
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        36 characters (with hyphens)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>Alphabet Size</td>
                      <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                        64 symbols (A-Za-z0-9_-)
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        16 symbols (hex 0-9, a-f)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>URL-Safety</td>
                      <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                        100% URL-Safe (No percent-encoding)
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        Safe, but long in query parameters
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>Entropy Bits</td>
                      <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                        ~126 bits (Identical safety)
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        122 bits of true entropy
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        Customizable Alphabet
                      </td>
                      <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                        Yes (Custom alphabets supported)
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        Fixed hex specification
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* DEVELOPER CODE SNIPPETS CARD */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code2 size={18} color="#3b82f6" />
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                      }}
                    >
                      {tUI('codeSnippetsTitle')}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: copiedCode ? '#059669' : 'rgba(37, 99, 235, 0.12)',
                      color: copiedCode ? '#ffffff' : '#60a5fa',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode ? tUI('copied') : tUI('copy')}</span>
                  </button>
                </div>

                {/* Lang Tabs */}
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                  }}
                >
                  {(
                    ['npm', 'typescript', 'python', 'rust', 'csharp', 'go', 'php'] as CodeLang[]
                  ).map((lang) => {
                    const isSelected = activeCodeLang === lang;
                    const labels: Record<CodeLang, string> = {
                      npm: 'npm / Node.js',
                      typescript: 'TypeScript',
                      python: 'Python',
                      rust: 'Rust',
                      csharp: 'C# / .NET',
                      go: 'Go',
                      php: 'PHP',
                    };
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveCodeLang(lang)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: isSelected
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                          backgroundColor: isSelected
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'var(--bg-page)',
                          color: isSelected ? '#60a5fa' : 'var(--text-main)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {labels[lang]}
                      </button>
                    );
                  })}
                </div>

                <pre
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontFamily: 'monospace',
                    fontSize: '0.84rem',
                    color: 'var(--text-main)',
                    overflowX: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  <code>{codeSnippets[activeCodeLang]}</code>
                </pre>
              </div>
            </>
          )}

          {/* TAB 2: NANOID VALIDATOR & ENTROPY INSPECTOR */}
          {activeTab === 'validator' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
              >
                <Search size={18} color="#3b82f6" />
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  NanoID Validator & Entropy Inspector
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Paste any string identifier to inspect character conformance, URL-safety, Shannon
                entropy, and cryptographic security rating.
              </p>

              <input
                type="text"
                value={validatorInput}
                onChange={(e) => setValidatorInput(e.target.value)}
                placeholder="Paste NanoID string here..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '20px',
                }}
              />

              {validatorAnalysis && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Character Length
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {validatorAnalysis.length} chars
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      URL-Safe Conformance
                    </div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: validatorAnalysis.isUrlSafe ? '#34d399' : '#ef4444',
                      }}
                    >
                      {validatorAnalysis.isUrlSafe ? '✓ 100% URL-Safe' : '❌ Non URL-Safe Chars'}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Shannon Entropy
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#a78bfa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {validatorAnalysis.shannon} bits/symbol
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Security Assessment
                    </div>
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: validatorAnalysis.isStrong ? '#34d399' : '#f59e0b',
                      }}
                    >
                      {validatorAnalysis.isStrong ? '🛡️ Production Secure' : '⚠️ Short Length Risk'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Centralized SEO & Structured Schema - Zero Duplicate Inline JSON-LD */}
          <ToolSeoContent
            toolSlug="nanoid-generator"
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
