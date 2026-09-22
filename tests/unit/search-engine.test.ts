import { describe, it, expect } from 'vitest';
import { searchEngine } from '@/search/engine';

describe('SearchEngine', () => {
  it('returns hits for known terms', () => {
    const res = searchEngine.search({ q: 'json' });
    expect(res.query).toBe('json');
    expect(Array.isArray(res.hits)).toBe(true);
  });

  it('sanitizes empty query', () => {
    const res = searchEngine.search({ q: '   ' });
    expect(res.hits).toHaveLength(0);
  });

  it('provides suggestions shape', () => {
    const suggestions = searchEngine.suggest('j');
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
