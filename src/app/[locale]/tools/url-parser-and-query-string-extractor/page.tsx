'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Globe, Copy, Check, Trash2, Plus, X, Code2, Table2, Braces } from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type CodeLang = 'js' | 'python' | 'dotnet';

interface QueryParamItem {
  key: string;
  value: string;
  rawKey: string;
  rawValue: string;
}

interface ParsedUrlResult {
  kind: 'full' | 'relative' | 'rawQuery';
  href: string;
  origin: string;
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  pathSegments: string[];
  search: string;
  hash: string;
  params: QueryParamItem[];
}

const SAMPLE_FULL_AUTH =
  'https://admin:s3cr3t@api.velnoxlabs.com:8443/v2/users/profile?role=editor&active=true&redirect=https%3A%2F%2Fvelnoxlabs.com%2Fhome#security';
const SAMPLE_UTM_DUPLICATES =
  'https://velnoxlabs.com/tools/url-parser?utm_source=google&utm_medium=cpc&tag=javascript&tag=python&q=parse%20url%20params';
const SAMPLE_RAW_QUERY = '?search=url+query+parser&filter=active&tag=web&tag=api&lang=en';

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
}

function parseRawQueryPairs(searchStr: string): QueryParamItem[] {
  const clean = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
  if (!clean) return [];
  return clean
    .split('&')
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) {
        return {
          key: safeDecode(pair),
          value: '',
          rawKey: pair,
          rawValue: '',
        };
      }
      const rawKey = pair.slice(0, eqIdx);
      const rawValue = pair.slice(eqIdx + 1);
      return {
        key: safeDecode(rawKey),
        value: safeDecode(rawValue),
        rawKey,
        rawValue,
      };
    });
}

function parseInputUrl(raw: string): ParsedUrlResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Raw query string: starts with '?' or contains '=' without scheme/leading slash/whitespace
  if (
    trimmed.startsWith('?') ||
    (!trimmed.includes('://') &&
      !trimmed.startsWith('/') &&
      !trimmed.startsWith('//') &&
      trimmed.includes('=') &&
      !/\s/.test(trimmed))
  ) {
    const hashIdx = trimmed.indexOf('#');
    const queryPart = hashIdx !== -1 ? trimmed.slice(0, hashIdx) : trimmed;
    const hash = hashIdx !== -1 ? trimmed.slice(hashIdx) : '';
    const search = queryPart.startsWith('?') ? queryPart : `?${queryPart}`;
    return {
      kind: 'rawQuery',
      href: `${search}${hash}`,
      origin: '',
      protocol: '',
      username: '',
      password: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      pathSegments: [],
      search,
      hash,
      params: parseRawQueryPairs(search),
    };
  }

  // Relative path starting with '/' (not '//')
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    try {
      const u = new URL(trimmed, 'https://relative.velnoxlabs.local');
      return {
        kind: 'relative',
        href: `${u.pathname}${u.search}${u.hash}`,
        origin: '',
        protocol: '',
        username: '',
        password: '',
        host: '',
        hostname: '',
        port: '',
        pathname: u.pathname,
        pathSegments: u.pathname.split('/').filter(Boolean),
        search: u.search,
        hash: u.hash,
        params: parseRawQueryPairs(u.search),
      };
    } catch {
      return null;
    }
  }

  // Full or protocol-relative URL
  try {
    const target = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const u = new URL(target);
    return {
      kind: 'full',
      href: u.toString(),
      origin: u.origin === 'null' ? '' : u.origin,
      protocol: u.protocol,
      username: u.username,
      password: u.password,
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      pathSegments: u.pathname.split('/').filter(Boolean),
      search: u.search,
      hash: u.hash,
      params: parseRawQueryPairs(u.search),
    };
  } catch {
    return null;
  }
}

function buildUpdatedInput(
  parsed: ParsedUrlResult,
  nextParams: Array<{ key: string; value: string }>
): string {
  const queryString = nextParams
    .filter((p) => p.key.length > 0 || p.value.length > 0)
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');
  const nextSearch = queryString ? `?${queryString}` : '';

  if (parsed.kind === 'rawQuery') {
    return `${nextSearch}${parsed.hash}`;
  }
  if (parsed.kind === 'relative') {
    return `${parsed.pathname}${nextSearch}${parsed.hash}`;
  }
  try {
    const u = new URL(parsed.href);
    u.search = nextSearch;
    return u.toString();
  } catch {
    return parsed.href;
  }
}

export default function UrlParserPage() {
  const tUI = useTranslations('ToolUI.urlParser');
  const tTools = useTranslations('Tools');

  const [input, setInput] = useState(SAMPLE_UTM_DUPLICATES);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('js');

  const parsed = useMemo(() => parseInputUrl(input), [input]);
  const hasError = input.trim().length > 0 && parsed === null;

  const keyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!parsed) return counts;
    for (const p of parsed.params) {
      counts[p.key] = (counts[p.key] || 0) + 1;
    }
    return counts;
  }, [parsed]);

  const jsonExport = useMemo(() => {
    if (!parsed) return '{}';
    const obj: Record<string, string | string[]> = {};
    for (const p of parsed.params) {
      const existing = obj[p.key];
      if (existing === undefined) {
        obj[p.key] = p.value;
      } else if (Array.isArray(existing)) {
        existing.push(p.value);
      } else {
        obj[p.key] = [existing, p.value];
      }
    }
    return JSON.stringify(obj, null, 2);
  }, [parsed]);

  const snippets: Record<CodeLang, { label: string; code: string }> = {
    js: { label: tUI('exJsLabel'), code: tUI('exJsVal') },
    python: { label: tUI('exPythonLabel'), code: tUI('exPythonVal') },
    dotnet: { label: tUI('exDotnetLabel'), code: tUI('exDotnetVal') },
  };

  const handleCopy = async (id: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleParamChange = (idx: number, field: 'key' | 'value', val: string) => {
    if (!parsed) return;
    const next = parsed.params.map((p, i) =>
      i === idx ? { ...p, [field]: val } : { key: p.key, value: p.value }
    );
    setInput(buildUpdatedInput(parsed, next));
  };

  const handleAddParam = () => {
    if (!parsed) return;
    const next = [
      ...parsed.params.map((p) => ({ key: p.key, value: p.value })),
      { key: 'param', value: 'value' },
    ];
    setInput(buildUpdatedInput(parsed, next));
  };

  const handleRemoveParam = (idx: number) => {
    if (!parsed) return;
    const next = parsed.params
      .filter((_, i) => i !== idx)
      .map((p) => ({ key: p.key, value: p.value }));
    setInput(buildUpdatedInput(parsed, next));
  };

  const componentRows = parsed
    ? [
        { id: 'origin', label: tUI('fieldOrigin'), value: parsed.origin },
        { id: 'protocol', label: tUI('fieldProtocol'), value: parsed.protocol },
        { id: 'username', label: tUI('fieldUsername'), value: parsed.username },
        { id: 'password', label: tUI('fieldPassword'), value: parsed.password },
        { id: 'host', label: tUI('fieldHost'), value: parsed.host },
        { id: 'hostname', label: tUI('fieldHostname'), value: parsed.hostname },
        { id: 'port', label: tUI('fieldPort'), value: parsed.port },
        { id: 'pathname', label: tUI('fieldPathname'), value: parsed.pathname },
        {
          id: 'segments',
          label: tUI('fieldSegments'),
          value: parsed.pathSegments.length ? parsed.pathSegments.join(' / ') : '',
        },
        { id: 'search', label: tUI('fieldSearch'), value: parsed.search },
        { id: 'hash', label: tUI('fieldHash'), value: parsed.hash },
      ]
    : [];

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <GlobalContainer maxWidth="2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Globe size={24} />
          </div>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />
        </div>

        {/* Input & Presets Card */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: hasError ? '#ef4444' : 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label
              htmlFor="url-parser-input"
              className="text-sm font-semibold text-[var(--text-primary)]"
            >
              {tUI('urlLabel')}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_FULL_AUTH)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetFullBtn')}
              </button>
              <button
                type="button"
                onClick={() => setInput(SAMPLE_UTM_DUPLICATES)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetUtmBtn')}
              </button>
              <button
                type="button"
                onClick={() => setInput(SAMPLE_RAW_QUERY)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetQueryBtn')}
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer transition-colors"
              >
                <Trash2 size={12} />
                {tUI('clearBtn')}
              </button>
            </div>
          </div>

          <textarea
            id="url-parser-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tUI('urlPlaceholder')}
            className="w-full p-3.5 rounded-xl border font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />

          {hasError && (
            <p className="mt-2.5 text-xs font-mono text-red-400">{tUI('invalidUrlError')}</p>
          )}
        </div>

        {/* Parsed Results Grid */}
        {parsed && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Left: Structural Components */}
            <div
              className="xl:col-span-5 rounded-xl border overflow-hidden h-fit"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  {tUI('componentsTitle')}
                </h2>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]/60">
                {componentRows.map((row) => (
                  <div
                    key={row.id}
                    className="px-5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-medium text-[var(--text-secondary)] shrink-0 w-32">
                      {row.label}
                    </span>
                    <span
                      className={`font-mono break-all flex-1 ${
                        row.value
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]/50 italic'
                      }`}
                    >
                      {row.value || tUI('emptyVal')}
                    </span>
                    {row.value && (
                      <button
                        type="button"
                        onClick={() => handleCopy(`comp-${row.id}`, row.value)}
                        aria-label={tUI('copy')}
                        className="p-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
                      >
                        {copiedKey === `comp-${row.id}` ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Editable Query Parameters Table + Rebuilt URL */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <div
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Table2 size={17} className="text-emerald-500" />
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                      {tUI('queryTableTitle', { count: parsed.params.length })}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddParam}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                      {tUI('addParamBtn').replace(/^\+\s*/, '')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy('json', jsonExport)}
                      disabled={parsed.params.length === 0}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'json' ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Braces size={12} />
                      )}
                      {copiedKey === 'json' ? tUI('copiedJsonBtn') : tUI('copyJsonBtn')}
                    </button>
                  </div>
                </div>

                {parsed.params.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
                    {tUI('noParamsText')}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          <th className="px-4 py-2.5 font-semibold">{tUI('colKey')}</th>
                          <th className="px-4 py-2.5 font-semibold">{tUI('colDecodedVal')}</th>
                          <th className="px-4 py-2.5 font-semibold">{tUI('colRawVal')}</th>
                          <th className="px-3 py-2.5 font-semibold text-right">
                            {tUI('colActions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]/60">
                        {parsed.params.map((param, idx) => {
                          const isDuplicate = (keyCounts[param.key] || 0) > 1;
                          return (
                            <tr key={`${idx}-${param.rawKey}`}>
                              <td className="px-4 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="text"
                                    value={param.key}
                                    placeholder={tUI('newParamKeyPlaceholder')}
                                    onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                                    className="w-full min-w-[90px] px-2.5 py-1.5 rounded-md border font-mono text-xs text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                    style={{
                                      backgroundColor: 'var(--bg-primary)',
                                      borderColor: 'var(--border-subtle)',
                                    }}
                                  />
                                  {isDuplicate && (
                                    <span className="inline-block w-fit px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                      {tUI('duplicateBadge')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 align-top">
                                <input
                                  type="text"
                                  value={param.value}
                                  placeholder={tUI('newParamValPlaceholder')}
                                  onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                                  className="w-full min-w-[120px] px-2.5 py-1.5 rounded-md border font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    borderColor: 'var(--border-subtle)',
                                  }}
                                />
                              </td>
                              <td className="px-4 py-2 align-top font-mono text-[11px] text-[var(--text-secondary)] break-all max-w-[160px]">
                                {param.rawValue || tUI('emptyVal')}
                              </td>
                              <td className="px-3 py-2 align-top text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(`val-${idx}`, param.value)}
                                    aria-label={tUI('copy')}
                                    className="p-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                                  >
                                    {copiedKey === `val-${idx}` ? (
                                      <Check size={12} className="text-emerald-500" />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveParam(idx)}
                                    aria-label={tUI('removeParamLabel')}
                                    className="p-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Live Rebuilt URL Card */}
              <div
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {tUI('rebuiltUrlLabel')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('rebuilt', parsed.href)}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer"
                  >
                    {copiedKey === 'rebuilt' ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedKey === 'rebuilt' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <div
                  className="p-3 rounded-lg border font-mono text-xs text-emerald-400 break-all"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  {parsed.href}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Reference Card */}
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
              onClick={() => handleCopy('snippet', snippets[activeLang].code)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
            >
              {copiedKey === 'snippet' ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} />
              )}
              {copiedKey === 'snippet' ? tUI('copied') : tUI('copy')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.keys(snippets) as CodeLang[]).map((lang) => (
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
          toolSlug="url-parser-and-query-string-extractor"
          toolName={tTools('url-parser-and-query-string-extractor.name')}
          description={tTools('url-parser-and-query-string-extractor.description')}
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
