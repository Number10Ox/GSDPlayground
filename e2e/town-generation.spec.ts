import { test, expect } from './fixtures/base';
import {
  selectTown,
  verifyTownSelectionVisible,
  verifyTownLoaded,
  verifyNPCsPresent,
  verifyLocationNavigation,
  startNPCConversation,
  verifyTopicsAvailable,
  attemptDiscovery,
  navigateToNPCLocation,
  getTownCardNames,
  getTownCardSinDepths,
} from './steps/townGeneration.steps';
import { createCharacterForTest } from './steps/investigation.steps';
import { skipArrivalOverlay } from './steps/character.steps';

/**
 * Town Generation E2E Tests
 *
 * Tests verify the full town generation pipeline: generated towns load,
 * NPCs are interactable, locations are navigable, and the sin chain
 * is discoverable. Tests use route interception for dialogue API mocking.
 *
 * Town IDs:
 * - bridal-falls: hand-crafted (7 locations, 5 NPCs, 4-level sin chain)
 * - hollow-creek: generated (seed-based, 5-level chain)
 * - shepherds-ridge: generated (seed-based, 6-level chain)
 */

test.describe('Town Generation', () => {
  test('shows town selection screen on load', async ({ page }) => {
    await page.goto('/');

    // Town selection container should be visible
    await verifyTownSelectionVisible(page);

    // Verify each card has name and description text
    const cards = page.locator('[data-testid^="town-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      // Each card should have an h2 (name) and a p (description)
      const name = card.locator('h2');
      await expect(name).toBeVisible();
      const nameText = await name.textContent();
      expect(nameText?.length).toBeGreaterThan(0);

      const description = card.locator('p').first();
      await expect(description).toBeVisible();
      const descText = await description.textContent();
      expect(descText?.length).toBeGreaterThan(0);
    }
  });

  test('selects Bridal Falls and loads game', async ({ page }) => {
    await page.goto('/');

    // Select bridal falls
    await selectTown(page, 'bridal-falls');

    // Verify game loaded
    await verifyTownLoaded(page, 'Bridal Falls');

    // Verify map has location nodes from bridalFalls (7 locations)
    const nodes = page.locator('[data-testid^="map-node-"]');
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });
    const nodeCount = await nodes.count();
    expect(nodeCount).toBe(7);

    // Verify specific bridalFalls location is present
    await expect(page.getByTestId('map-node-church')).toBeVisible();
    await expect(page.getByTestId('map-node-general-store')).toBeVisible();
  });

  test('selects generated town and loads game', async ({ page }) => {
    await page.goto('/');

    // Select hollow creek (generated town)
    await selectTown(page, 'hollow-creek');

    // Verify game loaded with generated town
    await verifyTownLoaded(page, 'Hollow Creek');

    // Verify NPC locations present (generated towns have 5+ locations)
    await verifyNPCsPresent(page);

    // Verify navigation works between locations
    await verifyLocationNavigation(page);
  });

  test('generated town has interactable NPCs', async ({ page }) => {
    // Mock dialogue API to return a generic response for any NPC
    await page.route('**/api/dialogue', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: '[Player]: Tell me about this place.\n[NPC]: This town has its share of troubles, Brother. The faithful are restless.',
      });
    });

    await page.goto('/');

    // Select generated town
    await selectTown(page, 'hollow-creek');

    // Create character
    await createCharacterForTest(page, 'Brother Test');

    // Skip town arrival overlay
    await skipArrivalOverlay(page);

    // Navigate to a location with NPCs
    await navigateToNPCLocation(page);

    // Start conversation with first NPC at this location
    await startNPCConversation(page);

    // Verify topics are available
    await verifyTopicsAvailable(page);

    // Select a topic — dialogue should begin streaming response
    const topicChip = page.locator('[data-testid^="topic-chip-"]').first();
    await topicChip.click();
    await expect(page.getByTestId('dialogue-continue')).toBeVisible({ timeout: 5000 });
  });

  test('generated town sin chain is discoverable', async ({ page }) => {
    // Mock dialogue API to return a discovery response
    await page.route('**/api/dialogue', async (route) => {
      const request = route.request();
      let body: { npcId?: string; topic?: string } = {};

      try {
        const postData = request.postData();
        if (postData) {
          body = JSON.parse(postData);
        }
      } catch {
        // Fallback if body cannot be parsed
      }

      // Return a discovery response for the first exchange
      const npcId = body.npcId ?? 'unknown-npc';
      await route.fulfill({
        status: 200,
        contentType: 'text/plain; charset=utf-8',
        body: `[Player]: What troubles this place?\n[NPC]: There is darkness here, Brother. Pride has taken root in the hearts of the faithful.\n[DISCOVERY: fact-${npcId}-pride|sin-pride-generated|The pride of the town's leaders has corrupted the community]`,
      });
    });

    await page.goto('/');

    // Select generated town
    await selectTown(page, 'hollow-creek');

    // Create character
    await createCharacterForTest(page, 'Brother Seeker');

    // Skip town arrival overlay
    await skipArrivalOverlay(page);

    // Navigate to NPC location
    await navigateToNPCLocation(page);

    // Start conversation and attempt discovery
    await startNPCConversation(page);
    await attemptDiscovery(page);

    // Close discovery summary
    const continueBtn = page.getByTestId('discovery-continue');
    await expect(continueBtn).toBeVisible({ timeout: 5000 });
    await continueBtn.click();

    // End conversation
    await page.getByTestId('dialogue-leave').click();
    await expect(page.getByTestId('dialogue-view')).not.toBeVisible({ timeout: 3000 });

    // Open mental map and verify a node is visible
    await page.getByTestId('open-mental-map').click();
    await expect(page.getByTestId('mental-map')).toBeVisible({ timeout: 3000 });

    // At least one sin node should now be visible (discovered)
    const sinNodes = page.locator('[data-testid^="sin-node-"]');
    const sinNodeCount = await sinNodes.count();
    expect(sinNodeCount).toBeGreaterThan(0);
  });

  test('generated towns have different content', async ({ page }) => {
    await page.goto('/');

    // Get all town names
    const names = await getTownCardNames(page);
    expect(names.length).toBeGreaterThanOrEqual(3);

    // All names should be unique
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);

    // Get sin depths for each town
    const depths = await getTownCardSinDepths(page);
    expect(depths.length).toBeGreaterThanOrEqual(3);

    // Not all depths should be the same (generated towns have different chain lengths)
    const uniqueDepths = new Set(depths);
    expect(uniqueDepths.size).toBeGreaterThan(1);
  });
});
