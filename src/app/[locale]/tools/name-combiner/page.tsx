'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function combineNames(a: string, b: string) {
  const A = a.trim();
  const B = b.trim();
  if (!A || !B) return [];

  const aLow = A.toLowerCase();
  const bLow = B.toLowerCase();

  const results: { label: string; value: string }[] = [];

  const aHalf = A.slice(0, Math.ceil(A.length / 2));
  const bHalf = B.slice(Math.floor(B.length / 2));
  results.push({ label: 'Blend (A+B)', value: (aHalf + bHalf).toLowerCase() });

  const bFirst = B.slice(0, Math.ceil(B.length / 2));
  const aSecond = A.slice(Math.floor(A.length / 2));
  results.push({ label: 'Blend (B+A)', value: (bFirst + aSecond).toLowerCase() });

  results.push({ label: 'A + B initial', value: (A + B.charAt(0)).toLowerCase() });
  results.push({ label: 'A initial + B', value: (A.charAt(0) + B).toLowerCase() });
  results.push({ label: 'Underscore', value: aLow + '_' + bLow });
  results.push({ label: 'Hyphenated', value: aLow + '-' + bLow });
  results.push({ label: 'camelCase', value: aLow + B.charAt(0).toUpperCase() + B.slice(1).toLowerCase() });
  results.push({ label: 'PascalCase', value: A.charAt(0).toUpperCase() + A.slice(1).toLowerCase() + B.charAt(0).toUpperCase() + B.slice(1).toLowerCase() });
  results.push({ label: 'Reversed', value: bLow + aLow });

  let shuffled = '';
  const maxLen = Math.max(A.length, B.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < A.length) shuffled += A[i].toLowerCase();
    if (i < B.length) shuffled += B[i].toLowerCase();
  }
  results.push({ label: 'Interleaved', value: shuffled });
  results.push({ label: 'First 3 + First 3', value: (A.slice(0, 3) + B.slice(0, 3)).toLowerCase() });

  const vowelsA = A.toLowerCase().split('').filter(c => 'aeiou'.includes(c)).join('');
  const consB = B.toLowerCase().split('').filter(c => !'aeiou'.includes(c)).join('');
  if (vowelsA || consB) {
    results.push({ label: 'A vowels + B consonants', value: vowelsA + consB });
  }

  return results;
}

export default function NameCombinerPage() {
  const [nameA, setNameA] = useState('John');
  const [nameB, setNameB] = useState('Emma');
  const [results, setResults] = useState<{ label: string; value: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    setResults(combineNames(nameA, nameB));
  }, [nameA, nameB]);

  useEffect(() => {
    const saved = localStorage.getItem('velnox-name-favorites');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleCopy = (text: string, index: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFavorite = (value: string) => {
    const updated = favorites.includes(value)
      ? favorites.filter(f => f !== value)
      : [...favorites, value];
    setFavorites(updated);
    localStorage.setItem('velnox-name-favorites', JSON.stringify(updated));
  };

  const handleSwap = () => {
    setNameA(nameB);
    setNameB(nameA);
  };

  const presets = [
    { a: 'John', b: 'Emma', label: '💕 John + Emma' },
    { a: 'Michael', b: 'Sarah', label: '✨ Michael + Sarah' },
    { a: 'David', b: 'Olivia', label: '❤️ David + Olivia' },
    { a: 'James', b: 'Sophia', label: '🌟 James + Sophia' },
  ];

  const shareOnWhatsApp = (value: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(value + ' — made with VelnoxLabs Name Combiner')}`, '_blank');
  };

  const shareOnTwitter = (value: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(value + ' — made with @VelnoxLabs')}`, '_blank');
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
        'name': 'VelnoxLabs Name Combiner',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free Name Combiner tool — combine two names into creative blends, couple names, ship names, and brand names instantly. Works for any language and origin.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a Name Combiner?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'A Name Combiner merges two names into multiple creative variations like blended couple names, ship names, brand names, and baby name ideas.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Name Combiner free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Name Combiner is 100% free with no sign-up required and works with any name from any language.' }
          },
          {
            '@type': 'Question',
            'name': 'Can I use it for brand names?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Absolutely. It generates camelCase, PascalCase, hyphenated, and underscore versions perfect for brand names and social media handles.' }
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
            title="Name Combiner"
            subtitle="Combine two names into creative blends, ship names, couple names, and brand names instantly."
          />

          {/* Presets */}
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => { setNameA(p.a); setNameB(p.b); }}
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'end', marginBottom: '24px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>First Name:</label>
                <input
                  type="text"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  placeholder="e.g. John"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <button
                onClick={handleSwap}
                title="Swap names"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '2px' }}
              >
                ⇄
              </button>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Second Name:</label>
                <input
                  type="text"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  placeholder="e.g. Emma"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
              Combined Variations ({results.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {results.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: copiedIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: copiedIndex === idx ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    transform: copiedIndex === idx ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{r.label}</div>
                    <div style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '0.95rem', wordBreak: 'break-all' }}>{r.value}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => toggleFavorite(r.value)}
                      title="Save to favorites"
                      style={{ backgroundColor: favorites.includes(r.value) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: favorites.includes(r.value) ? '#f87171' : '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {favorites.includes(r.value) ? '❤️' : '🤍'}
                    </button>
                    <button
                      onClick={() => shareOnWhatsApp(r.value)}
                      title="Share on WhatsApp"
                      style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#4ade80', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      WA
                    </button>
                    <button
                      onClick={() => shareOnTwitter(r.value)}
                      title="Share on Twitter"
                      style={{ backgroundColor: 'rgba(29, 161, 242, 0.15)', color: '#60a5fa', border: '1px solid rgba(29, 161, 242, 0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      X
                    </button>
                    <button
                      onClick={() => handleCopy(r.value, idx)}
                      style={{ backgroundColor: copiedIndex === idx ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copiedIndex === idx ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {copiedIndex === idx ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {favorites.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ color: '#f87171', fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>
                  ❤️ Your Favorites ({favorites.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {favorites.map((fav, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleCopy(fav, -idx - 1)}
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'monospace' }}
                    >
                      {fav}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Name Combiner?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Name Combiner is a free online tool that blends two names into multiple unique variations. It's widely used for creating couple ship names, baby name ideas, brand names, character names for stories, team names, and social media handles. This tool generates up to 12 different combinations using blending techniques like first-half merging, initials, camelCase, and interleaving — all instantly in your browser with zero data collection.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter the first name in the left input field.</li>
              <li>Enter the second name in the right input field.</li>
              <li>All combined variations appear instantly as you type.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy</strong> to copy, <strong style={{ color: '#f87171' }}>🤍</strong> to favorite, or <strong style={{ color: '#60a5fa' }}>Share</strong> to send.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What can I use Name Combiner for?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>You can use it for couple ship names, baby name brainstorming, brand names, character names in stories, team names, and social media handles.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does it work with any language?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes! The Name Combiner works with names from any language or origin — English, Spanish, French, German, Italian, and more.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my data secure?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Absolutely. All combining happens entirely in your browser. Your names are never sent to any server.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How many variations does it generate?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>The tool generates up to 12 different combinations including blended names, initials, camelCase, PascalCase, hyphenated, underscored, and interleaved versions.</p>
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