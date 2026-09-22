import type { FileConstraints, ManagedFile } from '../types';
import { uploadManager } from './UploadManager';

export class DragDropManager {
  async fromDataTransfer(
    dt: DataTransfer | null,
    constraints?: FileConstraints
  ): Promise<ManagedFile[]> {
    if (!dt?.files?.length) return [];
    return uploadManager.fromFileList(dt.files, constraints);
  }

  preventDefaults(e: { preventDefault: () => void; stopPropagation: () => void }): void {
    e.preventDefault();
    e.stopPropagation();
  }
}

export const dragDropManager = new DragDropManager();
