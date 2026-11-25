'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Search, Copy, Check, Heart, Clock, Trash2, X, Smile, Zap, Type } from 'lucide-react';
import { EMOJIS, EMOJI_CATEGORIES, EmojiItem } from '@/data/emojis';

const RECENT_STORAGE_KEY = 'velnox_emoji_recent_v1';
const FAVORITES_STORAGE_KEY = 'velnox_emoji_favorites_v1';
const COUNTRY_FLAG_REGEX = /[\u{1F1E6}-\u{1F1FF}]{2}/u;

function getTwemojiUrl(emoji: string): string {
  const code = Array.from(emoji)
    .map((c) => c.codePointAt(0)!.toString(16))
    .filter((c) => c !== 'fe0f')
    .join('-');
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;
}

function EmojiGlyph({
  emoji,
  category,
  size = 32,
}: {
  emoji: string;
  category?: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const isFlag = category === 'flags' || COUNTRY_FLAG_REGEX.test(emoji);

  if (isFlag && !hasError) {
    const url = getTwemojiUrl(emoji);
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={url}
        alt={emoji}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          userSelect: 'none',
        }}
      />
    );
  }

  let computedSize = size;
  if (emoji.length > 8) {
    computedSize = Math.min(size, 14);
  } else if (emoji.length > 4) {
    computedSize = Math.min(size, 18);
  } else if (emoji.length > 2) {
    computedSize = Math.min(size, 22);
  }

  return (
    <span
      style={{
        fontSize: `${computedSize}px`,
        lineHeight: 1.2,
        display: 'inline-block',
        userSelect: 'none',
        textAlign: 'center',
        wordBreak: 'break-word',
      }}
    >
      {emoji}
    </span>
  );
}

function getFallbackEmojiItem(char: string, name: string): EmojiItem {
  return {
    emoji: char,
    name,
    category: 'smileys',
    keywords: [],
  };
}

const QUICK_PICK_EMOJIS = ['😂', '❤️', '🔥', '✨', '𓆉', '🥺', '💀', '🎉', '🌷', '🥰'];
const REPEAT_PRESETS = [100, 500, 1000, 5000, 10000];

export default function EmojiCopyPage() {
  const t = useTranslations('ToolUI.emojiCopy');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deck, setDeck] = useState<string>('');
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedDeck, setCopiedDeck] = useState<boolean>(false);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [toast, setToast] = useState<{ emoji: string; name: string } | null>(null);

  // 10,000 Repeater State
  const [repeaterEmoji, setRepeaterEmoji] = useState('😂');
  const [repeatCount, setRepeatCount] = useState<number>(10000);
  const [separator, setSeparator] = useState<'none' | 'space' | 'newline'>('none');
  const [copiedRepeater, setCopiedRepeater] = useState(false);

  // AI Text Decorator State
  const [decoratorInput, setDecoratorInput] = useState('');
  const [copiedDecoratorIdx, setCopiedDecoratorIdx] = useState<number | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem(RECENT_STORAGE_KEY);
      if (savedRecent) {
        setRecent(JSON.parse(savedRecent));
      }
      const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch {
      // Ignore localStorage errors in SSR or private mode
    }
  }, []);

  // Quick lookup map for emojis by character
  const emojiMap = useMemo(() => {
    const map = new Map<string, EmojiItem>();
    for (const item of EMOJIS) {
      map.set(item.emoji, item);
    }
    return map;
  }, []);

  // Filtered emojis
  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Search query takes priority
    if (query) {
      return EMOJIS.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.emoji === query ||
          item.keywords.some((kw) => kw.toLowerCase().includes(query))
      );
    }

    if (selectedCategory === 'all') {
      return EMOJIS;
    }

    if (selectedCategory === 'recent') {
      return recent
        .map((char) => emojiMap.get(char) || getFallbackEmojiItem(char, 'Recent Emoji'))
        .filter(Boolean);
    }

    if (selectedCategory === 'favorites') {
      return favorites
        .map((char) => emojiMap.get(char) || getFallbackEmojiItem(char, 'Favorite Emoji'))
        .filter(Boolean);
    }

    return EMOJIS.filter((item) => item.category === selectedCategory);
  }, [searchQuery, selectedCategory, recent, favorites, emojiMap]);

  // Copy single emoji to clipboard & add to deck & recents
  const handleCopyEmoji = useCallback(async (item: EmojiItem) => {
    try {
      await navigator.clipboard.writeText(item.emoji);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = item.emoji;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setDeck((prev) => prev + item.emoji);
    setCopiedEmoji(item.emoji);
    setTimeout(() => setCopiedEmoji(null), 1200);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ emoji: item.emoji, name: item.name });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2000);

    setRecent((prev) => {
      const next = [item.emoji, ...prev.filter((e) => e !== item.emoji)].slice(0, 24);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(emoji);
      const next = isFav ? prev.filter((e) => e !== emoji) : [...prev, emoji];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Copy accumulated deck
  const handleCopyDeck = useCallback(async () => {
    if (!deck) return;
    try {
      await navigator.clipboard.writeText(deck);
      setCopiedDeck(true);
      setTimeout(() => setCopiedDeck(false), 2000);
    } catch {
      // fallback
    }
  }, [deck]);

  // Clear deck
  const handleClearDeck = useCallback(() => {
    setDeck('');
  }, []);

  // Transfer deck to repeater
  const handleSendDeckToRepeater = useCallback(() => {
    if (!deck) return;
    setRepeaterEmoji(deck);
    setSelectedCategory('repeater');
  }, [deck]);

  // Clear recents
  const handleClearRecent = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Split deck into graphemes so each emoji renders cleanly
  const deckSegments = useMemo(() => {
    if (!deck) return [];
    const IntlWithSegmenter = Intl as unknown as {
      Segmenter?: new (
        locale: string,
        options: { granularity: 'grapheme' }
      ) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    };
    if (typeof Intl !== 'undefined' && IntlWithSegmenter.Segmenter) {
      const segmenter = new IntlWithSegmenter.Segmenter('en', { granularity: 'grapheme' });
      return [...segmenter.segment(deck)].map((s) => s.segment);
    }
    return Array.from(deck);
  }, [deck]);

  // Generate 10,000 Repeater String
  const generatedRepeaterText = useMemo(() => {
    const char = repeaterEmoji.trim() || '😂';
    const sep = separator === 'space' ? ' ' : separator === 'newline' ? '\n' : '';
    const safeCount = Math.min(Math.max(repeatCount, 1), 10000);
    return Array(safeCount).fill(char).join(sep);
  }, [repeaterEmoji, repeatCount, separator]);

  // Copy Repeater
  const handleCopyRepeater = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedRepeaterText);
      setCopiedRepeater(true);
      setTimeout(() => setCopiedRepeater(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generatedRepeaterText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedRepeater(true);
      setTimeout(() => setCopiedRepeater(false), 2000);
    }
  }, [generatedRepeaterText]);

  // AI Text Decorator Styles
  const decoratorStyles = useMemo(() => {
    const text = decoratorInput.trim() || 'Aesthetic';
    return [
      { label: 'Sparkle Stars', value: `✨ ${text} ✨` },
      { label: 'Winged Heart', value: `𓆩♡𓆪 ${text} 𓆩♡𓆪` },
      { label: 'Coquette Bow', value: `୨୧ ${text} ୨୧` },
      { label: 'Aesthetic Stars', value: `⋆｡°✩ ${text} ⋆｡°✩` },
      { label: 'Winged Cross', value: `𓆩♰𓆪 ${text} 𓆩♰𓆪` },
      { label: 'Kaomoji Hug', value: `⸜(｡˃ ᵕ ˂ )⸝♡ ${text} ♡` },
    ];
  }, [decoratorInput]);

  const handleCopyDecorator = useCallback(async (val: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedDecoratorIdx(idx);
      setTimeout(() => setCopiedDecoratorIdx(null), 1500);
    } catch {
      // fallback
    }
  }, []);

  const isWideCategory = selectedCategory === 'kaomoji' || selectedCategory === 'combos';

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          toolSlug="emoji-copy"
          title={t('title')}
          subtitle={t('subtitle')}
          align="center"
        />

        {/* EMOJI DECK / ACCUMULATOR BAR */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smile size={18} style={{ color: '#3b82f6' }} />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t('deckTitle')}
              </span>
            </div>
            {deck && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                {deckSegments.length} {t('totalEmojis')}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: '240px',
                minHeight: '48px',
                padding: '8px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {deckSegments.length > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {deckSegments.map((segment, idx) => (
                    <EmojiGlyph key={`deck-${idx}-${segment}`} emoji={segment} size={28} />
                  ))}
                </div>
              ) : (
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    letterSpacing: 'normal',
                  }}
                >
                  {t('deckPlaceholder')}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyDeck}
                disabled={!deck}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: copiedDeck ? '#10b981' : '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: deck ? 'pointer' : 'not-allowed',
                  opacity: deck ? 1 : 0.5,
                  transition: 'background-color 0.2s ease, transform 0.1s ease',
                }}
              >
                {copiedDeck ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedDeck ? t('copiedDeck') : t('copyDeck')}</span>
              </button>

              {deck && (
                <>
                  <button
                    type="button"
                    onClick={handleSendDeckToRepeater}
                    title={t('repeatInGenerator')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(234, 179, 8, 0.15)',
                      color: '#ca8a04',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Zap size={15} />
                    <span>{t('repeatInGenerator')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearDeck}
                    title={t('clearDeck')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* STICKY SEARCH & CATEGORY BAR */}
        <div
          style={{
            position: 'sticky',
            top: '72px',
            zIndex: 30,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                width: '100%',
                padding: '12px 42px 12px 42px',
                fontSize: '0.95rem',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills (Horizontal Scroll) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {EMOJI_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id && !searchQuery;
              const count =
                cat.id === 'recent'
                  ? recent.length
                  : cat.id === 'favorites'
                    ? favorites.length
                    : null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? '#3b82f6' : 'rgba(0, 0, 0, 0.02)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{t(cat.labelKey)}</span>
                  {count !== null && count > 0 && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'rgba(59, 130, 246, 0.12)',
                        color: isActive ? '#ffffff' : '#3b82f6',
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10,000 EMOJI REPEATER / MULTIPLIER (ACTIVE WHEN SELECTED OR FEATURED) */}
        {selectedCategory === 'repeater' && (
          <div
            style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                }}
              >
                <Zap size={20} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {t('repeaterTitle')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('repeaterSubtitle')}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              {/* Emoji Input & Quick Pick */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {t('repeaterEmojiLabel')}
                </label>
                <input
                  type="text"
                  value={repeaterEmoji}
                  onChange={(e) => setRepeaterEmoji(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '1.2rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    marginBottom: '10px',
                  }}
                />

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('quickPickTitle')}:
                  </span>
                  {QUICK_PICK_EMOJIS.map((em) => (
                    <button
                      key={`quick-${em}`}
                      type="button"
                      onClick={() => setRepeaterEmoji(em)}
                      style={{
                        background: 'rgba(0, 0, 0, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count & Separator */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {t('repeaterCountLabel')}:{' '}
                  <strong style={{ color: '#3b82f6' }}>{repeatCount}</strong>
                </label>
                <div
                  style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}
                >
                  {REPEAT_PRESETS.map((cnt) => (
                    <button
                      key={`preset-${cnt}`}
                      type="button"
                      onClick={() => setRepeatCount(cnt)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border:
                          repeatCount === cnt
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                        backgroundColor: repeatCount === cnt ? '#3b82f6' : 'rgba(0, 0, 0, 0.02)',
                        color: repeatCount === cnt ? '#ffffff' : 'var(--text-main)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cnt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '8px',
                  }}
                >
                  {t('repeaterSeparatorLabel')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['none', 'space', 'newline'] as const).map((sep) => (
                    <button
                      key={sep}
                      type="button"
                      onClick={() => setSeparator(sep)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border:
                          separator === sep ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        backgroundColor:
                          separator === sep ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.02)',
                        color: separator === sep ? '#3b82f6' : 'var(--text-main)',
                      }}
                    >
                      {sep === 'none'
                        ? t('sepNone')
                        : sep === 'space'
                          ? t('sepSpace')
                          : t('sepNewline')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Box & Action */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                }}
              >
                <span>{t('repeaterPreviewTitle')}</span>
                <span>
                  {repeatCount.toLocaleString()} {t('totalEmojis')}
                </span>
              </div>
              <div
                style={{
                  maxHeight: '100px',
                  overflowY: 'auto',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}
              >
                {generatedRepeaterText.slice(0, 300)}
                {generatedRepeaterText.length > 300 && '...'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyRepeater}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: copiedRepeater ? '#10b981' : '#3b82f6',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.1s ease',
              }}
            >
              {copiedRepeater ? <Check size={20} /> : <Copy size={20} />}
              <span>
                {copiedRepeater
                  ? t('copiedRepeater', { count: repeatCount })
                  : t('repeatBtn', { count: repeatCount })}
              </span>
            </button>
          </div>
        )}

        {/* AI TEXT DECORATOR & BIO STYLER */}
        {(selectedCategory === 'combos' || selectedCategory === 'hieroglyphs') && (
          <div
            style={{
              marginBottom: '28px',
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Type size={18} style={{ color: '#8b5cf6' }} />
              <h4
                style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}
              >
                {t('textDecoratorTitle')}
              </h4>
            </div>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {t('textDecoratorSubtitle')}
            </p>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                value={decoratorInput}
                onChange={(e) => setDecoratorInput(e.target.value)}
                placeholder={t('textDecoratorPlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.95rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px',
              }}
            >
              {decoratorStyles.map((item, idx) => {
                const isCopied = copiedDecoratorIdx === idx;
                return (
                  <div
                    key={`dec-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}
                    >
                      {item.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyDecorator(item.value, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isCopied ? '#10b981' : '#3b82f6',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? t('copiedText') : t('copyText')}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMOJI GRID & LIST */}
        <div style={{ minHeight: '360px' }}>
          {/* Quick Recents Section (when on "all" and recents exist without active search) */}
          {selectedCategory === 'all' && !searchQuery && recent.length > 0 && (
            <div
              style={{
                marginBottom: '28px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: '#3b82f6' }} />
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                    }}
                  >
                    {t('categoryRecent')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={12} />
                  <span>{t('clearRecent')}</span>
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
                  gap: '10px',
                }}
              >
                {recent.map((char) => {
                  const item = emojiMap.get(char) || getFallbackEmojiItem(char, 'Emoji');
                  const isFav = favorites.includes(char);
                  const isJustCopied = copiedEmoji === char;

                  return (
                    <div
                      key={`recent-${char}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCopyEmoji(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCopyEmoji(item);
                        }
                      }}
                      aria-label={char}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isJustCopied
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(0, 0, 0, 0.02)',
                        border: isJustCopied
                          ? '1px solid #10b981'
                          : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'transform 0.15s ease, background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <EmojiGlyph emoji={char} size={30} />
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(char, e)}
                        aria-label={t('categoryFavorites')}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'none',
                          border: 'none',
                          padding: '2px',
                          cursor: 'pointer',
                          opacity: isFav ? 1 : 0.3,
                          color: isFav ? '#ef4444' : 'var(--text-muted)',
                        }}
                      >
                        <Heart size={12} fill={isFav ? '#ef4444' : 'none'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Emoji Grid */}
          {filteredEmojis.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              <Smile size={42} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p
                style={{
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginBottom: '6px',
                }}
              >
                {searchQuery
                  ? `${t('noResults')} "${searchQuery}"`
                  : selectedCategory === 'favorites'
                    ? t('noFavorites')
                    : t('noRecent')}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isWideCategory
                  ? 'repeat(auto-fill, minmax(130px, 1fr))'
                  : 'repeat(auto-fill, minmax(68px, 1fr))',
                gap: '10px',
              }}
            >
              {filteredEmojis.map((item) => {
                const isFav = favorites.includes(item.emoji);
                const isJustCopied = copiedEmoji === item.emoji;

                return (
                  <div
                    key={`${item.category}-${item.emoji}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCopyEmoji(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCopyEmoji(item);
                      }
                    }}
                    aria-label={item.name || item.emoji}
                    title={item.name}
                    style={{
                      position: 'relative',
                      minHeight: isWideCategory ? '64px' : undefined,
                      aspectRatio: isWideCategory ? undefined : '1',
                      padding: isWideCategory ? '8px 12px' : '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isJustCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                      border: isJustCopied ? '1px solid #10b981' : '1px solid var(--border-color)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                      transition:
                        'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.02)';
                    }}
                  >
                    <EmojiGlyph emoji={item.emoji} category={item.category} size={32} />

                    {/* Optional small label for wide categories */}
                    {isWideCategory && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {item.name}
                      </span>
                    )}

                    {/* Favorite Heart Pin */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(item.emoji, e)}
                      aria-label={t('categoryFavorites')}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'none',
                        border: 'none',
                        padding: '2px',
                        cursor: 'pointer',
                        opacity: isFav ? 1 : 0.25,
                        color: isFav ? '#ef4444' : 'var(--text-muted)',
                        transition: 'opacity 0.15s ease, transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Heart size={12} fill={isFav ? '#ef4444' : 'none'} />
                    </button>

                    {/* Copied Flash Badge */}
                    {isJustCopied && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#10b981',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {t('copiedBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FLOATING TOAST NOTIFICATION */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '12px 22px',
              borderRadius: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 999,
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <EmojiGlyph emoji={toast.emoji} size={24} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toast.name}</span>
              <span
                style={{
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.85rem',
                }}
              >
                <Check size={14} />
                {t('toastCopied')}
              </span>
            </div>
          </div>
        )}

        {/* TECHNICAL SEO SECTION */}
        <ToolSeoContent
          toolSlug="emoji-copy"
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
            { q: t('faq5Q'), a: t('faq5A') },
            { q: t('faq6Q'), a: t('faq6A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
