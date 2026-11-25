'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Upload,
  BookOpen,
  Mic,
  PenTool,
  Target,
  Sparkles,
  BarChart2,
  Keyboard,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'are',
  'but',
  'not',
  'you',
  'all',
  'can',
  'her',
  'was',
  'one',
  'our',
  'out',
  'day',
  'get',
  'has',
  'him',
  'his',
  'how',
  'its',
  'may',
  'new',
  'now',
  'old',
  'see',
  'two',
  'way',
  'who',
  'boy',
  'did',
  'use',
  'that',
  'this',
  'with',
  'from',
  'have',
  'they',
  'will',
  'your',
  'about',
  'would',
  'there',
  'their',
  'which',
  'been',
  'than',
  'them',
  'some',
  'what',
  'into',
  'when',
  'more',
  'also',
  'over',
  'after',
]);

function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  if (clean.length <= 3) return 1;
  const processed = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = processed.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function computeReadability(words: string[], sentenceCount: number) {
  if (words.length === 0 || sentenceCount === 0) {
    return { ease: 0, grade: 0, easeLabel: '—' };
  }
  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
  }
  const wordsPerSentence = words.length / sentenceCount;
  const syllablesPerWord = totalSyllables / words.length;

  const rawEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const ease = Math.round(Math.min(100, Math.max(0, rawEase)));

  const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const grade = Math.round(Math.min(18, Math.max(1, rawGrade)));

  let easeLabel = 'Standard';
  if (ease >= 90) easeLabel = 'Very Easy (5th Grade)';
  else if (ease >= 80) easeLabel = 'Easy (6th Grade)';
  else if (ease >= 70) easeLabel = 'Fairly Easy (7th Grade)';
  else if (ease >= 60) easeLabel = 'Standard (8th–9th Grade)';
  else if (ease >= 50) easeLabel = 'Fairly Difficult (High School)';
  else if (ease >= 30) easeLabel = 'Difficult (College)';
  else easeLabel = 'Very Difficult (Graduate)';

  return { ease, grade, easeLabel };
}

function analyzeTextContent(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter((w) => w.length > 0) : [];
  const wordCount = words.length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  const sentences = trimmed ? trimmed.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0) : [];
  const sentenceCount = sentences.length || (trimmed ? 1 : 0);

  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0) : [];
  const paragraphCount = paragraphs.length || (trimmed ? 1 : 0);

  const readingTimeMinutes = wordCount / 225;
  const speakingTimeMinutes = wordCount / 150;

  const pagesDoubleSpaced = wordCount > 0 ? Math.ceil(wordCount / 250) : 0;
  const pagesSingleSpaced = wordCount > 0 ? Math.ceil(wordCount / 500) : 0;

  const avgWordLength = wordCount > 0 ? (charCountNoSpaces / wordCount).toFixed(1) : '0';
  const avgSentenceLength = sentenceCount > 0 ? (wordCount / sentenceCount).toFixed(1) : '0';

  const readability = computeReadability(words, sentenceCount);

  // Single word frequency
  const singleFreq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/^[^\w\u4e00-\u9fa5]+|[^\w\u4e00-\u9fa5]+$/g, '');
    if (clean.length > 1 && !STOP_WORDS.has(clean)) {
      singleFreq[clean] = (singleFreq[clean] || 0) + 1;
    }
  }

  // 2-word phrase frequency
  const phraseFreq: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].toLowerCase().replace(/^[^\w\u4e00-\u9fa5]+|[^\w\u4e00-\u9fa5]+$/g, '');
    const w2 = words[i + 1].toLowerCase().replace(/^[^\w\u4e00-\u9fa5]+|[^\w\u4e00-\u9fa5]+$/g, '');
    if (w1.length > 1 && w2.length > 1 && (!STOP_WORDS.has(w1) || !STOP_WORDS.has(w2))) {
      const phrase = `${w1} ${w2}`;
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    }
  }

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    speakingTimeMinutes,
    pagesDoubleSpaced,
    pagesSingleSpaced,
    avgWordLength,
    avgSentenceLength,
    readability,
    singleFreq,
    phraseFreq,
  };
}

function formatDuration(minutes: number, secStr = 'sec', minStr = 'min'): string {
  if (minutes <= 0) return `0 ${secStr}`;
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} ${secStr}`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins} ${minStr} ${secs} ${secStr}` : `${mins} ${minStr}`;
}

export default function WordCounterPage() {
  const tUI = useTranslations('ToolUI.wordCounter');
  const tTools = useTranslations('Tools');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Keyword Table States
  const [keywordTab, setKeywordTab] = useState<'single' | 'phrase'>('single');
  const [sortAlpha, setSortAlpha] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');

  // Target Goal State
  const [targetWordCount, setTargetWordCount] = useState<number>(500);

  // Handwritten Essay Estimator State
  const [linesPerPage, setLinesPerPage] = useState<number>(25);
  const [wordsPerLine, setWordsPerLine] = useState<number>(9);
  const [handwrittenPages, setHandwrittenPages] = useState<number>(3);

  const stats = useMemo(() => analyzeTextContent(text), [text]);

  const estimatedHandwrittenTotal = useMemo(() => {
    return Math.max(0, linesPerPage * wordsPerLine * handwrittenPages);
  }, [linesPerPage, wordsPerLine, handwrittenPages]);

  const targetPercentage = useMemo(() => {
    if (targetWordCount <= 0) return 0;
    return Math.min(100, Math.round((stats.wordCount / targetWordCount) * 100));
  }, [stats.wordCount, targetWordCount]);

  const filteredKeywords = useMemo(() => {
    const freqMap = keywordTab === 'single' ? stats.singleFreq : stats.phraseFreq;
    const entries = Object.entries(freqMap).map(([kw, count]) => ({
      kw,
      count,
      density: stats.wordCount > 0 ? ((count / stats.wordCount) * 100).toFixed(1) : '0',
    }));

    let result = entries;
    if (keywordFilter.trim()) {
      const q = keywordFilter.toLowerCase();
      result = result.filter((item) => item.kw.includes(q));
    }

    if (sortAlpha) {
      result.sort((a, b) => a.kw.localeCompare(b.kw));
    } else {
      result.sort((a, b) => b.count - a.count);
    }
    return result.slice(0, 30);
  }, [stats, keywordTab, sortAlpha, keywordFilter]);

  const handleCopy = async (key: string, textToCopy: string) => {
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyStatsSummary = async () => {
    const summary = `${tUI('words')}: ${stats.wordCount.toLocaleString()}
${tUI('characters')}: ${stats.charCount.toLocaleString()}
${tUI('charsNoSpaces')}: ${stats.charCountNoSpaces.toLocaleString()}
${tUI('sentences')}: ${stats.sentenceCount}
${tUI('paragraphs')}: ${stats.paragraphCount}
${tUI('pagesEstimate')}: ${stats.pagesDoubleSpaced} / ${stats.pagesSingleSpaced}
${tUI('readingTime')}: ${formatDuration(stats.readingTimeMinutes, tUI('sec'), tUI('min'))}
${tUI('speakingTime')}: ${formatDuration(stats.speakingTimeMinutes, tUI('sec'), tUI('min'))}
${tUI('readabilityScore')}: ${stats.readability.ease}/100 (${stats.readability.easeLabel})
${tUI('gradeLevel')}: Grade ${stats.readability.grade}`;
    await handleCopy('stats', summary);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCleanSpaces = () => {
    setText((prev) =>
      prev
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  };

  const handleCaseTransform = (mode: 'upper' | 'lower' | 'title') => {
    if (!text) return;
    if (mode === 'upper') {
      setText((prev) => prev.toUpperCase());
    } else if (mode === 'lower') {
      setText((prev) => prev.toLowerCase());
    } else if (mode === 'title') {
      setText((prev) =>
        prev.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
      );
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <GlobalContainer maxWidth="2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <FileText size={24} />
          </div>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-blue-400 mb-1">{tUI('words')}</div>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {stats.wordCount.toLocaleString()}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-purple-400 mb-1">{tUI('characters')}</div>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {stats.charCount.toLocaleString()}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-emerald-400 mb-1">
              {tUI('charsNoSpaces')}
            </div>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {stats.charCountNoSpaces.toLocaleString()}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-amber-400 mb-1">{tUI('sentences')}</div>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {stats.sentenceCount.toLocaleString()}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-rose-400 mb-1">{tUI('paragraphs')}</div>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {stats.paragraphCount.toLocaleString()}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-xs font-semibold text-cyan-400 mb-1">{tUI('pagesEstimate')}</div>
            <div className="text-lg font-extrabold font-mono text-[var(--text-primary)] mt-1">
              {stats.pagesDoubleSpaced}{' '}
              <span className="text-xs text-[var(--text-secondary)] font-normal">/</span>{' '}
              {stats.pagesSingleSpaced}
            </div>
          </div>
        </div>

        {/* Readability & Duration Banner */}
        <div
          className="p-4 rounded-xl border mb-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" />
            <div className="text-xs">
              <span className="text-[var(--text-secondary)]">{tUI('readingTime')}: </span>
              <strong className="text-[var(--text-primary)] font-mono">
                {formatDuration(stats.readingTimeMinutes, tUI('sec'), tUI('min'))}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mic size={16} className="text-purple-400" />
            <div className="text-xs">
              <span className="text-[var(--text-secondary)]">{tUI('speakingTime')}: </span>
              <strong className="text-[var(--text-primary)] font-mono">
                {formatDuration(stats.speakingTimeMinutes, tUI('sec'), tUI('min'))}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <div className="text-xs">
              <span className="text-[var(--text-secondary)]">{tUI('readabilityScore')}: </span>
              <strong className="text-[var(--text-primary)] font-mono">
                {stats.readability.ease}/100
              </strong>{' '}
              <span className="text-[var(--text-secondary)]">({stats.readability.easeLabel})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-emerald-400" />
            <div className="text-xs">
              <span className="text-[var(--text-secondary)]">{tUI('avgWordLength')}: </span>
              <strong className="text-[var(--text-primary)] font-mono">
                {stats.avgWordLength}
              </strong>
            </div>
          </div>
        </div>

        {/* Text Area & Tools Box */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label
              htmlFor="word-counter-input"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              {tUI('yourText')}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                <Upload size={13} />
                {tUI('uploadFileBtn')}
              </button>
              <button
                type="button"
                onClick={handleCleanSpaces}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('cleanSpacesBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleCaseTransform('upper')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('upperCaseBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleCaseTransform('lower')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('lowerCaseBtn')}
              </button>
              <button
                type="button"
                onClick={() => handleCaseTransform('title')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('titleCaseBtn')}
              </button>
              <button
                type="button"
                onClick={() => setText('')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer transition-colors"
              >
                <Trash2 size={13} />
                {tUI('clearTextBtn')}
              </button>
            </div>
          </div>

          <textarea
            id="word-counter-input"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tUI('placeholder')}
            className="w-full p-4 rounded-xl border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-secondary)]">
              {stats.wordCount.toLocaleString()} {tUI('words').toLowerCase()} ·{' '}
              {stats.charCount.toLocaleString()} {tUI('characters').toLowerCase()}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy('text', text)}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer transition-colors"
              >
                {copiedKey === 'text' ? (
                  <Check size={13} className="text-emerald-500" />
                ) : (
                  <Copy size={13} />
                )}
                {copiedKey === 'text' ? tUI('copiedText') : tUI('copyTextBtn')}
              </button>
              <button
                type="button"
                onClick={handleCopyStatsSummary}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 disabled:opacity-40 cursor-pointer transition-colors"
              >
                {copiedKey === 'stats' ? <Check size={13} /> : <BarChart2 size={13} />}
                {copiedKey === 'stats' ? tUI('copiedText') : tUI('copyStatsBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* Goal Tracker & Social Length Checkers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Goal Progress Tracker */}
          <div
            className="lg:col-span-6 p-5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Target size={16} className="text-blue-400" />
                  <span>{tUI('goalTitle')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {tUI('goalTargetLabel')}
                  </span>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={targetWordCount}
                    onChange={(e) => setTargetWordCount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-2 py-1 rounded border text-xs font-mono text-center focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mb-3">
                {tUI('goalProgress', {
                  current: stats.wordCount.toLocaleString(),
                  target: targetWordCount.toLocaleString(),
                  percent: targetPercentage,
                })}
              </div>
            </div>

            <div className="w-full bg-[var(--bg-primary)] rounded-full h-3 border border-[var(--border-subtle)] overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
          </div>

          {/* Social Media & SEO Badges */}
          <div
            className="lg:col-span-6 p-5 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              {tUI('socialLimitsTitle')}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { label: tUI('twitterLimit'), limit: 280 },
                { label: tUI('seoTitleLimit'), limit: 60 },
                { label: tUI('metaDescLimit'), limit: 160 },
                { label: tUI('linkedInLimit'), limit: 3000 },
                { label: tUI('instaLimit'), limit: 2200 },
              ].map((item) => {
                const isOver = stats.charCount > item.limit;
                return (
                  <div
                    key={item.label}
                    className="p-2.5 rounded-lg border flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: isOver ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)',
                    }}
                  >
                    <span className="text-[var(--text-secondary)] text-[11px] truncate mb-1">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isOver ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {stats.charCount} / {item.limit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Handwritten Essay Word Estimator */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <PenTool size={18} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {tUI('handwrittenTitle')}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{tUI('handwrittenDesc')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                {tUI('linesPerPageLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={linesPerPage}
                onChange={(e) => setLinesPerPage(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg border font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                {tUI('wordsPerLineLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={wordsPerLine}
                onChange={(e) => setWordsPerLine(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg border font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                {tUI('pagesCountLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={handwrittenPages}
                onChange={(e) => setHandwrittenPages(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg border font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div
              className="p-2.5 rounded-lg border text-center"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="text-[11px] text-emerald-400 font-semibold block">
                {tUI('estimatedHandwrittenWords')}
              </span>
              <strong className="text-xl font-mono text-emerald-400">
                ~{estimatedHandwrittenTotal.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Keyword Frequency & A-to-Z Density Table */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {tUI('topKeywords')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setKeywordTab('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  keywordTab === 'single'
                    ? 'bg-blue-500 text-white'
                    : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tUI('tabKeywords1')}
              </button>
              <button
                type="button"
                onClick={() => setKeywordTab('phrase')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  keywordTab === 'phrase'
                    ? 'bg-blue-500 text-white'
                    : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tUI('tabKeywords2')}
              </button>
              <button
                type="button"
                onClick={() => setSortAlpha((prev) => !prev)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                <ArrowUpDown size={12} />
                {sortAlpha ? tUI('sortFreq') : tUI('sortAlpha')}
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder={tUI('filterKeywords')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {filteredKeywords.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--text-secondary)]">
              {tUI('noKeywords')}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <th className="py-2 px-3 font-semibold">Keyword</th>
                    <th className="py-2 px-3 font-semibold text-center">Occurrences</th>
                    <th className="py-2 px-3 font-semibold text-right">Density</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]/50">
                  {filteredKeywords.map((item) => (
                    <tr key={item.kw} className="hover:bg-[var(--bg-card-hover)]">
                      <td className="py-2 px-3 text-[var(--text-primary)]">{item.kw}</td>
                      <td className="py-2 px-3 text-center text-blue-400">{item.count}×</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{item.density}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Word Count Shortcuts in Word & Google Docs */}
        <div
          className="rounded-xl border p-5 mb-8"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Keyboard size={18} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {tUI('shortcutsTitle')}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{tUI('shortcutsSubtitle')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div
              className="p-3.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="font-semibold text-[var(--text-primary)] mb-1">
                {tUI('msWordShortcut')}
              </div>
              <div className="font-mono text-blue-400">{tUI('msWordKeys')}</div>
            </div>

            <div
              className="p-3.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="font-semibold text-[var(--text-primary)] mb-1">
                {tUI('gDocsShortcut')}
              </div>
              <div className="font-mono text-emerald-400">{tUI('gDocsKeys')}</div>
            </div>

            <div
              className="p-3.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="font-semibold text-[var(--text-primary)] mb-1">
                {tUI('macPagesShortcut')}
              </div>
              <div className="font-mono text-purple-400">{tUI('macPagesKeys')}</div>
            </div>

            <div
              className="p-3.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="font-semibold text-[var(--text-primary)] mb-1">
                {tUI('libreOfficeShortcut')}
              </div>
              <div className="font-mono text-amber-400">{tUI('libreOfficeKeys')}</div>
            </div>
          </div>
        </div>

        <ToolSeoContent
          toolSlug="word-counter"
          toolName={tTools('word-counter.name')}
          description={tTools('word-counter.description')}
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
