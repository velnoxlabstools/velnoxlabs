export type ConsentCategory = 'necessary' | 'analytics' | 'preferences';

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  updatedAt: number;
}

const KEY = 'velnox_consent_v1';

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  preferences: false,
  updatedAt: 0,
};

export class ConsentManager {
  get(): ConsentState {
    if (typeof window === 'undefined') return { ...defaultConsent };
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaultConsent };
      const parsed = JSON.parse(raw) as ConsentState;
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        preferences: Boolean(parsed.preferences),
        updatedAt: parsed.updatedAt ?? 0,
      };
    } catch {
      return { ...defaultConsent };
    }
  }

  set(partial: Partial<Pick<ConsentState, 'analytics' | 'preferences'>>): ConsentState {
    const next: ConsentState = {
      ...this.get(),
      ...partial,
      necessary: true,
      updatedAt: Date.now(),
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
    }
    return next;
  }

  allowsAnalytics(): boolean {
    return this.get().analytics;
  }
}

export const consentManager = new ConsentManager();
