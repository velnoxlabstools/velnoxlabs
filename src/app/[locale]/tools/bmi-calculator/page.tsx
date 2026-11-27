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
  Activity,
  Scale,
  Flame,
  Target,
  User,
  HeartPulse,
} from 'lucide-react';

type UnitMode = 'kgFeet' | 'metric' | 'imperial';
type Gender = 'male' | 'female';
type BmiStandard = 'who' | 'asian';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

function getBMICategory(bmi: number, standard: BmiStandard) {
  const normalMax = standard === 'asian' ? 22.9 : 24.9;
  const overMax = standard === 'asian' ? 24.9 : 29.9;

  if (bmi < 18.5) {
    return {
      key: 'underweight' as const,
      color: '#60a5fa',
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.4)',
    };
  }
  if (bmi <= normalMax) {
    return {
      key: 'normalWeight' as const,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
    };
  }
  if (bmi <= overMax) {
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
  const [activity, setActivity] = useState<ActivityLevel>('sedentary');

  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [weightLbs, setWeightLbs] = useState('154');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [copied, setCopied] = useState(false);

  // Synchronize when switching units
  const handleUnitChange = (newUnit: UnitMode) => {
    if (newUnit === unit) return;

    if (newUnit === 'metric') {
      if (unit === 'kgFeet') {
        const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
        setHeightCm(Math.round(totalInches * 2.54).toString());
      } else {
        // from imperial
        const kg = Math.round((parseFloat(weightLbs) || 0) * 0.453592);
        const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
        setWeightKg(kg.toString());
        setHeightCm(Math.round(totalInches * 2.54).toString());
      }
    } else if (newUnit === 'kgFeet') {
      if (unit === 'metric') {
        const totalInches = (parseFloat(heightCm) || 0) / 2.54;
        setHeightFt(Math.floor(totalInches / 12).toString());
        setHeightIn(Math.round(totalInches % 12).toString());
      } else {
        // from imperial
        const kg = Math.round((parseFloat(weightLbs) || 0) * 0.453592);
        setWeightKg(kg.toString());
      }
    } else {
      // to imperial
      const lbs = Math.round((parseFloat(weightKg) || 0) / 0.453592);
      setWeightLbs(lbs.toString());
      if (unit === 'metric') {
        const totalInches = (parseFloat(heightCm) || 0) / 2.54;
        setHeightFt(Math.floor(totalInches / 12).toString());
        setHeightIn(Math.round(totalInches % 12).toString());
      }
    }
    setUnit(newUnit);
  };

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

    // Deurenberg Body Fat % formula
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

    // Activity multiplier for TDEE
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const tdee = Math.round(bmr * activityMultipliers[activity]);

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
      tdee,
      deltaKg,
      deltaType,
    };
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn, age, gender, standard, activity]);

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

  // SVG Silhouette torso scaling based on BMI and gender
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
${t('bmrLabel')}: ${metrics.bmr} kcal/day
${t('tdeeLabel')}: ${metrics.tdee} kcal/day`;
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
            marginBottom: '24px',
          }}
        >
          {/* Unit Mode Toggle: kg & Feet (India #1), Metric (kg/cm), Imperial (lbs/ft) */}
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
                onClick={() => handleUnitChange(opt.id)}
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

          {/* Gender, Age & Standard Configuration Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginBottom: '20px',
              paddingBottom: '18px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Gender Toggle */}
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

            {/* Age Input & Slider */}
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
                  htmlFor="age-input"
                  style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {t('ageLabel')}
                </label>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#a78bfa',
                    fontFamily: 'monospace',
                  }}
                >
                  {age} yrs
                </span>
              </div>
              <input
                id="age-input"
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
                  padding: '8px 12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  outline: 'none',
                  fontFamily: 'monospace',
                  marginBottom: '4px',
                }}
              />
              <input
                type="range"
                min={2}
                max={90}
                value={parseInt(age, 10) || 25}
                onChange={(e) => setAge(e.target.value)}
                style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }}
              />
            </div>

            {/* WHO vs Asian Standards */}
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

          {/* Weight & Height Inputs with Synchronized Interactive Sliders */}
          <div style={{ marginBottom: '24px' }}>
            {unit === 'metric' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '18px',
                }}
              >
                {/* Weight in kg */}
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
                      htmlFor="weight-kg-input"
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {t('weightKg')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {weightKg} kg
                    </span>
                  </div>
                  <input
                    id="weight-kg-input"
                    type="number"
                    min="20"
                    max="250"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={30}
                    max={180}
                    step={0.5}
                    value={parseFloat(weightKg) || 70}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                </div>

                {/* Height in cm */}
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
                      htmlFor="height-cm-input"
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {t('heightCm')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: 'monospace',
                      }}
                    >
                      {heightCm} cm
                    </span>
                  </div>
                  <input
                    id="height-cm-input"
                    type="number"
                    min="90"
                    max="240"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={120}
                    max={220}
                    step={1}
                    value={parseFloat(heightCm) || 170}
                    onChange={(e) => setHeightCm(e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Weight input & slider */}
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
                      htmlFor="weight-dual-input"
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {unit === 'kgFeet' ? t('weightKg') : t('weightLbs')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                      }}
                    >
                      {unit === 'kgFeet' ? `${weightKg} kg` : `${weightLbs} lbs`}
                    </span>
                  </div>
                  <input
                    id="weight-dual-input"
                    type="number"
                    value={unit === 'kgFeet' ? weightKg : weightLbs}
                    onChange={(e) =>
                      unit === 'kgFeet' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)
                    }
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={unit === 'kgFeet' ? 30 : 65}
                    max={unit === 'kgFeet' ? 180 : 400}
                    step={1}
                    value={
                      unit === 'kgFeet' ? parseFloat(weightKg) || 70 : parseFloat(weightLbs) || 154
                    }
                    onChange={(e) =>
                      unit === 'kgFeet' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)
                    }
                    style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                  />
                </div>

                {/* Feet slider & input */}
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
                      htmlFor="height-ft-input"
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {t('heightFeet')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: 'monospace',
                      }}
                    >
                      {heightFt} ft
                    </span>
                  </div>
                  <input
                    id="height-ft-input"
                    type="number"
                    min="3"
                    max="7"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={4}
                    max={7}
                    step={1}
                    value={parseInt(heightFt, 10) || 5}
                    onChange={(e) => setHeightFt(e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>

                {/* Inches slider & input */}
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
                      htmlFor="height-in-input"
                      style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {t('heightInches')}
                    </label>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: 'monospace',
                      }}
                    >
                      {heightIn} in
                    </span>
                  </div>
                  <input
                    id="height-in-input"
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: 'monospace',
                      marginBottom: '6px',
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={11}
                    step={1}
                    value={parseInt(heightIn, 10) || 0}
                    onChange={(e) => setHeightIn(e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results & AI Body Silhouette Visualizer */}
          {metrics && category && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                {/* Score Card */}
                <div
                  style={{
                    backgroundColor: category.bg,
                    border: `1px solid ${category.border}`,
                    borderRadius: '14px',
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
                      fontSize: '3.6rem',
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
                      padding: '8px 22px',
                      color: category.color,
                      fontSize: '1rem',
                      fontWeight: 700,
                      border: `1px solid ${category.border}`,
                    }}
                  >
                    {t(category.key)}
                  </div>
                </div>

                {/* AI Body Silhouette Visualizer (Scales Torso, Arms & Hips) */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
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
                      gap: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#a78bfa',
                      marginBottom: '8px',
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{t('visualizerTitle')}</span>
                  </div>
                  <svg
                    width="100"
                    height="124"
                    viewBox="0 0 100 124"
                    aria-label={t('visualizerTitle')}
                  >
                    {/* Head */}
                    <circle cx="50" cy="18" r="10" fill={category.color} opacity="0.9" />

                    {/* Torso & Shoulders (Contoured for Male vs Female) */}
                    <rect
                      x={50 - 15 * torsoScale}
                      y="32"
                      width={30 * torsoScale}
                      height="44"
                      rx={gender === 'female' ? 14 * torsoScale : 8 * torsoScale}
                      fill={category.color}
                      opacity="0.84"
                    />

                    {/* Left & Right Arms */}
                    <rect
                      x={50 - 15 * torsoScale - 8}
                      y="34"
                      width="6"
                      height="36"
                      rx="3"
                      fill={category.color}
                      opacity="0.65"
                    />
                    <rect
                      x={50 + 15 * torsoScale + 2}
                      y="34"
                      width="6"
                      height="36"
                      rx="3"
                      fill={category.color}
                      opacity="0.65"
                    />

                    {/* Left & Right Legs */}
                    <rect
                      x={50 - 11 * torsoScale}
                      y="78"
                      width={9 * Math.min(1.2, torsoScale)}
                      height="38"
                      rx="4"
                      fill={category.color}
                      opacity="0.75"
                    />
                    <rect
                      x={50 + 2 * torsoScale}
                      y="78"
                      width={9 * Math.min(1.2, torsoScale)}
                      height="38"
                      rx="4"
                      fill={category.color}
                      opacity="0.75"
                    />
                  </svg>
                  <div
                    style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}
                  >
                    {gender === 'male' ? t('male') : t('female')} · {metrics.parsedAge} yrs
                  </div>
                </div>
              </div>

              {/* Interactive BMI Scale with Live Pointer Pin */}
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
                      style={{
                        flex: standard === 'asian' ? 4.5 : 6.5,
                        backgroundColor: '#34d399',
                      }}
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

              {/* Health Metrics & Calorie Dashboard Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                {/* Healthy Weight Range */}
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

                {/* Body Fat % */}
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

                {/* Devine Ideal Weight */}
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

                {/* BMR Calories */}
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

              {/* Daily Energy & TDEE Activity Level Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartPulse size={16} color="#ec4899" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('activityLevelLabel')}:
                  </span>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-main)',
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  >
                    <option value="sedentary">{t('activitySedentary')}</option>
                    <option value="light">{t('activityLight')}</option>
                    <option value="moderate">{t('activityModerate')}</option>
                    <option value="active">{t('activityActive')}</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ec4899' }}>
                  {t('tdeeMaintenance')}:{' '}
                  <span style={{ fontFamily: 'monospace' }}>{metrics.tdee} kcal/day</span>
                </div>
              </div>

              {/* AI Health Insight Banner */}
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

              {/* Action Button: Copy Summary */}
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
                <span>{copied ? t('copied') : t('copyResult')}</span>
              </button>
            </>
          )}
        </div>

        {/* COMPARISON TABLE: VelnoxLabs vs Basic Chart vs Clinic DEXA Scan */}
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
            {t('compareTitle')}
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
                  {t('compareColFeature')}
                </th>
                <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>
                  VelnoxLabs AI Visualizer
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Basic Static BMI Chart
                </th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Clinical DEXA Scan
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('compareRow1Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {t('compareRow1Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow1Chart')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow1Dexa')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('compareRow2Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {t('compareRow2Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow2Chart')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow2Dexa')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('compareRow3Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {t('compareRow3Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow3Chart')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow3Dexa')}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('compareRow4Feature')}
                </td>
                <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                  {t('compareRow4Velnox')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow4Chart')}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {t('compareRow4Dexa')}
                </td>
              </tr>
            </tbody>
          </table>
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
