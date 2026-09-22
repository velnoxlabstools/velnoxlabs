import type { FileConstraints, ManagedFile } from '../types';
import { uploadManager } from './UploadManager';

export class ClipboardManager {
  async fromClipboardEvent(
    e: ClipboardEvent,
    constraints?: FileConstraints
  ): Promise<ManagedFile[]> {
    const items = e.clipboardData?.files;
    if (items?.length) {
      return uploadManager.fromFileList(items, constraints);
    }
    const text = e.clipboardData?.getData('text');
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' });
      const file = new File([blob], 'pasted.txt', { type: 'text/plain' });
      return uploadManager.fromFileList([file], constraints);
    }
    return [];
  }

  async writeText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

export const clipboardManager = new ClipboardManager();
