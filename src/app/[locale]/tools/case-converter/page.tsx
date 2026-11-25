'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, Download, ArrowLeftRight, Trash2, Type, Code2, BookOpen } from 'lucide-react';

const MINOR_TITLE_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'from',
  'by',
  'of',
  'in',
  'as',
  'into',
  'like',
  'near',
  'off',
  'onto',
  'out',
  'over',
  'past',
  'per',
  'plus',
  'than',
  'up',
  'upon',
  'via',
  'with',
]);

function splitIntoTokens(line: string): string[] {
  return line
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function transformLines(text: string, lineFn: (line: string) => string): string {
  return text
    .split('\n')
    .map((line) => (line.trim() ? lineFn(line) : ''))
    .join('\n');
}

export default function CaseConverterPage() {
  const tUI = useTranslations('ToolUI.caseConverter');
  const [input, setInput] = useState(
    'the quick brown fox jumps over the lazy dog.\nhello world from velnoxlabs!'
  );
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCheatIdx, setCopiedCheatIdx] = useState<number | null>(null);
  const [activeCase, setActiveCase] = useState<string>('');

  // Live text statistics
  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const sentences = input.trim()
      ? input
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter(Boolean).length
      : 0;
    const lines = input === '' ? 0 : input.split('\n').length;
    return { chars, words, sentences, lines };
  }, [input]);

  // Editorial transformations
  const handleSentenceCase = () => {
    setActiveCase('sentence');
    const lowered = input.toLowerCase();
    const res = lowered.replace(
      /(^\s*[a-z\u00C0-\u024F]|[.!?]\s+[a-z\u00C0-\u024F]|\n\s*[a-z\u00C0-\u024F])/g,
      (match) => match.toUpperCase()
    );
    setOutput(res);
  };

  const handleSmartTitleCase = () => {
    setActiveCase('title');
    const res = transformLines(input, (line) => {
      const words = line.trim().split(/\s+/);
      return words
        .map((w, idx) => {
          const clean = w.toLowerCase();
          if (idx === 0 || idx === words.length - 1 || !MINOR_TITLE_WORDS.has(clean)) {
            return clean.charAt(0).toUpperCase() + clean.slice(1);
          }
          return clean;
        })
        .join(' ');
    });
    setOutput(res);
  };

  const handleCapitalizeWords = () => {
    setActiveCase('capitalize');
    const res = input.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
    setOutput(res);
  };

  const handleUpper = () => {
    setActiveCase('upper');
    setOutput(input.toUpperCase());
  };

  const handleLower = () => {
    setActiveCase('lower');
    setOutput(input.toLowerCase());
  };

  const handleAlternating = () => {
    setActiveCase('alternating');
    let toggle = false;
    const res = Array.from(input)
      .map((ch) => {
        if (/[a-zA-Z]/.test(ch)) {
          const out = toggle ? ch.toUpperCase() : ch.toLowerCase();
          toggle = !toggle;
          return out;
        }
        return ch;
      })
      .join('');
    setOutput(res);
  };

  const handleInverse = () => {
    setActiveCase('inverse');
    const res = Array.from(input)
      .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
      .join('');
    setOutput(res);
  };

  // Developer transformations (line-aware)
  const handleCamel = () => {
    setActiveCase('camel');
    setOutput(
      transformLines(input, (line) => {
        const tokens = splitIntoTokens(line);
        return tokens
          .map((w, i) =>
            i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
          .join('');
      })
    );
  };

  const handlePascal = () => {
    setActiveCase('pascal');
    setOutput(
      transformLines(input, (line) =>
        splitIntoTokens(line)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join('')
      )
    );
  };

  const handleSnake = () => {
    setActiveCase('snake');
    setOutput(
      transformLines(input, (line) =>
        splitIntoTokens(line)
          .map((w) => w.toLowerCase())
          .join('_')
      )
    );
  };

  const handleConstant = () => {
    setActiveCase('constant');
    setOutput(
      transformLines(input, (line) =>
        splitIntoTokens(line)
          .map((w) => w.toUpperCase())
          .join('_')
      )
    );
  };

  const handleKebab = () => {
    setActiveCase('kebab');
    setOutput(
      transformLines(input, (line) =>
        splitIntoTokens(line)
          .map((w) => w.toLowerCase())
          .join('-')
      )
    );
  };

  const handleDot = () => {
    setActiveCase('dot');
    setOutput(
      transformLines(input, (line) =>
        splitIntoTokens(line)
          .map((w) => w.toLowerCase())
          .join('.')
      )
    );
  };

  // Utility handlers
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const content = output || input;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setActiveCase('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setActiveCase('');
  };

  const editorialButtons = [
    { id: 'sentence', label: tUI('sentenceCase'), onClick: handleSentenceCase },
    { id: 'title', label: tUI('titleCase'), onClick: handleSmartTitleCase },
    { id: 'capitalize', label: tUI('capitalizeWords'), onClick: handleCapitalizeWords },
    { id: 'upper', label: tUI('uppercase'), onClick: handleUpper },
    { id: 'lower', label: tUI('lowercase'), onClick: handleLower },
    { id: 'alternating', label: tUI('alternatingCase'), onClick: handleAlternating },
    { id: 'inverse', label: tUI('inverseCase'), onClick: handleInverse },
  ];

  const developerButtons = [
    { id: 'camel', label: tUI('camelCase'), onClick: handleCamel },
    { id: 'pascal', label: tUI('pascalCase'), onClick: handlePascal },
    { id: 'snake', label: tUI('snakeCase'), onClick: handleSnake },
    { id: 'constant', label: tUI('constantCase'), onClick: handleConstant },
    { id: 'kebab', label: tUI('kebabCase'), onClick: handleKebab },
    { id: 'dot', label: tUI('dotCase'), onClick: handleDot },
  ];

  const cheatItems = [
    { label: tUI('exSentenceLabel'), val: tUI('exSentenceVal') },
    { label: tUI('exTitleLabel'), val: tUI('exTitleVal') },
    { label: tUI('exWordLabel'), val: tUI('exWordVal') },
    { label: tUI('exExcelLabel'), val: tUI('exExcelVal') },
    { label: tUI('exPythonLabel'), val: tUI('exPythonVal') },
  ];

  const handleCopyCheat = (val: string, idx: number) => {
    navigator.clipboard.writeText(val);
    setCopiedCheatIdx(idx);
    setTimeout(() => setCopiedCheatIdx(null), 2000);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= MAIN WORKSPACE CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Textarea Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Source Box */}
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
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {tUI('inputLabel')}
                </label>
                <button
                  onClick={handleClear}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
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
                  {tUI('clear')}
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={9}
                placeholder={tUI('inputPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Output Box */}
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
                  {tUI('outputLabel')}
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSwap}
                    disabled={!output}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'var(--bg-page)',
                      color: output ? 'var(--text-main)' : 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: output ? 'pointer' : 'not-allowed',
                      opacity: output ? 1 : 0.5,
                    }}
                  >
                    <ArrowLeftRight size={12} />
                    {tUI('swapText')}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
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
                    <Download size={12} />
                    {tUI('downloadTxt')}
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
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                rows={9}
                placeholder={tUI('outputPlaceholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#34d399',
                  padding: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          {/* Live Text Statistics Bar */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              padding: '10px 14px',
              marginTop: '14px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            <span>{tUI('statChars', { count: stats.chars })}</span>
            <span>•</span>
            <span>{tUI('statWords', { count: stats.words })}</span>
            <span>•</span>
            <span>{tUI('statSentences', { count: stats.sentences })}</span>
            <span>•</span>
            <span>{tUI('statLines', { count: stats.lines })}</span>
          </div>

          {/* Editorial & Document Cases */}
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              <Type size={14} style={{ color: '#3b82f6' }} />
              {tUI('editorialGroup')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {editorialButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  style={{
                    backgroundColor: activeCase === btn.id ? '#2563eb' : 'rgba(59, 130, 246, 0.12)',
                    color: activeCase === btn.id ? '#ffffff' : '#60a5fa',
                    border: '1px solid',
                    borderColor: activeCase === btn.id ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Developer & Naming Cases */}
          <div style={{ marginTop: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              <Code2 size={14} style={{ color: '#10b981' }} />
              {tUI('developerGroup')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {developerButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  style={{
                    backgroundColor: activeCase === btn.id ? '#059669' : 'rgba(16, 185, 129, 0.1)',
                    color: activeCase === btn.id ? '#ffffff' : '#34d399',
                    border: '1px solid',
                    borderColor: activeCase === btn.id ? '#10b981' : 'rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= QUICK REFERENCE: EXAMPLES, WORD, EXCEL & PYTHON ================= */}
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
              {tUI('cheatTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tUI('cheatSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cheatItems.map((item, idx) => (
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
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.875rem',
                      color: '#34d399',
                      marginTop: '4px',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.val}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCheat(item.val, idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor:
                      copiedCheatIdx === idx ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedCheatIdx === idx ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedCheatIdx === idx ? <Check size={13} /> : <Copy size={13} />}
                  {copiedCheatIdx === idx ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="case-converter"
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
