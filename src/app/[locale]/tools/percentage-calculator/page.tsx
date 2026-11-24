'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { GlobalContainer } from '@/components/layout';
import { SectionHeading } from '@/components/ui';
import { ToolSeoContent } from '@/features/tools/sections/ToolSeoContent';

type PrimaryTab = 'general' | 'marks' | 'money' | 'ai';
type GeneralMode = 'of' | 'isWhatPercent' | 'increase' | 'decrease' | 'difference';
type MarksMode = 'quick' | 'table';
type MoneyMode = 'discount' | 'tax' | 'tip' | 'margin';

interface SubjectRow {
  id: string;
  name: string;
  obtained: string;
  max: string;
}

export default function PercentageCalculatorPage() {
  const tUI = useTranslations('ToolUI.percentageCalculator');

  // Primary Tab
  const [activeTab, setActiveTab] = useState<PrimaryTab>('general');

  // Copy states
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedExcel, setCopiedExcel] = useState(false);

  // 1. General Mode State
  const [generalMode, setGeneralMode] = useState<GeneralMode>('of');
  const [genA, setGenA] = useState('15');
  const [genB, setGenB] = useState('200');

  // 2. Marks Mode State
  const [marksMode, setMarksMode] = useState<MarksMode>('quick');
  const [marksObtained, setMarksObtained] = useState('510');
  const [marksTotal, setMarksTotal] = useState('600');
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { id: '1', name: tUI('defaultSubject1'), obtained: '88', max: '100' },
    { id: '2', name: tUI('defaultSubject2'), obtained: '85', max: '100' },
    { id: '3', name: tUI('defaultSubject3'), obtained: '92', max: '100' },
    { id: '4', name: tUI('defaultSubject4'), obtained: '81', max: '100' },
    { id: '5', name: tUI('defaultSubject5'), obtained: '84', max: '100' },
    { id: '6', name: tUI('defaultSubject6'), obtained: '80', max: '100' },
  ]);

  // 3. Money Mode State
  const [moneyMode, setMoneyMode] = useState<MoneyMode>('discount');
  const [currency, setCurrency] = useState('$');
  const [moneyOriginalPrice, setMoneyOriginalPrice] = useState('120');
  const [moneyDiscountRate, setMoneyDiscountRate] = useState('25');
  const [moneyBasePrice, setMoneyBasePrice] = useState('500');
  const [moneyTaxRate, setMoneyTaxRate] = useState('18');
  const [moneyBill, setMoneyBill] = useState('85');
  const [moneyTipRate, setMoneyTipRate] = useState('15');
  const [moneyPeople, setMoneyPeople] = useState('3');
  const [moneyCostPrice, setMoneyCostPrice] = useState('40');
  const [moneySellingPrice, setMoneySellingPrice] = useState('65');

  // 4. AI Mode State
  const [aiPrompt, setAiPrompt] = useState('18% GST on 2500');

  // Helper copy function
  const copyToClipboard = (text: string, isExcel: boolean) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isExcel) {
      setCopiedExcel(true);
      setTimeout(() => setCopiedExcel(false), 2000);
    } else {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  // -------------------------------------------------------------
  // CALCULATIONS: General Mode
  // -------------------------------------------------------------
  const generalResultData = useMemo(() => {
    const numA = parseFloat(genA);
    const numB = parseFloat(genB);
    if (isNaN(numA) || isNaN(numB)) {
      return { result: '', formula: '', steps: '', excelFormula: '' };
    }

    switch (generalMode) {
      case 'of': {
        const res = ((numA / 100) * numB).toFixed(4).replace(/\.?0+$/, '');
        return {
          result: res,
          formula: `(${numA} / 100) × ${numB} = ${res}`,
          steps: `1. Divide percentage by 100: ${numA} / 100 = ${numA / 100}\n2. Multiply by base number: ${numA / 100} × ${numB} = ${res}`,
          excelFormula: `=(A2 * B2) / 100`,
        };
      }
      case 'isWhatPercent': {
        if (numB === 0)
          return { result: tUI('cannotDivideByZero'), formula: '', steps: '', excelFormula: '' };
        const res = ((numA / numB) * 100).toFixed(4).replace(/\.?0+$/, '');
        return {
          result: `${res}%`,
          formula: `(${numA} / ${numB}) × 100 = ${res}%`,
          steps: `1. Ratio: ${numA} / ${numB} = ${(numA / numB).toFixed(6)}\n2. Multiply by 100: ${(numA / numB).toFixed(6)} × 100 = ${res}%`,
          excelFormula: `=(A2 / B2)`,
        };
      }
      case 'increase': {
        if (numA === 0)
          return { result: tUI('cannotDivideByZero'), formula: '', steps: '', excelFormula: '' };
        const diff = numB - numA;
        const res = ((diff / numA) * 100).toFixed(4).replace(/\.?0+$/, '');
        return {
          result: `${res}%`,
          formula: `((${numB} - ${numA}) / ${numA}) × 100 = ${res}%`,
          steps: `1. Absolute Increase: ${numB} - ${numA} = ${diff}\n2. Relative Increase: ${diff} / ${numA} = ${(diff / numA).toFixed(6)}\n3. Convert to Percentage: ${(diff / numA).toFixed(6)} × 100 = ${res}%`,
          excelFormula: `=(B2 - A2) / A2`,
        };
      }
      case 'decrease': {
        if (numA === 0)
          return { result: tUI('cannotDivideByZero'), formula: '', steps: '', excelFormula: '' };
        const diff = numA - numB;
        const res = ((diff / numA) * 100).toFixed(4).replace(/\.?0+$/, '');
        return {
          result: `${res}%`,
          formula: `((${numA} - ${numB}) / ${numA}) × 100 = ${res}%`,
          steps: `1. Absolute Decrease: ${numA} - ${numB} = ${diff}\n2. Relative Decrease: ${diff} / ${numA} = ${(diff / numA).toFixed(6)}\n3. Convert to Percentage: ${(diff / numA).toFixed(6)} × 100 = ${res}%`,
          excelFormula: `=(A2 - B2) / A2`,
        };
      }
      case 'difference': {
        if (numA === 0 && numB === 0) {
          return {
            result: '0%',
            formula: '0%',
            steps: 'Values are identical.',
            excelFormula: '=ABS(A2-B2)/AVERAGE(A2,B2)',
          };
        }
        const diff = Math.abs(numA - numB);
        const avg = (numA + numB) / 2;
        const res = ((diff / avg) * 100).toFixed(4).replace(/\.?0+$/, '');
        return {
          result: `${res}%`,
          formula: `(|${numA} - ${numB}| / ((${numA} + ${numB}) / 2)) × 100 = ${res}%`,
          steps: `1. Absolute Difference: |${numA} - ${numB}| = ${diff}\n2. Average of Both Numbers: (${numA} + ${numB}) / 2 = ${avg}\n3. Percentage Difference: (${diff} / ${avg}) × 100 = ${res}%`,
          excelFormula: `=ABS(A2 - B2) / AVERAGE(A2, B2)`,
        };
      }
    }
  }, [generalMode, genA, genB, tUI]);

  // -------------------------------------------------------------
  // CALCULATIONS: Marks Mode
  // -------------------------------------------------------------
  const getGradeInfo = useCallback(
    (pct: number) => {
      if (pct >= 85) return { grade: tUI('distinctionGrade'), pass: true, color: '#10b981' };
      if (pct >= 70) return { grade: tUI('firstClassGrade'), pass: true, color: '#3b82f6' };
      if (pct >= 50) return { grade: tUI('secondClassGrade'), pass: true, color: '#f59e0b' };
      if (pct >= 35) return { grade: tUI('thirdClassGrade'), pass: true, color: '#6366f1' };
      return { grade: tUI('failGrade'), pass: false, color: '#ef4444' };
    },
    [tUI]
  );

  const marksQuickData = useMemo(() => {
    const obt = parseFloat(marksObtained);
    const tot = parseFloat(marksTotal);
    if (isNaN(obt) || isNaN(tot) || tot <= 0) {
      return { result: '', formula: '', steps: '', gradeInfo: null, excelFormula: '' };
    }
    const pct = (obt / tot) * 100;
    const res = pct.toFixed(2) + '%';
    const gradeInfo = getGradeInfo(pct);
    return {
      result: res,
      formula: `(${obt} / ${tot}) × 100 = ${res}`,
      steps: `1. Divide marks obtained by maximum marks: ${obt} / ${tot} = ${(obt / tot).toFixed(4)}\n2. Multiply by 100: ${(obt / tot).toFixed(4)} × 100 = ${res}\n3. Overall Assessment: ${gradeInfo.grade}`,
      gradeInfo,
      excelFormula: `=(A2 / B2)`,
    };
  }, [marksObtained, marksTotal, getGradeInfo]);

  const marksTableData = useMemo(() => {
    let sumObtained = 0;
    let sumMax = 0;
    let hasFailSubject = false;

    for (const sub of subjects) {
      const obt = parseFloat(sub.obtained) || 0;
      const max = parseFloat(sub.max) || 0;
      sumObtained += obt;
      sumMax += max;
      if (max > 0 && (obt / max) * 100 < 35) {
        hasFailSubject = true;
      }
    }

    if (sumMax <= 0)
      return { totalObt: 0, totalMax: 0, percent: '0%', gradeInfo: null, excelFormula: '' };
    const pct = (sumObtained / sumMax) * 100;
    const res = pct.toFixed(2) + '%';
    const gradeInfo = getGradeInfo(pct);
    if (hasFailSubject) {
      gradeInfo.pass = false;
      gradeInfo.grade = `${gradeInfo.grade} (${tUI('statusFail')})`;
    }

    return {
      totalObt: sumObtained,
      totalMax: sumMax,
      percent: res,
      gradeInfo,
      excelFormula: `=SUM(B2:B${subjects.length + 1}) / SUM(C2:C${subjects.length + 1})`,
    };
  }, [subjects, getGradeInfo, tUI]);

  // Subject Table Handlers
  const handleSubjectChange = (id: string, field: 'name' | 'obtained' | 'max', value: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleAddSubject = () => {
    const newId = String(Date.now());
    setSubjects((prev) => [
      ...prev,
      { id: newId, name: `${tUI('subjectName')} ${prev.length + 1}`, obtained: '75', max: '100' },
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplySslcPreset = () => {
    setSubjects([
      { id: '1', name: tUI('defaultSubject1'), obtained: '88', max: '100' },
      { id: '2', name: tUI('defaultSubject2'), obtained: '85', max: '100' },
      { id: '3', name: tUI('defaultSubject3'), obtained: '92', max: '100' },
      { id: '4', name: tUI('defaultSubject4'), obtained: '81', max: '100' },
      { id: '5', name: tUI('defaultSubject5'), obtained: '84', max: '100' },
      { id: '6', name: tUI('defaultSubject6'), obtained: '80', max: '100' },
    ]);
  };

  const handleApplyCbsePreset = () => {
    setSubjects([
      { id: '1', name: tUI('defaultSubject1'), obtained: '88', max: '100' },
      { id: '2', name: tUI('defaultSubject2'), obtained: '85', max: '100' },
      { id: '3', name: tUI('defaultSubject3'), obtained: '92', max: '100' },
      { id: '4', name: tUI('defaultSubject4'), obtained: '81', max: '100' },
      { id: '5', name: tUI('defaultSubject5'), obtained: '84', max: '100' },
    ]);
  };

  // -------------------------------------------------------------
  // CALCULATIONS: Money Mode
  // -------------------------------------------------------------
  const moneyResultData = useMemo(() => {
    switch (moneyMode) {
      case 'discount': {
        const price = parseFloat(moneyOriginalPrice) || 0;
        const discRate = parseFloat(moneyDiscountRate) || 0;
        const youSave = (price * discRate) / 100;
        const finalPrice = Math.max(0, price - youSave);
        return {
          mainResult: `${currency}${finalPrice.toFixed(2)}`,
          subResult: `${tUI('youSave')}: ${currency}${youSave.toFixed(2)}`,
          formula: `${currency}${price} × (1 - ${discRate}/100) = ${currency}${finalPrice.toFixed(2)}`,
          steps: `1. Discount Amount: (${currency}${price} × ${discRate}) / 100 = ${currency}${youSave.toFixed(2)}\n2. Discounted Total: ${currency}${price} - ${currency}${youSave.toFixed(2)} = ${currency}${finalPrice.toFixed(2)}`,
          excelFormula: `=A2 * (1 - B2/100)`,
        };
      }
      case 'tax': {
        const base = parseFloat(moneyBasePrice) || 0;
        const rate = parseFloat(moneyTaxRate) || 0;
        const taxAmt = (base * rate) / 100;
        const total = base + taxAmt;
        return {
          mainResult: `${currency}${total.toFixed(2)}`,
          subResult: `${tUI('taxAmount')}: ${currency}${taxAmt.toFixed(2)}`,
          formula: `${currency}${base} × (1 + ${rate}/100) = ${currency}${total.toFixed(2)}`,
          steps: `1. Tax Calculation: (${currency}${base} × ${rate}) / 100 = ${currency}${taxAmt.toFixed(2)}\n2. Final Amount: ${currency}${base} + ${currency}${taxAmt.toFixed(2)} = ${currency}${total.toFixed(2)}`,
          excelFormula: `=A2 * (1 + B2/100)`,
        };
      }
      case 'tip': {
        const bill = parseFloat(moneyBill) || 0;
        const tipPct = parseFloat(moneyTipRate) || 0;
        const numPpl = Math.max(1, parseInt(moneyPeople, 10) || 1);
        const tipAmt = (bill * tipPct) / 100;
        const total = bill + tipAmt;
        const perPerson = total / numPpl;
        return {
          mainResult: `${currency}${perPerson.toFixed(2)} / ${tUI('perPerson')}`,
          subResult: `${tUI('tipAmount')}: ${currency}${tipAmt.toFixed(2)} | ${tUI('totalWithTax')}: ${currency}${total.toFixed(2)}`,
          formula: `(${currency}${bill} + ${currency}${tipAmt.toFixed(2)}) / ${numPpl} = ${currency}${perPerson.toFixed(2)}`,
          steps: `1. Total Tip: (${currency}${bill} × ${tipPct}) / 100 = ${currency}${tipAmt.toFixed(2)}\n2. Combined Bill: ${currency}${bill} + ${currency}${tipAmt.toFixed(2)} = ${currency}${total.toFixed(2)}\n3. Per Person Split: ${currency}${total.toFixed(2)} / ${numPpl} = ${currency}${perPerson.toFixed(2)}`,
          excelFormula: `=(A2 * (1 + B2/100)) / C2`,
        };
      }
      case 'margin': {
        const cost = parseFloat(moneyCostPrice) || 0;
        const selling = parseFloat(moneySellingPrice) || 0;
        const profit = selling - cost;
        const margin = selling > 0 ? (profit / selling) * 100 : 0;
        const markup = cost > 0 ? (profit / cost) * 100 : 0;
        return {
          mainResult: `${margin.toFixed(2)}% ${tUI('profitMargin')}`,
          subResult: `${tUI('profitAmount')}: ${currency}${profit.toFixed(2)} | ${tUI('markupPercent')}: ${markup.toFixed(2)}%`,
          formula: `Margin: ((${selling} - ${cost}) / ${selling}) × 100 = ${margin.toFixed(2)}%`,
          steps: `1. Gross Profit: ${currency}${selling} - ${currency}${cost} = ${currency}${profit.toFixed(2)}\n2. Profit Margin: (${currency}${profit.toFixed(2)} / ${currency}${selling}) × 100 = ${margin.toFixed(2)}%\n3. Markup on Cost: (${currency}${profit.toFixed(2)} / ${currency}${cost}) × 100 = ${markup.toFixed(2)}%`,
          excelFormula: `Margin: =(B2-A2)/B2  |  Markup: =(B2-A2)/A2`,
        };
      }
    }
  }, [
    moneyMode,
    currency,
    moneyOriginalPrice,
    moneyDiscountRate,
    moneyBasePrice,
    moneyTaxRate,
    moneyBill,
    moneyTipRate,
    moneyPeople,
    moneyCostPrice,
    moneySellingPrice,
    tUI,
  ]);

  // -------------------------------------------------------------
  // CALCULATIONS: AI Smart Solver
  // -------------------------------------------------------------
  const aiResultData = useMemo(() => {
    const raw = aiPrompt.toLowerCase().trim();
    if (!raw) return null;

    // Pattern 1: Tax / GST (e.g., "18% GST on 2500" or "tax 10% on 150")
    const taxMatch =
      raw.match(
        /(\d+(?:\.\d+)?)\s*%\s*(?:gst|tax|vat)?\s*(?:on|of)?\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i
      ) ||
      raw.match(
        /(?:gst|tax|vat)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:on|of)?\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i
      );
    if (taxMatch && (raw.includes('gst') || raw.includes('tax') || raw.includes('vat'))) {
      const rate = parseFloat(taxMatch[1]);
      const base = parseFloat(taxMatch[2]);
      const taxAmt = (base * rate) / 100;
      const total = base + taxAmt;
      return {
        intent: `${tUI('moneyModeTax')} (${rate}%)`,
        result: `${total.toFixed(2)}`,
        explanation: `${tUI('taxAmount')}: ${taxAmt.toFixed(2)} | ${tUI('totalWithTax')}: ${total.toFixed(2)}`,
        formula: `${base} × (1 + ${rate}/100) = ${total.toFixed(2)}`,
        steps: `1. Calculate tax: (${base} × ${rate}) / 100 = ${taxAmt.toFixed(2)}\n2. Add to base: ${base} + ${taxAmt.toFixed(2)} = ${total.toFixed(2)}`,
        excelFormula: `=A2 * (1 + B2/100)`,
      };
    }

    // Pattern 2: Marks (e.g., "scored 540 out of 600" or "510/600 in sslc" or "marks 450 out of 500")
    const marksMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/|\s+of\s+)\s*(\d+(?:\.\d+)?)/i);
    if (
      marksMatch &&
      (raw.includes('score') ||
        raw.includes('mark') ||
        raw.includes('sslc') ||
        raw.includes('cbse') ||
        raw.includes('exam') ||
        raw.includes('out of'))
    ) {
      const obt = parseFloat(marksMatch[1]);
      const tot = parseFloat(marksMatch[2]);
      if (tot > 0) {
        const pct = (obt / tot) * 100;
        const gradeInfo = getGradeInfo(pct);
        return {
          intent: `${tUI('tabMarks')} (${obt} / ${tot})`,
          result: `${pct.toFixed(2)}%`,
          explanation: `${tUI('gradeLabel')} ${gradeInfo.grade}`,
          formula: `(${obt} / ${tot}) × 100 = ${pct.toFixed(2)}%`,
          steps: `1. Ratio: ${obt} / ${tot} = ${(obt / tot).toFixed(4)}\n2. Multiply by 100: ${(obt / tot).toFixed(4)} × 100 = ${pct.toFixed(2)}%\n3. Academic Rating: ${gradeInfo.grade}`,
          excelFormula: `=(A2 / B2)`,
        };
      }
    }

    // Pattern 3: Discount (e.g., "30% discount on 150" or "20% off $80")
    const discountMatch = raw.match(
      /(\d+(?:\.\d+)?)\s*%\s*(?:discount|off)?\s*(?:on|of)?\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i
    );
    if (
      discountMatch &&
      (raw.includes('discount') ||
        raw.includes('off') ||
        raw.includes('sale') ||
        raw.includes('save'))
    ) {
      const rate = parseFloat(discountMatch[1]);
      const price = parseFloat(discountMatch[2]);
      const save = (price * rate) / 100;
      const finalPrice = Math.max(0, price - save);
      return {
        intent: `${tUI('moneyModeDiscount')} (${rate}%)`,
        result: `${finalPrice.toFixed(2)}`,
        explanation: `${tUI('youSave')}: ${save.toFixed(2)}`,
        formula: `${price} × (1 - ${rate}/100) = ${finalPrice.toFixed(2)}`,
        steps: `1. Calculate savings: (${price} × ${rate}) / 100 = ${save.toFixed(2)}\n2. Final price: ${price} - ${save.toFixed(2)} = ${finalPrice.toFixed(2)}`,
        excelFormula: `=A2 * (1 - B2/100)`,
      };
    }

    // Pattern 4: Salary increase / Hike from A to B (e.g., "salary increased from 50000 to 65000")
    const hikeMatch = raw.match(
      /from\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)\s*to\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i
    );
    if (hikeMatch) {
      const a = parseFloat(hikeMatch[1]);
      const b = parseFloat(hikeMatch[2]);
      if (a > 0) {
        const diff = b - a;
        const pct = (diff / a) * 100;
        return {
          intent: diff >= 0 ? tUI('modeIncrease') : tUI('modeDecrease'),
          result: `${pct.toFixed(2)}%`,
          explanation: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} change`,
          formula: `((${b} - ${a}) / ${a}) × 100 = ${pct.toFixed(2)}%`,
          steps: `1. Change: ${b} - ${a} = ${diff}\n2. Relative to base: ${diff} / ${a} = ${(diff / a).toFixed(6)}\n3. Percentage: ${(diff / a).toFixed(6)} × 100 = ${pct.toFixed(2)}%`,
          excelFormula: `=(B2 - A2) / A2`,
        };
      }
    }

    // Pattern 5: Percentage difference between A and B
    const diffMatch = raw.match(
      /between\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)\s*and\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i
    );
    if (diffMatch && raw.includes('diff')) {
      const a = parseFloat(diffMatch[1]);
      const b = parseFloat(diffMatch[2]);
      const diff = Math.abs(a - b);
      const avg = (a + b) / 2;
      const pct = avg > 0 ? (diff / avg) * 100 : 0;
      return {
        intent: tUI('modeDifference'),
        result: `${pct.toFixed(2)}%`,
        explanation: `|${a} - ${b}| relative to average ${avg}`,
        formula: `(|${a} - ${b}| / ((${a} + ${b}) / 2)) × 100 = ${pct.toFixed(2)}%`,
        steps: `1. Absolute gap: |${a} - ${b}| = ${diff}\n2. Average: (${a} + ${b}) / 2 = ${avg}\n3. Difference percentage: (${diff} / ${avg}) × 100 = ${pct.toFixed(2)}%`,
        excelFormula: `=ABS(A2 - B2) / AVERAGE(A2, B2)`,
      };
    }

    // Pattern 6: Standard "X% of Y"
    const generalMatch = raw.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*[$€£₹¥₩]?\s*(\d+(?:\.\d+)?)/i);
    if (generalMatch) {
      const p = parseFloat(generalMatch[1]);
      const n = parseFloat(generalMatch[2]);
      const res = ((p / 100) * n).toFixed(4).replace(/\.?0+$/, '');
      return {
        intent: `${p}% of ${n}`,
        result: res,
        explanation: `${p}% of ${n}`,
        formula: `(${p} / 100) × ${n} = ${res}`,
        steps: `1. Decimal equivalent: ${p} / 100 = ${p / 100}\n2. Multiply: ${p / 100} × ${n} = ${res}`,
        excelFormula: `=(A2 * B2) / 100`,
      };
    }

    return null;
  }, [aiPrompt, getGradeInfo, tUI]);

  // Labels for General Mode
  const getGeneralLabels = () => {
    switch (generalMode) {
      case 'of':
        return { a: tUI('percentageLabel'), b: tUI('ofNumberLabel'), prefix: tUI('resultPrefix') };
      case 'isWhatPercent':
        return {
          a: tUI('firstNumberLabel'),
          b: tUI('secondNumberLabel'),
          prefix: tUI('isWhatPercentPrefix'),
        };
      case 'increase':
        return {
          a: tUI('originalValueLabel'),
          b: tUI('newValueLabel'),
          prefix: tUI('increasePrefix'),
        };
      case 'decrease':
        return {
          a: tUI('originalValueLabel'),
          b: tUI('newValueLabel'),
          prefix: tUI('decreasePrefix'),
        };
      case 'difference':
        return {
          a: tUI('firstValueLabel'),
          b: tUI('secondValueLabel'),
          prefix: tUI('differencePrefix'),
        };
    }
  };

  const generalLabels = getGeneralLabels();

  return (
    <>
      <GlobalContainer maxWidth="2xl">
        <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
          <SectionHeading title={tUI('title')} subtitle={tUI('subtitle')} />

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              marginTop: 'var(--space-6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {/* Primary Navigation Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              {[
                { key: 'general' as PrimaryTab, label: tUI('tabGeneral'), icon: '📐' },
                { key: 'marks' as PrimaryTab, label: tUI('tabMarks'), icon: '🎓' },
                { key: 'money' as PrimaryTab, label: tUI('tabMoney'), icon: '💰' },
                { key: 'ai' as PrimaryTab, label: tUI('tabAi'), icon: '🤖' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor:
                      activeTab === tab.key ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                    color: activeTab === tab.key ? '#60a5fa' : 'var(--text-muted)',
                    border:
                      activeTab === tab.key
                        ? '1px solid rgba(59, 130, 246, 0.6)'
                        : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ========================================================= */}
            {/* TAB 1: GENERAL MATHEMATICAL CALCULATOR                    */}
            {/* ========================================================= */}
            {activeTab === 'general' && (
              <div>
                {/* General Sub-mode Tabs */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}
                >
                  {[
                    { key: 'of' as GeneralMode, label: tUI('modeOf') },
                    { key: 'isWhatPercent' as GeneralMode, label: tUI('modeIsWhatPercent') },
                    { key: 'increase' as GeneralMode, label: tUI('modeIncrease') },
                    { key: 'decrease' as GeneralMode, label: tUI('modeDecrease') },
                    { key: 'difference' as GeneralMode, label: tUI('modeDifference') },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setGeneralMode(m.key)}
                      style={{
                        backgroundColor:
                          generalMode === m.key ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                        color: generalMode === m.key ? '#60a5fa' : 'var(--text-muted)',
                        border:
                          generalMode === m.key
                            ? '1px solid rgba(59, 130, 246, 0.5)'
                            : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Inputs */}
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
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {generalLabels.a}:
                    </label>
                    <input
                      type="number"
                      value={genA}
                      onChange={(e) => setGenA(e.target.value)}
                      placeholder={tUI('enterValue')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px 14px',
                        fontSize: '1.1rem',
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
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      {generalLabels.b}:
                    </label>
                    <input
                      type="number"
                      value={genB}
                      onChange={(e) => setGenB(e.target.value)}
                      placeholder={tUI('enterValue')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        padding: '12px 14px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>

                {/* Main Result Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      color: '#93c5fd',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px',
                    }}
                  >
                    {generalLabels.prefix}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                    }}
                  >
                    {generalResultData.result || '—'}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(generalResultData.result, false)}
                  style={{
                    width: '100%',
                    backgroundColor: copiedResult
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copiedResult ? '#34d399' : '#60a5fa',
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
                  {copiedResult ? tUI('copied') : tUI('copyResult')}
                </button>

                {/* Common Presets */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginBottom: '10px',
                    }}
                  >
                    {tUI('commonExamples')}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { a: '15', b: '200', label: tUI('example1') },
                      { a: '20', b: '150', label: tUI('example2') },
                      { a: '10', b: '100', label: tUI('example3') },
                      { a: '25', b: '80', label: tUI('example4') },
                    ].map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setGeneralMode('of');
                          setGenA(ex.a);
                          setGenB(ex.b);
                        }}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '20px',
                          padding: '5px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Breakdown */}
                {generalResultData.steps && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        marginBottom: '8px',
                      }}
                    >
                      📐 {tUI('stepByStepTitle')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                      }}
                    >
                      <strong>{tUI('formulaLabel')}</strong>{' '}
                      <code
                        style={{
                          color: '#38bdf8',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {generalResultData.formula}
                      </code>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                      }}
                    >
                      {generalResultData.steps}
                    </pre>
                  </div>
                )}

                {/* Excel Formula Box */}
                {generalResultData.excelFormula && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                        📊 {tUI('excelFormulaTitle')}
                      </span>
                      <button
                        onClick={() => copyToClipboard(generalResultData.excelFormula, true)}
                        style={{
                          backgroundColor: copiedExcel
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedExcel ? tUI('excelFormulaCopied') : tUI('copyExcelFormula')}
                      </button>
                    </div>
                    <code
                      style={{
                        display: 'block',
                        backgroundColor: 'var(--bg-page)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      {generalResultData.excelFormula}
                    </code>
                    <div
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}
                    >
                      {tUI('excelFormulaHint')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: MARKS & SSLC EXAM CALCULATOR                      */}
            {/* ========================================================= */}
            {activeTab === 'marks' && (
              <div>
                {/* Sub-modes: Quick vs Subject Table */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setMarksMode('quick')}
                    style={{
                      backgroundColor:
                        marksMode === 'quick' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                      color: marksMode === 'quick' ? '#60a5fa' : 'var(--text-muted)',
                      border:
                        marksMode === 'quick'
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('marksModeQuick')}
                  </button>
                  <button
                    onClick={() => setMarksMode('table')}
                    style={{
                      backgroundColor:
                        marksMode === 'table' ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-page)',
                      color: marksMode === 'table' ? '#60a5fa' : 'var(--text-muted)',
                      border:
                        marksMode === 'table'
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tUI('marksModeSubjects')}
                  </button>
                </div>

                {/* Sub-mode A: Quick Total Marks */}
                {marksMode === 'quick' && (
                  <div>
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
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '8px',
                          }}
                        >
                          {tUI('marksObtained')}:
                        </label>
                        <input
                          type="number"
                          value={marksObtained}
                          onChange={(e) => setMarksObtained(e.target.value)}
                          placeholder="e.g. 510"
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '12px 14px',
                            fontSize: '1.1rem',
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
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: '8px',
                          }}
                        >
                          {tUI('totalMarks')}:
                        </label>
                        <input
                          type="number"
                          value={marksTotal}
                          onChange={(e) => setMarksTotal(e.target.value)}
                          placeholder="e.g. 600"
                          style={{
                            width: '100%',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-main)',
                            padding: '12px 14px',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            outline: 'none',
                            fontFamily: 'monospace',
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Marks Result */}
                    <div
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          color: '#93c5fd',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('marksResultPrefix')}
                      </div>
                      <div
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                        }}
                      >
                        {marksQuickData.result || '—'}
                      </div>
                      {marksQuickData.gradeInfo && (
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'inline-block',
                            backgroundColor: marksQuickData.gradeInfo.color + '22',
                            color: marksQuickData.gradeInfo.color,
                            border: `1px solid ${marksQuickData.gradeInfo.color}55`,
                            borderRadius: '20px',
                            padding: '4px 14px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {marksQuickData.gradeInfo.grade}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(marksQuickData.result, false)}
                      style={{
                        width: '100%',
                        backgroundColor: copiedResult
                          ? 'rgba(16, 185, 129, 0.25)'
                          : 'rgba(59, 130, 246, 0.15)',
                        color: copiedResult ? '#34d399' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginBottom: '16px',
                      }}
                    >
                      {copiedResult ? tUI('copied') : tUI('copyResult')}
                    </button>

                    {/* Step-by-Step for Marks */}
                    {marksQuickData.steps && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          padding: '16px',
                          marginBottom: '16px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#60a5fa',
                            marginBottom: '8px',
                          }}
                        >
                          📐 {tUI('stepByStepTitle')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-main)',
                            marginBottom: '8px',
                          }}
                        >
                          <strong>{tUI('formulaLabel')}</strong>{' '}
                          <code
                            style={{
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {marksQuickData.formula}
                          </code>
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6,
                            fontFamily: 'monospace',
                          }}
                        >
                          {marksQuickData.steps}
                        </pre>
                      </div>
                    )}

                    {/* Excel Box */}
                    {marksQuickData.excelFormula && (
                      <div
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '10px',
                          padding: '16px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                            📊 {tUI('excelFormulaTitle')}
                          </span>
                          <button
                            onClick={() => copyToClipboard(marksQuickData.excelFormula, true)}
                            style={{
                              backgroundColor: copiedExcel
                                ? 'rgba(16, 185, 129, 0.4)'
                                : 'rgba(16, 185, 129, 0.2)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {copiedExcel ? tUI('excelFormulaCopied') : tUI('copyExcelFormula')}
                          </button>
                        </div>
                        <code
                          style={{
                            display: 'block',
                            backgroundColor: 'var(--bg-page)',
                            padding: '10px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                          }}
                        >
                          {marksQuickData.excelFormula}
                        </code>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: '6px',
                          }}
                        >
                          {tUI('excelFormulaHint')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-mode B: Subject-wise SSLC Table */}
                {marksMode === 'table' && (
                  <div>
                    {/* Presets */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <button
                        onClick={handleApplySslcPreset}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ {tUI('sslcPreset')}
                      </button>
                      <button
                        onClick={handleApplyCbsePreset}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ {tUI('cbsePreset')}
                      </button>
                    </div>

                    {/* Table */}
                    <div
                      style={{
                        overflowX: 'auto',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: 'var(--bg-page)',
                              borderBottom: '1px solid var(--border-color)',
                            }}
                          >
                            <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                              {tUI('subjectName')}
                            </th>
                            <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                              {tUI('marksObtained')}
                            </th>
                            <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                              {tUI('maxMarks')}
                            </th>
                            <th
                              style={{
                                padding: '10px 14px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                              }}
                            >
                              —
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((sub) => (
                            <tr
                              key={sub.id}
                              style={{ borderBottom: '1px solid var(--border-color)' }}
                            >
                              <td style={{ padding: '8px 14px' }}>
                                <input
                                  type="text"
                                  value={sub.name}
                                  onChange={(e) =>
                                    handleSubjectChange(sub.id, 'name', e.target.value)
                                  }
                                  style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    fontWeight: 600,
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px 14px' }}>
                                <input
                                  type="number"
                                  value={sub.obtained}
                                  onChange={(e) =>
                                    handleSubjectChange(sub.id, 'obtained', e.target.value)
                                  }
                                  style={{
                                    width: '80px',
                                    backgroundColor: 'var(--bg-page)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-main)',
                                    padding: '6px 8px',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px 14px' }}>
                                <input
                                  type="number"
                                  value={sub.max}
                                  onChange={(e) =>
                                    handleSubjectChange(sub.id, 'max', e.target.value)
                                  }
                                  style={{
                                    width: '80px',
                                    backgroundColor: 'var(--bg-page)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    color: 'var(--text-main)',
                                    padding: '6px 8px',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleRemoveSubject(sub.id)}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={handleAddSubject}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        color: '#60a5fa',
                        border: '1px dashed rgba(59, 130, 246, 0.5)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '16px',
                        width: '100%',
                      }}
                    >
                      {tUI('addSubject')}
                    </button>

                    {/* Table Result Card */}
                    <div
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          color: '#93c5fd',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          marginBottom: '4px',
                        }}
                      >
                        {tUI('marksResultPrefix')} {marksTableData.totalObt} /{' '}
                        {marksTableData.totalMax}
                      </div>
                      <div
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          marginBottom: '8px',
                        }}
                      >
                        {marksTableData.percent}
                      </div>
                      {marksTableData.gradeInfo && (
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: marksTableData.gradeInfo.color + '22',
                            color: marksTableData.gradeInfo.color,
                            border: `1px solid ${marksTableData.gradeInfo.color}55`,
                            borderRadius: '20px',
                            padding: '4px 14px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {marksTableData.gradeInfo.grade}
                        </div>
                      )}
                    </div>

                    {/* Table Excel Box */}
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                          📊 {tUI('excelFormulaTitle')}
                        </span>
                        <button
                          onClick={() => copyToClipboard(marksTableData.excelFormula, true)}
                          style={{
                            backgroundColor: copiedExcel
                              ? 'rgba(16, 185, 129, 0.4)'
                              : 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedExcel ? tUI('excelFormulaCopied') : tUI('copyExcelFormula')}
                        </button>
                      </div>
                      <code
                        style={{
                          display: 'block',
                          backgroundColor: 'var(--bg-page)',
                          padding: '10px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        {marksTableData.excelFormula}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: MONEY & BUSINESS CALCULATOR                       */}
            {/* ========================================================= */}
            {activeTab === 'money' && (
              <div>
                {/* Money Sub-mode Tabs & Currency Selector */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'discount' as MoneyMode, label: tUI('moneyModeDiscount') },
                      { key: 'tax' as MoneyMode, label: tUI('moneyModeTax') },
                      { key: 'tip' as MoneyMode, label: tUI('moneyModeTip') },
                      { key: 'margin' as MoneyMode, label: tUI('moneyModeMargin') },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setMoneyMode(m.key)}
                        style={{
                          backgroundColor:
                            moneyMode === m.key ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-page)',
                          color: moneyMode === m.key ? '#60a5fa' : 'var(--text-muted)',
                          border:
                            moneyMode === m.key
                              ? '1px solid rgba(59, 130, 246, 0.5)'
                              : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Currency Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tUI('currencyLabel')}
                    </span>
                    {['$', '€', '£', '₹', '¥', '₩'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        style={{
                          backgroundColor: currency === c ? '#3b82f6' : 'var(--bg-page)',
                          color: currency === c ? '#fff' : 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-mode 1: Discount */}
                {moneyMode === 'discount' && (
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
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('originalPrice')} ({currency}):
                      </label>
                      <input
                        type="number"
                        value={moneyOriginalPrice}
                        onChange={(e) => setMoneyOriginalPrice(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
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
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('discountPercent')}:
                      </label>
                      <input
                        type="number"
                        value={moneyDiscountRate}
                        onChange={(e) => setMoneyDiscountRate(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-mode 2: Tax / GST */}
                {moneyMode === 'tax' && (
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
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('originalPrice')} ({currency}):
                      </label>
                      <input
                        type="number"
                        value={moneyBasePrice}
                        onChange={(e) => setMoneyBasePrice(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
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
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('taxRate')}:
                      </label>
                      <input
                        type="number"
                        value={moneyTaxRate}
                        onChange={(e) => setMoneyTaxRate(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-mode 3: Tip & Split */}
                {moneyMode === 'tip' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('billAmount')} ({currency}):
                      </label>
                      <input
                        type="number"
                        value={moneyBill}
                        onChange={(e) => setMoneyBill(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
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
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('tipPercent')}:
                      </label>
                      <input
                        type="number"
                        value={moneyTipRate}
                        onChange={(e) => setMoneyTipRate(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
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
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('numberOfPeople')}:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={moneyPeople}
                        onChange={(e) => setMoneyPeople(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-mode 4: Margin & Markup */}
                {moneyMode === 'margin' && (
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
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('costPrice')} ({currency}):
                      </label>
                      <input
                        type="number"
                        value={moneyCostPrice}
                        onChange={(e) => setMoneyCostPrice(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
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
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('sellingPrice')} ({currency}):
                      </label>
                      <input
                        type="number"
                        value={moneySellingPrice}
                        onChange={(e) => setMoneySellingPrice(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          padding: '12px 14px',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Money Result Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      color: '#93c5fd',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    {moneyResultData.subResult}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-main)',
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                    }}
                  >
                    {moneyResultData.mainResult}
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(moneyResultData.mainResult, false)}
                  style={{
                    width: '100%',
                    backgroundColor: copiedResult
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: copiedResult ? '#34d399' : '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: '16px',
                  }}
                >
                  {copiedResult ? tUI('copied') : tUI('copyResult')}
                </button>

                {/* Money Step-by-Step */}
                {moneyResultData.steps && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        marginBottom: '8px',
                      }}
                    >
                      📐 {tUI('stepByStepTitle')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        marginBottom: '8px',
                      }}
                    >
                      <strong>{tUI('formulaLabel')}</strong>{' '}
                      <code
                        style={{
                          color: '#38bdf8',
                          backgroundColor: 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {moneyResultData.formula}
                      </code>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                      }}
                    >
                      {moneyResultData.steps}
                    </pre>
                  </div>
                )}

                {/* Money Excel Box */}
                {moneyResultData.excelFormula && (
                  <div
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      padding: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                        📊 {tUI('excelFormulaTitle')}
                      </span>
                      <button
                        onClick={() => copyToClipboard(moneyResultData.excelFormula, true)}
                        style={{
                          backgroundColor: copiedExcel
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedExcel ? tUI('excelFormulaCopied') : tUI('copyExcelFormula')}
                      </button>
                    </div>
                    <code
                      style={{
                        display: 'block',
                        backgroundColor: 'var(--bg-page)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      {moneyResultData.excelFormula}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: AI SMART PROMPT SOLVER                            */}
            {/* ========================================================= */}
            {activeTab === 'ai' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      marginBottom: '4px',
                    }}
                  >
                    🤖 {tUI('aiTitle')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {tUI('aiSubtitle')}
                  </div>
                </div>

                {/* AI Input Field */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={tUI('aiPlaceholder')}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      padding: '12px 14px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {}}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tUI('aiSolveButton')}
                  </button>
                </div>

                {/* Quick Prompts */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}
                >
                  {[
                    tUI('aiPrompt1'),
                    tUI('aiPrompt2'),
                    tUI('aiPrompt3'),
                    tUI('aiPrompt4'),
                    tUI('aiPrompt5'),
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setAiPrompt(p)}
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✨ {p}
                    </button>
                  ))}
                </div>

                {/* AI Solved Result */}
                {aiResultData ? (
                  <div>
                    <div
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '20px',
                          padding: '3px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          marginBottom: '8px',
                        }}
                      >
                        {tUI('aiDetectedIntent')} {aiResultData.intent}
                      </div>
                      <div
                        style={{
                          color: 'var(--text-main)',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          marginBottom: '4px',
                        }}
                      >
                        {aiResultData.result}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {aiResultData.explanation}
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(aiResultData.result, false)}
                      style={{
                        width: '100%',
                        backgroundColor: copiedResult
                          ? 'rgba(16, 185, 129, 0.25)'
                          : 'rgba(59, 130, 246, 0.15)',
                        color: copiedResult ? '#34d399' : '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginBottom: '16px',
                      }}
                    >
                      {copiedResult ? tUI('copied') : tUI('copyResult')}
                    </button>

                    {/* AI Breakdown */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '16px',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#60a5fa',
                          marginBottom: '8px',
                        }}
                      >
                        📐 {tUI('stepByStepTitle')}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          marginBottom: '8px',
                        }}
                      >
                        <strong>{tUI('formulaLabel')}</strong>{' '}
                        <code
                          style={{
                            color: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {aiResultData.formula}
                        </code>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.6,
                          fontFamily: 'monospace',
                        }}
                      >
                        {aiResultData.steps}
                      </pre>
                    </div>

                    {/* AI Excel Box */}
                    <div
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '10px',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                          📊 {tUI('excelFormulaTitle')}
                        </span>
                        <button
                          onClick={() => copyToClipboard(aiResultData.excelFormula, true)}
                          style={{
                            backgroundColor: copiedExcel
                              ? 'rgba(16, 185, 129, 0.4)'
                              : 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedExcel ? tUI('excelFormulaCopied') : tUI('copyExcelFormula')}
                        </button>
                      </div>
                      <code
                        style={{
                          display: 'block',
                          backgroundColor: 'var(--bg-page)',
                          padding: '10px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        {aiResultData.excelFormula}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '10px',
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {tUI('aiUnrecognized')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Centralized SEO & JSON-LD Graph */}
          <ToolSeoContent
            toolSlug="percentage-calculator"
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
