'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ParsedUA,
  ComparisonResult,
  BatchItem,
  HistoryItem,
  ViewTab,
  ExportFormat,
} from '../types/useragent';
import { parseUserAgent, compareUserAgents, generateId } from '../utils/uaParser';
import { USER_AGENT_PRESETS } from '../utils/presets';
import { exportUARecords } from '../utils/export';

const HISTORY_STORAGE_KEY = 'velnox_ua_parser_history_v1';
const THEME_STORAGE_KEY = 'velnox_ua_theme_v1';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface UAParserContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  rawUA: string;
  setRawUA: (ua: string) => void;
  parsedResult: ParsedUA;
  loadCurrentNavigatorUA: () => void;
  compareUA1: string;
  setCompareUA1: (ua: string) => void;
  compareUA2: string;
  setCompareUA2: (ua: string) => void;
  comparisonResult: ComparisonResult | null;
  swapCompareUAs: () => void;
  batchInput: string;
  setBatchInput: (val: string) => void;
  batchItems: BatchItem[];
  processBatchParsing: (inputOverride?: string) => void;
  clearBatch: () => void;
  history: HistoryItem[];
  togglePinHistory: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  loadHistoryItemToLive: (parsed: ParsedUA) => void;
  theme: 'dark' | 'light' | 'system';
  setThemeMode: (mode: 'dark' | 'light' | 'system') => void;
  toggleTheme: () => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isPresetSelectorOpen: boolean;
  setIsPresetSelectorOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  exportTarget: 'live' | 'batch' | 'history';
  openExportModal: (target: 'live' | 'batch' | 'history') => void;
  closeExportModal: () => void;
  handleExport: (format: ExportFormat) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const UAParserContext = createContext<UAParserContextType | undefined>(undefined);

const DEFAULT_SAMPLE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export const UAParserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('live');

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  const applyThemeClass = useCallback((mode: 'dark' | 'light' | 'system') => {
    if (typeof document === 'undefined') return;
    let isDark = mode === 'dark';
    if (mode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeState(saved);
        applyThemeClass(saved);
      }
    } catch {}
  }, [applyThemeClass]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setThemeState(isDark ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      const id = Math.random().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 3000);
    },
    []
  );

  const setThemeMode = useCallback(
    (mode: 'dark' | 'light' | 'system') => {
      setThemeState(mode);
      showToast(`Theme set to ${mode.toUpperCase()}`, 'info');
    },
    [showToast]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  }, []);

  const [rawUA, setRawUAState] = useState<string>(DEFAULT_SAMPLE_UA);
  const [parsedResult, setParsedResult] = useState<ParsedUA>(() => parseUserAgent(DEFAULT_SAMPLE_UA));

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator && navigator.userAgent) {
      setRawUAState(navigator.userAgent);
      setParsedResult(parseUserAgent(navigator.userAgent));
    }
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (history.length > 0) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
      }
    } catch {}
  }, [history]);

  const saveToHistory = useCallback((parsed: ParsedUA) => {
    if (!parsed.rawUA.trim()) return;
    setHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.parsed.rawUA === parsed.rawUA);
      if (existingIdx !== -1) {
        const item = prev[existingIdx];
        const updated = [
          { ...item, parsed: { ...parsed, timestamp: new Date().toISOString() } },
          ...prev.filter((_, i) => i !== existingIdx),
        ];
        return updated.slice(0, 100);
      }
      const newItem: HistoryItem = {
        parsed,
        isPinned: false,
        tags: [parsed.device.type, parsed.browser.name, parsed.os.name].filter(Boolean),
      };
      const unpinned = prev.filter((i) => !i.isPinned);
      const pinned = prev.filter((i) => i.isPinned);
      return [...pinned, newItem, ...unpinned].slice(0, 100);
    });
  }, []);

  const setRawUA = useCallback((ua: string) => {
    setRawUAState(ua);
    const parsed = parseUserAgent(ua);
    setParsedResult(parsed);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (parsedResult && parsedResult.rawUA) {
        saveToHistory(parsedResult);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [parsedResult, saveToHistory]);

  const loadCurrentNavigatorUA = useCallback(() => {
    if (typeof window !== 'undefined' && navigator && navigator.userAgent) {
      setRawUA(navigator.userAgent);
      showToast('Loaded current browser User-Agent', 'info');
    } else {
      showToast('Navigator User-Agent not accessible', 'warning');
    }
  }, [setRawUA, showToast]);

  const [compareUA1, setCompareUA1] = useState<string>(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36'
  );
  const [compareUA2, setCompareUA2] = useState<string>(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/605.1.15'
  );
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    if (compareUA1 && compareUA2) {
      const res = compareUserAgents(compareUA1, compareUA2);
      setComparisonResult(res);
    } else {
      setComparisonResult(null);
    }
  }, [compareUA1, compareUA2]);

  const swapCompareUAs = () => {
    setCompareUA1(compareUA2);
    setCompareUA2(compareUA1);
    showToast('Swapped comparison User-Agents', 'info');
  };

  const [batchInput, setBatchInput] = useState<string>(
    USER_AGENT_PRESETS.slice(0, 5).map((p) => p.ua).join('\n\n')
  );
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  const processBatchParsing = useCallback((inputOverride?: string) => {
    const sourceText = inputOverride !== undefined ? inputOverride : batchInput;
    if (!sourceText.trim()) {
      setBatchItems([]);
      return;
    }
    const lines = sourceText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const items: BatchItem[] = lines.map((line) => {
      const parsed = parseUserAgent(line);
      const warningsCount = parsed.validation.warnings.length + parsed.validation.anomalies.length;
      return {
        id: generateId(),
        rawUA: line,
        parsed,
        status: warningsCount === 0 ? 'success' : 'warning',
        warningsCount,
      };
    });
    setBatchItems(items);
    showToast(`Batch parsed ${items.length} User-Agent strings`, 'success');
  }, [batchInput, showToast]);

  const clearBatch = () => {
    setBatchInput('');
    setBatchItems([]);
    showToast('Cleared batch input', 'info');
  };

  const togglePinHistory = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.parsed.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.parsed.id !== id));
    showToast('Removed entry from history', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {}
    showToast('Cleared history session', 'info');
  };

  const loadHistoryItemToLive = (parsed: ParsedUA) => {
    setRawUA(parsed.rawUA);
    setActiveTab('live');
    showToast(`Loaded "${parsed.browser.name}" into live parser`, 'info');
  };

  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<'live' | 'batch' | 'history'>('live');

  const openExportModal = (target: 'live' | 'batch' | 'history') => {
    setExportTarget(target);
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => setIsExportModalOpen(false);

  const handleExport = (format: ExportFormat) => {
    if (exportTarget === 'live') {
      exportUARecords([parsedResult], format, 'velnox_live_ua');
    } else if (exportTarget === 'batch') {
      const records = batchItems.map((b) => b.parsed);
      exportUARecords(records, format, 'velnox_batch_ua');
    } else if (exportTarget === 'history') {
      const records = history.map((h) => h.parsed);
      exportUARecords(records, format, 'velnox_history_ua');
    }
    showToast(`Exported records as ${format.toUpperCase()}`, 'success');
    closeExportModal();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsPresetSelectorOpen(false);
        setIsExportModalOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPresetSelectorOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.altKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('live'); }
        if (e.key === '2') { e.preventDefault(); setActiveTab('compare'); }
        if (e.key === '3') { e.preventDefault(); setActiveTab('batch'); }
        if (e.key === '4') { e.preventDefault(); setActiveTab('analytics'); }
        if (e.key === '5') { e.preventDefault(); setActiveTab('history'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <UAParserContext.Provider
      value={{
        activeTab,
        setActiveTab,
        rawUA,
        setRawUA,
        parsedResult,
        loadCurrentNavigatorUA,
        compareUA1,
        setCompareUA1,
        compareUA2,
        setCompareUA2,
        comparisonResult,
        swapCompareUAs,
        batchInput,
        setBatchInput,
        batchItems,
        processBatchParsing,
        clearBatch,
        history,
        togglePinHistory,
        deleteHistoryItem,
        clearHistory,
        loadHistoryItemToLive,
        theme,
        setThemeMode,
        toggleTheme,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isPresetSelectorOpen,
        setIsPresetSelectorOpen,
        isExportModalOpen,
        exportTarget,
        openExportModal,
        closeExportModal,
        handleExport,
        toast,
        showToast,
      }}
    >
      {children}
    </UAParserContext.Provider>
  );
};

export const useUAParser = () => {
  const context = useContext(UAParserContext);
  if (!context) {
    throw new Error('useUAParser must be used within a UAParserProvider');
  }
  return context;
};
