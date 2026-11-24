'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Copy,
  Check,
  Heart,
  ArrowRightLeft,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Home,
  Users,
  Briefcase,
  Bookmark,
} from 'lucide-react';

export type CategoryFilter = 'all' | 'couple' | 'baby' | 'house' | 'friends' | 'business';

export interface NameVariation {
  id: string;
  name: string;
  category: 'couple' | 'baby' | 'house' | 'friends' | 'business';
  labelKey?: string;
  tag?: string;
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function generateCombinations(names: string[]): NameVariation[] {
  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  if (cleaned.length < 2) return [];

  const results: NameVariation[] = [];
  const seen = new Set<string>();

  const add = (
    category: 'couple' | 'baby' | 'house' | 'friends' | 'business',
    name: string,
    tag?: string
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      results.push({
        id: `${category}-${lower}-${results.length}`,
        name: trimmed,
        category,
        tag,
      });
    }
  };

  const [A, B, C, D] = cleaned;
  const aCap = capitalize(A);
  const bCap = capitalize(B);
  const aLow = A.toLowerCase();
  const bLow = B.toLowerCase();

  // 1. TWO NAMES BLENDING
  if (cleaned.length === 2) {
    const aHalf = capitalize(A.slice(0, Math.ceil(A.length / 2)));
    const bHalf = B.slice(Math.floor(B.length / 2)).toLowerCase();
    const bHalfCap = capitalize(B.slice(0, Math.ceil(B.length / 2)));
    const aHalfRest = A.slice(Math.floor(A.length / 2)).toLowerCase();

    const blendAB = aHalf + bHalf;
    const blendBA = bHalfCap + aHalfRest;

    // Slices (first 2 / 3 letters)
    const a2 = capitalize(A.slice(0, 2));
    const b2 = B.slice(2).toLowerCase();
    const b2Cap = capitalize(B.slice(0, 2));
    const a2Rest = A.slice(2).toLowerCase();
    const blend2A = a2 + b2;
    const blend2B = b2Cap + a2Rest;

    const a3 = capitalize(A.slice(0, 3));
    const b3 = B.slice(-3).toLowerCase();
    const blend3 = a3 + b3;

    const b3Cap = capitalize(B.slice(0, 3));
    const a3Rest = A.slice(-3).toLowerCase();
    const blend3Rev = b3Cap + a3Rest;

    // Core blends
    const coreBlends = [blendAB, blendBA, blend2A, blend2B, blend3, blend3Rev].filter(Boolean);

    // Couple & Marriage Mode
    coreBlends.forEach((b) => add('couple', b, 'Ship Name'));
    add('couple', `#${aCap}${bCap}`, 'Wedding Hashtag');
    add('couple', `#${bCap}${aCap}`, 'Wedding Hashtag');
    add('couple', `#${blendAB}Wedding`, 'Wedding Hashtag');
    add('couple', `#Forever${aCap}${bCap}`, 'Wedding Hashtag');
    add('couple', `#When${aCap}Met${bCap}`, 'Wedding Hashtag');
    add('couple', `${aCap} & ${bCap}`, 'Couple Duo');

    // Baby Names Mode (Melodic & Soft)
    coreBlends.forEach((b) => {
      add('baby', b, 'Baby Name');
      if (!b.endsWith('a') && !b.endsWith('e') && !b.endsWith('y')) {
        add('baby', `${b}a`, 'Baby Girl');
        add('baby', `${b}ie`, 'Cute Baby');
      }
    });
    // Vowel-consonant harmonization
    const vowelsA = aLow
      .split('')
      .filter((c) => 'aeiou'.includes(c))
      .join('');
    const consB = bLow
      .split('')
      .filter((c) => !'aeiou'.includes(c))
      .join('');
    if (vowelsA || consB) {
      add('baby', capitalize(vowelsA + consB), 'Harmonized');
    }

    // House & Villa Names
    coreBlends.forEach((b) => {
      add('house', `${b} Villa`, 'Villa');
      add('house', `${b} Niwas`, 'Niwas');
      add('house', `${b} Cottage`, 'Cottage');
      add('house', `${b} Residency`, 'Residency');
      add('house', `${b} Bhavan`, 'Bhavan');
      add('house', `${b} Haven`, 'Estate');
    });
    add('house', `${aCap}-${bCap} Haven`, 'Estate');

    // Friends & Squad
    coreBlends.forEach((b) => {
      add('friends', `Team ${b}`, 'Squad');
      add('friends', `The ${b} Duo`, 'BFFs');
      add('friends', `${b} Squad`, 'Group');
    });

    // Brand & Business
    add('business', `${aCap}${bCap}`, 'PascalCase');
    add('business', `${aLow}${bCap}`, 'camelCase');
    add('business', `${blendAB} Labs`, 'Brand');
    add('business', `${blendBA} Tech`, 'Startup');
    add('business', `${aLow}_${bLow}`, 'Underscore');
    add('business', `${aLow}-${bLow}`, 'Hyphenated');
  }

  // 2. THREE NAMES BLENDING
  if (cleaned.length === 3) {
    const cCap = capitalize(C);
    const cLow = C.toLowerCase();

    // Syllable slicing for 3 names
    const tri1 = capitalize(A.slice(0, 2) + B.slice(0, 2) + C.slice(0, 2));
    const tri2 = capitalize(A.slice(0, 3) + B.slice(0, 2) + C.slice(-2));
    const tri3 = capitalize(C.slice(0, 2) + B.slice(0, 2) + A.slice(-2));
    const tri4 = capitalize(B.slice(0, 2) + C.slice(0, 2) + A.slice(0, 2));
    const acronym3 = (A[0] + B[0] + C[0]).toUpperCase();

    const triBlends = [tri1, tri2, tri3, tri4].filter(Boolean);

    // Couple & Family Mode
    triBlends.forEach((b) => add('couple', b, 'Trio Blend'));
    add('couple', `#${aCap}${bCap}${cCap}`, 'Family Tag');
    add('couple', `#Team${acronym3}`, 'Hashtag');

    // Baby Names Mode
    triBlends.forEach((b) => add('baby', b, 'Baby Blend'));

    // House & Villa Mode
    triBlends.forEach((b) => {
      add('house', `${b} Villa`, 'Family Villa');
      add('house', `${b} Niwas`, 'Family Niwas');
      add('house', `${b} Bhavan`, 'Estate');
      add('house', `${b} Haven`, 'Home');
    });
    add('house', `${acronym3} Residency`, 'Residency');

    // Friends & Squad Mode
    triBlends.forEach((b) => {
      add('friends', `The ${b} Trio`, 'Trio Squad');
      add('friends', `Team ${b}`, 'Squad');
      add('friends', `${b} 3`, 'Group');
    });
    add('friends', `The ${acronym3} Crew`, 'Acronym');

    // Business & Brand Mode
    add('business', `${acronym3}`, 'Acronym');
    add('business', `${tri1} Group`, 'Corporate');
    add('business', `${tri2} Innovations`, 'Startup');
    add('business', `${aLow}_${bLow}_${cLow}`, 'Underscore');
  }

  // 3. FOUR NAMES BLENDING
  if (cleaned.length === 4) {
    const cCap = capitalize(C);
    const cLow = C.toLowerCase();
    const dCap = capitalize(D);
    const dLow = D.toLowerCase();

    const quad1 = capitalize(A.slice(0, 2) + B.slice(0, 2) + C.slice(0, 2) + D.slice(0, 2));
    const quad2 = capitalize(A.slice(0, 2) + B.slice(-2) + C.slice(0, 2) + D.slice(-2));
    const quad3 = capitalize(D.slice(0, 2) + C.slice(0, 2) + B.slice(0, 2) + A.slice(0, 2));
    const acronym4 = (A[0] + B[0] + C[0] + D[0]).toUpperCase();

    const quadBlends = [quad1, quad2, quad3].filter(Boolean);

    // Couple & Family Mode
    quadBlends.forEach((b) => add('couple', b, 'Family Blend'));
    add('couple', `#${aCap}${bCap}${cCap}${dCap}`, 'Family Tag');

    // Baby Names Mode
    quadBlends.forEach((b) => add('baby', b, 'Composite'));

    // House & Villa Mode
    quadBlends.forEach((b) => {
      add('house', `${b} Villa`, 'Family Villa');
      add('house', `${b} Niwas`, 'Family Niwas');
      add('house', `${b} Estate`, 'Family Estate');
      add('house', `${b} Manor`, 'Manor');
    });
    add('house', `${acronym4} House`, 'Acronym House');

    // Friends & Squad Mode
    quadBlends.forEach((b) => {
      add('friends', `Core 4 ${b}`, 'Squad of 4');
      add('friends', `${b} Squad`, 'Group');
      add('friends', `The ${acronym4} Collective`, 'Crew');
    });

    // Business Mode
    add('business', `${acronym4}`, 'Acronym');
    add('business', `${quad1} Global`, 'Corporate');
    add('business', `${quad2} Partners`, 'Holdings');
    add('business', `${aLow}_${bLow}_${cLow}_${dLow}`, 'Underscore');
  }

  return results;
}

export default function NameCombinerPage() {
  const t = useTranslations('ToolUI.nameCombiner');

  // Multi-name input state (2 to 4 names)
  const [names, setNames] = useState<string[]>(['John', 'Emma']);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velnox-name-combiner-favs');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveFavoritesToStorage = (updated: string[]) => {
    setFavorites(updated);
    try {
      localStorage.setItem('velnox-name-combiner-favs', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleToggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      saveFavoritesToStorage(favorites.filter((f) => f !== name));
    } else {
      saveFavoritesToStorage([...favorites, name]);
    }
  };

  const handleClearFavorites = () => {
    saveFavoritesToStorage([]);
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleAddName = () => {
    if (names.length < 4) {
      setNames([...names, '']);
    }
  };

  const handleRemoveName = (index: number) => {
    if (names.length > 2) {
      const updated = names.filter((_, i) => i !== index);
      setNames(updated);
    }
  };

  const handleSwap = () => {
    if (names.length >= 2) {
      const updated = [...names];
      const temp = updated[0];
      updated[0] = updated[1];
      updated[1] = temp;
      setNames(updated);
    }
  };

  const handleClear = () => {
    setNames(['', '']);
  };

  // Generate combinations
  const allCombinations = useMemo(() => generateCombinations(names), [names]);

  // Filter according to active tab
  const filteredCombinations = useMemo(() => {
    if (activeCategory === 'all') return allCombinations;
    return allCombinations.filter((c) => c.category === activeCategory);
  }, [allCombinations, activeCategory]);

  const handleCopy = useCallback((id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }, []);

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* HERO SECTION */}
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />

        {/* INPUT CARD */}
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
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {t('title')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {names.length === 2 && (
                <button
                  type="button"
                  onClick={handleSwap}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowRightLeft size={14} />
                  {t('swap')}
                </button>
              )}

              <button
                type="button"
                onClick={handleClear}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={14} />
                {t('clear')}
              </button>
            </div>
          </div>

          {/* Dynamic Name Inputs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Name 1 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {t('firstName')}
              </label>
              <input
                type="text"
                value={names[0] || ''}
                onChange={(e) => handleNameChange(0, e.target.value)}
                placeholder={t('firstNamePlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Name 2 */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                {t('secondName')}
              </label>
              <input
                type="text"
                value={names[1] || ''}
                onChange={(e) => handleNameChange(1, e.target.value)}
                placeholder={t('secondPlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Optional Name 3 */}
            {names.length >= 3 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {t('thirdName')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveName(2)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {t('removeName')}
                  </button>
                </div>
                <input
                  type="text"
                  value={names[2] || ''}
                  onChange={(e) => handleNameChange(2, e.target.value)}
                  placeholder={t('thirdPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Optional Name 4 */}
            {names.length >= 4 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
                  >
                    {t('fourthName')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveName(3)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {t('removeName')}
                  </button>
                </div>
                <input
                  type="text"
                  value={names[3] || ''}
                  onChange={(e) => handleNameChange(3, e.target.value)}
                  placeholder={t('fourthPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* Add Name Action Button */}
          {names.length < 4 && (
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleAddName}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563eb',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={15} />
                {t('addName')}
              </button>
            </div>
          )}
        </div>

        {/* CATEGORY TABS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '24px',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
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
            <Layers size={15} />
            {t('tabAll')}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('couple')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeCategory === 'couple' ? '1px solid #ec4899' : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'couple' ? 'rgba(236, 72, 153, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'couple' ? '#ec4899' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Heart size={15} />
            {t('tabCouple')}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('baby')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeCategory === 'baby' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'baby' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'baby' ? '#f59e0b' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            {t('tabBaby')}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('house')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeCategory === 'house' ? '1px solid #10b981' : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'house' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'house' ? '#10b981' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Home size={15} />
            {t('tabHouse')}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('friends')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeCategory === 'friends'
                  ? '1px solid #8b5cf6'
                  : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'friends' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'friends' ? '#8b5cf6' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={15} />
            {t('tabFriends')}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('business')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeCategory === 'business'
                  ? '1px solid #0284c7'
                  : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'business' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'business' ? '#0284c7' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Briefcase size={15} />
            {t('tabBusiness')}
          </button>
        </div>

        {/* RESULTS GRID */}
        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('combinedVariations', { count: filteredCombinations.length })}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {filteredCombinations.map((item) => {
              const isCopied = copiedId === item.id;
              const isFav = favorites.includes(item.name);

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: isCopied ? '1px solid #10b981' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                      }}
                    >
                      {item.tag && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '1px 8px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        wordBreak: 'break-word',
                        userSelect: 'all',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(item.name)}
                      aria-label={t('saveFavorite')}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        color: isFav ? '#ef4444' : 'var(--text-muted)',
                        backgroundColor: isFav ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: isCopied ? '#059669' : 'rgba(37, 99, 235, 0.1)',
                        color: isCopied ? '#ffffff' : '#2563eb',
                        border: isCopied
                          ? '1px solid #059669'
                          : '1px solid rgba(37, 99, 235, 0.25)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? t('copied') : t('copy')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAVORITES DRAWER */}
        {favorites.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={18} style={{ color: '#ec4899' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('yourFavorites', { count: favorites.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearFavorites}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {t('clearFavorites')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {favorites.map((fav, i) => (
                <div
                  key={`fav-${i}`}
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{fav}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(fav)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL SEO SECTION */}
        <ToolSeoContent
          toolSlug="name-combiner"
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
