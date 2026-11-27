'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Receipt, Calculator, Copy, Check, Sparkles, Globe, Tag } from 'lucide-react';

type Mode = 'discount-gst' | 'mrp-percent' | 'original' | 'stack';
type TaxType = 'inclusive' | 'exclusive';
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
    taxName: 'ICMS',
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
      { rate: '8', label: '8%' },
      { rate: '10', label: '10%' },
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

export default function DiscountCalculatorPage() {
  const locale = useLocale();
  const tUI = useTranslations('ToolUI.discountCalculator');

  // Mode State
  const [mode, setMode] = useState<Mode>('discount-gst');

  // Currency State
  const [currency, setCurrency] = useState<CurrencyType>(() => getInitialCurrency(locale));

  // Tax treatment: inclusive (MRP consumer goods) vs exclusive (B2B / add-on tax)
  const [taxType, setTaxType] = useState<TaxType>('inclusive');

  // Quantity State (1 to 1000)
  const [quantity, setQuantity] = useState('1');

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

  useEffect(() => {
    const detected = getInitialCurrency(locale);
    setCurrency(detected);
    setGstRate(ALL_CURRENCIES[detected].defaultTax);
  }, [locale]);

  const currConfig = ALL_CURRENCIES[currency];
  const currSymbol = currConfig.symbol;

  const formatMoney = (val: number): string => {
    const fractionDigits = currConfig.noDecimals ? 0 : 2;
    const formatted = val.toLocaleString(currConfig.localeCode, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    return `${currConfig.symbol}${formatted}`;
  };

  // Mode 1: Comprehensive Discount + Tax Math with Inclusive / Exclusive handling
  const discountGstCalc = useMemo(() => {
    const unitPrice = Math.max(0, parseFloat(price) || 0);
    const discPercent = Math.max(0, Math.min(100, parseFloat(discount) || 0));
    const taxPercent = Math.max(0, parseFloat(gstRate) || 0);
    const qty = Math.max(1, Math.min(10000, parseInt(quantity, 10) || 1));

    if (taxType === 'inclusive') {
      // Standard Retail MRP: Tax is already inside the sticker price
      const originalTotal = unitPrice * qty;
      const discountedUnit = unitPrice * (1 - discPercent / 100);
      const finalPayable = discountedUnit * qty;
      const totalSavings = originalTotal - finalPayable;

      // Extract embedded tax breakdown on the final discounted price
      const taxablePortion = taxPercent > 0 ? finalPayable / (1 + taxPercent / 100) : finalPayable;
      const totalTax = finalPayable - taxablePortion;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;

      // Also compute tax saved because of discount
      const originalTaxable =
        taxPercent > 0 ? originalTotal / (1 + taxPercent / 100) : originalTotal;
      const originalTax = originalTotal - originalTaxable;
      const taxSavings = Math.max(0, originalTax - totalTax);

      return {
        unitPrice,
        qty,
        discPercent,
        taxPercent,
        taxType,
        originalTotal,
        discountAmount: totalSavings,
        taxablePrice: taxablePortion,
        totalGstAmount: totalTax,
        cgstAmount: cgst,
        sgstAmount: sgst,
        finalPayable,
        netSavings: totalSavings,
        taxSavings,
      };
    } else {
      // Wholesale / B2B Exclusive: Tax is added on top of the discounted price
      const baseSubtotal = unitPrice * qty;
      const preDiscountTax = (baseSubtotal * taxPercent) / 100;
      const originalTotalWithTax = baseSubtotal + preDiscountTax;

      const discountAmount = (baseSubtotal * discPercent) / 100;
      const taxablePrice = Math.max(0, baseSubtotal - discountAmount);
      const totalTax = (taxablePrice * taxPercent) / 100;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      const finalPayable = taxablePrice + totalTax;
      const netSavings = Math.max(0, originalTotalWithTax - finalPayable);
      const taxSavings = (discountAmount * taxPercent) / 100;

      return {
        unitPrice,
        qty,
        discPercent,
        taxPercent,
        taxType,
        originalTotal: originalTotalWithTax,
        discountAmount,
        taxablePrice,
        totalGstAmount: totalTax,
        cgstAmount: cgst,
        sgstAmount: sgst,
        finalPayable,
        netSavings,
        taxSavings,
      };
    }
  }, [price, discount, gstRate, quantity, taxType]);

  // Mode 2: Calculate Discount % from MRP & Deal Price
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

  // Mode 3: Find Original MRP
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

  // Mode 4: Stacked / Sequential Discounts
  const stackCalc = useMemo(() => {
    const orig = Math.max(0, parseFloat(stackPrice) || 0);
    const d1 = Math.max(0, Math.min(100, parseFloat(stackDisc1) || 0));
    const d2 = Math.max(0, Math.min(100, parseFloat(stackDisc2) || 0));

    const afterFirst = orig * (1 - d1 / 100);
    const finalPrice = afterFirst * (1 - d2 / 100);
    const savings = Math.max(0, orig - finalPrice);
    const effectiveDiscount = orig > 0 ? (savings / orig) * 100 : 0;
    const simpleSum = d1 + d2;
    const illusionGap = Math.max(0, simpleSum - effectiveDiscount);

    return {
      orig,
      d1,
      d2,
      afterFirst,
      finalPrice,
      savings,
      effectiveDiscount,
      simpleSum,
      illusionGap,
    };
  }, [stackPrice, stackDisc1, stackDisc2]);

  // Copy Receipt Handler
  const handleCopy = () => {
    let text = '';
    if (mode === 'discount-gst') {
      text = `=== ${tUI('taxBreakdownTitle')} ===
${tUI('originalPrice')}: ${formatMoney(discountGstCalc.originalTotal)} (Qty: ${discountGstCalc.qty})
${tUI('discount')}: ${discountGstCalc.discPercent}% (-${formatMoney(discountGstCalc.discountAmount)})
${tUI('taxableAmount')}: ${formatMoney(discountGstCalc.taxablePrice)}
${currConfig.taxName} (${discountGstCalc.taxPercent}%): ${formatMoney(discountGstCalc.totalGstAmount)}`;

      if (currency === 'INR') {
        text += `\n  - ${tUI('cgst')} (${(discountGstCalc.taxPercent / 2).toFixed(1)}%): ${formatMoney(discountGstCalc.cgstAmount)}`;
        text += `\n  - ${tUI('sgst')} (${(discountGstCalc.taxPercent / 2).toFixed(1)}%): ${formatMoney(discountGstCalc.sgstAmount)}`;
      }

      text += `\n---------------------------------
${tUI('totalPayable')}: ${formatMoney(discountGstCalc.finalPayable)}
${tUI('netSavings')}: ${formatMoney(discountGstCalc.netSavings)}`;
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
${tUI('effectiveDiscount')}: ${stackCalc.effectiveDiscount.toFixed(2)}% (Not ${stackCalc.simpleSum}%)
${tUI('finalPrice')}: ${formatMoney(stackCalc.finalPrice)}
${tUI('youSave')}: ${formatMoney(stackCalc.savings)}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Presets list
  const applyPreset = (dealType: string) => {
    if (dealType === 'flat20') {
      setMode('discount-gst');
      setDiscount('20');
      setQuantity('1');
    } else if (dealType === 'flat50') {
      setMode('discount-gst');
      setDiscount('50');
      setQuantity('1');
    } else if (dealType === 'bogo') {
      setMode('discount-gst');
      setDiscount('50');
      setQuantity('2');
    } else if (dealType === 'buy2get1') {
      setMode('discount-gst');
      setDiscount('33.33');
      setQuantity('3');
    } else if (dealType === 'festiveStack') {
      setMode('stack');
      setStackDisc1('30');
      setStackDisc2('10');
    }
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading
          title={tUI('title')}
          subtitle={tUI('subtitle')}
          toolSlug="discount-calculator"
        />

        {/* Top Control Bar: Mode Tabs & Currency Switcher */}
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
          {/* Modes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { key: 'discount-gst', label: tUI('modeDiscountGst') },
              { key: 'mrp-percent', label: tUI('modeFindPercent') },
              { key: 'original', label: tUI('modeOriginal') },
              { key: 'stack', label: tUI('modeStack') },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
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

          {/* Currency Dropdown */}
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
            <Globe size={15} color="var(--primary-color)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {tUI('currencyLabel')}:
            </span>
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
          </div>
        </div>

        {/* 1-Click Retail Presets Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginRight: '4px',
            }}
          >
            <Tag size={14} color="#f59e0b" />
            <span>{tUI('quickDealsTitle')}:</span>
          </div>
          {[
            { id: 'flat20', label: tUI('presetFlat20') },
            { id: 'flat50', label: tUI('presetFlat50') },
            { id: 'bogo', label: tUI('presetBogo') },
            { id: 'buy2get1', label: tUI('presetBuy2Get1') },
            { id: 'festiveStack', label: tUI('presetFestiveStack') },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* MAIN CALCULATOR CARD */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '22px',
          }}
        >
          {/* MODE 1: DISCOUNT WITH GST */}
          {mode === 'discount-gst' && (
            <>
              {/* Tax Type Switcher: Inclusive vs Exclusive */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tUI('taxTypeLabel')}:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setTaxType('inclusive')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        taxType === 'inclusive'
                          ? '1px solid #10b981'
                          : '1px solid var(--border-color)',
                      backgroundColor:
                        taxType === 'inclusive' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: taxType === 'inclusive' ? '#34d399' : 'var(--text-muted)',
                    }}
                  >
                    {tUI('taxInclusiveOption')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxType('exclusive')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        taxType === 'exclusive'
                          ? '1px solid #3b82f6'
                          : '1px solid var(--border-color)',
                      backgroundColor:
                        taxType === 'exclusive' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: taxType === 'exclusive' ? '#60a5fa' : 'var(--text-muted)',
                    }}
                  >
                    {tUI('taxExclusiveOption')}
                  </button>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '16px',
                  marginBottom: '18px',
                }}
              >
                {/* Price Input with Slider */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      htmlFor="price-input"
                      style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {tUI('originalPrice')} ({currSymbol})
                    </label>
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatMoney(parseFloat(price) || 0)}
                    </span>
                  </div>
                  <input
                    id="price-input"
                    type="number"
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={currency === 'INR' ? 100000 : 5000}
                    step={currency === 'INR' ? 100 : 10}
                    value={parseFloat(price) || 0}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                </div>

                {/* Discount % with Range Slider */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      htmlFor="discount-input"
                      style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {tUI('discount')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: 'monospace',
                      }}
                    >
                      {discount}% OFF
                    </span>
                  </div>
                  <input
                    id="discount-input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={1}
                    value={parseFloat(discount) || 0}
                    onChange={(e) => setDiscount(e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>

                {/* Quantity and GST Tax Rate */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      htmlFor="qty-input"
                      style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}
                    >
                      {tUI('quantityLabel')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      ×{quantity}
                    </span>
                  </div>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />

                  {/* Tax Slabs Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}
                    >
                      {currConfig.taxName}:
                    </span>
                    {currConfig.taxSlabs.map((s) => (
                      <button
                        key={s.rate}
                        type="button"
                        onClick={() => setGstRate(s.rate)}
                        style={{
                          backgroundColor:
                            gstRate === s.rate
                              ? 'rgba(245, 158, 11, 0.25)'
                              : 'rgba(255, 255, 255, 0.05)',
                          color: gstRate === s.rate ? '#f59e0b' : 'var(--text-muted)',
                          border:
                            gstRate === s.rate
                              ? '1px solid rgba(245, 158, 11, 0.5)'
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
            </>
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
                  htmlFor="mrp-input"
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
                <input
                  id="mrp-input"
                  type="number"
                  min="0"
                  value={mrpInput}
                  onChange={(e) => setMrpInput(e.target.value)}
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
                  htmlFor="deal-input"
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
                <input
                  id="deal-input"
                  type="number"
                  min="0"
                  value={salePriceInput}
                  onChange={(e) => setSalePriceInput(e.target.value)}
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
                  htmlFor="orig-sale-input"
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
                <input
                  id="orig-sale-input"
                  type="number"
                  min="0"
                  value={origSalePrice}
                  onChange={(e) => setOrigSalePrice(e.target.value)}
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
                  htmlFor="orig-disc-input"
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('discount')} (%)
                </label>
                <input
                  id="orig-disc-input"
                  type="number"
                  min="0"
                  max="99"
                  value={origDiscount}
                  onChange={(e) => setOrigDiscount(e.target.value)}
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
                  htmlFor="stack-price-input"
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
                <input
                  id="stack-price-input"
                  type="number"
                  min="0"
                  value={stackPrice}
                  onChange={(e) => setStackPrice(e.target.value)}
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
                  htmlFor="stack-d1-input"
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('firstDiscount')} (%)
                </label>
                <input
                  id="stack-d1-input"
                  type="number"
                  min="0"
                  max="100"
                  value={stackDisc1}
                  onChange={(e) => setStackDisc1(e.target.value)}
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
                  htmlFor="stack-d2-input"
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {tUI('secondDiscount')} (%)
                </label>
                <input
                  id="stack-d2-input"
                  type="number"
                  min="0"
                  max="100"
                  value={stackDisc2}
                  onChange={(e) => setStackDisc2(e.target.value)}
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

          {/* PRIMARY RESULTS TILES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* Tile 1: Total Payable */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#6ee7b7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
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
                  color: '#34d399',
                  fontSize: '1.9rem',
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

            {/* Tile 2: Total Savings */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#93c5fd',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}
              >
                {tUI('youSave')}
              </div>
              <div
                style={{
                  color: '#60a5fa',
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {mode === 'discount-gst'
                  ? formatMoney(discountGstCalc.netSavings)
                  : mode === 'mrp-percent'
                    ? formatMoney(mrpPercentCalc.savings)
                    : mode === 'original'
                      ? formatMoney(originalCalc.savings)
                      : formatMoney(stackCalc.savings)}
              </div>
            </div>

            {/* Tile 3: Effective Discount or Tax */}
            {mode === 'discount-gst' && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#fcd34d',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  {currConfig.taxName} ({discountGstCalc.taxPercent}%)
                </div>
                <div
                  style={{
                    color: '#fbbf24',
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {formatMoney(discountGstCalc.totalGstAmount)}
                </div>
              </div>
            )}

            {mode === 'stack' && (
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  {tUI('effectiveDiscount')}
                </div>
                <div
                  style={{
                    color: '#c4b5fd',
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {stackCalc.effectiveDiscount.toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          {/* VISUAL SAVINGS BAR */}
          <div
            style={{
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              <span style={{ color: '#34d399' }}>
                ■ {tUI('totalPayable')}:{' '}
                {mode === 'discount-gst'
                  ? formatMoney(discountGstCalc.finalPayable)
                  : mode === 'stack'
                    ? formatMoney(stackCalc.finalPrice)
                    : formatMoney(mrpPercentCalc.sale)}
              </span>
              <span style={{ color: '#60a5fa' }}>
                ■ {tUI('youSave')}:{' '}
                {mode === 'discount-gst'
                  ? formatMoney(discountGstCalc.netSavings)
                  : mode === 'stack'
                    ? formatMoney(stackCalc.savings)
                    : formatMoney(mrpPercentCalc.savings)}
              </span>
            </div>
            <div
              style={{
                height: '14px',
                borderRadius: '7px',
                backgroundColor: 'var(--bg-card)',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${
                    mode === 'discount-gst'
                      ? discountGstCalc.originalTotal > 0
                        ? (discountGstCalc.finalPayable / discountGstCalc.originalTotal) * 100
                        : 50
                      : mode === 'stack'
                        ? (stackCalc.finalPrice / stackCalc.orig) * 100
                        : mrpPercentCalc.mrp > 0
                          ? (mrpPercentCalc.sale / mrpPercentCalc.mrp) * 100
                          : 50
                  }%`,
                  backgroundColor: '#10b981',
                  transition: 'width 0.3s ease',
                }}
              />
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* SMART AI DEAL INSIGHT CARD */}
          <div
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.28)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#c4b5fd',
                marginBottom: '8px',
              }}
            >
              <Sparkles size={16} color="#a78bfa" />
              <span>{tUI('aiInsightTitle')}</span>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {mode === 'discount-gst' && (
                <>
                  {discountGstCalc.discPercent >= 50 ? (
                    <p style={{ margin: 0 }}>
                      🔥 <strong>{tUI('aiStealDeal')}:</strong>{' '}
                      {tUI('aiStealDealDesc', {
                        percent: discountGstCalc.discPercent,
                        savings: formatMoney(discountGstCalc.netSavings),
                      })}
                    </p>
                  ) : discountGstCalc.discPercent >= 30 ? (
                    <p style={{ margin: 0 }}>
                      ⚡ <strong>{tUI('aiGreatDeal')}:</strong>{' '}
                      {tUI('aiGreatDealDesc', {
                        percent: discountGstCalc.discPercent,
                        savings: formatMoney(discountGstCalc.netSavings),
                      })}
                    </p>
                  ) : (
                    <p style={{ margin: 0 }}>
                      🛒 <strong>{tUI('aiStandardOffer')}:</strong>{' '}
                      {tUI('aiStandardOfferDesc', { percent: discountGstCalc.discPercent })}
                    </p>
                  )}
                  {discountGstCalc.taxPercent > 0 && (
                    <p
                      style={{
                        margin: '6px 0 0 0',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                      }}
                    >
                      🛡️ <strong>{tUI('aiGstRuleTitle')}:</strong>{' '}
                      {tUI('aiGstRuleDesc', {
                        taxSaved: formatMoney(discountGstCalc.taxSavings),
                        taxName: currConfig.taxName,
                      })}
                    </p>
                  )}
                </>
              )}

              {mode === 'stack' && (
                <p style={{ margin: 0 }}>
                  ⚠️ <strong>{tUI('aiStackAlertTitle')}:</strong>{' '}
                  {tUI('aiStackAlertDesc', {
                    d1: stackCalc.d1,
                    d2: stackCalc.d2,
                    sum: stackCalc.simpleSum,
                    effective: stackCalc.effectiveDiscount.toFixed(2),
                    gap: stackCalc.illusionGap.toFixed(2),
                  })}
                </p>
              )}

              {(mode === 'mrp-percent' || mode === 'original') && (
                <p style={{ margin: 0 }}>
                  💡 <strong>{tUI('aiFormulaTipTitle')}:</strong> {tUI('aiFormulaTipDesc')}
                </p>
              )}
            </div>
          </div>

          {/* DIGITAL RECEIPT ITEMIZED BREAKDOWN (MODE 1: DISCOUNT WITH GST) */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {tUI('originalPrice')} ({discountGstCalc.qty} {tUI('itemsWord')})
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                    }}
                  >
                    {formatMoney(discountGstCalc.originalTotal)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
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

                {discountGstCalc.taxPercent > 0 && (
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
                            • {tUI('cgst')} ({(discountGstCalc.taxPercent / 2).toFixed(1)}%)
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
                            • {tUI('sgst')} ({(discountGstCalc.taxPercent / 2).toFixed(1)}%)
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
                          • {currConfig.taxName} ({discountGstCalc.taxPercent}%)
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
                  <span style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '1.15rem' }}>
                    {formatMoney(discountGstCalc.finalPayable)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{tUI('netSavings')}</span>
                  <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatMoney(discountGstCalc.netSavings)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* COPY RECEIPT BUTTON */}
          <button
            type="button"
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
            <span>{copied ? tUI('copied') : tUI('copyBreakdown')}</span>
          </button>
        </div>

        {/* STEP-BY-STEP CALCULATION FORMULA CARD */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
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
                  {discountGstCalc.unitPrice} × ({discountGstCalc.discPercent} / 100) ={' '}
                  {formatMoney((discountGstCalc.unitPrice * discountGstCalc.discPercent) / 100)}{' '}
                  {tUI('perUnitWord')}
                </code>
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)' }}>Step 2:</strong> {tUI('formulaTotal')}
                <br />
                <code style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                  {formatMoney(discountGstCalc.finalPayable)} ({discountGstCalc.qty}{' '}
                  {tUI('itemsWord')})
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
                <strong style={{ color: 'var(--text-main)' }}>Formula:</strong> Original MRP = Sale
                Price / (1 − (Discount % / 100))
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
                <strong style={{ color: 'var(--text-main)' }}>Compound Formula:</strong> Final Price
                = MRP × (1 − D1/100) × (1 − D2/100)
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

        {/* COMPARISON TABLE: VelnoxLabs vs Phone Calculator vs E-Commerce Cart */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '28px',
            overflowX: 'auto',
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {tUI('compareTitle')}
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.86rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 700 }}>
                  {tUI('compareColFeature')}
                </th>
                <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>VelnoxLabs</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Basic Phone Calculator
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  E-Commerce Carts
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow1Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow1Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow1Phone')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow1Cart')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow2Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow2Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow2Phone')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow2Cart')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow3Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow3Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow3Phone')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow3Cart')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {tUI('compareRow4Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {tUI('compareRow4Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow4Phone')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {tUI('compareRow4Cart')}
                </td>
              </tr>
            </tbody>
          </table>
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
  );
}
