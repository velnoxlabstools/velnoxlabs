'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  FileText,
  Hash,
  AlignLeft,
  Zap,
} from 'lucide-react';

type GeneratorUnit = 'paragraphs' | 'words' | 'characters' | 'sentences' | 'lists';
type OutputFormat = 'plain' | 'html' | 'markdown' | 'json';
type ThemeCategory =
  'latin' | 'tech' | 'ecommerce' | 'finance' | 'medical' | 'creative' | 'cyberpunk';

const LATIN_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'at',
  'vero',
  'eos',
  'accusamus',
  'iusto',
  'odio',
  'dignissimos',
  'ducimus',
  'blanditiis',
  'praesentium',
  'voluptatum',
  'deleniti',
  'atque',
  'corrupti',
  'quos',
  'dolores',
  'quas',
  'molestias',
  'excepturi',
  'obcaecati',
  'cupiditate',
  'provident',
  'similique',
  'mollitia',
  'fuga',
  'harum',
  'quidem',
  'rerum',
  'facilis',
  'expedita',
  'distinctio',
  'nam',
  'libero',
  'tempore',
  'cum',
  'soluta',
  'nobis',
  'eligendi',
  'optio',
  'cumque',
  'nihil',
  'impedit',
  'minus',
  'quod',
  'maxime',
  'placeat',
  'facere',
  'possimus',
  'omnis',
  'voluptas',
  'assumenda',
  'repellendus',
  'temporibus',
  'autem',
  'quibusdam',
  'debitis',
  'necessitatibus',
  'saepe',
  'eveniet',
  'voluptates',
  'repudiandae',
  'recusandae',
  'itaque',
  'earum',
  'hic',
  'tenetur',
  'sapiente',
  'delectus',
  'reiciendis',
  'maiores',
  'alias',
  'perferendis',
  'doloribus',
  'asperiores',
  'repellat',
  'aeterno',
  'pertinax',
  'sensibus',
  'vituperata',
  'splendide',
  'eripuit',
  'tincidunt',
  'laoreet',
  'luctus',
  'malesuada',
  'feugiat',
  'vivamus',
  'vehicula',
  'eleifend',
];

const TECH_WORDS = [
  'cloud',
  'infrastructure',
  'microservices',
  'kubernetes',
  'latency',
  'distributed',
  'pipeline',
  'scalability',
  'telemetry',
  'neural',
  'network',
  'machine',
  'learning',
  'deployment',
  'docker',
  'observability',
  'api',
  'gateway',
  'serverless',
  'lambda',
  'graphql',
  'database',
  'postgres',
  'redis',
  'cache',
  'encryption',
  'zero-trust',
  'architecture',
  'continuous',
  'integration',
  'delivery',
  'devops',
  'asynchronous',
  'concurrency',
  'throughput',
  'load-balancer',
  'runtime',
  'hypervisor',
  'virtualization',
  'event-driven',
  'kafka',
  'message-queue',
  'websocket',
  'fullstack',
  'typescript',
  'react',
  'nextjs',
  'resilience',
  'fault-tolerant',
  'benchmark',
  'algorithm',
  'clustering',
];

const ECOMMERCE_WORDS = [
  'organic',
  'handcrafted',
  'sustainable',
  'premium',
  'quality',
  'artisan',
  'durable',
  'limited-edition',
  'ergonomic',
  'cotton',
  'warranty',
  'expedited',
  'shipping',
  'customer',
  'satisfaction',
  'inventory',
  'checkout',
  'discount',
  'voucher',
  'cart',
  'bestseller',
  'hand-stitched',
  'eco-friendly',
  'packaging',
  'return',
  'policy',
  'tailored',
  'texture',
  'aesthetic',
  'breathable',
  'authentic',
  'craftsmanship',
  'seamless',
  'versatile',
  'water-resistant',
  'lightweight',
  'comfort',
  'curated',
  'collection',
  'specifications',
];

const FINANCE_WORDS = [
  'quarterly',
  'dividend',
  'portfolio',
  'diversification',
  'equity',
  'yield',
  'macroeconomic',
  'liquidity',
  'ratio',
  'balance-sheet',
  'capital',
  'expenditure',
  'amortization',
  'fiscal',
  'policy',
  'compliance',
  'asset',
  'allocation',
  'arbitrage',
  'volatility',
  'index',
  'securities',
  'derivative',
  'underwriting',
  'creditworthiness',
  'solvency',
  'hedge-fund',
  'venture-capital',
  'roi',
  'ebitda',
  'cash-flow',
  'valuation',
  'benchmark',
  'audit',
  'treasury',
  'inflation',
  'yield-curve',
  'stakeholders',
];

const MEDICAL_WORDS = [
  'clinical',
  'evaluation',
  'biomarker',
  'therapeutic',
  'efficacy',
  'patient',
  'wellness',
  'diagnosis',
  'pharmacology',
  'metabolic',
  'pathway',
  'preventative',
  'care',
  'telemedicine',
  'diagnostic',
  'protocol',
  'cellular',
  'regeneration',
  'cardiovascular',
  'neurological',
  'immunotherapy',
  'dosage',
  'systemic',
  'homeostasis',
  'randomized',
  'trial',
  'epidemiology',
  'pathogen',
  'molecular',
  'syndrome',
  'vital-signs',
];

const CREATIVE_WORDS = [
  'visual',
  'harmony',
  'narrative',
  'aesthetic',
  'minimalist',
  'typography',
  'palette',
  'emotional',
  'resonance',
  'storytelling',
  'conceptual',
  'curated',
  'experience',
  'vibrant',
  'composition',
  'texture',
  'geometric',
  'symmetry',
  'dynamic',
  'rhythm',
  'brand',
  'identity',
  'sensory',
  'balance',
  'abstract',
  'metaphor',
  'fluidity',
  'surreal',
  'illumination',
  'expressive',
  'nuance',
  'monochrome',
];

const CYBERPUNK_WORDS = [
  'neon',
  'cybernetic',
  'mainframe',
  'quantum',
  'encryption',
  'neural',
  'interface',
  'socket',
  'darknet',
  'protocol',
  'holographic',
  'sub-orbital',
  'uplink',
  'synthwave',
  'velocity',
  'biometric',
  'scanner',
  'firewall',
  'augmented',
  'retina',
  'grid',
  'cyberspace',
  'nanotech',
  'autonomous',
  'dystopian',
  'glitch',
  'overclocked',
  'node',
  'decentralized',
  'matrix',
  'terminal',
  'synthetic',
];

const THEME_DICTIONARIES: Record<ThemeCategory, string[]> = {
  latin: LATIN_WORDS,
  tech: TECH_WORDS,
  ecommerce: ECOMMERCE_WORDS,
  finance: FINANCE_WORDS,
  medical: MEDICAL_WORDS,
  creative: CREATIVE_WORDS,
  cyberpunk: CYBERPUNK_WORDS,
};

const CLASSIC_OPENING =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

function getRandomWord(dict: string[]): string {
  return dict[Math.floor(Math.random() * dict.length)];
}

function makeSentence(dict: string[], wordCount = 10): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord(dict));
  }
  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function makeParagraph(dict: string[], sentenceCount = 5): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    const len = 7 + Math.floor(Math.random() * 8);
    sentences.push(makeSentence(dict, len));
  }
  return sentences.join(' ');
}

export default function LoremIpsumPage() {
  const tUI = useTranslations('ToolUI.loremIpsum');

  // Generator State
  const [unit, setUnit] = useState<GeneratorUnit>('paragraphs');
  const [quantity, setQuantity] = useState<number>(3);
  const [theme, setTheme] = useState<ThemeCategory>('latin');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('plain');
  const [startWithClassic, setStartWithClassic] = useState<boolean>(true);
  const [includeHeadings, setIncludeHeadings] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Content
  const generatedText = useMemo(() => {
    // seed triggers regeneration
    void seed;
    const dict = THEME_DICTIONARIES[theme] || LATIN_WORDS;

    let rawParagraphs: string[] = [];

    if (unit === 'paragraphs') {
      const pCount = Math.max(1, Math.min(50, quantity));
      for (let i = 0; i < pCount; i++) {
        if (i === 0 && startWithClassic && theme === 'latin') {
          rawParagraphs.push(CLASSIC_OPENING);
        } else {
          rawParagraphs.push(makeParagraph(dict, 4 + Math.floor(Math.random() * 3)));
        }
      }
    } else if (unit === 'words') {
      const targetWords = Math.max(5, Math.min(5000, quantity));
      const words: string[] = [];
      if (startWithClassic && theme === 'latin') {
        const classicWords = CLASSIC_OPENING.replace(/[.,]/g, '').toLowerCase().split(' ');
        words.push(...classicWords.slice(0, targetWords));
      }
      while (words.length < targetWords) {
        words.push(getRandomWord(dict));
      }

      // Group into sentences and paragraphs
      const groupedSentences: string[] = [];
      let tempWords: string[] = [];
      for (let i = 0; i < words.length; i++) {
        tempWords.push(words[i]);
        if (tempWords.length >= 10 || i === words.length - 1) {
          const s = tempWords.join(' ');
          groupedSentences.push(
            s.charAt(0).toUpperCase() + s.slice(1) + (i === words.length - 1 ? '.' : '. ')
          );
          tempWords = [];
        }
      }

      // Chunk sentences into paragraphs (~4 sentences per paragraph)
      const pList: string[] = [];
      for (let i = 0; i < groupedSentences.length; i += 4) {
        pList.push(
          groupedSentences
            .slice(i, i + 4)
            .join(' ')
            .trim()
        );
      }
      rawParagraphs = pList.length > 0 ? pList : [words.join(' ') + '.'];
    } else if (unit === 'characters') {
      const targetChars = Math.max(10, Math.min(25000, quantity));
      let currentText = '';

      if (startWithClassic && theme === 'latin') {
        currentText = CLASSIC_OPENING;
      }

      while (currentText.length < targetChars + 100) {
        currentText += ' ' + makeParagraph(dict, 3);
      }

      // Slice at targetChars cleanly
      let trimmed = currentText.trim();
      if (trimmed.length > targetChars) {
        trimmed = trimmed.substring(0, targetChars);
        // Find last space to not cut word midway
        const lastSpace = trimmed.lastIndexOf(' ');
        if (lastSpace > targetChars - 15 && lastSpace > 0) {
          trimmed = trimmed.substring(0, lastSpace);
        }
        if (!trimmed.endsWith('.')) {
          trimmed += '.';
        }
      }

      // Break into paragraphs by ~300 chars
      const pieces = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      const pList: string[] = [];
      let currentP: string[] = [];
      let curLen = 0;

      for (const piece of pieces) {
        currentP.push(piece.trim());
        curLen += piece.length;
        if (curLen > 300) {
          pList.push(currentP.join(' '));
          currentP = [];
          curLen = 0;
        }
      }
      if (currentP.length > 0) {
        pList.push(currentP.join(' '));
      }
      rawParagraphs = pList.length > 0 ? pList : [trimmed];
    } else if (unit === 'sentences') {
      const sCount = Math.max(1, Math.min(100, quantity));
      const sentences: string[] = [];
      for (let i = 0; i < sCount; i++) {
        if (i === 0 && startWithClassic && theme === 'latin') {
          sentences.push(CLASSIC_OPENING.split('.')[0] + '.');
        } else {
          sentences.push(makeSentence(dict, 8 + Math.floor(Math.random() * 6)));
        }
      }
      // Group sentences every 4 into paragraphs
      for (let i = 0; i < sentences.length; i += 4) {
        rawParagraphs.push(sentences.slice(i, i + 4).join(' '));
      }
    } else if (unit === 'lists') {
      const itemCount = Math.max(2, Math.min(30, quantity));
      const items: string[] = [];
      for (let i = 0; i < itemCount; i++) {
        items.push(makeSentence(dict, 5 + Math.floor(Math.random() * 5)).replace(/\.$/, ''));
      }
      rawParagraphs = items;
    }

    // Apply Format Transformations
    if (outputFormat === 'plain') {
      if (unit === 'lists') {
        return rawParagraphs.map((it) => `• ${it}`).join('\n');
      }
      return rawParagraphs.join('\n\n');
    }

    if (outputFormat === 'html') {
      if (unit === 'lists') {
        return `<ul>\n${rawParagraphs.map((it) => `  <li>${it}</li>`).join('\n')}\n</ul>`;
      }
      return rawParagraphs
        .map((p, idx) => {
          const heading = includeHeadings && idx > 0 ? `<h2>Section ${idx + 1}</h2>\n` : '';
          return `${heading}<p>${p}</p>`;
        })
        .join('\n\n');
    }

    if (outputFormat === 'markdown') {
      if (unit === 'lists') {
        return rawParagraphs.map((it) => `- ${it}`).join('\n');
      }
      return rawParagraphs
        .map((p, idx) => {
          const heading = includeHeadings && idx > 0 ? `## Section ${idx + 1}\n\n` : '';
          return `${heading}${p}`;
        })
        .join('\n\n');
    }

    if (outputFormat === 'json') {
      const mockObj = {
        title: 'Placeholder Content',
        theme,
        unit,
        count: quantity,
        paragraphs: rawParagraphs.length,
        data:
          unit === 'lists'
            ? rawParagraphs
            : rawParagraphs.map((p, i) => ({ id: i + 1, content: p })),
      };
      return JSON.stringify(mockObj, null, 2);
    }

    return rawParagraphs.join('\n\n');
  }, [seed, theme, unit, quantity, startWithClassic, includeHeadings, outputFormat]);

  // Telemetry Metrics
  const stats = useMemo(() => {
    const text = generatedText.trim();
    if (!text) {
      return { words: 0, charsWithSpaces: 0, charsNoSpaces: 0, paragraphs: 0, readTime: '0 sec' };
    }
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readMinutes = words / 200;
    const readTime =
      readMinutes < 1 ? `${Math.ceil(readMinutes * 60)} sec` : `${Math.ceil(readMinutes)} min read`;

    return { words, charsWithSpaces, charsNoSpaces, paragraphs, readTime };
  }, [generatedText]);

  // Actions
  const handleRegenerate = useCallback(() => {
    setSeed((prev) => prev + 1);
  }, []);

  const handleCopy = useCallback(() => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedText]);

  const handleDownload = useCallback(() => {
    if (!generatedText) return;
    const ext =
      outputFormat === 'html'
        ? 'html'
        : outputFormat === 'json'
          ? 'json'
          : outputFormat === 'markdown'
            ? 'md'
            : 'txt';
    const mime =
      outputFormat === 'html'
        ? 'text/html'
        : outputFormat === 'json'
          ? 'application/json'
          : 'text/plain';
    const blob = new Blob([generatedText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lorem-ipsum-${unit}-${quantity}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generatedText, outputFormat, unit, quantity]);

  // Presets
  const applyPreset = (
    presetUnit: GeneratorUnit,
    presetQty: number,
    presetFormat?: OutputFormat
  ) => {
    setUnit(presetUnit);
    setQuantity(presetQty);
    if (presetFormat) setOutputFormat(presetFormat);
    setSeed((p) => p + 1);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* QUICK ACCESS PRESET PILLS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '20px',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={13} color="#f59e0b" /> Fast Presets:
          </span>
          {[
            { label: '⚡ 1000 Characters', unit: 'characters', qty: 1000 },
            { label: '⚡ 1000 Words', unit: 'words', qty: 1000 },
            { label: '⚡ 500 Words', unit: 'words', qty: 500 },
            { label: '⚡ 160 Chars (SEO)', unit: 'characters', qty: 160 },
            { label: '⚡ 3 Paragraphs', unit: 'paragraphs', qty: 3 },
            { label: '⚡ 5 Bullet Items', unit: 'lists', qty: 5 },
          ].map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => applyPreset(pill.unit as GeneratorUnit, pill.qty)}
              style={{
                backgroundColor:
                  unit === pill.unit && quantity === pill.qty
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'var(--bg-card)',
                color: unit === pill.unit && quantity === pill.qty ? '#3b82f6' : 'var(--text-main)',
                border:
                  unit === pill.unit && quantity === pill.qty
                    ? '1px solid #3b82f6'
                    : '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* MAIN CONTROLS WORKSPACE */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            marginBottom: '20px',
          }}
        >
          {/* TOP CONTROLS GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Unit Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Generate By
              </label>
              <select
                value={unit}
                onChange={(e) => {
                  const val = e.target.value as GeneratorUnit;
                  setUnit(val);
                  if (val === 'characters' && quantity < 50) setQuantity(1000);
                  if (val === 'words' && quantity < 10) setQuantity(250);
                  if (val === 'paragraphs' && quantity > 20) setQuantity(3);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="characters">Characters (e.g. 1000)</option>
                <option value="words">Words (e.g. 500, 1000)</option>
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="lists">Bullet Lists</option>
              </select>
            </div>

            {/* Quantity Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Quantity ({unit})
              </label>
              <input
                type="number"
                min={unit === 'characters' ? 10 : 1}
                max={unit === 'characters' ? 25000 : unit === 'words' ? 5000 : 50}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 1 : val);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* AI Theme / Tone Selector */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                <Sparkles size={14} color="#8b5cf6" /> Contextual Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeCategory)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="latin">🏛️ Classical Latin (Cicero)</option>
                <option value="tech">💻 Modern Tech & SaaS Cloud</option>
                <option value="ecommerce">🛍️ E-Commerce & Retail Products</option>
                <option value="finance">📈 Corporate & Finance Reports</option>
                <option value="medical">🩺 Medical & Healthcare Clinical</option>
                <option value="creative">🎨 Creative Agency & Design</option>
                <option value="cyberpunk">⚡ Cyberpunk & Sci-Fi Futuristic</option>
              </select>
            </div>

            {/* Output Format Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Output Markup Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="plain">📄 Plain Text</option>
                <option value="html">🌐 HTML (&lt;p&gt;, &lt;ul&gt;)</option>
                <option value="markdown">📝 Markdown (#, - )</option>
                <option value="json">💻 JSON Mock Object</option>
              </select>
            </div>
          </div>

          {/* SECONDARY TOGGLES & OPTIONS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {theme === 'latin' && (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={startWithClassic}
                    onChange={(e) => setStartWithClassic(e.target.checked)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Start with <em>&quot;Lorem ipsum dolor sit amet...&quot;</em>
                </label>
              )}

              {(outputFormat === 'html' || outputFormat === 'markdown') &&
                unit === 'paragraphs' && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={includeHeadings}
                      onChange={(e) => setIncludeHeadings(e.target.checked)}
                      style={{ accentColor: '#2563eb' }}
                    />
                    Include Section Headings
                  </label>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRegenerate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <RefreshCw size={14} /> Re-roll
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  backgroundColor: copied ? '#10b981' : '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          {/* LIVE TELEMETRY STATS BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 16px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlignLeft size={13} color="#3b82f6" />{' '}
              <strong>{stats.words.toLocaleString()}</strong> words
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Hash size={13} color="#10b981" />{' '}
              <strong>{stats.charsWithSpaces.toLocaleString()}</strong> characters
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              (<strong>{stats.charsNoSpaces.toLocaleString()}</strong> without spaces)
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={13} color="#f59e0b" /> <strong>{stats.paragraphs}</strong> blocks
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              ⏱️ <strong>{stats.readTime}</strong>
            </span>
          </div>

          {/* MAIN OUTPUT DISPLAY AREA */}
          <textarea
            value={generatedText}
            readOnly
            rows={14}
            placeholder="Generated placeholder text will appear here..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color:
                outputFormat === 'html' || outputFormat === 'json' ? '#3b82f6' : 'var(--text-main)',
              padding: '16px',
              fontFamily:
                outputFormat === 'html' || outputFormat === 'json' || outputFormat === 'markdown'
                  ? 'monospace'
                  : 'inherit',
              fontSize: '0.92rem',
              lineHeight: '1.65',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* STRUCTURED SEO & FAQ CONTENT */}
        <ToolSeoContent
          toolSlug="lorem-ipsum"
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
