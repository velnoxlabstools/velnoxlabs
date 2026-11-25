'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  Sparkles,
  Copy,
  Check,
  Calculator,
  Users,
  Utensils,
  Scissors,
  Truck,
  Coffee,
  Car,
} from 'lucide-react';

type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';
type ServiceType = 'restaurant' | 'hair' | 'delivery' | 'coffee' | 'taxi';
type QualityType = 'standard' | 'good' | 'great' | 'exceptional';
type RegionType = 'us' | 'uk' | 'india' | 'japan';
type TipBasis = 'preTax' | 'postTax';
type TipInputMode = 'percent' | 'flat';
type RoundingMode = 'none' | 'totalUp' | 'perPersonUp';

const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; decimals: number }> = {
  USD: { symbol: '$', decimals: 2 },
  INR: { symbol: '₹', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  CAD: { symbol: 'CA$', decimals: 2 },
  AUD: { symbol: 'A$', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
};

const SERVICE_BASE_TIP: Record<ServiceType, number> = {
  restaurant: 18,
  hair: 20,
  delivery: 15,
  coffee: 15,
  taxi: 15,
};

const QUALITY_DELTA: Record<QualityType, number> = {
  standard: -3,
  good: 0,
  great: 2,
  exceptional: 5,
};

const REGION_DELTA: Record<RegionType, number> = {
  us: 0,
  uk: -5,
  india: -8,
  japan: -100,
};

function formatMoney(amount: number, currency: CurrencyCode): string {
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  return `${cfg.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  })}`;
}

export default function TipCalculatorPage() {
  const tUI = useTranslations('ToolUI.tipCalculator');

  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Smart Advisor State
  const [service, setService] = useState<ServiceType>('restaurant');
  const [quality, setQuality] = useState<QualityType>('good');
  const [region, setRegion] = useState<RegionType>('us');

  // Bill, Tax & Discount
  const [bill, setBill] = useState('50.00');
  const [taxPercent, setTaxPercent] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [tipBasis, setTipBasis] = useState<TipBasis>('preTax');

  // Tip Mode & Amount
  const [tipMode, setTipMode] = useState<TipInputMode>('percent');
  const [tipPercent, setTipPercent] = useState(18);
  const [flatTip, setFlatTip] = useState('10.00');

  // Split & Rounding
  const [people, setPeople] = useState(1);
  const [rounding, setRounding] = useState<RoundingMode>('none');
  const [copied, setCopied] = useState(false);

  const recomputeRecommendedTip = (s: ServiceType, q: QualityType, r: RegionType) => {
    setService(s);
    setQuality(q);
    setRegion(r);
    if (r === 'japan') {
      setTipMode('percent');
      setTipPercent(0);
      return;
    }
    const calc = Math.max(0, SERVICE_BASE_TIP[s] + QUALITY_DELTA[q] + REGION_DELTA[r]);
    setTipMode('percent');
    setTipPercent(calc);
  };

  // Core Calculations
  const {
    billNum,
    discountedBill,
    taxNum,
    taxAmount,
    tipBase,
    tipAmount,
    totalAmount,
    perPerson,
    perPersonBillAndTax,
    perPersonTip,
    effectiveTipRate,
  } = useMemo(() => {
    const b = Math.max(0, parseFloat(bill) || 0);
    const d = Math.min(b, Math.max(0, parseFloat(discount) || 0));
    const discBill = Math.max(0, b - d);
    const tRate = Math.max(0, parseFloat(taxPercent) || 0);
    const taxAmt = (discBill * tRate) / 100;
    const baseForTip = tipBasis === 'preTax' ? b : discBill + taxAmt;

    let rawTip =
      tipMode === 'percent'
        ? (baseForTip * Math.max(0, tipPercent)) / 100
        : Math.max(0, parseFloat(flatTip) || 0);

    let total = discBill + taxAmt + rawTip;
    const party = Math.max(1, people);
    let each = total / party;

    if (rounding === 'totalUp') {
      total = Math.ceil(total);
      rawTip = Math.max(0, total - (discBill + taxAmt));
      each = total / party;
    } else if (rounding === 'perPersonUp') {
      each = Math.ceil(total / party);
      total = each * party;
      rawTip = Math.max(0, total - (discBill + taxAmt));
    }

    const effRate = baseForTip > 0 ? Math.round((rawTip / baseForTip) * 1000) / 10 : 0;

    return {
      billNum: b,
      discountedBill: discBill,
      taxNum: tRate,
      taxAmount: taxAmt,
      tipBase: baseForTip,
      tipAmount: rawTip,
      totalAmount: total,
      perPerson: each,
      perPersonBillAndTax: (discBill + taxAmt) / party,
      perPersonTip: rawTip / party,
      effectiveTipRate: effRate,
    };
  }, [bill, discount, taxPercent, tipBasis, tipMode, tipPercent, flatTip, people, rounding]);

  const handleCopy = () => {
    const lines = [
      `${tUI('billLabel')}: ${formatMoney(billNum, currency)}`,
      taxNum > 0
        ? `${tUI('taxAmountRow', { rate: taxNum })} ${formatMoney(taxAmount, currency)}`
        : '',
      `${tUI('tipAmount')} (${effectiveTipRate}%): ${formatMoney(tipAmount, currency)}`,
      `${tUI('totalLabel')}: ${formatMoney(totalAmount, currency)}`,
      tUI('splitBetweenLabel', {
        count: people,
        peopleLabel: people === 1 ? tUI('person') : tUI('people'),
        amount: formatMoney(perPerson, currency),
      }),
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currencySym = CURRENCY_CONFIG[currency].symbol;
  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

        {/* ================= CURRENCY & SMART ADVISOR BAR ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-5)',
          }}
        >
          {/* Currency Selector */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '16px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={16} style={{ color: '#3b82f6' }} />
              {tUI('advisorTitle')}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {tUI('currencyLabel')}
              </span>
              {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: currency === c ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor: currency === c ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    color: currency === c ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {c} ({CURRENCY_CONFIG[c].symbol})
                </button>
              ))}
            </div>
          </div>

          {/* Service Presets */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {[
              { id: 'restaurant' as const, labelKey: 'serviceRestaurant' as const, Icon: Utensils },
              { id: 'hair' as const, labelKey: 'serviceHair' as const, Icon: Scissors },
              { id: 'delivery' as const, labelKey: 'serviceDelivery' as const, Icon: Truck },
              { id: 'coffee' as const, labelKey: 'serviceCoffee' as const, Icon: Coffee },
              { id: 'taxi' as const, labelKey: 'serviceTaxi' as const, Icon: Car },
            ].map(({ id, labelKey, Icon }) => (
              <button
                key={id}
                onClick={() => recomputeRecommendedTip(id, quality, region)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: service === id ? '#3b82f6' : 'var(--border-color)',
                  backgroundColor: service === id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-page)',
                  color: service === id ? '#60a5fa' : 'var(--text-muted)',
                }}
              >
                <Icon size={14} />
                {tUI(labelKey)}
              </button>
            ))}
          </div>

          {/* Quality + Region Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'standard', key: 'qualityStandard' },
                  { id: 'good', key: 'qualityGood' },
                  { id: 'great', key: 'qualityGreat' },
                  { id: 'exceptional', key: 'qualityExceptional' },
                ] as const
              ).map((q) => (
                <button
                  key={q.id}
                  onClick={() => recomputeRecommendedTip(service, q.id, region)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: quality === q.id ? '#10b981' : 'var(--border-color)',
                    backgroundColor:
                      quality === q.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-page)',
                    color: quality === q.id ? '#34d399' : 'var(--text-muted)',
                  }}
                >
                  {tUI(q.key)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'us', key: 'regionUS' },
                  { id: 'uk', key: 'regionUK' },
                  { id: 'india', key: 'regionIndia' },
                  { id: 'japan', key: 'regionJapan' },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  onClick={() => recomputeRecommendedTip(service, quality, r.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: region === r.id ? '#a855f7' : 'var(--border-color)',
                    backgroundColor:
                      region === r.id ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-page)',
                    color: region === r.id ? '#c4b5fd' : 'var(--text-muted)',
                  }}
                >
                  {tUI(r.key)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= MAIN CALCULATOR CARD ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Subtotal, Tax %, Discount Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
                  marginBottom: '6px',
                }}
              >
                {tUI('billAmount')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                  }}
                >
                  {currencySym}
                </span>
                <input
                  type="number"
                  value={bill}
                  onChange={(e) => setBill(e.target.value)}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 12px 12px 38px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    outline: 'none',
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
                  marginBottom: '6px',
                }}
              >
                {tUI('taxPercentLabel')}
              </label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                step="0.1"
                min="0"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  outline: 'none',
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
                  marginBottom: '6px',
                }}
              >
                {tUI('discountLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                  }}
                >
                  {currencySym}
                </span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 12px 12px 38px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pre-Tax vs Post-Tax Basis & Tip Input Mode */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('tipBasisLabel')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setTipBasis('preTax')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: tipBasis === 'preTax' ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor:
                      tipBasis === 'preTax' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    color: tipBasis === 'preTax' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {tUI('basisPreTax')}
                </button>
                <button
                  onClick={() => setTipBasis('postTax')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: tipBasis === 'postTax' ? '#3b82f6' : 'var(--border-color)',
                    backgroundColor:
                      tipBasis === 'postTax' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                    color: tipBasis === 'postTax' ? '#60a5fa' : 'var(--text-muted)',
                  }}
                >
                  {tUI('basisPostTax')}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {tUI('tipModeLabel')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setTipMode('percent')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: tipMode === 'percent' ? '#10b981' : 'var(--border-color)',
                    backgroundColor:
                      tipMode === 'percent' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-page)',
                    color: tipMode === 'percent' ? '#34d399' : 'var(--text-muted)',
                  }}
                >
                  {tUI('tipModePercent')}
                </button>
                <button
                  onClick={() => setTipMode('flat')}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: tipMode === 'flat' ? '#10b981' : 'var(--border-color)',
                    backgroundColor:
                      tipMode === 'flat' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-page)',
                    color: tipMode === 'flat' ? '#34d399' : 'var(--text-muted)',
                  }}
                >
                  {tUI('tipModeFlat')}
                </button>
              </div>
            </div>
          </div>

          {/* Tip Input (Percentage OR Flat Amount) */}
          {tipMode === 'percent' ? (
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('tipPercentage')}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {tipPresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setTipPercent(p)}
                    style={{
                      flex: '1 1 56px',
                      backgroundColor:
                        tipPercent === p ? 'rgba(16, 185, 129, 0.22)' : 'var(--bg-page)',
                      color: tipPercent === p ? '#34d399' : 'var(--text-muted)',
                      border: '1px solid',
                      borderColor:
                        tipPercent === p ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
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
                max="200"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                {tUI('flatTipLabel')}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                  }}
                >
                  {currencySym}
                </span>
                <input
                  type="number"
                  value={flatTip}
                  onChange={(e) => setFlatTip(e.target.value)}
                  step="0.5"
                  min="0"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '12px 12px 12px 38px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Split Between + Rounding Mode */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '8px',
                }}
              >
                <Users size={15} style={{ color: '#3b82f6' }} />
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
                    padding: '8px 16px',
                    fontSize: '1.1rem',
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
                    padding: '10px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => setPeople(people + 1)}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
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
                {tUI('roundingLabel')}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(
                  [
                    { id: 'none', key: 'roundNone' },
                    { id: 'totalUp', key: 'roundTotalUp' },
                    { id: 'perPersonUp', key: 'roundPerPersonUp' },
                  ] as const
                ).map((rm) => (
                  <button
                    key={rm.id}
                    onClick={() => setRounding(rm.id)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: rounding === rm.id ? '#3b82f6' : 'var(--border-color)',
                      backgroundColor:
                        rounding === rm.id ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                      color: rounding === rm.id ? '#60a5fa' : 'var(--text-muted)',
                    }}
                  >
                    {tUI(rm.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
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
                  marginBottom: '6px',
                }}
              >
                {tUI('tipAmount')}
              </div>
              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {formatMoney(tipAmount, currency)}
              </div>
              <div
                style={{ color: '#60a5fa', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}
              >
                {tUI('effectiveTipNote', { rate: effectiveTipRate })}
              </div>
            </div>

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
                  marginBottom: '6px',
                }}
              >
                {tUI('totalBill')}
              </div>
              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {formatMoney(totalAmount, currency)}
              </div>
              {taxNum > 0 && (
                <div style={{ color: '#c4b5fd', fontSize: '0.75rem', marginTop: '4px' }}>
                  {tUI('taxAmountRow', { rate: taxNum })} {formatMoney(taxAmount, currency)}
                </div>
              )}
            </div>

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
                  marginBottom: '6px',
                }}
              >
                {tUI('eachPersonPays')}
              </div>
              <div
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                }}
              >
                {formatMoney(perPerson, currency)}
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
                padding: '14px 16px',
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
                  {formatMoney(perPersonBillAndTax, currency)}
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
                  {formatMoney(perPersonTip, currency)}
                </strong>
              </div>
            </div>
          )}

          {/* Copy Receipt Breakdown */}
          <button
            onClick={handleCopy}
            style={{
              width: '100%',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: copied ? '#059669' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? tUI('copied') : tUI('copyBreakdown')}
          </button>
        </div>

        {/* ================= TIP CALCULATOR FORMULA & ETIQUETTE GUIDE ================= */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Calculator size={18} style={{ color: '#3b82f6' }} />
              {tUI('formulaTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {tUI('formulaSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tUI('formulaTipRow')}
              </div>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.875rem',
                  color: '#60a5fa',
                  marginTop: '4px',
                }}
              >
                {formatMoney(tipBase, currency)} × ({effectiveTipRate}% ÷ 100) ={' '}
                {formatMoney(tipAmount, currency)}
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tUI('formulaTotalRow')}
              </div>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.875rem',
                  color: '#c4b5fd',
                  marginTop: '4px',
                }}
              >
                {formatMoney(discountedBill, currency)} + {formatMoney(taxAmount, currency)} +{' '}
                {formatMoney(tipAmount, currency)} = {formatMoney(totalAmount, currency)}
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {tUI('formulaSplitRow')}
              </div>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.875rem',
                  color: '#34d399',
                  marginTop: '4px',
                }}
              >
                {formatMoney(totalAmount, currency)} ÷ {Math.max(1, people)} ={' '}
                {formatMoney(perPerson, currency)}
              </div>
            </div>

            {/* Etiquette Reference Pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '10px',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd' }}>
                  {tUI('guideHairLabel')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {tUI('guideHairVal')}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6ee7b7' }}>
                  {tUI('guideRestLabel')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {tUI('guideRestVal')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTRALIZED SEO & FAQ CONTENT ================= */}
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
  );
}
