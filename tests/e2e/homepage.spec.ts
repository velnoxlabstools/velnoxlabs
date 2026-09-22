import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows brand', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VelnoxLabs/i);
  });
});
