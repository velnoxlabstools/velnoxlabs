'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import { copyToClipboard } from '../../utils/clipboard';
import {
  Copy,
  Trash2,
  Sparkles,
  Check,
  Globe,
  CornerDownLeft,
} from 'lucide-react';

export const UAParseInput: React.FC = () => {
  const {
    rawUA,
    setRawUA,
    loadCurrentNavigatorUA,
    setIsPresetSelectorOpen,
    showToast,
    parsedResult,
  } = useUAParser();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!rawUA) return;
    const ok = await copyToClipboard(rawUA);
    if (ok) {
      setCopied(true);
      showToast('User-Agent string copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setRawUA('');
    showToast('Cleared input field', 'info');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative">
      <div className="flex items-center justify-between gap-2 mb-2">
        <label htmlFor="ua-input" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>User-Agent String Input</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            Real-time Live Parsing
          </span>
        </label>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPresetSelectorOpen(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!rawUA}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 transition-colors cursor-pointer"
            title="Copy Raw User-Agent"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleClear}
            disabled={!rawUA}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 transition-colors cursor-pointer"
            title="Clear input"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          id="ua-input"
          value={rawUA}
          onChange={(e) => setRawUA(e.target.value)}
          placeholder="Paste or type any User-Agent string here... e.g., Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 font-mono text-xs sm:text-sm p-3.5 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-y transition-all leading-relaxed"
        />

        {!rawUA && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-xl backdrop-blur-xs p-4">
            <button
              onClick={loadCurrentNavigatorUA}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Load My Current Browser User-Agent</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Length: <strong className="text-slate-200">{parsedResult.validation.length}</strong> chars</span>
          <span>Tokens: <strong className="text-slate-200">{parsedResult.validation.rawTokens.length}</strong></span>
          {parsedResult.validation.rfcCompliant ? (
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded">
              Standard Format
            </span>
          ) : (
            <span className="text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.2 rounded">
              Custom Format
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <CornerDownLeft className="w-3 h-3" />
          <span>Auto-parses live on keystroke</span>
        </div>
      </div>
    </div>
  );
};