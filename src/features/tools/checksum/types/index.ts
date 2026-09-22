export type HashAlgorithm = 'CRC32' | 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export type OutputCase = 'lowercase' | 'uppercase';
export type OutputFormat = 'hex' | 'base64';
export interface HashResult { algorithm: HashAlgorithm; value: string; timeMs: number; }
export type QueueItemStatus = 'queued' | 'processing' | 'completed' | 'error';
export interface ChecksumItem { id: string; name: string; type: 'text' | 'file'; size: number; charCount?: number; textContent?: string; fileRef?: File; status: QueueItemStatus; progress: number; hashes: Partial<Record<HashAlgorithm, string>>; processingTimeMs: number; createdAt: number; error?: string; expectedHash?: string; matchStatus?: 'matched' | 'mismatched' | 'none'; matchedAlgorithm?: HashAlgorithm; isPinned?: boolean; }
export interface AppStats { totalFilesProcessed: number; totalTextProcessed: number; totalBytesHashed: number; totalTimeMs: number; algorithmCount: Record<HashAlgorithm, number>; }
export type ActiveTab = 'single' | 'batch' | 'history' | 'stats';
