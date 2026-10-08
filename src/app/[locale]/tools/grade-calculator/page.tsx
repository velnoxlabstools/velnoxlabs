'use client';

import React, { useState, useEffect } from 'react';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';

type Assignment = { id: number; name: string; grade: string; weight: string };

function getLetterGrade(percentage: number) {
  if (percentage >= 97) return { letter: 'A+', gpa: 4.0, color: '#10b981' };
  if (percentage >= 93) return { letter: 'A', gpa: 4.0, color: '#10b981' };
  if (percentage >= 90) return { letter: 'A-', gpa: 3.7, color: '#10b981' };
  if (percentage >= 87) return { letter: 'B+', gpa: 3.3, color: '#34d399' };
  if (percentage >= 83) return { letter: 'B', gpa: 3.0, color: '#34d399' };
  if (percentage >= 80) return { letter: 'B-', gpa: 2.7, color: '#34d399' };
  if (percentage >= 77) return { letter: 'C+', gpa: 2.3, color: '#fbbf24' };
  if (percentage >= 73) return { letter: 'C', gpa: 2.0, color: '#fbbf24' };
  if (percentage >= 70) return { letter: 'C-', gpa: 1.7, color: '#fbbf24' };
  if (percentage >= 67) return { letter: 'D+', gpa: 1.3, color: '#fb923c' };
  if (percentage >= 63) return { letter: 'D', gpa: 1.0, color: '#fb923c' };
  if (percentage >= 60) return { letter: 'D-', gpa: 0.7, color: '#fb923c' };
  return { letter: 'F', gpa: 0.0, color: '#f87171' };
}

export default function GradeCalculatorPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, name: 'Homework', grade: '92', weight: '20' },
    { id: 2, name: 'Midterm Exam', grade: '85', weight: '30' },
    { id: 3, name: 'Final Project', grade: '88', weight: '25' },
    { id: 4, name: 'Final Exam', grade: '90', weight: '25' },
  ]);
  const [finalWeight, setFinalWeight] = useState('20');
  const [desiredGrade, setDesiredGrade] = useState('90');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    let weighted = 0;
    let totalW = 0;
    assignments.forEach(a => {
      const g = parseFloat(a.grade) || 0;
      const w = parseFloat(a.weight) || 0;
      weighted += g * w;
      totalW += w;
    });
    setTotalWeight(totalW);
    setCurrentGrade(totalW > 0 ? weighted / totalW : 0);
  }, [assignments]);

  const addAssignment = () => {
    setAssignments([...assignments, { id: Date.now(), name: '', grade: '', weight: '' }]);
  };

  const updateAssignment = (id: number, field: keyof Assignment, value: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const gradeInfo = getLetterGrade(currentGrade);

  // What-if: what do I need on final?
  const remainingWeight = 100 - totalWeight;
  const desired = parseFloat(desiredGrade) || 0;
  const neededOnFinal = remainingWeight > 0
    ? ((desired - (currentGrade * totalWeight / 100)) / (remainingWeight / 100))
    : 0;

  const handleCopy = () => {
    const text = `Current Grade: ${currentGrade.toFixed(2)}% (${gradeInfo.letter}, ${gradeInfo.gpa} GPA)
Total Weight Entered: ${totalWeight}%
${remainingWeight > 0 ? `Need ${neededOnFinal.toFixed(2)}% on remaining ${remainingWeight}% to get ${desired}%` : 'All weight accounted for'}`;
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
        'name': 'VelnoxLabs Grade Calculator',
        'operatingSystem': 'All',
        'applicationCategory': 'EducationApplication',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'description': 'Free grade calculator — calculate your weighted course grade, letter grade, GPA, and figure out what you need on the final exam to hit your target.'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I calculate my grade?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Multiply each assignment grade by its weight, then divide the total by the sum of all weights. Example: (92 × 20 + 85 × 30 + 88 × 25 + 90 × 25) / 100 = 88.35%.' }
          },
          {
            '@type': 'Question',
            'name': 'How do I figure out what I need on the final?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Use the formula: (Desired Grade − Current Weighted Score) / Remaining Weight. For example, if you have an 85% and want a 90% with a 20% final exam, you need (90 − 85×0.8)/0.2 = 100%.' }
          },
          {
            '@type': 'Question',
            'name': 'Is this Grade Calculator free?',
            'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, VelnoxLabs Grade Calculator is 100% free with no sign-up required. All calculations happen in your browser.' }
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
            title="Grade Calculator"
            subtitle="Calculate your weighted grade, letter grade, GPA — and find out what you need on the final exam."
          />

          {/* Main Result Card */}
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginTop: 'var(--space-6)', marginBottom: '24px' }}>
            <div style={{ color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Your Current Grade</div>
            <div style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1, marginBottom: '12px' }}>{currentGrade.toFixed(2)}%</div>
            <div style={{ display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${gradeInfo.color}`, borderRadius: '20px', padding: '6px 16px', color: gradeInfo.color, fontSize: '1rem', fontWeight: 700 }}>{gradeInfo.letter}</span>
              <span style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 16px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{gradeInfo.gpa.toFixed(1)} GPA</span>
            </div>
          </div>

          {/* Assignments */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>📋 Assignments</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total weight: <strong style={{ color: totalWeight === 100 ? '#34d399' : totalWeight > 100 ? '#f87171' : '#fbbf24' }}>{totalWeight}%</strong></span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 40px', gap: '8px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              <div>Assignment</div>
              <div style={{ textAlign: 'center' }}>Grade %</div>
              <div style={{ textAlign: 'center' }}>Weight %</div>
              <div></div>
            </div>

            {assignments.map((a) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 40px', gap: '8px', marginBottom: '8px' }}>
                <input type="text" value={a.name} onChange={(e) => updateAssignment(a.id, 'name', e.target.value)} placeholder="Assignment name" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} />
                <input type="number" value={a.grade} onChange={(e) => updateAssignment(a.id, 'grade', e.target.value)} placeholder="92" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#34d399', padding: '10px', fontSize: '0.85rem', fontFamily: 'monospace', textAlign: 'center', outline: 'none' }} />
                <input type="number" value={a.weight} onChange={(e) => updateAssignment(a.id, 'weight', e.target.value)} placeholder="20" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#60a5fa', padding: '10px', fontSize: '0.85rem', fontFamily: 'monospace', textAlign: 'center', outline: 'none' }} />
                <button onClick={() => removeAssignment(a.id)} style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>×</button>
              </div>
            ))}

            <button onClick={addAssignment} style={{ width: '100%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>+ Add Assignment</button>
          </div>

          {/* What-If Section */}
          {remainingWeight > 0 && (
            <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ color: '#c4b5fd', fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>🎯 What-If Calculator</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>You have <strong style={{ color: '#fff' }}>{remainingWeight}%</strong> remaining. What do you need to hit your target?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Desired Final Grade (%):</label>
                  <input type="number" value={desiredGrade} onChange={(e) => setDesiredGrade(e.target.value)} placeholder="90" style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>You Need:</label>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: neededOnFinal > 100 ? '#f87171' : neededOnFinal < 0 ? '#34d399' : '#c4b5fd', textAlign: 'center' }}>
                    {neededOnFinal > 100 ? `${neededOnFinal.toFixed(1)}% (not possible)` : neededOnFinal < 0 ? 'Already secured!' : `${neededOnFinal.toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{ width: '100%', backgroundColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.15)', color: copied ? '#34d399' : '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', marginBottom: '20px' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Grade Summary'}
          </button>

          {/* Visible SEO Content */}
          <div style={{ marginTop: '48px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>What is a Grade Calculator?</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px' }}>
              A Grade Calculator is a free online tool that helps students calculate their current grade in a course based on assignment scores and weights. Whether you're tracking homework, quizzes, midterms, or final exams, this tool gives you an instant weighted average, converts it to a letter grade (A, B, C, etc.) and a 4.0 GPA scale, and even shows what you need to score on the final exam to hit your target grade. Essential for high school and college students managing their GPA.
            </p>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', marginTop: '24px' }}>How to Use This Tool</h3>
            <ul style={{ color: '#94a3b8', lineHeight: 1.9, paddingLeft: '20px', marginBottom: '24px' }}>
              <li>Enter each assignment name, your grade (as a %), and its weight (as a %).</li>
              <li>The total weight should equal 100% for a complete picture.</li>
              <li>See your current weighted grade, letter grade, and GPA instantly.</li>
              <li>Use the <strong>What-If Calculator</strong> to find out what you need on the final.</li>
              <li>Click <strong>Copy Grade Summary</strong> to save or share.</li>
            </ul>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', marginTop: '24px' }}>Frequently Asked Questions</h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I calculate my weighted grade?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Multiply each assignment grade by its weight, sum the results, and divide by the total weight. Example: Homework 92% (20%), Midterm 85% (30%), Final 88% (50%) = (92×20 + 85×30 + 88×50) / 100 = 88.9%.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How do I figure out what I need on the final exam?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Formula: (Desired Grade − Current Weighted Score × Current Weight) / Final Weight. Example: If you have 85% from 80% of the course and want a 90%, with 20% final: (90 − 85×0.8) / 0.2 = 100%.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How are letter grades and GPA calculated?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Most US schools use: A = 90-100% (4.0), B = 80-89% (3.0), C = 70-79% (2.0), D = 60-69% (1.0), F = below 60% (0.0). This calculator uses the standard +/− scale (A+, A, A-, B+, etc.) with corresponding GPAs.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>Is this Grade Calculator free?</h4>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, VelnoxLabs Grade Calculator is 100% free with no sign-up required. All calculations happen in your browser.</p>
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