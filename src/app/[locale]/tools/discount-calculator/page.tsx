'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { formatCurrency, getCurrencySymbol } from '@/lib/format';

type Mode = 'discount' | 'original' | 'stack';

export default function DiscountCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.discountCalculator');
  const [mode, setMode] = useState<Mode>('discount');
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('25');
  const [salePrice, setSalePrice] = useState('75');
  const [discount2, setDiscount2] = useState('10');
  const [copied, setCopied] = useState(false);
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
    effectiveDiscount = (savings / priceNum) * 100 || 0;
  }

  const handleCopy = () => {
    let text = '';
    if (mode === 'discount') {
      text = `${tUI('originalPriceLabel')}: ${formatCurrency(priceNum, locale)}
${tUI('discount')}: ${discountNum}%
${tUI('youSave')}: ${formatCurrency(savings, locale)}
${tUI('finalPrice')}: ${formatCurrency(finalPrice, locale)}`;
    } else if (mode === 'original') {
      text = `${tUI('salePrice')}: ${formatCurrency(salePriceNum, locale)}
${tUI('discount')}: ${discountNum}%
${tUI('originalPriceLabel')}: ${formatCurrency(originalPrice, locale)}
${tUI('youSave')}: ${formatCurrency(savings, locale)}`;
    } else {
      text = `${tUI('originalPriceLabel')}: ${formatCurrency(priceNum, locale)}
${tUI('firstDiscount')}: ${discountNum}%
${tUI('secondDiscount')}: ${discount2Num}%
${tUI('effectiveDiscount')}: ${effectiveDiscount.toFixed(2)}%
${tUI('finalPrice')}: ${formatCurrency(finalPrice, locale)}
${tUI('youSave')}: ${formatCurrency(savings, locale)}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="discount-calculator"
          />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: 'var(--space-6)',
            }}
          >
            {/* Mode Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {[
                { key: 'discount', label: tUI('findSalePrice') },
                { key: 'original', label: tUI('findOriginalPrice') },
                { key: 'stack', label: tUI('stackedDiscounts') },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key as Mode)}
                  style={{
                    backgroundColor: mode === m.key ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                    color: mode === m.key ? '#60a5fa' : '#94a3b8',
                    border:
                      mode === m.key
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            {mode === 'discount' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('originalPrice')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        pointerEvents: 'none',
                      }}
                    >
                      {getCurrencySymbol(locale)}
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="100"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '14px 14px 14px 34px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('discount')}
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="25"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>
            )}

            {mode === 'original' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('salePrice')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        pointerEvents: 'none',
                      }}
                    >
                      {getCurrencySymbol(locale)}
                    </span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="75"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '14px 14px 14px 34px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('discount')}
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="25"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('originalPrice')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        pointerEvents: 'none',
                      }}
                    >
                      {getCurrencySymbol(locale)}
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="100"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '14px 14px 14px 34px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('firstDiscount')}
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('secondDiscount')}
                  </label>
                  <input
                    type="number"
                    value={discount2}
                    onChange={(e) => setDiscount2(e.target.value)}
                    placeholder="10"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
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
                  {mode === 'original' ? tUI('originalPriceLabel') : tUI('finalPrice')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {mode === 'original'
                    ? formatCurrency(originalPrice, locale)
                    : formatCurrency(finalPrice, locale)}
                </div>
              </div>
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
                  {tUI('youSave')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatCurrency(savings, locale)}
                </div>
              </div>
              {mode === 'stack' && (
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
                    {tUI('effectiveDiscount')}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '2rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    {effectiveDiscount.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {mode === 'discount' && (
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
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span>{tUI('youPay')}</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>
                    {formatCurrency(finalPrice, locale)}
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
                  <span>{tUI('youSaveLabel')}</span>
                  <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {formatCurrency(savings, locale)} ({discountNum}% {tUI('off')})
                  </strong>
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    color: '#fcd34d',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  {tUI('stackedWarningTitle')}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  {tUI('stackedWarningText', {
                    discount1: discountNum,
                    discount2: discount2Num,
                    sum: discountNum + discount2Num,
                    effective: effectiveDiscount.toFixed(2),
                  })}
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
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? tUI('copied') : tUI('copyBreakdown')}
            </button>

            {/* Quick Examples */}
            <div
              style={{
                marginTop: '20px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}
              >
                {tUI('commonScenarios')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { price: '100', disc: '25' },
                  { price: '60', disc: '50' },
                  { price: '200', disc: '30' },
                  { price: '40', disc: '15' },
                ].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMode('discount');
                      setPrice(ex.price);
                      setDiscount(ex.disc);
                    }}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('offPattern', {
                      discount: ex.disc,
                      price: formatCurrency(parseFloat(ex.price) || 0, locale),
                    })}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ToolSeoContent
            toolSlug="discount-calculator"
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
