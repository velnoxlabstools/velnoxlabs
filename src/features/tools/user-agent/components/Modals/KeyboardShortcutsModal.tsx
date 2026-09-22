'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  X,
  Keyboard,
  Command,
} from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useUAParser();

  if (!isShortcutsOpen) return null;

  const shortcutGroups = [
    {
      title: 'Navigation Shortcuts',
      shortcuts: [
        { keys: ['Alt', '1'], label: 'Switch to Live Parser tab' },
        { keys: ['Alt', '2'], label: 'Switch to Compare UAs tab' },
        { keys: ['Alt', '3'], label: 'Switch to Batch Parser tab' },
        { keys: ['Alt', '4'], label: 'Switch to Analytics tab' },
        { keys: ['Alt', '5'], label: 'Switch to Session History tab' },
      ],
    },
    {
      title: 'Global Actions',
      shortcuts: [
        { keys: ['Ctrl / ⌘', 'K'], label: 'Open User-Agent Preset Library' },
        { keys: ['Ctrl / ⌘', '/'], label: 'Open Keyboard Shortcuts Help' },
        { keys: ['Esc'], label: 'Close active modal / dialog' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Power user keybindings</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{sc.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 text-[10px] font-semibold font-mono bg-slate-800 text-slate-200 border border-slate-700 rounded shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> Press Esc anytime to dismiss
          </span>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};