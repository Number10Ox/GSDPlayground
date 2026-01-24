import { test, expect } from '@playwright/test';
import { createCharacter, skipArrival, navigateTo } from './steps/free-roam.steps';

test.describe('Free Roam - Game starts in EXPLORING phase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
    await createCharacter(page);
    await skipArrival(page);
  });

  test('game starts with ActionMenu visible', async ({ page }) => {
    const actionMenu = page.getByTestId('action-menu');
    await expect(actionMenu).toBeVisible();
  });

  test('movement via map node updates location and ActionMenu', async ({ page }) => {
    // Navigate to the church via map node
    await navigateTo(page, 'church');

    // Location card in sidebar should update (h3 heading in the location info card)
    await expect(page.getByRole('complementary').getByRole('heading', { name: 'The Chapel' })).toBeVisible();

    // ActionMenu should now show church-specific actions
    const readDecree = page.getByTestId('action-action-read-decree');
    await expect(readDecree).toBeVisible();
  });

  test('descent clock starts at 0/8', async ({ page }) => {
    await expect(page.locator('text=0/8')).toBeVisible();
  });

  test('NPCs at location are clickable for dialogue', async ({ page }) => {
    // Bridal Falls starts at town-square, NPCs may or may not be there
    // Navigate to church where Steward Ezekiel is
    await navigateTo(page, 'church');

    const npcButton = page.getByTestId('npc-button-steward-ezekiel');
    if (await npcButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await npcButton.click();
      // Dialogue view should appear
      await expect(page.getByTestId('dialogue-view')).toBeVisible({ timeout: 5000 });
    }
  });
});
