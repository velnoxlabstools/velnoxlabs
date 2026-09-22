import { describe, it, expect } from 'vitest';
import { preferenceValidator } from '@/preferences/settings';
import { withDefaults } from '@/preferences/utils';

describe('Preferences', () => {
  it('sanitizes invalid theme', () => {
    const safe = preferenceValidator.sanitize({ theme: 'neon' as never });
    expect(safe.theme).toBeUndefined();
  });

  it('applies defaults', () => {
    const prefs = withDefaults({});
    expect(prefs.language).toBe('en');
    expect(prefs.theme).toBe('system');
  });
});
