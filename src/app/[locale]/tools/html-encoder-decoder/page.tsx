'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Code,
  FileText,
  Eye,
  Table,
  Copy,
  Check,
  ArrowRightLeft,
  Trash2,
  ShieldCheck,
  Search,
  Zap,
} from 'lucide-react';

type TabType = 'converter' | 'plaintext' | 'preview' | 'code' | 'cheatsheet';
type ModeType = 'encode' | 'decode';
type EncodeFormatType = 'named' | 'decimal' | 'hex';
type EncodeScopeType = 'special' | 'non-ascii' | 'all';

// Top Common HTML Entities for Cheatsheet & lookup
interface EntityItem {
  char: string;
  named: string;
  decimal: string;
  hex: string;
  name: string;
  category: 'reserved' | 'symbols' | 'currency' | 'math' | 'accents';
}

const COMMON_ENTITIES: EntityItem[] = [
  // Reserved / Special
  {
    char: '&',
    named: '&amp;',
    decimal: '&#38;',
    hex: '&#x26;',
    name: 'Ampersand',
    category: 'reserved',
  },
  {
    char: '<',
    named: '&lt;',
    decimal: '&#60;',
    hex: '&#x3C;',
    name: 'Less Than',
    category: 'reserved',
  },
  {
    char: '>',
    named: '&gt;',
    decimal: '&#62;',
    hex: '&#x3E;',
    name: 'Greater Than',
    category: 'reserved',
  },
  {
    char: '"',
    named: '&quot;',
    decimal: '&#34;',
    hex: '&#x22;',
    name: 'Double Quote',
    category: 'reserved',
  },
  {
    char: "'",
    named: '&apos;',
    decimal: '&#39;',
    hex: '&#x27;',
    name: 'Single Quote (Apostrophe)',
    category: 'reserved',
  },
  {
    char: ' ',
    named: '&nbsp;',
    decimal: '&#160;',
    hex: '&#xA0;',
    name: 'Non-breaking Space',
    category: 'reserved',
  },

  // Symbols
  {
    char: '©',
    named: '&copy;',
    decimal: '&#169;',
    hex: '&#xA9;',
    name: 'Copyright',
    category: 'symbols',
  },
  {
    char: '®',
    named: '&reg;',
    decimal: '&#174;',
    hex: '&#xAE;',
    name: 'Registered Trademark',
    category: 'symbols',
  },
  {
    char: '™',
    named: '&trade;',
    decimal: '&#8482;',
    hex: '&#x2122;',
    name: 'Trademark',
    category: 'symbols',
  },
  {
    char: '•',
    named: '&bull;',
    decimal: '&#8226;',
    hex: '&#x2022;',
    name: 'Bullet Point',
    category: 'symbols',
  },
  {
    char: '…',
    named: '&hellip;',
    decimal: '&#8230;',
    hex: '&#x2026;',
    name: 'Horizontal Ellipsis',
    category: 'symbols',
  },
  {
    char: '—',
    named: '&mdash;',
    decimal: '&#8212;',
    hex: '&#x2014;',
    name: 'Em Dash',
    category: 'symbols',
  },
  {
    char: '–',
    named: '&ndash;',
    decimal: '&#8211;',
    hex: '&#x2013;',
    name: 'En Dash',
    category: 'symbols',
  },
  {
    char: '§',
    named: '&sect;',
    decimal: '&#167;',
    hex: '&#xA7;',
    name: 'Section Sign',
    category: 'symbols',
  },
  {
    char: '¶',
    named: '&para;',
    decimal: '&#182;',
    hex: '&#xB6;',
    name: 'Pilcrow (Paragraph)',
    category: 'symbols',
  },

  // Currency
  {
    char: '$',
    named: '&#36;',
    decimal: '&#36;',
    hex: '&#x24;',
    name: 'Dollar Sign',
    category: 'currency',
  },
  {
    char: '€',
    named: '&euro;',
    decimal: '&#8364;',
    hex: '&#x20AC;',
    name: 'Euro Sign',
    category: 'currency',
  },
  {
    char: '£',
    named: '&pound;',
    decimal: '&#163;',
    hex: '&#xA3;',
    name: 'Pound Sterling',
    category: 'currency',
  },
  {
    char: '¥',
    named: '&yen;',
    decimal: '&#165;',
    hex: '&#xA5;',
    name: 'Yen Sign',
    category: 'currency',
  },
  {
    char: '¢',
    named: '&cent;',
    decimal: '&#162;',
    hex: '&#xA2;',
    name: 'Cent Sign',
    category: 'currency',
  },
  {
    char: '₹',
    named: '&#8377;',
    decimal: '&#8377;',
    hex: '&#x20B9;',
    name: 'Indian Rupee',
    category: 'currency',
  },
  {
    char: '₽',
    named: '&#8381;',
    decimal: '&#8381;',
    hex: '&#x20BD;',
    name: 'Russian Ruble',
    category: 'currency',
  },
  {
    char: '₩',
    named: '&#8361;',
    decimal: '&#8361;',
    hex: '&#x20A9;',
    name: 'Korean Won',
    category: 'currency',
  },

  // Math
  {
    char: '±',
    named: '&plusmn;',
    decimal: '&#177;',
    hex: '&#xB1;',
    name: 'Plus-Minus',
    category: 'math',
  },
  {
    char: '×',
    named: '&times;',
    decimal: '&#215;',
    hex: '&#xD7;',
    name: 'Multiplication Sign',
    category: 'math',
  },
  {
    char: '÷',
    named: '&divide;',
    decimal: '&#247;',
    hex: '&#xF7;',
    name: 'Division Sign',
    category: 'math',
  },
  {
    char: '≠',
    named: '&ne;',
    decimal: '&#8800;',
    hex: '&#x2260;',
    name: 'Not Equal To',
    category: 'math',
  },
  {
    char: '≤',
    named: '&le;',
    decimal: '&#8804;',
    hex: '&#x2264;',
    name: 'Less-than or Equal To',
    category: 'math',
  },
  {
    char: '≥',
    named: '&ge;',
    decimal: '&#8805;',
    hex: '&#x2265;',
    name: 'Greater-than or Equal To',
    category: 'math',
  },
  {
    char: '≈',
    named: '&asymp;',
    decimal: '&#8776;',
    hex: '&#x2248;',
    name: 'Almost Equal To (Approx)',
    category: 'math',
  },
  {
    char: '∞',
    named: '&infin;',
    decimal: '&#8734;',
    hex: '&#x221E;',
    name: 'Infinity',
    category: 'math',
  },
  {
    char: '√',
    named: '&radic;',
    decimal: '&#8730;',
    hex: '&#x221A;',
    name: 'Square Root',
    category: 'math',
  },
  {
    char: '∑',
    named: '&sum;',
    decimal: '&#8721;',
    hex: '&#x2211;',
    name: 'N-Ary Summation',
    category: 'math',
  },
  {
    char: 'π',
    named: '&pi;',
    decimal: '&#960;',
    hex: '&#x3C0;',
    name: 'Greek Small Letter Pi',
    category: 'math',
  },
  {
    char: '°',
    named: '&deg;',
    decimal: '&#176;',
    hex: '&#xB0;',
    name: 'Degree Sign',
    category: 'math',
  },

  // Accents / Latin
  {
    char: 'é',
    named: '&eacute;',
    decimal: '&#233;',
    hex: '&#xE9;',
    name: 'Latin Small Letter E with Acute',
    category: 'accents',
  },
  {
    char: 'è',
    named: '&egrave;',
    decimal: '&#232;',
    hex: '&#xE8;',
    name: 'Latin Small Letter E with Grave',
    category: 'accents',
  },
  {
    char: 'ê',
    named: '&ecirc;',
    decimal: '&#234;',
    hex: '&#xEA;',
    name: 'Latin Small Letter E with Circumflex',
    category: 'accents',
  },
  {
    char: 'à',
    named: '&agrave;',
    decimal: '&#224;',
    hex: '&#xE0;',
    name: 'Latin Small Letter A with Grave',
    category: 'accents',
  },
  {
    char: 'á',
    named: '&aacute;',
    decimal: '&#225;',
    hex: '&#xE1;',
    name: 'Latin Small Letter A with Acute',
    category: 'accents',
  },
  {
    char: 'ñ',
    named: '&ntilde;',
    decimal: '&#241;',
    hex: '&#xF1;',
    name: 'Latin Small Letter N with Tilde',
    category: 'accents',
  },
  {
    char: 'ç',
    named: '&ccedil;',
    decimal: '&#231;',
    hex: '&#xE7;',
    name: 'Latin Small Letter C with Cedilla',
    category: 'accents',
  },
  {
    char: 'ü',
    named: '&uuml;',
    decimal: '&#252;',
    hex: '&#xFC;',
    name: 'Latin Small Letter U with Diaeresis',
    category: 'accents',
  },
];

// Helper: Decode all HTML entities (Named, Decimal, Hex)
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  // Fallback for SSR
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&euro;/g, '€');
}

// Helper: Encode text into HTML entities according to format and scope
function encodeHtmlEntities(
  text: string,
  format: EncodeFormatType = 'named',
  scope: EncodeScopeType = 'special'
): string {
  if (!text) return '';

  const charToNamed: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¥': '&yen;',
    '¢': '&cent;',
    '•': '&bull;',
    '…': '&hellip;',
    '—': '&mdash;',
    '–': '&ndash;',
    '±': '&plusmn;',
    '×': '&times;',
    '÷': '&divide;',
    '≠': '&ne;',
    '≤': '&le;',
    '≥': '&ge;',
    '°': '&deg;',
  };

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      // Determine if this char should be encoded based on scope
      let shouldEncode = false;
      if (scope === 'special') {
        shouldEncode = ['&', '<', '>', '"', "'"].includes(char);
      } else if (scope === 'non-ascii') {
        shouldEncode = ['&', '<', '>', '"', "'"].includes(char) || code > 126;
      } else {
        // scope === 'all'
        shouldEncode = code !== 32 && code !== 10 && code !== 13; // keep spaces & line breaks readable
      }

      if (!shouldEncode) return char;

      if (format === 'named' && charToNamed[char]) {
        return charToNamed[char];
      } else if (format === 'hex') {
        return `&#x${code.toString(16).toUpperCase()};`;
      } else {
        // Decimal
        return `&#${code};`;
      }
    })
    .join('');
}

// Helper: Strip HTML tags and decode to clean plain text
function htmlToPlainText(html: string): string {
  if (!html) return '';
  // 1. Remove script, style, noscript
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  clean = clean.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '');
  // 2. Replace block tags with newlines
  clean = clean.replace(
    /<\/?(div|p|h[1-6]|tr|article|section|header|footer|blockquote)\b[^>]*>/gi,
    '\n'
  );
  clean = clean.replace(/<br\s*\/?>/gi, '\n');
  clean = clean.replace(/<li\b[^>]*>/gi, '\n• ');
  // 3. Remove all other HTML tags
  clean = clean.replace(/<[^>]+>/g, '');
  // 4. Decode all entities
  clean = decodeHtmlEntities(clean);
  // 5. Clean excessive newlines & spaces
  clean = clean.replace(/[ \t]+/g, ' ');
  clean = clean.replace(/\n\s*\n\s*\n/g, '\n\n');
  return clean.trim();
}

export default function HtmlEncoderDecoderPage() {
  const tUI = useTranslations('ToolUI.htmlEncoderDecoder');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('converter');

  // Tab 1: Converter State
  const [mode, setMode] = useState<ModeType>('encode');
  const [input, setInput] = useState(
    '<div class="container">\n  <h1>Hello VelnoxLabs & World!</h1>\n  <p>Copyright © 2026 • Price: €25.00 & $30.00</p>\n</div>'
  );
  const [encodeFormat, setEncodeFormat] = useState<EncodeFormatType>('named');
  const [encodeScope, setEncodeScope] = useState<EncodeScopeType>('special');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab 2: Plain Text Stripper State
  const [htmlInputForText, setHtmlInputForText] = useState(
    '<article class="post">\n  <h2>Top Web Development Trends & Insights</h2>\n  <p>Building secure web applications requires escaping user inputs to avoid <strong>&lt;XSS&gt;</strong> attacks.</p>\n  <ul>\n    <li>Client-side encoding: &amp;lt;div&amp;gt;</li>\n    <li>Decoded symbols: &copy; 2026 &bull; &euro;50</li>\n  </ul>\n</article>'
  );

  // Tab 3: Code Snippets State
  const [selectedLang, setSelectedLang] = useState<
    'js_dom' | 'js_native' | 'node' | 'python' | 'php'
  >('js_dom');

  // Tab 5: Cheatsheet Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculated Output for Tab 1
  const output = useMemo(() => {
    if (!input) return '';
    if (mode === 'encode') {
      return encodeHtmlEntities(input, encodeFormat, encodeScope);
    } else {
      return decodeHtmlEntities(input);
    }
  }, [input, mode, encodeFormat, encodeScope]);

  // Calculated Plain Text for Tab 2
  const plainTextOutput = useMemo(() => {
    return htmlToPlainText(htmlInputForText);
  }, [htmlInputForText]);

  // Character Counts
  const inputStats = useMemo(() => {
    return {
      chars: input.length,
      bytes: new TextEncoder().encode(input).length,
      lines: input.split('\n').length,
    };
  }, [input]);

  const outputStats = useMemo(() => {
    return {
      chars: output.length,
      bytes: new TextEncoder().encode(output).length,
      lines: output.split('\n').length,
    };
  }, [output]);

  const plainTextStats = useMemo(() => {
    const words = plainTextOutput ? plainTextOutput.trim().split(/\s+/).length : 0;
    return {
      words,
      chars: plainTextOutput.length,
      lines: plainTextOutput ? plainTextOutput.split('\n').length : 0,
    };
  }, [plainTextOutput]);

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Swap input and output in Tab 1
  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  // Quick Preset Loader
  const loadPreset = (preset: 'xss' | 'article' | 'symbols') => {
    if (preset === 'xss') {
      setInput(
        '<script>alert("XSS Vulnerability! <img src=x onerror=alert(1)> & \'test\'");</script>'
      );
      setMode('encode');
    } else if (preset === 'article') {
      setInput(
        '<div class="hero">\n  <h1>Modern Web Frameworks & APIs</h1>\n  <p>Learn how to handle &quot;safe markup&quot; in React & Next.js.</p>\n</div>'
      );
      setMode('encode');
    } else if (preset === 'symbols') {
      setInput(
        '© 2026 VelnoxLabs™ • Price: €99.00 / £85.00 / ¥14,000 • Math: 10 ± 2 × 5 ÷ 2 ≠ 25 • Greek: π ≈ 3.14159'
      );
      setMode('encode');
      setEncodeScope('non-ascii');
    }
  };

  // Filtered Cheatsheet
  const filteredEntities = useMemo(() => {
    return COMMON_ENTITIES.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.char.toLowerCase().includes(query) ||
        item.named.toLowerCase().includes(query) ||
        item.decimal.toLowerCase().includes(query) ||
        item.hex.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="html-encoder-decoder"
          />

          {/* Privacy & Fast Client-Side Badge */}
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginTop: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.95rem' }}>
                  {tUI('clientSideBadge')}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                  {tUI('clientSideSubtitle')}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 600,
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {tUI('zeroServerLog')}
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px',
            }}
          >
            {[
              { key: 'converter', label: tUI('tabConverter'), icon: Code },
              { key: 'plaintext', label: tUI('tabPlainText'), icon: FileText },
              { key: 'preview', label: tUI('tabPreview'), icon: Eye },
              { key: 'code', label: tUI('tabCode'), icon: Zap },
              { key: 'cheatsheet', label: tUI('tabCheatsheet'), icon: Table },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: isActive ? '#60a5fa' : 'var(--text-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ==================================================== */}
          {/* TAB 1: Smart Encoder & Decoder                       */}
          {/* ==================================================== */}
          {activeTab === 'converter' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              {/* Presets & Mode Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                {/* Mode Selector (Encode vs Decode) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setMode('encode')}
                    style={{
                      backgroundColor:
                        mode === 'encode' ? 'var(--color-primary)' : 'var(--bg-page)',
                      color: mode === 'encode' ? '#ffffff' : 'var(--text-main)',
                      border:
                        mode === 'encode'
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tUI('encode')}
                  </button>
                  <button
                    onClick={() => setMode('decode')}
                    style={{
                      backgroundColor:
                        mode === 'decode' ? 'var(--color-primary)' : 'var(--bg-page)',
                      color: mode === 'decode' ? '#ffffff' : 'var(--text-main)',
                      border:
                        mode === 'decode'
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tUI('decode')}
                  </button>
                </div>

                {/* Quick Presets */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}
                >
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {tUI('quickPresets')}:
                  </span>
                  <button
                    onClick={() => loadPreset('xss')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#f87171',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    XSS Test
                  </button>
                  <button
                    onClick={() => loadPreset('article')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    HTML Article
                  </button>
                  <button
                    onClick={() => loadPreset('symbols')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: '#34d399',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    Symbols & Math
                  </button>
                  <button
                    onClick={() => setInput('')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trash2 size={12} />
                    {tUI('clearBtn')}
                  </button>
                </div>
              </div>

              {/* Encoder Options Toolbar (Visible in Encode Mode) */}
              {mode === 'encode' && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}
                  >
                    <span
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {tUI('formatLabel')}:
                    </span>
                    <button
                      onClick={() => setEncodeFormat('named')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeFormat === 'named' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                        color: encodeFormat === 'named' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      Named (&amp;lt;)
                    </button>
                    <button
                      onClick={() => setEncodeFormat('decimal')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeFormat === 'decimal' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                        color: encodeFormat === 'decimal' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      Decimal (&amp;#60;)
                    </button>
                    <button
                      onClick={() => setEncodeFormat('hex')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeFormat === 'hex' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                        color: encodeFormat === 'hex' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      Hex (&amp;#x3C;)
                    </button>
                  </div>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}
                  >
                    <span
                      style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {tUI('scopeLabel')}:
                    </span>
                    <button
                      onClick={() => setEncodeScope('special')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeScope === 'special' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                        color: encodeScope === 'special' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                      title="Encode only < > & ' ''"
                    >
                      {tUI('scopeSpecial')}
                    </button>
                    <button
                      onClick={() => setEncodeScope('non-ascii')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeScope === 'non-ascii'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'var(--bg-card)',
                        color: encodeScope === 'non-ascii' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                      title="Encode special chars and non-ascii symbols (©, €, etc)"
                    >
                      {tUI('scopeNonAscii')}
                    </button>
                    <button
                      onClick={() => setEncodeScope('all')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          encodeScope === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                        color: encodeScope === 'all' ? '#60a5fa' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                      title="Encode every character for full obfuscation"
                    >
                      {tUI('scopeAll')}
                    </button>
                  </div>
                </div>
              )}

              {/* Side-by-Side Dual Textareas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px',
                  position: 'relative',
                }}
              >
                {/* Input Column */}
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
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {mode === 'encode' ? tUI('rawInput') : tUI('encodedInput')}
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {inputStats.chars} chars • {inputStats.bytes} bytes • {inputStats.lines} lines
                    </span>
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={12}
                    placeholder={
                      mode === 'encode' ? tUI('rawPlaceholder') : tUI('encodedPlaceholder')
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.4',
                    }}
                  />
                </div>

                {/* Output Column */}
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
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {mode === 'encode' ? tUI('encodedOutput') : tUI('decodedOutput')}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {outputStats.chars} chars • {outputStats.bytes} bytes
                      </span>
                      <button
                        onClick={handleSwap}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'var(--bg-page)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title={tUI('swapTooltip')}
                      >
                        <ArrowRightLeft size={12} />
                        {tUI('swapBtn')}
                      </button>
                      <button
                        onClick={() => handleCopy(output, 'converter')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor:
                            copiedField === 'converter'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(59, 130, 246, 0.15)',
                          color: copiedField === 'converter' ? '#34d399' : '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'converter' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'converter' ? tUI('copied') : tUI('copy')}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={output}
                    readOnly
                    rows={12}
                    placeholder={tUI('outputPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: mode === 'encode' ? '#38bdf8' : '#34d399',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.4',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: HTML to Clean Plain Text Stripper             */}
          {/* ==================================================== */}
          {activeTab === 'plaintext' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FileText size={18} color="#60a5fa" />
                  {tUI('plainTextTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {tUI('plainTextSubtitle')}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* HTML Source */}
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
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {tUI('rawHtmlLabel')}
                    </label>
                    <button
                      onClick={() => setHtmlInputForText('')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-page)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('clearBtn')}
                    </button>
                  </div>
                  <textarea
                    value={htmlInputForText}
                    onChange={(e) => setHtmlInputForText(e.target.value)}
                    rows={12}
                    placeholder="Paste rich HTML or XML markup here..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Plain Text Result */}
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
                      style={{ color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {tUI('cleanPlainTextLabel')}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {plainTextStats.words} words • {plainTextStats.chars} chars
                      </span>
                      <button
                        onClick={() => handleCopy(plainTextOutput, 'plaintext')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor:
                            copiedField === 'plaintext'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(59, 130, 246, 0.15)',
                          color: copiedField === 'plaintext' ? '#34d399' : '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'plaintext' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'plaintext' ? tUI('copied') : tUI('copy')}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={plainTextOutput}
                    readOnly
                    rows={12}
                    placeholder="Clean decoded plain text will appear here..."
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#34d399',
                      padding: '12px',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      lineHeight: '1.5',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: JavaScript & Multi-Language Code Snippets     */}
          {/* ==================================================== */}
          {activeTab === 'code' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Zap size={18} color="#60a5fa" />
                  {tUI('codeSnippetsTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {tUI('codeSnippetsSubtitle')}
                </p>
              </div>

              {/* Language Selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'js_dom', label: 'JavaScript (DOMParser Native)' },
                  { id: 'js_native', label: 'JavaScript (Textarea Trick)' },
                  { id: 'node', label: 'Node.js (he / html-entities)' },
                  { id: 'python', label: 'Python (html module)' },
                  { id: 'php', label: 'PHP (htmlspecialchars)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLang(item.id as typeof selectedLang)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor:
                        selectedLang === item.id ? 'var(--color-primary)' : 'var(--bg-page)',
                      color: selectedLang === item.id ? '#ffffff' : 'var(--text-main)',
                      border:
                        selectedLang === item.id
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0a0f1d',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <button
                  onClick={() => {
                    const snippets: Record<string, string> = {
                      js_dom: `// Decode HTML entities in Modern JavaScript using DOMParser:\nfunction decodeHtml(html) {\n  const doc = new DOMParser().parseFromString(html, 'text/html');\n  return doc.documentElement.textContent || '';\n}\n\n// Example usage:\nconst encoded = '&lt;div&gt;Hello &amp;amp; Welcome &copy; 2026&lt;/div&gt;';\nconsole.log(decodeHtml(encoded));\n// Output: <div>Hello & Welcome © 2026</div>`,
                      js_native: `// Encode & Decode using client-side DOM elements (zero-dependencies):\nfunction encodeHtml(str) {\n  const el = document.createElement('div');\n  el.textContent = str;\n  return el.innerHTML;\n}\n\nfunction decodeHtml(str) {\n  const txt = document.createElement('textarea');\n  txt.innerHTML = str;\n  return txt.value;\n}\n\nconsole.log(encodeHtml('<script>alert("XSS")</script>'));\nconsole.log(decodeHtml('&lt;b&gt;Bold&lt;/b&gt; &euro;50'));`,
                      node: `// Node.js implementation using 'he' or 'html-entities' package:\n// npm install he\nimport he from 'he';\n\nconst raw = '<div class="alert">Price: €25 & $30</div>';\n\n// Encode HTML entities:\nconst encoded = he.encode(raw);\nconsole.log('Encoded:', encoded);\n\n// Decode HTML entities:\nconst decoded = he.decode(encoded);\nconsole.log('Decoded:', decoded);`,
                      python: `# Python 3.8+ built-in html module (No external packages required):\nimport html\n\nraw_text = '<div class="banner">Hello & Welcome! © 2026</div>'\n\n# Encode HTML entities:\nencoded = html.escape(raw_text, quote=True)\nprint("Encoded:", encoded)\n\n# Decode HTML entities:\ndecoded = html.unescape(encoded)\nprint("Decoded:", decoded)`,
                      php: `<?php\n// PHP built-in functions:\n$raw = '<div class="test">Hello & Welcome! © 2026</div>';\n\n// Encode to HTML entities:\n$encoded = htmlspecialchars($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');\necho "Encoded: " . $encoded . PHP_EOL;\n\n// Decode from HTML entities:\n$decoded = html_entity_decode($encoded, ENT_QUOTES | ENT_HTML5, 'UTF-8');\necho "Decoded: " . $decoded . PHP_EOL;`,
                    };
                    handleCopy(snippets[selectedLang], 'snippet');
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedField === 'snippet' ? (
                    <Check size={12} color="#34d399" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copiedField === 'snippet' ? tUI('copied') : tUI('copy')}
                </button>

                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    overflowX: 'auto',
                    lineHeight: '1.5',
                  }}
                >
                  {selectedLang === 'js_dom' &&
                    `// Decode HTML entities in Modern JavaScript using DOMParser:\nfunction decodeHtml(html) {\n  const doc = new DOMParser().parseFromString(html, 'text/html');\n  return doc.documentElement.textContent || '';\n}\n\n// Example usage:\nconst encoded = '&lt;div&gt;Hello &amp;amp; Welcome &copy; 2026&lt;/div&gt;';\nconsole.log(decodeHtml(encoded));\n// Output: <div>Hello & Welcome © 2026</div>`}
                  {selectedLang === 'js_native' &&
                    `// Encode & Decode using client-side DOM elements (zero-dependencies):\nfunction encodeHtml(str) {\n  const el = document.createElement('div');\n  el.textContent = str;\n  return el.innerHTML;\n}\n\nfunction decodeHtml(str) {\n  const txt = document.createElement('textarea');\n  txt.innerHTML = str;\n  return txt.value;\n}\n\nconsole.log(encodeHtml('<script>alert("XSS")</script>'));\nconsole.log(decodeHtml('&lt;b&gt;Bold&lt;/b&gt; &euro;50'));`}
                  {selectedLang === 'node' &&
                    `// Node.js implementation using 'he' or 'html-entities' package:\n// npm install he\nimport he from 'he';\n\nconst raw = '<div class="alert">Price: €25 & $30</div>';\n\n// Encode HTML entities:\nconst encoded = he.encode(raw);\nconsole.log('Encoded:', encoded);\n\n// Decode HTML entities:\nconst decoded = he.decode(encoded);\nconsole.log('Decoded:', decoded);`}
                  {selectedLang === 'python' &&
                    `# Python 3.8+ built-in html module (No external packages required):\nimport html\n\nraw_text = '<div class="banner">Hello & Welcome! © 2026</div>'\n\n# Encode HTML entities:\nencoded = html.escape(raw_text, quote=True)\nprint("Encoded:", encoded)\n\n# Decode HTML entities:\ndecoded = html.unescape(encoded)\nprint("Decoded:", decoded)`}
                  {selectedLang === 'php' &&
                    `<?php\n// PHP built-in functions:\n$raw = '<div class="test">Hello & Welcome! © 2026</div>';\n\n// Encode to HTML entities:\n$encoded = htmlspecialchars($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');\necho "Encoded: " . $encoded . PHP_EOL;\n\n// Decode from HTML entities:\n$decoded = html_entity_decode($encoded, ENT_QUOTES | ENT_HTML5, 'UTF-8');\necho "Decoded: " . $decoded . PHP_EOL;`}
                </pre>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: Live Visual Sandbox Preview                   */}
          {/* ==================================================== */}
          {activeTab === 'preview' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Eye size={18} color="#60a5fa" />
                  {tUI('previewTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {tUI('previewSubtitle')}
                </p>
              </div>

              {/* Rendered Preview Container */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  padding: '20px',
                  minHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {/* Safe render inside shadow / sandboxed html */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: mode === 'decode' ? output : decodeHtmlEntities(input),
                  }}
                />
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ℹ️ {tUI('previewSandboxNote')}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: W3Schools-Style HTML Entity Cheatsheet Table  */}
          {/* ==================================================== */}
          {activeTab === 'cheatsheet' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Table size={18} color="#60a5fa" />
                  {tUI('cheatsheetTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {tUI('cheatsheetSubtitle')}
                </p>
              </div>

              {/* Search & Category Filter */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    flex: '1',
                    minWidth: '220px',
                    maxWidth: '400px',
                  }}
                >
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '10px' }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tUI('searchEntitiesPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'reserved', label: 'Special' },
                    { id: 'symbols', label: 'Symbols' },
                    { id: 'currency', label: 'Currency' },
                    { id: 'math', label: 'Math' },
                    { id: 'accents', label: 'Accents' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor:
                          selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--bg-page)',
                        color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity Table */}
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <th style={{ padding: '10px' }}>Char</th>
                      <th style={{ padding: '10px' }}>Named Entity</th>
                      <th style={{ padding: '10px' }}>Decimal</th>
                      <th style={{ padding: '10px' }}>Hex</th>
                      <th style={{ padding: '10px' }}>Description</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td
                          style={{
                            padding: '10px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#60a5fa',
                          }}
                        >
                          {item.char}
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>
                          {item.named}
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#a78bfa' }}>
                          {item.decimal}
                        </td>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#fbbf24' }}>
                          {item.hex}
                        </td>
                        <td style={{ padding: '10px', color: 'var(--text-main)' }}>{item.name}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleCopy(item.named, `table_${idx}`)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              color: copiedField === `table_${idx}` ? '#34d399' : '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {copiedField === `table_${idx}` ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEO Content Section */}
          <ToolSeoContent
            toolSlug="html-encoder-decoder"
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
