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
  ShieldCheck,
  Wand2,
  ListFilter,
  AlertTriangle,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type TabMode = 'parser' | 'generator' | 'bulk';
type CodeLang = 'js' | 'python' | 'java' | 'php';

interface ClientHintsInfo {
  brands: string[];
  mobile: boolean;
  platform: string;
}

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
  botCategory: 'none' | 'ai' | 'search' | 'cli' | 'headless';
  botName: string;
  rfcValid: boolean;
  tokens: string[];
}

const SAMPLE_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1';
const SAMPLE_ANDROID =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.89 Mobile Safari/537.36';
const SAMPLE_GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const SAMPLE_GPTBOT =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot';
const SAMPLE_CURL = 'curl/8.7.1';

const BOT_PATTERNS: Array<{
  regex: RegExp;
  name: string;
  cat: ParsedUserAgent['botCategory'];
}> = [
  // AI Crawlers & SearchBots
  { regex: /OAI-SearchBot\/?([\d.]*)/i, name: 'OAI-SearchBot (OpenAI)', cat: 'ai' },
  { regex: /ChatGPT-User\/?([\d.]*)/i, name: 'ChatGPT-User (OpenAI)', cat: 'ai' },
  { regex: /GPTBot\/?([\d.]*)/i, name: 'GPTBot (OpenAI)', cat: 'ai' },
  { regex: /ClaudeBot\/?([\d.]*)/i, name: 'ClaudeBot (Anthropic)', cat: 'ai' },
  { regex: /anthropic-ai/i, name: 'Anthropic AI', cat: 'ai' },
  { regex: /PerplexityBot\/?([\d.]*)/i, name: 'PerplexityBot', cat: 'ai' },
  { regex: /Google-Extended/i, name: 'Google-Extended (Gemini)', cat: 'ai' },
  { regex: /Meta-ExternalAgent/i, name: 'Meta-ExternalAgent', cat: 'ai' },
  { regex: /Bytespider/i, name: 'Bytespider (ByteDance)', cat: 'ai' },
  { regex: /CCBot\/?([\d.]*)/i, name: 'CCBot (Common Crawl)', cat: 'ai' },
  { regex: /Amazonbot\/?([\d.]*)/i, name: 'Amazonbot', cat: 'ai' },
  // Headless / Automation
  { regex: /HeadlessChrome\/?([\d.]*)/i, name: 'Headless Chrome', cat: 'headless' },
  { regex: /Playwright\/?([\d.]*)/i, name: 'Playwright', cat: 'headless' },
  { regex: /Puppeteer/i, name: 'Puppeteer', cat: 'headless' },
  { regex: /Selenium/i, name: 'Selenium WebDriver', cat: 'headless' },
  // Search & Social Bots
  { regex: /Googlebot\/?([\d.]*)/i, name: 'Googlebot', cat: 'search' },
  { regex: /bingbot\/?([\d.]*)/i, name: 'Bingbot', cat: 'search' },
  { regex: /DuckDuckBot\/?([\d.]*)/i, name: 'DuckDuckBot', cat: 'search' },
  { regex: /Applebot\/?([\d.]*)/i, name: 'Applebot', cat: 'search' },
  { regex: /facebookexternalhit\/?([\d.]*)/i, name: 'Facebook Crawler', cat: 'search' },
  { regex: /Twitterbot\/?([\d.]*)/i, name: 'Twitterbot', cat: 'search' },
  { regex: /LinkedInBot\/?([\d.]*)/i, name: 'LinkedInBot', cat: 'search' },
  // CLI / HTTP Libraries
  { regex: /curl\/([\d.]+)/i, name: 'cURL', cat: 'cli' },
  { regex: /Wget\/([\d.]+)/i, name: 'Wget', cat: 'cli' },
  { regex: /python-requests\/([\d.]+)/i, name: 'Python Requests', cat: 'cli' },
  { regex: /PostmanRuntime\/([\d.]+)/i, name: 'Postman', cat: 'cli' },
  { regex: /Go-http-client\/([\d.]+)/i, name: 'Go HTTP Client', cat: 'cli' },
  { regex: /okhttp\/([\d.]+)/i, name: 'OkHttp', cat: 'cli' },
  { regex: /axios\/([\d.]+)/i, name: 'Axios', cat: 'cli' },
  { regex: /(bot|crawler|spider|slurp|headless)/i, name: 'Automated Bot', cat: 'search' },
];

const UA_GENERATOR_TEMPLATES: Record<string, { label: string; ua: string }> = {
  win_chrome: {
    label: 'Windows 11 – Chrome 134 (Desktop)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  },
  win_edge: {
    label: 'Windows 11 – Edge 134 (Desktop)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
  },
  mac_safari: {
    label: 'macOS Sequoia – Safari 18.2',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  },
  mac_firefox: {
    label: 'macOS – Firefox 136',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
  },
  ios_safari: {
    label: 'iPhone (iOS 18.2) – Mobile Safari',
    ua: SAMPLE_IPHONE,
  },
  android_chrome: {
    label: 'Android 15 (Pixel 9 Pro) – Chrome 134',
    ua: SAMPLE_ANDROID,
  },
  linux_chrome: {
    label: 'Linux x86_64 – Chrome 134',
    ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
  },
  googlebot: {
    label: 'Googlebot Desktop Crawler',
    ua: SAMPLE_GOOGLEBOT,
  },
  gptbot: {
    label: 'GPTBot (OpenAI Crawler)',
    ua: SAMPLE_GPTBOT,
  },
};

function matchVer(ua: string, regex: RegExp): string {
  const m = ua.match(regex);
  return m && m[1] ? m[1].replace(/_/g, '.') : '';
}

function checkRfcCompliance(ua: string): boolean {
  if (!ua || ua.length < 3 || ua.length > 2048) return false;
  if (/[\r\n\0]/.test(ua)) return false;
  let depth = 0;
  for (const ch of ua) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return false;
  }
  return depth === 0 && /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+/.test(ua);
}

function parseUserAgent(uaRaw: string): ParsedUserAgent | null {
  const ua = uaRaw.trim();
  if (!ua) return null;

  // 1. Bot / Crawler / CLI detection
  let isBot = false;
  let botName = '';
  let botVersion = '';
  let botCategory: ParsedUserAgent['botCategory'] = 'none';
  for (const bp of BOT_PATTERNS) {
    const m = ua.match(bp.regex);
    if (m) {
      isBot = true;
      botName = bp.name;
      botVersion = m[1] || '';
      botCategory = bp.cat;
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
  } else if (ua.includes('YaBrowser/')) {
    browserName = 'Yandex Browser';
    browserVersion = matchVer(ua, /YaBrowser\/([\d.]+)/);
  } else if (ua.includes('DuckDuckGo/')) {
    browserName = 'DuckDuckGo Browser';
    browserVersion = matchVer(ua, /DuckDuckGo\/([\d.]+)/);
  } else if (ua.includes('Brave')) {
    browserName = 'Brave Browser';
    browserVersion = matchVer(ua, /Chrome\/([\d.]+)/);
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
  const rfcValid = checkRfcCompliance(ua);

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
    botCategory,
    botName,
    rfcValid,
    tokens,
  };
}

export default function UserAgentParserPage() {
  const tUI = useTranslations('ToolUI.userAgentParser');
  const tTools = useTranslations('Tools');

  const [activeTab, setActiveTab] = useState<TabMode>('parser');
  const [uaString, setUaString] = useState('');
  const [clientHints, setClientHints] = useState<ClientHintsInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<CodeLang>('js');

  // Generator Tab State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('win_chrome');

  // Bulk Tab State
  const [bulkInput, setBulkInput] = useState<string>(
    `${SAMPLE_ANDROID}\n${SAMPLE_GPTBOT}\n${SAMPLE_GOOGLEBOT}\n${SAMPLE_CURL}`
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      setUaString(navigator.userAgent);
      const navWithHints = navigator as Navigator & {
        userAgentData?: {
          brands?: Array<{ brand: string; version: string }>;
          mobile?: boolean;
          platform?: string;
        };
      };
      if (navWithHints.userAgentData) {
        setClientHints({
          brands: (navWithHints.userAgentData.brands || [])
            .filter((b) => !b.brand.includes('Not'))
            .map((b) => `${b.brand} v${b.version}`),
          mobile: Boolean(navWithHints.userAgentData.mobile),
          platform: navWithHints.userAgentData.platform || 'Unknown',
        });
      }
    }
  }, []);

  const parsed = useMemo(() => parseUserAgent(uaString), [uaString]);

  const bulkParsed = useMemo(() => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.map((line) => ({ raw: line, parsed: parseUserAgent(line) }));
  }, [bulkInput]);

  const bulkStats = useMemo(() => {
    const total = bulkParsed.length;
    const bots = bulkParsed.filter((b) => b.parsed?.isBot).length;
    return { total, bots, humans: total - bots };
  }, [bulkParsed]);

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
        botCategory: parsed.botCategory,
        botName: parsed.botName || null,
        rfc7231Compliant: parsed.rfcValid,
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

  const generatedUa = UA_GENERATOR_TEMPLATES[selectedTemplate]?.ua || SAMPLE_ANDROID;

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'AI User-Agent Parser, Bot Detector & Generator - VelnoxLabs',
        url: 'https://velnoxlabs.com/tools/user-agent',
        description:
          'Free AI User-Agent parser, generator, and bot identifier online. Decode browser, engine, OS, CPU architecture, Client Hints, and AI crawlers (GPTBot, ClaudeBot, Googlebot) with JS, Python, Java & PHP snippets.',
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
            name: 'What is a User-Agent parser and identifier?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A User-Agent parser reads the HTTP User-Agent header string sent by browsers, mobile apps, or bots and extracts structured fields like browser family, version, rendering engine, operating system, and device type.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can User-Agent strings identify bots and AI crawlers like GPTBot?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Legitimate crawlers like Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and CLI clients like curl identify themselves in the User-Agent token.',
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* 3-Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          {[
            { id: 'parser' as TabMode, label: tUI('tabParser'), icon: MonitorSmartphone },
            { id: 'generator' as TabMode, label: tUI('tabGenerator'), icon: Wand2 },
            { id: 'bulk' as TabMode, label: tUI('tabBulk'), icon: ListFilter },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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

        {/* TAB 1: SINGLE UA PARSER */}
        {activeTab === 'parser' && (
          <div className="space-y-6">
            {/* Input & Presets Card */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="ua-input" className="text-sm font-semibold text-[var(--text-main)]">
                  {tUI('inputLabel')}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDetectMyUa}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer"
                  >
                    {tUI('presetMyUa')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString(SAMPLE_IPHONE)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetIphone')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString(SAMPLE_ANDROID)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetAndroid')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString(SAMPLE_GOOGLEBOT)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetBot')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString(SAMPLE_GPTBOT)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    GPTBot (AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString(SAMPLE_CURL)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {tUI('presetCurl')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUaString('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border-color)] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
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
                className="w-full p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] font-mono text-xs sm:text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                {parsed && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border ${
                        parsed.rfcValid
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {parsed.rfcValid ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {parsed.rfcValid ? tUI('rfcValidBadge') : tUI('rfcInvalidBadge')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleCopy('raw', uaString)}
                    disabled={!uaString.trim()}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] disabled:opacity-40 cursor-pointer"
                  >
                    {copiedKey === 'raw' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === 'raw' ? tUI('copied') : tUI('copyRawBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy('json', jsonExport)}
                    disabled={!parsed}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    {copiedKey === 'json' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Braces className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === 'json' ? tUI('copiedJsonBtn') : tUI('copyJsonBtn')}
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Detection Cards */}
            {parsed && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Browser */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>{tUI('browserLabel')}</span>
                    </div>
                    <div className="text-base font-bold text-[var(--text-main)] truncate">
                      {parsed.browserName || tUI('unknownVal')}
                    </div>
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {parsed.browserVersion
                        ? `${tUI('versionLabel')}: ${parsed.browserVersion}`
                        : '—'}
                    </div>
                  </div>

                  {/* Rendering Engine */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-2">
                      <Layers className="w-4 h-4 text-purple-500" />
                      <span>{tUI('engineLabel')}</span>
                    </div>
                    <div className="text-base font-bold text-[var(--text-main)] truncate">
                      {parsed.engineName || tUI('unknownVal')}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                      {parsed.engineVersion
                        ? `${tUI('versionLabel')}: ${parsed.engineVersion}`
                        : '—'}
                    </div>
                  </div>

                  {/* OS */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-2">
                      <MonitorSmartphone className="w-4 h-4 text-cyan-500" />
                      <span>{tUI('osLabel')}</span>
                    </div>
                    <div className="text-base font-bold text-[var(--text-main)] truncate">
                      {parsed.osName || tUI('unknownVal')}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                      {parsed.osVersion ? `${tUI('versionLabel')}: ${parsed.osVersion}` : '—'}
                    </div>
                  </div>

                  {/* Device & Architecture */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-2">
                      <Cpu className="w-4 h-4 text-amber-500" />
                      <span>{tUI('deviceLabel')}</span>
                    </div>
                    <div className="text-base font-bold text-[var(--text-main)] truncate">
                      {deviceLabelText}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                      {parsed.architecture ? `${tUI('archLabel')}: ${parsed.architecture}` : '—'}
                    </div>
                  </div>

                  {/* Client Type / Bot Status */}
                  <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] mb-2">
                      {parsed.isBot ? (
                        <Bot className="w-4 h-4 text-amber-500" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                      )}
                      <span>{tUI('botStatusLabel')}</span>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        parsed.botCategory === 'ai'
                          ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
                          : parsed.isBot
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      }`}
                    >
                      {parsed.botCategory === 'ai'
                        ? tUI('aiBotBadge')
                        : parsed.isBot
                          ? tUI('botCrawlerBadge')
                          : tUI('humanBrowserBadge')}
                    </span>
                  </div>
                </div>

                {/* Live Browser Client Hints API Card (If available) */}
                {clientHints && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {tUI('clientHintsTitle')}:
                      </span>{' '}
                      <span className="text-[var(--text-main)] font-mono">
                        Platform: {clientHints.platform} • Mobile:{' '}
                        {clientHints.mobile ? 'Yes' : 'No'} • Brands:{' '}
                        {clientHints.brands.join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Extracted Header Tokens */}
                {parsed.tokens.length > 0 && (
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                    <h2 className="text-sm font-semibold text-[var(--text-main)] mb-3">
                      {tUI('tokensTitle', { count: parsed.tokens.length })}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {parsed.tokens.map((tok, i) => (
                        <span
                          key={`${i}-${tok}`}
                          className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] font-mono text-xs text-[var(--text-main)]"
                        >
                          {tok}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: USER-AGENT GENERATOR */}
        {activeTab === 'generator' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">{tUI('genTitle')}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('genSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(UA_GENERATOR_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedTemplate === key
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-600'
                      : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-main)] hover:border-blue-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border-color)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Generated User-Agent String
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('gen-ua', generatedUa)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    {copiedKey === 'gen-ua' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === 'gen-ua' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <p className="font-mono text-xs text-[var(--text-main)] break-all">{generatedUa}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">cURL Command</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy('gen-curl', `curl -A "${generatedUa}" https://example.com`)
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === 'gen-curl' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedKey === 'gen-curl' ? tUI('copied') : tUI('copy')}
                  </button>
                </div>
                <pre className="font-mono text-xs text-emerald-400 overflow-x-auto">
                  <code>{`curl -A "${generatedUa}" https://example.com`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BULK UA LOG ANALYZER */}
        {activeTab === 'bulk' && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text-main)]">{tUI('bulkTitle')}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">{tUI('bulkSubtitle')}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-page)] border border-[var(--border-color)]">
                  Total: {bulkStats.total}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Humans: {bulkStats.humans}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Bots/AI: {bulkStats.bots}
                </span>
              </div>
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
                      <th className="py-2 px-3 font-semibold">{tUI('browserLabel')}</th>
                      <th className="py-2 px-3 font-semibold">{tUI('osLabel')}</th>
                      <th className="py-2 px-3 font-semibold">{tUI('deviceLabel')}</th>
                      <th className="py-2 px-3 font-semibold">{tUI('botStatusLabel')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                    {bulkParsed.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-[var(--text-muted)]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold">
                          {row.parsed?.browserName || 'Unknown'} {row.parsed?.browserVersion || ''}
                        </td>
                        <td className="py-2 px-3">
                          {row.parsed?.osName || '—'} {row.parsed?.osVersion || ''}
                        </td>
                        <td className="py-2 px-3 capitalize">{row.parsed?.deviceKind || '—'}</td>
                        <td className="py-2 px-3 font-semibold">
                          {row.parsed?.isBot
                            ? row.parsed.botCategory === 'ai'
                              ? tUI('aiBotBadge')
                              : tUI('botCrawlerBadge')
                            : tUI('humanBrowserBadge')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Developer Code Snippets Card */}
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
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColWimb')}</th>
                  <th className="py-2.5 px-3 font-semibold">{tUI('compColUas')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-main)]">
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow1Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow1Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1Wimb')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow1Uas')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow2Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow2Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2Wimb')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow2Uas')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow3Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow3Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3Wimb')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow3Uas')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium">{tUI('compRow4Feature')}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {tUI('compRow4Velnox')}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow4Wimb')}</td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)]">{tUI('compRow4Uas')}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
      </div>
    </GlobalContainer>
  );
}
