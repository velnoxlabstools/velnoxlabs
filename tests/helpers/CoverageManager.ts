export class CoverageManager {
  /** Target thresholds for CI gates */
  thresholds() {
    return {
      lines: 40,
      functions: 40,
      branches: 30,
      statements: 40,
    } as const;
  }

  reportDir() {
    return 'tests/coverage';
  }
}

export const coverageManager = new CoverageManager();
