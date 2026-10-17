'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/theme';

export function ThemeToggle() {
  const tCommon = useTranslations('Common');
  const [mounted, setMounted] = useState(false);
  const { resolved, toggle } = useTheme();

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={tCommon('toggleTheme')}
      className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-page)] transition-all shadow-sm flex items-center justify-center w-10 h-10 cursor-pointer"
    >
      {mounted ? (
        resolved === 'dark' ? (
          <span role="img" aria-label={tCommon('lightMode')} className="text-xl">
            ☀️
          </span>
        ) : (
          <span role="img" aria-label={tCommon('darkMode')} className="text-xl">
            🌙
          </span>
        )
      ) : (
        <span className="text-xl">⏳</span>
      )}
    </button>
  );
}

export default ThemeToggle;
