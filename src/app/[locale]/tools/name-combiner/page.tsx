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
  Download,
  Baby,
  Hash,
  SlidersHorizontal,
  Search,
  MessageCircle,
} from 'lucide-react';

export type CategoryFilter =
  'all' | 'couple' | 'baby' | 'house' | 'social' | 'friends' | 'business';
export type BabyGenderFilter = 'all' | 'boy' | 'girl' | 'unisex';
export type SortOption = 'melodic' | 'shortest' | 'longest' | 'alphabetical';

export interface NameVariation {
  id: string;
  name: string;
  category: 'couple' | 'baby' | 'house' | 'social' | 'friends' | 'business';
  gender?: 'boy' | 'girl' | 'unisex';
  tag?: string;
  melodicScore: number;
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Calculate Melodic Flow / Pronounceability Score (82 - 99%)
function calculateMelodicScore(name: string): number {
  const clean = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (clean.length < 3) return 85;

  let score = 88;
  const vowels = (clean.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowels / clean.length;

  // Harmonious vowel-to-consonant ratio
  if (vowelRatio >= 0.35 && vowelRatio <= 0.65) {
    score += 5;
  } else if (vowelRatio < 0.2 || vowelRatio > 0.8) {
    score -= 4;
  }

  // Penalize harsh triple consecutive consonants (e.g., 'rpr', 'jhm')
  if (/[bcdfghjklmnpqrstvwxyz]{3,}/.test(clean)) {
    score -= 6;
  }

  // Bonus for melodious endings
  if (/(a|ia|an|el|en|ie|ya|ah|ina|lyn|or|is)$/.test(clean)) {
    score += 4;
  }

  // Gentle cap between 82 and 99%
  return Math.max(82, Math.min(99, score));
}

// Extract syllables and phonetic boundaries
function splitSyllables(word: string): string[] {
  const clean = word.toLowerCase();
  if (clean.length <= 3) return [clean];

  // Basic syllable heuristic based on vowel clusters
  const parts: string[] = [];
  let current = '';
  for (let i = 0; i < clean.length; i++) {
    current += clean[i];
    const isVowel = /[aeiouy]/.test(clean[i]);
    const nextIsConsonant = i + 1 < clean.length && !/[aeiouy]/.test(clean[i + 1]);
    const nextNextIsVowel = i + 2 < clean.length && /[aeiouy]/.test(clean[i + 2]);

    if (isVowel && nextIsConsonant && nextNextIsVowel && current.length >= 2) {
      parts.push(current);
      current = '';
    }
  }
  if (current) parts.push(current);
  return parts.length > 0 ? parts : [clean];
}

function generateCombinations(names: string[]): NameVariation[] {
  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  if (cleaned.length < 2) return [];

  const results: NameVariation[] = [];
  const seen = new Set<string>();

  const add = (
    category: 'couple' | 'baby' | 'house' | 'social' | 'friends' | 'business',
    name: string,
    tag?: string,
    gender?: 'boy' | 'girl' | 'unisex'
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lowerKey = `${category}-${trimmed.toLowerCase()}`;
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      const melodicScore = calculateMelodicScore(trimmed);
      results.push({
        id: `${category}-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${results.length}`,
        name: trimmed,
        category,
        tag,
        gender,
        melodicScore,
      });
    }
  };

  const [A, B, C, D] = cleaned;
  const aCap = capitalize(A);
  const bCap = capitalize(B);
  const aLow = A.toLowerCase();
  const bLow = B.toLowerCase();

  // 1. TWO NAMES ADVANCED BLENDING
  if (cleaned.length === 2) {
    const aSyllables = splitSyllables(A);
    const bSyllables = splitSyllables(B);

    // Dynamic Slices
    const aHeadHalf = A.slice(0, Math.ceil(A.length / 2));
    const bTailHalf = B.slice(Math.floor(B.length / 2));
    const bHeadHalf = B.slice(0, Math.ceil(B.length / 2));
    const aTailHalf = A.slice(Math.floor(A.length / 2));

    const blendAB = capitalize(aHeadHalf + bTailHalf);
    const blendBA = capitalize(bHeadHalf + aTailHalf);

    // Phonetic 2 & 3 prefix/suffix slices
    const a2 = A.slice(0, 2);
    const b2End = B.slice(-2);
    const b2 = B.slice(0, 2);
    const a2End = A.slice(-2);

    const a3 = A.slice(0, 3);
    const b3End = B.slice(-3);
    const b3 = B.slice(0, 3);
    const a3End = A.slice(-3);

    const blend2A = capitalize(a2 + b2End);
    const blend2B = capitalize(b2 + a2End);
    const blend3A = capitalize(a3 + b3End);
    const blend3B = capitalize(b3 + a3End);
    const blend3A2B = capitalize(a3 + bTailHalf);
    const blend3B2A = capitalize(b3 + aTailHalf);

    // Syllable cross-merging
    const syllAB = capitalize(
      (aSyllables[0] || aHeadHalf) + (bSyllables[bSyllables.length - 1] || bTailHalf)
    );
    const syllBA = capitalize(
      (bSyllables[0] || bHeadHalf) + (aSyllables[aSyllables.length - 1] || aTailHalf)
    );

    // Vocalic Bridge smoothing (if ends in consonant and starts in consonant)
    const bridgeA = /[aeiouy]$/.test(aHeadHalf.toLowerCase()) ? aHeadHalf : aHeadHalf + 'a';
    const blendBridged = capitalize(bridgeA + bTailHalf);

    const coreBlends = Array.from(
      new Set([
        blendAB,
        blendBA,
        blend2A,
        blend2B,
        blend3A,
        blend3B,
        blend3A2B,
        blend3B2A,
        syllAB,
        syllBA,
        blendBridged,
      ])
    ).filter((b) => b && b.length >= 3);

    // --- COUPLE & ROMANCE ---
    coreBlends.forEach((b) => add('couple', b, 'Ship Name'));
    add('couple', `${aCap} & ${bCap}`, 'Iconic Duo');
    add('couple', `${bCap} & ${aCap}`, 'Iconic Duo');
    add('couple', `${aCap} x ${bCap}`, 'Couple Pair');

    // --- BABY NAMES (Gender-Categorized & Melodically Filtered) ---
    coreBlends.forEach((b) => {
      // General harmonious baby name
      add('baby', b, 'Melodic Blend', 'unisex');

      // Baby Boy endings (-an, -ar, -it, -av, -en, -on, -el)
      const baseBoy = b.replace(/[aeiouy]+$/, '');
      if (baseBoy.length >= 3) {
        add('baby', `${baseBoy}an`, 'Baby Boy', 'boy');
        add('baby', `${baseBoy}ar`, 'Baby Boy', 'boy');
        add('baby', `${baseBoy}it`, 'Baby Boy', 'boy');
        add('baby', `${baseBoy}en`, 'Baby Boy', 'boy');
        add('baby', `${baseBoy}on`, 'Baby Boy', 'boy');
      }

      // Baby Girl endings (-a, -ia, -i, -ya, -ie, -elle, -ina)
      const baseGirl = b.replace(/[aeiouy]+$/, '');
      if (baseGirl.length >= 3) {
        add('baby', `${baseGirl}a`, 'Baby Girl', 'girl');
        add('baby', `${baseGirl}ia`, 'Baby Girl', 'girl');
        add('baby', `${baseGirl}i`, 'Sweet Girl', 'girl');
        add('baby', `${baseGirl}ya`, 'Baby Girl', 'girl');
        add('baby', `${baseGirl}ina`, 'Baby Girl', 'girl');
        add('baby', `${baseGirl}elle`, 'Baby Girl', 'girl');
      }

      // Unisex endings (-el, -ri, -is, -lee)
      if (baseBoy.length >= 3) {
        add('baby', `${baseBoy}el`, 'Unisex Name', 'unisex');
        add('baby', `${baseBoy}ri`, 'Unisex Name', 'unisex');
        add('baby', `${baseBoy}lee`, 'Unisex Name', 'unisex');
      }
    });

    // --- HOUSE & VILLA & ESTATE ---
    // Traditional Indian/Subcontinent Suffixes
    coreBlends.slice(0, 4).forEach((b) => {
      add('house', `${b} Niwas`, 'Niwas');
      add('house', `${b} Bhavan`, 'Bhavan');
      add('house', `${b} Sadan`, 'Sadan');
      add('house', `${b} Kripa`, 'Kripa');
      add('house', `${b} Ashiyana`, 'Ashiyana');
      add('house', `${b} Kutir`, 'Kutir');
      add('house', `${b} Dham`, 'Dham');
    });

    // Modern / Global Villa Suffixes
    coreBlends.slice(0, 5).forEach((b) => {
      add('house', `${b} Villa`, 'Villa');
      add('house', `${b} Estate`, 'Estate');
      add('house', `${b} Manor`, 'Manor');
      add('house', `${b} Residency`, 'Residency');
      add('house', `${b} Heights`, 'Heights');
      add('house', `${b} Haven`, 'Haven');
      add('house', `${b} Cottage`, 'Cottage');
      add('house', `${b} Retreat`, 'Retreat');
    });
    add('house', `${aCap}-${bCap} Haven`, 'Joint Estate');

    // --- WEDDING HASHTAGS & SOCIAL HANDLES ---
    add('social', `#${aCap}${bCap}Wedding`, 'Wedding Hashtag');
    add('social', `#${bCap}${aCap}Wedding`, 'Wedding Hashtag');
    add('social', `#When${aCap}Met${bCap}`, 'Love Story');
    add('social', `#${aCap}TiesTheKnotWith${bCap}`, 'Wedding Hashtag');
    add('social', `#Forever${blendAB}`, 'Wedding Hashtag');
    add('social', `#The${blendAB}Journey`, 'Wedding Hashtag');
    add('social', `#${aCap}SaidYesTo${bCap}`, 'Engagement Tag');
    add('social', `#TwoBecomeOne${aCap}${bCap}`, 'Wedding Tag');

    // Instagram / TikTok Couple Handles
    add('social', `@${blendAB.toLowerCase()}.diaries`, 'Instagram Bio');
    add('social', `@the.${blendAB.toLowerCase()}.vows`, 'Instagram Bio');
    add('social', `@${aLow}_meets_${bLow}`, 'Instagram Handle');
    add('social', `@${blendAB.toLowerCase()}_official`, 'Couple Handle');
    add('social', `@weare.${blendAB.toLowerCase()}`, 'TikTok Handle');

    // --- FRIENDS & SQUAD ---
    coreBlends.slice(0, 4).forEach((b) => {
      add('friends', `Team ${b}`, 'Squad');
      add('friends', `The ${b} Duo`, 'BFFs');
      add('friends', `${b} Crew`, 'Group');
    });
    add('friends', `${aCap} & ${bCap} Adventures`, 'Best Friends');

    // --- BUSINESS & BRAND ---
    add('business', `${aCap}${bCap}`, 'PascalCase');
    add('business', `${aLow}${bCap}`, 'camelCase');
    add('business', `${blendAB} Labs`, 'Tech Startup');
    add('business', `${blendBA} Studio`, 'Creative Brand');
    add('business', `${blendAB} Innovations`, 'Enterprise');
    add('business', `${blendAB} & Co`, 'Consulting');
    add('business', `${aLow}-${bLow}`, 'Hyphenated');
  }

  // 2. THREE NAMES BLENDING
  if (cleaned.length === 3) {
    const cCap = capitalize(C);
    const cLow = C.toLowerCase();

    const tri1 = capitalize(A.slice(0, 2) + B.slice(0, 2) + C.slice(0, 2));
    const tri2 = capitalize(A.slice(0, 3) + B.slice(0, 2) + C.slice(-2));
    const tri3 = capitalize(C.slice(0, 2) + B.slice(0, 2) + A.slice(-2));
    const tri4 = capitalize(B.slice(0, 2) + C.slice(0, 2) + A.slice(0, 2));
    const acronym3 = (A[0] + B[0] + C[0]).toUpperCase();

    const triBlends = Array.from(new Set([tri1, tri2, tri3, tri4])).filter(Boolean);

    // Couple & Family Mode
    triBlends.forEach((b) => add('couple', b, 'Trio Blend'));
    add('couple', `#${aCap}${bCap}${cCap}`, 'Family Tag');
    add('couple', `${aCap}, ${bCap} & ${cCap}`, 'Family Trio');

    // Baby Names Mode (Composite)
    triBlends.forEach((b) => {
      add('baby', b, 'Baby Trio', 'unisex');
      const baseBoy = b.replace(/[aeiouy]+$/, '');
      if (baseBoy.length >= 3) {
        add('baby', `${baseBoy}an`, 'Boy Name', 'boy');
        add('baby', `${baseBoy}a`, 'Girl Name', 'girl');
      }
    });

    // House & Villa Mode
    triBlends.forEach((b) => {
      add('house', `${b} Niwas`, 'Family Niwas');
      add('house', `${b} Villa`, 'Family Villa');
      add('house', `${b} Bhavan`, 'Family Bhavan');
      add('house', `${b} Sadan`, 'Family Sadan');
      add('house', `${b} Heights`, 'Heights');
      add('house', `${b} Haven`, 'Estate');
    });
    add('house', `${acronym3} Residency`, 'Residency');

    // Social & Hashtags
    add('social', `#The${acronym3}Family`, 'Family Tag');
    add('social', `@the.${acronym3.toLowerCase()}.journey`, 'Social Handle');

    // Friends & Squad Mode
    triBlends.forEach((b) => {
      add('friends', `The ${b} Trio`, 'Trio Squad');
      add('friends', `Team ${b}`, 'Squad');
    });
    add('friends', `The ${acronym3} Crew`, 'Acronym Squad');

    // Business & Brand Mode
    add('business', `${acronym3}`, 'Acronym Brand');
    add('business', `${tri1} Group`, 'Corporate');
    add('business', `${tri2} Labs`, 'Startup');
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

    const quadBlends = Array.from(new Set([quad1, quad2, quad3])).filter(Boolean);

    // Couple & Family Mode
    quadBlends.forEach((b) => add('couple', b, 'Family Blend'));
    add('couple', `#${aCap}${bCap}${cCap}${dCap}`, 'Family Tag');
    add('couple', `${aCap}, ${bCap}, ${cCap} & ${dCap}`, 'Quad Unity');

    // Baby Names Mode
    quadBlends.forEach((b) => add('baby', b, 'Quad Blend', 'unisex'));

    // House & Villa Mode
    quadBlends.forEach((b) => {
      add('house', `${b} Niwas`, 'Family Niwas');
      add('house', `${b} Villa`, 'Family Villa');
      add('house', `${b} Bhavan`, 'Family Bhavan');
      add('house', `${b} Estate`, 'Family Estate');
      add('house', `${b} Manor`, 'Family Manor');
    });
    add('house', `${acronym4} House`, 'Acronym House');

    // Social & Hashtags
    add('social', `#The${acronym4}Family`, 'Family Tag');
    add('social', `@the.${acronym4.toLowerCase()}.squad`, 'Squad Handle');

    // Friends & Squad Mode
    quadBlends.forEach((b) => {
      add('friends', `Core 4 ${b}`, 'Squad of 4');
      add('friends', `${b} Squad`, 'Group');
    });
    add('friends', `The ${acronym4} Collective`, 'Collective');

    // Business Mode
    add('business', `${acronym4}`, 'Acronym Corp');
    add('business', `${quad1} Global`, 'Enterprise');
    add('business', `${quad2} Partners`, 'Holdings');
    add('business', `${aLow}_${bLow}_${cLow}_${dLow}`, 'Underscore');
  }

  return results;
}

export default function NameCombinerPage() {
  const t = useTranslations('ToolUI.nameCombiner');

  // Multi-name input state (2 to 4 names)
  const [names, setNames] = useState<string[]>(['Rahul', 'Priya']);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [babyGender, setBabyGender] = useState<BabyGenderFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('melodic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

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

  const handleApplyPreset = (presetNames: string[]) => {
    setNames(presetNames);
  };

  // Generate combinations
  const allCombinations = useMemo(() => generateCombinations(names), [names]);

  // Filter according to category, baby gender, and search query
  const filteredCombinations = useMemo(() => {
    return allCombinations
      .filter((c) => {
        // Category Filter
        if (activeCategory !== 'all' && c.category !== activeCategory) return false;
        // Baby Gender Sub-Filter
        if (activeCategory === 'baby' && babyGender !== 'all' && c.gender !== babyGender)
          return false;
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return c.name.toLowerCase().includes(q) || (c.tag && c.tag.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'melodic') return b.melodicScore - a.melodicScore;
        if (sortBy === 'shortest') return a.name.length - b.name.length;
        if (sortBy === 'longest') return b.name.length - a.name.length;
        if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [allCombinations, activeCategory, babyGender, searchQuery, sortBy]);

  const handleCopy = useCallback((id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }, []);

  const handleCopyAll = () => {
    if (filteredCombinations.length === 0) return;
    const textToCopy = filteredCombinations.map((c) => c.name).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (filteredCombinations.length === 0) return;
    const content =
      `AI Name Combiner Results (${names.filter(Boolean).join(' + ')})\n` +
      `Category: ${activeCategory.toUpperCase()}\n\n` +
      filteredCombinations
        .map((c, i) => `${i + 1}. ${c.name} [${c.tag || c.category}] (Flow: ${c.melodicScore}%)`)
        .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `name-combiner-${names.filter(Boolean).join('-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (filteredCombinations.length === 0) return;
    const header = 'Name,Category,Tag,MelodicScore\n';
    const rows = filteredCombinations
      .map(
        (c) => `"${c.name.replace(/"/g, '""')}","${c.category}","${c.tag || ''}",${c.melodicScore}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `name-combiner-${names.filter(Boolean).join('-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = (items: string[]) => {
    if (items.length === 0) return;
    const title = `✨ Name Combiner Ideas for ${names.filter(Boolean).join(' + ')}:\n\n`;
    const body = items
      .slice(0, 10)
      .map((n, i) => `${i + 1}. ${n}`)
      .join('\n');
    const footer =
      '\n\nCreated on VelnoxLabs AI Name Combiner: https://www.velnoxlabs.com/tools/name-combiner';
    const text = encodeURIComponent(title + body + footer);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

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
              <Sparkles size={18} style={{ color: '#ec4899' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {t('title')}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(236, 72, 153, 0.12)',
                  color: '#ec4899',
                  borderRadius: '12px',
                  padding: '2px 8px',
                }}
              >
                AI Phonetic Engine
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

          {/* Quick Presets for Instant Testing */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Quick Presets:
            </span>
            {[
              { label: 'Rahul + Priya', val: ['Rahul', 'Priya'] },
              { label: 'Liam + Emma', val: ['Liam', 'Emma'] },
              { label: 'Oliver + Sophia', val: ['Oliver', 'Sophia'] },
              { label: 'Family Trio (3 Names)', val: ['Arun', 'Sneha', 'Kabir'] },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.val)}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '3px 10px',
                  fontSize: '0.76rem',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
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
            <Baby size={15} />
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
            onClick={() => setActiveCategory('social')}
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
                activeCategory === 'social' ? '1px solid #06b6d4' : '1px solid var(--border-color)',
              backgroundColor:
                activeCategory === 'social' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-card)',
              color: activeCategory === 'social' ? '#06b6d4' : 'var(--text-main)',
              transition: 'all 0.15s ease',
            }}
          >
            <Hash size={15} />
            Hashtags & Bio
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

        {/* SUB-FILTER FOR BABY NAMES (BOY / GIRL / UNISEX) */}
        {activeCategory === 'baby' && (
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Baby Gender Filter:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Baby Names' },
                { id: 'boy', label: '👶 Baby Boy' },
                { id: 'girl', label: '🎀 Baby Girl' },
                { id: 'unisex', label: '✨ Unisex' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setBabyGender(g.id as BabyGenderFilter)}
                  style={{
                    backgroundColor:
                      babyGender === g.id ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-page)',
                    border:
                      babyGender === g.id ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '4px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: babyGender === g.id ? '#d97706' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH, SORT, & BATCH CONTROLS BAR */}
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
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
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
              placeholder="Search filtered names..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="melodic">✨ Highest Melodic Flow</option>
              <option value="shortest">Shortest Name First</option>
              <option value="longest">Longest Name First</option>
              <option value="alphabetical">A-Z Alphabetical</option>
            </select>
          </div>

          {/* Batch Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleCopyAll}
              title="Copy All Filtered Names"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: copiedAll ? '#059669' : 'var(--bg-card)',
                color: copiedAll ? '#ffffff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedAll ? <Check size={14} /> : <Copy size={14} />}
              {copiedAll ? 'Copied All!' : 'Copy All'}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              title="Download as TXT"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={14} />
              TXT
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              title="Download as CSV"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={14} />
              CSV
            </button>

            <button
              type="button"
              onClick={() => handleWhatsAppShare(filteredCombinations.map((c) => c.name))}
              title="Share shortlist on WhatsApp"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(37, 211, 102, 0.12)',
                color: '#16a34a',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          </div>
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

          {filteredCombinations.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '36px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No names matched your active filters or search query. Try clearing the search or
              switching categories.
            </div>
          ) : (
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
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            padding: '1px 6px',
                          }}
                        >
                          {item.melodicScore}% Flow
                        </span>
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

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                    >
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
          )}
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
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={18} style={{ color: '#ec4899' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('yourFavorites', { count: favorites.length })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(favorites)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(37, 211, 102, 0.12)',
                    color: '#16a34a',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <MessageCircle size={13} />
                  Share Favorites
                </button>
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
