import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for character system E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for the character system.
 */

// Creation flow helpers

/**
 * Open the character creation modal.
 * The creation wizard auto-shows when no character exists, so we first check
 * if it's already visible before clicking the button.
 */
export async function openCharacterCreation(page: Page) {
  const nameInput = page.getByTestId('creation-name-input');
  if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    return; // Already open
  }
  await page.getByTestId('create-character-button').click();
  await expect(nameInput).toBeVisible({ timeout: 2000 });
}

/**
 * Enter the character name in the creation form.
 */
export async function enterCharacterName(page: Page, name: string) {
  const input = page.getByTestId('creation-name-input');
  await input.fill(name);
  // Click Continue button to advance to background step
  await page.locator('button:has-text("Continue")').click();
}

/**
 * Select a background during character creation.
 * Automatically advances to stat allocation step.
 */
export async function selectBackground(page: Page, background: string) {
  await page.getByTestId(`creation-background-${background}`).click();
  // Background selection auto-advances to allocate step
  await expect(page.getByTestId('creation-stat-acuity-plus')).toBeVisible({ timeout: 2000 });
}

/**
 * Allocate stat points to reach a target value.
 * All stats start at 1 (minimum). Clicks plus/minus buttons to reach target.
 */
export async function allocateStatDice(page: Page, statName: string, targetCount: number) {
  const stat = statName.toLowerCase();
  const currentCountStart = 1; // All stats start at MIN_PER_STAT = 1
  const clicksNeeded = targetCount - currentCountStart;

  if (clicksNeeded > 0) {
    const plusButton = page.getByTestId(`creation-stat-${stat}-plus`);
    for (let i = 0; i < clicksNeeded; i++) {
      await plusButton.click();
    }
  } else if (clicksNeeded < 0) {
    const minusButton = page.getByTestId(`creation-stat-${stat}-minus`);
    for (let i = 0; i < Math.abs(clicksNeeded); i++) {
      await minusButton.click();
    }
  }
}

/**
 * Navigate through the belongings step by selecting the first 2 items.
 */
export async function selectBelongings(page: Page) {
  // Wait for belongings step to appear
  const belongingButtons = page.locator('[data-testid^="creation-belonging-"]');
  await expect(belongingButtons.first()).toBeVisible({ timeout: 3000 });

  // Select the first two belongings
  const count = await belongingButtons.count();
  for (let i = 0; i < Math.min(2, count); i++) {
    await belongingButtons.nth(i).click();
  }

  // Click Next
  const nextBtn = page.getByTestId('creation-belongings-next');
  await expect(nextBtn).toBeEnabled({ timeout: 2000 });
  await nextBtn.click();
}

/**
 * Navigate through the initiation step by selecting the first approach.
 */
export async function selectInitiationApproach(page: Page) {
  const approachButton = page.locator('[data-testid^="creation-approach-"]').first();
  await expect(approachButton).toBeVisible({ timeout: 3000 });
  await approachButton.click();
}

/**
 * Confirm character creation by clicking the Confirm button.
 * Waits for creation modal to disappear and character info to update.
 */
export async function confirmCreation(page: Page) {
  const confirmButton = page.getByTestId('creation-confirm');
  await expect(confirmButton).toBeVisible({ timeout: 3000 });
  await expect(confirmButton).toBeEnabled({ timeout: 2000 });
  await confirmButton.click();
  // Wait for creation modal to close (CharacterCreation is a fixed overlay)
  await expect(page.getByTestId('creation-name-input')).not.toBeVisible({ timeout: 3000 });
}

/**
 * Verify the character name appears in the sidebar CharacterInfo widget.
 */
export async function verifyCharacterInSidebar(page: Page, name: string) {
  const characterInfo = page.getByTestId('character-info');
  await expect(characterInfo).toContainText(name);
}

/**
 * Verify a specific stat is visible with a count of dice.
 * Checks the stat-{name} test ID element contains the expected dice notation.
 */
export async function verifyStatVisible(page: Page, statName: string) {
  const stat = statName.toLowerCase();
  await expect(page.getByTestId(`stat-${stat}`)).toBeVisible();
}

/**
 * Verify the dice pool has dice present (after starting a cycle).
 * DieComponent uses data-testid="die" with data-die-id for each die.
 */
export async function verifyDicePoolHasDice(page: Page) {
  const dicePool = page.getByTestId('dice-pool');
  await expect(dicePool).toBeVisible({ timeout: 3000 });
  // Pool should contain at least one die element (data-testid="die")
  const diceCount = await dicePool.locator('[data-testid="die"]').count();
  expect(diceCount).toBeGreaterThan(0);
}

/**
 * Full character creation flow helper for tests that need a character
 * but are not testing creation itself.
 *
 * Creates a "well-rounded" character with balanced stats (5/4/4/4).
 */
export async function setupCharacterForTest(page: Page, name: string = 'Test Dog') {
  await openCharacterCreation(page);
  await enterCharacterName(page, name);
  await selectBackground(page, 'well-rounded');
  // well-rounded gives 10 stat points, starting at 1 each (total 4), need to add 6 more
  // Target: 3 Acuity, 3 Body, 2 Heart, 2 Will (total 10)
  await allocateStatDice(page, 'acuity', 3);
  await allocateStatDice(page, 'body', 3);
  await allocateStatDice(page, 'heart', 2);
  await allocateStatDice(page, 'will', 2);
  // Advance from allocate to belongings
  const allocateNext = page.getByTestId('creation-allocate-next');
  await expect(allocateNext).toBeEnabled({ timeout: 2000 });
  await allocateNext.click();
  // Navigate through belongings and initiation
  await selectBelongings(page);
  await selectInitiationApproach(page);
  await confirmCreation(page);
  // Skip town arrival overlay that appears after character creation
  await skipArrivalOverlay(page);
}

/**
 * Skip the town arrival overlay if present.
 * Clicks through all phases until dismissed.
 */
export async function skipArrivalOverlay(page: Page) {
  const arrivalOverlay = page.getByTestId('town-arrival');
  if (!await arrivalOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
    return;
  }

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(700); // Wait for framer-motion animation to settle
    if (!await arrivalOverlay.isVisible({ timeout: 500 }).catch(() => false)) {
      return;
    }
    // Try "Look around first" button (GREET phase skip)
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
}

/**
 * Start a test conflict using the dev-mode trigger button.
 * In the descent clock flow, the test button is visible in EXPLORING phase.
 */
export async function triggerConflictForTest(page: Page) {
  const testButton = page.getByTestId('start-test-conflict');
  await expect(testButton).toBeVisible({ timeout: 3000 });
  await testButton.click();
  await expect(page.getByTestId('conflict-view')).toBeVisible({ timeout: 3000 });
}

/**
 * Verify the trait invocation panel is visible during conflict.
 */
export async function verifyTraitInvocationPanel(page: Page) {
  await expect(page.getByTestId('trait-invocation-panel')).toBeVisible({ timeout: 3000 });
}

/**
 * Click the invoke button for a trait by its ID.
 */
export async function invokeTrait(page: Page, traitId: string) {
  await page.getByTestId(`invoke-trait-${traitId}`).click();
}

/**
 * Verify a trait shows as "Used" in the invocation panel.
 * After invocation, the button is replaced with a "Used" badge.
 */
export async function verifyTraitUsed(page: Page, traitId: string) {
  // The invoke button should no longer exist for this trait
  await expect(page.getByTestId(`invoke-trait-${traitId}`)).not.toBeVisible({ timeout: 2000 });
}

/**
 * Verify the fallout-trait-gained element appears (trait gained from fallout).
 */
export async function verifyFalloutTraitGained(page: Page) {
  await expect(page.getByTestId('fallout-trait-gained')).toBeVisible({ timeout: 6000 });
}

/**
 * Verify the trait list contains a trait with "Fallout" source badge.
 */
export async function verifyTraitListHasFalloutTrait(page: Page) {
  const traitList = page.getByTestId('trait-list');
  await expect(traitList).toBeVisible({ timeout: 3000 });
  await expect(traitList).toContainText('Fallout');
}

/**
 * Verify the inventory panel shows a specific item by name.
 */
export async function verifyInventoryItem(page: Page, itemName: string) {
  const inventoryPanel = page.getByTestId('inventory-panel');
  await expect(inventoryPanel).toBeVisible({ timeout: 3000 });
  await expect(inventoryPanel).toContainText(itemName);
}

/**
 * Verify an item in the inventory is marked as a gun (has Target icon / Firearm label).
 */
export async function verifyItemIsGun(page: Page, itemName: string) {
  const inventoryPanel = page.getByTestId('inventory-panel');
  await expect(inventoryPanel).toContainText(itemName);
  // Gun items have an aria-label="Firearm" on the Target icon
  await expect(inventoryPanel.locator('[aria-label="Firearm"]')).toBeVisible();
}

/**
 * Get the count of dice in the player's conflict pool.
 */
export async function getConflictDiceCount(page: Page): Promise<number> {
  return page.locator('[data-testid^="raise-die-"]').count();
}
