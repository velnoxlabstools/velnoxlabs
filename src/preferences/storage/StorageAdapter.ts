export type StorageKind = 'local' | 'session' | 'memory';

const memory = new Map<string, string>();

export class StorageAdapter {
  constructor(private kind: StorageKind = 'local') {}

  private store(): Storage | null {
    if (typeof window === 'undefined') return null;
    try {
      if (this.kind === 'session') return window.sessionStorage;
      if (this.kind === 'local') return window.localStorage;
    } catch {
      return null;
    }
    return null;
  }

  get(key: string): string | null {
    const s = this.store();
    if (!s) return memory.get(key) ?? null;
    try {
      return s.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  }

  set(key: string, value: string): void {
    const s = this.store();
    memory.set(key, value);
    if (!s) return;
    try {
      s.setItem(key, value);
    } catch {
      /* quota / private mode — memory already set */
    }
  }

  remove(key: string): void {
    memory.delete(key);
    const s = this.store();
    if (!s) return;
    try {
      s.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export const localStorageAdapter = new StorageAdapter('local');
export const sessionStorageAdapter = new StorageAdapter('session');
export const memoryStorageAdapter = new StorageAdapter('memory');
