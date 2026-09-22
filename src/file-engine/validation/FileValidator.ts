import type { FileConstraints, ManagedFile } from '../types';
import { DEFAULT_EXTENSIONS, DEFAULT_MAX_BYTES, getExtension, readMetadata, createFileId } from '../utils';

export class FileValidator {
  validateFile(file: File, constraints: FileConstraints = {}): ManagedFile {
    const meta = readMetadata(file);
    const max = constraints.maxBytes ?? DEFAULT_MAX_BYTES;
    const allowedExt = constraints.allowedExtensions ?? DEFAULT_EXTENSIONS;
    const ext = getExtension(file.name) as typeof allowedExt[number];

    if (!file || file.size === 0) {
      return { id: createFileId(), file, meta, status: 'invalid', error: 'File is empty' };
    }
    if (file.size > max) {
      return {
        id: createFileId(),
        file,
        meta,
        status: 'invalid',
        error: `File exceeds ${Math.round(max / 1024)}KB limit`,
      };
    }
    if (allowedExt.length && !allowedExt.includes(ext)) {
      return {
        id: createFileId(),
        file,
        meta,
        status: 'invalid',
        error: `Extension .${ext} is not allowed`,
      };
    }
    if (constraints.allowedMimeTypes?.length && file.type) {
      const ok = constraints.allowedMimeTypes.some(
        (m) => file.type === m || file.type.startsWith(m.replace('*', ''))
      );
      if (!ok) {
        return {
          id: createFileId(),
          file,
          meta,
          status: 'invalid',
          error: 'MIME type not allowed',
        };
      }
    }

    return { id: createFileId(), file, meta, status: 'valid' };
  }

  validateMany(files: File[], constraints?: FileConstraints): ManagedFile[] {
    return files.map((f) => this.validateFile(f, constraints));
  }
}

export const fileValidator = new FileValidator();
