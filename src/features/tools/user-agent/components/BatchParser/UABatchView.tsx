'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  Layers,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export const UABatchView: React.FC = () => {
  const {
    batchInput,
    setBatchInput,
    batchItems,
    processBatchParsing,
    clearBatch,
    openExportModal,
  } = useUAParser();

  const handleProcess = () => {
    processBatchParsing();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Bulk / Batch User-Agent Parser
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Paste multiple User-Agent strings (one per line) for automated batch extraction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleProcess}
              disabled={!batchInput.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-900 dark:text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Parse Batch</span>
            </button>
            <button
              onClick={clearBatch}
              disabled={!batchInput.trim() && batchItems.length === 0}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-400 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          placeholder="Paste User-Agent list here...&#10;Mozilla/5.0 (Windows NT 10.0; Win64; x64)...&#10;Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)..."
          rows={6}
          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-mono text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-y"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
          <span>Total Lines: {batchInput.split('\n').filter((l) => l.trim().length > 0).length}</span>
          <span>Processed Results: {batchItems.length}</span>
        </div>
      </div>

      {batchItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Batch Processing Results</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Processed Records ({batchItems.length})
              </h4>
            </div>

            <button
              onClick={() => openExportModal('batch')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Batch Data</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-3 font-semibold">Browser & Engine</th>
                  <th className="py-2.5 px-3 font-semibold">Platform / OS</th>
                  <th className="py-2.5 px-3 font-semibold">Device</th>
                  <th className="py-2.5 px-3 font-semibold">Bot Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batchItems.map((item, index) => {
                  const p = item.parsed;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-cyan-300">{p.browser.name} {p.browser.version}</div>
                        <div className="text-[10px] text-slate-500">{p.engine.name}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{p.os.name} {p.os.version}</div>
                        <div className="text-[10px] text-slate-500">{p.cpu.architecture}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {p.device.vendor !== 'Generic' ? `${p.device.vendor} ` : ''}{p.device.model || p.device.type}
                      </td>
                      <td className="py-2.5 px-3">
                        {p.bot.isBot ? (
                          <span className="text-[10px] bg-purple-950/80 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                            {p.bot.botName || 'Bot'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">Human</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> {item.warningsCount} W
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};