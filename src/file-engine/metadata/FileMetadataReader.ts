import type { ManagedFile } from '../types';
import { isTextExt } from '../utils';

export class FileMetadataReader {
  async enrich(managed: ManagedFile): Promise<ManagedFile> {
    if (managed.status !== 'valid') return managed;

    const next = { ...managed };

    if (isTextExt(managed.meta.extension)) {
      try {
        const text = await managed.file.text();
        next.textContent = text.slice(0, 500_000);
      } catch {
        next.error = 'Could not read text content';
        next.status = 'invalid';
      }
    }

    return next;
  }

  async enrichAll(files: ManagedFile[]): Promise<ManagedFile[]> {
    return Promise.all(files.map((f) => this.enrich(f)));
  }
}

export const fileMetadataReader = new FileMetadataReader();
