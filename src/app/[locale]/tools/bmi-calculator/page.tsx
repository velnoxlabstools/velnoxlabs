'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import { Sparkles, Copy, Check, Activity, Scale, Flame, Target, User } from 'lucide-react';

type UnitMode = 'kgFeet' | 'metric' | 'imperial';
type Gender = 'male' | 'female';
type BmiStandard = 'who' | 'asian';

function getBMICategory(bmi: number, standard: BmiStandard) {
  const normalMax = standard === 'asian' ? 23 : 25;
  const overMax = standard === 'asian' ? 25 : 30;

  if (bmi < 18.5) {
    return {
      key: 'underweight' as const,
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.4)',
    };
  }
  if (bmi < normalMax) {
    return {
      key: 'normalWeight' as const,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
    };
  }
  if (bmi < overMax) {
    return {
      key: 'overweight' as const,
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.15)',
      border: 'rgba(251, 191, 36, 0.4)',
    };
  }
  return {
    key: 'obese' as const,
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.4)',
  };
}

export default function BmiCalculatorPage() {
  const t = useTranslations('ToolUI.bmiCalculator');

  const [unit, setUnit] = useState<UnitMode>('kgFeet');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('25');
  const [standard, setStandard] = useState<BmiStandard>('who');

  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [weightLbs, setWeightLbs] = useState('154');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => {
    let weightInKg = 0;
    let heightInM = 0;

    if (unit === 'metric') {
      weightInKg = parseFloat(weightKg) || 0;
      heightInM = (parseFloat(heightCm) || 0) / 100;
    } else if (unit === 'kgFeet') {
      weightInKg = parseFloat(weightKg) || 0;
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightInM = totalInches * 0.0254;
    } else {
      weightInKg = (parseFloat(weightLbs) || 0) * 0.453592;
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightInM = totalInches * 0.0254;
    }

    if (weightInKg <= 0 || heightInM <= 0) {
      return null;
    }

    const bmiVal = weightInKg / (heightInM * heightInM);
    const heightInCm = heightInM * 100;
    const heightInInches = heightInM / 0.0254;
    const parsedAge = Math.max(2, Math.min(120, parseInt(age, 10) || 25));

    const normalUpper = standard === 'asian' ? 22.9 : 24.9;
    const healthyMinKg = 18.5 * heightInM * heightInM;
    const healthyMaxKg = normalUpper * heightInM * heightInM;

    // Deurenberg Body Fat % estimate
    const sexFactor = gender === 'male' ? 1 : 0;
    const bodyFatPct = Math.max(
      3,
      Math.min(60, 1.2 * bmiVal + 0.23 * parsedAge - 10.8 * sexFactor - 5.4)
    );

    // Devine Ideal Body Weight (kg)
    const baseIdeal = gender === 'male' ? 50 : 45.5;
    const idealKg = Math.max(35, baseIdeal + 2.3 * (heightInInches - 60));

    // Mifflin-St Jeor BMR (kcal/day)
    const bmr = Math.max(
      800,
      Math.round(
        10 * weightInKg + 6.25 * heightInCm - 5 * parsedAge + (gender === 'male' ? 5 : -161)
      )
    );

    // Weight delta to reach healthy range
    let deltaKg = 0;
    let deltaType: 'lose' | 'gain' | 'optimal' = 'optimal';
    if (weightInKg > healthyMaxKg) {
      deltaKg = weightInKg - healthyMaxKg;
      deltaType = 'lose';
    } else if (weightInKg < healthyMinKg) {
      deltaKg = healthyMinKg - weightInKg;
      deltaType = 'gain';
    }

    return {
      bmi: bmiVal,
      weightInKg,
      heightInCm,
      parsedAge,
      healthyMinKg,
      healthyMaxKg,
      bodyFatPct,
      idealKg,
      bmr,
      deltaKg,
      deltaType,
    };
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn, age, gender, standard]);

  const category = metrics ? getBMICategory(metrics.bmi, standard) : null;

  const isImperialDisplay = unit === 'imperial';
  const formatWeight = (kg: number) =>
    isImperialDisplay ? `${(kg / 0.453592).toFixed(1)} lbs` : `${kg.toFixed(1)} kg`;

  // Visualizer pointer position (clamped 12 to 40)
  const pointerPercent = useMemo(() => {
    if (!metrics) return 0;
    const minBmi = 12;
    const maxBmi = 40;
    const clamped = Math.max(minBmi, Math.min(maxBmi, metrics.bmi));
    return ((clamped - minBmi) / (maxBmi - minBmi)) * 100;
  }, [metrics]);

  // SVG Silhouette torso width multiplier based on BMI
  const torsoScale = useMemo(() => {
    if (!metrics) return 1;
    const clamped = Math.max(15, Math.min(38, metrics.bmi));
    return 0.78 + ((clamped - 15) / (38 - 15)) * 0.62;
  }, [metrics]);

  const handleCopy = () => {
    if (!metrics || !category) return;
    const categoryName = t(category.key);
    const text = `${t('bmiLabel')}: ${metrics.bmi.toFixed(1)} (${categoryName})
${t('genderLabel')}: ${gender === 'male' ? t('male') : t('female')} | ${t('ageLabel')}: ${metrics.parsedAge}
${t('healthyRangeLabel')}: ${formatWeight(metrics.healthyMinKg)} - ${formatWeight(metrics.healthyMaxKg)}
${t('bodyFatLabel')}: ${metrics.bodyFatPct.toFixed(1)}%
${t('idealWeightLabel')}: ${formatWeight(metrics.idealKg)}
${t('bmrLabel')}: ${metrics.bmr} kcal/day`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlobalContainer maxWidth="2xl">
      <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} toolSlug="bmi-calculator" />

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            marginTop: 'var(--space-6)',
          }}
        >
          {/* Unit Mode Toggle (kg + ft/in, Metric kg/cm, Imperial lbs/ft) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {(
              [
                { id: 'kgFeet', label: t('kgAndFeet') },
                { id: 'metric', label: t('metric') },
                { id: 'imperial', label: t('usImperial') },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setUnit(opt.id)}
                style={{
                  backgroundColor: unit === opt.id ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                  color: unit === opt.id ? '#60a5fa' : 'var(--text-muted)',
                  border:
                    unit === opt.id
                      ? '1px solid rgba(59, 130, 246, 0.5)'
                      : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Gender, Age & Standard Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '18px',
              paddingBottom: '18px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {t('genderLabel')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border:
                        gender === g
                          ? '1px solid rgba(139, 92, 246, 0.6)'
                          : '1px solid var(--border-color)',
                      backgroundColor: gender === g ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-page)',
                      color: gender === g ? '#a78bfa' : 'var(--text-muted)',
                    }}
                  >
                    <User size={14} />
                    {g === 'male' ? t('male') : t('female')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {t('ageLabel')}
              </label>
              <input
                type="number"
                min={2}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
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
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {t('standardLabel')}
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as BmiStandard)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="who">{t('standardWho')}</option>
                <option value="asian">{t('standardAsian')}</option>
              </select>
            </div>
          </div>

          {/* Weight & Height Inputs */}
          {unit === 'metric' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
                  {t('weightKg')}
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder={t('placeholderWeightKg')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
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
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {t('heightCm')}
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder={t('placeholderHeightCm')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
                  {unit === 'kgFeet' ? t('weightKg') : t('weightLbs')}
                </label>
                <input
                  type="number"
                  value={unit === 'kgFeet' ? weightKg : weightLbs}
                  onChange={(e) =>
                    unit === 'kgFeet' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)
                  }
                  placeholder={
                    unit === 'kgFeet' ? t('placeholderWeightKg') : t('placeholderWeightLbs')
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
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
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {t('heightFeet')}
                </label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder={t('placeholderHeightFeet')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
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
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  {t('heightInches')}
                </label>
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder={t('placeholderHeightInches')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '14px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>
          )}

          {/* Result & AI BMI Visualizer */}
          {metrics && category && (
            <>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                style={{ marginBottom: '20px' }}
              >
                {/* Score Card */}
                <div
                  className="md:col-span-2"
                  style={{
                    backgroundColor: category.bg,
                    border: `1px solid ${category.border}`,
                    borderRadius: '12px',
                    padding: '28px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px',
                    }}
                  >
                    {t('yourBmi')}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      marginBottom: '10px',
                      lineHeight: 1,
                    }}
                  >
                    {metrics.bmi.toFixed(1)}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'var(--bg-page)',
                      borderRadius: '20px',
                      padding: '8px 20px',
                      color: category.color,
                      fontSize: '0.98rem',
                      fontWeight: 700,
                    }}
                  >
                    {t(category.key)}
                  </div>
                </div>

                {/* AI Body Silhouette Visualizer */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#a78bfa',
                      marginBottom: '8px',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{t('visualizerTitle')}</span>
                  </div>
                  <svg
                    width="96"
                    height="120"
                    viewBox="0 0 96 120"
                    aria-label={t('visualizerTitle')}
                  >
                    {/* Head */}
                    <circle cx="48" cy="18" r="10" fill={category.color} opacity="0.9" />
                    {/* Torso & Shoulders scaled dynamically by BMI */}
                    <rect
                      x={48 - 14 * torsoScale}
                      y="32"
                      width={28 * torsoScale}
                      height="42"
                      rx={10 * torsoScale}
                      fill={category.color}
                      opacity="0.82"
                    />
                    {/* Left & Right Arms */}
                    <rect
                      x={48 - 14 * torsoScale - 8}
                      y="34"
                      width="6"
                      height="34"
                      rx="3"
                      fill={category.color}
                      opacity="0.65"
                    />
                    <rect
                      x={48 + 14 * torsoScale + 2}
                      y="34"
                      width="6"
                      height="34"
                      rx="3"
                      fill={category.color}
                      opacity="0.65"
                    />
                    {/* Legs */}
                    <rect
                      x={48 - 10 * torsoScale}
                      y="76"
                      width={8 * Math.min(1.15, torsoScale)}
                      height="36"
                      rx="4"
                      fill={category.color}
                      opacity="0.75"
                    />
                    <rect
                      x={48 + 2 * torsoScale}
                      y="76"
                      width={8 * Math.min(1.15, torsoScale)}
                      height="36"
                      rx="4"
                      fill={category.color}
                      opacity="0.75"
                    />
                  </svg>
                  <div
                    style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}
                  >
                    {gender === 'male' ? t('male') : t('female')} · {metrics.parsedAge} yrs
                  </div>
                </div>
              </div>

              {/* Interactive BMI Scale with Live Pointer */}
              <div style={{ marginBottom: '22px' }}>
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '12px',
                  }}
                >
                  {t('bmiScale')}
                </div>
                <div style={{ position: 'relative', paddingTop: '10px' }}>
                  {/* Live Pointer Pin */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `calc(${pointerPercent}% - 8px)`,
                      top: 0,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: `3px solid ${category.color}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                      transition: 'left 0.25s ease',
                      zIndex: 2,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      height: '12px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ flex: 6.5, backgroundColor: '#60a5fa' }} />
                    <div
                      style={{ flex: standard === 'asian' ? 4.5 : 6.5, backgroundColor: '#34d399' }}
                    />
                    <div
                      style={{ flex: standard === 'asian' ? 2 : 5, backgroundColor: '#fbbf24' }}
                    />
                    <div
                      style={{ flex: standard === 'asian' ? 15 : 10, backgroundColor: '#f87171' }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  <span>{t('under18')}</span>
                  <span>{standard === 'asian' ? '18.5–22.9' : t('rangeNormal')}</span>
                  <span>{standard === 'asian' ? '23.0–24.9' : t('rangeOver')}</span>
                  <span>{standard === 'asian' ? '25.0+' : t('rangeObese')}</span>
                </div>
              </div>

              {/* AI Health Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    <Target size={14} style={{ color: '#34d399' }} />
                    {t('healthyWeightRange')}
                  </div>
                  <div
                    style={{
                      color: '#34d399',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatWeight(metrics.healthyMinKg)} – {formatWeight(metrics.healthyMaxKg)}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    <Activity size={14} style={{ color: '#60a5fa' }} />
                    {t('bodyFatLabel')}
                  </div>
                  <div
                    style={{
                      color: '#60a5fa',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    ~{metrics.bodyFatPct.toFixed(1)}%
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    <Scale size={14} style={{ color: '#a78bfa' }} />
                    {t('idealWeightLabel')}
                  </div>
                  <div
                    style={{
                      color: '#a78bfa',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatWeight(metrics.idealKg)}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                  >
                    <Flame size={14} style={{ color: '#fbbf24' }} />
                    {t('bmrLabel')}
                  </div>
                  <div
                    style={{
                      color: '#fbbf24',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {metrics.bmr} kcal/day
                  </div>
                </div>
              </div>

              {/* AI Insight Banner */}
              <div
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.28)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.55,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    color: '#a78bfa',
                    marginBottom: '4px',
                  }}
                >
                  <Sparkles size={15} />
                  <span>{t('aiInsightTitle')}</span>
                </div>
                <p style={{ margin: 0 }}>
                  {metrics.deltaType === 'optimal'
                    ? t('aiInsightOptimal')
                    : metrics.deltaType === 'lose'
                      ? t('aiInsightLose', { delta: formatWeight(metrics.deltaKg) })
                      : t('aiInsightGain', { delta: formatWeight(metrics.deltaKg) })}
                  {metrics.parsedAge < 20
                    ? ` ${t('ageNoteTeen')}`
                    : metrics.parsedAge >= 65
                      ? ` ${t('ageNoteSenior')}`
                      : ''}
                </p>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
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
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('copied') : t('copyResult')}
              </button>
            </>
          )}
        </div>

        <ToolSeoContent
          toolSlug="bmi-calculator"
          toolName={t('title')}
          description={t('subtitle')}
          customAbout={t('aboutText')}
          customFeatures={[t('feature1'), t('feature2'), t('feature3'), t('feature4')]}
          customSteps={[
            { title: t('step1Title'), body: t('step1Body') },
            { title: t('step2Title'), body: t('step2Body') },
            { title: t('step3Title'), body: t('step3Body') },
          ]}
          customFaqs={[
            { q: t('faq1Q'), a: t('faq1A') },
            { q: t('faq2Q'), a: t('faq2A') },
            { q: t('faq3Q'), a: t('faq3A') },
            { q: t('faq4Q'), a: t('faq4A') },
          ]}
        />
      </div>
    </GlobalContainer>
  );
}
