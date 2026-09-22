'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import { ExportFormat } from '../../types/useragent';
import {
  X,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, closeExportModal, handleExport, exportTarget } = useUAParser();

  if (!isExportModalOpen) return null;

  const targetLabel =
    exportTarget === 'live'
      ? 'Current Active User-Agent'
      : exportTarget === 'batch'
      ? 'All Parsed Batch Records'
      : 'Complete Session History';

  const exportOptions: Array<{
    format: ExportFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
  }> = [
    {
      format: 'json',
      label: 'JSON Document (.json)',
      description: 'Full structured AST object including engine, device, and bot telemetry.',
      icon: <FileJson className="w-5 h-5 text-cyan-400" />,
      colorClass: 'hover:border-cyan-500/50 hover:bg-cyan-950/20',
    },
    {
      format: 'csv',
      label: 'CSV Spreadsheet (.csv)',
      description: 'Comma-separated values table ideal for Excel, Pandas, or database imports.',
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
      colorClass: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
    },
    {
      format: 'txt',
      label: 'Plain Text Report (.txt)',
      description: 'Human-readable technical summary report for documentation and audit logs.',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      colorClass: 'hover:border-amber-500/50 hover:bg-amber-950/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Export Parsed Telemetry</h3>
              <p className="text-[11px] text-slate-400">Target dataset: <strong className="text-cyan-300">{targetLabel}</strong></p>
            </div>
          </div>
          <button
            onClick={closeExportModal}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {exportOptions.map((opt) => (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              className={`w-full text-left p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 group ${opt.colorClass}`}
            >
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                {opt.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {opt.label}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex justify-end">
          <button
            onClick={closeExportModal}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};