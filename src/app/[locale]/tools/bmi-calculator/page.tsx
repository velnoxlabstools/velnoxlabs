'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type Unit = 'metric' | 'imperial';

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' };
  if (bmi < 25) return { label: 'Normal Weight', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' };
  if (bmi < 30) return { label: 'Overweight', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.4)' };
  return { label: 'Obese', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)' };
}

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<Unit>('imperial');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [weightLbs, setWeightLbs] = useState('154');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [bmi, setBmi] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    let weightInKg = 0;
    let heightInM = 0;

    if (unit === 'metric') {
      weightInKg = parseFloat(weightKg) || 0;
      heightInM = (parseFloat(heightCm) || 0) / 100;
    } else {
      weightInKg = (parseFloat(weightLbs) || 0) * 0.453592;
      const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
      heightInM = totalInches * 0.0254;
    }

    if (weightInKg > 0 && heightInM > 0) {
      setBmi(weightInKg / (heightInM * heightInM));
    } else {
      setBmi(null);
    }
  }, [unit, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  const category = bmi ? getBMICategory(bmi) : null;

  // Healthy weight range for current height
  let healthyMin = 0, healthyMax = 0;
  if (unit === 'metric') {
    const h = (parseFloat(heightCm) || 0) / 100;
    healthyMin = 18.5 * h * h;
    healthyMax = 24.9 * h * h;
  } else {
    const totalInches = (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0);
    const h = totalInches * 0.0254;
    healthyMin = (18.5 * h * h) / 0.453592;
    healthyMax = (24.9 * h * h) / 0.453592;
  }

  const handleCopy = () => {
    if (!bmi) return;
    const text = `BMI: ${bmi.toFixed(1)}
Category: ${category?.label}
Healthy weight range: ${unit === 'metric' ? `${healthyMin.toFixed(1)} - ${healthyMax.toFixed(1)} kg` : `${healthyMin.toFixed(1)} - ${healthyMax.toFixed(1)} lbs`}`;
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
        'name': 'VelnoxLabs BMI Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'HealthApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online BMI calculator — calculate your Body Mass Index in metric (kg/cm) or imperial (lbs/ft) units. See your BMI category and healthy weight range instantly.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a healthy BMI?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'For most adults, a healthy BMI range is 18.5 to 24.9. Below 18.5 is underweight, 25-29.9 is overweight, and 30+ is considered obese.' }
          },
          {
            '@type': 'Question',
            'name': 'How is BMI calculated?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'BMI = weight (kg) ÷ height (m)². In imperial units, BMI = 703 × weight (lbs) ÷ height (in)².' }
          },
          {
            '@type': 'Question',
            'name': 'Is BMI accurate for everyone?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'BMI is a general screening tool. It may not be accurate for athletes with high muscle mass, pregnant women, elderly adults, or children. Consult a doctor for personalized health advice.' }
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
            title="BMI Calculator"
            subtitle="Calculate your Body Mass Index (BMI) in metric or imperial units and see your healthy weight range."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Unit Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => setUnit('imperial')}
                style={{ flex: 1, backgroundColor: unit === 'imperial' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: unit === 'imperial' ? '#60a5fa' : '#94a3b8', border: unit === 'imperial' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🇺🇸 Imperial (lbs, ft)
              </button>
              <button
                onClick={() => setUnit('metric')}
                style={{ flex: 1, backgroundColor: unit === 'metric' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: unit === 'metric' ? '#60a5fa' : '#94a3b8', border: unit === 'metric' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🌍 Metric (kg, cm)
              </button>
            </div>

            {/* Inputs */}
            {unit === 'imperial' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weight (lbs):</label>
                  <input type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="e.g. 154" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Height (feet):</label>
                  <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="e.g. 5" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Height (inches):</label>
                  <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="e.g. 9" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weight (kg):</label>
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 70" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Height (cm):</label>
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="e.g. 175" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              </div>
            )}

            {/* Result */}
            {bmi && category && (
              <>
                <div style={{ backgroundColor: category.bg, border: `1px solid ${category.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your BMI</div>
                  <div style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1 }}>{bmi.toFixed(1)}</div>
                  <div style={{ display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '8px 20px', color: category.color, fontSize: '1rem', fontWeight: 700 }}>
                    {category.label}
                  </div>
                </div>

                {/* BMI Scale Visual */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>BMI Scale:</div>
                  <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ flex: 18.5, backgroundColor: '#60a5fa' }} />
                    <div style={{ flex: 6.4, backgroundColor: '#34d399' }} />
                    <div style={{ flex: 5, backgroundColor: '#fbbf24' }} />
                    <div style={{ flex: 10, backgroundColor: '#f87171' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    <span>Under 18.5</span>
                    <span>18.5-24.9</span>
                    <span>25-29.9</span>
                    <span>30+</span>
                  </div>
                </div>

                {/* Healthy Weight Range */}
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>💚 Healthy Weight Range for Your Height</div>
                  <div style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>
                    {unit === 'metric' ? `${healthyMin.toFixed(1)} – ${healthyMax.toFixed(1)} kg` : `${healthyMin.toFixed(1)} – ${healthyMax.toFixed(1)} lbs`}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Result'}
                </button>
              </>
            )}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a BMI Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A BMI Calculator (Body Mass Index Calculator) is a free online tool that measures body fat based on your height and weight. BMI is the most widely used screening tool by doctors, nutritionists, and health organizations to determine if an adult is underweight, at a healthy weight, overweight, or obese. This calculator supports both imperial (pounds and feet/inches) and metric (kilograms and centimeters) units, so you can use it regardless of where you live.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Select <strong>Imperial</strong> (USA) or <strong>Metric</strong> units.</li>
              <li>Enter your weight and height.</li>
              <li>Your BMI and category (underweight, normal, overweight, obese) appear instantly.</li>
              <li>See the healthy weight range for your height.</li>
              <li>Click <strong>Copy Result</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is a healthy BMI?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>For most adults, a healthy BMI range is <strong style={{ color: '#34d399' }}>18.5 to 24.9</strong>. Below 18.5 is underweight, 25–29.9 is overweight, and 30+ is considered obese.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How is BMI calculated?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>BMI = weight (kg) ÷ height (m)². In imperial units, BMI = 703 × weight (lbs) ÷ height (in)².</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is BMI accurate for athletes and muscular people?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>No. BMI doesn't distinguish between muscle and fat, so athletes with high muscle mass may have a high BMI but still be healthy. BMI is a general screening tool — not a diagnostic test.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this BMI Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs BMI Calculator is 100% free with no sign-up required. All calculations happen in your browser — your data is never sent to any server.</p>
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