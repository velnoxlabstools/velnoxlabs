import type { ManagedFile, PreviewKind } from '../types';
import { isImageExt, isTextExt, revokeUrl } from '../utils';

export class PreviewManager {
  kindFor(file: ManagedFile): PreviewKind {
    const ext = file.meta.extension;
    if (isImageExt(ext)) return 'image';
    if (ext === 'json') return 'json';
    if (ext === 'csv') return 'csv';
    if (ext === 'md') return 'markdown';
    if (ext === 'pdf') return 'pdf';
    if (isTextExt(ext)) return 'text';
    return 'unknown';
  }

  async attachPreview(file: ManagedFile): Promise<ManagedFile> {
    if (file.status !== 'valid') return file;
    const kind = this.kindFor(file);
    const next = { ...file };

    if (kind === 'image') {
      next.previewUrl = URL.createObjectURL(file.file);
    } else if (kind === 'text' || kind === 'json' || kind === 'csv' || kind === 'markdown') {
      if (!next.textContent) {
        try {
          next.textContent = (await file.file.text()).slice(0, 200_000);
        } catch {
          next.error = 'Preview unavailable';
        }
      }
    }
    // pdf: architecture only — no binary preview implementation
    return next;
  }

  cleanup(file: ManagedFile): void {
    revokeUrl(file.previewUrl);
  }

  cleanupAll(files: ManagedFile[]): void {
    for (const f of files) this.cleanup(f);
  }
}

export const previewManager = new PreviewManager();
