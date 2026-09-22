'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type Mode = 'discount' | 'original' | 'stack';

export default function DiscountCalculatorPage() {
  const [mode, setMode] = useState<Mode>('discount');
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('25');
  const [salePrice, setSalePrice] = useState('75');
  const [discount2, setDiscount2] = useState('10');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  let finalPrice = 0;
  let savings = 0;
  let effectiveDiscount = 0;
  let originalPrice = 0;

  const priceNum = parseFloat(price) || 0;
  const discountNum = parseFloat(discount) || 0;
  const salePriceNum = parseFloat(salePrice) || 0;
  const discount2Num = parseFloat(discount2) || 0;

  if (mode === 'discount') {
    savings = (priceNum * discountNum) / 100;
    finalPrice = priceNum - savings;
    effectiveDiscount = discountNum;
  } else if (mode === 'original') {
    if (discountNum < 100) {
      originalPrice = salePriceNum / (1 - discountNum / 100);
      savings = originalPrice - salePriceNum;
      finalPrice = salePriceNum;
      effectiveDiscount = discountNum;
    }
  } else if (mode === 'stack') {
    const afterFirst = priceNum * (1 - discountNum / 100);
    finalPrice = afterFirst * (1 - discount2Num / 100);
    savings = priceNum - finalPrice;
    effectiveDiscount = ((savings / priceNum) * 100) || 0;
  }

  const handleCopy = () => {
    let text = '';
    if (mode === 'discount') {
      text = `Original Price: $${priceNum.toFixed(2)}
Discount: ${discountNum}%
You Save: $${savings.toFixed(2)}
Final Price: $${finalPrice.toFixed(2)}`;
    } else if (mode === 'original') {
      text = `Sale Price: $${salePriceNum.toFixed(2)}
Discount: ${discountNum}%
Original Price Was: $${originalPrice.toFixed(2)}
You Save: $${savings.toFixed(2)}`;
    } else {
      text = `Original Price: $${priceNum.toFixed(2)}
First Discount: ${discountNum}%
Second Discount: ${discount2Num}%
Effective Discount: ${effectiveDiscount.toFixed(2)}%
Final Price: $${finalPrice.toFixed(2)}
You Save: $${savings.toFixed(2)}`;
    }
    navigator.clipboard.writeText(text);
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
        'name': 'VelnoxLabs Discount Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online discount calculator — find the final sale price, savings, and effective discount. Supports stacked discounts and reverse calculation from sale price.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I calculate a discount?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Multiply the original price by the discount percentage, then divide by 100 to get the savings. Subtract savings from original price to get the sale price. Example: 25% off $100 = $25 savings, so $75 final.' }
          },
          {
            '@type': 'Question',
            'name': 'How do stacked discounts work?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Stacked discounts apply one after the other. 20% off, then another 10% off, is NOT 30% off. It is 28% effective. Example: $100 with 20% off = $80, then 10% off $80 = $72.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this discount calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Discount Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Discount Calculator"
            subtitle="Calculate sale prices, savings, stacked discounts, and reverse-engineer original prices from sale tags."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Mode Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {[
                { key: 'discount', label: '💵 Find Sale Price' },
                { key: 'original', label: '🔙 Find Original Price' },
                { key: 'stack', label: '🎁 Stacked Discounts' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key as Mode)}
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
            {mode === 'discount' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Original Price ($):</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Discount (%):</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="25" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              </div>
            )}

            {mode === 'original' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sale Price ($):</label>
                  <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="75" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Discount (%):</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="25" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Original Price ($):</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>First Discount (%):</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="20" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Second Discount (%):</label>
                  <input type="number" value={discount2} onChange={(e) => setDiscount2(e.target.value)} placeholder="10" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.1rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              </div>
            )}

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {mode === 'original' ? 'Original Price' : 'Final Price'}
                </div>
                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace' }}>
                  ${mode === 'original' ? originalPrice.toFixed(2) : finalPrice.toFixed(2)}
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>You Save</div>
                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace' }}>${savings.toFixed(2)}</div>
              </div>
              {mode === 'stack' && (
                <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Effective Discount</div>
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace' }}>{effectiveDiscount.toFixed(1)}%</div>
                </div>
              )}
            </div>

            {mode === 'discount' && (
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>You pay:</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>${finalPrice.toFixed(2)}</strong>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>You save:</span>
                  <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>${savings.toFixed(2)} ({discountNum}% off)</strong>
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ color: '#fcd34d', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>⚠️ How Stacked Discounts Work</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  {discountNum}% + {discount2Num}% ≠ {discountNum + discount2Num}%. Stacked discounts apply to the discounted price, not the original. Effective: <strong style={{ color: '#fff' }}>{effectiveDiscount.toFixed(2)}%</strong>
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Breakdown'}
            </button>

            {/* Quick Examples */}
            <div style={{ marginTop: '20px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>💡 Common Scenarios:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { label: '25% off $100', price: '100', disc: '25' },
                  { label: '50% off $60', price: '60', disc: '50' },
                  { label: '30% off $200', price: '200', disc: '30' },
                  { label: '15% off $40', price: '40', disc: '15' },
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setMode('discount'); setPrice(ex.price); setDiscount(ex.disc); }}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Discount Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Discount Calculator is a free online tool that helps shoppers instantly see the final price after a discount, the amount saved, and the effective discount percentage. Whether you're shopping online, in a retail store, or dealing with Black Friday deals, this calculator eliminates the mental math. It also supports stacked discounts (like "25% off + extra 10% off") and reverse calculations — figuring out the original price when you only know the sale price.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Choose a mode: <strong>Find Sale Price</strong>, <strong>Find Original Price</strong>, or <strong>Stacked Discounts</strong>.</li>
              <li>Enter the price and discount percentage.</li>
              <li>See your final price, savings, and effective discount instantly.</li>
              <li>Click <strong>Copy Breakdown</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I calculate a discount?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Multiply the original price by the discount percentage, then divide by 100 to get the savings. Example: 25% off $100 = $25 saved, so you pay $75.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do stacked discounts work?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Stacked discounts apply one after the other. 20% off + extra 10% off is NOT 30% off — it's 28% effective. Example: $100 → $80 after 20% off → $72 after another 10% off.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I find the original price from a sale price?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Divide the sale price by (1 − discount/100). Example: if sale price is $75 at 25% off, original = $75 ÷ 0.75 = $100.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Discount Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Discount Calculator is 100% free with no sign-up required. All calculations happen in your browser.</p>
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