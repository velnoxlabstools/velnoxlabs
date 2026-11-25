'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  KeyRound,
  ShieldCheck,
  Hash,
  Copy,
  Check,
  RefreshCw,
  List,
  Sparkles,
  Lock,
} from 'lucide-react';

type ModeType = 'random' | 'passphrase' | 'pin' | 'bulk';

const WORD_BANK = [
  'amber',
  'anchor',
  'beacon',
  'breeze',
  'bridge',
  'cascade',
  'castle',
  'cedar',
  'cipher',
  'cloud',
  'comet',
  'coral',
  'crystal',
  'delta',
  'drift',
  'eagle',
  'echo',
  'eclipse',
  'ember',
  'falcon',
  'fathom',
  'feather',
  'flame',
  'forest',
  'galaxy',
  'glacier',
  'granite',
  'harbor',
  'haven',
  'horizon',
  'island',
  'jasper',
  'journey',
  'jungle',
  'jupiter',
  'lagoon',
  'lantern',
  'meadow',
  'meteor',
  'mirage',
  'monarch',
  'mountain',
  'nebula',
  'nexus',
  'oasis',
  'ocean',
  'orbit',
  'origin',
  'passage',
  'pebble',
  'phoenix',
  'pioneer',
  'planet',
  'plasma',
  'prism',
  'pulsar',
  'pyramid',
  'quantum',
  'quartz',
  'radian',
  'rainbow',
  'ranger',
  'ravine',
  'reef',
  'ripple',
  'river',
  'rocket',
  'rover',
  'ruby',
  'sapphire',
  'shadow',
  'shield',
  'sierra',
  'silver',
  'solar',
  'spark',
  'spiral',
  'summit',
  'temple',
  'thunder',
  'timber',
  'titan',
  'topaz',
  'trail',
  'valley',
  'velocity',
  'venture',
  'vessel',
  'vortex',
  'voyage',
  'whisper',
  'willow',
  'zenith',
  'zephyr',
];

const PRESETS = [
  { length: 12, key: 'preset12' as const },
  { length: 14, key: 'preset14' as const },
  { length: 16, key: 'preset16' as const },
  { length: 18, key: 'preset18' as const },
  { length: 24, key: 'preset24' as const },
  { length: 32, key: 'preset32' as const },
];

export default function SecurePasswordGeneratorPage() {
  const tUI = useTranslations('ToolUI.securePasswordGenerator');

  // Active Mode
  const [mode, setMode] = useState<ModeType>('random');

  // Random Mode Settings
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  // Passphrase Mode Settings
  const [wordCount, setWordCount] = useState(4);
  const [customWord, setCustomWord] = useState('');
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [appendSalt, setAppendSalt] = useState(true);

  // PIN Mode Settings
  const [pinLength, setPinLength] = useState(6);

  // Bulk Mode Settings
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Generated Primary Result
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedExampleIndex, setCopiedExampleIndex] = useState<number | null>(null);

  // Helper: Secure Random Integer in range [0, max)
  const getSecureRandomInt = (max: number): number => {
    if (max <= 0) return 0;
    const array = new Uint32Array(1);
    const maxUint32 = 0xffffffff;
    const limit = maxUint32 - (maxUint32 % max);
    let randomVal;
    do {
      crypto.getRandomValues(array);
      randomVal = array[0];
    } while (randomVal >= limit);
    return randomVal % max;
  };

  // 1. Generate Single Random Character Password
  const generateRandomPassword = useCallback(
    (targetLength: number): string => {
      let chars = '';
      if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) chars += '0123456789';
      if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, '');

      if (!chars) return '';

      let pass = '';
      for (let i = 0; i < targetLength; i++) {
        const idx = getSecureRandomInt(chars.length);
        pass += chars[idx];
      }
      return pass;
    },
    [useUpper, useLower, useNumbers, useSymbols, excludeSimilar]
  );

  // 2. Generate Memorable Passphrase
  const generatePassphrase = useCallback((): string => {
    const selectedWords: string[] = [];
    const count = Math.max(2, Math.min(8, wordCount));

    for (let i = 0; i < count; i++) {
      const idx = getSecureRandomInt(WORD_BANK.length);
      let w = WORD_BANK[idx];
      if (capitalize) {
        w = w.charAt(0).toUpperCase() + w.slice(1);
      }
      selectedWords.push(w);
    }

    // Insert user custom word if provided
    const cleanWord = customWord.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (cleanWord) {
      let formattedCustom = cleanWord;
      if (capitalize) {
        formattedCustom = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
      }
      const insertPos = getSecureRandomInt(selectedWords.length + 1);
      selectedWords.splice(insertPos, 0, formattedCustom);
    }

    let result = selectedWords.join(separator);

    if (appendSalt) {
      const symbols = '!@#$%&*';
      const randNum = (getSecureRandomInt(90) + 10).toString();
      const randSym = symbols[getSecureRandomInt(symbols.length)];
      result = `${result}${separator}${randNum}${randSym}`;
    }

    return result;
  }, [wordCount, customWord, separator, capitalize, appendSalt]);

  // 3. Generate Numeric PIN
  const generatePin = useCallback((): string => {
    let pin = '';
    for (let i = 0; i < pinLength; i++) {
      pin += getSecureRandomInt(10).toString();
    }
    return pin;
  }, [pinLength]);

  // Master Generator based on Active Mode
  const generateCurrent = useCallback(() => {
    if (mode === 'random') {
      const p = generateRandomPassword(length);
      setPassword(p);
    } else if (mode === 'passphrase') {
      const p = generatePassphrase();
      setPassword(p);
    } else if (mode === 'pin') {
      const p = generatePin();
      setPassword(p);
    } else if (mode === 'bulk') {
      const list: string[] = [];
      for (let i = 0; i < bulkCount; i++) {
        list.push(generateRandomPassword(length));
      }
      setBulkList(list);
      if (list.length > 0) {
        setPassword(list[0]);
      }
    }
  }, [mode, length, bulkCount, generateRandomPassword, generatePassphrase, generatePin]);

  // Regenerate when relevant settings change
  useEffect(() => {
    generateCurrent();
  }, [generateCurrent]);

  // Entropy and Crack Time Calculation
  const { entropy, strengthLevel, crackTimeKey } = useMemo(() => {
    if (!password) {
      return {
        entropy: 0,
        strengthLevel: 'strengthVeryWeak' as const,
        crackTimeKey: 'timeInstant' as const,
      };
    }

    let calculatedEntropy = 0;

    if (mode === 'random' || mode === 'bulk') {
      let poolSize = 0;
      if (useUpper) poolSize += 26;
      if (useLower) poolSize += 26;
      if (useNumbers) poolSize += 10;
      if (useSymbols) poolSize += 26;
      if (excludeSimilar) poolSize = Math.max(10, poolSize - 8);
      if (poolSize === 0) poolSize = 1;
      calculatedEntropy = Math.round(password.length * Math.log2(poolSize));
    } else if (mode === 'passphrase') {
      const wordsCount = password.split(separator).length;
      calculatedEntropy = Math.round(
        wordsCount * Math.log2(WORD_BANK.length) + (appendSalt ? 12 : 0)
      );
    } else if (mode === 'pin') {
      calculatedEntropy = Math.round(password.length * Math.log2(10));
    }

    // Determine Strength Level
    let lvl:
      | 'strengthVeryWeak'
      | 'strengthWeak'
      | 'strengthMedium'
      | 'strengthStrong'
      | 'strengthVeryStrong' = 'strengthVeryWeak';
    if (calculatedEntropy < 40) lvl = 'strengthVeryWeak';
    else if (calculatedEntropy < 60) lvl = 'strengthWeak';
    else if (calculatedEntropy < 80) lvl = 'strengthMedium';
    else if (calculatedEntropy < 100) lvl = 'strengthStrong';
    else lvl = 'strengthVeryStrong';

    // Crack Time estimation at 10^10 guesses/sec (modern GPU cluster)
    // Seconds = 2^E / 10^10 = 2^(E - 33.22)
    let timeKey:
      | 'timeInstant'
      | 'timeSeconds'
      | 'timeMinutes'
      | 'timeHours'
      | 'timeDays'
      | 'timeMonths'
      | 'timeYears'
      | 'timeCenturies'
      | 'timeBillions' = 'timeInstant';

    if (calculatedEntropy < 35) timeKey = 'timeInstant';
    else if (calculatedEntropy < 45) timeKey = 'timeSeconds';
    else if (calculatedEntropy < 52) timeKey = 'timeMinutes';
    else if (calculatedEntropy < 60) timeKey = 'timeHours';
    else if (calculatedEntropy < 68) timeKey = 'timeDays';
    else if (calculatedEntropy < 75) timeKey = 'timeMonths';
    else if (calculatedEntropy < 85) timeKey = 'timeYears';
    else if (calculatedEntropy < 105) timeKey = 'timeCenturies';
    else timeKey = 'timeBillions';

    return { entropy: calculatedEntropy, strengthLevel: lvl, crackTimeKey: timeKey };
  }, [
    password,
    mode,
    useUpper,
    useLower,
    useNumbers,
    useSymbols,
    excludeSimilar,
    separator,
    appendSalt,
  ]);

  // Copy Primary Password
  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy All Bulk Passwords
  const handleCopyAll = () => {
    if (bulkList.length === 0) return;
    navigator.clipboard.writeText(bulkList.join('\n'));
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  };

  // Strong Password Reference Examples
  const EXAMPLES = [
    {
      title: tUI('example12Title'),
      desc: tUI('example12Desc'),
      sample: 'k7#M9!pQ2$vL',
    },
    {
      title: tUI('example14Title'),
      desc: tUI('example14Desc'),
      sample: 'W9$mP!2xQz*7#k',
    },
    {
      title: tUI('example16Title'),
      desc: tUI('example16Desc'),
      sample: 'aB9#vL$9mP!2xQz*',
    },
    {
      title: tUI('example18Title'),
      desc: tUI('example18Desc'),
      sample: 'X7!kP9#vL$9mP!2xQz',
    },
    {
      title: tUI('examplePassphraseTitle'),
      desc: tUI('examplePassphraseDesc'),
      sample: 'Falcon-Quantum-Horizon-78!',
    },
  ];

  const handleCopyExample = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleIndex(idx);
    setTimeout(() => setCopiedExampleIndex(null), 2000);
  };

  // Strength Bar styling
  const getStrengthBarWidth = () => {
    if (entropy <= 0) return '5%';
    return `${Math.min(100, Math.max(10, (entropy / 120) * 100))}%`;
  };

  const getStrengthColor = () => {
    switch (strengthLevel) {
      case 'strengthVeryWeak':
        return '#ef4444';
      case 'strengthWeak':
        return '#f97316';
      case 'strengthMedium':
        return '#eab308';
      case 'strengthStrong':
        return '#22c55e';
      case 'strengthVeryStrong':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= MODE NAVIGATION TABS ================= */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <button
            onClick={() => setMode('random')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'random' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'random' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'random' ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={16} />
            {tUI('modeRandom')}
          </button>

          <button
            onClick={() => setMode('passphrase')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'passphrase' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor:
                mode === 'passphrase' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'passphrase' ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={16} />
            {tUI('modePassphrase')}
          </button>

          <button
            onClick={() => setMode('pin')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'pin' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'pin' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'pin' ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <Hash size={16} />
            {tUI('modePin')}
          </button>

          <button
            onClick={() => setMode('bulk')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: mode === 'bulk' ? '#3b82f6' : 'var(--border-color)',
              backgroundColor: mode === 'bulk' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
              color: mode === 'bulk' ? '#60a5fa' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            <List size={16} />
            {tUI('modeBulk')}
          </button>
        </div>

        {/* ================= PRIMARY PASSWORD DISPLAY CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
              {tUI('generatedPassword')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={generateCurrent}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} />
                {tUI('regenerate')}
              </button>
              <button
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: copied ? '#059669' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? tUI('copied') : tUI('copy')}
              </button>
            </div>
          </div>

          {/* Password output box */}
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '18px 20px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '1.25rem',
              color: getStrengthColor(),
              wordBreak: 'break-all',
              letterSpacing: mode === 'pin' ? '0.2em' : '0.05em',
              userSelect: 'all',
              minHeight: '62px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {password || tUI('placeholder')}
          </div>

          {/* Strength Meter & Entropy Bar */}
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span>
                {tUI('strengthLabel')}{' '}
                <strong style={{ color: getStrengthColor() }}>{tUI(strengthLevel)}</strong>
              </span>
              <span>{tUI('entropyLabel', { bits: entropy })}</span>
              <span>
                {tUI('crackTimeLabel', {
                  time: tUI(crackTimeKey),
                })}
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: getStrengthBarWidth(),
                  height: '100%',
                  backgroundColor: getStrengthColor(),
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        </div>

        {/* ================= CONTROLS SECTION ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* MODE 1: RANDOM CHARACTERS */}
          {mode === 'random' && (
            <div>
              {/* Quick Presets */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('lengthLabel', { length })}
                </label>
                <div
                  style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}
                >
                  {PRESETS.map((p) => (
                    <button
                      key={p.length}
                      onClick={() => setLength(p.length)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: length === p.length ? '#3b82f6' : 'var(--border-color)',
                        backgroundColor:
                          length === p.length ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: length === p.length ? '#60a5fa' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tUI(p.key)}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>

              {/* Character set checkboxes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useUpper}
                    onChange={(e) => setUseUpper(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('uppercase')}
                </label>

                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useLower}
                    onChange={(e) => setUseLower(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('lowercase')}
                </label>

                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('numbers')}
                </label>

                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('symbols')}
                </label>

                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('excludeSimilar')}
                </label>
              </div>
            </div>
          )}

          {/* MODE 2: MEMORABLE PASSPHRASE / WITH NAME */}
          {mode === 'passphrase' && (
            <div>
              {/* Word count slider */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('wordCountLabel', { count: wordCount })}
                </label>
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
              </div>

              {/* Custom Word / Name Input */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('customWordLabel')}
                </label>
                <input
                  type="text"
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder={tUI('customWordPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Separator Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('separatorLabel')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { val: '-', labelKey: 'sepDash' as const },
                    { val: '_', labelKey: 'sepUnder' as const },
                    { val: '.', labelKey: 'sepDot' as const },
                    { val: '@', labelKey: 'sepAt' as const },
                    { val: '#', labelKey: 'sepHan' as const },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setSeparator(s.val)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: separator === s.val ? '#3b82f6' : 'var(--border-color)',
                        backgroundColor:
                          separator === s.val ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: separator === s.val ? '#60a5fa' : 'var(--text-muted)',
                      }}
                    >
                      {tUI(s.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passphrase checkboxes */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('capitalizeWords')}
                </label>

                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={appendSalt}
                    onChange={(e) => setAppendSalt(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
                  />
                  {tUI('appendNumber')}
                </label>
              </div>
            </div>
          )}

          {/* MODE 3: NUMERIC PIN */}
          {mode === 'pin' && (
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '12px',
                }}
              >
                {tUI('pinLengthLabel', { length: pinLength })}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { len: 4, labelKey: 'pin4' as const },
                  { len: 6, labelKey: 'pin6' as const },
                  { len: 8, labelKey: 'pin8' as const },
                  { len: 12, labelKey: 'pin12' as const },
                ].map((item) => (
                  <button
                    key={item.len}
                    onClick={() => setPinLength(item.len)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: pinLength === item.len ? '#3b82f6' : 'var(--border-color)',
                      backgroundColor:
                        pinLength === item.len ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                      color: pinLength === item.len ? '#60a5fa' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tUI(item.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 4: BULK PASSWORDS */}
          {mode === 'bulk' && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('bulkCountLabel', { count: bulkCount })}
                </label>
                <div
                  style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}
                >
                  {[
                    { cnt: 5, labelKey: 'bulk5' as const },
                    { cnt: 10, labelKey: 'bulk10' as const },
                    { cnt: 20, labelKey: 'bulk20' as const },
                    { cnt: 50, labelKey: 'bulk50' as const },
                  ].map((b) => (
                    <button
                      key={b.cnt}
                      onClick={() => setBulkCount(b.cnt)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: bulkCount === b.cnt ? '#3b82f6' : 'var(--border-color)',
                        backgroundColor:
                          bulkCount === b.cnt ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: bulkCount === b.cnt ? '#60a5fa' : 'var(--text-muted)',
                      }}
                    >
                      {tUI(b.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Output List with Copy All button */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}
                  >
                    {bulkList.length} {tUI('modeBulk')}
                  </span>
                  <button
                    onClick={handleCopyAll}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: bulkCopied ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                      color: bulkCopied ? '#ffffff' : '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {bulkCopied ? <Check size={13} /> : <Copy size={13} />}
                    {bulkCopied ? tUI('copiedAll') : tUI('copyAll')}
                  </button>
                </div>

                <div
                  style={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {bulkList.map((passItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-card)',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: '0.875rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <span>{passItem}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(passItem);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                        aria-label={tUI('copy')}
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={generateCurrent}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            {tUI('generateButton')}
          </button>
        </div>

        {/* ================= STRONG PASSWORD EXAMPLES SHOWCASE ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lock size={18} style={{ color: '#3b82f6' }} />
              {tUI('examplesTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tUI('examplesSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {EXAMPLES.map((ex, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ex.title}
                  </div>
                  <div
                    style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}
                  >
                    {ex.desc}
                  </div>
                  <div
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      fontSize: '0.95rem',
                      color: '#34d399',
                      marginTop: '6px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {ex.sample}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyExample(ex.sample, idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor:
                      copiedExampleIndex === idx ? '#059669' : 'rgba(59, 130, 246, 0.15)',
                    color: copiedExampleIndex === idx ? '#ffffff' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedExampleIndex === idx ? <Check size={13} /> : <Copy size={13} />}
                  {copiedExampleIndex === idx ? tUI('copied') : tUI('copy')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
        <ToolSeoContent
          toolSlug="secure-password-generator"
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
