'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  MonitorSmartphone,
  Copy,
  Check,
  Trash2,
  Bot,
  UserCheck,
  Cpu,
  Globe,
  Layers,
  Code2,
  Braces,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type CodeLang = 'js' | 'python' | 'java' | 'php';

interface ParsedUserAgent {
  browserName: string;
  browserVersion: string;
  engineName: string;
  engineVersion: string;
  osName: string;
  osVersion: string;
  deviceKind: 'desktop' | 'mobile' | 'tablet' | 'bot';
  architecture: string;
  isBot: boolean;
  botName: string;
  tokens: string[];
}

const SAMPLE_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1';
const SAMPLE_ANDROID =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.89 Mobile Safari/537.36';
const SAMPLE_GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const SAMPLE_CURL = 'curl/8.7.1';

const BOT_PATTERNS: Array<{ regex: RegExp; name: string }> = [
  { regex: /Googlebot\/?([\d.]*)/i, name: 'Googlebot' },
  { regex: /bingbot\/?([\d.]*)/i, name: 'Bingbot' },
  { regex: /GPTBot\/?([\d.]*)/i, name: 'GPTBot' },
  { regex: /ClaudeBot\/?([\d.]*)/i, name: 'ClaudeBot' },
  { regex: /PerplexityBot\/?([\d.]*)/i, name: 'PerplexityBot' },
  { regex: /Bytespider/i, name: 'Bytespider' },
  { regex: /DuckDuckBot\/?([\d.]*)/i, name: 'DuckDuckBot' },
  { regex: /Applebot\/?([\d.]*)/i, name: 'Applebot' },
  { regex: /facebookexternalhit\/?([\d.]*)/i, name: 'Facebook Crawler' },
  { regex: /Twitterbot\/?([\d.]*)/i, name: 'Twitterbot' },
  { regex: /LinkedInBot\/?([\d.]*)/i, name: 'LinkedInBot' },
  { regex: /curl\/([\d.]+)/i, name: 'cURL' },
  { regex: /Wget\/([\d.]+)/i, name: 'Wget' },
  { regex: /python-requests\/([\d.]+)/i, name: 'Python Requests' },
  { regex: /PostmanRuntime\/([\d.]+)/i, name: 'Postman' },
  { regex: /Go-http-client\/([\d.]+)/i, name: 'Go HTTP Client' },
  { regex: /okhttp\/([\d.]+)/i, name: 'OkHttp' },
  { regex: /axios\/([\d.]+)/i, name: 'Axios' },
  { regex: /(bot|crawler|spider|slurp|headless)/i, name: 'Automated Bot' },
];

function matchVer(ua: string, regex: RegExp): string {
  const m = ua.match(regex);
  return m && m[1] ? m[1].replace(/_/g, '.') : '';
}

function parseUserAgent(uaRaw: string): ParsedUserAgent | null {
  const ua = uaRaw.trim();
  if (!ua) return null;

  // 1. Bot / Crawler / CLI detection
  let isBot = false;
  let botName = '';
  let botVersion = '';
  for (const bp of BOT_PATTERNS) {
    const m = ua.match(bp.regex);
    if (m) {
      isBot = true;
      botName = bp.name;
      botVersion = m[1] || '';
      break;
    }
  }

  // 2. Browser & version
  let browserName = '';
  let browserVersion = '';
  if (ua.includes('Edg/')) {
    browserName = 'Microsoft Edge';
    browserVersion = matchVer(ua, /Edg\/([\d.]+)/);
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browserName = 'Opera';
    browserVersion = matchVer(ua, /(?:OPR|Opera)\/([\d.]+)/);
  } else if (ua.includes('SamsungBrowser/')) {
    browserName = 'Samsung Internet';
    browserVersion = matchVer(ua, /SamsungBrowser\/([\d.]+)/);
  } else if (ua.includes('Vivaldi/')) {
    browserName = 'Vivaldi';
    browserVersion = matchVer(ua, /Vivaldi\/([\d.]+)/);
  } else if (ua.includes('Firefox/')) {
    browserName = 'Mozilla Firefox';
    browserVersion = matchVer(ua, /Firefox\/([\d.]+)/);
  } else if (ua.includes('FxiOS/')) {
    browserName = 'Firefox (iOS)';
    browserVersion = matchVer(ua, /FxiOS\/([\d.]+)/);
  } else if (ua.includes('CriOS/')) {
    browserName = 'Chrome (iOS)';
    browserVersion = matchVer(ua, /CriOS\/([\d.]+)/);
  } else if (ua.includes('Chrome/')) {
    browserName = 'Google Chrome';
    browserVersion = matchVer(ua, /Chrome\/([\d.]+)/);
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Apple Safari';
    browserVersion = matchVer(ua, /Version\/([\d.]+)/) || matchVer(ua, /Safari\/([\d.]+)/);
  } else if (ua.includes('MSIE ') || ua.includes('Trident/')) {
    browserName = 'Internet Explorer';
    browserVersion = matchVer(ua, /(?:MSIE |rv:)([\d.]+)/);
  } else if (isBot) {
    browserName = botName;
    browserVersion = botVersion;
  }

  // 3. Rendering Engine
  let engineName = '';
  let engineVersion = '';
  if (
    ua.includes('AppleWebKit/') &&
    (ua.includes('Chrome/') ||
      ua.includes('Edg/') ||
      ua.includes('OPR/') ||
      ua.includes('CriOS/') ||
      ua.includes('SamsungBrowser/'))
  ) {
    engineName = 'Blink';
    engineVersion = matchVer(ua, /Chrome\/([\d.]+)/) || matchVer(ua, /AppleWebKit\/([\d.]+)/);
  } else if (ua.includes('Gecko/')) {
    engineName = 'Gecko';
    engineVersion = matchVer(ua, /rv:([\d.]+)/) || matchVer(ua, /Gecko\/([\d.]+)/);
  } else if (ua.includes('AppleWebKit/')) {
    engineName = 'WebKit';
    engineVersion = matchVer(ua, /AppleWebKit\/([\d.]+)/);
  } else if (ua.includes('Trident/')) {
    engineName = 'Trident';
    engineVersion = matchVer(ua, /Trident\/([\d.]+)/);
  }

  // 4. OS & version
  let osName = '';
  let osVersion = '';
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    osName = 'iOS';
    osVersion = matchVer(ua, /OS ([\d_]+)/);
  } else if (ua.includes('Android')) {
    osName = 'Android';
    osVersion = matchVer(ua, /Android ([\d.]+)/);
  } else if (ua.includes('Windows NT')) {
    osName = 'Windows';
    const nt = matchVer(ua, /Windows NT ([\d.]+)/);
    osVersion =
      nt === '10.0'
        ? '10 / 11'
        : nt === '6.3'
          ? '8.1'
          : nt === '6.2'
            ? '8'
            : nt === '6.1'
              ? '7'
              : nt;
  } else if (ua.includes('CrOS')) {
    osName = 'ChromeOS';
    osVersion = matchVer(ua, /CrOS \S+ ([\d.]+)/);
  } else if (ua.includes('Mac OS X')) {
    osName = 'macOS';
    osVersion = matchVer(ua, /Mac OS X ([\d_.]+)/);
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
  }

  // 5. Device kind & CPU architecture
  let deviceKind: ParsedUserAgent['deviceKind'] = 'desktop';
  if (isBot && !ua.includes('Mobile')) {
    deviceKind = 'bot';
  } else if (
    /iPad|Tablet|PlayBook|Silk/i.test(ua) ||
    (ua.includes('Android') && !ua.includes('Mobile'))
  ) {
    deviceKind = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android/i.test(ua)) {
    deviceKind = 'mobile';
  }

  let architecture = '';
  if (/arm64|aarch64/i.test(ua)) {
    architecture = 'ARM64';
  } else if (/Win64|WOW64|x86_64|amd64|x64/i.test(ua)) {
    architecture = 'x86_64 (64-bit)';
  } else if (/i686|i386|x86/i.test(ua)) {
    architecture = 'x86 (32-bit)';
  } else if (/armv\d+|arm/i.test(ua)) {
    architecture = 'ARM';
  }

  // 6. Token breakdown
  const tokens = ua.match(/[^\s()]+(?:\([^)]*\))?|\([^)]*\)/g) || [];

  return {
    browserName,
    browserVersion,
    engineName,
    engineVersion,
    osName,
    osVersion,
    deviceKind,
    architecture,
    isBot,
    botName,
    tokens,
  };
}

export default function UserAgentParserPage() {
  const tUI = useTranslations('ToolUI.userAgentParser');
  const tTools = useTranslations('Tools');

  const [uaString, setUaString] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('js');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      setUaString(navigator.userAgent);
    }
  }, []);

  const parsed = useMemo(() => parseUserAgent(uaString), [uaString]);

  const jsonExport = useMemo(() => {
    if (!parsed) return '{}';
    return JSON.stringify(
      {
        browser: {
          name: parsed.browserName || null,
          version: parsed.browserVersion || null,
        },
        engine: {
          name: parsed.engineName || null,
          version: parsed.engineVersion || null,
        },
        os: {
          name: parsed.osName || null,
          version: parsed.osVersion || null,
        },
        device: {
          type: parsed.deviceKind,
          architecture: parsed.architecture || null,
        },
        isBot: parsed.isBot,
        botName: parsed.botName || null,
      },
      null,
      2
    );
  }, [parsed]);

  const snippets: Record<CodeLang, { label: string; code: string }> = {
    js: { label: tUI('exJsLabel'), code: tUI('exJsVal') },
    python: { label: tUI('exPythonLabel'), code: tUI('exPythonVal') },
    java: { label: tUI('exJavaLabel'), code: tUI('exJavaVal') },
    php: { label: tUI('exPhpLabel'), code: tUI('exPhpVal') },
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDetectMyUa = () => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      setUaString(navigator.userAgent);
    }
  };

  const deviceLabelText = parsed
    ? parsed.deviceKind === 'bot'
      ? tUI('botDevice')
      : parsed.deviceKind === 'tablet'
        ? tUI('tablet')
        : parsed.deviceKind === 'mobile'
          ? tUI('mobileTablet')
          : tUI('desktop')
    : tUI('unknownVal');

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <GlobalContainer maxWidth="2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <MonitorSmartphone size={24} />
          </div>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />
        </div>

        {/* Input & Presets Card */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label htmlFor="ua-input" className="text-sm font-semibold text-[var(--text-primary)]">
              {tUI('inputLabel')}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetectMyUa}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 cursor-pointer transition-colors"
              >
                {tUI('presetMyUa')}
              </button>
              <button
                type="button"
                onClick={() => setUaString(SAMPLE_IPHONE)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetIphone')}
              </button>
              <button
                type="button"
                onClick={() => setUaString(SAMPLE_ANDROID)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetAndroid')}
              </button>
              <button
                type="button"
                onClick={() => setUaString(SAMPLE_GOOGLEBOT)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetBot')}
              </button>
              <button
                type="button"
                onClick={() => setUaString(SAMPLE_CURL)}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              >
                {tUI('presetCurl')}
              </button>
              <button
                type="button"
                onClick={() => setUaString('')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 cursor-pointer transition-colors"
              >
                <Trash2 size={12} />
                {tUI('clearBtn')}
              </button>
            </div>
          </div>

          <textarea
            id="ua-input"
            rows={3}
            value={uaString}
            onChange={(e) => setUaString(e.target.value)}
            placeholder={tUI('inputPlaceholder')}
            className="w-full p-3.5 rounded-xl border font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />

          <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => handleCopy('raw', uaString)}
              disabled={!uaString.trim()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 cursor-pointer"
            >
              {copiedKey === 'raw' ? (
                <Check size={13} className="text-emerald-500" />
              ) : (
                <Copy size={13} />
              )}
              {copiedKey === 'raw' ? tUI('copied') : tUI('copyRawBtn')}
            </button>
            <button
              type="button"
              onClick={() => handleCopy('json', jsonExport)}
              disabled={!parsed}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 cursor-pointer"
            >
              {copiedKey === 'json' ? <Check size={13} /> : <Braces size={13} />}
              {copiedKey === 'json' ? tUI('copiedJsonBtn') : tUI('copyJsonBtn')}
            </button>
          </div>
        </div>

        {/* Structured Detection Cards */}
        {parsed && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Browser */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <Globe size={15} className="text-blue-400" />
                  <span>{tUI('browserLabel')}</span>
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] truncate">
                  {parsed.browserName || tUI('unknownVal')}
                </div>
                <div className="text-xs font-mono text-emerald-400 mt-1">
                  {parsed.browserVersion ? `${tUI('versionLabel')}: ${parsed.browserVersion}` : '—'}
                </div>
              </div>

              {/* Rendering Engine */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <Layers size={15} className="text-purple-400" />
                  <span>{tUI('engineLabel')}</span>
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] truncate">
                  {parsed.engineName || tUI('unknownVal')}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  {parsed.engineVersion ? `${tUI('versionLabel')}: ${parsed.engineVersion}` : '—'}
                </div>
              </div>

              {/* OS */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <MonitorSmartphone size={15} className="text-cyan-400" />
                  <span>{tUI('osLabel')}</span>
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] truncate">
                  {parsed.osName || tUI('unknownVal')}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  {parsed.osVersion ? `${tUI('versionLabel')}: ${parsed.osVersion}` : '—'}
                </div>
              </div>

              {/* Device & CPU Architecture */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  <Cpu size={15} className="text-amber-400" />
                  <span>{tUI('deviceLabel')}</span>
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] truncate">
                  {deviceLabelText}
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)] mt-1">
                  {parsed.architecture ? `${tUI('archLabel')}: ${parsed.architecture}` : '—'}
                </div>
              </div>

              {/* Client Type / Bot Status */}
              <div
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-2">
                  {parsed.isBot ? (
                    <Bot size={15} className="text-amber-400" />
                  ) : (
                    <UserCheck size={15} className="text-emerald-400" />
                  )}
                  <span>{tUI('botStatusLabel')}</span>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                    parsed.isBot
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {parsed.isBot ? tUI('botCrawlerBadge') : tUI('humanBrowserBadge')}
                </span>
              </div>
            </div>

            {/* Extracted Header Tokens */}
            {parsed.tokens.length > 0 && (
              <div
                className="rounded-xl border p-5 mb-6"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  {tUI('tokensTitle', { count: parsed.tokens.length })}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {parsed.tokens.map((tok, i) => (
                    <span
                      key={`${i}-${tok}`}
                      className="px-2.5 py-1 rounded-lg border font-mono text-xs text-[var(--text-primary)]"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Developer Code Snippets Card */}
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
          toolSlug="user-agent"
          toolName={tTools('user-agent.name')}
          description={tTools('user-agent.description')}
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
