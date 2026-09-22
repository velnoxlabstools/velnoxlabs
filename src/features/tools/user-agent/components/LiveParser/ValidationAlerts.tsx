'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileCode,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

export const ValidationAlerts: React.FC = () => {
  const { parsedResult } = useUAParser();

  if (!parsedResult || !parsedResult.rawUA) {
    return null;
  }

  const { validation } = parsedResult;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Validation & Unknown Token Inspector
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {validation.rfcCompliant ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> RFC Standards Compliant
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Non-Standard UA Structure
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Unrecognized Custom Tokens ({validation.unknownTokens.length})
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
            Tokens or custom extension tags in the UA string that do not match standard browser databases.
          </p>
          {validation.unknownTokens.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {validation.unknownTokens.map((tok, i) => (
                <span
                  key={i}
                  className="bg-purple-950/60 border border-purple-800/60 text-purple-300 font-mono text-[11px] px-2 py-1 rounded-md"
                >
                  {tok}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono italic">
              No unrecognized tokens detected. All tokens identified.
            </p>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Anomalies & Warnings ({validation.warnings.length + validation.anomalies.length})
            </h4>
          </div>
          {validation.warnings.length === 0 && validation.anomalies.length === 0 ? (
            <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4" /> Zero structural anomalies or spoofing flags detected.
            </p>
          ) : (
            <ul className="space-y-1.5 text-xs text-amber-300">
              {validation.warnings.map((w, i) => (
                <li key={`w_${i}`} className="flex items-start gap-1.5">
                  <span className="text-amber-400">⚠️</span>
                  <span>{w}</span>
                </li>
              ))}
              {validation.anomalies.map((a, i) => (
                <li key={`a_${i}`} className="flex items-start gap-1.5 text-rose-300">
                  <span className="text-rose-400">🚨</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Raw Token Decomposition</h4>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {validation.rawTokens.map((tok, idx) => (
            <span
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
            >
              {tok}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};