'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { tools } from '@/data';
import type { Tool } from '@/types/tools';

export default function SearchBar() {
  const t = useTranslations('Header');
  const tCommon = useTranslations('Common');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const filtered = tools
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
    <div
      ref={wrapperRef}
      className="relative w-full max-w-xs"
      style={{ width: '16rem', maxWidth: '100%' }}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-3 py-1.5 pl-9 bg-[var(--bg-page)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-500 transition-colors"
          style={{
            backgroundColor: 'var(--bg-page)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
          }}
        />
        <svg
          width={16}
          height={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
          style={{
            width: '1rem',
            height: '1rem',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
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
        <div
          className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {results.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="block px-4 py-3 hover:bg-[var(--bg-page)] transition-colors border-b border-[var(--border-color)] last:border-0"
              style={{
                borderBottomColor: 'var(--border-color)',
              }}
            >
              <div className="text-sm font-medium text-[var(--text-main)]">{tool.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                {tool.tags?.join(', ') || tCommon('tool')}
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div
          className="absolute top-full mt-2 w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl z-50"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="px-4 py-3 text-sm text-[var(--text-muted)]">
            {t('noToolsFound')} &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
