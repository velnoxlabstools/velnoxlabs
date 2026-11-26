'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Dice5,
  RefreshCw,
  Trophy,
  Users,
  Sparkles,
  Phone,
  Copy,
  Check,
  Shuffle,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Trash2,
} from 'lucide-react';

type TabMode = 'numbers' | 'wheel' | 'names' | 'pairs' | 'lottery' | 'phone';
type LotteryType = 'powerball' | 'megamillions' | 'euromillions' | 'custom649';
type CountryCode = 'US' | 'UK' | 'IN' | 'DE' | 'CA' | 'AU';

// Hardware-seeded cryptographic PRNG
function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  return Math.random();
}

function secureRandomInt(min: number, max: number): number {
  return Math.floor(secureRandom() * (max - min + 1)) + min;
}

function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function playWebAudioTone(freq: number, durationSec: number, vol = 0.08) {
  if (typeof window === 'undefined') return;
  const win = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctx = win.AudioContext || win.webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationSec);
    setTimeout(
      () => {
        void ctx.close().catch(() => {});
      },
      durationSec * 1000 + 60
    );
  } catch {
    // Ignore audio context restrictions
  }
}

const WHEEL_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#eab308',
];

export default function RandomNumberGeneratorPage() {
  const tUI = useTranslations('ToolUI.randomNumberGenerator');

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabMode>('numbers');

  // ================= TAB 1: NUMBERS & DECIMALS =================
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(false);
  const [decimals, setDecimals] = useState<number>(0);
  const [sort, setSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [excludeInput, setExcludeInput] = useState('');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [drawHistory, setDrawHistory] = useState<number[][]>([]);
  const [numberError, setNumberError] = useState('');
  const [copiedNumbers, setCopiedNumbers] = useState(false);

  const handleGenerateNumbers = useCallback(() => {
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    const countVal = Math.min(1000, Math.max(1, parseInt(count, 10) || 1));

    const excludedSet = new Set(
      excludeInput
        .split(/[\s,]+/)
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n))
    );

    if (isNaN(minVal) || isNaN(maxVal)) {
      setNumberError(tUI('errorMinMax'));
      setNumbers([]);
      return;
    }

    if (minVal > maxVal) {
      setNumberError(tUI('errorMinMax'));
      setNumbers([]);
      return;
    }

    if (decimals === 0 && unique) {
      const minInt = Math.ceil(minVal);
      const maxInt = Math.floor(maxVal);
      let excludedInRange = 0;
      excludedSet.forEach((n) => {
        if (Number.isInteger(n) && n >= minInt && n <= maxInt) excludedInRange++;
      });
      const availableRange = maxInt - minInt + 1 - excludedInRange;
      if (countVal > availableRange) {
        setNumberError(tUI('errorRange', { count: countVal, range: Math.max(0, availableRange) }));
        setNumbers([]);
        return;
      }
    }

    setNumberError('');
    const factor = Math.pow(10, decimals);
    const result: number[] = [];

    if (unique && decimals === 0) {
      const minInt = Math.ceil(minVal);
      const maxInt = Math.floor(maxVal);
      const integerRange = maxInt - minInt + 1;

      if (integerRange <= 10000) {
        const pool = Array.from({ length: integerRange }, (_, i) => minInt + i).filter(
          (n) => !excludedSet.has(n)
        );
        const shuffled = secureShuffle(pool);
        result.push(...shuffled.slice(0, countVal));
      } else {
        const poolSet = new Set<number>();
        let attempts = 0;
        while (poolSet.size < countVal && attempts < countVal * 50) {
          attempts++;
          const candidate = secureRandomInt(minInt, maxInt);
          if (!excludedSet.has(candidate)) poolSet.add(candidate);
        }
        result.push(...Array.from(poolSet));
      }
    } else if (unique && decimals > 0) {
      const poolSet = new Set<number>();
      let attempts = 0;
      const maxAttempts = countVal * 100;
      while (poolSet.size < countVal && attempts < maxAttempts) {
        attempts++;
        const raw = minVal + secureRandom() * (maxVal - minVal);
        const rounded = Math.round(raw * factor) / factor;
        if (!excludedSet.has(rounded)) poolSet.add(rounded);
      }
      result.push(...Array.from(poolSet));
    } else {
      const minInt = Math.ceil(minVal);
      const maxInt = Math.floor(maxVal);
      for (let i = 0; i < countVal; i++) {
        if (decimals === 0) {
          let candidate = secureRandomInt(minInt, maxInt);
          let guard = 0;
          while (excludedSet.has(candidate) && guard < 100) {
            candidate = secureRandomInt(minInt, maxInt);
            guard++;
          }
          if (!excludedSet.has(candidate)) result.push(candidate);
        } else {
          const raw = minVal + secureRandom() * (maxVal - minVal);
          result.push(Math.round(raw * factor) / factor);
        }
      }
    }

    if (sort === 'asc') result.sort((a, b) => a - b);
    else if (sort === 'desc') result.sort((a, b) => b - a);

    setNumbers(result);
    if (result.length > 0) {
      setDrawHistory((prev) => [result, ...prev].slice(0, 6));
    }
  }, [min, max, count, unique, decimals, sort, excludeInput, tUI]);

  useEffect(() => {
    handleGenerateNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyNumbers = () => {
    if (numbers.length === 0) return;
    navigator.clipboard.writeText(numbers.join(', '));
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2000);
  };

  const handleDownloadNumbers = (format: 'txt' | 'csv') => {
    if (numbers.length === 0) return;
    const content = format === 'csv' ? numbers.join('\n') : numbers.join(', ');
    const blob = new Blob([content], {
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `random-numbers.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (
    presetMin: number,
    presetMax: number,
    presetCount: number,
    presetUnique: boolean
  ) => {
    setMin(String(presetMin));
    setMax(String(presetMax));
    setCount(String(presetCount));
    setUnique(presetUnique);
    setDecimals(0);
    setSort('none');
    setNumberError('');

    const result: number[] = [];
    if (presetUnique) {
      const range = presetMax - presetMin + 1;
      const pool = Array.from({ length: range }, (_, i) => presetMin + i);
      const shuffled = secureShuffle(pool);
      result.push(...shuffled.slice(0, presetCount));
    } else {
      for (let i = 0; i < presetCount; i++) {
        result.push(secureRandomInt(presetMin, presetMax));
      }
    }
    setNumbers(result);
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    if (numbers.length === 0) return null;
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / numbers.length;
    const minVal = Math.min(...numbers);
    const maxVal = Math.max(...numbers);
    let evenCount = 0;
    let oddCount = 0;
    if (decimals === 0) {
      numbers.forEach((n) => {
        if (Math.abs(n) % 2 === 0) evenCount++;
        else oddCount++;
      });
    }
    return {
      sum: decimals > 0 ? sum.toFixed(decimals) : String(sum),
      avg: avg.toFixed(Math.max(decimals, 2)),
      min: minVal,
      max: maxVal,
      evenOdd: decimals === 0 ? `${evenCount} / ${oddCount}` : null,
    };
  }, [numbers, decimals]);

  // ================= TAB 2: SPINNER WHEEL =================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wheelSlicesCount, setWheelSlicesCount] = useState<number>(8);
  const [customWheelInput, setCustomWheelInput] = useState('');
  const [wheelItems, setWheelItems] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState('');
  const [wheelSoundEnabled, setWheelSoundEnabled] = useState(true);
  const wheelAngleRef = useRef(0);
  const lastSliceIdxRef = useRef<number>(-1);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize or update wheel items
  useEffect(() => {
    if (customWheelInput.trim()) {
      const parsed = customWheelInput
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length >= 2) {
        setWheelItems(parsed);
        return;
      }
    }
    const defaultItems = Array.from({ length: wheelSlicesCount }, (_, i) => String(i + 1));
    setWheelItems(defaultItems);
  }, [wheelSlicesCount, customWheelInput]);

  const drawWheel = useCallback(
    (currentAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas || wheelItems.length === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 16;
      const totalSlices = wheelItems.length;
      const sliceAngle = (2 * Math.PI) / totalSlices;

      ctx.clearRect(0, 0, size, size);

      // Draw outer ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // Draw slices
      for (let i = 0; i < totalSlices; i++) {
        const start = currentAngle + i * sliceAngle;
        const end = start + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();

        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = totalSlices > 12 ? 'bold 12px sans-serif' : 'bold 15px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;

        const label = wheelItems[i];
        const displayLabel = label.length > 10 ? label.slice(0, 9) + '…' : label;
        ctx.fillText(displayLabel, radius - 20, 5);
        ctx.restore();
      }

      // Draw center pin
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, 22, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.restore();

      // Draw top pointer (pointing down at 12 o'clock: 1.5 * PI)
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center - 12, 4);
      ctx.lineTo(center + 12, 4);
      ctx.lineTo(center, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },
    [wheelItems]
  );

  useEffect(() => {
    drawWheel(wheelAngleRef.current);
  }, [drawWheel]);

  const spinWheel = () => {
    if (isSpinning || wheelItems.length === 0) return;
    setIsSpinning(true);
    setWheelWinner('');

    let velocity = 0.38 + secureRandom() * 0.25; // Initial rotational speed
    const friction = 0.985; // Deceleration rate
    const topPointer = 1.5 * Math.PI;
    const totalSlices = wheelItems.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    const animate = () => {
      wheelAngleRef.current += velocity;
      velocity *= friction;

      drawWheel(wheelAngleRef.current);

      const normalized =
        (((topPointer - wheelAngleRef.current) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentIdx = Math.floor(normalized / sliceAngle) % totalSlices;
      if (currentIdx !== lastSliceIdxRef.current) {
        lastSliceIdxRef.current = currentIdx;
        if (wheelSoundEnabled) {
          playWebAudioTone(680, 0.025, 0.05);
        }
      }

      if (velocity > 0.0015) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWheelWinner(wheelItems[currentIdx]);
        if (wheelSoundEnabled) {
          playWebAudioTone(880, 0.18, 0.1);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleRemoveWheelWinner = () => {
    if (!wheelWinner || wheelItems.length <= 2) return;
    const remaining = wheelItems.filter((item, idx) => idx !== wheelItems.indexOf(wheelWinner));
    setCustomWheelInput(remaining.join(', '));
    setWheelWinner('');
  };

  const resetWheelToNumbers = () => {
    setCustomWheelInput('');
    setWheelSlicesCount(8);
    setWheelWinner('');
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ================= TAB 3: NAME PICKER =================
  const [namesInput, setNamesInput] = useState(
    'Alice\nBob\nCharlie\nDiana\nEvan\nFiona\nGeorge\nHannah'
  );
  const [namesWinnerCount, setNamesWinnerCount] = useState('1');
  const [winners, setWinners] = useState<string[]>([]);
  const [namesError, setNamesError] = useState('');
  const [copiedWinners, setCopiedWinners] = useState(false);

  const handleDrawNames = () => {
    const list = namesInput
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (list.length < 2) {
      setNamesError(tUI('emptyNamesError'));
      setWinners([]);
      return;
    }

    const countVal = parseInt(namesWinnerCount, 10) || 1;
    if (countVal > list.length) {
      setNamesError(tUI('winnerCountExceeds'));
      setWinners([]);
      return;
    }

    setNamesError('');
    const shuffled = secureShuffle(list);
    setWinners(shuffled.slice(0, countVal));
  };

  const handleCopyWinners = () => {
    if (winners.length === 0) return;
    navigator.clipboard.writeText(winners.join(', '));
    setCopiedWinners(true);
    setTimeout(() => setCopiedWinners(false), 2000);
  };

  // ================= TAB 4: PAIRING & TEAMS =================
  const [pairsInput, setPairsInput] = useState(
    'Emma\nLiam\nSophia\nNoah\nOlivia\nJames\nAva\nLucas'
  );
  const [pairMode, setPairMode] = useState<'pairs' | 'teams'>('pairs');
  const [pairedResults, setPairedResults] = useState<{ a: string; b: string }[]>([]);
  const [oddParticipant, setOddParticipant] = useState<string | null>(null);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [pairsError, setPairsError] = useState('');
  const [copiedPairs, setCopiedPairs] = useState(false);

  const handleGeneratePairs = () => {
    const list = pairsInput
      .split(/[\n,]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (list.length < 2) {
      setPairsError(tUI('emptyNamesError'));
      setPairedResults([]);
      setTeamA([]);
      setTeamB([]);
      setOddParticipant(null);
      return;
    }

    setPairsError('');
    const shuffled = secureShuffle(list);

    if (pairMode === 'pairs') {
      const pairs: { a: string; b: string }[] = [];
      const len = shuffled.length;
      for (let i = 0; i < len - 1; i += 2) {
        pairs.push({ a: shuffled[i], b: shuffled[i + 1] });
      }
      setPairedResults(pairs);
      if (len % 2 !== 0) {
        setOddParticipant(shuffled[len - 1]);
      } else {
        setOddParticipant(null);
      }
    } else {
      const midpoint = Math.ceil(shuffled.length / 2);
      setTeamA(shuffled.slice(0, midpoint));
      setTeamB(shuffled.slice(midpoint));
      setPairedResults([]);
      setOddParticipant(null);
    }
  };

  const handleCopyPairs = () => {
    let text = '';
    if (pairMode === 'pairs') {
      text = pairedResults.map((p, idx) => `Pair ${idx + 1}: ${p.a} ➔ ${p.b}`).join('\n');
      if (oddParticipant) text += `\nSolo: ${oddParticipant}`;
    } else {
      text = `=== ${tUI('teamAHeading')} ===\n${teamA.join('\n')}\n\n=== ${tUI('teamBHeading')} ===\n${teamB.join('\n')}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedPairs(true);
    setTimeout(() => setCopiedPairs(false), 2000);
  };

  // ================= TAB 5: LOTTERY PICKS =================
  const [lotteryType, setLotteryType] = useState<LotteryType>('powerball');
  const [lottoMain, setLottoMain] = useState<number[]>([]);
  const [lottoBonus, setLottoBonus] = useState<number[]>([]);
  const [copiedLotto, setCopiedLotto] = useState(false);

  const handleGenerateLottery = useCallback(() => {
    let mainCount = 5;
    let mainMax = 69;
    let bonusCount = 1;
    let bonusMax = 26;

    if (lotteryType === 'powerball') {
      mainCount = 5;
      mainMax = 69;
      bonusCount = 1;
      bonusMax = 26;
    } else if (lotteryType === 'megamillions') {
      mainCount = 5;
      mainMax = 70;
      bonusCount = 1;
      bonusMax = 25;
    } else if (lotteryType === 'euromillions') {
      mainCount = 5;
      mainMax = 50;
      bonusCount = 2;
      bonusMax = 12;
    } else if (lotteryType === 'custom649') {
      mainCount = 6;
      mainMax = 49;
      bonusCount = 0;
      bonusMax = 0;
    }

    // Main pool
    const mainPool = Array.from({ length: mainMax }, (_, i) => i + 1);
    const mainShuffled = secureShuffle(mainPool);
    const selectedMain = mainShuffled.slice(0, mainCount).sort((a, b) => a - b);
    setLottoMain(selectedMain);

    // Bonus pool
    if (bonusCount > 0) {
      const bonusPool = Array.from({ length: bonusMax }, (_, i) => i + 1);
      const bonusShuffled = secureShuffle(bonusPool);
      const selectedBonus = bonusShuffled.slice(0, bonusCount).sort((a, b) => a - b);
      setLottoBonus(selectedBonus);
    } else {
      setLottoBonus([]);
    }
  }, [lotteryType]);

  useEffect(() => {
    handleGenerateLottery();
  }, [handleGenerateLottery]);

  const handleCopyLotto = () => {
    let text = `Main: ${lottoMain.join(', ')}`;
    if (lottoBonus.length > 0) text += ` | Bonus: ${lottoBonus.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedLotto(true);
    setTimeout(() => setCopiedLotto(false), 2000);
  };

  // ================= TAB 6: MOCK PHONE NUMBERS =================
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('US');
  const [phoneCount, setPhoneCount] = useState<number>(5);
  const [phoneList, setPhoneList] = useState<string[]>([]);
  const [copiedPhoneIdx, setCopiedPhoneIdx] = useState<number | null>(null);
  const [copiedAllPhones, setCopiedAllPhones] = useState(false);

  const generateMockPhones = useCallback(() => {
    const results: string[] = [];
    for (let i = 0; i < phoneCount; i++) {
      let num = '';
      if (phoneCountry === 'US' || phoneCountry === 'CA') {
        const line = secureRandomInt(1000, 9999);
        num = `+1 (555) ${secureRandomInt(100, 999)}-${line}`;
      } else if (phoneCountry === 'UK') {
        // Ofcom Drama test allocation 07700 900xxx
        num = `+44 7700 900${secureRandomInt(100, 999)}`;
      } else if (phoneCountry === 'IN') {
        num = `+91 98${secureRandomInt(10, 99)} ${secureRandomInt(10000, 99999)}`;
      } else if (phoneCountry === 'DE') {
        num = `+49 151 2345${secureRandomInt(1000, 9999)}`;
      } else if (phoneCountry === 'AU') {
        // ACMA fictional range 0491 570 xxx
        num = `+61 491 570 ${secureRandomInt(100, 999)}`;
      }
      results.push(num);
    }
    setPhoneList(results);
  }, [phoneCountry, phoneCount]);

  useEffect(() => {
    generateMockPhones();
  }, [generateMockPhones]);

  const handleCopySinglePhone = (phone: string, index: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneIdx(index);
    setTimeout(() => setCopiedPhoneIdx(null), 1800);
  };

  const handleCopyAllPhones = () => {
    if (phoneList.length === 0) return;
    navigator.clipboard.writeText(phoneList.join('\n'));
    setCopiedAllPhones(true);
    setTimeout(() => setCopiedAllPhones(false), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            {[
              { id: 'numbers', label: tUI('tabNumbers'), icon: Dice5 },
              { id: 'wheel', label: tUI('tabWheel'), icon: RefreshCw },
              { id: 'names', label: tUI('tabNames'), icon: Trophy },
              { id: 'pairs', label: tUI('tabPairs'), icon: Users },
              { id: 'lottery', label: tUI('tabLottery'), icon: Sparkles },
              { id: 'phone', label: tUI('tabPhone'), icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabMode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    color: isActive ? '#60a5fa' : 'var(--text-main)',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Card Container */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            {/* ================= TAB 1: NUMBERS & DECIMALS ================= */}
            {activeTab === 'numbers' && (
              <div>
                {/* Quick Presets */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tUI('quickPresets')}
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      onClick={() => applyPreset(1, 10, 1, true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('preset1to10')}
                    </button>
                    <button
                      onClick={() => applyPreset(1, 100, 10, true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        color: '#60a5fa',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('preset1to100')}
                    </button>
                    <button
                      onClick={() => applyPreset(1, 1000, 5, false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('preset1to1000')}
                    </button>
                    <button
                      onClick={() => applyPreset(1, 2, 1, false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetCoin')}
                    </button>
                    <button
                      onClick={() => applyPreset(1, 6, 1, false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetDiceD6')}
                    </button>
                    <button
                      onClick={() => applyPreset(1, 20, 1, false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      {tUI('presetDiceD20')}
                    </button>
                  </div>
                </div>

                {/* Primary Number Inputs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('minLabel')}
                    </label>
                    <input
                      type="number"
                      value={min}
                      onChange={(e) => setMin(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('maxLabel')}
                    </label>
                    <input
                      type="number"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {tUI('countLabel')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* Additional Settings (Decimals, Sort, Unique) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                    padding: '14px',
                    backgroundColor: 'var(--bg-page)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('decimalsLabel')}
                    </label>
                    <select
                      value={decimals}
                      onChange={(e) => setDecimals(parseInt(e.target.value, 10))}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value={0}>{tUI('decimalsNone')}</option>
                      <option value={1}>{tUI('decimals1')}</option>
                      <option value={2}>{tUI('decimals2')}</option>
                      <option value={3}>{tUI('decimals3')}</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('sortLabel')}
                    </label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as 'none' | 'asc' | 'desc')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="none">{tUI('sortNone')}</option>
                      <option value="asc">{tUI('sortAsc')}</option>
                      <option value="desc">{tUI('sortDesc')}</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={unique}
                        onChange={(e) => setUnique(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span>{tUI('uniqueLabel')}</span>
                    </label>
                  </div>
                </div>

                {/* Exclude Specific Numbers */}
                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('excludeLabel')}
                  </label>
                  <input
                    type="text"
                    value={excludeInput}
                    onChange={(e) => setExcludeInput(e.target.value)}
                    placeholder="e.g. 13, 42, 99"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                {/* Error Banner */}
                {numberError && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '16px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ⚠️ {numberError}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerateNumbers}
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Dice5 size={18} />
                  <span>{tUI('generateButton')}</span>
                </button>

                {/* Numbers Results Display */}
                {numbers.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {tUI('generatedHeading', { count: numbers.length })}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleCopyNumbers}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: copiedNumbers
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'var(--bg-page)',
                            color: copiedNumbers ? '#34d399' : 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          {copiedNumbers ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedNumbers ? tUI('copied') : tUI('copyAll')}</span>
                        </button>
                        <button
                          onClick={() => handleDownloadNumbers('txt')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: 'var(--bg-page)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <Download size={13} />
                          <span>.TXT</span>
                        </button>
                        <button
                          onClick={() => handleDownloadNumbers('csv')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: 'var(--bg-page)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <Download size={13} />
                          <span>.CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Numbers Grid */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '16px',
                        backgroundColor: 'var(--bg-page)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      {numbers.map((n, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            color: '#38bdf8',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            minWidth: '50px',
                            textAlign: 'center',
                          }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>

                    {/* Statistical Summary */}
                    {stats && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '14px',
                          backgroundColor: 'var(--bg-page)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '10px',
                          }}
                        >
                          {tUI('statsTitle')}
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tUI('statSum')}
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {stats.sum}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tUI('statAverage')}
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {stats.avg}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tUI('statMin')}
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#34d399',
                                fontFamily: 'monospace',
                              }}
                            >
                              {stats.min}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {tUI('statMax')}
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#f87171',
                                fontFamily: 'monospace',
                              }}
                            >
                              {stats.max}
                            </div>
                          </div>
                          {stats.evenOdd && (
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {tUI('statEvenOdd')}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 700,
                                  color: 'var(--text-main)',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {stats.evenOdd}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Draws History */}
                    {drawHistory.length > 1 && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '12px 14px',
                          backgroundColor: 'var(--bg-page)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {tUI('historyTitle')}
                          </span>
                          <button
                            onClick={() => setDrawHistory([])}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={12} />
                            {tUI('clearHistory')}
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {drawHistory.slice(1).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: '0.78rem',
                                fontFamily: 'monospace',
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              #{drawHistory.length - idx - 1}: {item.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 2: SPINNER WHEEL ================= */}
            {activeTab === 'wheel' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('wheelTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('wheelSubtitle')}
                  </p>
                </div>

                {/* Slices Configuration */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                    }}
                  >
                    {tUI('wheelSlicesLabel')}
                  </label>
                  <select
                    value={wheelSlicesCount}
                    disabled={isSpinning || !!customWheelInput.trim()}
                    onChange={(e) => setWheelSlicesCount(parseInt(e.target.value, 10))}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} Slices
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={resetWheelToNumbers}
                    disabled={isSpinning}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>{tUI('resetWheel')}</span>
                  </button>
                  <button
                    onClick={() => setWheelSoundEnabled((prev) => !prev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      color: wheelSoundEnabled ? '#60a5fa' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {wheelSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{wheelSoundEnabled ? tUI('soundOn') : tUI('soundOff')}</span>
                  </button>
                </div>

                {/* Canvas Wheel Rendering */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '10px 0',
                    position: 'relative',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={340}
                    style={{
                      maxWidth: '100%',
                      cursor: isSpinning ? 'not-allowed' : 'pointer',
                      borderRadius: '50%',
                    }}
                    onClick={spinWheel}
                  />
                </div>

                {/* Winner Celebration Announcement */}
                {wheelWinner && (
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        padding: '14px 24px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        border: '2px solid #3b82f6',
                        display: 'inline-block',
                        animation: 'pulse 1.5s infinite',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#60a5fa',
                        }}
                      >
                        {tUI('winnerAnnouncement', { winner: wheelWinner })}
                      </span>
                    </div>
                    {wheelItems.length > 2 && (
                      <button
                        onClick={handleRemoveWheelWinner}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        {tUI('removeWinnerBtn')}
                      </button>
                    )}
                  </div>
                )}

                {/* Spin Button */}
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    style={{
                      backgroundColor: isSpinning ? '#64748b' : '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '14px 32px',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      cursor: isSpinning ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                    }}
                  >
                    <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} />
                    <span>{isSpinning ? tUI('spinning') : tUI('spinButton')}</span>
                  </button>
                </div>

                {/* Custom Items Input Accordion / Field */}
                <div style={{ marginTop: '24px', textAlign: 'left' }}>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('customWheelItems')}
                  </label>
                  <input
                    type="text"
                    value={customWheelInput}
                    disabled={isSpinning}
                    onChange={(e) => setCustomWheelInput(e.target.value)}
                    placeholder="e.g. Yes, No, Maybe, Spin Again, Prize A, Prize B"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '10px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* ================= TAB 3: NAME PICKER ================= */}
            {activeTab === 'names' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('namesTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('namesSubtitle')}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    rows={6}
                    value={namesInput}
                    onChange={(e) => setNamesInput(e.target.value)}
                    placeholder={tUI('namesPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                      lineHeight: '1.5',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {tUI('namesWinnersCount')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={namesWinnerCount}
                      onChange={(e) => setNamesWinnerCount(e.target.value)}
                      style={{
                        width: '80px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {namesError && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '16px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ⚠️ {namesError}
                  </div>
                )}

                <button
                  onClick={handleDrawNames}
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Trophy size={18} />
                  <span>{tUI('drawNamesButton')}</span>
                </button>

                {winners.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {tUI('winnersHeading')}
                      </span>
                      <button
                        onClick={handleCopyWinners}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: copiedWinners
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'var(--bg-page)',
                          color: copiedWinners ? '#34d399' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {copiedWinners ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedWinners ? tUI('copied') : tUI('copyAll')}</span>
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {winners.map((winner, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '14px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              color: '#34d399',
                              backgroundColor: 'rgba(16, 185, 129, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            #{idx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                            }}
                          >
                            {winner}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 4: PAIRING & TEAMS ================= */}
            {activeTab === 'pairs' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('pairsTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('pairsSubtitle')}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    rows={6}
                    value={pairsInput}
                    onChange={(e) => setPairsInput(e.target.value)}
                    placeholder={tUI('pairsPlaceholder')}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                      lineHeight: '1.5',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '18px',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                    }}
                  >
                    {tUI('pairModeLabel')}
                  </label>
                  <select
                    value={pairMode}
                    onChange={(e) => setPairMode(e.target.value as 'pairs' | 'teams')}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="pairs">{tUI('pairModePairs')}</option>
                    <option value="teams">{tUI('pairModeTeams')}</option>
                  </select>
                </div>

                {pairsError && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '16px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    ⚠️ {pairsError}
                  </div>
                )}

                <button
                  onClick={handleGeneratePairs}
                  style={{
                    width: '100%',
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <Shuffle size={18} />
                  <span>{tUI('generatePairsButton')}</span>
                </button>

                {/* Display Pairs or Teams */}
                {(pairedResults.length > 0 || teamA.length > 0) && (
                  <div style={{ marginTop: '24px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}
                      >
                        {tUI('pairsResultHeading')}
                      </span>
                      <button
                        onClick={handleCopyPairs}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: copiedPairs
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'var(--bg-page)',
                          color: copiedPairs ? '#34d399' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {copiedPairs ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedPairs ? tUI('copied') : tUI('copyAll')}</span>
                      </button>
                    </div>

                    {pairMode === 'pairs' ? (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '10px',
                        }}
                      >
                        {pairedResults.map((p, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px',
                              backgroundColor: 'var(--bg-page)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#60a5fa' }}>{p.a}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              ➔
                            </span>
                            <span style={{ fontWeight: 600, color: '#34d399' }}>{p.b}</span>
                          </div>
                        ))}
                        {oddParticipant && (
                          <div
                            style={{
                              gridColumn: '1 / -1',
                              padding: '10px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              color: '#fbbf24',
                            }}
                          >
                            ⚠️ Solo: <strong>{oddParticipant}</strong> {tUI('oddWarning')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '16px',
                        }}
                      >
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--bg-page)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          <h4 style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '10px' }}>
                            {tUI('teamAHeading')} ({teamA.length})
                          </h4>
                          <ul style={{ listStyle: 'disc inside', padding: 0, margin: 0 }}>
                            {teamA.map((member, i) => (
                              <li key={i} style={{ color: 'var(--text-main)', padding: '3px 0' }}>
                                {member}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--bg-page)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <h4 style={{ color: '#34d399', fontWeight: 700, marginBottom: '10px' }}>
                            {tUI('teamBHeading')} ({teamB.length})
                          </h4>
                          <ul style={{ listStyle: 'disc inside', padding: 0, margin: 0 }}>
                            {teamB.map((member, i) => (
                              <li key={i} style={{ color: 'var(--text-main)', padding: '3px 0' }}>
                                {member}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 5: LOTTERY PICKS ================= */}
            {activeTab === 'lottery' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('lotteryTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('lotterySubtitle')}
                  </p>
                </div>

                {/* Lottery Game Selector */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    marginBottom: '20px',
                  }}
                >
                  {[
                    { id: 'powerball', label: tUI('lotteryPowerball') },
                    { id: 'megamillions', label: tUI('lotteryMegaMillions') },
                    { id: 'euromillions', label: tUI('lotteryEuroMillions') },
                    { id: 'custom649', label: tUI('lotteryCustom') },
                  ].map((lotto) => {
                    const isSelected = lotteryType === lotto.id;
                    return (
                      <button
                        key={lotto.id}
                        onClick={() => setLotteryType(lotto.id as LotteryType)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: isSelected
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'var(--bg-page)',
                          border: isSelected
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                          color: isSelected ? '#60a5fa' : 'var(--text-main)',
                        }}
                      >
                        {lotto.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleGenerateLottery}
                  style={{
                    width: '100%',
                    backgroundColor: '#eab308',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)',
                  }}
                >
                  <Sparkles size={18} />
                  <span>{tUI('generateLottoButton')}</span>
                </button>

                {/* Display Lottery Balls */}
                {lottoMain.length > 0 && (
                  <div
                    style={{
                      marginTop: '24px',
                      padding: '20px',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <span
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}
                      >
                        {tUI('mainNumbersLabel')}
                      </span>
                      <button
                        onClick={handleCopyLotto}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: copiedLotto
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'var(--bg-card)',
                          color: copiedLotto ? '#34d399' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {copiedLotto ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedLotto ? tUI('copied') : tUI('copyAll')}</span>
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: lottoBonus.length > 0 ? '16px' : '0',
                      }}
                    >
                      {lottoMain.map((num, i) => (
                        <div
                          key={i}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow:
                              '0 4px 10px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
                            border: '2px solid #cbd5e1',
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    {lottoBonus.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#f87171',
                            marginBottom: '10px',
                          }}
                        >
                          {tUI('bonusNumbersLabel')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          {lottoBonus.map((bonus, i) => (
                            <div
                              key={i}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow:
                                  '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
                                border: '2px solid #fca5a5',
                              }}
                            >
                              {bonus}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 6: MOCK PHONE NUMBERS ================= */}
            {activeTab === 'phone' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tUI('phoneTitle')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tUI('phoneSubtitle')}
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('countryLabel')}
                    </label>
                    <select
                      value={phoneCountry}
                      onChange={(e) => setPhoneCountry(e.target.value as CountryCode)}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="US">🇺🇸 United States (+1 555)</option>
                      <option value="UK">🇬🇧 United Kingdom (+44 7700)</option>
                      <option value="IN">🇮🇳 India (+91 98XX)</option>
                      <option value="DE">🇩🇪 Germany (+49 151)</option>
                      <option value="CA">🇨🇦 Canada (+1 555)</option>
                      <option value="AU">🇦🇺 Australia (+61 491)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      {tUI('countLabel')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={phoneCount}
                      onChange={(e) =>
                        setPhoneCount(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))
                      }
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#60a5fa',
                    marginBottom: '16px',
                  }}
                >
                  ℹ️ {tUI('phoneDisclaimer')}
                </div>

                <button
                  onClick={generateMockPhones}
                  style={{
                    width: '100%',
                    backgroundColor: '#06b6d4',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <Phone size={18} />
                  <span>{tUI('generatePhoneButton')}</span>
                </button>

                {phoneList.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}
                      >
                        {tUI('generatedHeading', { count: phoneList.length })}
                      </span>
                      <button
                        onClick={handleCopyAllPhones}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: copiedAllPhones
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'var(--bg-page)',
                          color: copiedAllPhones ? '#34d399' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {copiedAllPhones ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedAllPhones ? tUI('copied') : tUI('copyAll')}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {phoneList.map((phone, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-page)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: 'var(--text-main)',
                            }}
                          >
                            {phone}
                          </span>
                          <button
                            onClick={() => handleCopySinglePhone(phone, idx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: copiedPhoneIdx === idx ? '#34d399' : 'var(--text-muted)',
                              cursor: 'pointer',
                            }}
                          >
                            {copiedPhoneIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedPhoneIdx === idx ? tUI('copied') : ''}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clean Comparison Table */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              overflowX: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {tUI('compareTitle')}
            </h3>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.86rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 700 }}>
                    {tUI('compareColFeature')}
                  </th>
                  <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>VelnoxLabs</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Google Spinner
                  </th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    PickerWheel
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow1Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow1Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Google')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Picker')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow2Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow2Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Google')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Picker')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow3Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow3Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Google')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Picker')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow4Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow4Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Google')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Picker')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Centralized SEO & Structured Schema - Zero Duplicate Inline JSON-LD */}
          <ToolSeoContent
            toolSlug="random-number-generator"
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
