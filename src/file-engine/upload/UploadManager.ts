import type { FileConstraints, ManagedFile } from '../types';
import { fileValidator } from '../validation';
import { fileMetadataReader } from '../metadata';

export class UploadManager {
  async fromFileList(
    list: FileList | File[],
    constraints?: FileConstraints
  ): Promise<ManagedFile[]> {
    const files = Array.from(list);
    const limited = constraints?.multiple === false ? files.slice(0, 1) : files;
    const validated = fileValidator.validateMany(limited, constraints);
    return fileMetadataReader.enrichAll(validated);
  }

  async fromInput(
    input: HTMLInputElement,
    constraints?: FileConstraints
  ): Promise<ManagedFile[]> {
    if (!input.files?.length) return [];
    return this.fromFileList(input.files, constraints);
  }
}

export const uploadManager = new UploadManager();
