import type { FileProcessorFn, ManagedFile, ProcessResult } from '../types';

/** Identity / pass-through processor for tools that only need upload+preview */
export const identityProcessor: FileProcessorFn = (files: ManagedFile[]): ProcessResult => ({
  ok: true,
  files: files.map((f) => ({ ...f, status: 'processed' })),
});

export class FileProcessor {
  constructor(private fn: FileProcessorFn = identityProcessor) {}

  setProcessor(fn: FileProcessorFn): void {
    this.fn = fn;
  }

  process(files: ManagedFile[]): Promise<ProcessResult> | ProcessResult {
    return this.fn(files);
  }
}
