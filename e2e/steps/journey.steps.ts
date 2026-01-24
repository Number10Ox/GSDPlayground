import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for journey flow E2E tests.
 *
 * These helpers cover the journey flow: town completion, conviction reflection,
 * and multi-town progression. The journey phases are:
 * TOWN_ACTIVE -> TOWN_REFLECTION -> RIDING_ON -> (next town or JOURNEY_COMPLETE)
 *
 * Dev-mode buttons in GameView.tsx provide triggers for:
 * - Testing a conviction (ADD_CONVICTION_TEST)
 * - Completing a town (COMPLETE_TOWN + SET_PHASE: TOWN_REFLECTION)
 */

// ---- Town Completion Helpers ----

/**
 * Trigger a conviction test via dev-mode button.
 * This dispatches ADD_CONVICTION_TEST for the first active conviction,
 * marking it as 'tested' for reflection.
 */
export async function triggerConvictionTest(page: Page) {
  const button = page.getByTestId('dev-trigger-test-conviction');
  await expect(button).toBeVisible({ timeout: 3000 });
  await button.click();
  // Brief wait for state update
  await page.waitForTimeout(300);
}

/**
 * Complete the current town via dev-mode button.
 * This dispatches COMPLETE_TOWN with a minimal TownRecord and
 * SET_PHASE: TOWN_REFLECTION to enter the reflection phase.
 * The JourneyRouter will then show ConvictionReflection or JourneyProgress.
 */
export async function completeTown(page: Page) {
  const button = page.getByTestId('dev-complete-town');
  await expect(button).toBeVisible({ timeout: 3000 });
  await button.click();
  // Wait for phase transition to take effect
  await page.waitForTimeout(500);
}

// ---- Judgment Helpers ----

/**
 * Complete a judgment in the JudgmentPanel.
 * Selects a judgment choice (first by default), confirms it, and dismisses.
 *
 * @param page - Playwright page
 * @param choiceLabel - Label of the judgment choice to select (optional, defaults to first)
 */
export async function completeJudgment(page: Page, choiceLabel?: string) {
  // Wait for JudgmentPanel to be visible
  await expect(page.locator('text=Pronounce Judgment')).toBeVisible({ timeout: 5000 });

  // Select a judgment choice
  if (choiceLabel) {
    await page.locator(`button:has-text("${choiceLabel}")`).click();
  } else {
    // Click the first judgment choice button
    const choices = page.locator('[class*="border-gray-700"][class*="bg-gray-800"] button').first();
    // Find the judgment choice buttons (they're inside .space-y-2 div)
    const choiceButtons = page.locator('button:has(p.text-sm.font-medium)');
    await choiceButtons.first().click();
  }

  // Confirm the judgment
  const confirmButton = page.locator('button:has-text("Confirm Judgment")');
  await expect(confirmButton).toBeEnabled({ timeout: 2000 });
  await confirmButton.click();

  // Wait for "Judgment Pronounced" outcome screen
  await expect(page.locator('text=Judgment Pronounced')).toBeVisible({ timeout: 3000 });

  // Click Continue to dismiss
  await page.locator('button:has-text("Continue")').click();
  await page.waitForTimeout(300);
}

// ---- Conviction Reflection Helpers ----

/**
 * Wait for ConvictionReflection screen to appear.
 * Checks for the "Conviction N of M" heading text.
 */
export async function waitForReflection(page: Page) {
  await expect(page.locator('text=/Conviction \\d+ of \\d+/')).toBeVisible({ timeout: 5000 });
}

/**
 * Reinforce the current conviction during reflection.
 * Clicks the "Reinforce" button.
 */
export async function reinforceConviction(page: Page) {
  const reinforceButton = page.locator('button:has-text("Reinforce")').first();
  await expect(reinforceButton).toBeVisible({ timeout: 3000 });
  await reinforceButton.click();
  await page.waitForTimeout(300);
}

/**
 * Doubt the current conviction during reflection.
 * Clicks the "Doubt" button.
 */
export async function doubtConviction(page: Page) {
  const doubtButton = page.locator('button:has-text("Doubt")').first();
  await expect(doubtButton).toBeVisible({ timeout: 3000 });
  await doubtButton.click();
  await page.waitForTimeout(300);
}

/**
 * Transform the current conviction during reflection.
 * Clicks "Transform", enters new text, and confirms.
 *
 * @param page - Playwright page
 * @param newText - The new conviction text to enter
 */
export async function transformConviction(page: Page, newText: string) {
  // Click "Transform" to show input
  const transformButton = page.locator('button:has-text("Transform")').first();
  await expect(transformButton).toBeVisible({ timeout: 3000 });
  await transformButton.click();

  // Enter new conviction text
  const input = page.locator('input[placeholder="Write your new conviction..."]');
  await expect(input).toBeVisible({ timeout: 2000 });
  await input.fill(newText);

  // Click the Transform confirm button (inside the transform input area)
  const confirmTransform = page.locator('button:has-text("Transform")').last();
  await confirmTransform.click();
  await page.waitForTimeout(300);
}

/**
 * Handle the "untested convictions" skip screen.
 * When no convictions were tested, ConvictionReflection shows
 * "Your convictions went untested" with a "Ride On" button.
 */
export async function skipUntested(page: Page) {
  await expect(page.locator('text=Your convictions went untested')).toBeVisible({ timeout: 5000 });
  await page.locator('button:has-text("Ride On")').click();
  await page.waitForTimeout(300);
}

// ---- JourneyProgress Helpers ----

/**
 * Wait for the JourneyProgress screen ("The Road Ahead" heading).
 */
export async function waitForJourneyProgress(page: Page) {
  await expect(page.locator('h1:has-text("The Road Ahead")')).toBeVisible({ timeout: 5000 });
}

/**
 * Click "Continue to Next Town" on the JourneyProgress screen.
 * Waits for the town selection screen to appear (indicating TOWN_ACTIVE phase).
 */
export async function advanceToNextTown(page: Page) {
  const continueButton = page.locator('button:has-text("Continue to Next Town")');
  await expect(continueButton).toBeVisible({ timeout: 3000 });
  await continueButton.click();
  // Wait for town selection to appear (back to TOWN_ACTIVE with no selected town)
  await expect(page.getByTestId('town-selection')).toBeVisible({ timeout: 5000 });
}
