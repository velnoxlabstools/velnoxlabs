'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  Smartphone,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

type Mode = 'sound' | 'vibrate';

const TOTAL_SECONDS = 30;

export default function FixMySpeakerPage() {
  const tUI = useTranslations('ToolUI.fixMySpeaker');

  const [mode, setMode] = useState<Mode>('sound');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const vibrateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio paths
  const getAudioPath = (currentMode: Mode) => {
    return currentMode === 'sound' ? '/sounds/sound.mp3' : '/sounds/vibrate.mp3';
  };

  // Vibration trigger helper for mobile devices
  const startVibration = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100]);
        if (!vibrateIntervalRef.current) {
          vibrateIntervalRef.current = setInterval(() => {
            try {
              navigator.vibrate([300, 100, 300, 100]);
            } catch {}
          }, 800);
        }
      } catch {}
    }
  };

  const stopVibration = () => {
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  };

  // Switch mode
  const handleModeChange = (newMode: Mode) => {
    if (mode === newMode) return;
    setMode(newMode);

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = getAudioPath(newMode);
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      if (newMode === 'vibrate') {
        startVibration();
      } else {
        stopVibration();
      }
    }
  };

  // Start / Play
  const handlePlay = () => {
    if (isCompleted || secondsLeft <= 0) {
      setSecondsLeft(TOTAL_SECONDS);
      setIsCompleted(false);
    }
    setIsPlaying(true);
    setIsPaused(false);

    if (!audioRef.current) {
      audioRef.current = new Audio(getAudioPath(mode));
      audioRef.current.loop = true;
    } else {
      audioRef.current.src = getAudioPath(mode);
      audioRef.current.loop = true;
    }

    audioRef.current.play().catch((err) => {
      console.warn('Audio play request interrupted or blocked:', err);
    });

    if (mode === 'vibrate') {
      startVibration();
    }
  };

  // Pause
  const handlePause = () => {
    setIsPlaying(false);
    setIsPaused(true);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopVibration();
  };

  // Resume
  const handleResume = () => {
    setIsPlaying(true);
    setIsPaused(false);

    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    if (mode === 'vibrate') {
      startVibration();
    }
  };

  // Stop & Reset
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsCompleted(false);
    setSecondsLeft(TOTAL_SECONDS);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopVibration();
  };

  // Timer interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Completed 30s cycle
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            stopVibration();
            setIsPlaying(false);
            setIsPaused(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopVibration();
    };
  }, []);

  // Gauge calculations
  const elapsed = TOTAL_SECONDS - secondsLeft;
  const progress = isCompleted ? 100 : Math.min(100, Math.max(0, (elapsed / TOTAL_SECONDS) * 100));

  const ringRadius = 96;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'VelnoxLabs Fix My Speaker',
        operatingSystem: 'All',
        applicationCategory: 'UtilityApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Eject water and clear dust from phone, tablet, and laptop speakers using tuned acoustic sound waves and vibration pulses.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does Fix My Speaker eject water from phone speakers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Fix My Speaker plays low-frequency and high-frequency sound waves that create strong acoustic air vibrations. These vibrations push trapped water droplets and dust particles out of the speaker grills.',
            },
          },
          {
            '@type': 'Question',
            name: 'What volume should I use while running the speaker cleaner?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Turn your device volume all the way up to 100% to generate the maximum acoustic vibration necessary to dislodge water.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Fix My Speaker free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VelnoxLabs Fix My Speaker is 100% free with no app download or sign-up required. It works directly in any web browser.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          {/* Centered Main Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '36px 24px',
              marginTop: 'var(--space-6)',
              maxWidth: '540px',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Mode Toggle: Sleek pill-shaped switch */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '4px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => handleModeChange('sound')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: mode === 'sound' ? '#2563eb' : 'transparent',
                  color: mode === 'sound' ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: mode === 'sound' ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
                }}
              >
                <Volume2 style={{ width: '16px', height: '16px' }} />
                <span>{tUI('modeSound')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('vibrate')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: mode === 'vibrate' ? '#2563eb' : 'transparent',
                  color: mode === 'vibrate' ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: mode === 'vibrate' ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
                }}
              >
                <Smartphone style={{ width: '16px', height: '16px' }} />
                <span>{tUI('modeVibrate')}</span>
              </button>
            </div>

            {/* Mode Description */}
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.825rem',
                marginTop: '12px',
                marginBottom: '28px',
                minHeight: '36px',
                lineHeight: 1.5,
              }}
            >
              {mode === 'sound' ? tUI('soundDescription') : tUI('vibrateDescription')}
            </p>

            {/* Circular Gauge Progress Ring */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '12px 0 28px',
              }}
            >
              {/* Dark Mode Soft Neon Glow */}
              <div
                className="hidden dark:block"
                style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  transition: 'all 0.4s ease',
                  boxShadow: isPlaying
                    ? '0 0 50px 14px rgba(99, 102, 241, 0.55), 0 0 80px 24px rgba(59, 130, 246, 0.3)'
                    : '0 0 30px 6px rgba(99, 102, 241, 0.3)',
                }}
              />

              {/* Progress SVG */}
              <svg
                width={240}
                height={240}
                viewBox="0 0 240 240"
                style={{
                  transform: 'rotate(-90deg)',
                  overflow: 'visible',
                }}
              >
                <defs>
                  <linearGradient id="speakerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Background Ring Track */}
                <circle
                  cx={120}
                  cy={120}
                  r={ringRadius}
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth={12}
                  opacity={0.35}
                />

                {/* Active Progress Ring */}
                <circle
                  cx={120}
                  cy={120}
                  r={ringRadius}
                  fill="transparent"
                  stroke="url(#speakerRingGradient)"
                  strokeWidth={12}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: 'stroke-dashoffset 0.25s linear',
                  }}
                />
              </svg>

              {/* Center Content: Percentage & Status */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '3.25rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: 'var(--text-main)',
                  }}
                >
                  {Math.round(progress)}%
                </span>

                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginTop: '8px',
                    color: isCompleted ? '#10b981' : isPlaying ? '#60a5fa' : 'var(--text-muted)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {isCompleted
                    ? tUI('completed')
                    : isPlaying
                      ? `${secondsLeft}s`
                      : isPaused
                        ? tUI('paused')
                        : tUI('ready')}
                </span>
              </div>
            </div>

            {/* Play, Pause, and Stop Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '12px',
              }}
            >
              {/* Stop Button */}
              <button
                type="button"
                onClick={handleStop}
                disabled={!isPlaying && !isPaused && secondsLeft === TOTAL_SECONDS}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color:
                    !isPlaying && !isPaused && secondsLeft === TOTAL_SECONDS
                      ? 'var(--text-muted)'
                      : '#ef4444',
                  cursor:
                    !isPlaying && !isPaused && secondsLeft === TOTAL_SECONDS
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: !isPlaying && !isPaused && secondsLeft === TOTAL_SECONDS ? 0.35 : 1,
                  transition: 'all 0.2s ease',
                }}
                title={tUI('stop')}
                aria-label={tUI('stop')}
              >
                <Square style={{ width: '18px', height: '18px', fill: 'currentColor' }} />
              </button>

              {/* Large Circular Play Button with Pulsing Ripple Effect */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Subtle Pulsing Ripple Waves */}
                {isPlaying && (
                  <>
                    <span
                      className="animate-ping"
                      style={{
                        position: 'absolute',
                        inset: '-10px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(37, 99, 235, 0.4)',
                        pointerEvents: 'none',
                      }}
                    />
                    <span
                      className="animate-pulse"
                      style={{
                        position: 'absolute',
                        inset: '-20px',
                        borderRadius: '50%',
                        border: '2px solid rgba(99, 102, 241, 0.45)',
                        pointerEvents: 'none',
                      }}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={isPlaying ? handlePause : isPaused ? handleResume : handlePlay}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isPlaying
                      ? '0 0 28px rgba(37, 99, 235, 0.65), 0 4px 14px rgba(0, 0, 0, 0.25)'
                      : '0 4px 16px rgba(37, 99, 235, 0.4)',
                    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                    zIndex: 2,
                  }}
                  aria-label={
                    isPlaying ? tUI('pause') : isPaused ? tUI('resume') : tUI('startCleaning')
                  }
                  title={isPlaying ? tUI('pause') : isPaused ? tUI('resume') : tUI('startCleaning')}
                >
                  {isCompleted ? (
                    <RotateCcw style={{ width: '28px', height: '28px' }} />
                  ) : isPlaying ? (
                    <Pause style={{ width: '30px', height: '30px', fill: 'currentColor' }} />
                  ) : (
                    <Play
                      style={{
                        width: '32px',
                        height: '32px',
                        fill: 'currentColor',
                        marginLeft: '3px',
                      }}
                    />
                  )}
                </button>
              </div>

              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={isPlaying ? handlePause : handleResume}
                disabled={!isPlaying && !isPaused}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color: !isPlaying && !isPaused ? 'var(--text-muted)' : '#60a5fa',
                  cursor: !isPlaying && !isPaused ? 'not-allowed' : 'pointer',
                  opacity: !isPlaying && !isPaused ? 0.35 : 1,
                  transition: 'all 0.2s ease',
                }}
                title={isPlaying ? tUI('pause') : tUI('resume')}
                aria-label={isPlaying ? tUI('pause') : tUI('resume')}
              >
                {isPlaying ? (
                  <Pause style={{ width: '18px', height: '18px' }} />
                ) : (
                  <Play style={{ width: '18px', height: '18px', marginLeft: '2px' }} />
                )}
              </button>
            </div>

            {/* Status indicator line */}
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isPlaying ? '#3b82f6' : isCompleted ? '#10b981' : 'var(--text-muted)',
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  <span>{tUI('completed')}</span>
                </>
              ) : isPlaying ? (
                <>
                  <Sparkles style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                  <span>
                    {tUI('cleaning')} ({secondsLeft}s)
                  </span>
                </>
              ) : isPaused ? (
                <span>{tUI('paused')}</span>
              ) : (
                <span>{tUI('startCleaning')}</span>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px 28px',
              marginTop: 'var(--space-6)',
              maxWidth: '540px',
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
              <span>💡</span> {tUI('tipsTitle')}
            </h3>
            <ul
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
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
