'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Receipt, Calculator, Copy, Check, Sparkles, Globe } from 'lucide-react';

type Mode = 'discount-gst' | 'mrp-percent' | 'original' | 'stack';

type CurrencyType = 'INR' | 'USD' | 'EUR' | 'GBP' | 'BRL' | 'JPY' | 'CNY' | 'RUB' | 'KRW';

interface CurrencyItem {
  code: CurrencyType;
  symbol: string;
  name: string;
  flag: string;
  localeCode: string;
  taxName: string;
  defaultTax: string;
  taxSlabs: Array<{ rate: string; label: string }>;
  noDecimals?: boolean;
}

const ALL_CURRENCIES: Record<CurrencyType, CurrencyItem> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    flag: '🇮🇳',
    localeCode: 'en-IN',
    taxName: 'GST',
    defaultTax: '18',
    taxSlabs: [
      { rate: '0', label: '0% (Exempt)' },
      { rate: '5', label: '5%' },
      { rate: '12', label: '12%' },
      { rate: '18', label: '18%' },
      { rate: '28', label: '28%' },
    ],
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    flag: '🇺🇸',
    localeCode: 'en-US',
    taxName: 'Sales Tax',
    defaultTax: '8',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '5', label: '5%' },
      { rate: '7', label: '7%' },
      { rate: '8.5', label: '8.5%' },
      { rate: '10', label: '10%' },
    ],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    flag: '🇪🇺',
    localeCode: 'de-DE',
    taxName: 'VAT / MwSt.',
    defaultTax: '19',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '7', label: '7%' },
      { rate: '10', label: '10%' },
      { rate: '19', label: '19%' },
      { rate: '21', label: '21%' },
    ],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    flag: '🇬🇧',
    localeCode: 'en-GB',
    taxName: 'VAT',
    defaultTax: '20',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '5', label: '5%' },
      { rate: '20', label: '20%' },
    ],
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real (R$)',
    flag: '🇧🇷',
    localeCode: 'pt-BR',
    taxName: 'ICMS / Imposto',
    defaultTax: '18',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '7', label: '7%' },
      { rate: '12', label: '12%' },
      { rate: '18', label: '18%' },
      { rate: '25', label: '25%' },
    ],
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen (¥)',
    flag: '🇯🇵',
    localeCode: 'ja-JP',
    taxName: '消費税',
    defaultTax: '10',
    noDecimals: true,
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '8', label: '8% (軽減)' },
      { rate: '10', label: '10% (標準)' },
    ],
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan (¥)',
    flag: '🇨🇳',
    localeCode: 'zh-CN',
    taxName: '增值税',
    defaultTax: '13',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '6', label: '6%' },
      { rate: '9', label: '9%' },
      { rate: '13', label: '13%' },
    ],
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble (₽)',
    flag: '🇷🇺',
    localeCode: 'ru-RU',
    taxName: 'НДС',
    defaultTax: '20',
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '10', label: '10%' },
      { rate: '20', label: '20%' },
    ],
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'Korean Won (₩)',
    flag: '🇰🇷',
    localeCode: 'ko-KR',
    taxName: '부가세',
    defaultTax: '10',
    noDecimals: true,
    taxSlabs: [
      { rate: '0', label: '0%' },
      { rate: '10', label: '10%' },
    ],
  },
};

function getInitialCurrency(locale: string): CurrencyType {
  const base = (locale || 'en').toLowerCase().split('-')[0];
  switch (base) {
    case 'zh':
      return 'CNY';
    case 'ja':
      return 'JPY';
    case 'ko':
      return 'KRW';
    case 'de':
    case 'fr':
    case 'es':
    case 'it':
      return 'EUR';
    case 'ru':
      return 'RUB';
    case 'pt':
      return 'BRL';
    case 'en':
    default:
      return 'INR';
  }
}

const QUICK_DISCOUNTS = ['5', '10', '15', '20', '25', '30', '40', '50', '70'];

export default function DiscountCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.discountCalculator');

  // Mode State
  const [mode, setMode] = useState<Mode>('discount-gst');

  // Currency State (automatically mapped to active locale, or user choice)
  const [currency, setCurrency] = useState<CurrencyType>(() => getInitialCurrency(locale));

  // Mode 1: Discount + GST inputs
  const [price, setPrice] = useState('2000');
  const [discount, setDiscount] = useState('20');
  const [gstRate, setGstRate] = useState('18');

  // Mode 2: Calculate % from MRP & Deal Price
  const [mrpInput, setMrpInput] = useState('2499');
  const [salePriceInput, setSalePriceInput] = useState('1749');

  // Mode 3: Find Original MRP inputs
  const [origSalePrice, setOrigSalePrice] = useState('1500');
  const [origDiscount, setOrigDiscount] = useState('25');

  // Mode 4: Stacked Discounts inputs
  const [stackPrice, setStackPrice] = useState('1000');
  const [stackDisc1, setStackDisc1] = useState('30');
  const [stackDisc2, setStackDisc2] = useState('10');

  const [copied, setCopied] = useState(false);

  // Automatically update currency & tax default when user switches language
  useEffect(() => {
    const detected = getInitialCurrency(locale);
    setCurrency(detected);
    setGstRate(ALL_CURRENCIES[detected].defaultTax);
  }, [locale]);

  const currConfig = ALL_CURRENCIES[currency];
  const currSymbol = currConfig.symbol;

  // Currency Formatter Helper
  const formatMoney = (val: number): string => {
    const fractionDigits = currConfig.noDecimals ? 0 : 2;
    const formatted = val.toLocaleString(currConfig.localeCode, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    return `${currConfig.symbol}${formatted}`;
  };

  // Calculations for Mode 1: Discount + GST
  const discountGstCalc = useMemo(() => {
    const mrp = Math.max(0, parseFloat(price) || 0);
    const discPercent = Math.max(0, Math.min(100, parseFloat(discount) || 0));
    const gstPercent = Math.max(0, parseFloat(gstRate) || 0);

    const discountAmount = (mrp * discPercent) / 100;
    const taxablePrice = Math.max(0, mrp - discountAmount);
    const totalGstAmount = (taxablePrice * gstPercent) / 100;
    const cgstAmount = totalGstAmount / 2;
    const sgstAmount = totalGstAmount / 2;
    const finalPayable = taxablePrice + totalGstAmount;
    const netSavings = mrp - finalPayable;

    return {
      mrp,
      discPercent,
      gstPercent,
      discountAmount,
      taxablePrice,
      totalGstAmount,
      cgstAmount,
      sgstAmount,
      finalPayable,
      netSavings,
    };
  }, [price, discount, gstRate]);

  // Calculations for Mode 2: Calculate Discount % from MRP
  const mrpPercentCalc = useMemo(() => {
    const mrp = Math.max(0, parseFloat(mrpInput) || 0);
    const sale = Math.max(0, parseFloat(salePriceInput) || 0);

    const savings = Math.max(0, mrp - sale);
    const discountPercent = mrp > 0 ? (savings / mrp) * 100 : 0;

    return {
      mrp,
      sale,
      savings,
      discountPercent,
    };
  }, [mrpInput, salePriceInput]);

  // Calculations for Mode 3: Find Original MRP
  const originalCalc = useMemo(() => {
    const sale = Math.max(0, parseFloat(origSalePrice) || 0);
    const disc = Math.max(0, Math.min(99.99, parseFloat(origDiscount) || 0));

    const original = disc < 100 ? sale / (1 - disc / 100) : 0;
    const savings = Math.max(0, original - sale);

    return {
      sale,
      disc,
      original,
      savings,
    };
  }, [origSalePrice, origDiscount]);

  // Calculations for Mode 4: Stacked Discounts
  const stackCalc = useMemo(() => {
    const orig = Math.max(0, parseFloat(stackPrice) || 0);
    const d1 = Math.max(0, Math.min(100, parseFloat(stackDisc1) || 0));
    const d2 = Math.max(0, Math.min(100, parseFloat(stackDisc2) || 0));

    const afterFirst = orig * (1 - d1 / 100);
    const finalPrice = afterFirst * (1 - d2 / 100);
    const savings = orig - finalPrice;
    const effectiveDiscount = orig > 0 ? (savings / orig) * 100 : 0;

    return {
      orig,
      d1,
      d2,
      afterFirst,
      finalPrice,
      savings,
      effectiveDiscount,
    };
  }, [stackPrice, stackDisc1, stackDisc2]);

  // Copy Receipt Breakdown handler
  const handleCopy = () => {
    let text = '';

    if (mode === 'discount-gst') {
      text = `=== ${tUI('taxBreakdownTitle')} ===
${tUI('originalPrice')}: ${formatMoney(discountGstCalc.mrp)}
${tUI('discount')}: ${discountGstCalc.discPercent}% (-${formatMoney(discountGstCalc.discountAmount)})
${tUI('taxableAmount')}: ${formatMoney(discountGstCalc.taxablePrice)}
${currConfig.taxName} (${discountGstCalc.gstPercent}%): +${formatMoney(discountGstCalc.totalGstAmount)}`;

      if (currency === 'INR') {
        text += `\n  - ${tUI('cgst')} (${(discountGstCalc.gstPercent / 2).toFixed(1)}%): ${formatMoney(discountGstCalc.cgstAmount)}`;
        text += `\n  - ${tUI('sgst')} (${(discountGstCalc.gstPercent / 2).toFixed(1)}%): ${formatMoney(discountGstCalc.sgstAmount)}`;
      }

      text += `\n---------------------------------
${tUI('totalPayable')}: ${formatMoney(discountGstCalc.finalPayable)}
${tUI('youSave')}: ${formatMoney(discountGstCalc.discountAmount)} (Net: ${formatMoney(discountGstCalc.netSavings)})`;
    } else if (mode === 'mrp-percent') {
      text = `=== ${tUI('modeFindPercent')} ===
${tUI('mrpPrice')}: ${formatMoney(mrpPercentCalc.mrp)}
${tUI('dealPrice')}: ${formatMoney(mrpPercentCalc.sale)}
${tUI('calculatedDiscount')}: ${mrpPercentCalc.discountPercent.toFixed(2)}% OFF
${tUI('youSave')}: ${formatMoney(mrpPercentCalc.savings)}`;
    } else if (mode === 'original') {
      text = `=== ${tUI('modeOriginal')} ===
${tUI('salePrice')}: ${formatMoney(originalCalc.sale)}
${tUI('discount')}: ${originalCalc.disc}%
${tUI('originalPrice')}: ${formatMoney(originalCalc.original)}
${tUI('youSave')}: ${formatMoney(originalCalc.savings)}`;
    } else {
      text = `=== ${tUI('modeStack')} ===
${tUI('originalPrice')}: ${formatMoney(stackCalc.orig)}
${tUI('firstDiscount')}: ${stackCalc.d1}%
${tUI('secondDiscount')}: ${stackCalc.d2}%
${tUI('effectiveDiscount')}: ${stackCalc.effectiveDiscount.toFixed(2)}%
${tUI('finalPrice')}: ${formatMoney(stackCalc.finalPrice)}
${tUI('youSave')}: ${formatMoney(stackCalc.savings)}`;
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

          {/* Top Bar: Mode Tabs & Full International Currency Selector */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginTop: 'var(--space-6)',
              marginBottom: '16px',
            }}
          >
            {/* Mode Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { key: 'discount-gst', label: tUI('modeDiscountGst') },
                { key: 'mrp-percent', label: tUI('modeFindPercent') },
                { key: 'original', label: tUI('modeOriginal') },
                { key: 'stack', label: tUI('modeStack') },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key as Mode)}
                  style={{
                    backgroundColor: mode === m.key ? 'var(--primary-color)' : 'var(--bg-card)',
                    color: mode === m.key ? '#ffffff' : 'var(--text-main)',
                    border:
                      mode === m.key
                        ? '1px solid var(--primary-color)'
                        : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Currency Selector Supporting All 10 Locales */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '4px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={15} color="var(--primary-color)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {tUI('currencyLabel')}
                </span>
              </div>

              {/* Full Currency Dropdown */}
              <select
                value={currency}
                onChange={(e) => {
                  const newCurr = e.target.value as CurrencyType;
                  setCurrency(newCurr);
                  setGstRate(ALL_CURRENCIES[newCurr].defaultTax);
                }}
                style={{
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <option value="INR">🇮🇳 INR - Indian Rupee (₹)</option>
                <option value="USD">🇺🇸 USD - US Dollar ($)</option>
                <option value="EUR">🇪🇺 EUR - Euro (€)</option>
                <option value="GBP">🇬🇧 GBP - British Pound (£)</option>
                <option value="BRL">🇧🇷 BRL - Brazilian Real (R$)</option>
                <option value="JPY">🇯🇵 JPY - Japanese Yen (¥)</option>
                <option value="CNY">🇨🇳 CNY - Chinese Yuan (¥)</option>
                <option value="RUB">🇷🇺 RUB - Russian Ruble (₽)</option>
                <option value="KRW">🇰🇷 KRW - Korean Won (₩)</option>
              </select>

              {/* Quick 1-click popular pills */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {(['INR', 'USD', 'EUR'] as CurrencyType[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setGstRate(ALL_CURRENCIES[c].defaultTax);
                    }}
                    title={ALL_CURRENCIES[c].name}
                    style={{
                      backgroundColor: currency === c ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                      color: currency === c ? '#60a5fa' : 'var(--text-muted)',
                      border:
                        currency === c
                          ? '1px solid rgba(59, 130, 246, 0.4)'
                          : '1px solid transparent',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {ALL_CURRENCIES[c].symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Discount Presets Bar (Mode 1 only) */}
          {mode === 'discount-gst' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '16px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  marginRight: '6px',
                }}
              >
                <Sparkles size={14} color="#f59e0b" />
                <span>{tUI('quickDiscounts')}</span>
              </div>
              {QUICK_DISCOUNTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscount(d)}
                  style={{
                    backgroundColor:
                      discount === d ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: discount === d ? '#60a5fa' : 'var(--text-main)',
                    border:
                      discount === d
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '3px 9px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {d}%
                </button>
              ))}
            </div>
          )}

          {/* MAIN CALCULATOR CARD */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            {/* MODE 1: DISCOUNT WITH GST */}
            {mode === 'discount-gst' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                {/* MRP / Original Price */}
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('originalPrice')} ({currSymbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2000"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: `12px 12px 12px ${currSymbol.length > 1 ? '38px' : '30px'}`,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* Discount % */}
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('discount')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      %
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="20"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px 30px 12px 14px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* GST / Tax Rate % with Currency-Specific Slabs */}
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {currConfig.taxName} {tUI('gstRate')}
                  </label>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <span
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      %
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      placeholder={currConfig.defaultTax}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px 30px 12px 14px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  {/* Currency Slabs Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {currConfig.taxSlabs.map((s) => (
                      <button
                        key={s.rate}
                        onClick={() => setGstRate(s.rate)}
                        style={{
                          backgroundColor:
                            gstRate === s.rate
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255, 255, 255, 0.04)',
                          color: gstRate === s.rate ? '#34d399' : 'var(--text-muted)',
                          border:
                            gstRate === s.rate
                              ? '1px solid rgba(16, 185, 129, 0.4)'
                              : '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: CALCULATE DISCOUNT % FROM MRP */}
            {mode === 'mrp-percent' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('mrpPrice')} ({currSymbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={mrpInput}
                      onChange={(e) => setMrpInput(e.target.value)}
                      placeholder="2499"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: `12px 12px 12px ${currSymbol.length > 1 ? '38px' : '30px'}`,
                        fontSize: '1.05rem',
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
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('dealPrice')} ({currSymbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={salePriceInput}
                      onChange={(e) => setSalePriceInput(e.target.value)}
                      placeholder="1749"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: `12px 12px 12px ${currSymbol.length > 1 ? '38px' : '30px'}`,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: FIND ORIGINAL MRP */}
            {mode === 'original' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('salePrice')} ({currSymbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={origSalePrice}
                      onChange={(e) => setOrigSalePrice(e.target.value)}
                      placeholder="1500"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: `12px 12px 12px ${currSymbol.length > 1 ? '38px' : '30px'}`,
                        fontSize: '1.05rem',
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
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('discount')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      %
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={origDiscount}
                      onChange={(e) => setOrigDiscount(e.target.value)}
                      placeholder="25"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px 30px 12px 14px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 4: STACKED DISCOUNTS */}
            {mode === 'stack' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('originalPrice')} ({currSymbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {currSymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={stackPrice}
                      onChange={(e) => setStackPrice(e.target.value)}
                      placeholder="1000"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: `12px 12px 12px ${currSymbol.length > 1 ? '38px' : '30px'}`,
                        fontSize: '1.05rem',
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
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('firstDiscount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stackDisc1}
                    onChange={(e) => setStackDisc1(e.target.value)}
                    placeholder="30"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px 14px',
                      fontSize: '1.05rem',
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
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {tUI('secondDiscount')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stackDisc2}
                    onChange={(e) => setStackDisc2(e.target.value)}
                    placeholder="10"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px 14px',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              </div>
            )}

            {/* RESULTS TILES */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {/* Tile 1: Primary Result */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '18px',
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
                    marginBottom: '4px',
                  }}
                >
                  {mode === 'discount-gst'
                    ? tUI('totalPayable')
                    : mode === 'mrp-percent'
                      ? tUI('calculatedDiscount')
                      : mode === 'original'
                        ? tUI('originalPriceLabel')
                        : tUI('finalPrice')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {mode === 'discount-gst'
                    ? formatMoney(discountGstCalc.finalPayable)
                    : mode === 'mrp-percent'
                      ? `${mrpPercentCalc.discountPercent.toFixed(1)}% OFF`
                      : mode === 'original'
                        ? formatMoney(originalCalc.original)
                        : formatMoney(stackCalc.finalPrice)}
                </div>
              </div>

              {/* Tile 2: Savings */}
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '18px',
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
                    marginBottom: '4px',
                  }}
                >
                  {tUI('youSave')}
                </div>
                <div
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {mode === 'discount-gst'
                    ? formatMoney(discountGstCalc.discountAmount)
                    : mode === 'mrp-percent'
                      ? formatMoney(mrpPercentCalc.savings)
                      : mode === 'original'
                        ? formatMoney(originalCalc.savings)
                        : formatMoney(stackCalc.savings)}
                </div>
              </div>

              {/* Tile 3: Effective Discount or GST */}
              {mode === 'discount-gst' && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '12px',
                    padding: '18px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      color: '#fcd34d',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '4px',
                    }}
                  >
                    {currConfig.taxName} ({discountGstCalc.gstPercent}%)
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    +{formatMoney(discountGstCalc.totalGstAmount)}
                  </div>
                </div>
              )}

              {mode === 'stack' && (
                <div
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: '12px',
                    padding: '18px',
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
                      marginBottom: '4px',
                    }}
                  >
                    {tUI('effectiveDiscount')}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    {stackCalc.effectiveDiscount.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* DIGITAL RECEIPT / ITEMIZED BREAKDOWN (MODE 1: DISCOUNT WITH GST) */}
            {mode === 'discount-gst' && (
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '12px',
                  }}
                >
                  <Receipt size={16} color="var(--primary-color)" />
                  <span>{tUI('taxBreakdownTitle')}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>{tUI('originalPrice')} (MRP)</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {formatMoney(discountGstCalc.mrp)}
                    </span>
                  </div>

                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}
                  >
                    <span>
                      {tUI('discount')} (-{discountGstCalc.discPercent}%)
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      -{formatMoney(discountGstCalc.discountAmount)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-muted)',
                      borderTop: '1px dashed var(--border-color)',
                      paddingTop: '6px',
                    }}
                  >
                    <span>{tUI('taxableAmount')}</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {formatMoney(discountGstCalc.taxablePrice)}
                    </span>
                  </div>

                  {discountGstCalc.gstPercent > 0 && (
                    <>
                      {currency === 'INR' ? (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              color: '#fbbf24',
                              paddingLeft: '10px',
                            }}
                          >
                            <span>
                              • {tUI('cgst')} ({(discountGstCalc.gstPercent / 2).toFixed(1)}%)
                            </span>
                            <span style={{ fontFamily: 'monospace' }}>
                              +{formatMoney(discountGstCalc.cgstAmount)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              color: '#fbbf24',
                              paddingLeft: '10px',
                            }}
                          >
                            <span>
                              • {tUI('sgst')} ({(discountGstCalc.gstPercent / 2).toFixed(1)}%)
                            </span>
                            <span style={{ fontFamily: 'monospace' }}>
                              +{formatMoney(discountGstCalc.sgstAmount)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: '#fbbf24',
                            paddingLeft: '10px',
                          }}
                        >
                          <span>
                            • {currConfig.taxName} ({discountGstCalc.gstPercent}%)
                          </span>
                          <span style={{ fontFamily: 'monospace' }}>
                            +{formatMoney(discountGstCalc.totalGstAmount)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '2px solid var(--border-color)',
                      paddingTop: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: 'var(--text-main)' }}>{tUI('totalPayable')}</span>
                    <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {formatMoney(discountGstCalc.finalPayable)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>{tUI('netSavings')}</span>
                    <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatMoney(discountGstCalc.netSavings)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STACKED WARNING (MODE 4) */}
            {mode === 'stack' && (
              <div
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  padding: '14px',
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
                    discount1: stackCalc.d1,
                    discount2: stackCalc.d2,
                    sum: stackCalc.d1 + stackCalc.d2,
                    effective: stackCalc.effectiveDiscount.toFixed(2),
                  })}
                </div>
              </div>
            )}

            {/* COPY RECEIPT BUTTON */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? tUI('copied') : tUI('copyBreakdown')}
            </button>
          </div>

          {/* STEP-BY-STEP CALCULATION FORMULA BOX */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '12px',
              }}
            >
              <Calculator size={18} color="var(--primary-color)" />
              <span>{tUI('formulaTitle')}</span>
            </div>

            {mode === 'discount-gst' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Step 1:</strong>{' '}
                  {tUI('formulaDiscount')}
                  <br />
                  <code style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {currSymbol}
                    {discountGstCalc.mrp} × ({discountGstCalc.discPercent} / 100) ={' '}
                    {formatMoney(discountGstCalc.discountAmount)}
                  </code>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Step 2:</strong>{' '}
                  {tUI('formulaTaxable')}
                  <br />
                  <code style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                    {currSymbol}
                    {discountGstCalc.mrp} − {formatMoney(discountGstCalc.discountAmount)} ={' '}
                    {formatMoney(discountGstCalc.taxablePrice)}
                  </code>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Step 3:</strong> {tUI('formulaGst')}
                  <br />
                  <code style={{ color: '#fbbf24', fontFamily: 'monospace' }}>
                    {formatMoney(discountGstCalc.taxablePrice)} × ({discountGstCalc.gstPercent} /
                    100) = {formatMoney(discountGstCalc.totalGstAmount)}
                  </code>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Step 4:</strong>{' '}
                  {tUI('formulaTotal')}
                  <br />
                  <code style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatMoney(discountGstCalc.taxablePrice)} +{' '}
                    {formatMoney(discountGstCalc.totalGstAmount)} ={' '}
                    {formatMoney(discountGstCalc.finalPayable)}
                  </code>
                </div>
              </div>
            )}

            {mode === 'mrp-percent' && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Formula:</strong>{' '}
                  {tUI('formulaPercent')}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <code style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                    (({currSymbol}
                    {mrpPercentCalc.mrp} − {currSymbol}
                    {mrpPercentCalc.sale}) / {currSymbol}
                    {mrpPercentCalc.mrp}) × 100 = {mrpPercentCalc.discountPercent.toFixed(2)}% OFF
                  </code>
                </div>
              </div>
            )}

            {mode === 'original' && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Formula:</strong> Original MRP =
                  Sale Price / (1 − (Discount % / 100))
                </div>
                <div style={{ marginTop: '4px' }}>
                  <code style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                    {currSymbol}
                    {originalCalc.sale} / (1 − ({originalCalc.disc} / 100)) ={' '}
                    {formatMoney(originalCalc.original)}
                  </code>
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>Compound Formula:</strong> Final
                  Price = MRP × (1 − D1/100) × (1 − D2/100)
                </div>
                <div style={{ marginTop: '4px' }}>
                  <code style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                    {currSymbol}
                    {stackCalc.orig} × (1 − {stackCalc.d1}/100) × (1 − {stackCalc.d2}/100) ={' '}
                    {formatMoney(stackCalc.finalPrice)} ({stackCalc.effectiveDiscount.toFixed(2)}%
                    effective)
                  </code>
                </div>
              </div>
            )}
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
