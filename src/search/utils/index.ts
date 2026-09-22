export function sanitizeQuery(q: string, max = 120): string {
  return q
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function tokenize(q: string): string[] {
  return sanitizeQuery(q)
    .toLowerCase()
    .split(/[\s-_]+/)
    .filter((t) => t.length > 0);
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
