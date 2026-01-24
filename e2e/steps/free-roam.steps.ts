import { Page, expect } from '@playwright/test';

/**
 * Helper: Create a character through the multi-step wizard.
 * Steps: name → background → allocate stats → belongings → initiation
 */
export async function createCharacter(page: Page) {
  // Wait for the name input step to appear
  const nameInput = page.getByTestId('creation-name-input');
  if (!await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    return; // Character already exists
  }

  // Step 1: Enter name
  await nameInput.fill('Test Dog');
  await page.locator('button:has-text("Continue")').click();

  // Step 2: Select well-rounded background (10 stat points)
  const bgButton = page.getByTestId('creation-background-well-rounded');
  await expect(bgButton).toBeVisible({ timeout: 3000 });
  await bgButton.click();

  // Step 3: Allocate stats (well-rounded gives 10 total, starting 4 at 1 each = 6 to distribute)
  // Target: 3+3+2+2 = 10
  const plusAcuity = page.getByTestId('creation-stat-acuity-plus');
  await expect(plusAcuity).toBeVisible({ timeout: 3000 });
  for (let i = 0; i < 2; i++) await plusAcuity.click(); // 1 → 3
  const plusBody = page.getByTestId('creation-stat-body-plus');
  for (let i = 0; i < 2; i++) await plusBody.click(); // 1 → 3
  const plusHeart = page.getByTestId('creation-stat-heart-plus');
  await plusHeart.click(); // 1 → 2
  const plusWill = page.getByTestId('creation-stat-will-plus');
  await plusWill.click(); // 1 → 2

  const allocateNext = page.getByTestId('creation-allocate-next');
  await expect(allocateNext).toBeEnabled({ timeout: 2000 });
  await allocateNext.click();

  // Step 4: Belongings — select first 2 items then click Next
  const belongingButtons = page.locator('[data-testid^="creation-belonging-"]');
  await expect(belongingButtons.first()).toBeVisible({ timeout: 3000 });
  const count = await belongingButtons.count();
  for (let i = 0; i < Math.min(2, count); i++) {
    await belongingButtons.nth(i).click();
  }
  const belongingsNext = page.getByTestId('creation-belongings-next');
  await expect(belongingsNext).toBeEnabled({ timeout: 2000 });
  await belongingsNext.click();

  // Step 5: Initiation — pick first approach then advance to convictions
  const approachButton = page.locator('[data-testid^="creation-approach-"]').first();
  await expect(approachButton).toBeVisible({ timeout: 3000 });
  await approachButton.click();

  // Advance from initiation to convictions step
  const toConvictions = page.getByTestId('creation-to-convictions');
  await expect(toConvictions).toBeEnabled({ timeout: 3000 });
  await toConvictions.click();

  // Step 6: Convictions — select 3 seeds and confirm
  const firstSeed = page.getByTestId('conviction-seed-mercy-faithful');
  await expect(firstSeed).toBeVisible({ timeout: 3000 });
  await firstSeed.click();
  await page.getByTestId('conviction-seed-justice-punished').click();
  await page.getByTestId('conviction-seed-faith-doctrine').click();

  const convictionConfirm = page.getByTestId('conviction-confirm');
  await expect(convictionConfirm).toBeEnabled({ timeout: 2000 });
  await convictionConfirm.click();

  // Wait for creation to dismiss
  await expect(nameInput).not.toBeVisible({ timeout: 3000 });
}

/**
 * Helper: Skip town arrival sequence if present.
 * The arrival has multiple phases (NARRATIVE → OBSERVATION → RUMORS → GREET).
 * Click through all "Continue" buttons until the overlay is gone.
 * Uses force:true because framer-motion animations can make elements unstable.
 */
export async function skipArrival(page: Page) {
  const arrivalOverlay = page.getByTestId('town-arrival');
  if (!await arrivalOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    return; // No arrival overlay
  }

  // Click through arrival phases until dismissed or "Look around first" appears
  for (let i = 0; i < 6; i++) {
    // Wait for animation to settle
    await page.waitForTimeout(700);

    // Check if arrival is still visible
    if (!await arrivalOverlay.isVisible({ timeout: 500 }).catch(() => false)) {
      return;
    }

    // Try the "Look around first" button (GREET phase skip)
    const lookAround = page.locator('button:has-text("Look around first")');
    if (await lookAround.isVisible({ timeout: 500 }).catch(() => false)) {
      await lookAround.click({ force: true });
      await expect(arrivalOverlay).not.toBeVisible({ timeout: 3000 });
      return;
    }

    // Otherwise click Continue (force through animations)
    const continueBtn = page.getByTestId('arrival-continue');
    if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await continueBtn.click({ force: true });
    }
  }

  // Final check — overlay should be gone
  await expect(arrivalOverlay).not.toBeVisible({ timeout: 5000 });
}

/**
 * Helper: Perform a timed action by clicking it in the ActionMenu.
 */
export async function performTimedAction(page: Page, actionId: string) {
  await page.getByTestId(`action-${actionId}`).click();
}

/**
 * Helper: Start a conflict from the ActionMenu.
 */
export async function startConflictFromMenu(page: Page, conflictId: string) {
  await page.getByTestId(`conflict-${conflictId}`).click();
}

/**
 * Helper: Check the current descent clock value.
 */
export async function checkDescent(page: Page, expectedFilled: number, expectedTotal: number) {
  const descentText = page.locator('text=' + `${expectedFilled}/${expectedTotal}`);
  await expect(descentText).toBeVisible();
}

/**
 * Helper: Navigate to a location via the map node.
 */
export async function navigateTo(page: Page, locationId: string) {
  await page.getByTestId(`map-node-${locationId}`).click();
}
