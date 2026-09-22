'use client';

import { useCallback, useState } from 'react';
import type { ExportRequest, ExportResult, ImportResult, ShareRequest, ShareResult } from '../types';
import { exchangeManager } from '../services/ExchangeManager';

export function useExchange() {
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);
  const [lastImport, setLastImport] = useState<ImportResult | null>(null);
  const [lastShare, setLastShare] = useState<ShareResult | null>(null);
  const [busy, setBusy] = useState(false);

  const runExport = useCallback(async (req: ExportRequest, autoDownload = true) => {
    setBusy(true);
    const res = await exchangeManager.export(req, autoDownload);
    setLastExport(res);
    setBusy(false);
    return res;
  }, []);

  const runImportText = useCallback((text: string) => {
    const res = exchangeManager.importText(text);
    setLastImport(res);
    return res;
  }, []);

  const runShare = useCallback(async (req: ShareRequest) => {
    setBusy(true);
    const res = await exchangeManager.share(req);
    setLastShare(res);
    setBusy(false);
    return res;
  }, []);

  return {
    busy,
    lastExport,
    lastImport,
    lastShare,
    export: runExport,
    exportAndCopy: exchangeManager.exportAndCopy.bind(exchangeManager),
    importText: runImportText,
    importFrom: exchangeManager.importFrom.bind(exchangeManager),
    importFiles: exchangeManager.importFiles.bind(exchangeManager),
    share: runShare,
    copyOutput: exchangeManager.copyOutput.bind(exchangeManager),
    copyLink: exchangeManager.copyLink.bind(exchangeManager),
    pasteInput: exchangeManager.pasteInput.bind(exchangeManager),
    history: exchangeManager.history.bind(exchangeManager),
    formats: exchangeManager.listExportFormats(),
  };
}
