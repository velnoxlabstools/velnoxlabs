export class RecoveryManager {
  /** Soft recovery actions for UI layers */
  reload(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  goHome(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  clearClientState(keys: string[] = []): void {
    if (typeof window === 'undefined') return;
    try {
      for (const key of keys) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export const recoveryManager = new RecoveryManager();
