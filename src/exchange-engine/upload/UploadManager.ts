import { importManager } from '../import';
import type { ImportResult } from '../types';

/** Lightweight upload bridge for exchange (defers heavy file ops to file-engine when needed) */
export class UploadManager {
  async fromFileList(files: FileList | File[]): Promise<ImportResult[]> {
    const list = Array.from(files);
    return Promise.all(list.map((f) => importManager.fromFile(f)));
  }
}

export const uploadManager = new UploadManager();
