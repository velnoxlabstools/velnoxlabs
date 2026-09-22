import { describe, it, expect } from 'vitest';
import { configurationValidator } from '@/tool-engine/configuration/validators';
import { toolBuilder } from '@/tool-engine/configuration/builders';
import { sampleToolConfig } from '../fixtures';

describe('Configuration Engine', () => {
  it('builds defaults from partial config', () => {
    const built = toolBuilder.build(sampleToolConfig);
    expect(built.slug).toBe('json-formatter');
    expect(built.buttons?.length).toBeGreaterThan(0);
  });

  it('rejects missing required fields', () => {
    const result = configurationValidator.validate({ name: 'x' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
