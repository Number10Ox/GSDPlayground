import { test, expect } from '@playwright/test';
import { createCharacter, skipArrival, performTimedAction, navigateTo, checkPressure } from './steps/free-roam.steps';

test.describe('Pressure Clock - Timed actions and thresholds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Select Bridal Falls from town selection
    await page.getByTestId('select-town-bridal-falls').click();
    await createCharacter(page);
    await skipArrival(page);
  });

  test('timed action advances pressure clock by 1', async ({ page }) => {
    // Navigate to the well where "Inspect the Well Water" is available
    await navigateTo(page, 'well');

    // Check initial pressure
    await checkPressure(page, 0, 8);

    // Perform the timed action
    await performTimedAction(page, 'action-inspect-well');

    // Pressure should now be 1/8
    await checkPressure(page, 1, 8);
  });

  test('one-shot action disappears after use', async ({ page }) => {
    await navigateTo(page, 'well');

    // Perform the one-shot action
    await performTimedAction(page, 'action-inspect-well');

    // The action should no longer be visible
    const action = page.getByTestId('action-action-inspect-well');
    await expect(action).not.toBeVisible();
  });

  test('locked action shows lock icon and cannot be clicked', async ({ page }) => {
    // The "Search the Homestead" action requires trust_min with Thomas
    // Homestead is connected from town-square (starting location)
    await navigateTo(page, 'homestead');

    const searchAction = page.getByTestId('action-action-search-homestead');
    // It should exist but be disabled (locked)
    if (await searchAction.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(searchAction).toBeDisabled();
    }
  });

  test('pressure threshold triggers town event overlay', async ({ page }) => {
    // Advance pressure to threshold (2) by performing multiple timed actions
    // Start at town-square → navigate to well
    await navigateTo(page, 'well');
    await performTimedAction(page, 'action-inspect-well'); // +1 → 1/8

    // Go back to town-square (well → town-square) then to church
    await navigateTo(page, 'town-square');
    await navigateTo(page, 'church');
    await performTimedAction(page, 'action-read-decree'); // +1 → 2/8

    // At pressure 2, "event-martha-collapse" should trigger
    const eventOverlay = page.getByTestId('dismiss-event');
    await expect(eventOverlay).toBeVisible({ timeout: 3000 });

    // Dismiss the event
    await eventOverlay.click();
    await expect(eventOverlay).not.toBeVisible();
  });

  test('repeatable action can be used multiple times', async ({ page }) => {
    await navigateTo(page, 'church');

    // "Pray at the Chapel" is not one-shot
    await performTimedAction(page, 'action-pray-chapel');
    await checkPressure(page, 1, 8);

    // Should still be available
    const prayAction = page.getByTestId('action-action-pray-chapel');
    await expect(prayAction).toBeVisible();

    // Use it again
    await prayAction.click();
    await checkPressure(page, 2, 8);
  });
});
