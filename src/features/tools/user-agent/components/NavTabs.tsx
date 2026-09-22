'use client';

import React from 'react';
import { useUAParser } from '../context/UAParserContext';
import { ViewTab } from '../types/useragent';
import {
  Zap,
  GitCompare,
  Layers,
  BarChart3,
  History,
} from 'lucide-react';

export const NavTabs: React.FC = () => {
  const { activeTab, setActiveTab, history, batchItems } = useUAParser();

  const tabs: Array<{
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    shortcut: string;
  }> = [
    {
      id: 'live',
      label: 'Live Parser',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      shortcut: 'Alt+1',
    },
    {
      id: 'compare',
      label: 'Compare UAs',
      icon: <GitCompare className="w-4 h-4 text-indigo-400" />,
      shortcut: 'Alt+2',
    },
    {
      id: 'batch',
      label: 'Batch Parser',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      badge: batchItems.length > 0 ? batchItems.length : undefined,
      shortcut: 'Alt+3',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
      shortcut: 'Alt+4',
    },
    {
      id: 'history',
      label: 'Session History',
      icon: <History className="w-4 h-4 text-amber-400" />,
      badge: history.length > 0 ? history.length : undefined,
      shortcut: 'Alt+5',
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 rounded-xl mb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-start overflow-x-auto no-scrollbar gap-1 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 border-slate-300 dark:border-slate-700 border-b-transparent shadow-sm'
                  : 'bg-transparent text-slate-500 dark:text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-600 dark:text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              <span className="hidden lg:inline-block text-[9px] opacity-40 font-mono">
                {tab.shortcut}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};