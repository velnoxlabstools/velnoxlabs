'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';
import {
  BookOpen,
  Award,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  BarChart3,
  Target,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

type Mode = 'weighted' | 'semester' | 'points' | 'test-grader';

interface Assignment {
  id: number;
  name: string;
  grade: string;
  weight: string;
}

interface PointItem {
  id: number;
  name: string;
  earned: string;
  possible: string;
}

interface GradeScaleItem {
  letter: string;
  minPercent: number;
  gpa: number;
  color: string;
}

const GRADE_SCALE: GradeScaleItem[] = [
  { letter: 'A+', minPercent: 97, gpa: 4.0, color: '#10b981' },
  { letter: 'A', minPercent: 93, gpa: 4.0, color: '#10b981' },
  { letter: 'A-', minPercent: 90, gpa: 3.7, color: '#10b981' },
  { letter: 'B+', minPercent: 87, gpa: 3.3, color: '#34d399' },
  { letter: 'B', minPercent: 83, gpa: 3.0, color: '#34d399' },
  { letter: 'B-', minPercent: 80, gpa: 2.7, color: '#34d399' },
  { letter: 'C+', minPercent: 77, gpa: 2.3, color: '#fbbf24' },
  { letter: 'C', minPercent: 73, gpa: 2.0, color: '#fbbf24' },
  { letter: 'C-', minPercent: 70, gpa: 1.7, color: '#fbbf24' },
  { letter: 'D+', minPercent: 67, gpa: 1.3, color: '#fb923c' },
  { letter: 'D', minPercent: 63, gpa: 1.0, color: '#fb923c' },
  { letter: 'D-', minPercent: 60, gpa: 0.7, color: '#fb923c' },
  { letter: 'F', minPercent: 0, gpa: 0.0, color: '#f87171' },
];

const LETTER_TO_PERCENT: Record<string, number> = {
  'A+': 98,
  A: 95,
  'A-': 91.5,
  'B+': 88,
  B: 85,
  'B-': 81.5,
  'C+': 78,
  C: 75,
  'C-': 71.5,
  'D+': 68,
  D: 65,
  'D-': 61.5,
  F: 50,
};

function parseGradeValue(raw: string): number {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return 0;
  if (trimmed in LETTER_TO_PERCENT) {
    return LETTER_TO_PERCENT[trimmed];
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? 0 : num;
}

function getLetterGrade(percentage: number) {
  for (const item of GRADE_SCALE) {
    if (percentage >= item.minPercent) {
      return item;
    }
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

export default function GradeCalculatorPage() {
  const tUI = useTranslations('ToolUI.gradeCalculator');

  // Mode Selection
  const [mode, setMode] = useState<Mode>('weighted');

  // ================= MODE 1: WEIGHTED STATE =================
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, name: 'Homework & Quizzes', grade: '92', weight: '20' },
    { id: 2, name: 'Midterm Exam', grade: '85', weight: '30' },
    { id: 3, name: 'Labs & Term Project', grade: '88', weight: '25' },
  ]);
  const [desiredGrade, setDesiredGrade] = useState('90');

  // ================= MODE 2: SEMESTER 1 & 2 STATE =================
  const [sem1Grade, setSem1Grade] = useState('88');
  const [sem2Grade, setSem2Grade] = useState('84');
  const [finalWeight, setFinalWeight] = useState('20');
  const [semDesired, setSemDesired] = useState('85');

  // ================= MODE 3: POINTS BASED STATE =================
  const [pointsList, setPointsList] = useState<PointItem[]>([
    { id: 1, name: 'Homework Assignments', earned: '45', possible: '50' },
    { id: 2, name: 'Lab Reports', earned: '90', possible: '100' },
    { id: 3, name: 'Midterm Exam', earned: '84', possible: '100' },
    { id: 4, name: 'Quizzes', earned: '46', possible: '50' },
  ]);
  const [finalPossiblePoints, setFinalPossiblePoints] = useState('100');
  const [pointsDesiredPercent, setPointsDesiredPercent] = useState('90');

  // ================= MODE 4: QUICK TEST GRADER STATE =================
  const [testTotal, setTestTotal] = useState('30');
  const [testWrong, setTestWrong] = useState('4');

  // Shared state
  const [copied, setCopied] = useState(false);

  // ================= CALCULATIONS: MODE 1 (WEIGHTED) =================
  const weightedStats = useMemo(() => {
    let weightedSum = 0;
    let totalW = 0;

    assignments.forEach((a) => {
      const g = parseGradeValue(a.grade);
      const w = parseFloat(a.weight) || 0;
      weightedSum += g * w;
      totalW += w;
    });

    const currentGrade = totalW > 0 ? weightedSum / totalW : 0;
    const remainingWeight = Math.max(0, 100 - totalW);
    const desired = parseFloat(desiredGrade) || 0;

    const neededOnFinal =
      remainingWeight > 0 ? (desired - (currentGrade * totalW) / 100) / (remainingWeight / 100) : 0;

    // Target Matrix for each letter grade
    const targetMatrix = GRADE_SCALE.filter((g) =>
      ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'].includes(g.letter)
    ).map((gradeItem) => {
      const targetPercent = gradeItem.minPercent;
      const needed =
        remainingWeight > 0
          ? (targetPercent - (currentGrade * totalW) / 100) / (remainingWeight / 100)
          : 0;

      let status: 'secured' | 'possible' | 'impossible' = 'possible';
      if (needed <= 0) status = 'secured';
      else if (needed > 100) status = 'impossible';

      return {
        letter: gradeItem.letter,
        minPercent: targetPercent,
        gpa: gradeItem.gpa,
        needed,
        status,
        color: gradeItem.color,
      };
    });

    return {
      currentGrade,
      totalWeight: totalW,
      remainingWeight,
      neededOnFinal,
      targetMatrix,
      gradeInfo: getLetterGrade(currentGrade),
    };
  }, [assignments, desiredGrade]);

  // Mode 1 Presets
  const applyPreset = (presetType: 'stem' | 'highschool' | 'humanities' | 'balanced') => {
    if (presetType === 'stem') {
      setAssignments([
        { id: 1, name: 'Homework & Problem Sets', grade: '92', weight: '20' },
        { id: 2, name: 'Laboratory Work', grade: '88', weight: '20' },
        { id: 3, name: 'Midterm Exam', grade: '82', weight: '25' },
      ]);
    } else if (presetType === 'highschool') {
      setAssignments([
        { id: 1, name: 'Quarter 1 Grade', grade: '90', weight: '40' },
        { id: 2, name: 'Quarter 2 Grade', grade: '85', weight: '40' },
      ]);
    } else if (presetType === 'humanities') {
      setAssignments([
        { id: 1, name: 'Attendance & Discussion', grade: '96', weight: '15' },
        { id: 2, name: 'Midterm Essay', grade: '88', weight: '25' },
        { id: 3, name: 'Research Paper', grade: '85', weight: '25' },
      ]);
    } else {
      setAssignments([
        { id: 1, name: 'Assignments & Homework', grade: '90', weight: '25' },
        { id: 2, name: 'Quizzes', grade: '85', weight: '25' },
        { id: 3, name: 'Midterm Exam', grade: '88', weight: '25' },
      ]);
    }
  };

  const addAssignment = () => {
    setAssignments((prev) => [...prev, { id: Date.now(), name: '', grade: '', weight: '' }]);
  };

  const updateAssignment = (id: number, field: keyof Assignment, value: string) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAssignment = (id: number) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // ================= CALCULATIONS: MODE 2 (SEMESTER 1 & 2) =================
  const semesterStats = useMemo(() => {
    const s1 = parseFloat(sem1Grade) || 0;
    const s2 = parseFloat(sem2Grade) || 0;
    const fWeight = Math.max(1, Math.min(99, parseFloat(finalWeight) || 20));
    const target = parseFloat(semDesired) || 85;

    const termWeightEach = (100 - fWeight) / 2;
    const currentTermGrade = (s1 + s2) / 2;
    const termWeightedContribution = (s1 * termWeightEach + s2 * termWeightEach) / 100;
    const finalWeightFraction = fWeight / 100;

    const neededOnFinal = (target - termWeightedContribution) / finalWeightFraction;

    const targetMatrix = GRADE_SCALE.filter((g) =>
      ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'].includes(g.letter)
    ).map((gradeItem) => {
      const needed = (gradeItem.minPercent - termWeightedContribution) / finalWeightFraction;
      let status: 'secured' | 'possible' | 'impossible' = 'possible';
      if (needed <= 0) status = 'secured';
      else if (needed > 100) status = 'impossible';

      return {
        letter: gradeItem.letter,
        minPercent: gradeItem.minPercent,
        gpa: gradeItem.gpa,
        needed,
        status,
        color: gradeItem.color,
      };
    });

    return {
      currentTermGrade,
      termWeightEach,
      neededOnFinal,
      gradeInfo: getLetterGrade(currentTermGrade),
      targetMatrix,
    };
  }, [sem1Grade, sem2Grade, finalWeight, semDesired]);

  // ================= CALCULATIONS: MODE 3 (POINTS BASED) =================
  const pointsStats = useMemo(() => {
    let totalEarned = 0;
    let totalPossible = 0;

    pointsList.forEach((p) => {
      totalEarned += parseFloat(p.earned) || 0;
      totalPossible += parseFloat(p.possible) || 0;
    });

    const currentPercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    const finalPossible = parseFloat(finalPossiblePoints) || 0;
    const desiredPercent = parseFloat(pointsDesiredPercent) || 90;

    const grandTotalPossible = totalPossible + finalPossible;
    const totalPointsNeeded = grandTotalPossible * (desiredPercent / 100);
    const pointsNeededOnFinal = Math.max(0, totalPointsNeeded - totalEarned);
    const percentNeededOnFinal =
      finalPossible > 0 ? (pointsNeededOnFinal / finalPossible) * 100 : 0;

    return {
      totalEarned,
      totalPossible,
      currentPercentage,
      pointsNeededOnFinal,
      percentNeededOnFinal,
      gradeInfo: getLetterGrade(currentPercentage),
    };
  }, [pointsList, finalPossiblePoints, pointsDesiredPercent]);

  const addPointItem = () => {
    setPointsList((prev) => [...prev, { id: Date.now(), name: '', earned: '', possible: '' }]);
  };

  const updatePointItem = (id: number, field: keyof PointItem, value: string) => {
    setPointsList((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePointItem = (id: number) => {
    setPointsList((prev) => prev.filter((p) => p.id !== id));
  };

  // ================= CALCULATIONS: MODE 4 (QUICK TEST GRADER) =================
  const testGraderStats = useMemo(() => {
    const total = Math.max(1, parseInt(testTotal, 10) || 1);
    const wrongRaw = parseFloat(testWrong);
    const wrong = Math.max(0, Math.min(total, isNaN(wrongRaw) ? 0 : wrongRaw));
    const correct = total - wrong;
    const scorePercent = (correct / total) * 100;

    // Full grading chart from 0 wrong to total (capped at 40 rows for performance)
    const maxRows = Math.min(total, 40);
    const chartRows = [];
    for (let w = 0; w <= maxRows; w++) {
      const c = total - w;
      const pct = (c / total) * 100;
      const gr = getLetterGrade(pct);
      chartRows.push({
        wrong: w,
        correct: c,
        percent: pct,
        grade: gr.letter,
        color: gr.color,
      });
    }

    return {
      total,
      wrong,
      correct,
      scorePercent,
      gradeInfo: getLetterGrade(scorePercent),
      chartRows,
    };
  }, [testTotal, testWrong]);

  // ================= COPY SUMMARY HELPER =================
  const handleCopySummary = () => {
    let summary = '';
    if (mode === 'weighted') {
      summary = `=== ${tUI('title')} (Weighted) ===
${tUI('summaryCurrentGrade', {
  grade: weightedStats.currentGrade.toFixed(2),
  letter: weightedStats.gradeInfo.letter,
  gpa: weightedStats.gradeInfo.gpa.toFixed(1),
})}
${tUI('summaryTotalWeight', { weight: weightedStats.totalWeight })}
${
  weightedStats.remainingWeight > 0
    ? tUI('summaryNeedFinal', {
        needed: weightedStats.neededOnFinal.toFixed(2),
        remaining: weightedStats.remainingWeight,
        desired: desiredGrade,
      })
    : tUI('summaryAllAccounted')
}`;
    } else if (mode === 'semester') {
      summary = `=== ${tUI('title')} (Semester 1 & 2) ===
Semester 1: ${sem1Grade}% | Semester 2: ${sem2Grade}%
Combined Pre-Final Average: ${semesterStats.currentTermGrade.toFixed(2)}% (${semesterStats.gradeInfo.letter})
Final Exam Weight: ${finalWeight}% | Target Grade: ${semDesired}%
Required on Final Exam: ${
        semesterStats.neededOnFinal > 100
          ? `${semesterStats.neededOnFinal.toFixed(1)}% (Needs Extra Credit)`
          : semesterStats.neededOnFinal <= 0
            ? 'Already Secured!'
            : `${semesterStats.neededOnFinal.toFixed(1)}%`
      }`;
    } else if (mode === 'points') {
      summary = `=== ${tUI('title')} (Points-Based) ===
Total Points Earned: ${pointsStats.totalEarned} / ${pointsStats.totalPossible} (${pointsStats.currentPercentage.toFixed(2)}% - ${pointsStats.gradeInfo.letter})
Final Exam Points: ${finalPossiblePoints} pts | Target: ${pointsDesiredPercent}%
Needed on Final: ${pointsStats.pointsNeededOnFinal.toFixed(1)} pts (${pointsStats.percentNeededOnFinal.toFixed(1)}%)`;
    } else {
      summary = `=== ${tUI('title')} (Quick Test Grader) ===
Total Questions: ${testGraderStats.total} | Missed: ${testGraderStats.wrong}
Correct: ${testGraderStats.correct} | Score: ${testGraderStats.scorePercent.toFixed(1)}% (${testGraderStats.gradeInfo.letter}, ${testGraderStats.gradeInfo.gpa.toFixed(1)} GPA)`;
    }

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          {/* Header */}
          <SectionHeading
            title={tUI('title')}
            subtitle={tUI('subtitle')}
            toolSlug="grade-calculator"
          />

          {/* Mode Tabs Navigation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'var(--space-6)',
              marginBottom: '20px',
            }}
          >
            {[
              { key: 'weighted', label: tUI('tabWeighted'), icon: Sliders },
              { key: 'semester', label: tUI('tabSemester'), icon: Layers },
              { key: 'points', label: tUI('tabPoints'), icon: FileSpreadsheet },
              { key: 'test-grader', label: tUI('tabTestGrader'), icon: BarChart3 },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = mode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMode(tab.key as Mode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isActive
                      ? '1px solid var(--primary-color)'
                      : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary-color)' : 'var(--bg-card)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* MAIN GRADE HERO SCORECARD (DYNAMIC FOR ACTIVE MODE) */}
          {/* ========================================================================= */}
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              padding: '28px 20px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                color: '#6ee7b7',
                fontSize: '0.825rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              {mode === 'weighted'
                ? tUI('yourCurrentGrade')
                : mode === 'semester'
                  ? tUI('semesterCombinedGrade')
                  : mode === 'points'
                    ? tUI('pointsCurrentStanding')
                    : tUI('testFinalScore')}
            </div>

            <div
              style={{
                color: 'var(--text-main)',
                fontSize: '3.25rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                lineHeight: 1,
                marginBottom: '12px',
              }}
            >
              {mode === 'weighted'
                ? `${weightedStats.currentGrade.toFixed(2)}%`
                : mode === 'semester'
                  ? `${semesterStats.currentTermGrade.toFixed(2)}%`
                  : mode === 'points'
                    ? `${pointsStats.currentPercentage.toFixed(2)}%`
                    : `${testGraderStats.scorePercent.toFixed(1)}%`}
            </div>

            <div
              style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Letter Grade */}
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: `1px solid ${
                    mode === 'weighted'
                      ? weightedStats.gradeInfo.color
                      : mode === 'semester'
                        ? semesterStats.gradeInfo.color
                        : mode === 'points'
                          ? pointsStats.gradeInfo.color
                          : testGraderStats.gradeInfo.color
                  }`,
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color:
                    mode === 'weighted'
                      ? weightedStats.gradeInfo.color
                      : mode === 'semester'
                        ? semesterStats.gradeInfo.color
                        : mode === 'points'
                          ? pointsStats.gradeInfo.color
                          : testGraderStats.gradeInfo.color,
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {mode === 'weighted'
                  ? weightedStats.gradeInfo.letter
                  : mode === 'semester'
                    ? semesterStats.gradeInfo.letter
                    : mode === 'points'
                      ? pointsStats.gradeInfo.letter
                      : testGraderStats.gradeInfo.letter}
              </span>

              {/* GPA */}
              <span
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {tUI('gpa', {
                  gpa: (mode === 'weighted'
                    ? weightedStats.gradeInfo.gpa
                    : mode === 'semester'
                      ? semesterStats.gradeInfo.gpa
                      : mode === 'points'
                        ? pointsStats.gradeInfo.gpa
                        : testGraderStats.gradeInfo.gpa
                  ).toFixed(1),
                })}
              </span>

              {/* Context Pill */}
              <span
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#60a5fa',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                }}
              >
                {mode === 'weighted'
                  ? tUI('weightAccounted', {
                      weight: weightedStats.totalWeight,
                      remaining: weightedStats.remainingWeight,
                    })
                  : mode === 'semester'
                    ? tUI('finalWeightPill', { weight: finalWeight })
                    : mode === 'points'
                      ? `${pointsStats.totalEarned} / ${pointsStats.totalPossible} pts`
                      : `${testGraderStats.correct} / ${testGraderStats.total} ${tUI('correct')}`}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODE 1: WEIGHTED FINAL GRADE CALCULATOR */}
          {/* ========================================================================= */}
          {mode === 'weighted' && (
            <>
              {/* Syllabus Presets */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Sparkles size={14} color="var(--primary-color)" />
                    {tUI('quickPresetsTitle')}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignments([
                        { id: 1, name: '', grade: '', weight: '' },
                        { id: 2, name: '', grade: '', weight: '' },
                      ]);
                      setDesiredGrade('90');
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {tUI('resetBtn')}
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => applyPreset('stem')}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    🎓 {tUI('presetCollegeStem')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('highschool')}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    🏫 {tUI('presetHighSchoolAp')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('humanities')}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    📖 {tUI('presetHumanities')}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('balanced')}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    ⚖️ {tUI('presetBalanced')}
                  </button>
                </div>
              </div>

              {/* Assignments Table */}
              <div
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: 0,
                    }}
                  >
                    <BookOpen size={16} color="var(--primary-color)" />
                    {tUI('assignments')}
                  </h3>
                  <span
                    style={{
                      color:
                        weightedStats.totalWeight > 100
                          ? '#f87171'
                          : weightedStats.totalWeight === 100
                            ? '#34d399'
                            : 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    {tUI('totalWeight', { weight: weightedStats.totalWeight })}
                  </span>
                </div>

                {weightedStats.totalWeight > 100 && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(248, 113, 113, 0.14)',
                      border: '1px solid rgba(248, 113, 113, 0.35)',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    ⚠️ {tUI('weightExceededWarning', { weight: weightedStats.totalWeight })}
                  </div>
                )}

                {/* Table Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 100px 40px',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '0.725rem',
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

                {/* Assignment Rows */}
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
                      type="text"
                      value={a.grade}
                      onChange={(e) => updateAssignment(a.id, 'grade', e.target.value)}
                      placeholder="90 / A-"
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
                      type="button"
                      onClick={() => removeAssignment(a.id)}
                      style={{
                        backgroundColor: 'rgba(248, 113, 113, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAssignment}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    color: '#60a5fa',
                    border: '1px dashed rgba(59, 130, 246, 0.35)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={15} />
                  {tUI('addAssignment')}
                </button>
              </div>

              {/* What-If Final Exam Calculator & Target Matrix */}
              <div
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <Target size={18} color="#c084fc" />
                  <h3
                    style={{
                      color: '#c4b5fd',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {tUI('whatIfTitle')}
                  </h3>
                </div>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {weightedStats.remainingWeight > 0
                    ? tUI('whatIfDesc', { remaining: weightedStats.remainingWeight })
                    : tUI('allWeightEnteredNotice')}
                </p>

                {/* Target Grade Input & Needed Score Card */}
                {weightedStats.remainingWeight > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginBottom: '20px',
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
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          color:
                            weightedStats.neededOnFinal > 100
                              ? '#f87171'
                              : weightedStats.neededOnFinal <= 0
                                ? '#34d399'
                                : '#c4b5fd',
                          textAlign: 'center',
                        }}
                      >
                        {weightedStats.neededOnFinal > 100
                          ? tUI('notPossible', {
                              needed: weightedStats.neededOnFinal.toFixed(1),
                            })
                          : weightedStats.neededOnFinal <= 0
                            ? tUI('alreadySecured')
                            : `${weightedStats.neededOnFinal.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE GRADE TARGET MATRIX */}
                {weightedStats.remainingWeight > 0 && (
                  <div>
                    <h4
                      style={{
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Award size={15} color="#c084fc" />
                      {tUI('targetMatrixTitle')}
                    </h4>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      {weightedStats.targetMatrix.map((item) => (
                        <div
                          key={item.letter}
                          style={{
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '10px',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '4px',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                color: item.color,
                                fontWeight: 800,
                                fontSize: '1rem',
                              }}
                            >
                              {item.letter}
                            </span>
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.725rem',
                              }}
                            >
                              ({item.minPercent}%)
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color:
                                item.status === 'secured'
                                  ? '#10b981'
                                  : item.status === 'impossible'
                                    ? '#f87171'
                                    : '#818cf8',
                            }}
                          >
                            {item.status === 'secured'
                              ? tUI('matrixSecured')
                              : item.status === 'impossible'
                                ? `>100% (${item.needed.toFixed(0)}%)`
                                : `${item.needed.toFixed(1)}%`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: SEMESTER 1 & 2 / TERM GRADE CALCULATOR */}
          {/* ========================================================================= */}
          {mode === 'semester' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Layers size={18} color="var(--primary-color)" />
                {tUI('semesterCalcTitle')}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('semester1Label')}
                  </label>
                  <input
                    type="number"
                    value={sem1Grade}
                    onChange={(e) => setSem1Grade(e.target.value)}
                    placeholder="88"
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
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {tUI('termWeightNote', { weight: semesterStats.termWeightEach.toFixed(0) })}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('semester2Label')}
                  </label>
                  <input
                    type="number"
                    value={sem2Grade}
                    onChange={(e) => setSem2Grade(e.target.value)}
                    placeholder="84"
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
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {tUI('termWeightNote', { weight: semesterStats.termWeightEach.toFixed(0) })}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('finalExamWeightLabel')}
                  </label>
                  <input
                    type="number"
                    value={finalWeight}
                    onChange={(e) => setFinalWeight(e.target.value)}
                    placeholder="20"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      padding: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {tUI('standardFinalExamNote')}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('desiredOverallGrade')}
                  </label>
                  <input
                    type="number"
                    value={semDesired}
                    onChange={(e) => setSemDesired(e.target.value)}
                    placeholder="85"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#34d399',
                      padding: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Semester Result Box */}
              <div
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}
                >
                  {tUI('semesterFinalExamNeeded')}
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color:
                      semesterStats.neededOnFinal > 100
                        ? '#f87171'
                        : semesterStats.neededOnFinal <= 0
                          ? '#34d399'
                          : '#60a5fa',
                    lineHeight: 1.1,
                    marginBottom: '8px',
                  }}
                >
                  {semesterStats.neededOnFinal > 100
                    ? `${semesterStats.neededOnFinal.toFixed(1)}%`
                    : semesterStats.neededOnFinal <= 0
                      ? tUI('alreadySecured')
                      : `${semesterStats.neededOnFinal.toFixed(1)}%`}
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    maxWidth: '500px',
                    margin: '0 auto',
                  }}
                >
                  {semesterStats.neededOnFinal > 100
                    ? tUI('semesterImpossibleMsg')
                    : semesterStats.neededOnFinal <= 0
                      ? tUI('semesterSecuredMsg')
                      : tUI('semesterAchievableMsg', {
                          score: semesterStats.neededOnFinal.toFixed(1),
                          target: semDesired,
                        })}
                </div>
              </div>

              {/* Semester Grade Target Matrix */}
              <h4
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                {tUI('semesterMatrixTitle')}
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                {semesterStats.targetMatrix.map((item) => (
                  <div
                    key={item.letter}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: item.color, fontWeight: 800, fontSize: '1rem' }}>
                        {item.letter}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                        ({item.minPercent}%)
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color:
                          item.status === 'secured'
                            ? '#10b981'
                            : item.status === 'impossible'
                              ? '#f87171'
                              : '#60a5fa',
                      }}
                    >
                      {item.status === 'secured'
                        ? tUI('matrixSecured')
                        : item.status === 'impossible'
                          ? `>100% (${item.needed.toFixed(0)}%)`
                          : `${item.needed.toFixed(1)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: POINTS-BASED GRADE CALCULATOR */}
          {/* ========================================================================= */}
          {mode === 'points' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
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
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <h3
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FileSpreadsheet size={18} color="var(--primary-color)" />
                  {tUI('pointsCalcTitle')}
                </h3>
                <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                  {pointsStats.totalEarned} / {pointsStats.totalPossible} pts (
                  {pointsStats.currentPercentage.toFixed(1)}%)
                </span>
              </div>

              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 100px 40px',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                <div>{tUI('colAssignment')}</div>
                <div style={{ textAlign: 'center' }}>{tUI('pointsEarned')}</div>
                <div style={{ textAlign: 'center' }}>{tUI('pointsPossible')}</div>
                <div></div>
              </div>

              {/* Points Rows */}
              {pointsList.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 100px 40px',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updatePointItem(p.id, 'name', e.target.value)}
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
                    value={p.earned}
                    onChange={(e) => updatePointItem(p.id, 'earned', e.target.value)}
                    placeholder="45"
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
                    value={p.possible}
                    onChange={(e) => updatePointItem(p.id, 'possible', e.target.value)}
                    placeholder="50"
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
                    type="button"
                    onClick={() => removePointItem(p.id)}
                    style={{
                      backgroundColor: 'rgba(248, 113, 113, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addPointItem}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#60a5fa',
                  border: '1px dashed rgba(59, 130, 246, 0.35)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={15} />
                {tUI('addAssignment')}
              </button>

              {/* Points What-If Section */}
              <div
                style={{
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <h4
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  🎯 {tUI('pointsWhatIfTitle')}
                </h4>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('finalExamTotalPoints')}
                    </label>
                    <input
                      type="number"
                      value={finalPossiblePoints}
                      onChange={(e) => setFinalPossiblePoints(e.target.value)}
                      placeholder="100"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.9rem',
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
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('desiredFinalPercent')}
                    </label>
                    <input
                      type="number"
                      value={pointsDesiredPercent}
                      onChange={(e) => setPointsDesiredPercent(e.target.value)}
                      placeholder="90"
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-main)',
                        padding: '10px',
                        fontSize: '0.9rem',
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
                        marginBottom: '4px',
                      }}
                    >
                      {tUI('pointsNeededResult')}
                    </label>
                    <div
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '6px',
                        padding: '10px',
                        color: '#60a5fa',
                        fontSize: '1rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        textAlign: 'center',
                      }}
                    >
                      {pointsStats.pointsNeededOnFinal.toFixed(1)} pts (
                      {pointsStats.percentNeededOnFinal.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 4: QUICK TEST GRADER (EZGRADER) */}
          {/* ========================================================================= */}
          {mode === 'test-grader' && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  color: 'var(--text-main)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <BarChart3 size={18} color="var(--primary-color)" />
                {tUI('testGraderTitle')}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('totalQuestionsLabel')}
                  </label>
                  <input
                    type="number"
                    value={testTotal}
                    onChange={(e) => setTestTotal(e.target.value)}
                    placeholder="30"
                    min="1"
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
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {tUI('wrongQuestionsLabel')}
                  </label>
                  <input
                    type="number"
                    value={testWrong}
                    onChange={(e) => setTestWrong(e.target.value)}
                    placeholder="4"
                    min="0"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#f87171',
                      padding: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Complete Test Grading Scale Chart */}
              <h4
                style={{
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                📊 {tUI('testGradingChartTitle', { total: testGraderStats.total })}
              </h4>
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        textAlign: 'left',
                      }}
                    >
                      <th style={{ padding: '8px 12px' }}>{tUI('chartMissed')}</th>
                      <th style={{ padding: '8px 12px' }}>{tUI('chartCorrect')}</th>
                      <th style={{ padding: '8px 12px' }}>{tUI('chartScore')}</th>
                      <th style={{ padding: '8px 12px' }}>{tUI('chartGrade')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testGraderStats.chartRows.map((r) => {
                      const isCurrent = r.wrong === testGraderStats.wrong;
                      return (
                        <tr
                          key={r.wrong}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                            fontWeight: isCurrent ? 700 : 400,
                          }}
                        >
                          <td style={{ padding: '8px 12px', color: '#f87171' }}>
                            -{r.wrong} {isCurrent && '👈'}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-main)' }}>
                            {r.correct} / {testGraderStats.total}
                          </td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>
                            {r.percent.toFixed(1)}%
                          </td>
                          <td style={{ padding: '8px 12px', color: r.color, fontWeight: 700 }}>
                            {r.grade}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Copy Grade Summary Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              width: '100%',
              backgroundColor: copied ? '#059669' : 'rgba(37, 99, 235, 0.12)',
              color: copied ? '#ffffff' : '#3b82f6',
              border: copied ? '1px solid #059669' : '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? tUI('copied') : tUI('copySummary')}
          </button>

          {/* Letter Grade & 4.0 GPA Conversion Reference Chart */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '24px',
              overflowX: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '14px',
              }}
            >
              {tUI('gpaScaleTitle')}
            </h3>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>
                    {tUI('chartGrade')}
                  </th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>
                    {tUI('colGrade')}
                  </th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-main)' }}>4.0 GPA</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_SCALE.map((item, idx) => {
                  const prevMin = idx === 0 ? 100 : GRADE_SCALE[idx - 1].minPercent - 1;
                  const rangeLabel =
                    item.letter === 'F' ? '< 60%' : `${item.minPercent}% – ${prevMin}%`;
                  return (
                    <tr key={item.letter} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: item.color }}>
                        {item.letter}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {rangeLabel}
                      </td>
                      <td
                        style={{
                          padding: '9px 12px',
                          color: 'var(--text-main)',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        {item.gpa.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clean Comparison Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '24px',
              overflowX: 'auto',
            }}
          >
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {tUI('compareTitle')}
            </h3>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 700 }}>
                    {tUI('compareColFeature')}
                  </th>
                  <th style={{ padding: '12px', color: '#60a5fa', fontWeight: 700 }}>VelnoxLabs</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    RogerHub
                  </th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    RapidTables / ezGrader
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow1Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow1Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Roger')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow1Rapid')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow2Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow2Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Roger')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow2Rapid')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow3Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow3Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Roger')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow3Rapid')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {tUI('compareRow4Feature')}
                  </td>
                  <td style={{ padding: '12px', color: '#34d399', fontWeight: 600 }}>
                    {tUI('compareRow4Velnox')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Roger')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {tUI('compareRow4Rapid')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TECHNICAL SEO SECTION */}
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
