'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  BarChart3,
  PieChart,
  ShieldAlert,
  Bot,
  Monitor,
  Activity,
} from 'lucide-react';

export const UAAnalyticsView: React.FC = () => {
  const { history, batchItems } = useUAParser();

  // Combine records from history and batch to form analytical dataset
  const records = [
    ...history.map((h) => h.parsed),
    ...batchItems.map((b) => b.parsed),
  ];

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xl">
        <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Analytics Data Available Yet</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1">
          Parse User-Agent strings in the Live Parser or run a Batch session to view breakdown distribution metrics here.
        </p>
      </div>
    );
  }

  // Distribution aggregates
  const browserCounts: Record<string, number> = {};
  const osCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};
  let botCount = 0;
  let anomalyCount = 0;

  records.forEach((r) => {
    browserCounts[r.browser.name] = (browserCounts[r.browser.name] || 0) + 1;
    osCounts[r.os.name] = (osCounts[r.os.name] || 0) + 1;
    deviceCounts[r.device.type] = (deviceCounts[r.device.type] || 0) + 1;
    if (r.bot.isBot) botCount++;
    if (!r.validation.isValid) anomalyCount++;
  });

  const total = records.length;

  const renderDistributionList = (data: Record<string, number>, barColorClass: string) => {
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    return (
      <div className="space-y-2.5 mt-2">
        {sorted.map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{name}</span>
                <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Parsed</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">{total}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human Hits</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{total - botCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Bot / Crawlers</span>
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">{botCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Anomalies / Warn</span>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{anomalyCount}</div>
        </div>
      </div>

      {/* Distribution Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Browser Share
            </h4>
          </div>
          {renderDistributionList(browserCounts, 'bg-cyan-500')}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Operating Systems
            </h4>
          </div>
          {renderDistributionList(osCounts, 'bg-emerald-500')}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
            <Monitor className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Device Platforms
            </h4>
          </div>
          {renderDistributionList(deviceCounts, 'bg-amber-500')}
        </div>
      </div>
    </div>
  );
};