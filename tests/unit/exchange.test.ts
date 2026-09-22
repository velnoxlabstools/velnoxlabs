import { describe, it, expect } from 'vitest';
import { exportManager } from '@/exchange-engine/export';

describe('Exchange ExportManager', () => {
  it('exports JSON text', () => {
    const res = exportManager.export({
      data: { a: 1 },
      format: 'json',
      filename: 'test',
    });
    expect(res.ok).toBe(true);
    expect(res.filename).toBe('test.json');
    expect(res.text).toContain('"a"');
  });
});
