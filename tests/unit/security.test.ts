import { describe, it, expect } from 'vitest';
import { slugValidator } from '@/security/validators';
import { inputSanitizer } from '@/security/sanitizers';

describe('Security', () => {
  it('validates slug format', () => {
    expect(slugValidator.validate('json-formatter').valid).toBe(true);
    expect(slugValidator.validate('Bad Slug').valid).toBe(false);
  });

  it('escapes HTML input', () => {
    const out = inputSanitizer.html('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;');
  });
});
