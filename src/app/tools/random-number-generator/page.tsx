'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function generateNumbers(min: number, max: number, count: number, unique: boolean, sort: string) {
  const range = max - min + 1;
  if (unique && count > range) {
    return { error: `Cannot generate ${count} unique numbers from a range of ${range}`, numbers: [] as number[] };
  }

  let numbers: number[] = [];

  if (unique) {
    const pool = new Set<number>();
    while (pool.size < count) {
      pool.add(Math.floor(Math.random() * range) + min);
    }
    numbers = Array.from(pool);
  } else {
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * range) + min);
    }
  }

  if (sort === 'asc') numbers.sort((a, b) => a - b);
  else if (sort === 'desc') numbers.sort((a, b) => b - a);

  return { error: '', numbers };
}

export default function RandomNumberGeneratorPage() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('5');
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState('none');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleGenerate = () => {
    const minNum = parseInt(min) || 0;
    const maxNum = parseInt(max) || 100;
    const countNum = Math.min(1000, Math.max(1, parseInt(count) || 1));

    if (minNum > maxNum) {
      setError('Minimum must be less than or equal to maximum');
      setNumbers([]);
      return;
    }

    const result = generateNumbers(minNum, maxNum, countNum, unique, sort);
    setError(result.error);
    setNumbers(result.numbers);
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  const handleCopy = () => {
    if (numbers.length === 0) return;
    navigator.clipboard.writeText(numbers.join(', '));
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
        'name': 'VelnoxLabs Random Number Generator',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online random number generator — generate random numbers in any range, with unique-only option, sorting, and bulk generation up to 1000 numbers.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I generate random numbers?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter your minimum and maximum range, choose how many numbers you want, and click Generate. You can also enable unique-only mode to prevent duplicates.' }
          },
          {
            '@type': 'Question',
            'name': 'Are these numbers truly random?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. This tool uses the browser\'s built-in Math.random() which is a pseudo-random number generator. For most everyday purposes (games, drawings, decisions) it is sufficiently random.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Random Number Generator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Random Number Generator is 100% free with no sign-up required. All generation happens in your browser.' }
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
            title="Random Number Generator"
            subtitle="Generate random numbers in any range instantly — with unique-only mode, sorting, and bulk generation."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Minimum:</label>
                <input type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder="1" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Maximum:</label>
                <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="100" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>How Many (max 1000):</label>
                <input type="number" value={count} onChange={(e) => setCount(e.target.value)} placeholder="5" min="1" max="1000" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }} />
                Unique numbers only (no duplicates)
              </label>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Sort:</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                  <option value="none">No sorting (random order)</option>
                  <option value="asc">Ascending (small → large)</option>
                  <option value="desc">Descending (large → small)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              style={{ width: '100%', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px' }}
            >
              🎲 Generate Random Numbers
            </button>

            {error && (
              <div style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '8px', padding: '12px', color: '#f87171', fontSize: '0.9rem', marginBottom: '20px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Result */}
            {numbers.length > 0 && (
              <>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'center' }}>
                    Generated {numbers.length} Random Number{numbers.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {numbers.map((n, i) => (
                      <span key={i} style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '8px 14px', color: '#34d399', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', minWidth: '50px', textAlign: 'center' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy All Numbers'}
                </button>
              </>
            )}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Random Number Generator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Random Number Generator (RNG) is a free online tool that produces unpredictable numbers within a range you specify. It's commonly used for giveaways, raffles, dice rolls, lottery simulations, random sampling, picking a random name from a list, or any situation where you need a fair, unbiased number. This tool supports bulk generation (up to 1000 numbers at once), unique-only mode (no duplicates), and sorting options — all instantly in your browser.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter the <strong>minimum</strong> and <strong>maximum</strong> range.</li>
              <li>Choose how many numbers to generate (1 to 1000).</li>
              <li>Optionally enable <strong>Unique numbers only</strong> to avoid duplicates.</li>
              <li>Choose sort order (ascending, descending, or random).</li>
              <li>Click <strong>Generate</strong> — your numbers appear instantly.</li>
              <li>Click <strong>Copy All Numbers</strong> to save or share them.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I generate random numbers?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Enter your minimum and maximum range, choose how many numbers you want, and click Generate. Enable unique-only mode to avoid duplicates.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Are these numbers truly random?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes. This tool uses the browser's built-in <code style={{ color: '#34d399' }}>Math.random()</code>, which is a pseudo-random number generator. For most everyday purposes (games, drawings, raffles, decisions) it is sufficiently random and unbiased.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Can I generate unique random numbers?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes. Enable <strong>Unique numbers only</strong> and the generator will make sure no number repeats. This is perfect for lottery simulations, raffle drawings, or picking distinct winners.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Random Number Generator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Random Number Generator is 100% free with no sign-up required. All generation happens in your browser — no data is sent to any server.</p>
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