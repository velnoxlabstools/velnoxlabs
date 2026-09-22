export const PerformanceTestSuite = {
  name: 'performance',
  budgets: {
    lcpMs: 2500,
    cls: 0.1,
    inpMs: 200,
  },
  checks: ['core-web-vitals', 'lazy-loading', 'cache-headers', 'bundle-size'],
};
