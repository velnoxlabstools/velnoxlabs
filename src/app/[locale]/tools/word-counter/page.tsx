'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

function analyzeText(text: string) {
  const trimmed = text.trim();

  const words = trimmed ? trimmed.split(/\s+/).filter((w) => w.length > 0) : [];
  const wordCount = words.length;

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0) : [];
  const sentenceCount = sentences.length;

  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0) : [];
  const paragraphCount = paragraphs.length || (trimmed ? 1 : 0);

  const readingTimeMinutes = wordCount / 225;
  const speakingTimeMinutes = wordCount / 150;

  // Keyword density
  const wordFreq: Record<string, number> = {};
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^\w]/g, '');
    if (
      clean.length > 2 &&
      ![
        'the',
        'and',
        'for',
        'are',
        'but',
        'not',
        'you',
        'all',
        'can',
        'her',
        'was',
        'one',
        'our',
        'out',
        'day',
        'get',
        'has',
        'him',
        'his',
        'how',
        'its',
        'may',
        'new',
        'now',
        'old',
        'see',
        'two',
        'way',
        'who',
        'boy',
        'did',
        'use',
        'that',
        'this',
        'with',
        'from',
        'have',
        'they',
        'will',
        'your',
      ].includes(clean)
    ) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, density: ((count / wordCount) * 100).toFixed(2) }));

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    speakingTimeMinutes,
    topWords,
  };
}

function formatTime(minutes: number, secStr = 'sec', minStr = 'min') {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} ${secStr}`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins} ${minStr} ${secs} ${secStr}` : `${mins} ${minStr}`;
}

export default function WordCounterPage() {
  const tUI = useTranslations('ToolUI.wordCounter');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof analyzeText> | null>(null);

  useEffect(() => {
    setStats(analyzeText(text));
  }, [text]);

  const handleCopy = () => {
    if (!stats) return;
    const summary = `${tUI('words')}: ${stats.wordCount}
${tUI('characters')}: ${stats.charCount}
${tUI('charsNoSpaces')}: ${stats.charCountNoSpaces}
${tUI('sentences')}: ${stats.sentenceCount}
${tUI('paragraphs')}: ${stats.paragraphCount}
${tUI('readingTime')}: ${formatTime(stats.readingTimeMinutes, tUI('sec'), tUI('min'))}
${tUI('speakingTime')}: ${formatTime(stats.speakingTimeMinutes, tUI('sec'), tUI('min'))}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
<GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Text Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('yourText')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={tUI('placeholder')}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
              />
            </div>

            {stats && (
              <>
                {/* Main Stats Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#93c5fd',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('words')}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.wordCount.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#c4b5fd',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('characters')}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.charCount.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#6ee7b7',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('sentences')}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.sentenceCount.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.08)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#fcd34d',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('paragraphs')}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.paragraphCount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('charsNoSpaces')}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {stats.charCountNoSpaces.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('readingTime')}
                    </div>
                    <div
                      style={{
                        color: '#60a5fa',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatTime(stats.readingTimeMinutes, tUI('sec'), tUI('min'))}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('speakingTime')}
                    </div>
                    <div
                      style={{
                        color: '#a78bfa',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatTime(stats.speakingTimeMinutes, tUI('sec'), tUI('min'))}
                    </div>
                  </div>
                </div>

                {/* Keyword Density */}
                {stats.topWords.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                      }}
                    >
                      {tUI('topKeywords')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {stats.topWords.map((kw, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '20px',
                            padding: '5px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          {kw.word}{' '}
                          <span style={{ color: 'var(--text-muted)' }}>
                            ({kw.count}× · {kw.density}%)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{
                    width: '100%',
                    backgroundColor: copied
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copied ? '#34d399' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? tUI('copied') : tUI('copyStats')}
                </button>
              </>
            )}
          </div>

          <ToolSeoContent
            toolSlug="word-counter"
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
