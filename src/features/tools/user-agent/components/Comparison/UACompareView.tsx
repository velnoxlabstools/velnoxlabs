'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import { USER_AGENT_PRESETS } from '../../utils/presets';
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  GitCompare,
} from 'lucide-react';

export const UACompareView: React.FC = () => {
  const {
    compareUA1,
    setCompareUA1,
    compareUA2,
    setCompareUA2,
    comparisonResult,
    swapCompareUAs,
  } = useUAParser();

  const handleSelectPreset1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = USER_AGENT_PRESETS.find((p) => p.id === e.target.value);
    if (selected) setCompareUA1(selected.ua);
  };

  const handleSelectPreset2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = USER_AGENT_PRESETS.find((p) => p.id === e.target.value);
    if (selected) setCompareUA2(selected.ua);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Side-by-Side User-Agent Diff
            </h3>
          </div>
          <button
            onClick={swapCompareUAs}
            className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap Inputs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="compare-ua1" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target User-Agent 1</label>
              <select
                onChange={handleSelectPreset1}
                defaultValue=""
                className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-xs px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="" disabled>Load Preset...</option>
                {USER_AGENT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <textarea
              id="compare-ua1"
              value={compareUA1}
              onChange={(e) => setCompareUA1(e.target.value)}
              rows={3}
              placeholder="Enter first User-Agent string..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="compare-ua2" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target User-Agent 2</label>
              <select
                onChange={handleSelectPreset2}
                defaultValue=""
                className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-xs px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="" disabled>Load Preset...</option>
                {USER_AGENT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <textarea
              id="compare-ua2"
              value={compareUA2}
              onChange={(e) => setCompareUA2(e.target.value)}
              rows={3}
              placeholder="Enter second User-Agent string..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-cyan-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {comparisonResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Comparison Result
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Structural Diff Matrix
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{comparisonResult.similarityScore}% Similarity Score</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Attribute</th>
                  <th className="py-2.5 px-3 font-semibold">Target UA 1</th>
                  <th className="py-2.5 px-3 font-semibold">Target UA 2</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonResult.differences.map((diff, index) => (
                  <tr
                    key={index}
                    className={diff.isMatch ? 'hover:bg-slate-800/30' : 'bg-rose-950/20 hover:bg-rose-950/30'}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-400">{diff.category}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{diff.field}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{diff.val1}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{diff.val2}</td>
                    <td className="py-2.5 px-3 text-center">
                      {diff.isMatch ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Diff
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};