import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search route is reachable', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
  });
});
