'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { tools } from '@/data';

export default function SearchBar() {
  const t = useTranslations('Header');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const filtered = (tools as any[])
      .filter(
        (tool) =>
          tool.name?.toLowerCase().includes(query.toLowerCase()) ||
          tool.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 8);
    setResults(filtered);
    setIsOpen(true);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-4 py-2 pl-10 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="block px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
            >
              <div className="text-sm font-medium text-white">{tool.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {tool.tags?.join(', ') || 'Tool'}
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50">
          <div className="px-4 py-3 text-sm text-slate-400">
            {t('noToolsFound')} "{query}"
          </div>
        </div>
      )}
    </div>
  );
}