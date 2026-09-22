'use client';

import React, { useState } from 'react';
import { useUAParser } from '../../context/UAParserContext';
import { USER_AGENT_PRESETS } from '../../utils/presets';
import {
  X,
  Search,
  Sparkles,
  Check,
} from 'lucide-react';

export const PresetModal: React.FC = () => {
  const { isPresetSelectorOpen, setIsPresetSelectorOpen, setRawUA, showToast } = useUAParser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isPresetSelectorOpen) return null;

  const categories = [
    'All',
    'Desktop',
    'Mobile & Tablet',
    'AI Bots & Scrapers',
    'Search Engine Crawlers',
    'Gaming & Smart TV',
    'Legacy & Rare',
  ];

  const filteredPresets = USER_AGENT_PRESETS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ua.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelect = (ua: string, name: string) => {
    setRawUA(ua);
    setIsPresetSelectorOpen(false);
    showToast(`Loaded preset: ${name}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">User-Agent Preset Library</h3>
              <p className="text-[11px] text-slate-400">Quickly test against modern, mobile, legacy, and AI scraper profiles</p>
            </div>
          </div>
          <button
            onClick={() => setIsPresetSelectorOpen(false)}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by browser, platform, or keyword... (e.g. GPTBot, Safari, iPhone)"
              className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelect(preset.ua, preset.name)}
              className="p-3 bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{preset.description}</p>
                <div className="font-mono text-[10px] text-slate-500 truncate max-w-xl mt-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800/50">
                  {preset.ua}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1 bg-cyan-950/80 border border-cyan-800/60 px-2 py-1 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> Apply
                </span>
              </div>
            </div>
          ))}

          {filteredPresets.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">
              No matching User-Agent profiles found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};