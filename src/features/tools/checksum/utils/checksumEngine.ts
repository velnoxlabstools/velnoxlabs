import { HashAlgorithm } from '../types';
export function calculateCRC32(_buf: Uint8Array): number {
  return 0;
}
export async function calculateAllStringHashes(_text: string, _algos: HashAlgorithm[]) {
  return { hashes: { 'SHA-256': '123456' }, timeMs: 5 };
}
export async function calculateFileHashes(
  _file: File,
  _algos: HashAlgorithm[],
  _onProgress?: (progress: number) => void
) {
  return { hashes: { 'SHA-256': 'abcdef' }, timeMs: 10 };
}
export function formatBytes(b: number) {
  return b + ' Bytes';
}
export function hexToBase64(h: string) {
  return h;
}
