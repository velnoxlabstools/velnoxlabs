'use client';

import React from 'react';
import { useUAParser } from '../../context/UAParserContext';
import {
  Globe,
  Monitor,
  Layers,
  Smartphone,
  Cpu,
  Bot,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const TechnicalBreakdown: React.FC = () => {
  const { parsedResult } = useUAParser();

  if (!parsedResult || !parsedResult.rawUA) {
    return null;
  }

  const { browser, os, engine, device, cpu, bot } = parsedResult;

  const sections = [
    {
      title: 'Browser Information',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      items: [
        { label: 'Browser Name', value: browser.name },
        { label: 'Full Version', value: browser.version },
        { label: 'Major Version', value: browser.majorVersion },
        { label: 'Minor / Patch', value: `${browser.minorVersion}.${browser.patchVersion}` },
        { label: 'Vendor Provider', value: browser.vendor },
        { label: 'Browser Category', value: browser.type },
      ],
    },
    {
      title: 'Operating System',
      icon: <Monitor className="w-4 h-4 text-emerald-400" />,
      items: [
        { label: 'OS Name', value: os.name },
        { label: 'OS Version', value: os.version || 'Unspecified' },
        { label: 'OS Category', value: os.category },
        { label: 'OS Vendor', value: os.vendor },
        { label: 'Codename', value: os.codename || 'N/A' },
      ],
    },
    {
      title: 'Rendering Engine',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      items: [
        { label: 'Engine Name', value: engine.name },
        { label: 'Engine Version', value: engine.version || 'N/A' },
      ],
    },
    {
      title: 'Device & Hardware',
      icon: <Smartphone className="w-4 h-4 text-amber-400" />,
      items: [
        { label: 'Device Category', value: device.type },
        { label: 'Hardware Vendor', value: device.vendor },
        { label: 'Model Name', value: device.model || 'Generic' },
        { label: 'Mobile Device', value: device.isMobile ? 'Yes' : 'No' },
        { label: 'Tablet Device', value: device.isTablet ? 'Yes' : 'No' },
        { label: 'Touch Screen', value: device.isTouchCapable ? 'Supported' : 'Not Detected' },
      ],
    },
    {
      title: 'CPU Architecture',
      icon: <Cpu className="w-4 h-4 text-blue-400" />,
      items: [
        { label: 'Architecture', value: cpu.architecture },
        { label: 'Bitness', value: cpu.bitness },
      ],
    },
    {
      title: 'Bot & AI Crawler',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
      items: [
        { label: 'Is Bot / Crawler', value: bot.isBot ? 'YES' : 'NO' },
        { label: 'Is AI Model Bot', value: bot.isAIBot ? 'YES' : 'NO' },
        { label: 'Bot Name', value: bot.botName || 'N/A' },
        { label: 'Bot Category', value: bot.botCategory || 'N/A' },
        { label: 'Bot Vendor', value: bot.botVendor || 'N/A' },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Technical Breakdown Matrix
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700/80 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-800/80">
                {sec.icon}
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{sec.title}</h4>
              </div>
              <div className="space-y-2">
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[160px] text-right">
                      {item.value === 'Yes' || item.value === 'YES' || item.value === 'Supported' ? (
                        <span className="text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> {item.value}
                        </span>
                      ) : item.value === 'No' || item.value === 'NO' ? (
                        <span className="text-slate-500">{item.value}</span>
                      ) : (
                        item.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};