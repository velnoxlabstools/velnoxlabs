import { test, expect } from '@playwright/test';

test.describe('Tool pages', () => {
  test('tools index loads', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.locator('body')).toBeVisible();
  });
});
