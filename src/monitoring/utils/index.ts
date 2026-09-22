export function monId(prefix = "mon"): string {
  return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

export function sanitizeContext(
  ctx?: Record<string, unknown>
): Record<string, string | number> | undefined {
  if (!ctx) return undefined;
  const out: Record<string, string | number> = {};
  const blocked = /password|secret|token|authorization|cookie/i;
  for (const [k, v] of Object.entries(ctx).slice(0, 20)) {
    if (blocked.test(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "boolean") out[k] = v ? 1 : 0;
  }
  return out;
}
