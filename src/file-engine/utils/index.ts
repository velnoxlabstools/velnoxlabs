import type { FileMetadata, SupportedExtension } from '../types';

export function createFileId(): string {
  return `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getExtension(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function readMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    extension: getExtension(file.name),
    lastModified: file.lastModified,
  };
}

export function isImageExt(ext: string): boolean {
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg'].includes(ext);
}

export function isTextExt(ext: string): boolean {
  return ['txt', 'json', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'md', 'svg'].includes(ext);
}

export function revokeUrl(url?: string): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

export const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export const DEFAULT_EXTENSIONS: SupportedExtension[] = [
  'txt', 'json', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'md', 'svg',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'pdf',
];
