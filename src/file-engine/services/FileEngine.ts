import type { FileConstraints, FileProcessorFn, ManagedFile, ProcessResult } from '../types';
import { processingPipeline } from '../processing';
import { downloadManager } from '../download';
import { clipboardManager } from '../upload';
import { dragDropManager } from '../upload';
import { fileAdapter } from '../adapters';
import { previewManager } from '../preview';

/**
 * Universal entry point for file-based tools.
 */
export class FileEngine {
  private files: ManagedFile[] = [];
  private processor?: FileProcessorFn;
  private constraints: FileConstraints = {};

  configure(options: { constraints?: FileConstraints; processor?: FileProcessorFn }): void {
    if (options.constraints) this.constraints = options.constraints;
    if (options.processor) this.processor = options.processor;
  }

  getFiles(): ManagedFile[] {
    return this.files;
  }

  async upload(list: FileList | File[]): Promise<ProcessResult> {
    this.cleanup();
    const result = await processingPipeline.runFromFiles(list, this.processor, this.constraints);
    this.files = result.files;
    return result;
  }

  async fromDrop(dt: DataTransfer | null): Promise<ProcessResult> {
    const managed = await dragDropManager.fromDataTransfer(dt, this.constraints);
    const input = managed.map((m) => m.file);
    return this.upload(input);
  }

  async fromPaste(e: ClipboardEvent): Promise<ProcessResult> {
    const managed = await clipboardManager.fromClipboardEvent(e, this.constraints);
    return this.upload(managed.map((m) => m.file));
  }

  remove(id: string): void {
    const target = this.files.find((f) => f.id === id);
    if (target) previewManager.cleanup(target);
    this.files = this.files.filter((f) => f.id !== id);
  }

  replace(id: string, file: File): Promise<ProcessResult> {
    this.remove(id);
    return this.upload([file]);
  }

  downloadOutput(output: Blob | string, name: string, mime?: string): void {
    downloadManager.downloadManagedOutput(output, name, mime);
  }

  async copyText(text: string): Promise<boolean> {
    return clipboardManager.writeText(text);
  }

  toLogicInput(): Record<string, unknown> {
    return fileAdapter.toLogicInput(this.files);
  }

  cleanup(): void {
    processingPipeline.cleanup(this.files);
    this.files = [];
  }
}

export const fileEngine = new FileEngine();
