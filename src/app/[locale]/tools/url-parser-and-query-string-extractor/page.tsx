'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Globe,
  Copy,
  Check,
  Trash2,
  Plus,
  X,
  Code2,
  Table2,
  Braces,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ListFilter,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type TabMode = 'single' | 'bulk';
type CodeLang = 'js' | 'python' | 'dotnet' | 'php' | 'go';

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
  'https://velnoxlabs.com/tools/url-parser?utm_source=google&utm_medium=cpc&utm_campaign=dev_tools&fbclid=IwAR123&tag=javascript&tag=python&q=parse%20url%20params';
const SAMPLE_RAW_QUERY = '?search=url+query+parser&filter=active&tag=web&tag=api&lang=en';

const TRACKING_KEYS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'igshid',
  '_ga',
  '_gl',
  'yclid',
  'twclid',
]);

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
}

function detectNestedFormat(val: string): 'url' | 'json' | 'base64' | null {
  const v = val.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return 'url';
  if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
    try {
      JSON.parse(v);
      return 'json';
    } catch {
      // not valid json
    }
  }
  if (v.length >= 12 && v.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(v)) {
    try {
      const dec = atob(v);
      if (/^[\x20-\x7E]+$/.test(dec)) return 'base64';
    } catch {
      // not valid base64
    }
  }
  return null;
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

  const [activeTab, setActiveTab] = useState<TabMode>('single');
  const [input, setInput] = useState(SAMPLE_UTM_DUPLICATES);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('js');

  const [bulkInput, setBulkInput] = useState<string>(
    `${SAMPLE_UTM_DUPLICATES}\n${SAMPLE_FULL_AUTH}`
  );

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

  const securityWarnings = useMemo(() => {
    if (!parsed) return [];
    const warns: string[] = [];
    if (parsed.username || parsed.password) {
      warns.push(tUI('warnAuthExposed'));
    }
    if (parsed.protocol === 'http:') {
      warns.push(tUI('warnInsecureHttp'));
    }
    if (parsed.hostname.includes('xn--')) {
      warns.push(tUI('warnPunycode'));
    }
    const hasOpenRedirect = parsed.params.some(
      (p) =>
        /^(redirect|redirect_uri|next|return_url|url|goto)$/i.test(p.key) &&
        /^https?:\/\//i.test(p.value)
    );
    if (hasOpenRedirect) {
      warns.push(tUI('warnOpenRedirect'));
    }
    return warns;
  }, [parsed, tUI]);

  const trackingCount = useMemo(() => {
    if (!parsed) return 0;
    return parsed.params.filter((p) => TRACKING_KEYS.has(p.key.toLowerCase())).length;
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

  const bulkParsed = useMemo(() => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines
      .map((line) => ({ raw: line, parsed: parseInputUrl(line) }))
      .filter((r) => r.parsed !== null);
  }, [bulkInput]);

  const bulkJsonExport = useMemo(() => {
    return JSON.stringify(
      bulkParsed.map((b) => ({
        url: b.parsed?.href,
        hostname: b.parsed?.hostname || null,
        pathname: b.parsed?.pathname || null,
        params: b.parsed?.params.map((p) => ({ [p.key]: p.value })) || [],
      })),
      null,
      2
    );
  }, [bulkParsed]);

  const snippets: Record<CodeLang, { label: string; code: string }> = {
    js: { label: tUI('exJsLabel'), code: tUI('exJsVal') },
    python: { label: tUI('exPythonLabel'), code: tUI('exPythonVal') },
    dotnet: { label: tUI('exDotnetLabel'), code: tUI('exDotnetVal') },
    php: { label: tUI('exPhpLabel'), code: tUI('exPhpVal') },
    go: { label: tUI('exGoLabel'), code: tUI('exGoVal') },
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

  const handleStripTracking = () => {
    if (!parsed) return;
    const next = parsed.params
      .filter((p) => !TRACKING_KEYS.has(p.key.toLowerCase()))
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'AI URL Parser & Query String Extractor - VelnoxLabs',
        url: 'https://velnoxlabs.com/tools/url-parser-and-query-string-extractor',
        description:
          'Free AI URL parser, UTM cleaner, and query string extractor online. Inspect URL components, strip tracking parameters, detect security risks, edit params, and export JSON.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I parse a URL and extract query string parameters online?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Paste any full URL or raw query string into the box. The parser instantly splits protocol, host, path segments, hash, and decoded query parameters into an editable table with JSON export.',
            },
          },
          {
            '@type': 'Question',
            name: 'How can I remove UTM and tracking parameters from a URL?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Click the 1-click Strip UTM / Tracking button to remove utm_source, utm_medium, fbclid, gclid, and other tracking tags while rebuilding a clean canonical URL.',
            },
          },
        ],
      },
    ],
  };

  return (
    <GlobalContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* 2-Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          {[
            { id: 'single' as TabMode, label: tUI('tabSingle'), icon: Globe },
            { id: 'bulk' as TabMode, label: tUI('tabBulk'), icon: ListFilter },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-page)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SINGLE URL PARSER */}
        {activeTab === 'single' && (
          <div className="space-y-6">
            {/* Input & Presets Card */}
            <div
              className={`rounded-2xl border p-5 bg-[var(--bg-card)] shadow-sm space-y-3 ${
                hasError ? 'border-rose-500' : 'border-[var(--border-color)]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="url-parser-input"
                  className="text-sm font-semibold text-[var(--text-main)]"
                >
                  {tUI('urlLabel')}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInput(SAMPLE_FULL_AUTH)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetFullBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput(SAMPLE_UTM_DUPLICATES)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetUtmBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput(SAMPLE_RAW_QUERY)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetQueryBtn')}
                  </button>
                  {trackingCount > 0 && (
                    <button
                      type="button"
                      onClick={handleStripTracking}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      {tUI('stripUtmBtn')} ({trackingCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
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
                className="w-full p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-xs sm:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />

              {hasError && (
                <p className="text-xs font-mono text-rose-500">{tUI('invalidUrlError')}</p>
              )}

              {/* Security Check Bar */}
              {parsed && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {securityWarnings.length === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {tUI('securityCleanBadge')}
                    </span>
                  ) : (
                    securityWarnings.map((w, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {w}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Parsed Results Grid */}
            {parsed && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left: Structural Components */}
                <div className="xl:col-span-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden h-fit shadow-sm">
                  <div className="px-5 py-3.5 border-b border-[var(--border-color)]">
                    <h2 className="text-sm font-semibold text-[var(--text-main)]">
                      {tUI('componentsTitle')}
                    </h2>
                  </div>
                  <div className="divide-y divide-[var(--border-color)]/60">
                    {componentRows.map((row) => (
                      <div
                        key={row.id}
                        className="px-5 py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium text-[var(--text-muted)] shrink-0 w-28">
                          {row.label}
                        </span>
                        <span
                          className={`font-mono break-all flex-1 ${
                            row.value
                              ? 'text-[var(--text-main)]'
                              : 'text-[var(--text-muted)]/50 italic'
                          }`}
                        >
                          {row.value || tUI('emptyVal')}
                        </span>
                        {row.value && (
                          <button
                            type="button"
                            onClick={() => handleCopy(`comp-${row.id}`, row.value)}
                            aria-label={tUI('copy')}
                            className="p-1.5 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer shrink-0"
                          >
                            {copiedKey === `comp-${row.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Editable Query Parameters Table + Rebuilt URL */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-semibold text-[var(--text-main)]">
                          {tUI('queryTableTitle', { count: parsed.params.length })}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddParam}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          {tUI('addParamBtn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy('json', jsonExport)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          {copiedKey === 'json' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Braces className="w-3 h-3" />
                          )}
                          {copiedKey === 'json' ? tUI('copiedJsonBtn') : tUI('copyJsonBtn')}
                        </button>
                      </div>
                    </div>

                    {parsed.params.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        {tUI('noParamsMsg')}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-color)] bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)]">
                              <th className="py-2.5 px-3 font-semibold">{tUI('colKey')}</th>
                              <th className="py-2.5 px-3 font-semibold">{tUI('colDecodedVal')}</th>
                              <th className="py-2.5 px-3 font-semibold w-28">
                                {tUI('colActions')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-color)]">
                            {parsed.params.map((param, idx) => {
                              const isDup = (keyCounts[param.key] || 0) > 1;
                              const isTrack = TRACKING_KEYS.has(param.key.toLowerCase());
                              const nestedType = detectNestedFormat(param.value);

                              return (
                                <tr key={idx}>
                                  <td className="py-2 px-3 align-top">
                                    <input
                                      type="text"
                                      value={param.key}
                                      onChange={(e) =>
                                        handleParamChange(idx, 'key', e.target.value)
                                      }
                                      className="w-full px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-page)] font-mono text-xs text-[var(--text-main)]"
                                    />
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {isDup && (
                                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                                          {tUI('duplicateBadge')}
                                        </span>
                                      )}
                                      {isTrack && (
                                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold">
                                          Tracking
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-3 align-top">
                                    <input
                                      type="text"
                                      value={param.value}
                                      onChange={(e) =>
                                        handleParamChange(idx, 'value', e.target.value)
                                      }
                                      className="w-full px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-page)] font-mono text-xs text-[var(--text-main)]"
                                    />
                                    {nestedType === 'url' && (
                                      <button
                                        type="button"
                                        onClick={() => setInput(param.value)}
                                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                      >
                                        <Sparkles className="w-3 h-3" />
                                        {tUI('inspectNestedUrl')}
                                      </button>
                                    )}
                                    {nestedType === 'base64' && (
                                      <span className="mt-1 block text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                        Base64: {atob(param.value.trim()).slice(0, 60)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 align-top">
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopy(`val-${idx}`, `${param.key}=${param.value}`)
                                        }
                                        className="p-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                        title={tUI('copy')}
                                      >
                                        {copiedKey === `val-${idx}` ? (
                                          <Check className="w-3 h-3 text-emerald-500" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveParam(idx)}
                                        className="p-1.5 rounded border border-[var(--border-color)] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                        title={tUI('removeBtn')}
                                      >
                                        <X className="w-3 h-3" />
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

                  {/* Rebuilt Live URL Card */}
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {tUI('rebuiltUrlLabel')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('rebuilt', parsed.href)}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] cursor-pointer"
                      >
                        {copiedKey === 'rebuilt' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedKey === 'rebuilt' ? tUI('copied') : tUI('copy')}
                      </button>
                    </div>
                    <div className="p-3 rounded-xl border border-[var(--border-color)] bg-zinc-950 font-mono text-xs text-emerald-400 break-all">
                      {parsed.href}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BULK URL EXTRACTOR */}
        {activeTab === 'bulk' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">{tUI('bulkTitle')}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('bulkSubtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy('bulk-json', bulkJsonExport)}
                disabled={bulkParsed.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                {copiedKey === 'bulk-json' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Braces className="w-3.5 h-3.5" />
                )}
                {copiedKey === 'bulk-json' ? tUI('copiedJsonBtn') : tUI('copyJsonBtn')}
              </button>
            </div>

            <textarea
              rows={5}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={tUI('bulkPlaceholder')}
              className="w-full p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-xs resize-y"
            />

            {bulkParsed.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)]">
                      <th className="py-2 px-3 font-semibold">#</th>
                      <th className="py-2 px-3 font-semibold">{tUI('fieldHostname')}</th>
                      <th className="py-2 px-3 font-semibold">{tUI('fieldPathname')}</th>
                      <th className="py-2 px-3 font-semibold">Params</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                    {bulkParsed.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-[var(--text-muted)]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold">
                          {row.parsed?.hostname || '—'}
                        </td>
                        <td className="py-2 px-3 font-mono">{row.parsed?.pathname || '—'}</td>
                        <td className="py-2 px-3 font-mono text-[var(--text-muted)]">
                          {row.parsed?.params.map((p) => `${p.key}=${p.value}`).join(', ') ||
                            '(none)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Code Reference Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-main)]">
                  {tUI('codeTitle')}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{tUI('codeSubtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('snippet', snippets[activeLang].code)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] cursor-pointer"
            >
              {copiedKey === 'snippet' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
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
                    ? 'bg-blue-600 text-white'
                    : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {snippets[lang].label}
              </button>
            ))}
          </div>

          <pre className="p-3.5 rounded-xl border border-[var(--border-color)] bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto">
            <code>{snippets[activeLang].code}</code>
          </pre>
        </div>

        {/* Clean Standard HTML Comparison Table */}
        <div className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[var(--text-main)]">{tUI('comparisonTitle')}</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-zinc-50 dark:bg-zinc-900/50 text-[var(--text-muted)]">
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColFeature')}</th>
                  <th className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">
                    {tUI('compColVelnox')}
                  </th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColFf')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColUd')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow1Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow1Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1Ff')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1Ud')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow2Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow2Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2Ff')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2Ud')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow3Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow3Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3Ff')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3Ud')}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
      </div>
    </GlobalContainer>
  );
}
