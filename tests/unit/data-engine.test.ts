import { describe, it, expect } from 'vitest';
import { dataEngine } from '@/data-engine';
import { sampleJsonInput } from '../fixtures';

describe('DataEngine', () => {
  it('beautifies JSON', async () => {
    const res = await dataEngine.run(sampleJsonInput, 'beautify', 'json');
    expect(res.ok).toBe(true);
    expect(res.output).toContain('"hello"');
  });

  it('minifies JSON', async () => {
    const res = await dataEngine.run(sampleJsonInput, 'minify', 'json');
    expect(res.ok).toBe(true);
    expect(res.output?.includes('\n')).toBe(false);
  });

  it('encodes base64', async () => {
    const res = await dataEngine.run('hello', 'encode', 'text', 'base64');
    expect(res.ok).toBe(true);
    expect(res.output).toBeTruthy();
  });

  it('rejects invalid JSON on validate', async () => {
    const res = await dataEngine.run('{bad', 'validate', 'json');
    expect(res.ok).toBe(false);
  });
});
