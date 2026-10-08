'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type Mode = 'salaryToHourly' | 'hourlyToSalary';

export default function SalaryToHourlyCalculatorPage() {
  const [mode, setMode] = useState<Mode>('salaryToHourly');
  const [annualSalary, setAnnualSalary] = useState('60000');
  const [hourlyRate, setHourlyRate] = useState('28.85');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [weeksPerYear, setWeeksPerYear] = useState('52');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [result, setResult] = useState({
    hourly: 0,
    daily: 0,
    weekly: 0,
    biweekly: 0,
    monthly: 0,
    annual: 0,
  });

  useEffect(() => {
    const hpw = parseFloat(hoursPerWeek) || 40;
    const wpy = parseFloat(weeksPerYear) || 52;
    const totalHours = hpw * wpy;

    if (mode === 'salaryToHourly') {
      const salary = parseFloat(annualSalary) || 0;
      const hourly = totalHours > 0 ? salary / totalHours : 0;
      setResult({
        hourly,
        daily: hourly * (hpw / 5),
        weekly: hourly * hpw,
        biweekly: hourly * hpw * 2,
        monthly: salary / 12,
        annual: salary,
      });
    } else {
      const rate = parseFloat(hourlyRate) || 0;
      const annual = rate * totalHours;
      setResult({
        hourly: rate,
        daily: rate * (hpw / 5),
        weekly: rate * hpw,
        biweekly: rate * hpw * 2,
        monthly: annual / 12,
        annual,
      });
    }
  }, [mode, annualSalary, hourlyRate, hoursPerWeek, weeksPerYear]);

  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    const text = `Annual: ${formatCurrency(result.annual)}
Monthly: ${formatCurrency(result.monthly)}
Biweekly: ${formatCurrency(result.biweekly)}
Weekly: ${formatCurrency(result.weekly)}
Daily: ${formatCurrency(result.daily)}
Hourly: ${formatCurrency(result.hourly)}

Based on ${hoursPerWeek} hrs/week × ${weeksPerYear} weeks/year`;
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
        'name': 'VelnoxLabs Salary to Hourly Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'FinanceApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free salary to hourly calculator — convert annual salary to hourly, daily, weekly, biweekly, and monthly pay. Also convert hourly rate to annual salary.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I convert salary to hourly?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Divide your annual salary by the total hours you work per year. For a standard 40-hour workweek with 52 weeks, that\'s 2,080 hours. Example: $60,000 ÷ 2,080 = $28.85/hour.' }
          },
          {
            '@type': 'Question',
            'name': 'How many work hours are in a year?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'A standard full-time year is 2,080 hours (40 hours/week × 52 weeks). If you get 2 weeks paid vacation, it\'s still 2,080 because vacation is paid. If you work 50 weeks (2 unpaid weeks off), it\'s 2,000 hours.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Salary to Hourly Calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Salary to Hourly Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Salary to Hourly Calculator"
            subtitle="Convert between annual salary and hourly rate — see your pay broken down by hour, day, week, month, and year."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button
                onClick={() => setMode('salaryToHourly')}
                style={{ flex: 1, backgroundColor: mode === 'salaryToHourly' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'salaryToHourly' ? '#60a5fa' : '#94a3b8', border: mode === 'salaryToHourly' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                💼 Salary → Hourly
              </button>
              <button
                onClick={() => setMode('hourlyToSalary')}
                style={{ flex: 1, backgroundColor: mode === 'hourlyToSalary' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)', color: mode === 'hourlyToSalary' ? '#60a5fa' : '#94a3b8', border: mode === 'hourlyToSalary' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                ⏰ Hourly → Salary
              </button>
            </div>

            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {mode === 'salaryToHourly' ? (
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Annual Salary ($):</label>
                  <input type="number" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} placeholder="60000" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              ) : (
                <div>
                  <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Hourly Rate ($):</label>
                  <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="28.85" step="0.01" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
                </div>
              )}
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Hours per Week:</label>
                <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} placeholder="40" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Weeks per Year:</label>
                <input type="number" value={weeksPerYear} onChange={(e) => setWeeksPerYear(e.target.value)} placeholder="52" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Main Result */}
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {mode === 'salaryToHourly' ? 'Your Hourly Rate' : 'Your Annual Salary'}
              </div>
              <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
                {mode === 'salaryToHourly' ? formatCurrency(result.hourly) : formatCurrency(result.annual)}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>
                Based on {hoursPerWeek} hrs/week × {weeksPerYear} weeks ({parseFloat(hoursPerWeek) * parseFloat(weeksPerYear)} hrs/year)
              </div>
            </div>

            {/* Full Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Hourly</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.hourly)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Daily</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.daily)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Weekly</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.weekly)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Biweekly</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.biweekly)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#fcd34d', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Monthly</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.monthly)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Annual</div>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(result.annual)}</div>
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Full Breakdown'}
            </button>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Salary to Hourly Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Salary to Hourly Calculator is a free online tool that converts your annual salary into hourly, daily, weekly, biweekly, and monthly pay. It's essential when comparing job offers — a $60,000 salaried job and a $30/hour contract role aren't always equal once you account for unpaid time off, benefits, and working hours. This calculator also works in reverse: enter your hourly rate to see what it equals as an annual salary.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Choose a mode: <strong>Salary → Hourly</strong> or <strong>Hourly → Salary</strong>.</li>
              <li>Enter your salary or hourly rate.</li>
              <li>Adjust <strong>hours per week</strong> (default 40) and <strong>weeks per year</strong> (default 52) if needed.</li>
              <li>See your pay broken down by hour, day, week, biweek, month, and year.</li>
              <li>Click <strong>Copy Full Breakdown</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I convert salary to hourly?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Divide your annual salary by the total hours you work per year. For a standard 40-hour workweek, that's 2,080 hours (40 × 52). Example: $60,000 ÷ 2,080 = $28.85/hour.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How many work hours are in a year?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>A standard full-time year is <strong>2,080 hours</strong> (40 hrs/week × 52 weeks). If you take 2 weeks unpaid vacation, it's 2,000 hours. Many contractors use 2,000 or 2,080 hours as a baseline.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is a salaried job better than hourly?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>It depends. Salaried jobs usually offer benefits, paid vacation, and stability. Hourly jobs pay for every hour worked (including overtime) but may lack benefits. Use this calculator to compare equivalent hourly rates when evaluating job offers.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Salary to Hourly Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Salary to Hourly Calculator is 100% free with no sign-up required. All calculations happen in your browser — your financial data is never sent to any server.</p>
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