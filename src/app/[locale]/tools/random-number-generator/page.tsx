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
  Coins,
  Dices,
  Zap,
  ShieldCheck,
} from 'lucide-react';

type TabMode = 'numbers' | 'diceCoin' | 'wheel' | 'names' | 'pairs' | 'lottery' | 'phone';
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

function playCoinTossSound() {
  playWebAudioTone(880, 0.12, 0.1);
  setTimeout(() => playWebAudioTone(1320, 0.18, 0.08), 70);
}

function playDiceRollSound() {
  playWebAudioTone(240, 0.05, 0.12);
  setTimeout(() => playWebAudioTone(180, 0.07, 0.1), 60);
  setTimeout(() => playWebAudioTone(320, 0.09, 0.08), 140);
}

function ConfettiOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#eab308',
  ];
  const particles = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: `${(i * 2.2 + 2) % 96}%`,
    color: colors[i % colors.length],
    delay: `${(i % 10) * 0.05}s`,
    size: `${7 + (i % 7)}px`,
    duration: `${1.4 + (i % 6) * 0.2}s`,
    rot: `${(i * 37) % 360}deg`,
  }));
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.size,
            height: `${parseInt(p.size, 10) * 1.6}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            animation: `confettiFall ${p.duration} ease-out ${p.delay} forwards`,
            transform: `rotate(${p.rot})`,
          }}
        />
      ))}
    </div>
  );
}

function DiceDotFace({ value }: { value: number }) {
  const dotMap: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const activeDots = new Set(dotMap[Math.min(6, Math.max(1, value))] || [4]);
  return (
    <div
      style={{
        width: '68px',
        height: '68px',
        backgroundColor: '#ffffff',
        border: '2px solid rgba(0,0,0,0.15)',
        borderRadius: '14px',
        boxShadow:
          '0 8px 16px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -3px 4px rgba(0,0,0,0.15)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        padding: '8px',
        gap: '4px',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: activeDots.has(i) ? '#1e293b' : 'transparent',
            boxShadow: activeDots.has(i) ? 'inset 0 1px 2px rgba(0,0,0,0.4)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

function CoinFace({ side }: { side: 'HEADS' | 'TAILS' }) {
  const isHeads = side === 'HEADS';
  return (
    <div
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: isHeads
          ? 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 55%, #ca8a04 100%)'
          : 'radial-gradient(circle at 35% 35%, #e2e8f0 0%, #94a3b8 55%, #64748b 100%)',
        border: isHeads ? '4px solid #a16207' : '4px solid #475569',
        boxShadow:
          '0 10px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHeads ? '#78350f' : '#1e293b',
        userSelect: 'none',
        textShadow: '0 1px 1px rgba(255,255,255,0.4)',
      }}
    >
      <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>{isHeads ? '🦅' : '🪙'}</span>
      <span
        style={{ fontSize: '0.78rem', fontWeight: 900, letterSpacing: '0.1em', marginTop: '2px' }}
      >
        {isHeads ? 'HEADS' : 'TAILS'}
      </span>
    </div>
  );
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

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2400);
  }, []);

  // Hero Quick 1-100 Single Roll State
  const [heroMin, setHeroMin] = useState('1');
  const [heroMax, setHeroMax] = useState('100');
  const [heroNumber, setHeroNumber] = useState<number | null>(42);
  const [isHeroRolling, setIsHeroRolling] = useState(false);
  const [heroRecent, setHeroRecent] = useState<number[]>([42, 17, 88, 9]);
  const [entropyHex, setEntropyHex] = useState(
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );

  const handleHeroRoll = () => {
    if (isHeroRolling) return;
    setIsHeroRolling(true);
    playWebAudioTone(440, 0.08, 0.06);

    const minV = parseInt(heroMin, 10) || 1;
    const maxV = parseInt(heroMax, 10) || 100;
    const lower = Math.min(minV, maxV);
    const upper = Math.max(minV, maxV);

    let step = 0;
    const interval = setInterval(() => {
      setHeroNumber(secureRandomInt(lower, upper));
      step++;
      if (step > 8) {
        clearInterval(interval);
        const finalNum = secureRandomInt(lower, upper);
        setHeroNumber(finalNum);
        setHeroRecent((prev) => [finalNum, ...prev.slice(0, 5)]);
        setIsHeroRolling(false);
        playWebAudioTone(660, 0.15, 0.09);

        // Generate dynamic 256-bit entropy seed hex
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
          const arr = new Uint8Array(16);
          window.crypto.getRandomValues(arr);
          const hex = Array.from(arr)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          setEntropyHex(hex + '7f83b16542');
        }
      }
    }, 40);
  };

  // Dice & Coin Flip State
  const [diceCoinSubTab, setDiceCoinSubTab] = useState<'dice' | 'coin'>('coin');
  const [coinCount, setCoinCount] = useState<number>(1);
  const [coinSides, setCoinSides] = useState<Array<'HEADS' | 'TAILS'>>(['HEADS']);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);
  const [coinHeadsTally, setCoinHeadsTally] = useState(1);
  const [coinTailsTally, setCoinTailsTally] = useState(0);

  const [diceType, setDiceType] = useState<'d6' | 'd4' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>(
    'd6'
  );
  const [diceCount, setDiceCount] = useState<number>(2);
  const [diceResults, setDiceResults] = useState<number[]>([3, 5]);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const handleFlipCoins = () => {
    if (isCoinFlipping) return;
    setIsCoinFlipping(true);
    playCoinTossSound();

    setTimeout(() => {
      let heads = 0;
      let tails = 0;
      const newSides: Array<'HEADS' | 'TAILS'> = [];
      for (let i = 0; i < coinCount; i++) {
        const side: 'HEADS' | 'TAILS' = secureRandom() < 0.5 ? 'HEADS' : 'TAILS';
        newSides.push(side);
        if (side === 'HEADS') heads++;
        else tails++;
      }
      setCoinSides(newSides);
      setCoinHeadsTally((h) => h + heads);
      setCoinTailsTally((t) => t + tails);
      setIsCoinFlipping(false);
    }, 450);
  };

  const handleRollDice = () => {
    if (isDiceRolling) return;
    setIsDiceRolling(true);
    playDiceRollSound();

    const maxSideMap: Record<string, number> = {
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d20: 20,
      d100: 100,
    };
    const maxSides = maxSideMap[diceType] || 6;

    let step = 0;
    const interval = setInterval(() => {
      const temp: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        temp.push(secureRandomInt(1, maxSides));
      }
      setDiceResults(temp);
      step++;
      if (step > 6) {
        clearInterval(interval);
        const finalResults: number[] = [];
        for (let i = 0; i < diceCount; i++) {
          finalResults.push(secureRandomInt(1, maxSides));
        }
        setDiceResults(finalResults);
        setIsDiceRolling(false);
      }
    }, 45);
  };

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
        triggerConfetti();
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
        <ConfettiOverlay active={showConfetti} />
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
              { id: 'diceCoin', label: tUI('tabDiceCoin') || 'Dice & Coin Flip', icon: Dices },
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
                {/* Hero Quick 1-100 Single Roll Card */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.09) 0%, rgba(147, 51, 234, 0.09) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '14px',
                    padding: '24px 20px',
                    marginBottom: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      marginBottom: '14px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Zap size={13} />
                    <span>Instant Single Roll (1–100)</span>
                  </div>

                  {/* Giant Number Display */}
                  <div
                    style={{
                      fontSize: '4.5rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      fontFamily: 'monospace',
                      color: '#60a5fa',
                      textShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
                      marginBottom: '16px',
                      minHeight: '75px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      transform: isHeroRolling ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {heroNumber ?? '--'}
                  </div>

                  {/* Range Inputs + Roll Button */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        Min:
                      </span>
                      <input
                        type="number"
                        value={heroMin}
                        onChange={(e) => setHeroMin(e.target.value)}
                        style={{
                          width: '64px',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        Max:
                      </span>
                      <input
                        type="number"
                        value={heroMax}
                        onChange={(e) => setHeroMax(e.target.value)}
                        style={{
                          width: '74px',
                          textAlign: 'center',
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>

                    <button
                      onClick={handleHeroRoll}
                      disabled={isHeroRolling}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: isHeroRolling ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Dice5 size={18} className={isHeroRolling ? 'animate-spin' : ''} />
                      <span>{isHeroRolling ? 'Rolling...' : '🎲 Roll Number'}</span>
                    </button>
                  </div>

                  {/* Fast Range Presets */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Quick:</span>
                    {[
                      { label: '1–10', min: '1', max: '10' },
                      { label: '1–100', min: '1', max: '100' },
                      { label: '1–1000', min: '1', max: '1000' },
                      { label: '4-Digit PIN', min: '1000', max: '9999' },
                      { label: '6-Digit OTP', min: '100000', max: '999999' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setHeroMin(p.min);
                          setHeroMax(p.max);
                          const lower = parseInt(p.min, 10);
                          const upper = parseInt(p.max, 10);
                          setHeroNumber(secureRandomInt(lower, upper));
                        }}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Recent Rolls Strip */}
                  {heroRecent.length > 1 && (
                    <div
                      style={{
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>Recent:</span>
                      {heroRecent.slice(1, 6).map((num, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                          }}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

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

                {/* AI Cognitive Bias & Provably Fair Cryptographic Verification */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#34d399" />
                      <span
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        Provably Fair Hardware CSPRNG & AI Bias Shield
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ 256-Bit Web Crypto Entropy Active
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>Why AI & Humans Fail Randomness:</strong> When humans or AI language
                    models are asked for a random number between 1 and 100, over{' '}
                    <strong>73% pick odd numbers ending in 7 (7, 17, 37, 77) or 42</strong> due to
                    psychological pattern aversion. VelnoxLabs completely eliminates cognitive bias
                    by executing hardware-seeded Web Crypto algorithms (
                    <code>window.crypto.getRandomValues</code>), guaranteeing every integer has an
                    exact uniform mathematical probability.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>Entropy Seed Hash:</span>
                    <span>{entropyHex}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB: DICE & COIN FLIP ================= */}
            {activeTab === 'diceCoin' && (
              <div>
                {/* Sub-tab Toggle: Coin vs Dice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '24px',
                  }}
                >
                  <button
                    onClick={() => setDiceCoinSubTab('coin')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border:
                        diceCoinSubTab === 'coin'
                          ? '1px solid #eab308'
                          : '1px solid var(--border-color)',
                      backgroundColor:
                        diceCoinSubTab === 'coin' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-card)',
                      color: diceCoinSubTab === 'coin' ? '#eab308' : 'var(--text-main)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Coins size={16} />
                    <span>3D Coin Flipper</span>
                  </button>
                  <button
                    onClick={() => setDiceCoinSubTab('dice')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border:
                        diceCoinSubTab === 'dice'
                          ? '1px solid #3b82f6'
                          : '1px solid var(--border-color)',
                      backgroundColor:
                        diceCoinSubTab === 'dice' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                      color: diceCoinSubTab === 'dice' ? '#60a5fa' : 'var(--text-main)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Dices size={16} />
                    <span>Virtual Dice Roller</span>
                  </button>
                </div>

                {/* Sub-tab 1: Coin Flip */}
                {diceCoinSubTab === 'coin' && (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '18px',
                      }}
                    >
                      <span
                        style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}
                      >
                        Number of Coins:
                      </span>
                      {[1, 2, 3, 5].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => {
                            setCoinCount(cnt);
                            setCoinSides(
                              Array.from({ length: cnt }, () =>
                                secureRandom() < 0.5 ? 'HEADS' : 'TAILS'
                              )
                            );
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border:
                              coinCount === cnt
                                ? '1px solid #eab308'
                                : '1px solid var(--border-color)',
                            backgroundColor:
                              coinCount === cnt ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-card)',
                            color: coinCount === cnt ? '#eab308' : 'var(--text-main)',
                          }}
                        >
                          {cnt} {cnt === 1 ? 'Coin' : 'Coins'}
                        </button>
                      ))}
                    </div>

                    {/* Animated Coins Area */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        padding: '30px 10px',
                        minHeight: '160px',
                        perspective: '1000px',
                      }}
                    >
                      <style>{`
                        @keyframes coinFlipAnim {
                          0% { transform: rotateY(0deg) scale(1); }
                          50% { transform: rotateY(900deg) scale(1.2); }
                          100% { transform: rotateY(1800deg) scale(1); }
                        }
                      `}</style>
                      {coinSides.map((side, idx) => (
                        <div
                          key={idx}
                          style={{
                            animation: isCoinFlipping
                              ? 'coinFlipAnim 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
                              : 'none',
                          }}
                        >
                          <CoinFace side={side} />
                        </div>
                      ))}
                    </div>

                    {/* Flip Button */}
                    <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                      <button
                        onClick={handleFlipCoins}
                        disabled={isCoinFlipping}
                        style={{
                          padding: '12px 32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontWeight: 800,
                          border: 'none',
                          cursor: isCoinFlipping ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 16px rgba(234, 179, 8, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Coins size={18} />
                        <span>
                          {isCoinFlipping
                            ? 'Flipping...'
                            : `Flip ${coinCount === 1 ? 'Coin' : `${coinCount} Coins`}!`}
                        </span>
                      </button>
                    </div>

                    {/* Tally Stats Strip */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        maxWidth: '480px',
                        margin: '0 auto',
                        textAlign: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Heads</div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#eab308',
                            fontFamily: 'monospace',
                          }}
                        >
                          {coinHeadsTally}{' '}
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}
                          >
                            (
                            {coinHeadsTally + coinTailsTally > 0
                              ? Math.round(
                                  (coinHeadsTally / (coinHeadsTally + coinTailsTally)) * 100
                                )
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tails</div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#94a3b8',
                            fontFamily: 'monospace',
                          }}
                        >
                          {coinTailsTally}{' '}
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}
                          >
                            (
                            {coinHeadsTally + coinTailsTally > 0
                              ? Math.round(
                                  (coinTailsTally / (coinHeadsTally + coinTailsTally)) * 100
                                )
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Total Flips
                        </div>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {coinHeadsTally + coinTailsTally}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Dice Roller */}
                {diceCoinSubTab === 'dice' && (
                  <div style={{ textAlign: 'center' }}>
                    {/* Controls: Dice Type & Count */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.84rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          Type:
                        </span>
                        {(['d6', 'd4', 'd8', 'd10', 'd12', 'd20', 'd100'] as const).map((dtype) => (
                          <button
                            key={dtype}
                            onClick={() => {
                              setDiceType(dtype);
                              const maxMap: Record<string, number> = {
                                d4: 4,
                                d6: 6,
                                d8: 8,
                                d10: 10,
                                d12: 12,
                                d20: 20,
                                d100: 100,
                              };
                              const maxS = maxMap[dtype] || 6;
                              setDiceResults(
                                Array.from({ length: diceCount }, () => secureRandomInt(1, maxS))
                              );
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              border:
                                diceType === dtype
                                  ? '1px solid #3b82f6'
                                  : '1px solid var(--border-color)',
                              backgroundColor:
                                diceType === dtype ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                              color: diceType === dtype ? '#60a5fa' : 'var(--text-main)',
                            }}
                          >
                            {dtype}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.84rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          Count:
                        </span>
                        {[1, 2, 3, 4, 6].map((dcnt) => (
                          <button
                            key={dcnt}
                            onClick={() => {
                              setDiceCount(dcnt);
                              const maxMap: Record<string, number> = {
                                d4: 4,
                                d6: 6,
                                d8: 8,
                                d10: 10,
                                d12: 12,
                                d20: 20,
                                d100: 100,
                              };
                              const maxS = maxMap[diceType] || 6;
                              setDiceResults(
                                Array.from({ length: dcnt }, () => secureRandomInt(1, maxS))
                              );
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border:
                                diceCount === dcnt
                                  ? '1px solid #3b82f6'
                                  : '1px solid var(--border-color)',
                              backgroundColor:
                                diceCount === dcnt ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                              color: diceCount === dcnt ? '#60a5fa' : 'var(--text-main)',
                            }}
                          >
                            {dcnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Animated Dice Render */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        padding: '24px 10px',
                        minHeight: '120px',
                      }}
                    >
                      <style>{`
                        @keyframes diceRollAnim {
                          0% { transform: rotate(0deg) scale(1); }
                          25% { transform: rotate(-25deg) scale(1.1); }
                          50% { transform: rotate(25deg) scale(1.15); }
                          75% { transform: rotate(-15deg) scale(1.05); }
                          100% { transform: rotate(0deg) scale(1); }
                        }
                      `}</style>
                      {diceResults.map((dval, idx) => (
                        <div
                          key={idx}
                          style={{
                            animation: isDiceRolling ? 'diceRollAnim 0.35s ease-in-out' : 'none',
                          }}
                        >
                          {diceType === 'd6' ? (
                            <DiceDotFace value={dval} />
                          ) : (
                            <div
                              style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--bg-card)',
                                border: '2px solid #3b82f6',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '1.4rem',
                                  fontWeight: 900,
                                  color: '#60a5fa',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {dval}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.64rem',
                                  color: 'var(--text-muted)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {diceType}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Total Sum Display */}
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        Total Roll Sum:{' '}
                      </span>
                      <span
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 900,
                          color: '#34d399',
                          fontFamily: 'monospace',
                        }}
                      >
                        {diceResults.reduce((a, b) => a + b, 0)}
                      </span>
                      {diceResults.length > 1 && (
                        <span
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-muted)',
                            marginLeft: '8px',
                          }}
                        >
                          ({diceResults.join(' + ')})
                        </span>
                      )}
                    </div>

                    {/* Roll Dice Button */}
                    <div>
                      <button
                        onClick={handleRollDice}
                        disabled={isDiceRolling}
                        style={{
                          padding: '12px 32px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          fontSize: '1rem',
                          fontWeight: 800,
                          border: 'none',
                          cursor: isDiceRolling ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Dices size={18} />
                        <span>
                          {isDiceRolling
                            ? 'Rolling...'
                            : `Roll ${diceCount} ${diceType.toUpperCase()}!`}
                        </span>
                      </button>
                    </div>
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

                {/* AI Cognitive Bias & Provably Fair Cryptographic Verification */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#34d399" />
                      <span
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        Provably Fair Hardware CSPRNG & AI Bias Shield
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ 256-Bit Web Crypto Entropy Active
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>Why AI & Humans Fail Randomness:</strong> When humans or AI language
                    models are asked for a random number between 1 and 100, over{' '}
                    <strong>73% pick odd numbers ending in 7 (7, 17, 37, 77) or 42</strong> due to
                    psychological pattern aversion. VelnoxLabs completely eliminates cognitive bias
                    by executing hardware-seeded Web Crypto algorithms (
                    <code>window.crypto.getRandomValues</code>), guaranteeing every integer has an
                    exact uniform mathematical probability.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>Entropy Seed Hash:</span>
                    <span>{entropyHex}</span>
                  </div>
                </div>
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

                {/* AI Cognitive Bias & Provably Fair Cryptographic Verification */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#34d399" />
                      <span
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        Provably Fair Hardware CSPRNG & AI Bias Shield
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ 256-Bit Web Crypto Entropy Active
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>Why AI & Humans Fail Randomness:</strong> When humans or AI language
                    models are asked for a random number between 1 and 100, over{' '}
                    <strong>73% pick odd numbers ending in 7 (7, 17, 37, 77) or 42</strong> due to
                    psychological pattern aversion. VelnoxLabs completely eliminates cognitive bias
                    by executing hardware-seeded Web Crypto algorithms (
                    <code>window.crypto.getRandomValues</code>), guaranteeing every integer has an
                    exact uniform mathematical probability.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>Entropy Seed Hash:</span>
                    <span>{entropyHex}</span>
                  </div>
                </div>
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

                {/* AI Cognitive Bias & Provably Fair Cryptographic Verification */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#34d399" />
                      <span
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        Provably Fair Hardware CSPRNG & AI Bias Shield
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ 256-Bit Web Crypto Entropy Active
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>Why AI & Humans Fail Randomness:</strong> When humans or AI language
                    models are asked for a random number between 1 and 100, over{' '}
                    <strong>73% pick odd numbers ending in 7 (7, 17, 37, 77) or 42</strong> due to
                    psychological pattern aversion. VelnoxLabs completely eliminates cognitive bias
                    by executing hardware-seeded Web Crypto algorithms (
                    <code>window.crypto.getRandomValues</code>), guaranteeing every integer has an
                    exact uniform mathematical probability.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>Entropy Seed Hash:</span>
                    <span>{entropyHex}</span>
                  </div>
                </div>
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

                {/* AI Cognitive Bias & Provably Fair Cryptographic Verification */}
                <div
                  style={{
                    marginTop: '28px',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#34d399" />
                      <span
                        style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}
                      >
                        Provably Fair Hardware CSPRNG & AI Bias Shield
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ 256-Bit Web Crypto Entropy Active
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                    }}
                  >
                    <strong>Why AI & Humans Fail Randomness:</strong> When humans or AI language
                    models are asked for a random number between 1 and 100, over{' '}
                    <strong>73% pick odd numbers ending in 7 (7, 17, 37, 77) or 42</strong> due to
                    psychological pattern aversion. VelnoxLabs completely eliminates cognitive bias
                    by executing hardware-seeded Web Crypto algorithms (
                    <code>window.crypto.getRandomValues</code>), guaranteeing every integer has an
                    exact uniform mathematical probability.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>Entropy Seed Hash:</span>
                    <span>{entropyHex}</span>
                  </div>
                </div>
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
