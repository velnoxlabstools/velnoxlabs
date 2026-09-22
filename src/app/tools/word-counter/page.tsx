'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function analyzeText(text: string) {
  const trimmed = text.trim();

  const words = trimmed ? trimmed.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const sentenceCount = sentences.length;

  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
  const paragraphCount = paragraphs.length || (trimmed ? 1 : 0);

  const readingTimeMinutes = wordCount / 225;
  const speakingTimeMinutes = wordCount / 150;

  // Keyword density
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^\w]/g, '');
    if (clean.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'use', 'that', 'this', 'with', 'from', 'have', 'they', 'will', 'your'].includes(clean)) {
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

function formatTime(minutes: number) {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} sec`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
}

export default function WordCounterPage() {
  const [text, setText] = useState('Welcome to VelnoxLabs! This is a free online Word Counter tool that helps writers, students, and bloggers count words, characters, sentences, and paragraphs in real time. Simply paste your text and get instant results.');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof analyzeText> | null>(null);

  useEffect(() => {
    setStats(analyzeText(text));
  }, [text]);

  const handleCopy = () => {
    if (!stats) return;
    const summary = `Words: ${stats.wordCount}
Characters: ${stats.charCount}
Characters (no spaces): ${stats.charCountNoSpaces}
Sentences: ${stats.sentenceCount}
Paragraphs: ${stats.paragraphCount}
Reading time: ${formatTime(stats.readingTimeMinutes)}
Speaking time: ${formatTime(stats.speakingTimeMinutes)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFeedbackSent(true);
    setFeedback('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        'name': 'VelnoxLabs Word Counter',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online word counter — count words, characters, sentences, paragraphs, and reading time in real time. Includes keyword density analysis.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I count words in a document?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Paste or type your text into the box and the word count updates instantly. It also shows characters, sentences, paragraphs, and reading time.' }
          },
          {
            '@type': 'Question',
            'name': 'How long does it take to read 1000 words?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'At an average reading speed of 225 words per minute, 1000 words takes about 4 minutes 27 seconds to read silently. Speaking takes longer — around 6-7 minutes at 150 wpm.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Word Counter free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Word Counter is 100% free with no sign-up required. All counting happens in your browser.' }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title="Word Counter"
            subtitle="Count words, characters, sentences, and paragraphs in real time — with reading time and keyword density."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Text Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Your Text:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Start typing or paste your text here..."
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '16px', fontSize: '0.95rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>

            {stats && (
              <>
                {/* Main Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#93c5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Words</div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>{stats.wordCount.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#c4b5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Characters</div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>{stats.charCount.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Sentences</div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>{stats.sentenceCount.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#fcd34d', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Paragraphs</div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>{stats.paragraphCount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Chars (no spaces)</div>
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{stats.charCountNoSpaces.toLocaleString()}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>📖 Reading Time</div>
                    <div style={{ color: '#60a5fa', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(stats.readingTimeMinutes)}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>🗣️ Speaking Time</div>
                    <div style={{ color: '#a78bfa', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(stats.speakingTimeMinutes)}</div>
                  </div>
                </div>

                {/* Keyword Density */}
                {stats.topWords.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>🔑 Top Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {stats.topWords.map((kw, i) => (
                        <span key={i} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {kw.word} <span style={{ color: '#94a3b8' }}>({kw.count}× · {kw.density}%)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '14px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Statistics'}
                </button>
              </>
            )}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Word Counter?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Word Counter is a free online tool that instantly counts the number of words, characters, sentences, and paragraphs in any text. It also estimates how long the text will take to read or speak aloud, and shows the density of your top keywords. Writers, students, bloggers, journalists, and SEO professionals use word counters every day to meet word count limits, improve readability, and analyze keyword usage.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Type or paste your text into the input box above.</li>
              <li>Word, character, sentence, and paragraph counts update instantly.</li>
              <li>See estimated reading time and speaking time below the stats.</li>
              <li>Check the top keywords and their density percentages.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Statistics</strong> to save the summary.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I count words in a document?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Paste or type your text into the box and the word count updates instantly. It also shows characters, sentences, paragraphs, and reading time — no need to open Word or Google Docs.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How long does it take to read 1000 words?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>At an average reading speed of 225 words per minute, 1000 words takes about 4 minutes 27 seconds to read silently. Speaking takes longer — around 6-7 minutes at 150 wpm.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does this count characters with or without spaces?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Both! The tool shows total characters (including spaces) and characters without spaces. This is useful for Twitter/X posts, Instagram bios, and meta descriptions where limits matter.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my text stored anywhere?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>No. All counting happens entirely in your browser. Your text is never sent to any server and is never stored.</p>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl mt-12">
            <h3 className="text-xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h3>
            <p className="text-slate-400 mb-6 text-sm">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-slate-600 text-sm resize-none"
              ></textarea>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}