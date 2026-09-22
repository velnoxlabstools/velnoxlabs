'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('50.00');
  const [tipPercent, setTipPercent] = useState(18);
  const [people, setPeople] = useState(1);
  const [roundUp, setRoundUp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const billNum = parseFloat(bill) || 0;
  let tipAmount = (billNum * tipPercent) / 100;
  let totalAmount = billNum + tipAmount;
  let perPerson = totalAmount / (people || 1);

  if (roundUp) {
    totalAmount = Math.ceil(totalAmount);
    tipAmount = totalAmount - billNum;
    perPerson = totalAmount / (people || 1);
  }

  const perPersonTip = tipAmount / (people || 1);

  const handleCopy = () => {
    const text = `Bill: $${billNum.toFixed(2)}
Tip (${tipPercent}%): $${tipAmount.toFixed(2)}
Total: $${totalAmount.toFixed(2)}
Split between ${people} ${people === 1 ? 'person' : 'people'}: $${perPerson.toFixed(2)} each`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tipOptions = [10, 15, 18, 20, 25];

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
        'name': 'VelnoxLabs Tip Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online tip calculator — calculate restaurant tips, split bills between friends, and see total cost instantly. Supports 10%, 15%, 18%, 20%, 25% tips and custom amounts.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much should I tip at a restaurant?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'In the United States, the standard tip is 15% to 20% for good service, 18% for average, and 20%+ for excellent service. For takeout, 10% is common.' }
          },
          {
            '@type': 'Question',
            'name': 'How do I split the bill?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter the total bill, select tip percentage, and enter the number of people. The calculator divides the total (bill + tip) evenly between everyone.' }
          },
          {
            '@type': 'Question',
            'name': 'Is the Tip Calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Tip Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Tip Calculator"
            subtitle="Calculate restaurant tips and split bills instantly — perfect for dining out with friends."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Bill Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Bill Amount ($):</label>
              <input
                type="number"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.2rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }}
              />
            </div>

            {/* Tip Percentage */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tip Percentage:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {tipOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTipPercent(p)}
                    style={{
                      flex: '1 1 60px',
                      backgroundColor: tipPercent === p ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0,0,0,0.3)',
                      color: tipPercent === p ? '#34d399' : '#94a3b8',
                      border: tipPercent === p ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px 8px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseFloat(e.target.value) || 0)}
                placeholder="Custom %"
                min="0"
                max="100"
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>

            {/* Split Bill */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Split Between (people):</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setPeople(Math.max(1, people - 1))}
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '10px 20px', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'monospace' }}
                />
                <button
                  onClick={() => setPeople(people + 1)}
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '10px 20px', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Round Up Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                Round up total to nearest dollar
              </label>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Tip Amount</div>
                <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>${tipAmount.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Bill</div>
                <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>${totalAmount.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Each Person Pays</div>
                <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace' }}>${perPerson.toFixed(2)}</div>
              </div>
            </div>

            {/* Per-person breakdown if > 1 */}
            {people > 1 && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Bill share per person:</span>
                  <strong style={{ color: '#fff', fontFamily: 'monospace' }}>${(billNum / people).toFixed(2)}</strong>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tip per person:</span>
                  <strong style={{ color: '#fff', fontFamily: 'monospace' }}>${perPersonTip.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '14px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Full Breakdown'}
            </button>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Tip Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Tip Calculator is a free online tool that helps you quickly figure out how much to tip at restaurants, cafes, bars, and delivery services. It also splits the bill between multiple people so everyone knows exactly what they owe. Whether you're dining out with friends, ordering takeout, or traveling in the United States where tipping is customary, this tool makes the math effortless — no calculator app needed.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter the bill amount in dollars.</li>
              <li>Select a tip percentage (10%, 15%, 18%, 20%, 25%) or enter a custom amount.</li>
              <li>Choose how many people are splitting the bill.</li>
              <li>Optionally round up the total to the nearest dollar.</li>
              <li>See the tip, total, and per-person amount instantly.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Full Breakdown</strong> to share the results.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How much should I tip at a restaurant?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>In the United States, the standard tip is 15% to 20% for good service. 18% is the average, 20% is considered good, and 25% is excellent. For takeout, 10% is common. For buffets, 10% is typical.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Do I tip on the pre-tax or post-tax amount?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Traditionally, you tip on the pre-tax amount of the bill. However, many people simply tip on the total (post-tax) amount for simplicity. This calculator uses the amount you enter, so you can decide.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I split the bill and tip?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Enter the total bill, select your tip percentage, then set the number of people. The calculator divides the total (bill + tip) evenly. If someone ordered more, you can adjust manually.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this tip calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Tip Calculator is 100% free with no sign-up required. All calculations happen in your browser — your bill amount is never sent to any server.</p>
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