import type {
  ExportFormat,
  ExportRequest,
  ExportResult,
  ImportResult,
  ImportSource,
  ShareRequest,
  ShareResult,
} from '../types';
import { exportManager } from '../export';
import { importManager } from '../import';
import { shareManager } from '../sharing';
import { downloadManager } from '../download';
import { clipboardManager } from '../clipboard';
import { historyManager } from '../history';
import { uploadManager } from '../upload';

/**
 * Universal import / export / share facade for all tools.
 */
export class ExchangeManager {
  async export(req: ExportRequest, autoDownload = true): Promise<ExportResult> {
    const result = exportManager.export(req);
    if (result.ok) {
      historyManager.push('export', result.filename);
      if (autoDownload && result.blob) {
        downloadManager.download(result.blob, result.filename);
      }
    }
    return result;
  }

  async exportAndCopy(req: ExportRequest): Promise<ExportResult> {
    const result = exportManager.export(req);
    if (result.ok && result.text != null) {
      await clipboardManager.copy(result.text);
      historyManager.push('export', `copy:${result.filename}`);
    }
    return result;
  }

  async importFrom(source: ImportSource): Promise<ImportResult> {
    const result = await importManager.importFrom(source);
    if (result.ok) historyManager.push('import', source);
    return result;
  }

  importText(text: string, source: ImportSource = 'text'): ImportResult {
    const result = importManager.importText(text, source);
    if (result.ok) historyManager.push('import', source);
    return result;
  }

  async importFiles(files: FileList | File[]): Promise<ImportResult[]> {
    const results = await uploadManager.fromFileList(files);
    if (results.some((r) => r.ok)) historyManager.push('import', 'file');
    return results;
  }

  async share(req: ShareRequest): Promise<ShareResult> {
    const result = await shareManager.share(req);
    if (result.ok) historyManager.push('share', result.method);
    return result;
  }

  copyOutput(text: string) {
    return shareManager.copyResult(text);
  }

  copyLink(url: string) {
    return shareManager.copyLink(url);
  }

  pasteInput() {
    return clipboardManager.paste();
  }

  history() {
    return historyManager.list();
  }

  listExportFormats(): ExportFormat[] {
    return exportManager.listFormats();
  }
}

export const exchangeManager = new ExchangeManager();
