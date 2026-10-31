'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { formatCurrency, getCurrencySymbol } from '@/lib/format';

export default function TipCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.tipCalculator');
  const [bill, setBill] = useState('50.00');
  const [tipPercent, setTipPercent] = useState(18);
  const [people, setPeople] = useState(1);
  const [roundUp, setRoundUp] = useState(false);
  const [copied, setCopied] = useState(false);
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
    const text = `${tUI('billLabel')}: ${formatCurrency(billNum, locale)}
${tUI('tipAmount')} (${tipPercent}%): ${formatCurrency(tipAmount, locale)}
${tUI('totalLabel')}: ${formatCurrency(totalAmount, locale)}
${tUI('splitBetweenLabel', {
  count: people,
  peopleLabel: people === 1 ? tUI('person') : tUI('people'),
  amount: formatCurrency(perPerson, locale),
})}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tipOptions = [10, 15, 18, 20, 25];

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
            {/* Bill Input */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('billAmount')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                  }}
                >
                  {getCurrencySymbol(locale)}
                </span>
                <input
                  type="number"
                  value={bill}
                  onChange={(e) => setBill(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px 14px 14px 34px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Tip Percentage */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('tipPercentage')}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {tipOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTipPercent(p)}
                    style={{
                      flex: '1 1 60px',
                      backgroundColor:
                        tipPercent === p ? 'rgba(16, 185, 129, 0.25)' : 'var(--bg-page)',
                      color: tipPercent === p ? '#34d399' : '#94a3b8',
                      border:
                        tipPercent === p
                          ? '1px solid rgba(16, 185, 129, 0.5)'
                          : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px 8px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
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
                placeholder={tUI('customTip')}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Split Bill */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('splitBetween')}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setPeople(Math.max(1, people - 1))}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={() => setPeople(people + 1)}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Round Up Toggle */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                {tUI('roundUp')}
              </label>
            </div>

            {/* Results */}
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
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('tipAmount')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(tipAmount, locale)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('totalBill')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(totalAmount, locale)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#6ee7b7',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}
                >
                  {tUI('eachPersonPays')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(perPerson, locale)}
                </div>
              </div>
            </div>

            {/* Per-person breakdown if > 1 */}
            {people > 1 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span>{tUI('billSharePerPerson')}</span>
                  <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatCurrency(billNum / people, locale)}
                  </strong>
                </div>
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{tUI('tipPerPerson')}</span>
                  <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {formatCurrency(perPersonTip, locale)}
                  </strong>
                </div>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)',
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
              {copied ? tUI('copied') : tUI('copyBreakdown')}
            </button>
          </div>

          <ToolSeoContent
            toolSlug="tip-calculator"
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
