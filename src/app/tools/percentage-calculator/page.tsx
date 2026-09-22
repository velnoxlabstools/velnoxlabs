'use client';

import React, { useState } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type Mode = 'of' | 'isWhatPercent' | 'increase' | 'decrease' | 'difference';

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('200');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const calculate = (currentMode: Mode, aVal: string, bVal: string) => {
    const numA = parseFloat(aVal);
    const numB = parseFloat(bVal);
    if (isNaN(numA) || isNaN(numB)) return '';

    switch (currentMode) {
      case 'of':
        return ((numA / 100) * numB).toFixed(4).replace(/\.?0+$/, '');
      case 'isWhatPercent':
        if (numB === 0) return 'Cannot divide by zero';
        return ((numA / numB) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      case 'increase':
        if (numA === 0) return 'Cannot divide by zero';
        return (((numB - numA) / numA) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      case 'decrease':
        if (numA === 0) return 'Cannot divide by zero';
        return (((numA - numB) / numA) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      case 'difference':
        if (numA === 0 && numB === 0) return '0%';
        return (Math.abs(numA - numB) / ((numA + numB) / 2) * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
      default:
        return '';
    }
  };

  const handleCalculate = (newMode: Mode, newA: string, newB: string) => {
    setResult(calculate(newMode, newA, newB));
  };

  React.useEffect(() => {
    handleCalculate(mode, a, b);
  }, [mode, a, b]);

  const getLabels = () => {
    switch (mode) {
      case 'of': return { a: 'Percentage (%)', b: 'Of Number', prefix: 'Result:' };
      case 'isWhatPercent': return { a: 'First Number', b: 'Second Number', prefix: 'is what % of' };
      case 'increase': return { a: 'Original Value', b: 'New Value', prefix: 'Percentage Increase:' };
      case 'decrease': return { a: 'Original Value', b: 'New Value', prefix: 'Percentage Decrease:' };
      case 'difference': return { a: 'First Value', b: 'Second Value', prefix: 'Percentage Difference:' };
    }
  };

  const labels = getLabels();

  const modes: { key: Mode; label: string }[] = [
    { key: 'of', label: 'X% of Y' },
    { key: 'isWhatPercent', label: 'X is what % of Y' },
    { key: 'increase', label: '% Increase' },
    { key: 'decrease', label: '% Decrease' },
    { key: 'difference', label: '% Difference' },
  ];

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
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
        'name': 'VelnoxLabs Percentage Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online percentage calculator — calculate percentages, percentage increase, decrease, and difference instantly. Perfect for students, shoppers, finance, and daily math.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I calculate a percentage?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'To find X% of Y, multiply Y by X and divide by 100. Example: 15% of 200 = (15 × 200) / 100 = 30.' }
          },
          {
            '@type': 'Question',
            'name': 'How do I calculate percentage increase?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Percentage increase = ((New Value − Original Value) / Original Value) × 100. Example: from 100 to 125 = 25% increase.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Percentage Calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Percentage Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Percentage Calculator"
            subtitle="Calculate percentages, increases, decreases, and differences instantly with our free online tool."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Mode Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    backgroundColor: mode === m.key ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                    color: mode === m.key ? '#60a5fa' : '#94a3b8',
                    border: mode === m.key ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{labels.a}:</label>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder="Enter value"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{labels.b}:</label>
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  placeholder="Enter value"
                  style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Result */}
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {labels.prefix}
              </div>
              <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {result || '—'}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Result'}
            </button>

            {/* Common Examples */}
            <div style={{ marginTop: '20px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>💡 Common Examples:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { a: '15', b: '200', label: '15% of 200' },
                  { a: '20', b: '150', label: '20% of 150 (tip)' },
                  { a: '10', b: '100', label: '10% of 100 (discount)' },
                  { a: '25', b: '80', label: '25% of 80' },
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setMode('of'); setA(ex.a); setB(ex.b); }}
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Percentage Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Percentage Calculator is a free online tool that solves common percentage problems instantly. Whether you need to find what 15% of 200 is, calculate a discount at a store, figure out a tip, or compute how much a value increased or decreased, this tool gives you the answer in seconds. It's used daily by students, shoppers, business professionals, and anyone dealing with numbers — no math skills required.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Choose a calculation mode from the tabs at the top.</li>
              <li>Enter the two values in the input fields.</li>
              <li>The result appears instantly below the inputs.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Result</strong> to save or share the answer.</li>
              <li>Try the quick examples for the most common calculations.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I calculate a percentage?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>To find X% of Y, multiply Y by X and divide by 100. Example: 15% of 200 = (15 × 200) / 100 = 30.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I calculate percentage increase or decrease?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Percentage increase = ((New − Original) / Original) × 100. Example: from $100 to $125 = 25% increase. Decrease uses the same formula with reversed values.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is percentage difference vs percentage change?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Percentage change compares an old value to a new value (increase/decrease). Percentage difference compares two values without implying direction — useful when neither is a "starting point."</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Percentage Calculator is 100% free with no sign-up required. All calculations happen in your browser.</p>
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