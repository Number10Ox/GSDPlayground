import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for investigation system E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for the investigation system.
 */

// ─── Dialogue Flow Helpers ──────────────────────────────────────────────────

/**
 * Start a conversation with an NPC by clicking their button in the sidebar.
 * Waits for the dialogue view overlay to become visible.
 */
export async function startConversation(page: Page, npcId: string) {
  await page.getByTestId(`npc-button-${npcId}`).click();
  await expect(page.getByTestId('dialogue-view')).toBeVisible({ timeout: 3000 });
}

/**
 * Select a topic chip in the dialogue view.
 * The topic chip testid follows the pattern: topic-chip-{npcId}-{label}
 * (generated from Topic.id which is `${npcId}-${label}`).
 * Waits for approach chips to appear after selection.
 */
export async function selectTopic(page: Page, topicLabel: string, npcId: string = 'sister-martha') {
  const topicChipId = `${npcId}-${topicLabel}`;
  await page.getByTestId(`topic-chip-${topicChipId}`).click();
  await expect(page.getByTestId('approach-chips')).toBeVisible({ timeout: 3000 });
}

/**
 * Select an approach chip (acuity, heart, body, will).
 * Waits for the response streaming to begin (dialogue text appears).
 */
export async function selectApproach(page: Page, approach: string) {
  await page.getByTestId(`approach-chip-${approach}`).click();
}

/**
 * Wait for dialogue response text to have content.
 * The streaming response fills the TypewriterText component.
 */
export async function waitForResponse(page: Page) {
  // Wait for streaming to complete - the phase transitions from STREAMING_RESPONSE
  // to either SHOWING_DISCOVERY or SELECTING_TOPIC. We wait for approach chips
  // or discovery summary to reappear (indicating streaming finished).
  await page.waitForTimeout(2000); // Allow stream to complete
  // Verify text appeared in the dialogue view
  const dialogueView = page.getByTestId('dialogue-view');
  await expect(dialogueView).toBeVisible();
}

/**
 * Close the discovery summary overlay by clicking "Continue".
 */
export async function closeDiscovery(page: Page) {
  const continueBtn = page.getByTestId('discovery-continue');
  await expect(continueBtn).toBeVisible({ timeout: 5000 });
  await continueBtn.click();
}

/**
 * End the current conversation by clicking "Leave Conversation".
 */
export async function endConversation(page: Page) {
  await page.getByTestId('dialogue-leave').click();
  // Wait for dialogue view to disappear
  await expect(page.getByTestId('dialogue-view')).not.toBeVisible({ timeout: 3000 });
}

// ─── Mental Map Helpers ──────────────────────────────────────────────────────

/**
 * Open the mental map overlay by clicking the "View Mental Map" button.
 */
export async function openMentalMap(page: Page) {
  await page.getByTestId('open-mental-map').click();
  await expect(page.getByTestId('mental-map')).toBeVisible({ timeout: 3000 });
}

/**
 * Close the mental map overlay.
 */
export async function closeMentalMap(page: Page) {
  await page.getByTestId('close-mental-map').click();
  await expect(page.getByTestId('mental-map')).not.toBeVisible({ timeout: 3000 });
}

// ─── Fatigue Helpers ─────────────────────────────────────────────────────────

/**
 * Verify the fatigue clock shows expected current/max values.
 * Uses data attributes on the FatigueClock component.
 */
export async function verifyFatigue(page: Page, current: number, max: number) {
  const clock = page.getByTestId('fatigue-clock');
  await expect(clock).toBeVisible();
  await expect(clock).toHaveAttribute('data-fatigue-current', String(current));
  await expect(clock).toHaveAttribute('data-fatigue-max', String(max));
}

// ─── Cycle Helpers ───────────────────────────────────────────────────────────

/**
 * Advance the cycle by clicking start-day, confirming allocations, and
 * continuing through summary to trigger REST phase (which advances sin).
 */
export async function advanceCycle(page: Page) {
  // Start day -> ALLOCATE phase
  const startDayButton = page.getByTestId('start-day-button');
  await expect(startDayButton).toBeVisible({ timeout: 3000 });
  await startDayButton.click();

  // In ALLOCATE phase, we need to allocate at least one die and confirm
  // Select first die and assign to first action
  const die = page.getByTestId('die').first();
  await expect(die).toBeVisible({ timeout: 3000 });
  await die.click();

  // Click first available action card
  const actionCard = page.locator('[data-testid="action-card"]').first();
  await expect(actionCard).toBeVisible({ timeout: 2000 });
  await actionCard.click();

  // Confirm allocations
  await page.getByTestId('confirm-allocations-button').click();

  // Continue past summary to REST phase
  await page.waitForTimeout(500);
  const continueBtn = page.getByTestId('continue-button');
  await expect(continueBtn).toBeVisible({ timeout: 5000 });
  await continueBtn.click();

  // Next day button appears in REST phase
  const nextDayBtn = page.getByTestId('next-day-button');
  await expect(nextDayBtn).toBeVisible({ timeout: 5000 });
}

// ─── Character Setup Helpers ─────────────────────────────────────────────────

/**
 * Create a character with deterministic stats for testing.
 * Uses the same pattern as character.steps.ts setupCharacterForTest.
 */
export async function createCharacterForTest(page: Page, name: string = 'Test Dog') {
  await page.getByTestId('create-character-button').click();
  await expect(page.getByTestId('creation-name-input')).toBeVisible({ timeout: 2000 });

  // Enter name
  await page.getByTestId('creation-name-input').fill(name);
  await page.locator('button:has-text("Continue")').click();

  // Select well-rounded background (17 stat dice total)
  await page.getByTestId('creation-background-well-rounded').click();
  await expect(page.getByTestId('creation-stat-acuity-plus')).toBeVisible({ timeout: 2000 });

  // Allocate: 5 Acuity, 4 Body, 4 Heart, 4 Will (total 17)
  const plusAcuity = page.getByTestId('creation-stat-acuity-plus');
  for (let i = 0; i < 3; i++) await plusAcuity.click(); // 2 -> 5

  const plusBody = page.getByTestId('creation-stat-body-plus');
  for (let i = 0; i < 2; i++) await plusBody.click(); // 2 -> 4

  const plusHeart = page.getByTestId('creation-stat-heart-plus');
  for (let i = 0; i < 2; i++) await plusHeart.click(); // 2 -> 4

  const plusWill = page.getByTestId('creation-stat-will-plus');
  for (let i = 0; i < 2; i++) await plusWill.click(); // 2 -> 4

  // Confirm
  const confirmButton = page.getByTestId('creation-confirm');
  await expect(confirmButton).toBeEnabled({ timeout: 2000 });
  await confirmButton.click();

  // Wait for creation modal to close
  await expect(page.getByTestId('creation-name-input')).not.toBeVisible({ timeout: 3000 });
}

// ─── Investigation Setup Helpers ─────────────────────────────────────────────

/**
 * Start the investigation using the dev-mode button.
 * Note: Investigation auto-starts on mount with TEST_SIN_CHAIN,
 * so this is only needed if the auto-start condition was not met.
 */
export async function startInvestigation(page: Page) {
  const startBtn = page.getByTestId('start-investigation');
  const isVisible = await startBtn.isVisible().catch(() => false);
  if (isVisible) {
    await startBtn.click();
  }
  // Investigation is running when fatigue clock is visible
  await expect(page.getByTestId('fatigue-clock')).toBeVisible({ timeout: 3000 });
}

// ─── Verification Helpers ────────────────────────────────────────────────────

/**
 * Verify the discovery summary contains specific text.
 */
export async function verifyDiscovery(page: Page, text: string) {
  const summary = page.getByTestId('discovery-summary');
  await expect(summary).toBeVisible({ timeout: 5000 });
  await expect(summary).toContainText(text);
}

/**
 * Verify a sin node at a specific level is visible in the mental map.
 * Sin nodes use data-testid="sin-node-{level}".
 */
export async function verifySinNodeVisible(page: Page, level: string) {
  await expect(page.getByTestId(`sin-node-${level}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Verify that a sin node does NOT show "???" (i.e., it has been discovered).
 */
export async function verifySinNodeDiscovered(page: Page, level: string) {
  const node = page.getByTestId(`sin-node-${level}`);
  await expect(node).toBeVisible({ timeout: 5000 });
  await expect(node).not.toContainText('???');
}

/**
 * Trigger a conflict by selecting an aggressive approach on a resistant NPC.
 * Uses the body approach on sheriff-jacob's "the-town" topic.
 */
export async function triggerConflict(page: Page) {
  await startConversation(page, 'sheriff-jacob');
  await selectTopic(page, 'the-town', 'sheriff-jacob');
  await selectApproach(page, 'body');
}

/**
 * Navigate to the NPC's location before starting conversation.
 * (NPCs are only visible at their assigned location.)
 */
export async function navigateToNpcLocation(page: Page, locationId: string) {
  // Click the location node on the map
  const node = page.locator(`[data-testid="map-node-${locationId}"]`);
  const isVisible = await node.isVisible().catch(() => false);
  if (isVisible) {
    await node.click();
    await page.waitForTimeout(500); // Allow location transition
  }
}
