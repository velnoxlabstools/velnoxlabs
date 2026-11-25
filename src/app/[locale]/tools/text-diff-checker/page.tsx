'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Columns2,
  AlignLeft,
  Copy,
  Check,
  Download,
  Upload,
  ArrowLeftRight,
  Trash2,
  FileText,
  Code2,
} from 'lucide-react';

type ViewMode = 'split' | 'unified';
type Granularity = 'line' | 'word';

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  originalLine?: string;
  modifiedLine?: string;
  originalNum?: number;
  modifiedNum?: number;
}

interface WordToken {
  text: string;
  status: 'same' | 'added' | 'removed';
}

interface SplitRow {
  leftNum?: number;
  leftText?: string;
  leftType: 'same' | 'removed' | 'empty';
  leftTokens?: WordToken[];
  rightNum?: number;
  rightText?: string;
  rightType: 'same' | 'added' | 'empty';
  rightTokens?: WordToken[];
}

function normalizeForCompare(line: string, ignoreWhitespace: boolean, ignoreCase: boolean): string {
  let out = line;
  if (ignoreWhitespace) {
    out = out.trim().replace(/\s+/g, ' ');
  }
  if (ignoreCase) {
    out = out.toLowerCase();
  }
  return out;
}

function computeWordDiff(
  aStr: string,
  bStr: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): { left: WordToken[]; right: WordToken[] } {
  const aTokens = aStr.split(/(\s+)/).filter((t) => t.length > 0);
  const bTokens = bStr.split(/(\s+)/).filter((t) => t.length > 0);
  const m = aTokens.length;
  const n = bTokens.length;

  // Guard against huge lines
  if (m * n > 250000) {
    return {
      left: [{ text: aStr, status: 'removed' }],
      right: [{ text: bStr, status: 'added' }],
    };
  }

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const eq =
        normalizeForCompare(aTokens[i - 1], ignoreWhitespace, ignoreCase) ===
        normalizeForCompare(bTokens[j - 1], ignoreWhitespace, ignoreCase);
      dp[i][j] = eq ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const left: WordToken[] = [];
  const right: WordToken[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      normalizeForCompare(aTokens[i - 1], ignoreWhitespace, ignoreCase) ===
        normalizeForCompare(bTokens[j - 1], ignoreWhitespace, ignoreCase)
    ) {
      left.unshift({ text: aTokens[i - 1], status: 'same' });
      right.unshift({ text: bTokens[j - 1], status: 'same' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      right.unshift({ text: bTokens[j - 1], status: 'added' });
      j--;
    } else if (i > 0) {
      left.unshift({ text: aTokens[i - 1], status: 'removed' });
      i--;
    }
  }

  return { left, right };
}

export default function TextDiffCheckerPage() {
  const tUI = useTranslations('ToolUI.textDiffChecker');

  const [original, setOriginal] = useState(
    'VelnoxLabs developer tools v1.0\nFast and reliable\nBuilt for developers\nAll tools free forever'
  );
  const [modified, setModified] = useState(
    'VelnoxLabs enterprise developer tools v2.0\nFast and reliable\nBuilt for professional developers\nAll tools free forever\nNew AI-powered features added'
  );

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [granularity, setGranularity] = useState<Granularity>('word');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  const origFileRef = useRef<HTMLInputElement>(null);
  const modFileRef = useRef<HTMLInputElement>(null);

  const loadSample = (kind: 'text' | 'code') => {
    if (kind === 'text') {
      setOriginal(
        'VelnoxLabs developer tools v1.0\nFast and reliable\nBuilt for developers\nAll tools free forever'
      );
      setModified(
        'VelnoxLabs enterprise developer tools v2.0\nFast and reliable\nBuilt for professional developers\nAll tools free forever\nNew AI-powered features added'
      );
    } else {
      setOriginal(
        '{\n  "name": "velnox-api",\n  "version": "1.0.0",\n  "port": 3000,\n  "cache": false,\n  "logLevel": "info"\n}'
      );
      setModified(
        '{\n  "name": "velnox-api",\n  "version": "2.1.0",\n  "port": 8080,\n  "cache": true,\n  "rateLimit": 100,\n  "logLevel": "warn"\n}'
      );
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setter(ev.target.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // LCS-based line diff
  const diffLines = useMemo(() => {
    if (!original && !modified) return [] as DiffLine[];
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    const m = origLines.length;
    const n = modLines.length;

    const lcs: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const eq =
          normalizeForCompare(origLines[i - 1], ignoreWhitespace, ignoreCase) ===
          normalizeForCompare(modLines[j - 1], ignoreWhitespace, ignoreCase);
        lcs[i][j] = eq ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }

    const result: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (
        i > 0 &&
        j > 0 &&
        normalizeForCompare(origLines[i - 1], ignoreWhitespace, ignoreCase) ===
          normalizeForCompare(modLines[j - 1], ignoreWhitespace, ignoreCase)
      ) {
        result.unshift({
          type: 'same',
          originalLine: origLines[i - 1],
          modifiedLine: modLines[j - 1],
          originalNum: i,
          modifiedNum: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
        result.unshift({
          type: 'added',
          modifiedLine: modLines[j - 1],
          modifiedNum: j,
        });
        j--;
      } else if (i > 0) {
        result.unshift({
          type: 'removed',
          originalLine: origLines[i - 1],
          originalNum: i,
        });
        i--;
      }
    }

    return result;
  }, [original, modified, ignoreWhitespace, ignoreCase]);

  // Pair removed + added lines for Split View & Word Highlighting
  const splitRows = useMemo(() => {
    const rows: SplitRow[] = [];
    let idx = 0;

    while (idx < diffLines.length) {
      const cur = diffLines[idx];
      if (cur.type === 'same') {
        rows.push({
          leftNum: cur.originalNum,
          leftText: cur.originalLine,
          leftType: 'same',
          rightNum: cur.modifiedNum,
          rightText: cur.modifiedLine,
          rightType: 'same',
        });
        idx++;
      } else {
        const removedChunk: DiffLine[] = [];
        const addedChunk: DiffLine[] = [];
        while (idx < diffLines.length && diffLines[idx].type !== 'same') {
          if (diffLines[idx].type === 'removed') removedChunk.push(diffLines[idx]);
          else addedChunk.push(diffLines[idx]);
          idx++;
        }

        const maxLen = Math.max(removedChunk.length, addedChunk.length);
        for (let k = 0; k < maxLen; k++) {
          const rem = removedChunk[k];
          const add = addedChunk[k];
          let leftTokens: WordToken[] | undefined;
          let rightTokens: WordToken[] | undefined;

          if (rem && add && granularity === 'word') {
            const wd = computeWordDiff(
              rem.originalLine || '',
              add.modifiedLine || '',
              ignoreWhitespace,
              ignoreCase
            );
            leftTokens = wd.left;
            rightTokens = wd.right;
          }

          rows.push({
            leftNum: rem?.originalNum,
            leftText: rem?.originalLine,
            leftType: rem ? 'removed' : 'empty',
            leftTokens,
            rightNum: add?.modifiedNum,
            rightText: add?.modifiedLine,
            rightType: add ? 'added' : 'empty',
            rightTokens,
          });
        }
      }
    }

    return rows;
  }, [diffLines, granularity, ignoreWhitespace, ignoreCase]);

  // Stats & Similarity Percentage
  const { stats, similarity } = useMemo(() => {
    const added = diffLines.filter((d) => d.type === 'added').length;
    const removed = diffLines.filter((d) => d.type === 'removed').length;
    const same = diffLines.filter((d) => d.type === 'same').length;

    // Calculate word-level similarity score across text for accuracy
    let sim = 100;
    if (!original && !modified) {
      sim = 100;
    } else if (!original || !modified) {
      sim = 0;
    } else {
      const aNorm = normalizeForCompare(original, ignoreWhitespace, ignoreCase);
      const bNorm = normalizeForCompare(modified, ignoreWhitespace, ignoreCase);
      if (aNorm === bNorm) {
        sim = 100;
      } else {
        const aWords = aNorm.split(/\s+/).filter(Boolean);
        const bWords = bNorm.split(/\s+/).filter(Boolean);
        if (aWords.length * bWords.length <= 200000 && aWords.length > 0 && bWords.length > 0) {
          const m = aWords.length;
          const n = bWords.length;
          const dp = new Int32Array((m + 1) * (n + 1));
          for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
              dp[i * (n + 1) + j] =
                aWords[i - 1] === bWords[j - 1]
                  ? dp[(i - 1) * (n + 1) + (j - 1)] + 1
                  : Math.max(dp[(i - 1) * (n + 1) + j], dp[i * (n + 1) + (j - 1)]);
            }
          }
          const matchedWords = dp[m * (n + 1) + n];
          sim = Math.round(((2 * matchedWords) / (m + n)) * 1000) / 10;
        } else {
          const totalLines = same + added + removed;
          sim = totalLines > 0 ? Math.round((same / totalLines) * 1000) / 10 : 0;
        }
      }
    }

    return { stats: { added, removed, same }, similarity: sim };
  }, [diffLines, original, modified, ignoreWhitespace, ignoreCase]);

  const unifiedDiffString = useMemo(() => {
    return diffLines
      .map((d) => {
        if (d.type === 'added') return `+ ${d.modifiedLine}`;
        if (d.type === 'removed') return `- ${d.originalLine}`;
        return `  ${d.originalLine}`;
      })
      .join('\n');
  }, [diffLines]);

  const handleCopy = () => {
    if (!unifiedDiffString) return;
    navigator.clipboard.writeText(unifiedDiffString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDiff = () => {
    if (!unifiedDiffString) return;
    const blob = new Blob([unifiedDiffString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comparison.diff';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    const tmp = original;
    setOriginal(modified);
    setModified(tmp);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= PRESETS BAR ================= */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => loadSample('text')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FileText size={13} />
            {tUI('presetText')}
          </button>
          <button
            onClick={() => loadSample('code')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Code2 size={13} />
            {tUI('presetCode')}
          </button>
        </div>

        {/* ================= INPUT & DIFF WORKSPACE ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Two Inputs Side by Side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Original Input */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {tUI('originalText')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    ref={origFileRef}
                    type="file"
                    accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.xml,.log,.yaml,.yml"
                    onChange={(e) => handleFileUpload(e, setOriginal)}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => origFileRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={12} />
                    {tUI('uploadFile')}
                  </button>
                  <button
                    onClick={() => setOriginal('')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                    {tUI('clearBtn')}
                  </button>
                </div>
              </div>
              <textarea
                value={original}
                onChange={(e) => setOriginal(e.target.value)}
                rows={7}
                placeholder={tUI('placeholderOriginal')}
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
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Modified Input */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '6px',
                }}
              >
                <label style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {tUI('modifiedText')}
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    ref={modFileRef}
                    type="file"
                    accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.xml,.log,.yaml,.yml"
                    onChange={(e) => handleFileUpload(e, setModified)}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => modFileRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={12} />
                    {tUI('uploadFile')}
                  </button>
                  <button
                    onClick={() => setModified('')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                    {tUI('clearBtn')}
                  </button>
                </div>
              </div>
              <textarea
                value={modified}
                onChange={(e) => setModified(e.target.value)}
                rows={7}
                placeholder={tUI('placeholderModified')}
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
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* ================= CONTROLS & SIMILARITY BAR ================= */}
          <div
            style={{
              marginTop: '18px',
              padding: '14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Row 1: View Mode, Granularity & Filter Toggles */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setViewMode('split')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: viewMode === 'split' ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor:
                      viewMode === 'split' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                    color: viewMode === 'split' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  <Columns2 size={14} />
                  {tUI('viewSplit')}
                </button>
                <button
                  onClick={() => setViewMode('unified')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: viewMode === 'unified' ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor:
                      viewMode === 'unified' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                    color: viewMode === 'unified' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  <AlignLeft size={14} />
                  {tUI('viewUnified')}
                </button>

                <div
                  style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}
                />

                <button
                  onClick={() => setGranularity(granularity === 'word' ? 'line' : 'word')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: granularity === 'word' ? '#10b981' : 'var(--border-color)',
                    backgroundColor:
                      granularity === 'word' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    color: granularity === 'word' ? '#34d399' : 'var(--text-muted)',
                  }}
                >
                  {granularity === 'word' ? tUI('granularityWord') : tUI('granularityLine')}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ignoreWhitespace}
                    onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#3b82f6' }}
                  />
                  {tUI('ignoreWhitespace')}
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ignoreCase}
                    onChange={(e) => setIgnoreCase(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#3b82f6' }}
                  />
                  {tUI('ignoreCase')}
                </label>

                <button
                  onClick={handleSwap}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeftRight size={12} />
                  {tUI('swapBtn')}
                </button>
              </div>
            </div>

            {/* Row 2: Similarity Meter & Line Counts + Copy/Export */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {tUI('similarityLabel')}{' '}
                    <strong style={{ color: '#60a5fa' }}>{similarity}%</strong>
                  </span>
                  <div
                    style={{
                      width: '80px',
                      height: '6px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${similarity}%`,
                        height: '100%',
                        backgroundColor:
                          similarity >= 70 ? '#10b981' : similarity >= 40 ? '#eab308' : '#ef4444',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>

                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                  {tUI('unchanged', { count: stats.same })}
                </span>
                <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                  + {tUI('added', { count: stats.added })}
                </span>
                <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                  - {tUI('removed', { count: stats.removed })}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleExportDiff}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: 'var(--bg-card)',
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
                  {tUI('exportDiff')}
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: copied ? '#059669' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? tUI('copied') : tUI('copyDiff')}
                </button>
              </div>
            </div>
          </div>

          {/* ================= DIFF VIEW OUTPUT ================= */}
          <div style={{ marginTop: '18px' }}>
            <label
              style={{
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {tUI('diffResult')}
            </label>

            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '460px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.825rem',
              }}
            >
              {diffLines.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0, padding: '16px' }}>
                  {tUI('diffPlaceholder')}
                </p>
              ) : viewMode === 'split' ? (
                /* SIDE-BY-SIDE SPLIT DIFF VIEW */
                <div style={{ minWidth: '620px' }}>
                  {splitRows.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      {/* Left (Original) */}
                      <div
                        style={{
                          display: 'flex',
                          backgroundColor:
                            row.leftType === 'removed'
                              ? 'rgba(239, 68, 68, 0.12)'
                              : row.leftType === 'empty'
                                ? 'rgba(255, 255, 255, 0.02)'
                                : 'transparent',
                          borderRight: '1px solid var(--border-color)',
                          minHeight: '26px',
                        }}
                      >
                        <span
                          style={{
                            width: '40px',
                            flexShrink: 0,
                            textAlign: 'right',
                            padding: '4px 8px',
                            color: '#64748b',
                            userSelect: 'none',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {row.leftNum ?? ''}
                        </span>
                        <span
                          style={{
                            padding: '4px 10px',
                            color: row.leftType === 'removed' ? '#fca5a5' : 'var(--text-main)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            flex: 1,
                          }}
                        >
                          {row.leftTokens
                            ? row.leftTokens.map((tok, ti) => (
                                <span
                                  key={ti}
                                  style={{
                                    backgroundColor:
                                      tok.status === 'removed'
                                        ? 'rgba(239, 68, 68, 0.35)'
                                        : 'transparent',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {tok.text}
                                </span>
                              ))
                            : (row.leftText ?? '')}
                        </span>
                      </div>

                      {/* Right (Modified) */}
                      <div
                        style={{
                          display: 'flex',
                          backgroundColor:
                            row.rightType === 'added'
                              ? 'rgba(16, 185, 129, 0.12)'
                              : row.rightType === 'empty'
                                ? 'rgba(255, 255, 255, 0.02)'
                                : 'transparent',
                          minHeight: '26px',
                        }}
                      >
                        <span
                          style={{
                            width: '40px',
                            flexShrink: 0,
                            textAlign: 'right',
                            padding: '4px 8px',
                            color: '#64748b',
                            userSelect: 'none',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          {row.rightNum ?? ''}
                        </span>
                        <span
                          style={{
                            padding: '4px 10px',
                            color: row.rightType === 'added' ? '#6ee7b7' : 'var(--text-main)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            flex: 1,
                          }}
                        >
                          {row.rightTokens
                            ? row.rightTokens.map((tok, ti) => (
                                <span
                                  key={ti}
                                  style={{
                                    backgroundColor:
                                      tok.status === 'added'
                                        ? 'rgba(16, 185, 129, 0.35)'
                                        : 'transparent',
                                    borderRadius: '3px',
                                  }}
                                >
                                  {tok.text}
                                </span>
                              ))
                            : (row.rightText ?? '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* UNIFIED INLINE DIFF VIEW */
                <div style={{ padding: '6px 0' }}>
                  {diffLines.map((line, idx) => {
                    let bgColor = 'transparent';
                    let textColor = '#94a3b8';
                    let prefix = '  ';
                    if (line.type === 'added') {
                      bgColor = 'rgba(16, 185, 129, 0.12)';
                      textColor = '#34d399';
                      prefix = '+ ';
                    } else if (line.type === 'removed') {
                      bgColor = 'rgba(239, 68, 68, 0.12)';
                      textColor = '#f87171';
                      prefix = '- ';
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          backgroundColor: bgColor,
                          color: textColor,
                          padding: '3px 10px',
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}
                      >
                        <span
                          style={{
                            width: '36px',
                            flexShrink: 0,
                            color: '#64748b',
                            textAlign: 'right',
                            paddingRight: '8px',
                            userSelect: 'none',
                          }}
                        >
                          {line.originalNum ?? ''}
                        </span>
                        <span
                          style={{
                            width: '36px',
                            flexShrink: 0,
                            color: '#64748b',
                            textAlign: 'right',
                            paddingRight: '10px',
                            userSelect: 'none',
                          }}
                        >
                          {line.modifiedNum ?? ''}
                        </span>
                        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
                          {prefix}
                          {line.type === 'added' ? line.modifiedLine : line.originalLine}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="text-diff-checker"
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
