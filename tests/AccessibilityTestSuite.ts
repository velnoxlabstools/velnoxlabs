/**
 * Accessibility test checklist executed via Playwright + axe (optional later).
 */
export const AccessibilityTestSuite = {
  name: 'accessibility',
  checks: [
    'keyboard-navigation',
    'aria-labels',
    'focus-order',
    'semantic-html',
    'reduced-motion-preference',
  ],
  e2eHints: [
    'Tab through header search and primary nav',
    'Verify skip link targets main content',
    'Ensure dialogs trap focus when open',
  ],
};
