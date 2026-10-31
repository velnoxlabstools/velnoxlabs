'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Copy, Check, Trash2, Type, Sparkles } from 'lucide-react';

interface StyleDefinition {
  id: string;
  nameKey: string;
  transform: (text: string) => string;
}

// Unicode transform helpers
function transformMath(
  text: string,
  upperBase: number,
  lowerBase: number,
  numBase?: number,
  specialMap: Record<number, number> = {}
): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0) || 0;
      if (specialMap[code]) return String.fromCodePoint(specialMap[code]);
      if (code >= 65 && code <= 90) return String.fromCodePoint(upperBase + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(lowerBase + (code - 97));
      if (numBase !== undefined && code >= 48 && code <= 57) {
        return String.fromCodePoint(numBase + (code - 48));
      }
      return char;
    })
    .join('');
}

const smallCapsMap: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ',
  j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
  s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

const upsideDownMap: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
  J: 'ſ', K: '⋊', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ò', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ',
  '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", "'": ',', '"': ',,',
  '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
};

const STYLES: StyleDefinition[] = [
  {
    id: 'bold',
    nameKey: 'styleBold',
    transform: (t) => transformMath(t, 0x1d400, 0x1d41a, 0x1d7ce),
  },
  {
    id: 'italic',
    nameKey: 'styleItalic',
    transform: (t) => transformMath(t, 0x1d434, 0x1d44e, undefined, { 104: 0x210e }), // 'h' -> Planck constant
  },
  {
    id: 'boldItalic',
    nameKey: 'styleBoldItalic',
    transform: (t) => transformMath(t, 0x1d468, 0x1d482),
  },
  {
    id: 'script',
    nameKey: 'styleScript',
    transform: (t) =>
      transformMath(t, 0x1d49c, 0x1d4b6, undefined, {
        66: 0x212c, // B
        69: 0x2130, // E
        70: 0x2131, // F
        72: 0x210b, // H
        73: 0x2110, // I
        76: 0x2112, // L
        77: 0x2133, // M
        82: 0x211b, // R
        101: 0x212f, // e
        103: 0x210a, // g
        111: 0x2134, // o
      }),
  },
  {
    id: 'boldScript',
    nameKey: 'styleBoldScript',
    transform: (t) => transformMath(t, 0x1d4d0, 0x1d4ea),
  },
  {
    id: 'fraktur',
    nameKey: 'styleFraktur',
    transform: (t) =>
      transformMath(t, 0x1d504, 0x1d51e, undefined, {
        67: 0x212d, // C
        72: 0x210c, // H
        73: 0x2111, // I
        82: 0x211c, // R
        90: 0x2128, // Z
      }),
  },
  {
    id: 'boldFraktur',
    nameKey: 'styleBoldFraktur',
    transform: (t) => transformMath(t, 0x1d56c, 0x1d586),
  },
  {
    id: 'doubleStruck',
    nameKey: 'styleDoubleStruck',
    transform: (t) =>
      transformMath(t, 0x1d538, 0x1d552, 0x1d7d8, {
        67: 0x2102, // C
        72: 0x210d, // H
        78: 0x2115, // N
        80: 0x2119, // P
        81: 0x211a, // Q
        82: 0x211d, // R
        90: 0x2124, // Z
      }),
  },
  {
    id: 'sans',
    nameKey: 'styleSans',
    transform: (t) => transformMath(t, 0x1d5d4, 0x1d5ee, 0x1d7ec),
  },
  {
    id: 'monospace',
    nameKey: 'styleMonospace',
    transform: (t) => transformMath(t, 0x1d670, 0x1d68a, 0x1d7f6),
  },
  {
    id: 'circled',
    nameKey: 'styleCircled',
    transform: (t) =>
      Array.from(t)
        .map((char) => {
          const code = char.codePointAt(0) || 0;
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x24b6 + (code - 65));
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x24d0 + (code - 97));
          if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + (code - 49));
          if (code === 48) return '\u24ea';
          return char;
        })
        .join(''),
  },
  {
    id: 'squared',
    nameKey: 'styleSquared',
    transform: (t) =>
      Array.from(t)
        .map((char) => {
          const code = char.codePointAt(0) || 0;
          if (code >= 65 && code <= 90) return String.fromCodePoint(0x1f130 + (code - 65));
          if (code >= 97 && code <= 122) return String.fromCodePoint(0x1f130 + (code - 97));
          return char;
        })
        .join(''),
  },
  {
    id: 'smallCaps',
    nameKey: 'styleSmallCaps',
    transform: (t) =>
      Array.from(t)
        .map((char) => smallCapsMap[char.toLowerCase()] || char)
        .join(''),
  },
  {
    id: 'strikethrough',
    nameKey: 'styleStrikethrough',
    transform: (t) =>
      Array.from(t)
        .map((char) => char + '\u0336')
        .join(''),
  },
  {
    id: 'underline',
    nameKey: 'styleUnderline',
    transform: (t) =>
      Array.from(t)
        .map((char) => char + '\u0332')
        .join(''),
  },
  {
    id: 'inverted',
    nameKey: 'styleInverted',
    transform: (t) =>
      Array.from(t)
        .reverse()
        .map((char) => upsideDownMap[char] || char)
        .join(''),
  },
  {
    id: 'fullwidth',
    nameKey: 'styleFullwidth',
    transform: (t) =>
      Array.from(t)
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code === 32) return '\u3000';
          if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
          return char;
        })
        .join(''),
  },
];

export default function FancyTextGeneratorPage() {
  const tUI = useTranslations('ToolUI.fancyTextGenerator');

  const [input, setInput] = useState<string>('VelnoxLabs Fancy Text');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const characterCount = useMemo(() => Array.from(input).length, [input]);
  const wordCount = useMemo(() => (input.trim() ? input.trim().split(/\s+/).length : 0), [input]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <GlobalContainer>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* Input Card */}
        <div
          style={{
            marginTop: '24px',
            padding: '24px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Type size={16} color="var(--accent)" />
              {tUI('inputLabel')}
            </label>

            {input && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                <Trash2 size={14} />
                {tUI('clear')}
              </button>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tUI('inputPlaceholder')}
            rows={3}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-page)',
              color: 'var(--text-main)',
              fontSize: '1.05rem',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              fontSize: '0.8rem',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>
                {tUI('characterCount')}: <strong style={{ color: 'var(--text-main)' }}>{characterCount}</strong>
              </span>
              <span>
                {tUI('wordCount')}: <strong style={{ color: 'var(--text-main)' }}>{wordCount}</strong>
              </span>
            </div>
            <span style={{ fontStyle: 'italic' }}>
              <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Unicode 15.1
            </span>
          </div>
        </div>

        {/* Generated Styles Grid */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STYLES.map((style) => {
            const transformed = input ? style.transform(input) : '';
            const isCopied = copiedId === style.id;

            return (
              <div
                key={style.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  gap: '16px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tUI(style.nameKey)}
                  </div>
                  <div
                    style={{
                      fontSize: '1.15rem',
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.5',
                      fontFamily: style.id === 'monospace' ? 'monospace' : 'inherit',
                    }}
                  >
                    {transformed || (
                      <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        {tUI('inputPlaceholder')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!input}
                  onClick={() => handleCopy(style.id, transformed)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: isCopied ? '#10b981' : 'var(--bg-page)',
                    color: isCopied ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: input ? 'pointer' : 'not-allowed',
                    opacity: input ? 1 : 0.4,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCopied ? (
                    <>
                      <Check size={15} />
                      {tUI('copied')}
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      {tUI('copy')}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <ToolSeoContent
          toolSlug="fancy-text-generator"
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
