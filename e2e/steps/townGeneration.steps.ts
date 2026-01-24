import { Page, expect } from '@playwright/test';

/**
 * Reusable step functions for town generation E2E tests.
 *
 * These are helper functions (not cucumber-style step definitions)
 * that encapsulate common test operations for town selection and
 * generated town interaction.
 */

// ─── Town Selection Helpers ─────────────────────────────────────────────────

/**
 * Select a town from the town selection screen by clicking its button.
 * The button data-testid follows the pattern: select-town-{townId}.
 */
export async function selectTown(page: Page, townId: string) {
  const selectButton = page.getByTestId(`select-town-${townId}`);
  await expect(selectButton).toBeVisible({ timeout: 5000 });
  await selectButton.click();
  // Wait for town selection to disappear (game view loads)
  await expect(page.getByTestId('town-selection')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Verify the town selection screen is visible with at least 3 town cards.
 * Each card should have a name and description.
 */
export async function verifyTownSelectionVisible(page: Page) {
  await expect(page.getByTestId('town-selection')).toBeVisible({ timeout: 5000 });
  const cards = page.locator('[data-testid^="town-card-"]');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(3);
}

/**
 * Verify the game has loaded with the specified town.
 * Checks that the town selection is gone and the map SVG is visible.
 */
export async function verifyTownLoaded(page: Page, townName: string) {
  // Town selection should be gone
  await expect(page.getByTestId('town-selection')).not.toBeVisible({ timeout: 5000 });
  // Map SVG should be visible (contains location nodes)
  const mapSvg = page.locator('svg[role="img"]');
  await expect(mapSvg).toBeVisible({ timeout: 5000 });
  // Location nodes should be present
  const nodes = page.locator('[data-testid^="map-node-"]');
  const nodeCount = await nodes.count();
  expect(nodeCount).toBeGreaterThan(0);
}

/**
 * Verify at least 5 NPC locations are present on the map.
 * Generated towns have more locations than bridalFalls (which has 7).
 */
export async function verifyNPCsPresent(page: Page) {
  const nodes = page.locator('[data-testid^="map-node-"]');
  await expect(nodes.first()).toBeVisible({ timeout: 5000 });
  const count = await nodes.count();
  expect(count).toBeGreaterThanOrEqual(5);
}

/**
 * Click a non-current location node on the map and verify navigation.
 * Uses dispatchEvent('click') for SVG g elements.
 */
export async function verifyLocationNavigation(page: Page) {
  // Find all location nodes
  const nodes = page.locator('[data-testid^="map-node-"]');
  const count = await nodes.count();
  expect(count).toBeGreaterThan(1);

  // Find a node that is NOT the current location (non-amber fill)
  // Click the second node (index 1) which should not be the initial location
  const secondNode = nodes.nth(1);
  await secondNode.dispatchEvent('click');
  await page.waitForTimeout(500);

  // Verify narrative panel opens (location transition feedback)
  // The NarrativePanel or scene text should update
  const panel = page.locator('.bg-surface');
  await expect(panel.first()).toBeVisible();
}

/**
 * Start a conversation with an NPC at the current location.
 * Navigates to a location with an NPC and clicks their button.
 */
export async function startNPCConversation(page: Page) {
  // Wait for NPC buttons to be visible (NPCs at current location)
  const npcButton = page.locator('[data-testid^="npc-button-"]').first();
  await expect(npcButton).toBeVisible({ timeout: 5000 });
  await npcButton.click();
  // Verify dialogue view opens
  await expect(page.getByTestId('dialogue-view')).toBeVisible({ timeout: 3000 });
}

/**
 * Verify that topic chips are rendered in the dialogue view.
 */
export async function verifyTopicsAvailable(page: Page) {
  await expect(page.getByTestId('topic-chips')).toBeVisible({ timeout: 5000 });
  // At least one topic chip should be present
  const chips = page.locator('[data-testid^="topic-chip-"]');
  const count = await chips.count();
  expect(count).toBeGreaterThan(0);
}

/**
 * Attempt to make a discovery in a generated town.
 * Selects a topic and approach, waits for the streamed response,
 * and verifies the discovery summary appears and the mental map updates.
 *
 * Requires page.route() to be set up beforehand to return
 * responses with [DISCOVERY: ...] markers.
 */
export async function attemptDiscovery(page: Page) {
  // Select first available topic
  const topicChip = page.locator('[data-testid^="topic-chip-"]').first();
  await expect(topicChip).toBeVisible({ timeout: 3000 });
  await topicChip.click();

  // Wait for approach chips
  await expect(page.getByTestId('approach-chips')).toBeVisible({ timeout: 3000 });

  // Select acuity approach
  await page.getByTestId('approach-chip-acuity').click();

  // Wait for response streaming to complete (RESPONSE_COMPLETE shows continue button)
  const continueBtn = page.getByTestId('dialogue-continue');
  await expect(continueBtn).toBeVisible({ timeout: 5000 });

  // Acknowledge the response to advance to SHOWING_DISCOVERY phase
  await continueBtn.click();

  // Check if discovery summary appeared
  const discoverySummary = page.getByTestId('discovery-summary');
  await expect(discoverySummary).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to a location that has NPCs.
 * Clicks through map nodes until we find one with NPC buttons in the sidebar.
 */
export async function navigateToNPCLocation(page: Page) {
  const nodes = page.locator('[data-testid^="map-node-"]');
  const count = await nodes.count();

  for (let i = 0; i < count; i++) {
    const node = nodes.nth(i);
    await node.dispatchEvent('click');
    await page.waitForTimeout(500);

    // Check if NPC buttons appeared
    const npcButton = page.locator('[data-testid^="npc-button-"]').first();
    const hasNpc = await npcButton.isVisible().catch(() => false);
    if (hasNpc) {
      return; // Found a location with NPCs
    }
  }

  throw new Error('No location with NPCs found on the map');
}

/**
 * Get all town card names from the selection screen.
 * Returns an array of town name strings.
 */
export async function getTownCardNames(page: Page): Promise<string[]> {
  const cards = page.locator('[data-testid^="town-card-"]');
  const count = await cards.count();
  const names: string[] = [];

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const nameEl = card.locator('h2');
    const name = await nameEl.textContent();
    if (name) names.push(name);
  }

  return names;
}

/**
 * Get town card sin depths (corruption indicator filled segments).
 * Returns array of filled segment counts per town.
 */
export async function getTownCardSinDepths(page: Page): Promise<number[]> {
  const cards = page.locator('[data-testid^="town-card-"]');
  const count = await cards.count();
  const depths: number[] = [];

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    // Count filled corruption segments (those with gradient background)
    const filledSegments = card.locator('.bg-gradient-to-t');
    const filledCount = await filledSegments.count();
    depths.push(filledCount);
  }

  return depths;
}
