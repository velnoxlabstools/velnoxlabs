import { describe, it, expect } from 'vitest';
import { validateBatch3Engines, batch3Ready } from '@/platform/batch3';

describe('Platform Batch3 health', () => {
  it('exposes engine APIs', () => {
    const health = validateBatch3Engines();
    expect(health.dataEngine).toBe(true);
    expect(health.search).toBe(true);
    expect(health.exchange).toBe(true);
    expect(health.preferences).toBe(true);
    expect(batch3Ready()).toBe(true);
  });
});
