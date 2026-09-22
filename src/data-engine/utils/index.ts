export function asText(input: unknown): string {
  if (input == null) return '';
  return typeof input === 'string' ? input : String(input);
}

export function safeJsonParse(text: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function truncateForSafety(text: string, max = 5_000_000): string {
  return text.length > max ? text.slice(0, max) : text;
}
