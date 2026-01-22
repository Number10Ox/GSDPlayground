import { test, expect } from './fixtures/base';

test('app loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Dogs in the Vineyard|Vite/);
});
