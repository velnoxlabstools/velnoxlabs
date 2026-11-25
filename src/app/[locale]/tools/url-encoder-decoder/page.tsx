'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link2, Copy, Check, ArrowLeftRight, Trash2, Code2, Table2 } from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type Mode = 'encode' | 'decode';
type Engine = 'component' | 'fullUrl';
type SpaceMode = 'percent' | 'plus';
type LangTab = 'csharp' | 'python' | 'java' | 'js' | 'html';

const SAMPLE_FULL_URL =
  'https://velnoxlabs.com/docs/api search?q=url encode&lang=C# .NET&tag=utf8 ✓';
const SAMPLE_ENCODED_QUERY =
  'https://velnoxlabs.com/search?q=url+encoder+%26+decoder&lang=C%23+.NET&tag=%E2%9C%93';

function transformSegment(
  segment: string,
  mode: Mode,
  engine: Engine,
  spaceMode: SpaceMode
): string {
  if (!segment) return '';

  if (mode === 'encode') {
    const encoded = engine === 'component' ? encodeURIComponent(segment) : encodeURI(segment);
    return spaceMode === 'plus' ? encoded.replace(/%20/g, '+') : encoded;
  }

  const prepared = spaceMode === 'plus' ? segment.replace(/\+/g, ' ') : segment;
  return engine === 'component' ? decodeURIComponent(prepared) : decodeURI(prepared);
}

function safeDecodePart(part: string): string {
  try {
    return decodeURIComponent(part.replace(/\+/g, ' '));
  } catch {
    return part;
  }
}

function extractQueryParams(raw: string): Array<{ key: string; value: string }> {
  const firstLine = (raw.trim().split(/\r?\n/)[0] || '').split('#')[0];
  if (!firstLine) return [];

  const qIdx = firstLine.indexOf('?');
  const queryPart =
    qIdx !== -1
      ? firstLine.slice(qIdx + 1)
      : firstLine.includes('=') && !/\s/.test(firstLine) && !firstLine.includes('://')
        ? firstLine
        : '';

  if (!queryPart) return [];

  return queryPart
    .split('&')
    .filter(Boolean)
    .map((pair) => {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) {
        return { key: safeDecodePart(pair), value: '' };
      }
      return {
        key: safeDecodePart(pair.slice(0, eqIdx)),
        value: safeDecodePart(pair.slice(eqIdx + 1)),
      };
    });
}

export default function UrlEncoderDecoderPage() {
  const tUI = useTranslations('ToolUI.urlEncoderDecoder');
  const tTools = useTranslations('Tools');

  const [mode, setMode] = useState<Mode>('encode');
  const [engine, setEngine] = useState<Engine>('component');
  const [spaceMode, setSpaceMode] = useState<SpaceMode>('percent');
  const [batchLines, setBatchLines] = useState(false);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeLang, setActiveLang] = useState<LangTab>('csharp');

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null as string | null };
    try {
      if (batchLines) {
        const lines = input.split(/\r?\n/);
        const converted = lines
          .map((line) => transformSegment(line, mode, engine, spaceMode))
          .join('\n');
        return { output: converted, error: null as string | null };
      }
      return {
        output: transformSegment(input, mode, engine, spaceMode),
        error: null as string | null,
      };
    } catch {
      return { output: '', error: tUI('invalidFormat') };
    }
  }, [input, mode, engine, spaceMode, batchLines, tUI]);

  const queryParams = useMemo(() => {
    const sourceForParams = mode === 'decode' && output ? output : input;
    return extractQueryParams(sourceForParams);
  }, [input, output, mode]);

  const snippets: Record<LangTab, { label: string; code: string }> = {
    csharp: { label: tUI('exCsharpLabel'), code: tUI('exCsharpVal') },
    python: { label: tUI('exPythonLabel'), code: tUI('exPythonVal') },
    java: { label: tUI('exJavaLabel'), code: tUI('exJavaVal') },
    js: { label: tUI('exJsLabel'), code: tUI('exJsVal') },
    html: { label: tUI('exHtmlLabel'), code: tUI('exHtmlVal') },
  };

  const handleCopyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySnippet = async () => {
    const code = snippets[activeLang].code;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
    }
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  const applyPresetFullUrl = () => {
    setMode('encode');
    setEngine('fullUrl');
    setSpaceMode('percent');
    setBatchLines(false);
    setInput(SAMPLE_FULL_URL);
  };

  const applyPresetEncodedQuery = () => {
    setMode('decode');
    setEngine('component');
    setSpaceMode('plus');
    setBatchLines(false);
    setInput(SAMPLE_ENCODED_QUERY);
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <GlobalContainer maxWidth="2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Link2 size={24} />
          </div>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />
        </div>

        {/* Mode & Preset Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                mode === 'encode'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tUI('encode')}
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                mode === 'decode'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tUI('decode')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyPresetFullUrl}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {tUI('presetFullUrl')}
            </button>
            <button
              type="button"
              onClick={applyPresetEncodedQuery}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {tUI('presetQuery')}
            </button>
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-blue-500/40 cursor-pointer transition-colors"
            >
              <ArrowLeftRight size={13} />
              {tUI('swapBtn')}
            </button>
            <button
              type="button"
              onClick={() => setInput('')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
              {tUI('clearBtn')}
            </button>
          </div>
        </div>

        {/* Engine, Space Mode & Batch Options Bar */}
        <div
          className="mb-6 p-3.5 rounded-xl border flex flex-wrap items-center gap-x-6 gap-y-3"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {tUI('engineLabel')}
            </span>
            <button
              type="button"
              onClick={() => setEngine('component')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                engine === 'component'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {tUI('engineComponent')}
            </button>
            <button
              type="button"
              onClick={() => setEngine('fullUrl')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                engine === 'fullUrl'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {tUI('engineFullUrl')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {tUI('spaceLabel')}
            </span>
            <button
              type="button"
              onClick={() => setSpaceMode('percent')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                spaceMode === 'percent'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {tUI('spacePercent')}
            </button>
            <button
              type="button"
              onClick={() => setSpaceMode('plus')}
              className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                spaceMode === 'plus'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {tUI('spacePlus')}
            </button>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={batchLines}
              onChange={(e) => setBatchLines(e.target.checked)}
              className="rounded border-[var(--border-subtle)] accent-blue-500 cursor-pointer"
            />
            {tUI('batchLinesLabel')}
          </label>
        </div>

        {/* Side-by-Side Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center h-7">
              <label
                htmlFor="url-input"
                className="text-sm font-medium text-[var(--text-secondary)]"
              >
                {tUI('inputLabel')}
              </label>
            </div>
            <textarea
              id="url-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tUI('inputPlaceholder')}
              className="w-full h-72 p-4 rounded-xl border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center h-7">
              <label
                htmlFor="url-output"
                className="text-sm font-medium text-[var(--text-secondary)]"
              >
                {tUI('outputLabel')}
              </label>
              <button
                type="button"
                onClick={handleCopyOutput}
                disabled={!output}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? tUI('copied') : tUI('copy')}
              </button>
            </div>
            <div className="relative h-72">
              <textarea
                id="url-output"
                value={output}
                readOnly
                placeholder={tUI('outputPlaceholder')}
                className="w-full h-full p-4 rounded-xl border font-mono text-sm resize-none focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: error ? '#ef4444' : 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decoded Query Parameters Breakdown Table */}
        {queryParams.length > 0 && (
          <div
            className="mb-8 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <Table2 size={17} className="text-emerald-500" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {tUI('queryTableTitle', { count: queryParams.length })}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <th className="px-5 py-2.5 font-semibold w-1/3">{tUI('colKey')}</th>
                    <th className="px-5 py-2.5 font-semibold">{tUI('colValue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {queryParams.map((item, idx) => (
                    <tr
                      key={`${item.key}-${idx}`}
                      className="border-b last:border-b-0 border-[var(--border-subtle)]/60"
                    >
                      <td className="px-5 py-2.5 text-blue-400 break-all align-top">{item.key}</td>
                      <td className="px-5 py-2.5 text-[var(--text-primary)] break-all align-top">
                        {item.value || '""'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Multi-Language Code Reference Card */}
        <div
          className="rounded-xl border p-5"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-blue-500" />
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  {tUI('codeTitle')}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">{tUI('codeSubtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
            >
              {copiedSnippet ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
              {copiedSnippet ? tUI('copied') : tUI('copy')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.keys(snippets) as LangTab[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeLang === lang
                    ? 'bg-blue-500 text-white'
                    : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {snippets[lang].label}
              </button>
            ))}
          </div>

          <pre
            className="p-3.5 rounded-lg border font-mono text-xs overflow-x-auto"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <code>{snippets[activeLang].code}</code>
          </pre>
        </div>

        <ToolSeoContent
          toolSlug="url-encoder-decoder"
          toolName={tTools('url-encoder-decoder.name')}
          description={tTools('url-encoder-decoder.description')}
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
