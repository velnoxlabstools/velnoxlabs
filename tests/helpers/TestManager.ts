/**
 * Lightweight orchestration helpers for local/CI test runs.
 */
export class TestManager {
  suites() {
    return {
      unit: 'tests/unit',
      integration: 'tests/integration',
      e2e: 'tests/e2e',
    } as const;
  }

  commands() {
    return {
      unit: 'pnpm test:unit',
      integration: 'pnpm test:integration',
      e2e: 'pnpm test:e2e',
      coverage: 'pnpm test:coverage',
    } as const;
  }
}

export const testManager = new TestManager();
