'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, RefreshCw, ShieldCheck, Code2, Sliders, Scale } from 'lucide-react';

const ALPHABET_PRESETS = {
  urlSafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  numbers: '0123456789',
  lower: 'abcdefghijklmnopqrstuvwxyz0123456789',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  noLookalikes: '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz',
};

type PresetKey = 'urlSafe' | 'numbers' | 'lower' | 'upper' | 'noLookalikes' | 'custom';
type CodeLang = 'npm' | 'csharp' | 'python' | 'go';

function generateNanoId(size: number, alphabet: string): string {
  if (!alphabet || alphabet.length === 0) return '';
  const array = new Uint32Array(size);
  crypto.getRandomValues(array);
  let id = '';
  const len = alphabet.length;
  for (let i = 0; i < size; i++) {
    id += alphabet[array[i] % len];
  }
  return id;
}

function calculateCollisionTime(alphabetLength: number, idLength: number): string {
  if (alphabetLength <= 1 || idLength <= 0) return '< 1 second';

  // Total combinations log2(N) = idLength * log2(alphabetLength)
  const log2N = idLength * Math.log2(alphabetLength);

  // For 1% collision probability (p = 0.01):
  // k ≈ sqrt(2 * N * ln(1 / (1 - 0.01))) ≈ sqrt(2 * N * 0.01005033) ≈ sqrt(0.02010067 * N)
  const log2k = 0.5 * (Math.log2(0.02010067) + log2N);

  // At rate of 1,000 IDs per second:
  const log2Seconds = log2k - Math.log2(1000);

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

export default function Page() {
  const tUI = useTranslations('ToolUI.nanoidGenerator');

  const [length, setLength] = useState<number>(21);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [preset, setPreset] = useState<PresetKey>('urlSafe');
  const [customAlphabet, setCustomAlphabet] = useState<string>('0123456789abcdef');
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<CodeLang>('npm');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active alphabet string
  const activeAlphabet = useMemo(() => {
    if (preset === 'custom') {
      const unique = Array.from(new Set(customAlphabet.split(''))).join('');
      return unique.length > 0 ? unique : 'A-Za-z0-9';
    }
    return ALPHABET_PRESETS[preset];
  }, [preset, customAlphabet]);

  // Entropy in bits = length * log2(alphabetLength)
  const entropyBits = useMemo(() => {
    if (activeAlphabet.length <= 1) return 0;
    return Math.round(length * Math.log2(activeAlphabet.length));
  }, [length, activeAlphabet]);

  // Collision timeline string
  const collisionEstimate = useMemo(() => {
    return calculateCollisionTime(activeAlphabet.length, length);
  }, [activeAlphabet, length]);

  // Generation function
  const handleGenerate = useCallback(() => {
    const list: string[] = [];
    const count = Math.min(100, Math.max(1, batchCount));
    const safeLength = Math.min(64, Math.max(4, length));
    for (let i = 0; i < count; i++) {
      list.push(generateNanoId(safeLength, activeAlphabet));
    }
    setGeneratedIds(list);
  }, [batchCount, length, activeAlphabet]);

  // Auto-generate on parameters change or mount
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

  // Integration snippets
  const codeSnippets: Record<CodeLang, string> = {
    npm: `// Install via npm:
// npm install nanoid

import { nanoid, customAlphabet } from 'nanoid';

// Standard 21-character NanoID:
const id = nanoid(${length});

// Custom alphabet:
const customId = customAlphabet('${activeAlphabet}', ${length})();`,

    csharp: `// Install via NuGet:
// dotnet add package Nanoid

using NanoidDotNet;

// Standard NanoID:
var id = Nanoid.Generate(size: ${length});

// Custom alphabet:
var customId = Nanoid.Generate(alphabet: "${activeAlphabet}", size: ${length});`,

    python: `# Install via pip:
# pip install nanoid

from nanoid import generate

# Standard NanoID:
id = generate(size=${length})

# Custom alphabet:
custom_id = generate(alphabet="${activeAlphabet}", size=${length})`,

    go: `// Install via go get:
// go get github.com/matoous/go-nanoid/v2

package main

import (
    "fmt"
    gonanoid "github.com/matoous/go-nanoid/v2"
)

func main() {
    id, _ := gonanoid.New(${length})
    customId, _ := gonanoid.Generate("${activeAlphabet}", ${length})
    fmt.Println(id, customId)
}`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO HEADING */}
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* MAIN GENERATOR CONTROLS */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Row 1: Length & Batch Quantity */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sliders size={16} style={{ color: '#3b82f6' }} />
                  {tUI('length')}
                </label>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {length}
                </span>
              </div>

              <input
                type="range"
                min={6}
                max={64}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value) || 21)}
                style={{
                  width: '100%',
                  accentColor: '#2563eb',
                  cursor: 'pointer',
                  marginBottom: '8px',
                }}
              />

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[10, 16, 21, 32, 64].map((n) => (
                  <button
                    key={`len-${n}`}
                    type="button"
                    onClick={() => setLength(n)}
                    style={{
                      border: length === n ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                      backgroundColor: length === n ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                      color: length === n ? '#3b82f6' : 'var(--text-muted)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Count Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '8px',
                }}
              >
                {tUI('batchCount')}
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {[1, 5, 10, 25, 50, 100].map((qty) => (
                  <button
                    key={`qty-${qty}`}
                    type="button"
                    onClick={() => setBatchCount(qty)}
                    style={{
                      border:
                        batchCount === qty ? '1px solid #10b981' : '1px solid var(--border-color)',
                      backgroundColor:
                        batchCount === qty ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                      color: batchCount === qty ? '#10b981' : 'var(--text-main)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Alphabet Preset Pills */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                marginBottom: '8px',
              }}
            >
              {tUI('alphabet')}
            </label>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setPreset('urlSafe')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'urlSafe' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'urlSafe' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'urlSafe' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetUrlSafe')}
              </button>

              <button
                type="button"
                onClick={() => setPreset('numbers')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'numbers' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'numbers' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'numbers' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetNumbers')}
              </button>

              <button
                type="button"
                onClick={() => setPreset('lower')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'lower' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'lower' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'lower' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetLower')}
              </button>

              <button
                type="button"
                onClick={() => setPreset('upper')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'upper' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'upper' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'upper' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetUpper')}
              </button>

              <button
                type="button"
                onClick={() => setPreset('noLookalikes')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'noLookalikes'
                      ? '1px solid #3b82f6'
                      : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'noLookalikes' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'noLookalikes' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetNoLookalikes')}
              </button>

              <button
                type="button"
                onClick={() => setPreset('custom')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    preset === 'custom' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  backgroundColor:
                    preset === 'custom' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: preset === 'custom' ? '#3b82f6' : 'var(--text-main)',
                }}
              >
                {tUI('alphabetCustom')}
              </button>
            </div>

            {/* Custom Alphabet Field */}
            {preset === 'custom' && (
              <div style={{ marginTop: '12px' }}>
                <input
                  type="text"
                  value={customAlphabet}
                  onChange={(e) => setCustomAlphabet(e.target.value)}
                  placeholder={tUI('customAlphabetPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* Row 3: Collision Estimator & Entropy Banner */}
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                  {tUI('collisionRate')}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                  {collisionEstimate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {tUI('entropyBits')}
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-card)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                }}
              >
                {entropyBits} bits
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {tUI('generatedId', { count: generatedIds.length })}
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleGenerate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <RefreshCw size={14} />
                {tUI('regenerate')}
              </button>

              {generatedIds.length > 1 && (
                <button
                  type="button"
                  onClick={handleCopyAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: copiedAll ? '#059669' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                  {copiedAll ? tUI('allCopied') : tUI('copyAll')}
                </button>
              )}
            </div>
          </div>

          {/* Generated IDs Output Cards */}
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '380px',
              overflowY: 'auto',
            }}
          >
            {generatedIds.map((id, index) => {
              const isCopied = copiedIndex === index;
              return (
                <div
                  key={`id-${index}`}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: isCopied ? '1px solid #10b981' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                    }}
                  >
                    {id}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyOne(id, index)}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: isCopied ? '#059669' : 'rgba(37, 99, 235, 0.1)',
                      color: isCopied ? '#ffffff' : '#2563eb',
                      border: isCopied ? '1px solid #059669' : '1px solid rgba(37, 99, 235, 0.25)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                    {isCopied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* NANOID VS UUID V4 COMPARISON CARD */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Scale size={18} style={{ color: '#ec4899' }} />
            <h3
              style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}
            >
              {tUI('comparisonTitle')}
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th
                    style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}
                  >
                    Feature
                  </th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#3b82f6' }}>
                    NanoID (Default)
                  </th>
                  <th
                    style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}
                  >
                    UUID v4
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>ID Length</td>
                  <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>
                    21 chars (40% shorter)
                  </td>
                  <td style={{ padding: '10px 12px' }}>36 chars (with hyphens)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>Alphabet Size</td>
                  <td style={{ padding: '10px 12px' }}>64 URL-safe symbols (A-Za-z0-9_-)</td>
                  <td style={{ padding: '10px 12px' }}>16 hex characters (0-9, a-f)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>URL Friendly</td>
                  <td style={{ padding: '10px 12px', color: '#10b981' }}>
                    Yes (no percent-encoding needed)
                  </td>
                  <td style={{ padding: '10px 12px' }}>Requires hyphen handling</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>Custom Alphabet</td>
                  <td style={{ padding: '10px 12px', color: '#10b981' }}>
                    Supported (any charset / length)
                  </td>
                  <td style={{ padding: '10px 12px' }}>Fixed hex specification</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>Collision Risk</td>
                  <td style={{ padding: '10px 12px' }}>~41 million years at 1,000 IDs/sec</td>
                  <td style={{ padding: '10px 12px' }}>Equivalent astronomical safety</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* DEVELOPER CODE SNIPPETS CARD */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} style={{ color: '#8b5cf6' }} />
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  margin: 0,
                }}
              >
                {tUI('codeSnippetsTitle')}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: copiedCode ? '#059669' : 'rgba(139, 92, 246, 0.1)',
                color: copiedCode ? '#ffffff' : '#8b5cf6',
                border: copiedCode ? '1px solid #059669' : '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              {copiedCode ? tUI('copied') : tUI('copy')}
            </button>
          </div>

          {/* Lang Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {(['npm', 'csharp', 'python', 'go'] as CodeLang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveCodeLang(lang)}
                style={{
                  border:
                    activeCodeLang === lang ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
                  backgroundColor:
                    activeCodeLang === lang ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-page)',
                  color: activeCodeLang === lang ? '#8b5cf6' : 'var(--text-muted)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: lang === 'npm' ? 'none' : 'uppercase',
                }}
              >
                {lang === 'csharp' ? 'C#' : lang === 'npm' ? 'npm / Node.js' : lang}
              </button>
            ))}
          </div>

          <pre
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              color: 'var(--text-main)',
              overflowX: 'auto',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <code>{codeSnippets[activeCodeLang]}</code>
          </pre>
        </div>

        {/* TECHNICAL SEO SECTION */}
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
  );
}
