export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function redactSensitive(input: Record<string, unknown>): Record<string, unknown> {
  const sensitive = /password|secret|token|api[_-]?key|authorization|cookie|session/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (sensitive.test(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = redactSensitive(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function safePublicMessage(message: string, fallback = 'Something went wrong'): string {
  const blocked = /stack|exception|at\s+\w+|node_modules|ECONN|ENOENT/i;
  if (blocked.test(message)) return fallback;
  return message.slice(0, 300);
}
