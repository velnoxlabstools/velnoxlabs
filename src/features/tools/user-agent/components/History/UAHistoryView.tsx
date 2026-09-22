'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  History,
  Trash2,
  Download,
  Pin,
  PinOff,
  ExternalLink,
  Bot,
  Monitor,
} from 'lucide-react';

export const UAHistoryView: React.FC = () => {
  const {
    history,
    togglePinHistory,
    deleteHistoryItem,
    clearHistory,
    loadHistoryItemToLive,
    openExportModal,
  } = useUAParser();

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xl">
        <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No History Records Found</h3>
        <p className="text-xs text-slate-600 dark:text-slate-700 dark:text-slate-400 max-w-md mx-auto mt-1">
          Parsed User-Agents are automatically saved to your local storage session. Start parsing in Live or Batch modes to populate history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-700 dark:text-slate-400">Stored Records</span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Session History ({history.length})
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openExportModal('history')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export All</span>
          </button>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-rose-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => {
          const { parsed, isPinned } = item;
          return (
            <div
              key={parsed.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                isPinned
                  ? 'bg-slate-50 dark:bg-slate-950/90 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-white dark:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shrink-0 mt-0.5">
                  {parsed.bot.isBot ? (
                    <Bot className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Monitor className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {parsed.browser.name} {parsed.browser.majorVersion}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-700 dark:text-slate-400">
                      on {parsed.os.name} {parsed.os.version}
                    </span>
                    {isPinned && (
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-semibold">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-xl mt-0.5">
                    {parsed.rawUA}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-1.5 py-0.2 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">
                      {new Date(parsed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                <button
                  onClick={() => loadHistoryItemToLive(parsed)}
                  className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-white dark:bg-slate-900 hover:bg-slate-850 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Load into Live Parser"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
                <button
                  onClick={() => togglePinHistory(parsed.id)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isPinned
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:text-slate-200'
                  }`}
                  title={isPinned ? 'Unpin Record' : 'Pin Record'}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteHistoryItem(parsed.id)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-700 dark:text-slate-400 hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                  title="Delete from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};