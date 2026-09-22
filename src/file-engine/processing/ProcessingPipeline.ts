import type { FileConstraints, FileProcessorFn, ManagedFile, ProcessResult } from '../types';
import { uploadManager } from '../upload';
import { previewManager } from '../preview';

export class ProcessingPipeline {
  async runFromFiles(
    raw: FileList | File[],
    processor?: FileProcessorFn,
    constraints?: FileConstraints
  ): Promise<ProcessResult> {
    try {
      let files = await uploadManager.fromFileList(raw, constraints);
      const invalid = files.filter((f) => f.status === 'invalid');
      if (invalid.length && invalid.length === files.length) {
        return { ok: false, files, error: invalid[0]?.error ?? 'Validation failed' };
      }

      files = await Promise.all(files.map((f) => previewManager.attachPreview(f)));

      if (!processor) {
        return { ok: true, files };
      }

      const result = await processor(files.filter((f) => f.status === 'valid'));
      return {
        ...result,
        files: result.files?.length ? result.files : files,
      };
    } catch (e) {
      return {
        ok: false,
        files: [],
        error: e instanceof Error ? e.message : 'Processing failed',
      };
    }
  }

  cleanup(files: ManagedFile[]): void {
    previewManager.cleanupAll(files);
  }
}

export const processingPipeline = new ProcessingPipeline();
