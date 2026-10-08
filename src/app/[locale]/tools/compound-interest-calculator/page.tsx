'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

const FREQUENCIES = [
  { value: 1, label: 'Annually (1×/year)' },
  { value: 2, label: 'Semi-annually (2×/year)' },
  { value: 4, label: 'Quarterly (4×/year)' },
  { value: 12, label: 'Monthly (12×/year)' },
  { value: 365, label: 'Daily (365×/year)' },
];

export default function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState('0');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [results, setResults] = useState({
    finalAmount: 0,
    totalInterest: 0,
    totalContributions: 0,
    schedule: [] as { year: number; balance: number; interest: number; contributed: number }[],
  });

  useEffect(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;
    const n = frequency;
    const monthly = parseFloat(monthlyContribution) || 0;

    // Compound interest with monthly contributions
    const monthlyRate = r / 12;
    const totalMonths = t * 12;
    let balance = P;
    let totalContributed = P;
    const schedule: { year: number; balance: number; interest: number; contributed: number }[] = [];

    for (let month = 1; month <= totalMonths; month++) {
      // Apply compound interest (approximation: divide annual rate over periods)
      balance = balance * Math.pow(1 + r / n, n / 12);
      balance += monthly;
      totalContributed += monthly;

      if (month % 12 === 0) {
        const yearNum = month / 12;
        schedule.push({
          year: yearNum,
          balance: balance,
          interest: balance - totalContributed,
          contributed: totalContributed,
        });
      }
    }

    setResults({
      finalAmount: balance,
      totalInterest: balance - totalContributed,
      totalContributions: totalContributed,
      schedule,
    });
  }, [principal, rate, years, frequency, monthlyContribution]);

  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    const text = `Principal: ${formatCurrency(parseFloat(principal) || 0)}
Rate: ${rate}% for ${years} years
Compound: ${FREQUENCIES.find(f => f.value === frequency)?.label}
Monthly Contribution: ${formatCurrency(parseFloat(monthlyContribution) || 0)}

Final Balance: ${formatCurrency(results.finalAmount)}
Total Interest Earned: ${formatCurrency(results.totalInterest)}
Total Contributed: ${formatCurrency(results.totalContributions)}`;
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
        'name': 'VelnoxLabs Compound Interest Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'FinanceApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free compound interest calculator — see how your investment grows over time with monthly contributions, daily/monthly/annual compounding, and detailed year-by-year breakdown.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is compound interest?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Compound interest is interest earned on both your original principal and on interest you have already earned. This creates exponential growth over time — Albert Einstein reportedly called it "the eighth wonder of the world."' }
          },
          {
            '@type': 'Question',
            'name': 'What is the compound interest formula?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'The formula is A = P(1 + r/n)^(nt), where A is final amount, P is principal, r is annual rate, n is compounding frequency per year, and t is time in years.' }
          },
          {
            '@type': 'Question',
            'name': 'Does compound frequency matter?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. The more frequently interest is compounded (daily > monthly > annually), the more interest you earn over time. Daily compounding yields the highest returns.' }
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
            title="Compound Interest Calculator"
            subtitle="See how your investment grows with the power of compounding — including monthly contributions and detailed yearly breakdown."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Initial Principal ($):</label>
                <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="10000" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Annual Interest Rate (%):</label>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7" step="0.1" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Years:</label>
                <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="10" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Monthly Contribution ($):</label>
                <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} placeholder="0" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Frequency */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Compounding Frequency:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    style={{
                      backgroundColor: frequency === f.value ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)',
                      color: frequency === f.value ? '#60a5fa' : '#94a3b8',
                      border: frequency === f.value ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Final Balance</div>
                <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(results.finalAmount)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Contributions</div>
                <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(results.totalContributions)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Interest Earned</div>
                <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(results.totalInterest)}</div>
              </div>
            </div>

            {/* Visual Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Breakdown:</div>
              <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ flex: results.totalContributions || 1, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {results.totalContributions > 0 ? Math.round((results.totalContributions / results.finalAmount) * 100) + '%' : ''}
                </div>
                <div style={{ flex: results.totalInterest || 1, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {results.totalInterest > 0 ? Math.round((results.totalInterest / results.finalAmount) * 100) + '%' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span><span style={{ color: '#3b82f6' }}>■</span> Contributions</span>
                <span><span style={{ color: '#10b981' }}>■</span> Interest</span>
              </div>
            </div>

            {/* Year-by-Year Table */}
            {results.schedule.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>📈 Year-by-Year Growth</div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: '4px', padding: '10px 14px', backgroundColor: 'rgba(59, 130, 246, 0.1)', fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
                    <div>Year</div>
                    <div style={{ textAlign: 'right' }}>Contributed</div>
                    <div style={{ textAlign: 'right' }}>Interest</div>
                    <div style={{ textAlign: 'right' }}>Balance</div>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {results.schedule.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: '4px', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        <div style={{ color: '#60a5fa', fontWeight: 700 }}>{row.year}</div>
                        <div style={{ textAlign: 'right' }}>{formatCurrency(row.contributed)}</div>
                        <div style={{ textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.interest)}</div>
                        <div style={{ textAlign: 'right', color: '#fff', fontWeight: 700 }}>{formatCurrency(row.balance)}</div>
                      </div>
                    ))}
                  </div>
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
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is Compound Interest?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              Compound interest is the interest you earn on both your original principal and on the interest you have already accumulated. Unlike simple interest (which only earns on principal), compound interest creates a snowball effect — your money grows exponentially over time. Albert Einstein famously called compound interest "the eighth wonder of the world," and it's the foundation of long-term investing, retirement accounts, and savings growth. This calculator shows you exactly how your money grows year by year.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter your <strong>initial principal</strong> (starting amount).</li>
              <li>Enter the <strong>annual interest rate</strong> (e.g., 7% for stock market average).</li>
              <li>Enter the number of <strong>years</strong> you plan to invest.</li>
              <li>Optionally add a <strong>monthly contribution</strong> amount.</li>
              <li>Choose your <strong>compounding frequency</strong> (daily, monthly, annually, etc.).</li>
              <li>See your final balance, total interest earned, and year-by-year growth.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is the compound interest formula?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>A = P(1 + r/n)^(nt). A = final amount, P = principal, r = annual rate (decimal), n = compounding frequency per year, t = years. For example, $10,000 at 7% compounded monthly for 10 years = $20,096.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Does compounding frequency matter?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes! The more often interest is compounded, the more you earn. Daily compounding gives the highest returns, followed by monthly, quarterly, and annually.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How does compound interest compare to simple interest?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Simple interest only earns on principal. Compound interest earns on principal plus previously earned interest. Over 30 years, $10,000 at 7%: simple = $31,000, compound = $76,123 — a $45,000 difference.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Compound Interest Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Compound Interest Calculator is 100% free with no sign-up required. All calculations happen in your browser.</p>
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