'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ToolInterfaceSchema, ToolFieldValues } from '@/types/tool-interface';
import { useTool } from '../ToolProvider';
import { uuidSchema } from './defaultSchema';

interface UniversalToolInterfaceProps {
  schema?: ToolInterfaceSchema;
}

// ================= USER-AGENT PARSER UTILITIES =================
function detectBot(ua: string) {
  if (!ua) return { isBot: false, isAIBot: false, botName: '', botCategory: '', botVendor: '' };

  const aiBots = [
    { pattern: /GPTBot\/([\d.]+)/i, name: 'GPTBot', vendor: 'OpenAI', category: 'AI Scraper' },
    { pattern: /ChatGPT-User\/([\d.]+)/i, name: 'ChatGPT-User', vendor: 'OpenAI', category: 'AI Scraper' },
    { pattern: /ClaudeBot\/([\d.]+)/i, name: 'ClaudeBot', vendor: 'Anthropic', category: 'AI Scraper' },
    { pattern: /PerplexityBot\/([\d.]+)/i, name: 'PerplexityBot', vendor: 'Perplexity AI', category: 'AI Scraper' },
    { pattern: /Bytespider/i, name: 'Bytespider', vendor: 'ByteDance', category: 'AI Scraper' },
    { pattern: /Google-Extended/i, name: 'Google-Extended', vendor: 'Google', category: 'AI Scraper' },
    { pattern: /Cohere-AI/i, name: 'Cohere-AI', vendor: 'Cohere', category: 'AI Scraper' },
  ];

  for (const bot of aiBots) {
    if (bot.pattern.test(ua)) {
      const match = ua.match(bot.pattern);
      const version = match && match[1] ? match[1] : '';
      return {
        isBot: true,
        isAIBot: true,
        botName: version ? `${bot.name} ${version}` : bot.name,
        botCategory: bot.category,
        botVendor: bot.vendor,
      };
    }
  }

  const standardBots = [
    { pattern: /Googlebot\/([\d.]+)/i, name: 'Googlebot', vendor: 'Google', category: 'Search Engine' },
    { pattern: /bingbot\/([\d.]+)/i, name: 'Bingbot', vendor: 'Microsoft', category: 'Search Engine' },
    { pattern: /YandexBot\/([\d.]+)/i, name: 'YandexBot', vendor: 'Yandex', category: 'Search Engine' },
    { pattern: /DuckDuckBot\/([\d.]+)/i, name: 'DuckDuckBot', vendor: 'DuckDuckGo', category: 'Search Engine' },
    { pattern: /Applebot\/([\d.]+)/i, name: 'Applebot', vendor: 'Apple', category: 'Search Engine' },
    { pattern: /Twitterbot\/([\d.]+)/i, name: 'Twitterbot', vendor: 'X / Twitter', category: 'Social Media' },
    { pattern: /facebookexternalhit\/([\d.]+)/i, name: 'Facebook Crawler', vendor: 'Meta', category: 'Social Media' },
    { pattern: /curl\/([\d.]+)/i, name: 'cURL Command Line', vendor: 'Open Source', category: 'Generic Crawler' },
    { pattern: /Wget\/([\d.]+)/i, name: 'Wget Utility', vendor: 'GNU', category: 'Generic Crawler' },
    { pattern: /bot|crawler|spider/i, name: 'Generic Crawler', vendor: 'Unknown Bot', category: 'Generic Crawler' },
  ];

  for (const bot of standardBots) {
    if (bot.pattern.test(ua)) {
      const match = ua.match(bot.pattern);
      const version = match && match[1] ? match[1] : '';
      return {
        isBot: true,
        isAIBot: false,
        botName: version ? `${bot.name} ${version}` : bot.name,
        botCategory: bot.category,
        botVendor: bot.vendor,
      };
    }
  }

  return { isBot: false, isAIBot: false, botName: '', botCategory: '', botVendor: '' };
}

function detectBrowser(ua: string, isBot: boolean, botName: string) {
  if (!ua) return { name: 'Unknown', version: 'Unknown' };
  if (isBot) return { name: botName || 'Bot Client', version: '1.0' };

  const rules = [
    { name: 'Edge', pattern: /Edg\/([\d.]+)|Edge\/([\d.]+)/i },
    { name: 'Chrome', pattern: /Chrome\/([\d.]+)|CriOS\/([\d.]+)/i },
    { name: 'Firefox', pattern: /Firefox\/([\d.]+)|FxiOS\/([\d.]+)/i },
    { name: 'Safari', pattern: /Version\/([\d.]+).*Safari\/|Safari\/([\d.]+)/i },
    { name: 'Opera', pattern: /OPR\/([\d.]+)|Opera\/([\d.]+)/i },
    { name: 'Samsung Internet', pattern: /SamsungBrowser\/([\d.]+)/i },
  ];

  for (const r of rules) {
    const match = ua.match(r.pattern);
    if (match) {
      return { name: r.name, version: match[1] || match[2] || 'Latest' };
    }
  }
  return { name: 'Generic Browser', version: '1.0' };
}

function detectOS(ua: string) {
  if (!ua) return { name: 'Unknown OS', version: '' };
  if (/Windows NT 10.0/i.test(ua)) return { name: 'Windows', version: '10 / 11' };
  if (/Windows NT 6.3/i.test(ua)) return { name: 'Windows', version: '8.1' };
  if (/Windows NT 6.1/i.test(ua)) return { name: 'Windows', version: '7' };
  if (/iPhone/i.test(ua)) {
    const m = ua.match(/OS ([\d_]+) like Mac OS X/i);
    return { name: 'iOS', version: m ? m[1].replace(/_/g, '.') : '17.0' };
  }
  if (/iPad/i.test(ua)) return { name: 'iPadOS', version: '17.0' };
  if (/Macintosh|Mac OS X/i.test(ua)) {
    const m = ua.match(/Mac OS X ([\d_.]+)/i);
    return { name: 'macOS', version: m ? m[1].replace(/_/g, '.') : 'Sonoma' };
  }
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android ([\d.]+)/i);
    return { name: 'Android', version: m ? m[1] : '14.0' };
  }
  if (/Linux/i.test(ua)) return { name: 'Linux', version: 'Generic' };
  return { name: 'Unknown OS', version: '' };
}

function detectEngine(ua: string) {
  if (/Blink/i.test(ua) || /Chrome\/[\d.]+/i.test(ua)) return 'Blink';
  if (/AppleWebKit\/[\d.]+/i.test(ua)) return 'WebKit';
  if (/Gecko\/[\d.]+/i.test(ua) || /Firefox\/[\d.]+/i.test(ua)) return 'Gecko';
  return 'Unknown Engine';
}

function parseUserAgentReport(ua: string): string {
  const cleanUA = (ua || '').trim();
  if (!cleanUA) return 'No User-Agent string provided.';

  const bot = detectBot(cleanUA);
  const browser = detectBrowser(cleanUA, bot.isBot, bot.botName);
  const os = detectOS(cleanUA);
  const engine = detectEngine(cleanUA);
  const deviceType = bot.isBot ? 'Bot' : /Mobile/i.test(cleanUA) ? 'Mobile' : /Tablet|iPad/i.test(cleanUA) ? 'Tablet' : 'Desktop';
  const cpuArch = /arm64|aarch64|Apple Silicon/i.test(cleanUA) ? 'ARM64' : /x86_64|Win64|WOW64|x64/i.test(cleanUA) ? 'x86_64 (64-bit)' : '32-bit / Unknown';

  return [
    `========================================`,
    `VELNOXLABS USER-AGENT ANALYSIS REPORT`,
    `========================================`,
    `Raw User-Agent     : ${cleanUA}`,
    `Human Summary      : ${browser.name} ${browser.version} on ${os.name} ${os.version} (${deviceType})`,
    ``,
    `----------------------------------------`,
    `BROWSER & PLATFORM`,
    `----------------------------------------`,
    `Browser Name       : ${browser.name}`,
    `Browser Version    : ${browser.version}`,
    `Operating System   : ${os.name} ${os.version}`,
    `Rendering Engine   : ${engine}`,
    `Device Category    : ${deviceType}`,
    `CPU Architecture   : ${cpuArch}`,
    ``,
    `----------------------------------------`,
    `BOT & SECURITY INSPECTION`,
    `----------------------------------------`,
    `Is Automated Bot   : ${bot.isBot ? 'YES' : 'NO'}`,
    `Is AI Scraper      : ${bot.isAIBot ? 'YES' : 'NO'}`,
    bot.isBot ? `Bot Identifier     : ${bot.botName}` : `Traffic Type       : Human Browser Traffic`,
    bot.botVendor ? `Provider / Vendor  : ${bot.botVendor}` : `Security Status    : Clean / Verified`,
    `RFC Compliant      : ${cleanUA.startsWith('Mozilla/') ? 'YES' : 'NON-STANDARD'}`,
    `========================================`,
  ].join('\n');
}

// ================= LOREM IPSUM =================
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function generateSentence(startWithLorem = false, wordCount = 12): string {
  const words: string[] = [];
  if (startWithLorem) {
    words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.');
    return words.join(' ');
  }
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * LOREM_WORDS.length);
    words.push(LOREM_WORDS[idx]);
  }
  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function generateParagraph(startWithLorem = false): string {
  const sentenceCount = 4 + Math.floor(Math.random() * 3);
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(startWithLorem && i === 0, 8 + Math.floor(Math.random() * 8)));
  }
  return sentences.join(' ');
}

function generateLoremText(type: string, count: number, startWithLorem: boolean, asHtml: boolean): string {
  const safeCount = Math.min(Math.max(count || 1, 1), 50);

  if (type === 'words') {
    const words: string[] = [];
    if (startWithLorem && safeCount >= 5) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }
    while (words.length < safeCount) {
      const idx = Math.floor(Math.random() * LOREM_WORDS.length);
      words.push(LOREM_WORDS[idx]);
    }
    const res = words.join(' ');
    return asHtml ? `<p>${res}</p>` : res;
  }

  if (type === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      sentences.push(generateSentence(startWithLorem && i === 0, 10));
    }
    const res = sentences.join(' ');
    return asHtml ? `<p>${res}</p>` : res;
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    const p = generateParagraph(startWithLorem && i === 0);
    paragraphs.push(asHtml ? `<p>${p}</p>` : p);
  }
  return paragraphs.join('\n\n');
}

// ================= COLOR CONVERTER =================
function parseColor(input: string): { r: number; g: number; b: number } | null {
  const str = input.trim().toLowerCase();

  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  const rgbMatch = str.match(/^rgba?\(?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    return { r, g, b };
  }

  const hslMatch = str.match(/^hsla?\(?\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;

    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function convertColorFormats(input: string): string {
  const parsed = parseColor(input);
  if (!parsed) {
    return 'Invalid Color Format: Enter a valid HEX (#0284c7), RGB (rgb(2, 132, 199)), or HSL (hsl(199, 98%, 39%)) code.';
  }

  const { r, g, b } = parsed;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hslObj = rgbToHsl(r, g, b);
  const hsl = `hsl(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%)`;
  const hsvObj = rgbToHsv(r, g, b);
  const hsv = `hsv(${hsvObj.h}, ${hsvObj.s}%, ${hsvObj.v}%)`;

  return [
    `========================================`,
    `VELNOXLABS COLOR CONVERSION SPECIFICATION`,
    `========================================`,
    `HEX String          : ${hex}`,
    `RGB Code            : ${rgb}`,
    `HSL Representation  : ${hsl}`,
    `HSV / HSB Code      : ${hsv}`,
    ``,
    `----------------------------------------`,
    `CSS STYLING & DECLARATIONS`,
    `----------------------------------------`,
    `CSS HEX             : color: ${hex};`,
    `CSS RGB             : color: ${rgb};`,
    `CSS HSL             : color: ${hsl};`,
    `Tailwind Arbitrary  : bg-[${hex}]`,
    `========================================`,
  ].join('\n');
}

// ================= CASE CONVERTER =================
function toWords(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(text: string, targetCase: string): string {
  if (!text) return '';
  const lines = text.split('\n');

  const convertLine = (line: string): string => {
    if (!line.trim()) return line;
    const words = toWords(line);
    if (!words.length) return line;

    switch (targetCase) {
      case 'camelCase':
        return words
          .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
          .join('');
      case 'pascalCase':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      case 'snakeCase':
        return words.map((w) => w.toLowerCase()).join('_');
      case 'kebabCase':
        return words.map((w) => w.toLowerCase()).join('-');
      case 'constantCase':
        return words.map((w) => w.toUpperCase()).join('_');
      case 'titleCase':
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      case 'sentenceCase':
        const joined = words.join(' ').toLowerCase();
        return joined.charAt(0).toUpperCase() + joined.slice(1);
      case 'upperCase':
        return line.toUpperCase();
      case 'lowerCase':
        return line.toLowerCase();
      default:
        return line;
    }
  };

  return lines.map(convertLine).join('\n');
}

// ================= WORD COUNTER =================
function analyzeTextMetrics(text: string): string {
  if (!text.trim()) {
    return 'No text provided. Paste or type text to view word count and metrics.';
  }

  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
  const wordsArray = text.trim().match(/\b[\w'-]+\b/g) || [];
  const wordCount = wordsArray.length;
  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0);
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length;
  const lines = text.split('\n').length;

  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));
  const speakingTimeMin = Math.max(1, Math.ceil(wordCount / 130));

  const freqMap: Record<string, number> = {};
  wordsArray.forEach((w: string) => {
    const clean = w.toLowerCase();
    if (clean.length > 2) {
      freqMap[clean] = (freqMap[clean] || 0) + 1;
    }
  });

  const sortedKeywords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `  - ${word}: ${count}x (${((count / wordCount) * 100).toFixed(1)}%)`)
    .join('\n');

  return [
    `========================================`,
    `VELNOXLABS CONTENT & WORD METRICS REPORT`,
    `========================================`,
    `Words                : ${wordCount.toLocaleString()}`,
    `Characters (Total)   : ${charactersWithSpaces.toLocaleString()}`,
    `Characters (No Space): ${charactersWithoutSpaces.toLocaleString()}`,
    `Sentences            : ${sentences.toLocaleString()}`,
    `Paragraphs           : ${paragraphs.toLocaleString()}`,
    `Lines                : ${lines.toLocaleString()}`,
    ``,
    `----------------------------------------`,
    `TIME ESTIMATES`,
    `----------------------------------------`,
    `Reading Time         : ~${readingTimeMin} min (at 200 WPM)`,
    `Speaking Time        : ~${speakingTimeMin} min (at 130 WPM)`,
    ``,
    `----------------------------------------`,
    `TOP REPEATED KEYWORDS (>2 chars)`,
    `----------------------------------------`,
    sortedKeywords || '  - None detected',
    `========================================`,
  ].join('\n');
}

export function UniversalToolInterface({ schema }: UniversalToolInterfaceProps) {
  const { tool } = useTool();
  const safeSchema = schema ?? uuidSchema;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resizedImageUrl, setResizedImageUrl] = useState<string>('');

  const [inputs, setInputs] = useState<ToolFieldValues>(() => {
    const initial: ToolFieldValues = {};
    if (safeSchema && safeSchema.inputs) {
      safeSchema.inputs.forEach((input) => {
        initial[input.id] = input.defaultValue ?? '';
      });
    }
    return initial;
  });

  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-fill navigator.userAgent on mount for user-agent-parser
  useEffect(() => {
    if (tool.slug === 'user-agent-parser' && typeof window !== 'undefined' && navigator?.userAgent) {
      if (!inputs.ua) {
        setInputs((prev) => ({ ...prev, ua: navigator.userAgent }));
      }
    }
  }, [tool.slug]);

  const handleInputChange = (id: string, value: string | number | boolean | File | File[] | null) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setOutput(`Loaded Image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleLoadMyUA = () => {
    if (typeof window !== 'undefined' && navigator?.userAgent) {
      setInputs((prev) => ({ ...prev, ua: navigator.userAgent }));
      setOutput(parseUserAgentReport(navigator.userAgent));
    }
  };

  // Execution Engine for Tools
  const handleExecute = async () => {
    // 1. User-Agent Parser Engine
    if (tool.slug === 'user-agent-parser') {
      const uaString = typeof inputs.ua === 'string' ? inputs.ua : (typeof navigator !== 'undefined' ? navigator.userAgent : '');
      setOutput(parseUserAgentReport(uaString));
      return;
    }

    // 2. Image Resizer Engine (HTML5 Canvas)
    if (tool.slug === 'image-resizer') {
      if (!selectedFile) {
        setOutput('Please choose an image file first using the file selector below.');
        return;
      }

      const targetWidth = Number(inputs.width) || 800;
      const targetHeight = Number(inputs.height) || 600;
      const format = typeof inputs.format === 'string' ? inputs.format : 'image/webp';
      const quality = Number(inputs.quality) || 0.9;

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        img.src = readerEvent.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setOutput('Canvas context error: Failed to initialize 2D rendering buffer.');
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL(format, quality);
          setResizedImageUrl(dataUrl);

          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
          const sizeEstimate = Math.round((dataUrl.length * 3) / 4 / 1024);

          setOutput([
            `========================================`,
            `VELNOXLABS IMAGE RESIZE SUCCESSFUL`,
            `========================================`,
            `Source File         : ${selectedFile.name}`,
            `Original Dimensions : ${img.width} x ${img.height} px`,
            `Output Dimensions   : ${targetWidth} x ${targetHeight} px`,
            `Target Format       : ${format.toUpperCase()} (.${ext})`,
            `Quality Level       : ${(quality * 100).toFixed(0)}%`,
            `Approx Output Size  : ~${sizeEstimate} KB`,
            ``,
            `Ready to save! Click 'Save Image' above or check your download.`,
            `========================================`,
          ].join('\n'));

          const link = document.createElement('a');
          link.download = `resized_${selectedFile.name.replace(/\.[^/.]+$/, '')}.${ext}`;
          link.href = dataUrl;
          link.click();
        };
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    // 3. Lorem Ipsum Engine
    if (tool.slug === 'lorem-ipsum') {
      const type = typeof inputs.type === 'string' ? inputs.type : 'paragraphs';
      const count = Number(inputs.count) || 3;
      const startWithLorem = inputs.startWithLorem !== false;
      const asHtml = Boolean(inputs.asHtml);
      setOutput(generateLoremText(type, count, startWithLorem, asHtml));
      return;
    }

    // 4. Color Converter Engine
    if (tool.slug === 'color-converter') {
      const colorVal = typeof inputs.color === 'string' ? inputs.color : '';
      setOutput(convertColorFormats(colorVal));
      return;
    }

    // 5. JSON Formatter & Validator Engine
    if (tool.slug === 'json-formatter') {
      const raw = typeof inputs.input === 'string' ? inputs.input.trim() : '';
      const indentMode = typeof inputs.indent === 'string' ? inputs.indent : '2';

      if (!raw) {
        setOutput('');
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        if (indentMode === 'minified') {
          setOutput(JSON.stringify(parsed));
        } else {
          const spaces = indentMode === '4' ? 4 : 2;
          setOutput(JSON.stringify(parsed, null, spaces));
        }
      } catch (err: any) {
        setOutput(`Invalid JSON Syntax Error:\n\n${err?.message || 'Failed to parse JSON string'}`);
      }
      return;
    }

    // 6. Word Counter Engine
    if (tool.slug === 'word-counter') {
      const text = typeof inputs.input === 'string' ? inputs.input : '';
      setOutput(analyzeTextMetrics(text));
      return;
    }

    // 7. Case Converter Engine
    if (tool.slug === 'case-converter') {
      const targetCase = typeof inputs.targetCase === 'string' ? inputs.targetCase : 'camelCase';
      const text = typeof inputs.input === 'string' ? inputs.input : '';
      setOutput(convertCase(text, targetCase));
      return;
    }

    // 8. Password Generator Engine
    if (tool.slug === 'password-generator') {
      const length = Math.min(Math.max(Number(inputs.length) || 16, 6), 128);
      const count = Math.min(Math.max(Number(inputs.count) || 1, 1), 50);
      const upper = inputs.includeUppercase !== false;
      const lower = inputs.includeLowercase !== false;
      const numbers = inputs.includeNumbers !== false;
      const symbols = inputs.includeSymbols !== false;

      let charset = '';
      if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (numbers) charset += '0123456789';
      if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!charset) {
        setOutput('Error: Please enable at least one character set.');
        return;
      }

      const generated: string[] = [];
      const randomVals = new Uint32Array(length);

      for (let i = 0; i < count; i++) {
        crypto.getRandomValues(randomVals);
        let pwd = '';
        for (let j = 0; j < length; j++) {
          pwd += charset[randomVals[j] % charset.length];
        }
        generated.push(pwd);
      }
      setOutput(generated.join('\n'));
      return;
    }

    // 9. Hash Generator Engine
    if (tool.slug === 'hash-generator') {
      const algorithm = typeof inputs.algorithm === 'string' ? inputs.algorithm : 'SHA-256';
      const text = typeof inputs.input === 'string' ? inputs.input : '';

      if (!text) {
        setOutput('');
        return;
      }

      try {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setOutput(hashHex);
      } catch (err: any) {
        setOutput(`Hashing Error: ${err?.message || 'Unsupported algorithm'}`);
      }
      return;
    }

    // 10. Base64 Engine
    if (tool.slug === 'base64-encoder') {
      const mode = typeof inputs.mode === 'string' ? inputs.mode : 'encode';
      const text = typeof inputs.input === 'string' ? inputs.input : '';

      if (!text) {
        setOutput('');
        return;
      }

      try {
        if (mode === 'encode') {
          const bytes = new TextEncoder().encode(text);
          let binString = '';
          bytes.forEach((byte) => {
            binString += String.fromCharCode(byte);
          });
          setOutput(btoa(binString));
        } else {
          const cleanBase64 = text.trim().replace(/\s+/g, '');
          const binString = atob(cleanBase64);
          const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
          setOutput(new TextDecoder().decode(bytes));
        }
      } catch (err: any) {
        setOutput(`Error: ${err?.message || 'Invalid format for conversion'}`);
      }
      return;
    }

    // 11. UUID Generator Engine
    const count = Math.min(Math.max(Number(inputs.count) || 1, 1), 1000);
    const casing = typeof inputs.casing === 'string' ? inputs.casing : 'lower';
    const hyphens = inputs.hyphens !== false;

    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = crypto.randomUUID();
      if (!hyphens) id = id.replace(/-/g, '');
      if (casing === 'upper') id = id.toUpperCase();
      list.push(id);
    }
    setOutput(list.join('\n'));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (tool.slug === 'image-resizer' && resizedImageUrl) {
      const format = typeof inputs.format === 'string' ? inputs.format : 'image/webp';
      const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
      const link = document.createElement('a');
      link.download = `resized_image.${ext}`;
      link.href = resizedImageUrl;
      link.click();
      return;
    }

    if (!output) return;
    const isJson = tool.slug === 'json-formatter';
    const isHtml = tool.slug === 'lorem-ipsum' && Boolean(inputs.asHtml);
    const ext = isJson ? 'json' : isHtml ? 'html' : 'txt';
    const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.slug}_output.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    const resetInputs: ToolFieldValues = {};
    if (safeSchema && safeSchema.inputs) {
      safeSchema.inputs.forEach((input) => {
        resetInputs[input.id] = input.defaultValue ?? '';
      });
    }
    setInputs(resetInputs);
    setSelectedFile(null);
    setResizedImageUrl('');
    setOutput('');
  };

  const actionLabel =
    tool.slug === 'user-agent-parser'
      ? 'Parse User-Agent'
      : tool.slug === 'image-resizer'
      ? 'Process & Download Image'
      : tool.slug === 'lorem-ipsum'
      ? 'Generate Lorem Ipsum'
      : tool.slug === 'color-converter'
      ? 'Convert Color'
      : tool.slug === 'json-formatter'
      ? 'Format & Validate'
      : tool.slug === 'word-counter'
      ? 'Analyze Text'
      : tool.slug === 'case-converter'
      ? 'Convert Case'
      : tool.slug === 'base64-encoder'
      ? 'Convert'
      : tool.slug === 'hash-generator'
      ? 'Generate Hash'
      : tool.slug === 'password-generator'
      ? 'Generate Passwords'
      : 'Generate';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleExecute}
          style={{
            padding: '8px 18px',
            backgroundColor: '#0284c7',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>

        {tool.slug === 'user-agent-parser' && (
          <button
            type="button"
            onClick={handleLoadMyUA}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              borderRadius: '6px',
              border: '1px solid #0284c7',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            My User-Agent
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1e293b',
            color: '#fff',
            borderRadius: '6px',
            border: '1px solid #334155',
            cursor: output ? 'pointer' : 'not-allowed',
          }}
        >
          {copied ? 'Copied!' : 'Copy Result'}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!output && !resizedImageUrl}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1e293b',
            color: '#fff',
            borderRadius: '6px',
            border: '1px solid #334155',
            cursor: output || resizedImageUrl ? 'pointer' : 'not-allowed',
          }}
        >
          {tool.slug === 'image-resizer' ? 'Save Image' : 'Download .txt'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Split Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* INPUTS COLUMN */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            backgroundColor: '#090d16',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#64748b' }}>
            INPUT & SETTINGS
          </span>

          {tool.slug === 'image-resizer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                Select Image File (Client-Side)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#94a3b8',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              />
              {selectedFile && (
                <span style={{ fontSize: '11px', color: '#34d399' }}>
                  ✓ Loaded: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          )}

          {safeSchema.inputs.map((field) => (
            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {field.type !== 'checkbox' && (
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>
                  {field.label}
                </label>
              )}

              {field.type === 'select' && (
                <select
                  value={(inputs[field.id] as string | number) ?? ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    outline: 'none',
                  }}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'textarea' && (
                <textarea
                  value={(inputs[field.id] as string) ?? ''}
                  rows={field.rows || 6}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  value={(inputs[field.id] as number | string) ?? ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    outline: 'none',
                  }}
                />
              )}

              {field.type === 'checkbox' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0' }}>
                  <input
                    type="checkbox"
                    checked={inputs[field.id] === true}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{field.label}</span>
                </label>
              )}
            </div>
          ))}
        </div>

        {/* OUTPUT COLUMN */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            backgroundColor: '#090d16',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#64748b' }}>
            OUTPUT & ANALYSIS
          </span>

          {resizedImageUrl && (
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <img
                src={resizedImageUrl}
                alt="Resized Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '180px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          <textarea
            readOnly
            value={output}
            placeholder="Parsed analysis and diagnostic results will appear here..."
            rows={12}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '13px',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
