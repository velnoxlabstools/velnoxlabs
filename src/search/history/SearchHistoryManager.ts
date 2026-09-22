const KEY = 'velnox_search_history';
const MAX = 12;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(items: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export class SearchHistoryManager {
  add(query: string): void {
    const q = query.trim();
    if (!q) return;
    const next = [q, ...read().filter((x) => x.toLowerCase() !== q.toLowerCase())];
    write(next);
  }

  list(): string[] {
    return read();
  }

  clear(): void {
    write([]);
  }
}

export const searchHistoryManager = new SearchHistoryManager();
