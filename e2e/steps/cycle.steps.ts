import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for cycle E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for the cycle system.
 */

export async function completeCharacterCreation(page: Page) {
  const creationInput = page.getByTestId('creation-name-input');
  if (await creationInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await creationInput.fill('Brother Test');
    await creationInput.press('Enter');

    // Pick first background
    const firstBackground = page.locator('[data-testid^="creation-background-"]').first();
    await firstBackground.click();

    // Allocate all remaining stat points (each stat starts at 1, need to fill to total)
    const stats = ['acuity', 'body', 'heart', 'will'];
    for (const stat of stats) {
      const plusButton = page.getByTestId(`creation-stat-${stat}-plus`);
      while (await plusButton.isEnabled({ timeout: 500 }).catch(() => false)) {
        await plusButton.click();
        await page.waitForTimeout(50);
      }
    }

    // Continue to belongings step
    await page.getByTestId('creation-allocate-next').click();

    // Select first 2 belongings
    const belongings = page.locator('[data-testid^="creation-belonging-"]');
    await belongings.first().click();
    await belongings.nth(1).click();

    // Continue to initiation step
    await page.getByTestId('creation-belongings-next').click();

    // Choose first approach in initiation scene
    const firstApproach = page.locator('[data-testid^="creation-approach-"]').first();
    await firstApproach.click();

    // Confirm character creation
    await page.getByTestId('creation-confirm').click();
  }
}

export async function dismissTownArrival(page: Page) {
  // Click through all TownArrival phases (NARRATIVE, OBSERVATION, RUMORS)
  // Each click re-renders the component, so we re-query each iteration
  for (let i = 0; i < 5; i++) {
    const continueBtn = page.getByText('Continue...');
    if (await continueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await continueBtn.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    } else {
      break;
    }
  }
  // Handle GREET phase — "Look around first" skips the greeting dialogue
  const lookAround = page.getByText('Look around first');
  if (await lookAround.isVisible({ timeout: 1000 }).catch(() => false)) {
    await lookAround.click();
  }
}

export async function navigateToGame(page: Page) {
  await page.goto('/');
  // Select first town (Bridal Falls) from town selection screen
  const selectButton = page.getByTestId('select-town-bridal-falls');
  if (await selectButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await selectButton.click();
  }
  // Handle character creation if it appears
  await completeCharacterCreation(page);
  // Handle town arrival sequence if it appears
  await dismissTownArrival(page);
}

export async function startDay(page: Page) {
  await page.getByTestId('start-day-button').click();
}

export async function selectFirstAvailableDie(page: Page) {
  const die = page.getByTestId('die').first();
  await die.click();
  return die;
}

export async function selectDieByIndex(page: Page, index: number) {
  const die = page.getByTestId('die').nth(index);
  await die.click();
  return die;
}

export async function assignDieToAction(page: Page, actionName: string) {
  // Find action card containing the action name and click it
  const actionCard = page.locator('[data-testid="action-card"]', { hasText: actionName });
  await actionCard.click();
}

export async function confirmAllocations(page: Page) {
  await page.getByTestId('confirm-allocations-button').click();
}

export async function continuePastSummary(page: Page) {
  await page.getByTestId('continue-button').click();
}

export async function goToNextDay(page: Page) {
  await page.getByTestId('next-day-button').click();
}

export async function restEarly(page: Page) {
  await page.getByTestId('rest-early-button').click();
}

export async function expectDayNumber(page: Page, day: number) {
  await expect(page.getByTestId('day-number')).toContainText(`Day ${day}`);
}

export async function expectDicePoolVisible(page: Page) {
  await expect(page.getByTestId('dice-pool')).toBeVisible();
}

export async function expectActionPanelVisible(page: Page) {
  await expect(page.getByTestId('action-panel')).toBeVisible();
}

export async function expectCycleSummaryVisible(page: Page) {
  await expect(page.getByTestId('cycle-summary-overlay')).toBeVisible();
}

export async function expectWakeOverlayVisible(page: Page) {
  await expect(page.getByTestId('cycle-wake-overlay')).toBeVisible();
}

export async function expectRestOverlayVisible(page: Page) {
  await expect(page.getByTestId('cycle-rest-overlay')).toBeVisible();
}

export async function getDiceCount(page: Page): Promise<number> {
  return page.getByTestId('die').count();
}

export async function getActionCardByName(page: Page, actionName: string) {
  return page.locator('[data-testid="action-card"]', { hasText: actionName });
}

export async function navigateToLocation(page: Page, locationId: string) {
  await page.getByTestId(`map-node-${locationId}`).click();
}

export async function expectResolveScreenVisible(page: Page) {
  await expect(page.getByTestId('resolve-continue-button')).toBeVisible();
}

export async function continuePastResolve(page: Page) {
  await page.getByTestId('resolve-continue-button').click();
}

export async function assignDieToFirstAvailableAction(page: Page) {
  const actionCard = page.locator('[data-testid="action-card"]').first();
  await actionCard.click();
}
