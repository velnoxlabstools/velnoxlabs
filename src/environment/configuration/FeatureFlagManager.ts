import type { FeatureFlags } from '../types';

const defaultFlags: FeatureFlags = {
  betaTools: false,
  experimentalSearch: false,
  analytics: true,
  monitoring: true,
  maintenanceMode: false,
};

export class FeatureFlagManager {
  private flags: FeatureFlags = { ...defaultFlags };

  load(partial?: Partial<FeatureFlags>): FeatureFlags {
    this.flags = { ...defaultFlags, ...partial } as FeatureFlags;
    return this.flags;
  }

  isEnabled(flag: string): boolean {
    return Boolean(this.flags[flag]);
  }

  set(flag: string, value: boolean): void {
    this.flags[flag] = value;
  }

  all(): FeatureFlags {
    return { ...this.flags };
  }
}

export const featureFlagManager = new FeatureFlagManager();
