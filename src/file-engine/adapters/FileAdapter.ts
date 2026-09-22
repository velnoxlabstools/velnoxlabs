import type { ManagedFile } from '../types';

/** Adapt ManagedFile for tool logic input payloads */
export class FileAdapter {
  toLogicInput(files: ManagedFile[]): Record<string, unknown> {
    const valid = files.filter((f) => f.status === 'valid' || f.status === 'processed');
    return {
      files: valid.map((f) => ({
        id: f.id,
        name: f.meta.name,
        size: f.meta.size,
        type: f.meta.type,
        extension: f.meta.extension,
        text: f.textContent,
      })),
      file: valid[0]
        ? {
            name: valid[0].meta.name,
            text: valid[0].textContent,
          }
        : null,
    };
  }
}

export const fileAdapter = new FileAdapter();
