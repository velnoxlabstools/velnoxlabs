export const RegressionTestSuite = {
  name: 'regression',
  policy: 'Every bugfix must add a unit or e2e case under tests/',
  criticalPaths: [
    'tool-registration',
    'search-ranking',
    'json-transform',
    'export-download',
    'preference-persist',
  ],
};
