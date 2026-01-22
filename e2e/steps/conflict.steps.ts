import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for conflict E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for the conflict system.
 */

// Setup helpers

/**
 * Start a test conflict by clicking the dev-mode test conflict button.
 * This triggers a conflict with predefined NPC and stakes for testing.
 */
export async function startConflict(page: Page, npcName: string, stakes: string) {
  // Click test conflict button (dev mode only)
  await page.getByTestId('start-test-conflict').click();
  await expect(page.getByTestId('conflict-view')).toBeVisible();
  await expect(page.getByTestId('conflict-stakes')).toContainText(stakes);
}

// Raise/See helpers

/**
 * Raise with a specified number of dice.
 * Selects the first N available dice and submits the raise.
 */
export async function raiseWithDice(page: Page, count: number = 2) {
  // Select 'count' dice from player pool
  const dice = page.locator('[data-testid^="raise-die-"]');
  for (let i = 0; i < count; i++) {
    await dice.nth(i).click();
  }
  await page.getByTestId('raise-submit-button').click();
}

/**
 * See the current raise with a specified number of dice.
 */
export async function seeWithDice(page: Page, count: number) {
  // Select dice to meet raise total
  const dice = page.locator('[data-testid^="raise-die-"]');
  for (let i = 0; i < count; i++) {
    await dice.nth(i).click();
  }
  await page.getByTestId('see-submit-button').click();
}

/**
 * Give up in the current conflict.
 */
export async function giveUp(page: Page) {
  await page.getByTestId('give-button').click();
  // Confirm give dialog
  const confirmBtn = page.getByTestId('give-confirm-button');
  if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmBtn.click();
  }
}

// Escalation helpers

/**
 * Click escalate button for a given level.
 * Opens the escalation confirmation modal.
 */
export async function escalateTo(page: Page, level: string) {
  await page.getByTestId(`escalate-${level.toLowerCase()}-button`).click();
  await expect(page.getByTestId('escalation-confirm-modal')).toBeVisible();
}

/**
 * Confirm the escalation in the modal.
 * For GUNPLAY, waits for the button to become enabled.
 */
export async function confirmEscalation(page: Page) {
  const confirmBtn = page.getByTestId('escalation-confirm-button');
  // Wait for button to be enabled (handles GUNPLAY delay)
  await expect(confirmBtn).toBeEnabled({ timeout: 3000 });
  await confirmBtn.click();
}

/**
 * Cancel the escalation in the modal.
 */
export async function cancelEscalation(page: Page) {
  await page.locator('[data-testid="escalation-confirm-modal"]').locator('button:has-text("Step Back")').click();
}

// Verification helpers

/**
 * Verify the player or NPC is at a specific escalation level.
 */
export async function verifyEscalationLevel(page: Page, actor: 'player' | 'npc', level: string) {
  await expect(page.getByTestId(`${actor}-escalation-${level.toLowerCase()}`)).toBeVisible();
}

/**
 * Verify the bidding history contains specific text.
 */
export async function verifyBiddingHistoryEntry(page: Page, text: string) {
  await expect(page.getByTestId('bidding-history')).toContainText(text);
}

/**
 * Verify the conflict has resolved (resolution screen visible).
 */
export async function verifyConflictResolved(page: Page) {
  await expect(page.getByTestId('conflict-resolution')).toBeVisible();
}

/**
 * Verify the fallout severity indicator shows a specific severity.
 */
export async function verifyFalloutSeverity(page: Page, severity: string) {
  await expect(page.getByTestId(`fallout-severity-${severity.toLowerCase()}`)).toBeVisible();
}

// NPC memory helpers

/**
 * Verify a conflict marker is visible for a specific NPC.
 */
export async function verifyConflictMarker(page: Page, npcId: string) {
  await expect(page.getByTestId(`conflict-marker-${npcId}`)).toBeVisible();
}

/**
 * Open the relationship panel for a specific NPC.
 */
export async function openRelationshipPanel(page: Page, npcId: string) {
  await page.getByTestId(`npc-button-${npcId}`).click();
  await expect(page.getByTestId('relationship-panel')).toBeVisible();
}

// Wait helpers

/**
 * Wait for NPC turn to complete (NPC thinking indicator disappears).
 */
export async function waitForNPCTurn(page: Page) {
  // Wait for NPC to take their turn - the turn indicator changes back to player
  // Give NPCs 1-2 seconds "thinking" time plus buffer
  await page.waitForTimeout(2500);
}

/**
 * Dismiss the resolution screen and continue.
 */
export async function dismissResolution(page: Page) {
  await page.getByTestId('resolution-continue-button').click();
}

/**
 * Wait for the fallout reveal animation to complete.
 */
export async function waitForFalloutReveal(page: Page) {
  await expect(page.getByTestId('fallout-reveal')).toBeVisible();
  // Wait for reveal animation phases (gathering + rolling + calculation + verdict)
  await page.waitForTimeout(4500);
}

/**
 * Get the count of dice available for raising/seeing.
 */
export async function getAvailableDiceCount(page: Page): Promise<number> {
  return page.locator('[data-testid^="raise-die-"]').count();
}
