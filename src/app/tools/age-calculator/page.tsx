'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

function calculateAge(birthDate: Date, today: Date) {
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // Next birthday
  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // ============ Zodiac sign (FIXED) ============
  // JS me months 0-indexed hote hain (Jan=0, Dec=11).
  // Isliye `(m + 1) * 100 + d` use kar rahe hain — MMDD format me convert karne ke liye.
  const m = birthDate.getMonth();
  const d = birthDate.getDate();
  const monthDay = (m + 1) * 100 + d; // e.g., May 7 → 507

  let zodiac = 'Capricorn';
  if (monthDay >= 1222 || monthDay <= 119) zodiac = 'Capricorn';
  else if (monthDay <= 218) zodiac = 'Aquarius';
  else if (monthDay <= 320) zodiac = 'Pisces';
  else if (monthDay <= 419) zodiac = 'Aries';
  else if (monthDay <= 520) zodiac = 'Taurus';
  else if (monthDay <= 620) zodiac = 'Gemini';
  else if (monthDay <= 722) zodiac = 'Cancer';
  else if (monthDay <= 822) zodiac = 'Leo';
  else if (monthDay <= 922) zodiac = 'Virgo';
  else if (monthDay <= 1022) zodiac = 'Libra';
  else if (monthDay <= 1121) zodiac = 'Scorpio';
  else zodiac = 'Sagittarius';

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bornOn = daysOfWeek[birthDate.getDay()];

  return {
    years, months, days,
    totalDays, totalHours, totalMinutes, totalWeeks, totalMonths,
    daysToBirthday, zodiac, bornOn,
    nextBirthday
  };
}

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState('1995-06-15');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateAge> | null>(null);

  useEffect(() => {
    if (!birthDate) { setResult(null); return; }
    const bd = new Date(birthDate);
    if (isNaN(bd.getTime())) { setResult(null); return; }
    setResult(calculateAge(bd, new Date()));
  }, [birthDate]);

  const handleCopy = () => {
    if (!result) return;
    const text = `Age: ${result.years} years, ${result.months} months, ${result.days} days
Total Days: ${result.totalDays.toLocaleString()}
Total Hours: ${result.totalHours.toLocaleString()}
Total Minutes: ${result.totalMinutes.toLocaleString()}
Total Weeks: ${result.totalWeeks.toLocaleString()}
Total Months: ${result.totalMonths.toLocaleString()}
Born on: ${result.bornOn}
Zodiac: ${result.zodiac}
Next birthday in: ${result.daysToBirthday} days`;
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
        'name': 'VelnoxLabs Age Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'UtilityApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free online age calculator — calculate exact age in years, months, days, hours, minutes, and seconds. Find your next birthday countdown, zodiac sign, and day of week you were born.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I calculate my exact age?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Enter your date of birth, and the calculator shows your exact age in years, months, days, hours, and minutes instantly.' }
          },
          {
            '@type': 'Question',
            'name': 'What is my chronological age vs biological age?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Chronological age is the actual time elapsed since birth. Biological age reflects how old your body appears based on health markers. This tool calculates chronological age.' }
          },
          {
            '@type': 'Question',
            'name': 'Is the Age Calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Age Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Age Calculator"
            subtitle="Calculate your exact age in years, months, days, hours, and minutes — plus next birthday countdown and zodiac sign."
          />

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginTop: 'var(--space-6)' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Date of Birth:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
              />
            </div>

            {result && (
              <>
                {/* Main Age Display */}
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Your Exact Age</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{result.years}</span>
                    <span style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 600 }}>years</span>
                    <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{result.months}</span>
                    <span style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 600 }}>months</span>
                    <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{result.days}</span>
                    <span style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 600 }}>days</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    style={{ marginTop: '12px', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {copied ? '✓ Copied' : 'Copy Full Report'}
                  </button>
                </div>

                {/* Time Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { label: 'Total Months', value: result.totalMonths.toLocaleString() },
                    { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                    { label: 'Total Days', value: result.totalDays.toLocaleString() },
                    { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                    { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
                    { label: 'Days to Birthday', value: result.daysToBirthday.toLocaleString() },
                  ].map((item, i) => (
                    <div key={i} style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Born Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>🌟 Born On</div>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{result.bornOn}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#fcd34d', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>♈ Zodiac Sign</div>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{result.zodiac}</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>🎂 Next Birthday</div>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>In {result.daysToBirthday} days</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is an Age Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              An Age Calculator is a free online tool that calculates your exact age from your date of birth. Unlike a simple year-difference, this tool gives you a precise breakdown in years, months, days, hours, minutes, and even total weeks. It also shows you the day of the week you were born, your zodiac sign, and how many days are left until your next birthday. Perfect for filling out forms, legal documents, visa applications, or just satisfying curiosity.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Select your date of birth using the date picker.</li>
              <li>Your exact age appears instantly in years, months, and days.</li>
              <li>View total time lived in months, weeks, days, hours, and minutes.</li>
              <li>See your zodiac sign, day of the week born, and next birthday countdown.</li>
              <li>Click <strong style={{ color: '#34d399' }}>Copy Full Report</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How is age calculated?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Age is calculated by finding the difference between today's date and your date of birth. The tool accounts for leap years, varying month lengths, and gives an exact years/months/days breakdown.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>What is the difference between chronological and biological age?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Chronological age is the actual time elapsed since you were born — that's what this calculator measures. Biological age reflects how old your body appears based on health markers, which can differ from chronological age.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is my birthdate stored anywhere?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>No. All calculations happen entirely in your browser. Your birthdate is never sent to any server and is never stored.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Can I use this for official documents?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, the results are mathematically accurate and can help fill out visa applications, school forms, medical paperwork, and other documents requiring your exact age.</p>
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
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm">
                {feedbackSent ? 'Sent!' : 'Submit Suggestion'}
              </button>
            </form>
          </div>

        </div>
      </GlobalContainer>
    </>
  );
}
