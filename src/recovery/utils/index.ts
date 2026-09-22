export function recoveryId(prefix = "snap"): string {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

/** Simple non-crypto checksum for integrity of JSON payloads */
export function checksum(payload: string): string {
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (Math.imul(31, h) + payload.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}

export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data);
}

export function safeJsonParse<T = unknown>(raw: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(raw) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}
