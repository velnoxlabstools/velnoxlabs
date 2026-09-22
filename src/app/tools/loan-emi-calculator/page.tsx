'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

export default function LoanEmiCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('250000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    payoffDate: '',
    schedule: [] as { year: number; principal: number; interest: number; balance: number }[],
  });

  useEffect(() => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const r = annualRate / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;

    if (P <= 0 || n <= 0) {
      setResults({ monthlyPayment: 0, totalPayment: 0, totalInterest: 0, payoffDate: '', schedule: [] });
      return;
    }

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    // Build yearly schedule
    const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    let balance = P;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      yearPrincipal += principalPayment;
      yearInterest += interestPayment;

      if (month % 12 === 0) {
        schedule.push({
          year: month / 12,
          principal: yearPrincipal,
          interest: yearInterest,
          balance: Math.max(0, balance),
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    // Payoff date
    const payoff = new Date();
    payoff.setMonth(payoff.getMonth() + n);
    const payoffDate = payoff.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      payoffDate,
      schedule,
    });
  }, [loanAmount, rate, years]);

  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCopy = () => {
    const text = `Loan Amount: ${formatCurrency(parseFloat(loanAmount) || 0)}
Interest Rate: ${rate}% APR
Term: ${years} years

Monthly Payment: ${formatCurrency(results.monthlyPayment)}
Total Interest: ${formatCurrency(results.totalInterest)}
Total Paid: ${formatCurrency(results.totalPayment)}
Payoff Date: ${results.payoffDate}`;
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
        'name': 'VelnoxLabs Loan EMI Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'FinanceApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free loan EMI calculator — calculate monthly mortgage, car, or personal loan payments with a detailed amortization schedule.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is a loan EMI?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'EMI stands for Equated Monthly Installment. It is the fixed amount you pay your lender every month to repay both the principal and interest on a loan over the loan term.' }
          },
          {
            '@type': 'Question',
            'name': 'How is EMI calculated?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'EMI is calculated using the formula: EMI = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is principal, r is monthly interest rate, and n is the number of months in the loan term.' }
          },
          {
            '@type': 'Question',
            'name': 'How does a shorter loan term affect my payment?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'A shorter term means higher monthly payments, but you pay much less interest overall. For example, a 15-year mortgage typically saves tens of thousands of dollars in interest compared to a 30-year mortgage.' }
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
            title="Loan EMI Calculator"
            subtitle="Calculate your monthly loan payment (EMI) for mortgages, car loans, and personal loans — with a full amortization schedule."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            {/* Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Loan Amount ($):</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="250000" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Annual Interest Rate (%):</label>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" step="0.1" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Loan Term (years):</label>
                <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="30" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '14px', fontSize: '1.05rem', fontWeight: 700, outline: 'none', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Main Result - Monthly Payment */}
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Monthly Payment (EMI)</div>
              <div style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1 }}>{formatCurrency(results.monthlyPayment)}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Payoff by {results.payoffDate}</div>
            </div>

            {/* Secondary Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Principal</div>
                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(parseFloat(loanAmount) || 0)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Interest</div>
                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(results.totalInterest)}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ color: '#fcd34d', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Paid</div>
                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatCurrency(results.totalPayment)}</div>
              </div>
            </div>

            {/* Breakdown Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Principal vs Interest:</div>
              <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ flex: parseFloat(loanAmount) || 1, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {results.totalPayment > 0 ? Math.round(((parseFloat(loanAmount) || 0) / results.totalPayment) * 100) + '%' : ''}
                </div>
                <div style={{ flex: results.totalInterest || 1, backgroundColor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {results.totalPayment > 0 ? Math.round((results.totalInterest / results.totalPayment) * 100) + '%' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span><span style={{ color: '#3b82f6' }}>■</span> Principal</span>
                <span><span style={{ color: '#a855f7' }}>■</span> Interest</span>
              </div>
            </div>

            {/* Amortization Schedule */}
            {results.schedule.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>📊 Yearly Amortization Schedule</div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: '4px', padding: '10px 14px', backgroundColor: 'rgba(59, 130, 246, 0.1)', fontSize: '0.7rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase' }}>
                    <div>Year</div>
                    <div style={{ textAlign: 'right' }}>Principal</div>
                    <div style={{ textAlign: 'right' }}>Interest</div>
                    <div style={{ textAlign: 'right' }}>Balance</div>
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {results.schedule.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: '4px', padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                        <div style={{ color: '#60a5fa', fontWeight: 700 }}>{row.year}</div>
                        <div style={{ textAlign: 'right', color: '#93c5fd' }}>{formatCurrency(row.principal)}</div>
                        <div style={{ textAlign: 'right', color: '#c4b5fd' }}>{formatCurrency(row.interest)}</div>
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
              {copied ? '✓ Copied!' : '📋 Copy Loan Summary'}
            </button>
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Loan EMI Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Loan EMI Calculator is a free online tool that computes your Equated Monthly Installment (EMI) for any loan — home mortgage, car loan, personal loan, or student loan. EMI is the fixed amount you pay each month to repay both the principal amount you borrowed and the interest charged by the lender. This calculator also generates a full amortization schedule showing how much goes toward principal vs interest each year, so you can see exactly how your loan gets paid off over time.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter the <strong>loan amount</strong> you want to borrow.</li>
              <li>Enter the <strong>annual interest rate</strong> (APR) offered by your lender.</li>
              <li>Enter the <strong>loan term in years</strong> (e.g., 15 or 30 for mortgages).</li>
              <li>See your monthly EMI, total interest, and total amount paid.</li>
              <li>Scroll the amortization table to see the year-by-year breakdown.</li>
              <li>Click <strong>Copy Loan Summary</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is EMI?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>EMI stands for Equated Monthly Installment. It's the fixed payment you make each month to repay a loan. Each EMI consists of two parts: principal repayment and interest payment. Early on, most of your EMI goes toward interest; later, most goes toward principal.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How is EMI calculated?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>The formula is: EMI = P × r × (1 + r)^n / ((1 + r)^n − 1), where P is principal, r is monthly interest rate (annual rate ÷ 12 ÷ 100), and n is number of monthly payments. For example, a $250,000 mortgage at 6.5% for 30 years = $1,580.17/month.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Should I choose a 15-year or 30-year mortgage?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>A 15-year mortgage has higher monthly payments but saves enormous interest — often $100,000+. A 30-year mortgage has lower monthly payments but you pay much more interest overall. This calculator lets you compare both instantly.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Loan EMI Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Loan EMI Calculator is 100% free with no sign-up required. All calculations happen in your browser — your financial data is never sent to any server.</p>
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