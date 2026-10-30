'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

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
  const tUI = useTranslations('ToolUI.gradeCalculator');
  const [assignments, setAssignments] = useState<Assignment[]>(() => [
    { id: 1, name: tUI('defaultHomework'), grade: '92', weight: '20' },
    { id: 2, name: tUI('defaultMidterm'), grade: '85', weight: '30' },
    { id: 3, name: tUI('defaultFinalProject'), grade: '88', weight: '25' },
    { id: 4, name: tUI('defaultFinalExam'), grade: '90', weight: '25' },
  ]);
  const [desiredGrade, setDesiredGrade] = useState('90');
  const [copied, setCopied] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useEffect(() => {
    let weighted = 0;
    let totalW = 0;
    assignments.forEach((a) => {
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
    setAssignments(assignments.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAssignment = (id: number) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const gradeInfo = getLetterGrade(currentGrade);

  // What-if: what do I need on final?
  const remainingWeight = 100 - totalWeight;
  const desired = parseFloat(desiredGrade) || 0;
  const neededOnFinal =
    remainingWeight > 0
      ? (desired - (currentGrade * totalWeight) / 100) / (remainingWeight / 100)
      : 0;

  const handleCopy = () => {
    const text = `${tUI('summaryCurrentGrade', { grade: currentGrade.toFixed(2), letter: gradeInfo.letter, gpa: gradeInfo.gpa.toFixed(1) })}
${tUI('summaryTotalWeight', { weight: totalWeight })}
${remainingWeight > 0 ? tUI('summaryNeedFinal', { needed: neededOnFinal.toFixed(2), remaining: remainingWeight, desired }) : tUI('summaryAllAccounted')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="grade-calculator"
          />

          {/* Main Result Card */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginTop: 'var(--space-6)',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                color: '#6ee7b7',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              {tUI('yourCurrentGrade')}
            </div>
            <div
              style={{
                color: 'var(--text-main)',
                fontSize: '3.5rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                lineHeight: 1,
                marginBottom: '12px',
              }}
            >
              {currentGrade.toFixed(2)}%
            </div>
            <div style={{ display: 'inline-flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: `1px solid ${gradeInfo.color}`,
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: gradeInfo.color,
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {gradeInfo.letter}
              </span>
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {tUI('gpa', { gpa: gradeInfo.gpa.toFixed(1) })}
              </span>
            </div>
          </div>

          {/* Assignments */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>
                {tUI('assignments')}
              </h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {tUI('totalWeight', { weight: totalWeight })}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 40px',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              <div>{tUI('colAssignment')}</div>
              <div style={{ textAlign: 'center' }}>{tUI('colGrade')}</div>
              <div style={{ textAlign: 'center' }}>{tUI('colWeight')}</div>
              <div></div>
            </div>

            {assignments.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 40px',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => updateAssignment(a.id, 'name', e.target.value)}
                  placeholder={tUI('assignmentPlaceholder')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '10px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="number"
                  value={a.grade}
                  onChange={(e) => updateAssignment(a.id, 'grade', e.target.value)}
                  placeholder="92"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#34d399',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <input
                  type="number"
                  value={a.weight}
                  onChange={(e) => updateAssignment(a.id, 'weight', e.target.value)}
                  placeholder="20"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#60a5fa',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => removeAssignment(a.id)}
                  style={{
                    backgroundColor: 'rgba(248, 113, 113, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addAssignment}
              style={{
                width: '100%',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              {tUI('addAssignment')}
            </button>
          </div>

          {/* What-If Section */}
          {remainingWeight > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  color: '#c4b5fd',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '14px',
                }}
              >
                {tUI('whatIfTitle')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                {tUI('whatIfDesc', { remaining: remainingWeight })}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('desiredFinalGrade')}
                  </label>
                  <input
                    type="number"
                    value={desiredGrade}
                    onChange={(e) => setDesiredGrade(e.target.value)}
                    placeholder="90"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('youNeed')}
                  </label>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color:
                        neededOnFinal > 100 ? '#f87171' : neededOnFinal < 0 ? '#34d399' : '#c4b5fd',
                      textAlign: 'center',
                    }}
                  >
                    {neededOnFinal > 100
                      ? tUI('notPossible', { needed: neededOnFinal.toFixed(1) })
                      : neededOnFinal < 0
                        ? tUI('alreadySecured')
                        : `${neededOnFinal.toFixed(1)}%`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copy Button */}
          <button
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
              transition: 'all 0.2s',
              marginBottom: '20px',
            }}
          >
            {copied ? tUI('copied') : tUI('copySummary')}
          </button>

          <ToolSeoContent
            toolSlug="grade-calculator"
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
    </>
  );
}
