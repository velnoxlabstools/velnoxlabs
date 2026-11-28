'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Gamepad2,
  Heart,
  Palette,
  Layers,
  Search,
  PenTool,
  Star,
  Share2,
} from 'lucide-react';

// Character maps for unicode transformations
const SCRIPT_MAP: Record<string, string> = {
  A: '𝒜',
  B: 'ℬ',
  C: '𝒞',
  D: '𝒟',
  E: 'ℰ',
  F: 'ℱ',
  G: '𝒢',
  H: 'ℋ',
  I: 'ℐ',
  J: '𝒥',
  K: '𝒦',
  L: 'ℒ',
  M: 'ℳ',
  N: '𝒩',
  O: '𝒪',
  P: '𝒫',
  Q: '𝒬',
  R: 'ℛ',
  S: '𝒮',
  T: '𝒯',
  U: '𝒰',
  V: '𝒱',
  W: '𝒲',
  X: '𝒳',
  Y: '𝒴',
  Z: '𝒵',
  a: '𝒶',
  b: '𝒷',
  c: '𝒸',
  d: '𝒹',
  e: 'ℯ',
  f: '𝒻',
  g: 'ℊ',
  h: '𝒽',
  i: '𝒾',
  j: '𝒿',
  k: '𝓀',
  l: '𝓁',
  m: '𝓂',
  n: '𝓃',
  o: 'ℴ',
  p: '𝓅',
  q: '𝓆',
  r: '𝓇',
  s: '𝓈',
  t: '𝓉',
  u: '𝓊',
  v: '𝓋',
  w: '𝓌',
  x: '𝓍',
  y: '𝓎',
  z: '𝓏',
};

const FRAKTUR_MAP: Record<string, string> = {
  C: 'ℭ',
  H: 'ℌ',
  I: 'ℑ',
  R: 'ℜ',
  Z: 'ℨ',
};

const DOUBLE_STRUCK_MAP: Record<string, string> = {
  C: 'ℂ',
  H: 'ℍ',
  N: 'ℕ',
  P: 'ℙ',
  Q: 'ℚ',
  R: 'ℝ',
  Z: 'ℤ',
};

const SMALL_CAPS_MAP: Record<string, string> = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ғ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ǫ',
  r: 'ʀ',
  s: 's',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ',
};

const INVERT_MAP: Record<string, string> = {
  a: 'ɐ',
  b: 'q',
  c: 'ɔ',
  d: 'p',
  e: 'ǝ',
  f: 'ɟ',
  g: 'ƃ',
  h: 'ɥ',
  i: 'ᴉ',
  j: 'ɾ',
  k: 'ʞ',
  l: 'l',
  m: 'ɯ',
  n: 'u',
  o: 'o',
  p: 'd',
  q: 'b',
  r: 'ɹ',
  s: 's',
  t: 'ʇ',
  u: 'n',
  v: 'ʌ',
  w: 'ʍ',
  x: 'x',
  y: 'ʎ',
  z: 'z',
  A: '∀',
  B: '𐐒',
  C: 'Ɔ',
  D: 'p',
  E: 'Ǝ',
  F: 'Ⅎ',
  G: '⅁',
  H: 'H',
  I: 'I',
  J: 'ſ',
  K: 'ʞ',
  L: '˥',
  M: 'W',
  N: 'N',
  O: 'O',
  P: 'Ԁ',
  Q: 'Ò',
  R: 'ᴚ',
  S: 'S',
  T: '⊥',
  U: '∩',
  V: 'Λ',
  W: 'M',
  X: 'X',
  Y: '⅄',
  Z: 'Z',
  '1': 'Ɩ',
  '2': 'ᄅ',
  '3': 'Ɛ',
  '4': 'ㄣ',
  '5': 'ϛ',
  '6': '9',
  '7': 'ㄥ',
  '8': '8',
  '9': '6',
  '0': '0',
  '?': '¿',
  '!': '¡',
  '.': '˙',
  ',': "'",
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
};

function transformText(str: string, mapFn: (char: string) => string): string {
  return str.split('').map(mapFn).join('');
}

type StyleNameKey =
  | 'styleBold'
  | 'styleItalic'
  | 'styleBoldItalic'
  | 'styleScript'
  | 'styleBoldScript'
  | 'styleFraktur'
  | 'styleBoldFraktur'
  | 'styleDoubleStruck'
  | 'styleSans'
  | 'styleMonospace'
  | 'styleCircled'
  | 'styleSmallCaps'
  | 'styleStrikethrough'
  | 'styleUnderline'
  | 'styleInverted'
  | 'styleFullwidth'
  | 'styleSquared'
  | 'styleBlueText'
  | 'styleBlueSquared'
  | 'styleBlueTick'
  | 'styleWhatsAppBold'
  | 'styleWhatsAppMono'
  | 'styleGamingWings'
  | 'styleGamingStars'
  | 'styleAestheticHearts'
  | 'styleAestheticSparkles'
  | 'styleGlitchZalgo'
  | 'styleCalligraphySwash'
  | 'styleCalligraphyRoyal'
  | 'styleCalligraphyWings'
  | 'styleBlueButterfly'
  | 'styleBlueOcean'
  | 'styleBlueDiamond'
  | 'styleBlueIce'
  | 'styleBlueEvilEye'
  | 'styleBlueTickSuper';

interface StyleConfig {
  id: string;
  nameKey: StyleNameKey;
  category: 'trending' | 'calligraphy' | 'blue' | 'badges' | 'whatsapp' | 'gaming' | 'aesthetic';
  isPopular21?: boolean;
  transform: (text: string) => string;
  badge?: string;
}

const STYLES_CONFIG: StyleConfig[] = [
  // Trending & Core Typography (PartOf 21 styles)
  {
    id: 'bold',
    nameKey: 'styleBold',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48);
        return c;
      }),
  },
  {
    id: 'italic',
    nameKey: 'styleItalic',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d608 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d622 + code - 97);
        return c;
      }),
  },
  {
    id: 'boldItalic',
    nameKey: 'styleBoldItalic',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d63c + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d656 + code - 97);
        return c;
      }),
  },
  {
    id: 'script',
    nameKey: 'styleScript',
    category: 'calligraphy',
    isPopular21: true,
    badge: '✒️ Cursive',
    transform: (t) => transformText(t, (c) => SCRIPT_MAP[c] || c),
  },
  {
    id: 'boldScript',
    nameKey: 'styleBoldScript',
    category: 'calligraphy',
    isPopular21: true,
    badge: '✒️ Bold',
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
        return c;
      }),
  },
  {
    id: 'calligraphySwash',
    nameKey: 'styleCalligraphySwash',
    category: 'calligraphy',
    isPopular21: true,
    badge: '༺ ༻',
    transform: (t) => `༺ ${transformText(t, (c) => SCRIPT_MAP[c] || c)} ༻`,
  },
  {
    id: 'calligraphyRoyal',
    nameKey: 'styleCalligraphyRoyal',
    category: 'calligraphy',
    isPopular21: true,
    badge: '♕',
    transform: (t) =>
      `♕ ${transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
        return c;
      })} ♕`,
  },
  {
    id: 'calligraphyWings',
    nameKey: 'styleCalligraphyWings',
    category: 'calligraphy',
    isPopular21: true,
    badge: '🦋ྀ‍',
    transform: (t) =>
      `🦋ྀ‍ ${transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
        return c;
      })} ྀ‍🦋`,
  },
  {
    id: 'fraktur',
    nameKey: 'styleFraktur',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        if (FRAKTUR_MAP[c]) return FRAKTUR_MAP[c];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d504 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d51e + code - 97);
        return c;
      }),
  },
  {
    id: 'boldFraktur',
    nameKey: 'styleBoldFraktur',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d56c + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d586 + code - 97);
        return c;
      }),
  },
  {
    id: 'doubleStruck',
    nameKey: 'styleDoubleStruck',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        if (DOUBLE_STRUCK_MAP[c]) return DOUBLE_STRUCK_MAP[c];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d538 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d552 + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7d8 + code - 48);
        return c;
      }),
  },
  {
    id: 'sans',
    nameKey: 'styleSans',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5a0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ba + code - 97);
        return c;
      }),
  },
  {
    id: 'monospace',
    nameKey: 'styleMonospace',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d670 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d68a + code - 97);
        if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7f6 + code - 48);
        return c;
      }),
  },
  {
    id: 'circled',
    nameKey: 'styleCircled',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + code - 97);
        if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
        if (code === 48) return '\u24EA';
        return c;
      }),
  },
  {
    id: 'smallCaps',
    nameKey: 'styleSmallCaps',
    category: 'trending',
    isPopular21: true,
    transform: (t) => transformText(t, (c) => SMALL_CAPS_MAP[c.toLowerCase()] || c),
  },
  {
    id: 'strikethrough',
    nameKey: 'styleStrikethrough',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      t
        .split('')
        .map((c) => c + '\u0336')
        .join(''),
  },
  {
    id: 'underline',
    nameKey: 'styleUnderline',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      t
        .split('')
        .map((c) => c + '\u0332')
        .join(''),
  },
  {
    id: 'inverted',
    nameKey: 'styleInverted',
    category: 'trending',
    isPopular21: true,
    transform: (t) =>
      t
        .split('')
        .reverse()
        .map((c) => INVERT_MAP[c] || c)
        .join(''),
  },
  {
    id: 'fullwidth',
    nameKey: 'styleFullwidth',
    category: 'trending',
    transform: (t) =>
      transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
        if (code === 32) return '\u3000';
        return c;
      }),
  },
  {
    id: 'squared',
    nameKey: 'styleSquared',
    category: 'trending',
    transform: (t) =>
      transformText(t.toUpperCase(), (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1f130 + code - 65);
        return c;
      }),
  },
  {
    id: 'glitchZalgo',
    nameKey: 'styleGlitchZalgo',
    category: 'trending',
    transform: (t) =>
      t
        .split('')
        .map((c, i) => (i % 2 === 0 ? c + '\u0337\u0338' : c + '\u0335\u0334'))
        .join(''),
  },

  // Blue & Color Category (Addresses 'Fancy text generator Blue colour')
  {
    id: 'blueText',
    nameKey: 'styleBlueText',
    category: 'blue',
    isPopular21: true,
    badge: '🔵 Regional',
    transform: (t) =>
      transformText(t.toUpperCase(), (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1f1e6 + code - 65) + ' ';
        return c;
      }).trim(),
  },
  {
    id: 'blueButterfly',
    nameKey: 'styleBlueButterfly',
    category: 'blue',
    isPopular21: true,
    badge: '🦋 Emoji',
    transform: (t) =>
      `🦋 ${transformText(t, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d4d0 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d4ea + code - 97);
        return c;
      })} 🦋`,
  },
  {
    id: 'blueOcean',
    nameKey: 'styleBlueOcean',
    category: 'blue',
    badge: '🌊 Wave',
    transform: (t) => `🌊 𓆝 𓆟 ${transformText(t, (c) => SCRIPT_MAP[c] || c)} 𓆞 🌊`,
  },
  {
    id: 'blueSquared',
    nameKey: 'styleBlueSquared',
    category: 'blue',
    badge: '💙 Heart',
    transform: (t) => `💙 ${t} 💙`,
  },
  {
    id: 'blueDiamond',
    nameKey: 'styleBlueDiamond',
    category: 'blue',
    badge: '💎 Diamond',
    transform: (t) => `💎 ${t} 💎`,
  },
  {
    id: 'blueIce',
    nameKey: 'styleBlueIce',
    category: 'blue',
    badge: '❄️ Frost',
    transform: (t) => `❄️ 🧊 ${t} 🧊 ❄️`,
  },
  {
    id: 'blueEvilEye',
    nameKey: 'styleBlueEvilEye',
    category: 'blue',
    badge: '🧿 Nazar',
    transform: (t) => `🧿 ${t} 🧿`,
  },
  {
    id: 'blueBubble',
    nameKey: 'styleBlueSquared',
    category: 'blue',
    badge: '🫧 Bubble',
    transform: (t) => `🫧 💙 ${t} 💙 🫧`,
  },
  {
    id: 'blueSparkleEmoji',
    nameKey: 'styleBlueDiamond',
    category: 'blue',
    badge: '🔹 Sparkle',
    transform: (t) => `🔹✨ ${t} ✨🔹`,
  },

  // Blue Tick & Badges (Addresses 'Fancy text generator blue tick')
  {
    id: 'blueTickCheck',
    nameKey: 'styleBlueTick',
    category: 'badges',
    badge: '✔️ Tick',
    transform: (t) => `${t} ✔️`,
  },
  {
    id: 'blueTickSuper',
    nameKey: 'styleBlueTickSuper',
    category: 'badges',
    isPopular21: true,
    badge: 'ᵛᵉʳᶦᶠᶦᵉᵈ',
    transform: (t) => `${t} ᵛᵉʳᶦᶠᶦᵉᵈ 💙`,
  },
  {
    id: 'blueTickVerified',
    nameKey: 'styleBlueTick',
    category: 'badges',
    badge: '𓆩✓𓆪',
    transform: (t) => `𓆩 ${t} 𓆪 ✓`,
  },
  {
    id: 'blueTickOfficial',
    nameKey: 'styleBlueTickSuper',
    category: 'badges',
    badge: '👑 Official',
    transform: (t) => `👑 ${t} ✓`,
  },
  {
    id: 'blueTickCute',
    nameKey: 'styleBlueTick',
    category: 'badges',
    badge: 'ᡣ𐭩 Cute',
    transform: (t) => `${t} ᡣ𐭩 ✓`,
  },

  // WhatsApp Category (Addresses 'Fancy text generator for WhatsApp')
  {
    id: 'whatsAppBold',
    nameKey: 'styleWhatsAppBold',
    category: 'whatsapp',
    badge: '*bold*',
    transform: (t) => `*${t}*`,
  },
  {
    id: 'whatsAppItalic',
    nameKey: 'styleWhatsAppBold',
    category: 'whatsapp',
    badge: '_italic_',
    transform: (t) => `_${t}_`,
  },
  {
    id: 'whatsAppStrike',
    nameKey: 'styleWhatsAppBold',
    category: 'whatsapp',
    badge: '~strike~',
    transform: (t) => `~${t}~`,
  },
  {
    id: 'whatsAppMono',
    nameKey: 'styleWhatsAppMono',
    category: 'whatsapp',
    badge: '```code```',
    transform: (t) => `\`\`\`${t}\`\`\``,
  },

  // Gaming Nicknames Category
  {
    id: 'gamingWings',
    nameKey: 'styleGamingWings',
    category: 'gaming',
    badge: '꧁༺༻꧂',
    transform: (t) => `꧁༺ ${t} ༻꧂`,
  },
  {
    id: 'gamingStars',
    nameKey: 'styleGamingStars',
    category: 'gaming',
    badge: '★彡彡★',
    transform: (t) => `★彡 ${t} 彡★`,
  },
  {
    id: 'gamingCrown',
    nameKey: 'styleGamingWings',
    category: 'gaming',
    badge: '👑 Crown',
    transform: (t) => `👑 ${t} 👑`,
  },
  {
    id: 'gamingVip',
    nameKey: 'styleGamingWings',
    category: 'gaming',
    badge: '亗 VIP',
    transform: (t) => `亗 ${t} 亗`,
  },
  {
    id: 'gamingLightning',
    nameKey: 'styleGamingStars',
    category: 'gaming',
    badge: '⚡ Electric',
    transform: (t) => `⚡ ${t} ⚡`,
  },

  // Aesthetic & Decorative Category
  {
    id: 'aestheticHearts',
    nameKey: 'styleAestheticHearts',
    category: 'aesthetic',
    badge: '｡ﾟ•┈୨୧┈•ﾟ｡',
    transform: (t) => `｡ﾟ•┈୨ ${t} ୧┈•ﾟ｡`,
  },
  {
    id: 'aestheticSparkles',
    nameKey: 'styleAestheticSparkles',
    category: 'aesthetic',
    badge: '✧✦',
    transform: (t) => `✧･ﾟ: *✧ ${t} ✧*:･ﾟ✧`,
  },
  {
    id: 'aestheticJapanese',
    nameKey: 'styleAestheticHearts',
    category: 'aesthetic',
    badge: '『 』',
    transform: (t) => `『 ${t} 』`,
  },
  {
    id: 'aestheticKaomoji',
    nameKey: 'styleAestheticSparkles',
    category: 'aesthetic',
    badge: '(◕‿◕✿)',
    transform: (t) => `(◕‿◕✿) ${t}`,
  },
  {
    id: 'aestheticBlossom',
    nameKey: 'styleAestheticHearts',
    category: 'aesthetic',
    badge: '🌸 Sakura',
    transform: (t) => `🌸・゜${t} ゜・🌸`,
  },
  {
    id: 'aestheticCloud',
    nameKey: 'styleAestheticSparkles',
    category: 'aesthetic',
    badge: '☁️ Dream',
    transform: (t) => `☁️ ⋆⁺₊⋆ ${t} ⋆⁺₊⋆ ☁️`,
  },
  {
    id: 'aestheticMusic',
    nameKey: 'styleAestheticSparkles',
    category: 'aesthetic',
    badge: '♬ Music',
    transform: (t) => `♬ ♩ ${t} ♩ ♬`,
  },
];

// Interactive Click-to-Insert Symbols Palette
const SYMBOL_CATEGORIES = [
  {
    titleKey: 'symbolGroupStars',
    symbols: ['★', '✦', '✧', '✪', '✯', '✰', '✨', '⚡', '👑', '♛', '༊*·˚'],
  },
  {
    titleKey: 'symbolGroupBlue',
    symbols: ['✔️', '✓', '☑️', '💙', '💎', '🧊', '🧿', '💠', '🦋', '🫧', '🔹', 'ᵛᵉʳᶦᶠᶦᵉᵈ'],
  },
  {
    titleKey: 'symbolGroupHearts',
    symbols: ['♡', '♥', '❥', '❣', '❦', '❧', '💖', 'ᡣ𐭩', '🌸', '☁️', '♬'],
  },
  {
    titleKey: 'symbolGroupGaming',
    symbols: ['亗', '☬', '࿐', '༒', '⚔', '✞', '𓆩', '𓆪', '彡', '★彡'],
  },
  {
    titleKey: 'symbolGroupBrackets',
    symbols: ['『 』', '【 】', '〖 〗', '꧁ ꧂', '༺ ༻', '« »', '░ ░'],
  },
];

export default function FancyTextGeneratorPage() {
  const t = useTranslations('ToolUI.fancyTextGenerator');

  const [input, setInput] = useState('VelnoxLabs Fancy Text');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState<boolean>(false);

  // Character and word stats
  const charCount = useMemo(() => input.length, [input]);
  const wordCount = useMemo(() => {
    const trimmed = input.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [input]);

  // Insert symbol helper
  const handleInsertSymbol = (sym: string) => {
    setInput((prev) => (prev ? `${prev} ${sym}` : sym));
  };

  // Filter styles according to active category and search query
  const filteredStyles = useMemo(() => {
    let styles = STYLES_CONFIG;

    if (activeCategory === 'popular21') {
      styles = styles.filter((s) => s.isPopular21);
    } else if (activeCategory === 'calligraphy') {
      styles = styles.filter((s) => s.category === 'calligraphy');
    } else if (activeCategory === 'blue') {
      styles = styles.filter((s) => s.category === 'blue');
    } else if (activeCategory === 'badges') {
      styles = styles.filter((s) => s.category === 'badges');
    } else if (activeCategory === 'whatsapp') {
      styles = styles.filter((s) => s.category === 'whatsapp');
    } else if (activeCategory === 'gaming') {
      styles = styles.filter((s) => s.category === 'gaming');
    } else if (activeCategory === 'aesthetic') {
      styles = styles.filter((s) => s.category === 'aesthetic');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      styles = styles.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          t(s.nameKey).toLowerCase().includes(q) ||
          (s.badge && s.badge.toLowerCase().includes(q))
      );
    }

    return styles;
  }, [activeCategory, searchQuery, t]);

  // One-click copy for an individual style
  const handleCopy = useCallback((id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }, []);

  // WhatsApp Direct Share
  const handleShareWhatsApp = (text: string) => {
    if (!text) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Copy all rendered styles into clipboard
  const handleCopyAll = useCallback(() => {
    if (!input) return;
    const allText = filteredStyles
      .map((s) => {
        const title = t(s.nameKey);
        const transformed = s.transform(input);
        return `${title}:\n${transformed}\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(allText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  }, [filteredStyles, input, t]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleSample = useCallback(() => {
    setInput(t('sampleText'));
  }, [t]);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO SECTION */}
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        {/* INPUT & CONTROL PANEL */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            marginTop: 'var(--space-6)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header with Counters */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <label
              htmlFor="fancy-text-input"
              style={{
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={18} style={{ color: '#3b82f6' }} />
              {t('inputLabel')}
            </label>

            {/* Character & Word Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {charCount} {t('characterCount')}
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {wordCount} {t('wordCount')}
              </span>
            </div>
          </div>

          {/* Text Input Area */}
          <textarea
            id="fancy-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder={t('inputPlaceholder')}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              padding: '14px 16px',
              fontSize: '1.05rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
          />

          {/* INTERACTIVE SYMBOL PALETTE (Click-to-Insert) */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px dashed var(--border-color)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{t('symbolsTitle')}</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {SYMBOL_CATEGORIES.flatMap((c) => c.symbols).map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSymbol(sym)}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Insert ${sym}`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '16px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSample}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <RotateCcw size={14} />
                {t('sampleText')}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {t('clear')}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: allCopied ? '#059669' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
            >
              {allCopied ? <Check size={16} /> : <Copy size={16} />}
              {allCopied ? t('allCopied') : t('copyAll')}
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS & SEARCH BAR */}
        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'all' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'all' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                color: activeCategory === 'all' ? '#3b82f6' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={14} />
              {t('categoryAll')}
            </button>

            {/* Top 21 Styles (Addresses '21 font style copy paste') */}
            <button
              type="button"
              onClick={() => setActiveCategory('popular21')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'popular21'
                    ? '1px solid #f59e0b'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'popular21' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                color: activeCategory === 'popular21' ? '#f59e0b' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <Star size={14} />
              {t('categoryPopular21')}
            </button>

            {/* Calligraphy Category (Addresses 'Calligraphy font generator') */}
            <button
              type="button"
              onClick={() => setActiveCategory('calligraphy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'calligraphy'
                    ? '1px solid #a855f7'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'calligraphy' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-card)',
                color: activeCategory === 'calligraphy' ? '#c084fc' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <PenTool size={14} />
              {t('categoryCalligraphy')}
            </button>

            {/* Blue & Color Category (Addresses 'Fancy text generator Blue colour') */}
            <button
              type="button"
              onClick={() => setActiveCategory('blue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'blue' ? '1px solid #0284c7' : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'blue' ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card)',
                color: activeCategory === 'blue' ? '#0284c7' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <Palette size={14} />
              {t('categoryBlue')}
            </button>

            {/* Badges / Blue Tick (Addresses 'Fancy text generator blue tick') */}
            <button
              type="button"
              onClick={() => setActiveCategory('badges')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'badges'
                    ? '1px solid #0ea5e9'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'badges' ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-card)',
                color: activeCategory === 'badges' ? '#0ea5e9' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={14} />
              {t('categoryBlueTick')}
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => setActiveCategory('whatsapp')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'whatsapp'
                    ? '1px solid #10b981'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'whatsapp' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                color: activeCategory === 'whatsapp' ? '#10b981' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <MessageSquare size={14} />
              {t('categoryWhatsApp')}
            </button>

            {/* Gaming */}
            <button
              type="button"
              onClick={() => setActiveCategory('gaming')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'gaming'
                    ? '1px solid #8b5cf6'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'gaming' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
                color: activeCategory === 'gaming' ? '#8b5cf6' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <Gamepad2 size={14} />
              {t('categoryGaming')}
            </button>

            {/* Aesthetic */}
            <button
              type="button"
              onClick={() => setActiveCategory('aesthetic')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '24px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  activeCategory === 'aesthetic'
                    ? '1px solid #ec4899'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  activeCategory === 'aesthetic' ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-card)',
                color: activeCategory === 'aesthetic' ? '#ec4899' : 'var(--text-main)',
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={14} />
              {t('categoryAesthetic')}
            </button>
          </div>

          {/* Real-time Style Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchStyles')}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '9px 12px 9px 34px',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* FONT STYLES LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredStyles.map((style) => {
            const transformed = input ? style.transform(input) : '';
            const isCopied = copiedId === style.id;
            const styleTitle = t(style.nameKey);

            return (
              <div
                key={style.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: isCopied ? '1px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  transition: 'border-color 0.2s ease, transform 0.15s ease',
                }}
              >
                {/* Left: Style Name & Transformed Output */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {styleTitle}
                    </span>
                    {style.badge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '1px 7px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {style.badge}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '1.15rem',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      userSelect: 'all',
                    }}
                  >
                    {transformed || (
                      <span
                        style={{
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                          fontSize: '0.95rem',
                        }}
                      >
                        {t('inputPlaceholder')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Copy + WhatsApp Direct Share) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {/* WhatsApp Direct Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(transformed)}
                    disabled={!transformed}
                    title={t('shareWhatsApp')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: transformed ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Share2 size={15} />
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(style.id, transformed)}
                    disabled={!transformed}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: isCopied ? '#059669' : 'rgba(37, 99, 235, 0.1)',
                      color: isCopied ? '#ffffff' : '#2563eb',
                      border: isCopied ? '1px solid #059669' : '1px solid rgba(37, 99, 235, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: transformed ? 'pointer' : 'not-allowed',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? t('copied') : t('copy')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* TECHNICAL SEO SECTION */}
        <ToolSeoContent
          toolSlug="fancy-text-generator"
          toolName={t('title')}
          description={t('subtitle')}
          customAbout={t('aboutText')}
          customFeatures={[t('feature1'), t('feature2'), t('feature3'), t('feature4')]}
          customSteps={[
            { title: t('step1Title'), body: t('step1Body') },
            { title: t('step2Title'), body: t('step2Body') },
            { title: t('step3Title'), body: t('step3Body') },
          ]}
          customFaqs={[
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
