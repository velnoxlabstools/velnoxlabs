'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import { copyToClipboard } from '../../utils/clipboard';
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Bot,
  Sparkles,
  Cpu,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Gamepad2,
} from 'lucide-react';

export const HumanSummaryCard: React.FC = () => {
  const { parsedResult, showToast } = useUAParser();
  const [copied, setCopied] = React.useState(false);

  if (!parsedResult || !parsedResult.rawUA) {
    return null;
  }

  const { browser, os, device, cpu, bot, humanSummary, validation } = parsedResult;

  const getDeviceIcon = () => {
    if (bot.isBot) return <Bot className="w-6 h-6 text-purple-400" />;
    switch (device.type) {
      case 'Mobile':
        return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case 'Tablet':
        return <Tablet className="w-6 h-6 text-amber-400" />;
      case 'Smart TV':
        return <Tv className="w-6 h-6 text-blue-400" />;
      case 'Console':
        return <Gamepad2 className="w-6 h-6 text-rose-400" />;
      default:
        return <Monitor className="w-6 h-6 text-cyan-400" />;
    }
  };

  const handleCopySummary = async () => {
    const ok = await copyToClipboard(humanSummary);
    if (ok) {
      setCopied(true);
      showToast('Copied summary to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
              {getDeviceIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wide uppercase text-slate-400">
                  Human-Readable Summary
                </span>
                {bot.isAIBot ? (
                  <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI Crawler Detected
                  </span>
                ) : bot.isBot ? (
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Bot className="w-3 h-3 text-indigo-400" />
                    Automated Bot
                  </span>
                ) : (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Human Browser
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                {humanSummary}
              </h2>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="self-end sm:self-auto flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-slate-900 dark:text-slate-900 dark:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-medium block">Browser</span>
            <div className="text-xs font-semibold text-cyan-300 truncate mt-0.5">
              {browser.name} <span className="text-slate-400 font-normal">{browser.majorVersion}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-medium block">Operating System</span>
            <div className="text-xs font-semibold text-emerald-300 truncate mt-0.5">
              {os.name} <span className="text-slate-400 font-normal">{os.version}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-medium block">Device / Model</span>
            <div className="text-xs font-semibold text-amber-300 truncate mt-0.5">
              {device.vendor !== 'Generic' ? `${device.vendor} ${device.model}` : device.type}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 font-medium block">Engine</span>
            <div className="text-xs font-semibold text-purple-300 truncate mt-0.5">
              {parsedResult.engine.name} <span className="text-slate-400 font-normal">{parsedResult.engine.version}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-medium block">CPU Architecture</span>
            <div className="text-xs font-semibold text-blue-300 truncate mt-0.5 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              <span>{cpu.architecture}</span>
            </div>
          </div>
        </div>

        {validation.warnings.length > 0 && (
          <div className="mt-3 bg-amber-950/40 border border-amber-800/50 rounded-xl p-2.5 text-xs text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <strong>Validation Notice:</strong> {validation.warnings.join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};