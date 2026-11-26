'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Volume2,
  Vibrate,
  Sparkles,
  Sliders,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Speaker,
  ShieldCheck,
  Lightbulb,
  Activity,
} from 'lucide-react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type Mode = 'sound' | 'vibrate' | 'dust10k' | 'custom';
type Channel = 'both' | 'left' | 'right';
type PlayState = 'idle' | 'playing' | 'paused' | 'completed';
type TestChannel = 'left' | 'right' | 'both' | null;

const TOTAL_SECONDS = 30;
const RING_RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const PRESET_FREQS = [165, 250, 440, 2000, 10000];
const VISUALIZER_BARS = [35, 60, 85, 50, 95, 70, 45, 90, 65, 80, 55, 100, 60, 75, 45, 70];

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return win.AudioContext || win.webkitAudioContext || null;
}

export default function FixMySpeakerPage() {
  const tUI = useTranslations('ToolUI.fixMySpeaker');

  const [mode, setMode] = useState<Mode>('sound');
  const [channel, setChannel] = useState<Channel>('both');
  const [customFreq, setCustomFreq] = useState<number>(165);
  const [autoSweep, setAutoSweep] = useState<boolean>(false);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [testingChannel, setTestingChannel] = useState<TestChannel>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vibrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sweepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web Audio refs for 10,000 Hz & Custom Frequency modes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  const stopWebAudio = useCallback(() => {
    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // Ignore already stopped oscillator
      }
      oscRef.current = null;
    }
    if (gainRef.current) {
      try {
        gainRef.current.disconnect();
      } catch {
        // Ignore
      }
      gainRef.current = null;
    }
    if (pannerRef.current) {
      try {
        pannerRef.current.disconnect();
      } catch {
        // Ignore
      }
      pannerRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        // Ignore
      }
      audioCtxRef.current = null;
    }
  }, []);

  const stopMediaAndTimers = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
    stopWebAudio();
  }, [stopWebAudio]);

  useEffect(() => {
    return () => {
      stopMediaAndTimers();
    };
  }, [stopMediaAndTimers]);

  // Update stereo panner live if changed during playback
  useEffect(() => {
    if (pannerRef.current && audioCtxRef.current) {
      const panVal = channel === 'left' ? -1 : channel === 'right' ? 1 : 0;
      pannerRef.current.pan.setValueAtTime(panVal, audioCtxRef.current.currentTime);
    }
  }, [channel]);

  // Update custom frequency live if slider changes while playing
  useEffect(() => {
    if (
      mode === 'custom' &&
      !autoSweep &&
      oscRef.current &&
      audioCtxRef.current &&
      playState === 'playing'
    ) {
      oscRef.current.frequency.setValueAtTime(customFreq, audioCtxRef.current.currentTime);
    }
  }, [customFreq, mode, autoSweep, playState]);

  const startWebAudioTone = useCallback(
    (targetMode: 'dust10k' | 'custom', startSecondsRemaining: number) => {
      stopWebAudio();
      const Ctx = getAudioContextClass();
      if (!Ctx) return;

      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      const panVal = channel === 'left' ? -1 : channel === 'right' ? 1 : 0;
      panner.pan.setValueAtTime(panVal, ctx.currentTime);

      if (targetMode === 'dust10k') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(10000, ctx.currentTime);
        gain.gain.setValueAtTime(0.85, ctx.currentTime);
      } else {
        osc.type = 'sine';
        const initialFreq = autoSweep ? 165 : customFreq;
        osc.frequency.setValueAtTime(initialFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.85, ctx.currentTime);

        if (autoSweep) {
          const startTs = Date.now();
          const durationMs = Math.max(startSecondsRemaining, 1) * 1000;
          sweepIntervalRef.current = setInterval(() => {
            if (!oscRef.current || !audioCtxRef.current) return;
            const elapsed = Date.now() - startTs;
            const ratio = Math.min(elapsed / durationMs, 1);
            const swept = Math.round(165 + (10000 - 165) * ratio);
            oscRef.current.frequency.setValueAtTime(swept, audioCtxRef.current.currentTime);
            setCustomFreq(swept);
          }, 120);
        }
      }

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      pannerRef.current = panner;
    },
    [autoSweep, channel, customFreq, stopWebAudio]
  );

  const startTimer = useCallback(
    (initialSeconds: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      let remaining = initialSeconds;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          stopMediaAndTimers();
          setPlayState('completed');
        }
      }, 1000);
    },
    [stopMediaAndTimers]
  );

  const startVibrateLoop = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100]);
      vibrateIntervalRef.current = setInterval(() => {
        navigator.vibrate([300, 100, 300, 100]);
      }, 900);
    }
  }, []);

  const handleStart = () => {
    stopMediaAndTimers();
    setSecondsLeft(TOTAL_SECONDS);
    setPlayState('playing');

    if (mode === 'sound' || mode === 'vibrate') {
      const audioSrc = mode === 'sound' ? '/sounds/sound.mp3' : '/sounds/vibrate.mp3';
      const audio = new Audio(audioSrc);
      audio.loop = true;
      audioRef.current = audio;
      audio.play().catch(() => {});
      if (mode === 'vibrate') {
        startVibrateLoop();
      }
    } else {
      startWebAudioTone(mode, TOTAL_SECONDS);
    }

    startTimer(TOTAL_SECONDS);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0);
    }
    stopWebAudio();
    setPlayState('paused');
  };

  const handleResume = () => {
    setPlayState('playing');
    if (mode === 'sound' || mode === 'vibrate') {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      if (mode === 'vibrate') {
        startVibrateLoop();
      }
    } else {
      startWebAudioTone(mode, secondsLeft);
    }
    startTimer(secondsLeft);
  };

  const handleStop = () => {
    stopMediaAndTimers();
    setPlayState('idle');
    setSecondsLeft(TOTAL_SECONDS);
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    stopMediaAndTimers();
    setMode(newMode);
    setPlayState('idle');
    setSecondsLeft(TOTAL_SECONDS);
    if (newMode === 'dust10k') {
      setAutoSweep(false);
    }
  };

  const runSpeakerTest = (target: 'left' | 'right' | 'both') => {
    const Ctx = getAudioContextClass();
    if (!Ctx) return;

    setTestingChannel(target);
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    panner.pan.setValueAtTime(target === 'left' ? -1 : target === 'right' ? 1 : 0, ctx.currentTime);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.78);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        // Ignore
      }
      setTestingChannel((prev) => (prev === target ? null : prev));
    }, 820);
  };

  const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const statusText =
    playState === 'playing'
      ? tUI('cleaning')
      : playState === 'paused'
        ? tUI('paused')
        : playState === 'completed'
          ? tUI('completed')
          : tUI('ready');

  const activeModeDescription =
    mode === 'sound'
      ? tUI('soundDescription')
      : mode === 'vibrate'
        ? tUI('vibrateDescription')
        : mode === 'dust10k'
          ? tUI('dust10kDescription')
          : tUI('customDescription');

  const activeBadgeText =
    mode === 'sound'
      ? '165–250 Hz'
      : mode === 'vibrate'
        ? 'Haptic + Audio'
        : mode === 'dust10k'
          ? '10,000 Hz'
          : `${customFreq} Hz`;

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tUI('title'),
        operatingSystem: 'All (iOS, Android, Windows, macOS)',
        applicationCategory: 'UtilitiesApplication',
        url: 'https://www.velnoxlabs.com/tools/fix-my-speaker',
        description: tUI('subtitle'),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Water Eject Sound Wave (165–250 Hz)',
          'Haptic Vibrate & Acoustic Cleaning',
          '10,000 Hz Dust Cleaning Frequency',
          'Custom Frequency Generator & Auto-Sweep (100–12000 Hz)',
          'Left / Right / Stereo Channel Control & Speaker Test',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: tUI('faq1Q'),
            acceptedAnswer: { '@type': 'Answer', text: tUI('faq1A') },
          },
          {
            '@type': 'Question',
            name: tUI('faq2Q'),
            acceptedAnswer: { '@type': 'Answer', text: tUI('faq2A') },
          },
          {
            '@type': 'Question',
            name: tUI('faq3Q'),
            acceptedAnswer: { '@type': 'Answer', text: tUI('faq3A') },
          },
          {
            '@type': 'Question',
            name: tUI('faq4Q'),
            acceptedAnswer: { '@type': 'Answer', text: tUI('faq4A') },
          },
        ],
      },
    ],
  };

  const modes: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: 'sound', label: tUI('modeSound'), icon: <Volume2 size={16} /> },
    { id: 'vibrate', label: tUI('modeVibrate'), icon: <Vibrate size={16} /> },
    { id: 'dust10k', label: tUI('modeDust10k'), icon: <Sparkles size={16} /> },
    { id: 'custom', label: tUI('modeCustom'), icon: <Sliders size={16} /> },
  ];

  const channels: { id: Channel; label: string }[] = [
    { id: 'both', label: tUI('channelBoth') },
    { id: 'left', label: tUI('channelLeft') },
    { id: 'right', label: tUI('channelRight') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer>
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Main Interactive Cleaner Card */}
          <div
            style={{
              maxWidth: '640px',
              margin: 'var(--space-6) auto 0',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '28px 24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* 4-Mode Selector */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              {modes.map((m) => {
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: active
                        ? '1px solid var(--accent-primary)'
                        : '1px solid var(--border-color)',
                      backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: active ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Mode Description + Frequency Badge */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.86rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  flex: '1 1 260px',
                }}
              >
                {activeModeDescription}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <Activity size={13} />
                {activeBadgeText}
              </span>
            </div>

            {/* Web Audio Controls (Channel Selector + Custom Hz Controls) */}
            {(mode === 'dust10k' || mode === 'custom') && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '22px',
                }}
              >
                {/* Stereo Channel Selector */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: mode === 'custom' ? '14px' : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                    }}
                  >
                    {tUI('channelLabel')}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {channels.map((ch) => {
                      const selected = channel === ch.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setChannel(ch.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: selected
                              ? '1px solid var(--accent-primary)'
                              : '1px solid var(--border-color)',
                            backgroundColor: selected ? 'var(--accent-primary)' : 'var(--bg-card)',
                            color: selected ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hz Slider + Presets + Auto-Sweep */}
                {mode === 'custom' && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '14px',
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
                      <label
                        htmlFor="custom-hz-slider"
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                        }}
                      >
                        {tUI('frequencyLabel')}:{' '}
                        <strong style={{ color: 'var(--accent-primary)' }}>{customFreq} Hz</strong>
                      </label>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={autoSweep}
                          onChange={(e) => setAutoSweep(e.target.checked)}
                        />
                        {tUI('autoSweepLabel')}
                      </label>
                    </div>

                    <input
                      id="custom-hz-slider"
                      type="range"
                      min={100}
                      max={12000}
                      step={5}
                      value={customFreq}
                      disabled={autoSweep}
                      onChange={(e) => setCustomFreq(Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: 'var(--accent-primary)',
                        cursor: autoSweep ? 'not-allowed' : 'pointer',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        marginTop: '10px',
                      }}
                    >
                      {PRESET_FREQS.map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => {
                            setAutoSweep(false);
                            setCustomFreq(freq);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            border:
                              !autoSweep && customFreq === freq
                                ? '1px solid var(--accent-primary)'
                                : '1px solid var(--border-color)',
                            backgroundColor:
                              !autoSweep && customFreq === freq
                                ? 'var(--accent-primary)'
                                : 'var(--bg-card)',
                            color:
                              !autoSweep && customFreq === freq ? '#ffffff' : 'var(--text-muted)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {freq >= 1000 ? `${freq / 1000} kHz` : `${freq} Hz`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Circular Timer Ring */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10px 0 18px',
              }}
            >
              <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                <svg
                  width="220"
                  height="220"
                  viewBox="0 0 220 220"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx="110"
                    cy="110"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={playState === 'completed' ? '#10b981' : 'var(--accent-primary)'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.35s linear' }}
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  {playState === 'completed' ? (
                    <CheckCircle2 size={44} color="#10b981" style={{ marginBottom: '6px' }} />
                  ) : (
                    <span
                      style={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {secondsLeft}s
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color:
                        playState === 'completed'
                          ? '#10b981'
                          : playState === 'playing'
                            ? 'var(--accent-primary)'
                            : 'var(--text-muted)',
                      marginTop: '8px',
                    }}
                  >
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Acoustic Visualizer Bars */}
              <div
                aria-hidden="true"
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '5px',
                  height: '32px',
                  marginTop: '12px',
                }}
              >
                {VISUALIZER_BARS.map((heightPct, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: '5px',
                      height: playState === 'playing' ? `${heightPct}%` : '22%',
                      borderRadius: '999px',
                      backgroundColor:
                        playState === 'playing' ? 'var(--accent-primary)' : 'var(--border-color)',
                      transition: `height ${0.18 + (idx % 4) * 0.08}s ease`,
                      opacity: playState === 'playing' ? 0.9 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {(playState === 'idle' || playState === 'completed') && (
                <button
                  type="button"
                  onClick={handleStart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '13px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={18} />
                  {tUI('startCleaning')}
                </button>
              )}

              {playState === 'playing' && (
                <>
                  <button
                    type="button"
                    onClick={handlePause}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Pause size={17} />
                    {tUI('pause')}
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Square size={16} />
                    {tUI('stop')}
                  </button>
                </>
              )}

              {playState === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={handleResume}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Play size={17} />
                    {tUI('resume')}
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 22px',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Square size={16} />
                    {tUI('stop')}
                  </button>
                </>
              )}
            </div>

            {/* Post-Cleaning Stereo Speaker Test Bar */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                }}
              >
                <Speaker size={15} />
                <span>{tUI('speakerTestTitle')}</span>
              </div>
              <div
                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}
              >
                {(['left', 'both', 'right'] as const).map((target) => {
                  const active = testingChannel === target;
                  const label =
                    target === 'left'
                      ? tUI('testLeft')
                      : target === 'right'
                        ? tUI('testRight')
                        : tUI('testStereo');
                  return (
                    <button
                      key={target}
                      type="button"
                      onClick={() => runSpeakerTest(target)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: active
                          ? '1px solid var(--accent-primary)'
                          : '1px solid var(--border-color)',
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: active ? '#ffffff' : 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Privacy Trust Pill */}
          <div
            style={{
              maxWidth: '640px',
              margin: '16px auto 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <ShieldCheck size={16} color="#10b981" />
            <span>{tUI('privacyNotice')}</span>
          </div>

          {/* Pro Tips Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px 28px',
              marginTop: 'var(--space-6)',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lightbulb size={18} color="var(--accent-primary)" />
              {tUI('tipsTitle')}
            </h3>
            <ul
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.86rem',
                lineHeight: 1.7,
                paddingLeft: '20px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <li>{tUI('tip1')}</li>
              <li>{tUI('tip2')}</li>
              <li>{tUI('tip3')}</li>
              <li>{tUI('tip4')}</li>
            </ul>
          </div>

          {/* Clean Comparison Table */}
          <div
            style={{
              maxWidth: '780px',
              margin: 'var(--space-8) auto 0',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
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
                  <th style={{ padding: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    VelnoxLabs
                  </th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    FixMySpeaker.com
                  </th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tUI('compareColApps')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow1Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>
                    {tUI('compareRow1Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Fms')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Apps')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow2Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>
                    {tUI('compareRow2Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Fms')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Apps')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow3Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>
                    {tUI('compareRow3Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Fms')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Apps')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow4Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>
                    {tUI('compareRow4Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Fms')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Apps')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SEO Content Component */}
          <ToolSeoContent
            toolSlug="fix-my-speaker"
            toolName={tUI('title')}
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
